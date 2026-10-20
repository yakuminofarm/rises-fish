import re, sys, urllib.request, json
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
def get(u):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA, "Accept-Language": "ja"}), timeout=30)
        return r.status, r.read().decode("utf-8", "replace")
    except Exception as e:
        return str(e), ""
for u in sys.argv[1:]:
    st, h = get(u)
    print("=====", u, st, len(h))
    for pat in [r"apparels/\d+[^\"' ]*", r"trading-cards/\d+[^\"' ]*", r"https?://[^\"' ]*cardrush[^\"' ]*", r"pokeca-chart\.com/[^\"' ]*", r"altema\.jp/pokemoncard/card/\d+"]:
        print(pat, sorted(set(re.findall(pat, h)))[:15])
    for kw in ["ルギア", "labels", "datasets", "chart", "price", "Chart", "series", "data-"]:
        for m in list(re.finditer(kw, h))[:4]:
            print(f"--[{kw}]", h[max(0,m.start()-150):m.start()+250].replace("\n"," "))
