#!/usr/bin/env python3
"""Vloží reálné framerusercontent URL na správná místa v index.html.

Firewall sandboxu neumožňuje obrázky stáhnout lokálně, ale prohlížeč
návštěvníka (i produkce na Vercelu) si je z framer CDN načte normálně.
Každý obrázek proto dostane reálné CDN URL jako primární zdroj a lokální
SVG jako fallback (onerror) — když by CDN vypadl, web se nerozbije.

Idempotentní: pracuje jen s lokálními cestami, které ještě nebyly
přepsané. Spusť po případném přegenerování assetů.
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")
CDN = "https://framerusercontent.com/images/"
V = "&v=7"

# lokální asset -> (framer soubor, w, h)
IMG = {
    "assets/img/work-1.svg":   ("2dZbBroZgHPrxnEdwaS5vvbe8w.jpg", 1395, 1350),
    "assets/img/work-2.svg":   ("pGKzMvVMxZif17kRFV5Tn7pC338.jpg", 1395, 1350),
    "assets/img/work-3.svg":   ("i7JDvEU4cYXg2aOX5cF0L3UIV8.jpg", 1395, 1350),
    "assets/img/step-1.svg":   ("uzBphIDqI0PbwOqso2AzaFeAw88.jpg", 1190, 1140),
    "assets/img/step-2.svg":   ("Ur5L7stgzjVpLuLg9LTa7PP3W7g.jpg", 1190, 1140),
    "assets/img/step-3.svg":   ("weOlvtCQtvQqEObp7dFtnwJImcY.jpg", 1190, 1140),
    "assets/img/service-1.svg":("X36dhbTQNDnjWyIoB4rtfafweBY.png", 904, 1200),
    "assets/img/service-2.svg":("ho4zNmz230ij3u9hxzoHO7liY4.jpg", 674, 700),
    "assets/img/service-3.svg":("EYF6Jxp6Y1QotYZxi1QEdOGUEEQ.jpg", 674, 710),
    "assets/img/service-4.svg":("ohJlb6K8ZI0yqKz0QfmCPadx5Gs.jpg", 674, 710),
    "assets/img/bg-wide.svg":  ("KmimP8fJf3KTg25QrfWgNhSOI.jpeg", 2752, 1536),
    "assets/img/tst-1.svg":    ("6eLAqvd3m8T28VPZlPmkDCCLo9g.png", 900, 1200),
    "assets/img/tst-2.svg":    ("dqnCbtTjxB2BMDWIbbltr5HnY.jpg", 628, 800),
    "assets/img/tst-3.svg":    ("hCPz34TfxvmmITwDQWUfPbmto8.jpg", 628, 800),
    "assets/img/blog-1.svg":   ("Vc7NO5U278jLe6P4yA7xGGgvE4.png", 900, 1200),
    "assets/img/blog-2.svg":   ("pIt4GsbYWu5BqT0GQoGjB72ym0.png", 904, 1200),
    "assets/img/blog-3.svg":   ("Qps65ImKDxccv7oQk1ZS9XDZY.png", 904, 1200),
    "assets/tools/tool-1.svg": ("VFOWwk1omnNdtAV95ucHECcG0.png", 352, 352),
    "assets/tools/tool-2.svg": ("Xg09Q3ssdnXZSyZVtynHmYY4Rhk.png", 352, 352),
    "assets/tools/tool-3.svg": ("q7Eiknql3X401kZ8kwl71NRObE.png", 352, 352),
    "assets/tools/tool-4.svg": ("RhybG1B3qiYHsokZoMGjungHM8.png", 352, 352),
    "assets/tools/tool-5.svg": ("c6DFpetIcvDCVe9uNQg1oiG4L4Y.png", 352, 352),
    "assets/tools/tool-6.svg": ("CIHjetcStHQqQKRmeOEyueVuFo.png", 352, 352),
    "assets/tools/tool-7.svg": ("xt3TolGUNwC9t6eJX6zBFIj0.png", 352, 352),
    "assets/tools/tool-8.svg": ("v03XHsUTDqdviYG2kgUK9BlKw.png", 352, 352),
    "assets/tools/tool-9.svg": ("cPaNi6g5hmh2AGBz8qb2tJdI4A4.png", 352, 352),
    "assets/tools/tool-10.svg":("DCFXp149emUamIIe8OioTFslt0.png", 352, 352),
    "assets/tools/tool-11.svg":("FhwHvnF52zLuzWE30ot3XcUIuL0.png", 352, 352),
    "assets/logos/batavia.svg":  ("qnG1f8Uqexmf9rfolflT0b3fTs.png", 657, 144),
    "assets/logos/mandala.svg":  ("Mld8FcmFfxKKmF9yh6rbn1Bk620.png", 639, 144),
    "assets/logos/pandawa.svg":  ("nxa6pfbQtEYxdVeUqpkPW8Dsa4.png", 581, 144),
    "assets/logos/shinta.svg":   ("1u8H6mP6vhZLd0xVrSiW9moQ.png", 540, 140),
    "assets/logos/sadewa.svg":   ("qm9i22nLv4VG7J0tmUDBv0l5jMI.png", 617, 144),
    "assets/logos/nakula.svg":   ("PBDnGSqWR1joHAbTPGiRzmPm8Dc.png", 414, 144),
    "assets/logos/bima.svg":     ("yGq9RhzlF3714t1PTOrdY8BGk7I.png", 441, 144),
    "assets/logos/rama.svg":     ("cPEkYEN8j0SgDsewIqTWVBVDuqA.png", 275, 171),
    "assets/logos/blockhaus.svg":("iCEg6GaMkQTFNk2qzxaPxmYCuk.png", 599, 144),
    "assets/logos/arvato.svg":   ("r2YvmLhS92NVgMeXKrRsaKHOxQ.png", 738, 144),
}

# reálná videa šablony
HERO_VID = "https://framerusercontent.com/assets/ruNWMG1hPz7eOeYESQefyP03dc.mp4"
AVATAR_VID = "https://framerusercontent.com/assets/6ikL2n7hPhepE6346JbqnpLhis.mp4"

def main():
    s = open(INDEX, encoding="utf-8").read()

    # 1) work karty: odstranit můj node-network video overlay (šablona zde má foto)
    s = re.sub(
        r'\s*<video data-video[^>]*>\s*<source src="assets/video/work-[123][^"]*"[^>]*>\s*'
        r'<source src="assets/video/work-[123][^"]*"[^>]*>\s*</video>',
        '', s)

    # 2) obrázky: reálné CDN URL + lokální fallback
    n = 0
    for local, (fname, w, h) in IMG.items():
        real = f'{CDN}{fname}?width={w}&height={h}{V}'
        # jen src, kterému ještě nebyl přidán onerror (idempotence)
        pat = re.compile(r'src="' + re.escape(local) + r'"(?!\s+onerror)')
        real_esc = real.replace('&', '&amp;')
        repl = f'src="{real_esc}" loading="lazy" onerror="this.onerror=null;this.src=\'{local}\'"'
        s, c = pat.subn(repl, s)
        n += c

    # 3) hero + avatar video: reálný framer zdroj jako první
    if HERO_VID not in s:
        s = s.replace(
            '<source src="assets/video/hero-bg.mp4?v=6" type="video/mp4">',
            f'<source src="{HERO_VID}" type="video/mp4">\n          '
            '<source src="assets/video/hero-bg.mp4?v=6" type="video/mp4">')
    if AVATAR_VID not in s:
        s = s.replace(
            '<source src="assets/video/avatar.mp4?v=6" type="video/mp4">',
            f'<source src="{AVATAR_VID}" type="video/mp4">\n                '
            '<source src="assets/video/avatar.mp4?v=6" type="video/mp4">',
            1)  # jen první výskyt (hero karta); FAQ karta má vlastní blok níže

    # avatar má dva výskyty (hero + FAQ) — druhý dořešit zvlášť
    s = s.replace(
        '<source src="assets/video/avatar.mp4?v=6" type="video/mp4">',
        f'<source src="{AVATAR_VID}" type="video/mp4">\n                '
        '<source src="assets/video/avatar.mp4?v=6" type="video/mp4">')
    # odstranit případnou duplicitu (kdyby první replace zasáhl obojí)
    s = s.replace(
        f'<source src="{AVATAR_VID}" type="video/mp4">\n                '
        f'<source src="{AVATAR_VID}" type="video/mp4">',
        f'<source src="{AVATAR_VID}" type="video/mp4">')

    open(INDEX, "w", encoding="utf-8").write(s)
    print(f"vloženo {n} reálných obrázků + hero/avatar video")

if __name__ == "__main__":
    main()
