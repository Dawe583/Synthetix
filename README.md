# Synthetix — web AI automatizační agentury

Jednostránkový web (landing page) pro firmu **Synthetix**, agenturu zaměřenou na
AI automatizaci, integrace a vývoj AI agentů. Vizuálně vychází ze struktury
šablony *Sanjaya*, je ale kompletně přebrandovaný na Synthetix a **v celém rozsahu
přeložený do češtiny**.

## Vlastnosti

- **Tmavý moderní design** (font Geist / Geist Mono, akcenty, zaoblené karty).
- **Plně soběstačný** — žádná závislost na externím CDN. Veškeré obrázky, loga
  klientů a ikony integrací jsou lokální SVG (`assets/`), pozadí hera je
  animované čistě přes CSS.
- **Responzivní** — desktop, tablet i mobil.
- **Interaktivní prvky** (`js/main.js`):
  - lepkavá navigace s pozadím po odscrollování + mobilní menu,
  - reveal animace při scrollu (IntersectionObserver),
  - akordeon FAQ,
  - slider referencí (automatický + šipky),
  - přepínač ceníku měsíčně / ročně,
  - animovaná počítadla statistik.

## Struktura sekcí

Hero · Loga klientů · Skrytá cena manuální práce · Naše práce (case studies) ·
Jak to funguje · Integrace · Služby · Proč my (srovnávací tabulka) · Reference ·
Ceník · Blog · FAQ · CTA · Patička.

## Struktura projektu

```
index.html            # hlavní stránka (obsah v češtině)
css/styles.css        # design systém a styly
js/main.js            # interakce
assets/img/           # abstraktní obrázky, avatar, pozadí (SVG)
assets/logos/         # wordmark loga klientů (SVG)
assets/tools/         # ikony integrací / nástrojů (SVG)
scripts/gen_assets.py # generátor lokálních SVG assetů
```

## Spuštění lokálně

Stačí libovolný statický server, např.:

```bash
python3 -m http.server 8000
# a otevřít http://localhost:8000
```

## Přegenerování assetů

```bash
python3 scripts/gen_assets.py
```
