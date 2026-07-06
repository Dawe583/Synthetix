#!/usr/bin/env python3
"""Generátor lokálních SVG assetů pro web Synthetix.
Vytváří abstraktní tmavé obrázky, wordmark loga klientů a ikony integrací —
vše soběstačné, bez závislosti na externím CDN."""
import os, math

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")
LOGO = os.path.join(ROOT, "assets", "logos")
TOOL = os.path.join(ROOT, "assets", "tools")
for d in (IMG, LOGO, TOOL):
    os.makedirs(d, exist_ok=True)

# ---------------------------------------------------------------- abstraktní obrázky
# tmavá paleta s jemnými barevnými nádechy
TINTS = [
    ("#1b2a4a", "#0a0e1a"),  # modrá
    ("#2a1b40", "#100a1a"),  # fialová
    ("#123334", "#08151a"),  # teal
    ("#2e2320", "#140d0a"),  # sepia
    ("#1a2440", "#090c16"),  # indigo
    ("#241a2e", "#0d0916"),  # slivka
    ("#0f2e28", "#07161a"),  # smaragd
    ("#2b2333", "#100d18"),  # šeřík
    ("#22283a", "#0a0d16"),  # ocel
]

def abstract(name, w, h, i, seed=1):
    g1, g0 = TINTS[i % len(TINTS)]
    bx, by = (25 + (i * 17) % 55), (20 + (i * 29) % 60)
    cx, cy = (70 - (i * 13) % 50), (75 - (i * 23) % 55)
    lines = []
    for k in range(7):
        y = (k + 1) * h / 8
        off = math.sin(k * 1.2 + i) * (w * 0.06)
        lines.append(
            f'<path d="M{-20} {y+off:.0f} C {w*0.3:.0f} {y-40+off:.0f}, {w*0.7:.0f} {y+40+off:.0f}, {w+20} {y+off:.0f}" '
            f'stroke="rgba(255,255,255,0.04)" fill="none" stroke-width="1"/>'
        )
    dots = []
    for k in range(26):
        dx = (k * 137 + i * 53) % w
        dy = (k * 219 + i * 91) % h
        r = 0.6 + (k % 3) * 0.5
        dots.append(f'<circle cx="{dx}" cy="{dy}" r="{r}" fill="rgba(255,255,255,0.06)"/>')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="a{i}" cx="{bx}%" cy="{by}%" r="80%">
      <stop offset="0%" stop-color="{g1}"/>
      <stop offset="55%" stop-color="{g0}"/>
      <stop offset="100%" stop-color="#050508"/>
    </radialGradient>
    <radialGradient id="b{i}" cx="{cx}%" cy="{cy}%" r="55%">
      <stop offset="0%" stop-color="{g1}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="{g1}" stop-opacity="0"/>
    </radialGradient>
    <filter id="n{i}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
      <feComposite operator="over" in2="SourceGraphic"/></filter>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#a{i})"/>
  <rect width="{w}" height="{h}" fill="url(#b{i})"/>
  {''.join(lines)}
  {''.join(dots)}
  <rect width="{w}" height="{h}" filter="url(#n{i})" opacity="0.5"/>
  <rect width="{w}" height="{h}" fill="none"/>
</svg>'''
    with open(os.path.join(IMG, name), "w") as f:
        f.write(svg)

# portrét pro case studies / služby / testimonialy / blog
portraits = [
    "work-1.svg", "work-2.svg", "work-3.svg",
    "step-1.svg", "step-2.svg", "step-3.svg",
    "service-1.svg", "service-2.svg", "service-3.svg", "service-4.svg",
    "tst-1.svg", "tst-2.svg", "tst-3.svg",
    "blog-1.svg", "blog-2.svg", "blog-3.svg",
]
for idx, nm in enumerate(portraits):
    abstract(nm, 900, 1100, idx)

# širokoúhlé pozadí (proč my / CTA)
abstract("bg-wide.svg", 1600, 900, 4)

# ---------------------------------------------------------------- wordmark loga klientů
CLIENTS = ["Batavia", "Mandala", "Pandawa", "Shinta", "Sadewa",
           "Nakula", "Bima", "Rama", "Blockhaus", "Arvato"]

def wordmark(name, text):
    # jednoduchá geometrická značka + text
    w, h = 260, 64
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <g fill="none" stroke="#cfcfcf" stroke-width="2">
    <circle cx="24" cy="32" r="12"/>
    <path d="M16 32 L32 32 M24 24 L24 40"/>
  </g>
  <text x="48" y="40" font-family="Geist, Arial, sans-serif" font-size="24" font-weight="600"
        letter-spacing="-0.5" fill="#dcdcdc">{text}</text>
</svg>'''
    with open(os.path.join(LOGO, name), "w") as f:
        f.write(svg)

for c in CLIENTS:
    wordmark(f"{c.lower()}.svg", c)

# ---------------------------------------------------------------- ikony integrací (nástroje)
# jednoduché monochromatické glyfy v tmavém zaobleném čtverci
def tool(name, glyph):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="26" fill="#151518"/>
  <g transform="translate(60 60)" stroke="#e6e6e6" stroke-width="4" fill="none"
     stroke-linecap="round" stroke-linejoin="round">{glyph}</g>
</svg>'''
    with open(os.path.join(TOOL, name), "w") as f:
        f.write(svg)

GLYPHS = {
    "1":  '<circle r="20"/><path d="M-20 0h40M0 -20v40"/>',
    "2":  '<rect x="-20" y="-20" width="40" height="40" rx="8"/><path d="M-8 0h16"/>',
    "3":  '<path d="M-18 12 L0 -18 L18 12 Z"/><path d="M-9 12 L9 12"/>',
    "4":  '<circle r="18"/><path d="M-9 -3 L0 6 L9 -6"/>',
    "5":  '<rect x="-18" y="-18" width="36" height="36" rx="18"/><path d="M-8 -8 L8 8M8 -8 L-8 8"/>',
    "6":  '<path d="M-18 -10 L0 -20 L18 -10 L18 10 L0 20 L-18 10 Z"/>',
    "7":  '<circle r="19"/><path d="M0 -19 V19M-19 0 H19"/>',
    "8":  '<path d="M-16 -16 H16 V16 H-16 Z"/><path d="M-16 -4 H16"/>',
    "9":  '<path d="M-18 6 Q-18 -18 6 -18 M18 -6 Q18 18 -6 18"/>',
    "10": '<circle cx="-8" cy="-8" r="8"/><circle cx="8" cy="8" r="8"/><path d="M-2 -2 L2 2"/>',
    "11": '<path d="M0 -20 L17 -10 L17 10 L0 20 L-17 10 L-17 -10 Z"/><circle r="7"/>',
}
for k, g in GLYPHS.items():
    tool(f"tool-{k}.svg", g)

print("Vygenerováno:")
print(" ", len(portraits) + 1, "abstraktních obrázků")
print(" ", len(CLIENTS), "log klientů")
print(" ", len(GLYPHS), "ikon integrací")
