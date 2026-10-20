"""登録カードの相場を取得して pokeca/data/<id>.json に追記し、チャートを再生成する。

- スニダン: 取引価格の日次平均 (全状態 / 状態A / PSA10)。API が発売日以降の全履歴を
  返すため、毎回全期間を取り直して上書きする (=登録時に過去分も自動で遡って記録される)。
- スニダン最安出品価格・カードラッシュ販売価格: 履歴が取れないため実行日の値を追記する。
"""

import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

from render import render_all

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
JST = timezone(timedelta(hours=9))
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"
)

# スニダンの状態フィルタ名 -> 保存するシリーズ名
SNKRDUNK_CONDITIONS = {"A": "snkrdunk_a", "PSA10": "snkrdunk_psa10"}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ja"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                return res.read().decode("utf-8", "replace")
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 ** (attempt + 1))
    raise AssertionError("unreachable")


def jst_date(ms: int) -> str:
    return datetime.fromtimestamp(ms / 1000, JST).strftime("%Y-%m-%d")


def snkrdunk_chart(apparel_id: int, option_id: int) -> dict:
    url = (
        f"https://snkrdunk.com/v1/apparels/{apparel_id}/sales-chart/used"
        f"?range=all&salesChartOptionId={option_id}"
    )
    return json.loads(fetch(url))


def collect_snkrdunk(conf: dict, today: str) -> dict:
    apparel_id = conf["apparel_id"]
    series = {}

    chart = snkrdunk_chart(apparel_id, 0)
    series["snkrdunk_all"] = {jst_date(ms): round(p) for ms, p in chart["points"]}

    options = {o["localizedName"]: o["id"] for o in chart.get("salesChartOption", [])}
    for cond, key in SNKRDUNK_CONDITIONS.items():
        if cond not in options:
            continue
        points = snkrdunk_chart(apparel_id, options[cond])["points"]
        series[key] = {jst_date(ms): round(p) for ms, p in points}

    info = json.loads(fetch(f"https://snkrdunk.com/v1/apparels/{apparel_id}"))
    if info.get("usedMinPrice"):
        series["snkrdunk_min_listing"] = {today: info["usedMinPrice"]}
    return series


def page_lines(page: str) -> list[str]:
    page = re.sub(r"(?s)<(script|style)[^>]*>.*?</\1>", "", page)
    page = re.sub(r"</(tr|p|div|h\d|li|span)>", "\n", page)
    text = html.unescape(re.sub(r"<[^>]+>", " ", page))
    return [ln.strip() for ln in text.splitlines() if ln.strip()]


def collect_cardrush(conf: dict, today: str) -> dict:
    """検索結果から状態表記なし(=美品)の該当カードの販売価格を拾う。"""
    url = "https://www.cardrush-pokemon.jp/product-list?" + urllib.parse.urlencode(
        {"keyword": conf["keyword"], "num": 100}
    )
    lines = page_lines(fetch(url))
    for i, line in enumerate(lines):
        if conf["match"] not in line or line.startswith("〔"):
            continue
        for nxt in lines[i + 1 : i + 5]:
            m = re.match(r"([\d,]+)円", nxt)
            if m:
                return {"cardrush": {today: int(m.group(1).replace(",", ""))}}
    print(f"  cardrush: '{conf['match']}' が検索結果に見つかりません", file=sys.stderr)
    return {}


COLLECTORS = {"snkrdunk": collect_snkrdunk, "cardrush": collect_cardrush}


def update_card(card: dict, today: str) -> bool:
    path = DATA_DIR / f"{card['id']}.json"
    data = json.loads(path.read_text()) if path.exists() else {"series": {}}
    ok = True
    for source, conf in card["sources"].items():
        try:
            fresh = COLLECTORS[source](conf, today)
        except Exception as e:  # 1 ソースの失敗で他を止めない
            print(f"  {source}: 取得失敗 {e!r}", file=sys.stderr)
            ok = False
            continue
        for key, points in fresh.items():
            data["series"].setdefault(key, {}).update(points)
            print(f"  {key}: {len(points)} 点")
    data["series"] = {
        k: dict(sorted(v.items())) for k, v in sorted(data["series"].items())
    }
    data["id"] = card["id"]
    data["updated_at"] = datetime.now(JST).isoformat(timespec="seconds")
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    return ok


def main() -> int:
    cards = json.loads((ROOT / "cards.json").read_text())
    today = datetime.now(JST).strftime("%Y-%m-%d")
    DATA_DIR.mkdir(exist_ok=True)
    failures = 0
    for card in cards:
        print(f"{card['id']} {card['name']}")
        if not update_card(card, today):
            failures += 1
    render_all(ROOT, cards)
    # 全カードが全滅したときだけ失敗扱いにしてワークフローで気づけるようにする
    return 1 if failures == len(cards) else 0


if __name__ == "__main__":
    sys.exit(main())
