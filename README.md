# Synthetix — web AI automatizační agentury

Jednostránkový web (landing page) pro firmu **Synthetix**, agenturu zaměřenou na
AI automatizaci, integrace a vývoj AI agentů. Vizuálně vychází ze struktury
šablony *Sanjaya*, je ale kompletně přebrandovaný na Synthetix a **v celém rozsahu
přeložený do češtiny**.

## Vlastnosti

- **Tmavý moderní design** (font Geist / Geist Mono, akcenty, zaoblené karty).
- **Plně soběstačný** — žádná závislost na externím CDN:
  - fonty Geist self-hostované jako variabilní woff2 (OFL licence, plná česká diakritika),
  - videa generovaná lokálně (`assets/video/*.webm`) s automatickým fallbackem
    na CSS animaci pro zařízení bez podpory WebM,
  - obrázky, loga a ikony jako lokální SVG.
- **Lenis smooth scroll** (vendorováno v `js/vendor/`) — plynulý scroll na kolečku,
  nativní scroll na dotyku; při `prefers-reduced-motion` se vypíná.
- **Animace 1:1 podle šablony** (`js/main.js`):
  - per-písmenkový reveal nadpisů a hero podtitulku,
  - hero appear sekvence při načtení (pozadí → služby → texty → karta),
  - sticky „pain point“ sekce se scroll-driven rotací kruhů a postupným
    zobrazováním pilulek,
  - perspektivní náklon case-study karet + parallax obrázků uvnitř masky,
  - scroll-linked dojezd kroků a slide-in karet služeb,
  - parallax pozadí sekcí Proč my a CTA,
  - hover slide textu na tlačítkách, blur crossfade cen při přepnutí,
  - reveal animace, akordeon FAQ, slider referencí, počítadla, mobilní menu.
- **Běží všude** — bez JS je veškerý obsah viditelný, `prefers-reduced-motion`
  vše zobrazí staticky, WebM fallback, nativní touch scroll na mobilech.
- **Responzivní** — desktop, tablet i mobil.

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
