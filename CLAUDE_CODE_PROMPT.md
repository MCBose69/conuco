# Prompt für Claude Code: "Conuco" – Farm-Management-Demo

Kopiere den folgenden Abschnitt (ab "## Kontext") als Prompt in Claude Code in diesem Projektordner.

---

## Kontext

Ich pitche einem Freund in Venezuela eine Geschäftsidee: Er betreibt eine Tomatenfarm in Valencia, Carabobo, und ist sehr geschäftsaffin (aktuell zusätzlich Hotel + Bootsvermietung in Morrocoy). Ich bringe technisches/Software-Know-how ein. Diese Demo soll ihm zeigen, wie ein Software-Produkt für seine Farm aussehen könnte – sie muss wie ein echtes, poliertes MVP wirken, nicht wie ein Wireframe, weil es eine Pitch-Situation ist.

## Ziel

Baue eine lauffähige Web-Demo unter dem Produktnamen **"Conuco"** ("conuco" = traditionelles venezolanisch-karibisches Wort für ein kleines Anbaufeld). Reines HTML/CSS/JavaScript, kein Framework, kein Build-Schritt – muss durch simples Öffnen von `index.html` im Browser laufen. Zwei Module, bewusst auf diese zwei begrenzt (kein Kitchen-Sink-Produkt):

1. **Bewässerung & Wetter** ("Riego y Clima")
2. **Ernte- & Kostenerfassung** ("Cosecha y Costos")

Sprachumschalter Deutsch (Standard) / Spanisch, der die komplette UI live umschaltet (Übersetzungs-Dictionary in JS, keine doppelte Markup-Struktur pro Sprache).

## Wichtig: reales Szenario nutzen, nicht neu erfinden

Im Ordner liegt bereits `data/wetter-14-tage.json` – ein reales 14-Tage-Wetterszenario für Valencia (Tage 1–10 = echte AccuWeather-Vorhersage, Tage 11–14 = typisches Regenzeit-Muster, jeweils mit `source`-Feld gekennzeichnet). Jeder Tag hat bereits vorgerechnete Felder: `irrigationOpenField` (keine/reduziert), `irrigationGreenhouse` (immer "normal", weil überdacht), `diseaseRiskFlag`, `harvestNote`. **Lies diese Datei ein und nutze sie 1:1 als Datengrundlage für Modul 1** – keine generischen Zufallsdaten erfinden. Baue eine Tages-Auswahl/Zeitstrahl (Tag 1–14, mit Datum), durch die man beim Pitch live blättern kann, um zu zeigen, wie sich die Empfehlung von Tag zu Tag ändert.

Die Datei `wetter-szenario-14-tage.md` (gleicher Ordner) erklärt die fachliche Begründung hinter den Werten (Regenzeit-Kontext, warum Freiland und Gewächshaus gegensätzlich reagieren, Krankheitsrisiko, Erntetiming, Kühlketten-Problem in Venezuela). Nutze diesen Text als Grundlage für die Empfehlungs-/Warntexte in der App – die Logik soll fachlich nachvollziehbar sein, nicht nur hübsch aussehen.

## Modul 1: Bewässerung & Wetter

- Plot-Auswahl: "Lote Norte" (Freiland), "Lote Sur" (Freiland), "Invernadero 1" (Gewächshaus)
- Aktuelle Wetteranzeige + 5-Tage-Streifen aus den Szenario-Daten, plus die Tages-Auswahl über alle 14 Tage
- Bodenfeuchte-Anzeige pro Plot (Mock-Sensorwert)
- Bewässerungsempfehlung aus den JSON-Feldern ableiten, mit klarem visuellem Unterschied Freiland vs. Gewächshaus (letzteres bewässert unabhängig vom Regen normal weiter – das ist ein Kernpunkt der Demo)
- Krankheitsrisiko-Hinweis bei `diseaseRiskFlag: true` (nur für Freiland-Plots)
- Ernte-Hinweis (`harvestNote`) prominent anzeigen
- Interaktives Element: "Heute als bewässert markieren" / rückgängig machen

## Modul 2: Ernte- & Kostenerfassung

- Kultur: Tomate, Sorte "Tomate Río Grande"
- Währung: USD (in Venezuela läuft die reale Wirtschaft wegen der Bolívar-Hyperinflation informell weitgehend auf Dollarbasis)
- Vorausgefüllte Beispieldaten: ca. 10–15 Ernte-Einträge (Datum, Plot, kg, Qualitätsstufe) und ca. 8–10 Kosten-Einträge (Datum, Kategorie: Saatgut/Betriebsmittel/Arbeitskraft/Treibstoff, Betrag)
- Zusammenfassung: Gesamternte (kg), Gesamtkosten, Kosten pro kg, geschätzter Umsatz/Marge bei einstellbarem Verkaufspreis
- Ein funktionierendes "Eintrag hinzufügen"-Formular, das Tabelle und Kennzahlen live aktualisiert (nur In-Memory-State, kein Backend)
- Zwei handgezeichnete, saubere Inline-SVG-Charts: Erntemenge über Zeit (Balken) und Kostenaufteilung nach Kategorie (Donut)

## Design

- Farben (als CSS Custom Properties, mit vollem Light- UND Dark-Theme-Support):
  - Primäraccent: kräftiges Erntegrün (~#2F6B3C-Familie)
  - Sekundäraccent (Ernte/Kosten): Terrakotta/Ton (~#B9622C-Familie) – Anspielung auf die venezolanische Erde
  - Tertiäraccent (Bewässerung): gedämpftes Blaugrün (~#2E6E8E-Familie)
  - Semantische Farben getrennt von den Accents: Amber für "moderat", Rostrot für "kritisch/jetzt bewässern", ruhiges Grün für "in Ordnung"
  - Neutrale Töne warm, nicht reines Grau; Hintergrund warmes Off-White (hell) bzw. warmes, grünstichiges Nahe-Schwarz (dunkel)
- Typografie: markante Serif-Display-Schrift für Überschriften/Marke (z. B. "Fraunces" von Google Fonts), klare Sans für UI-Text (z. B. "Public Sans"), Monospace mit `font-variant-numeric: tabular-nums` für Zahlen (z. B. "IBM Plex Mono")
- Layout: Header mit Marke "Conuco", Plot-Auswahl, DE/ES-Umschalter; darunter Tab-Umschalter zwischen den zwei Modulen; oben Kennzahl-Karten (mit Farbcodierung/Status, nicht nur Zahlen), darunter Detailansicht
- Light/Dark-Theme sauber über `prefers-color-scheme` + `[data-theme]`-Override implementieren, alle Farbtokens im `:root` definieren
- Echte Beispieldaten von Anfang an sichtbar (kein leerer Zustand), mit Hinweis "Beispieldaten" / "Datos de ejemplo"
- Tastatur-Fokuszustände, `prefers-reduced-motion` respektieren

## Wettbewerbs-Einordnung (Kontext, nicht kopieren)

WiseConn (Chile) macht bereits Bewässerung+Wetter-Automatisierung, aber für große kommerzielle Betriebe. Auravant (Argentinien) hat ein Freemium-Modell speziell für Kleinproduzenten in Lateinamerika. Keiner von beiden bedient aktiv Venezuela (Sanktionen, Zahlungsabwicklung, Marktgröße). Die Positionierung dieser Demo: radikal simpel, USD-basiert, für kleine Betriebe und unzuverlässiges Internet gebaut – eine Lücke, die die großen Player ignorieren.

## Qualitätsanspruch

Das ist eine Pitch-Demo, sie muss überzeugen: echte typografische Hierarchie, durchdachte Abstände (Flex/Grid mit `gap`, keine Margin-Kollisionen), keine Lorem-Ipsum-Platzhalter, beide Themes funktionieren, funktionierende Interaktivität (Tabs, Sprachumschalter, Formular, Tages-Zeitstrahl). Fertig ist es, wenn: `index.html` direkt im Browser ohne Fehler läuft, der DE/ES-Umschalter wirklich jeden Text umschaltet, das Durchblättern der 14 Tage die Empfehlungen/Warnungen sichtbar ändert, und das Hinzufügen eines Ernte-/Kosten-Eintrags die Kennzahlen und Charts sofort aktualisiert.
