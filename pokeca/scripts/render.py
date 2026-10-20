"""data/*.json から SVG チャート (charts/<id>.svg) と README.md を生成する。外部ライブラリ不要。"""

import json
from datetime import date
from html import escape
from pathlib import Path

# 表示順 = 色の割り当て順 (固定)。PSA10 は桁が違うので図には入れず表のみ。
SERIES = [
    ("snkrdunk_all", "スニダン 取引平均 (全状態)", "#2a78d6", "#3987e5"),
    ("snkrdunk_a", "スニダン 取引平均 (状態A)", "#eb6834", "#d95926"),
    ("cardrush", "カードラッシュ 販売価格", "#1baf7a", "#199e70"),
    ("snkrdunk_min_listing", "スニダン 最安出品", "#eda100", "#c98500"),
]
TABLE_SERIES = SERIES + [("snkrdunk_psa10", "スニダン 取引平均 (PSA10)", "", "")]

W, H = 760, 380
PAD_L, PAD_R, PAD_T, PAD_B = 64, 20, 72, 40


def nice_step(span: float) -> int:
    raw = span / 5
    for s in (100, 200, 500, 1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000, 100000):
        if s >= raw:
            return s
    return 200000


def yen(v: int) -> str:
    return f"¥{v:,}"


def render_svg(card: dict, data: dict) -> str:
    series = [
        (key, label, light, dark, data["series"].get(key, {}))
        for key, label, light, dark in SERIES
        if data["series"].get(key)
    ]
    days = sorted({d for *_, pts in series for d in pts})
    if not days:
        return ""
    d0 = date.fromisoformat(days[0])
    span_days = max((date.fromisoformat(days[-1]) - d0).days, 1)
    values = [v for *_, pts in series for v in pts.values()]
    step = nice_step(max(values) - min(values) or max(values))
    lo = (min(values) // step) * step
    hi = -(-max(values) // step) * step
    if hi == lo:
        hi = lo + step

    def x(d: str) -> float:
        return PAD_L + (date.fromisoformat(d) - d0).days / span_days * (W - PAD_L - PAD_R)

    def y(v: float) -> float:
        return PAD_T + (hi - v) / (hi - lo) * (H - PAD_T - PAD_B)

    css_light = "".join(f".s{i}{{stroke:{c}}}.f{i}{{fill:{c}}}" for i, (_, _, c, _, _) in enumerate(series))
    css_dark = "".join(f".s{i}{{stroke:{c}}}.f{i}{{fill:{c}}}" for i, (_, _, _, c, _) in enumerate(series))
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
        'font-family="-apple-system,BlinkMacSystemFont,\'Hiragino Sans\',\'Noto Sans JP\',sans-serif">',
        "<style>"
        ".bg{fill:#fcfcfb}.t1{fill:#0b0b0b}.t2{fill:#52514e}.grid{stroke:#e4e3df}"
        f"{css_light}.dot{{stroke:#fcfcfb}}"
        "@media (prefers-color-scheme:dark){.bg{fill:#1a1a19}.t1{fill:#f0efec}.t2{fill:#c3c2b7}"
        f".grid{{stroke:#3a3a37}}{css_dark}.dot{{stroke:#1a1a19}}}}"
        "</style>",
        f'<rect class="bg" width="{W}" height="{H}" rx="8"/>',
        f'<text class="t1" x="{PAD_L}" y="26" font-size="16" font-weight="700">'
        f'{escape(card["name"])} <tspan class="t2" font-size="12" font-weight="400">'
        f'{escape(card["number"])}</tspan></text>',
    ]
    # 凡例 (2 系統以上のとき)
    lx = PAD_L
    for i, (_, label, *_rest) in enumerate(series):
        out.append(f'<rect class="f{i}" x="{lx}" y="40" width="12" height="3" rx="1.5"/>')
        out.append(f'<text class="t2" x="{lx + 16}" y="45" font-size="11">{escape(label)}</text>')
        lx += 28 + sum(11 if ord(ch) > 255 else 6.5 for ch in label)
    # 目盛り
    v = lo
    while v <= hi:
        out.append(f'<line class="grid" x1="{PAD_L}" x2="{W - PAD_R}" y1="{y(v):.1f}" y2="{y(v):.1f}"/>')
        out.append(f'<text class="t2" x="{PAD_L - 6}" y="{y(v) + 4:.1f}" font-size="11" text-anchor="end">{yen(v)}</text>')
        v += step
    tick_every = max(1, span_days // 6)
    for n in range(0, span_days + 1, tick_every):
        d = date.fromordinal(d0.toordinal() + n).isoformat()
        out.append(
            f'<text class="t2" x="{x(d):.1f}" y="{H - PAD_B + 18}" font-size="11" '
            f'text-anchor="middle">{d[5:].replace("-", "/")}</text>'
        )
    # 系列
    for i, (_, label, _, _, pts) in enumerate(series):
        items = sorted(pts.items())
        if len(items) > 1:
            path = " ".join(f"{'M' if j == 0 else 'L'}{x(d):.1f},{y(p):.1f}" for j, (d, p) in enumerate(items))
            out.append(f'<path class="s{i}" fill="none" d="{path}" stroke-width="2" stroke-linejoin="round"/>')
        last_d, last_p = items[-1]
        out.append(
            f'<circle class="f{i} dot" cx="{x(last_d):.1f}" cy="{y(last_p):.1f}" r="5" '
            f'stroke-width="2"><title>{escape(label)} {last_d} {yen(last_p)}</title></circle>'
        )
    out.append("</svg>")
    return "\n".join(out) + "\n"


def latest(pts: dict) -> tuple[str, int] | None:
    return max(pts.items()) if pts else None


def change(pts: dict, days: int) -> str:
    """最新値と days 日前 (前後 3 日以内に記録がある場合のみ) との差分 (%)。"""
    if not pts:
        return "-"
    last_d, last_p = max(pts.items())
    base = date.fromisoformat(last_d).toordinal() - days
    cutoff, floor = (date.fromordinal(base - n).isoformat() for n in (0, 3))
    past = [p for d, p in sorted(pts.items()) if floor <= d <= cutoff]
    if not past:
        return "-"
    pct = (last_p - past[-1]) / past[-1] * 100
    return f"{pct:+.1f}%"


def render_all(root: Path, cards: list[dict]) -> None:
    charts = root / "charts"
    charts.mkdir(exist_ok=True)
    md = [
        "# ポケカ相場トラッカー",
        "",
        "登録したカードの相場を GitHub Actions で毎日 (09:17 JST) 記録し、チャートを更新します。",
        "",
        "- カードの登録: `cards.json` に追記 (Claude に「〇〇を登録して」と頼めば追記します)",
        "- 登録時はスニダンの取引履歴から **発売日以降の全期間** を自動で遡って記録します",
        "- カードラッシュ販売価格・スニダン最安出品は履歴が取れないため、登録日以降の記録です",
        "- 生データ: `data/<id>.json`",
        "",
    ]
    for card in cards:
        path = root / "data" / f"{card['id']}.json"
        if not path.exists():
            continue
        data = json.loads(path.read_text())
        svg = render_svg(card, data)
        if svg:
            (charts / f"{card['id']}.svg").write_text(svg)
        md += [
            f"## {card['name']} ({card['number']})",
            "",
            f"{card.get('set', '')} / 発売日 {card.get('release_date', '-')} / 最終更新 {data.get('updated_at', '-')}",
            "",
            f"![{card['name']} 相場チャート](charts/{card['id']}.svg)",
            "",
            "| 指標 | 最新 | 日付 | 7日前比 | 30日前比 |",
            "|---|---:|---|---:|---:|",
        ]
        for key, label, *_ in TABLE_SERIES:
            pts = data["series"].get(key, {})
            lv = latest(pts)
            if lv:
                md.append(f"| {label} | {yen(lv[1])} | {lv[0]} | {change(pts, 7)} | {change(pts, 30)} |")
        md.append("")
    (root / "README.md").write_text("\n".join(md))
