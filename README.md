# Conuco – Demo-MVP

Pitch-Demo für eine radikal einfache Farm-Software (Tomatenfarm, Valencia/Carabobo).
Reines HTML/CSS/JavaScript – kein Framework, kein Build-Schritt.

## Starten

`index.html` doppelklicken. Fertig. (Für die Google-Fonts braucht es einmalig Internet; ohne Netz greifen die Fallback-Schriften.)

## Module

1. **Riego y Clima** – Bewässerungsempfehlung pro Plot aus dem 14-Tage-Wetterszenario, Bodenfeuchte (Mock-Sensor), Krankheitsrisiko, Ernte-Hinweis, „Heute als bewässert markieren“.
2. **Cosecha y Costos** – Ernte- und Kosten-Einträge (USD), Kennzahlen, Verkaufspreis-Regler, zwei Inline-SVG-Charts, Formular zum Hinzufügen (In-Memory).

DE/ES-Umschalter oben rechts, Hell/Dunkel daneben (folgt sonst dem System).

## Daten

- `data/wetter-14-tage.json` – Quelle der Wahrheit (Tag 1–10 AccuWeather, Tag 11–14 Klimamuster).
- `data/wetter-14-tage.js` – 1:1-Kopie als `window.CONUCO_WEATHER`, damit die Demo auch per `file://` läuft (Browser blockieren dort `fetch`). Läuft die Demo über http(s), wird die JSON direkt geladen.
- `wetter-szenario-14-tage.md` – fachliche Begründung der Empfehlungslogik.

Nach Änderungen an der JSON die JS-Kopie neu erzeugen:

```bash
node -e "const fs=require('fs');const j=fs.readFileSync('data/wetter-14-tage.json','utf8');JSON.parse(j);fs.writeFileSync('data/wetter-14-tage.js','// Automatisch aus data/wetter-14-tage.json erzeugt (1:1).\nwindow.CONUCO_WEATHER = '+j.trim()+';\n')"
```

## Weitergeben

- `conuco-standalone.html` – alles in einer Datei (CSS, JS, Wetterdaten eingebettet). Zum Verschicken oder Hochladen bei einem statischen Hoster (Netlify Drop, GitHub Pages, Cloudflare Pages).
- Neu bauen nach Änderungen: `python3 build-standalone.py`

## Dateien

- `index.html` – Markup (eine Struktur für beide Sprachen)
- `styles.css` – Design-Tokens (Light/Dark), Layout
- `i18n.js` – Übersetzungs-Dictionary DE/ES inkl. Wetter- und Ernte-Texte
- `app.js` – Zustand, Fachlogik, Rendering, Charts
- `build-standalone.py` – bündelt alles in `conuco-standalone.html`
