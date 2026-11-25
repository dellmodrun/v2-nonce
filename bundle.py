"""Bundle index.html into a single self-contained file by inlining all
external assets (fonts, images, favicon) as base64 data: URIs."""
import base64
import os
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "index.html"
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)
OUT = DIST / "index.html"

html = SRC.read_text(encoding="utf-8")

def b64(path: pathlib.Path) -> str:
    return base64.b64encode(path.read_bytes()).decode("ascii")

assets = {
    "./fonts/eb-garamond-regular.woff2":   ("font/woff2",     ROOT / "fonts/eb-garamond-regular.woff2"),
    "./fonts/eb-garamond-italic.woff2":    ("font/woff2",     ROOT / "fonts/eb-garamond-italic.woff2"),
    "./fonts/jetbrains-mono-regular.woff2":("font/woff2",     ROOT / "fonts/jetbrains-mono-regular.woff2"),
    "./v2nonce.png":                       ("image/png",      ROOT / "v2nonce.png"),
}

replacements = 0
for url, (mime, path) in assets.items():
    if not path.exists():
        print(f"WARN missing asset: {path}")
        continue
    data_uri = f"data:{mime};base64,{b64(path)}"
    before = html.count(url)
    html = html.replace(url, data_uri)
    after = html.count(url)
    print(f"  {url:40s} -> inlined ({before - after} replacements, {path.stat().st_size:>7} bytes raw)")
    replacements += before - after

chart_tag = '<script src="./scripts/runway-chart.js"></script>'
if chart_tag not in html:
    raise RuntimeError('runway chart script reference not found')
chart_source = (ROOT / 'scripts/runway-chart.js').read_text(encoding='utf-8')
html = html.replace(chart_tag, '<script>\n' + chart_source + '\n</script>')

OUT.write_text(html, encoding="utf-8")
print()
print(f"total: {replacements} URLs inlined")
print(f"bundled file: {OUT}")
print(f"final size:   {OUT.stat().st_size:,} bytes ({OUT.stat().st_size / 1024:.1f} KB)")
