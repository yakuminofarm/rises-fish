import re, sys, urllib.request, html as H
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
def get(u):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA, "Accept-Language": "ja", "Accept": "application/json, text/html"}), timeout=30)
        return r.status, r.read().decode("utf-8", "replace")
    except Exception as e:
        return str(e), ""
def text(h):
    h = re.sub(r"(?s)<(script|style)[^>]*>.*?</\1>", "", h)
    h = re.sub(r"</(tr|p|div|h\d|li)>", "\n", h)
    h = re.sub(r"<[^>]+>", " ", h)
    return re.sub(r"[ \t]+", " ", H.unescape(h))
st, h = get("https://snkrdunk.com/articles/33331/")
i = h.find('id="market"')
print("ARTICLE", st); print(re.sub(r"\n\s*\n+", "\n", text(h[i:i+60000]))[:12000])
for m in re.finditer(r'<a[^>]+apparels/(\d+)[^>]*>(.{0,400})', h):
    print("APPAREL", m.group(1), text(m.group(2))[:150].replace("\n"," "))
st, h = get("https://www.cardrush-pokemon.jp/product-list?keyword=%E3%83%AB%E3%82%AE%E3%82%A2+30th")
i = h.find('id="maincol2"')
print("CARDRUSH", st); print(re.sub(r"\n\s*\n+", "\n", text(h[i:]))[:5000])
print(re.findall(r'href="(https://www.cardrush-pokemon.jp/product/\d+)"', h)[:20])
for u in ["https://snkrdunk.com/apparels/886017", "https://snkrdunk.com/v1/apparels/886017", "https://snkrdunk.com/v1/apparels/886017/sales-history?size_id=0&page=1&per_page=20", "https://snkrdunk.com/v1/apparels/886017/sales-chart/used?range=all&salesChartOptionId=0", "https://snkrdunk.com/v1/apparels/881421", "https://pokeca-chart.com/all-card/?search=%E3%83%AB%E3%82%AE%E3%82%A2"]:
    st, h = get(u); print("=====", u, st, len(h)); print(h[:1500] if "v1" in u else re.sub(r"\n\s*\n+", "\n", text(h))[:2500])
    for m in re.findall(r'/v1/[a-zA-Z0-9_/\-{}?=&.]+', h)[:40]: print("  API", m)
