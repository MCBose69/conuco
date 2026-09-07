# Wetter-Szenario: 14 Tage für die Tomatenfarm in Valencia, Carabobo

*Erstellt am 7. September 2026 als reales Beispielszenario für die Conuco-Demo.*

## Datenherkunft

Tage 1–10 (7.–16. September) basieren auf der tatsächlichen 10-Tage-Vorhersage von AccuWeather für Valencia, Carabobo. Verlässliche Vorhersagen reichen selten weiter als ca. 10 Tage; die Tage 11–14 (17.–20. September) sind daher **kein** echter Forecast, sondern ein typisches Muster für diese Jahreszeit, abgeleitet aus den langjährigen Klimadurchschnitten (Regenzeit-Spitze Juni–September). Im Datensatz unten mit `"source"` gekennzeichnet.

## Die 14 Tage

| Tag | Datum | Max/Min °C | Regen-Whs. | Bedingungen | Quelle |
|---|---|---|---|---|---|
| 1 | Mo 7.9. | 34° / 22° | 60% | Zeitweise sonnig, dann bewölkt und heiß, nachmittags Regen möglich | Vorhersage |
| 2 | Di 8.9. | 35° / 22° | 88% | Warm, vereinzelte Nachmittagsschauer | Vorhersage |
| 3 | Mi 9.9. | 34° / 22° | 62% | Warm, zeitweise sonnig, später bewölkt mit Nachmittagsregen | Vorhersage |
| 4 | Do 10.9. | 32° / 21° | 59% | Überwiegend bedeckt, mögliche Schauer | Vorhersage |
| 5 | Fr 11.9. | 34° / 23° | 60% | Bewölkt, Regen wahrscheinlich, Gewitter möglich | Vorhersage |
| 6 | Sa 12.9. | 33° / 22° | 91% | Anhaltende Regenperioden | Vorhersage |
| 7 | So 13.9. | 33° / 22° | 61% | Bewölkt; morgens und nachmittags Gewitter möglich | Vorhersage |
| 8 | Mo 14.9. | 32° / 22° | 56% | Dunkel bedeckt, Regen- und Gewitterrisiko | Vorhersage |
| 9 | Di 15.9. | 32° / 22° | 59% | Stark bewölkt, mögliche Schauer | Vorhersage |
| 10 | Mi 16.9. | 33° / 21° | 59% | Überwiegend bewölkt, Regen möglich | Vorhersage |
| 11 | Do 17.9. | 33° / 22° | 60% | Bewölkt mit Nachmittagsschauern | Typisches Muster |
| 12 | Fr 18.9. | 32° / 21° | 65% | Stärkere Schauer möglich, hohe Luftfeuchtigkeit | Typisches Muster |
| 13 | Sa 19.9. | 33° / 22° | 55% | Teils sonnig, Nachmittagsgewitter möglich | Typisches Muster |
| 14 | So 20.9. | 32° / 21° | 60% | Bewölkt, weiterhin hohe Regenwahrscheinlichkeit | Typisches Muster |

## Was das Szenario für die Farm bedeutet

**Das prägende Muster:** Alle 14 Tage liegen mitten in der venezolanischen Regenzeit (Spitzenmonate Juni–September). Regenwahrscheinlichkeit liegt an keinem einzigen Tag unter 55%. Das ist die eigentliche Pointe für die App: Die Kernfrage ist hier nicht "wann bewässern", sondern "wann NICHT bewässern" und "wie schützt man Ernte und Pflanzen vor zu viel Wasser". Das ist ein interessanterer, differenzierterer Pitch als eine reine Bewässerungs-App.

**Freiland (Lote Norte, Lote Sur):** Der Boden ist über die gesamte Periode durchgehend feucht bis nass. Reguläre Bewässerung sollte praktisch komplett ausgesetzt werden — jede zusätzliche Wassergabe erhöht nur das Risiko von Staunässe und Wurzelfäule. Die App sollte hier durchgehend "keine/reduzierte Bewässerung" anzeigen und stattdessen vor Staunässe/Pilzrisiko warnen, besonders an den Spitzentagen 8.9. (88%) und 12.9. (91%).

**Gewächshaus (Invernadero 1):** Genau umgekehrtes Verhalten — das Dach hält den Regen komplett ab, die Pflanzen bekommen unabhängig vom Wetter draußen kein Wasser von oben. Die Bewässerung muss hier normal nach Zeitplan weiterlaufen, unabhängig von der Regenwahrscheinlichkeit. Dieser Kontrast (Freiland vs. Gewächshaus reagieren gegensätzlich auf dieselbe Wettermeldung) ist ein starkes, glaubwürdiges Feature für die Demo.

**Krankheitsrisiko:** Anhaltend hohe Luftfeuchtigkeit über mehr als eine Woche am Stück begünstigt Pilzkrankheiten bei Tomaten (v. a. Kraut- und Braunfäule, Blattflecken). Ab Regenwahrscheinlichkeit 60%+ sollte die App eine Krankheitsrisiko-Warnung für die Freiland-Lots anzeigen, besonders nach den Starkregentagen 8.9. und 12.9.

**Erntetiming:** Da an fast jedem Tag nachmittags Regen/Gewitter angesagt sind, sollte die Empfehlung lauten, konsequent vormittags zu ernten, bevor die Nachmittagsschauer einsetzen. Nass geerntete Früchte sind anfälliger für Fäulnis — ein reales, dringendes Problem in Venezuela, wo keine durchgehende Kühlkette garantiert ist (häufige Stromausfälle). Sinnvoller Hinweis in der App: "Heute vormittags ernten, sofort verkaufen oder kühlen — keine verlässliche Kühlkette voraussetzen."

**Etwas trockenere Fenster:** Die Tage mit vergleichsweise niedrigerer Regenwahrscheinlichkeit (14.9. mit 56%, 19.9. mit 55%) sind die relativ besten Tage für Feldarbeiten, die einen halbwegs trockenen Zeitraum brauchen — "besser", aber immer noch keine echten Trockentage.

## Quellen
- AccuWeather 10-Tage-Vorhersage Valencia, Carabobo: https://www.accuweather.com/es/ve/valencia/352579/daily-weather-forecast/352579
- Klimadurchschnitte Valencia (Weather Spark): https://es.weatherspark.com/y/27392/Clima-promedio-en-Valencia-Venezuela-durante-todo-el-a%C3%B1o
