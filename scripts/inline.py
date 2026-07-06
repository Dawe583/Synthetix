#!/usr/bin/env python3
"""Inliner: vloží lokální CSS a JS přímo do index.html.

Díky tomu web funguje na jakémkoli hostingu bez ohledu na to, jak (a zda
vůbec) se servírují vedlejší soubory — styly, Lenis i animační engine jsou
součástí samotného HTML. Fonty/videa/obrázky zůstávají externí a mají
elegantní fallbacky.

Idempotentní: opakované spuštění obnoví inline bloky z aktuálních zdrojů.
Spusť po každé úpravě css/styles.css nebo js/main.js:

    python3 scripts/inline.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")

ASSETS = [
    # (typ, cesta, regex tagu s externím odkazem)
    ("css", "js/vendor/lenis.css",     r'<link[^>]*href="js/vendor/lenis\.css[^"]*"[^>]*>'),
    ("css", "css/styles.css",          r'<link[^>]*href="css/styles\.css[^"]*"[^>]*>'),
    ("js",  "js/vendor/lenis.min.js",  r'<script[^>]*src="js/vendor/lenis\.min\.js[^"]*"[^>]*>\s*</script>'),
    ("js",  "js/main.js",              r'<script[^>]*src="js/main\.js[^"]*"[^>]*>\s*</script>'),
]

def load(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        content = f.read()
    if path.endswith(".css"):
        # url() cesty v css/ jsou relativní k css souboru → přepsat na root
        content = content.replace("../assets/", "assets/")
    return content

def block(kind, path, content):
    tag = "style" if kind == "css" else "script"
    return f'<{tag} data-inline="{path}">\n{content}\n</{tag}>'

def main():
    with open(INDEX, encoding="utf-8") as f:
        html = f.read()

    for kind, path, link_re in ASSETS:
        content = load(path)
        new_block = block(kind, path, content)
        # 1) existující inline blok → obnovit
        inline_re = re.compile(
            r'<(style|script) data-inline="' + re.escape(path) + r'">.*?</\1>',
            re.DOTALL)
        if inline_re.search(html):
            html = inline_re.sub(lambda m: new_block, html, count=1)
            print(f"obnoveno  {path}")
            continue
        # 2) externí tag → nahradit inline blokem
        ext_re = re.compile(link_re)
        if ext_re.search(html):
            html = ext_re.sub(lambda m: new_block, html, count=1)
            print(f"inlinováno {path}")
        else:
            print(f"!! nenalezeno: {path}")

    with open(INDEX, "w", encoding="utf-8") as f:
        f.write(html)
    size = os.path.getsize(INDEX) // 1024
    print(f"index.html: {size} KB")

if __name__ == "__main__":
    main()
