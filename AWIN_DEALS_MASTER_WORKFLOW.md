# Awin Deals – Master-Workflow und Arbeitsregeln

**Stand:** 26. Oktober 2026  
**Zweck:** Dieses Dokument ist die verbindliche Arbeitsgrundlage für künftige Aufgaben rund um Awin Deals, die Awin-Partnerschaft, Produktdaten, Tracking, Website, GitHub, SEO und dazugehörige Abläufe. Vor einer späteren Änderung dieses Projekts ist diese Datei zusammen mit dem aktuellen Repository-Stand zu prüfen. Sie beschreibt den gegenwärtig bekannten Zustand; aktuelle Awin-Freigaben, Preise, URLs und Regeln müssen bei jeder relevanten Aufgabe erneut geprüft werden.

---

## 1. Ziel und Grundprinzipien

Awin Deals ist eine **Produkt-Discovery- und Affiliate-Link-Website**, keine eigene Verkaufsplattform. Die Seite zeigt ausgewählte Produkte eines Händlers, verlinkt auf den Händler und kann bei qualifizierten Käufen eine Affiliate-Provision erhalten. Der tatsächliche Kaufvertrag, Zahlung, Lieferung, Rückgabe und Kundenservice liegen beim Händler. Awin Deals wickelt im aktuellen technischen Stand keine Bestellungen ab.

### Verbindliche Arbeitsregeln

1. **Bei einer konkreten Arbeitsanweisung handeln.** Wenn der Betreiber „mach das“, „füg die Produkte hinzu“, „ändere das“ oder sinngemäß sagt, soll die Änderung bei verfügbarer Berechtigung direkt umgesetzt werden – nicht nur erklärt oder als Vorschlag formuliert werden.
2. **Vor dem Ändern den echten aktuellen Stand lesen.** Nie allein anhand einer alten Antwort, einer Erinnerung, des README oder einer vermuteten Dateistruktur arbeiten. Zuerst das Repository und die betroffenen Dateien abrufen. Dokumentation kann veraltet sein.
3. **Quellen prüfen, nicht erfinden.** Keine erfundenen Preise, Streichpreise, Rabatte, technischen Daten, Freigaben, Händlerstatus, Domainfreigaben, Provisionen oder Aussagen zur deutschen Zulassung.
4. **Unsicherheit konkret benennen.** „Der Awin-Link leitet auf die Produktseite weiter“ ist nicht dasselbe wie „Awin schreibt den Verkauf sicher zu“. Eine Produktseite, die lädt, beweist nicht, dass die Provision korrekt getrackt wird.
5. **Original und bestehende Gestaltung bewahren.** Änderungen möglichst gezielt durchführen und vorhandene Website-Funktionen nicht unnötig umbauen oder entfernen.
6. **Kleine, überprüfbare Änderungen bevorzugen.** Bei Produktupdates sind in der Regel die Produktdaten und die zugehörigen Sitemap-Einträge zu ändern, nicht die gesamte Website neu zu schreiben.
7. **Nachprüfen, bevor Erfolg gemeldet wird.** JSON und interne Verknüpfungen kontrollieren, den Commit überprüfen und – wenn möglich – die veröffentlichte Website ansehen. Nicht behaupten, etwas sei live, solange das nicht überprüft wurde.
8. **Nur nötige Rückfragen stellen.** Eine Rückfrage ist sinnvoll, wenn ein unverzichtbarer Punkt wirklich fehlt. Wenn der Auftrag und die vorhandenen Daten ausreichen, mit sinnvollen, klar dokumentierten Standardentscheidungen fortfahren.
9. **Nicht aus einem Einzelrisiko eine pauschale Ablehnung ableiten.** Der Betreiber vermittelt Produkte als Affiliate und ist nicht der Verkäufer. Insbesondere ist eine mögliche fehlende Straßenzulassung eines bestimmten Fahrzeugs nicht automatisch ein Grund, das Produkt aus dem Katalog auszuschließen. Die jeweilige Tatsache muss für genau das Modell geprüft und korrekt kenntlich gemacht werden. Ein Hinweistext ist jedoch kein automatischer Ersatz für die Prüfung geltender Gesetze, Plattformregeln oder Marken-/Programmregeln.
10. **Den Nutzer nicht mit einer bloßen Beschreibung abspeisen, wenn die Umsetzung möglich ist.** Nach der Änderung knapp und klar mitteilen, was geändert wurde, was geprüft wurde, was noch unbestätigt ist und wo der Commit zu sehen ist.

## 2. Projektidentität und bestätigte technische Grundlage

- GitHub-Repository: https://github.com/Jona-Buck/awin-deals
- Live-Website: https://jona-buck.github.io/awin-deals/
- Standardbranch, soweit beim letzten Abruf bekannt: **main**
- Website-Typ: statische Website auf GitHub Pages
- Technische Basis: HTML, CSS, JavaScript und eine zentrale JSON-Datei; keine klassische Shop-Datenbank und kein eigener Checkout.
- Awin Publisher-ID (PID), aus bisherigen Awin-Unterlagen bekannt: **3104608**. Bei jeder neuen Tracking-Integration prüfen, ob dies weiterhin die richtige Publisher-ID ist.
- Sprache und Zielmarkt der Website: überwiegend Deutsch / Deutschland; Produktpreise im Datenmodell werden durch den Code als Euro formatiert.
- Bekannte Produkt- und Markenbasis beim Abruf am 26. Oktober 2026: **130 Produkte** – 96 Apple, 22 NAVEE und 12 INMOTION. Der Apple-Teil deckt Smartphones, Kopfhörer, Notebooks, Tablets, Smartwatches, Tracker, Zubehör, Desktop-PCs, Streaming-Geräte und Monitore ab. OTTO zeigt zusätzliche Einträge und Varianten (z. B. Farben, Speicher- und Armbandgrößen); der manuell gepflegte Katalog ist deshalb noch kein vollständiger 1:1-Import sämtlicher OTTO-Angebote. Preise und Varianten sind veränderlich. Dieser Stand ist eine Momentaufnahme.

### Wichtige zuletzt bekannte Programmdaten – immer erneut prüfen

- NAVEE Germany: AID **116245**; beim letzten dokumentierten Abruf war das Programm beigetreten und Deeplinking aktiviert. Die Händlerdomain war als naveetech.de bekannt.
- INMOTION: AID **77224**; beim letzten dokumentierten Abruf war das Programm beigetreten und Deeplinking aktiviert. Die damals angezeigten Programmdaten nannten als gültige Domain jedoch inmotionworld.com und wiesen US/USD als Region/Währung aus.
- In der Produktdatei liegen INMOTION-Zielseiten auf eu.inmotionworld.com. Deshalb ist die Zuordnung von Käufen über diese EU-Unterdomain **nicht bestätigt**, auch wenn die Awin-URL geöffnet werden kann.
- Weitere früher als beigetreten erfasste Programme waren unter anderem Sportspar DE (AID 14366), Reichelt (AID 14954) sowie Anker/eufy und weitere Anbieter. Der Status kann sich jederzeit ändern.
- Früher abgelehnte oder noch ausstehende Bewerbungen dürfen nicht als bestätigt beigetreten behandelt werden. Der Status ist je Programm aktuell in Awin zu prüfen.

**Regel:** Diese Angaben helfen bei der Orientierung. Sie ersetzen nie die aktuelle Programminformation in Awin. Vor einem neuen Händler oder einer neuen Tracking-URL Status, Advertiser-ID, erlaubte Ziel-Domain, Deeplinking, Region, Währung, Promotionsbedingungen und den aktuell erzeugten Link prüfen.

## 3. Repository: Welche Datei wofür zuständig ist

| Datei | Aufgabe | Wann sie zu ändern ist |
|---|---|---|
| **products.json** | Zentrale Quelle des Produktkatalogs. Die Produktkarten und Detailseiten lesen daraus. | Neue, geänderte oder entfernte Produkte; Preise, Bilder, Beschreibungen, Tracking-Links. |
| **index.html** | Grundstruktur der Startseite, Seitentitel, Metadaten, Marken-/Footerbereiche und Verweise auf CSS/JS. | Struktur, Texte oder Metadaten der Startseite ändern. |
| **app.js** | Lädt products.json und baut Produktkarten, Filter-/Sortierverhalten, Suche, Merkliste und Startseiten-Zähler. | Funktionalität der Katalogansicht oder Darstellung ändern. |
| **product.html** | HTML-Vorlage für jede einzelne Produktdetailseite. | Layout oder Inhalt der generischen Produktseite ändern. |
| **product.js** | Liest die ID aus der URL, findet das Produkt in products.json, stellt Bildergalerie, Preis, Highlights, Affiliate-Link und verwandte Produkte dar. | Detailseitenverhalten oder Galerie ändern. |
| **style.css** | Visuelles Design, Abstände, Farben, Animationen und responsive Darstellung. | Gestaltungsänderungen. Desktop und Handy danach prüfen. |
| **impressum.html** | Rechtliche Anbieterinformationen. | Nur anhand der tatsächlichen Betreiberinformationen und geltenden Anforderungen bearbeiten. |
| **datenschutz.html** | Datenschutzhinweise über Hosting, Browserspeicher, externe Bilder und Affiliate-Links. | An tatsächliche Datenflüsse und Dienste anpassen. |
| **sitemap.xml** und **sitemap.txt** | Verzeichnisse der auffindbaren Website- und Produkt-URLs. Die aktuelle Version enthält eigene URLs mit product.html?id=… für die Produkte. | Bei Produkt-IDs, neuen Produkten, entfernten Produkten oder relevanten Seitenänderungen synchron halten. |
| **README.md** | Technische Projektübersicht und bisherige Entwicklerhinweise. | Aktualisieren, wenn sich tatsächliche Abläufe oder Datenfelder ändern. Nicht blind als Ist-Zustand übernehmen. |
| **manifest.json** | Installierbarkeits-/PWA-Metadaten. | Nur bei Änderungen des App-Namens, Startverhaltens oder vergleichbarer Metadaten. |
| **scripts/import-awin.mjs** | Vorhandener Importer für Awin-Produktfeeds, Datenumwandlung und Katalogauswahl. | Nur wenn Feed-Import bewusst wieder aktiviert oder überarbeitet werden soll. |
| **scripts/awin-stream.mjs** | Hilfsfunktionen zum stromweisen Einlesen von Feed-Dateien. | Bei gezielten Änderungen am Feedparser. |
| **scripts/resolve-missing-images.mjs** | Ergänzt fehlende Bilder anhand von Produktdaten-Endpunkten. Der derzeitige Code unterstützt als Quelle nur eu.inmotionworld.com und überspringt Produkte, die bereits ein Bild haben. | Nur bei gezielter Bildpflege oder Erweiterung der unterstützten Hosts. |
| **.github/workflows/import-awin-products.yml** | GitHub-Actions-Workflow, der nach aktuellem Stand nur manuell gestartet werden kann und aktuell ausdrücklich meldet, dass der automatische Import deaktiviert ist. | Nicht wieder aktivieren, ohne dass ausdrücklich ein automatischer Import gewünscht ist. |
| **.github/workflows/resolve-missing-images.yml** | Kann manuell laufen und springt an, wenn das Bildskript verändert wird. Schreibt gefundene Bildänderungen in products.json zurück. | Für gezielte Bildpflege. |
| **favicon.svg** | Seitensymbol. | Bei Branding-Änderungen. |

### Bekannte Diskrepanz, die aktiv im Blick bleiben muss

Im aktuellen README steht noch, der Awin-Produktimport laufe automatisch alle sechs Stunden. Der tatsächlich abgerufene Workflow enthält jedoch **keinen Zeitplan**, sondern nur einen manuellen Trigger und einen Platzhalter, der ausgibt, dass der automatische Awin-Import deaktiviert ist. Er führt den vorhandenen Importer derzeit nicht aus. Daher gilt der reale Workflow-Code, nicht der veraltete README-Text.

Der automatische Bulk-Import wurde früher bewusst deaktiviert, weil unpassende/irrelevante Produkte in den Katalog gelangen konnten. Die aktuelle Linie ist ein **manuell kuratierter Katalog**. Diesen Import nicht eigenmächtig reaktivieren und nicht sämtliche Produkte eines Feeds pauschal veröffentlichen.

## 4. Standardablauf für jede neue Anfrage

### Schritt 1 – Auftrag eindeutig verstehen

Zuerst die Anfrage in einen konkreten Änderungsumfang übersetzen:
- Produktbestand ändern?
- Einzelne Produktdaten korrigieren?
- Neuer Händler bzw. Awin-Programmstatus?
- Tracking-Link erstellen oder prüfen?
- Website-Funktion, Layout oder Texte ändern?
- SEO, Sitemap oder rechtliche Seite?
- Awin-Bewerbung, Awin-API, Programmregeln oder Provisionsfrage?

Dabei frühere Nachrichten dieser Aufgabe berücksichtigen. Wenn die Person bereits gesagt hat „mach alle“, nicht nochmals nachfragen, ob wirklich alle gemeint sind. Wenn sie eine Einschränkung nennt, diese bei der Umsetzung beachten.

### Schritt 2 – Repository-Ist-Zustand abrufen

Mindestens die unmittelbar betroffenen Dateien frisch lesen. Bei Produktarbeiten stets products.json und je nach Umfang app.js, product.js, sitemap.xml und sitemap.txt prüfen. Bei Workflow-Arbeiten auch die betroffenen Dateien unter .github/workflows und scripts lesen. Vorhandene Commits, Dateinamen, Datenfelder und bestehendes Verhalten prüfen.

Keine Änderungen auf einen alten SHA oder eine alte Dateikopie schreiben. Vor dem Update den aktuellen Datei-SHA abrufen, damit keine neueren Änderungen versehentlich überschrieben werden.

### Schritt 3 – Fakten recherchieren und in Stufen bewerten

Quellen in dieser Reihenfolge priorisieren:
1. Aktuelles Awin-Dashboard, Awin Link Builder, gültige Programmbedingungen und freigegebene Produktfeeds für Programmstatus und Tracking.
2. Offizielle Händler-Produktseite für aktuelle Produktbezeichnung, Preis, Verfügbarkeit, Bilder, Ausstattung und Spezifikationen.
3. Offizielle Herstellerunterlagen oder Support-/FAQ-Seiten, wenn die Produktseite eine Information nicht enthält.
4. Andere seriöse Quellen nur zur Ergänzung; Unterschiede zur offiziellen Quelle ausdrücklich erkennen lassen.

Eine Suchmaschinen-Ausschnittzeile ist keine ausreichende Bestätigung für ein wichtiges Datum oder einen Preis. Wenn eine offizielle Produktseite nicht abrufbar ist, nach offiziellen Alternativseiten oder Feed-Daten suchen. Wenn ein Wert weiterhin nicht verifiziert werden kann, ihn nicht als Tatsache ausgeben. Bei Preis- oder Rabattschildern lieber die Ermäßigung weglassen, statt einen falschen Rabatt einzubauen.

### Schritt 4 – Programmvoraussetzungen prüfen

Für jede neue Marke bzw. jeden neuen Händler kontrollieren:
- Ist das Programm im Awin-Konto wirklich beigetreten/Joined?
- Stimmt die Advertiser-ID (AID)?
- Ist Deeplinking erlaubt?
- Ist die Ziel-Domain bzw. Unterdomain in den Programmdaten zulässig?
- Passen Land/Region und Währung zu dem beworbenen Shop?
- Welche Bedingungen gelten für die genutzten Werbekanäle (Website, Social Media, Gutscheine, Suchmaschinenwerbung etc.)?
- Sind bestimmte Produkttypen, Claims oder Bild-/Brand-Nutzungen eingeschränkt?
- Ist ein offizieller Link mit genau dieser Ziel-URL erzeugbar?

Nicht aus einer bereits vorhandenen URL ableiten, dass alle anderen Seiten desselben Shops erlaubt oder trackbar sind. Bei einer noch ausstehenden oder abgelehnten Bewerbung keinen bereits bestätigten Partnerschaftsstatus behaupten.

### Schritt 5 – Änderung mit engem Umfang vorbereiten

Vor der Änderung kurz festlegen, welche Dateien betroffen sind. Nur diese Dateien ändern, sofern keine Abhängigkeit übersehen würde. Bei einem neuen Produkt kann das products.json plus beide Sitemaps sein. Für einen reinen Beschreibungsfehler sind normalerweise keine Änderungen an CSS oder Website-Struktur nötig. Bei einer neuen Funktion müssen HTML, JavaScript und CSS gemeinsam auf Abhängigkeiten geprüft werden.

### Schritt 6 – Daten und Funktionsfähigkeit prüfen

Vor dem Commit die Prüf-Checkliste in Abschnitt 10 verwenden. Erst dann committen. Bei größeren oder riskanteren Änderungen einen separaten Branch/PR vorziehen, wenn der Workflow dies zulässt; bei einer überschaubaren, klar beauftragten Produktdatenänderung kann eine direkte Commit-Änderung auf main angemessen sein.

### Schritt 7 – Ergebnis verifizieren und berichten

Nach der Änderung:
- den entstandenen Commit und die geänderten Dateien prüfen;
- die Datei bei Bedarf erneut abrufen und Inhalt/Anzahl plausibilisieren;
- die Live-Seite aufrufen, wenn möglich;
- bei Veröffentlichungsverzögerung offen sagen, dass der Commit erfolgreich, die Live-Veröffentlichung aber noch nicht bestätigt ist;
- im Ergebnis die Änderungen, den Commit-Link, eventuelle offene Risiken und den Live-Link nennen.

Nie eine Provision, Sales-Zuordnung oder Awin-Funktion als „getestet“ bezeichnen, wenn nur der Linktext erstellt wurde.

## 5. Standardablauf zum Hinzufügen eines Produkts

### 5.1 Modell und konkrete Produktseite festlegen

Ein Modell zählt nur dann als konkretes Produkt, wenn eine passende offizielle Produktseite, ein eindeutig identifizierbarer Artikel oder ein entsprechender Eintrag im gültigen Händlerfeed gefunden wurde. Varianten mit anderen Akkus, Motoren, Zollgrößen oder Modelljahren nicht unbemerkt zu einem einzigen Datensatz zusammenfassen. Falls der Händler eine gemeinsame Seite für mehrere klar benannte Varianten nutzt, muss die Bezeichnung deutlich machen, welche Variante der gespeicherte Preis betrifft.

### 5.2 Produktinformationen ermitteln

Für das konkrete Modell erfassen:
- exakte Modellbezeichnung;
- kurze, sachliche deutsche Beschreibung;
- aktuellen Preis und Währung;
- falls wirklich belegt: den für die Werbung zulässigen Vergleichs-/Streichpreis;
- eindeutige offizielle Ziel-URL;
- offizielles Hauptbild sowie, wenn verfügbar, weitere offizielle Bilder;
- ausgewählte technische Merkmale;
- Marke, Händler und sinnvolle vorhandene Kategorie;
- tatsächlichen Affiliate-Link;
- bei Bedarf einen modellbezogenen Hinweis, z. B. zur Zulassung, Kompatibilität oder regionalen Version.

Beschreibungen müssen eigenständig und knapp formuliert werden, ohne mehr zu versprechen als die Quelle. Technische Werte als Herstellerangabe kennzeichnen, wenn das für das Verständnis wichtig ist. Nicht notwendige Superlative und unbestätigte Claims vermeiden.

### 5.3 Preis und Rabatt

- price ist eine Zahl, kein formatierter Text wie „259 €“.
- Das aktuelle Interface formatiert Preise mit Euro. Daher nur einen belegten EUR-Preis in die aktuelle Datenstruktur schreiben; nicht stillschweigend USD als Euro interpretieren.
- oldPrice ist optional. Nur dann verwenden, wenn der Händler diesen Vergleichspreis aktuell glaubwürdig ausweist und die einschlägigen Preisangabenregeln eingehalten werden.
- badge ist optional. Wenn es einen Prozent-Rabatt zeigt, muss es zum aktuellen Preis und Vergleichspreis passen. Der Code berechnet die Rabattquote aus oldPrice und price und rundet auf ganze Prozent.
- Ist ein Preis belegt, aber kein belastbarer Vergleichspreis, nur price eintragen. Kein künstlicher Streichpreis und kein Rabattbadge.
- Preise und Verfügbarkeit vor dem Einfügen direkt auf der offiziellen Seite oder in einem geeigneten aktuellen Feed prüfen. Der Preis auf Awin kann selbst veraltet sein; maßgeblich ist die nachvollziehbare, aktuelle Quelle.
- In Deutschland kann bei einer Bekanntgabe von Preisermäßigungen § 11 PAngV relevant sein, insbesondere hinsichtlich des niedrigsten Gesamtpreises der vorherigen 30 Tage, soweit die Vorschrift gilt. Deshalb Preis- und Rabattclaims sorgfältig prüfen und im Zweifel rechtlich prüfen lassen.

Offizielle Rechtsquelle: https://www.gesetze-im-internet.de/pangv_2022/__11.html

### 5.4 Bilder

- Wenn verfügbar, das Originalbild des Händlers oder Herstellers verwenden.
- Bild muss das richtige Modell und die richtige Produktversion zeigen.
- image ist das Hauptbild und sollte funktionieren.
- images ist ein Array von Bild-URLs für die Galerie. Wenn keine Galerie vorliegt, verwendet der Code image als Rückfall.
- Keine Bilddatei von einem fremden Händler verwenden, wenn sie eine andere Variante oder ein anderes Modell zeigt.
- Bild-URLs auf Ladefähigkeit prüfen. Eine URL aus einer Produktseite ist nicht automatisch eine direkte Bilddatei.
- Vorhandene Bilder nicht unnötig durch ein einzelnes Bild ersetzen. Bildergalerien erhalten und nur validierte, eindeutige Bilder ergänzen.

### 5.5 Awin-Link

Im Idealfall den Link über den offiziellen Awin Link Builder erzeugen. Die dokumentierte generische Deep-Link-Struktur verwendet typischerweise die Kennungen für Advertiser und Publisher und die kodierte Ziel-URL. Für die bestehende Website sieht ein manueller Deep-Link häufig nach diesem Muster aus:

https://www.awin1.com/cread.php?awinmid=ADVERTISER_ID&awinaffid=PUBLISHER_ID&clickref=EINDEUTIGER_PRODUKT_SLUG&ued=URL_ENCODED_DESTINATION

Das ist ein **Muster**, keine pauschale Garantie für jedes Advertiser-Programm. Die Parameter und das Format müssen zur Unterstützung durch das jeweilige Awin-Programm passen.

- Publisher-ID: aktuell bekannt 3104608, vor einer neuen Integration erneut prüfen.
- Advertiser-ID: aus dem aktuellen Awin-Programm übernehmen, niemals aus dem Markennamen erraten.
- clickref: eindeutige, kurze Referenz wie awin-deals-produkt-slug nutzen, damit einzelne Links nachvollziehbar sind, sofern das Programm diese Referenz unterstützt.
- ued: tatsächliche Produktseite kodiert einsetzen; keine fehlerhaft gekürzte URL, keine zusätzliche Redirect-URL statt der eigentlichen Produktseite.
- productUrl bleibt die normale Produktseite ohne Awin-Trackingparameter.
- affiliateUrl ist der Tracking-Link, auf den die Website beim Klick verweist.
- Bereits im Katalog vorhandene tidd.ly-Kurzlinks können Awin-Links sein, müssen aber separat auf Zielseite und Tracking-Zugehörigkeit überprüft werden. Ein Kurzlink darf nicht ohne Prüfung in einen normalen Shop-Link umgewandelt werden.

Awin-Linkdokumentation:
- https://success.awin.com/articles/en_US/Knowledge/What-does-an-affiliate-link-look-like
- https://help.awin.com/advertisers/docs/de/create-a-tracking-link-for-partners
- https://help.awin.com/developers/docs/product-feed-publisher-guide-intro

### 5.6 Modellbezogene Zulassungs- oder Sicherheitshinweise

Produktzulassung ist kein globales Merkmal der ganzen Marke. Unterschiedliche Modellversionen oder Länderfassungen können sich unterscheiden. Wenn der Nutzer ein Fahrzeug aufführen will, das nicht für den öffentlichen Straßenverkehr in Deutschland zugelassen ist:
- den exakten Modellnamen und die konkrete Fassung prüfen;
- die Aussage anhand offizieller Herstellerangaben und, falls erforderlich, einer maßgeblichen amtlichen Quelle verifizieren;
- präzise formulieren, z. B. „Nach den überprüften Angaben nicht für den öffentlichen Straßenverkehr in Deutschland zugelassen“, nur wenn diese Aussage wirklich belegt ist;
- nicht pauschal jedes Modell einer Produktkategorie als illegal bezeichnen;
- nicht den Eindruck erwecken, der Hinweis allein garantiere rechtliche Zulässigkeit oder beseitige sämtliche Pflichten.

Der Betreiber ist Affiliate-Vermittler, kein Verkäufer. Der Workflow soll Produkte daher nicht automatisch allein wegen einer ungeklärten Straßenzulassung aussortieren. Zugleich darf die Website keine falschen Aussagen machen. Falls Awin- oder Händlerbedingungen die Bewerbung des Produkts untersagen, ist das separat zu berücksichtigen.

### 5.7 Datensatz einfügen

Das vorhandene products.json-Format ist maßgeblich. Übliche Felder:

- id: eindeutiger, stabiler slug in Kleinschreibung, z. B. inmotion-air-pro;
- name: sichtbarer Produktname;
- merchant: sichtbarer Händlername, z. B. NAVEE Germany oder INMOTION EU;
- brand: eigentliche Marke, z. B. NAVEE oder INMOTION;
- category: bestehende passende Kategorie, z. B. E-Scooter oder Elektrisches Einrad;
- price: aktueller Preis als Zahl in EUR;
- oldPrice: optionaler, belastbarer Vergleichspreis;
- badge: optionaler, korrekt berechneter Rabatttext;
- description: kurze deutsche Beschreibung;
- productUrl: normale offizielle Produkt-URL;
- affiliateUrl: tatsächlicher Awin-Tracking-Link;
- image: direkte URL des Hauptbildes;
- images: optional/empfohlenes Array der Galerie-Bilder;
- highlights: Array mit konkreten, überprüften Merkmalen;
- currency: falls vorhanden EUR; der aktuelle Preis-Renderer verwendet dennoch fest EUR.

Ein Produkt braucht eine stabile id, weil product.js den URL-Parameter id mit products.json abgleicht. Wird die id später geändert, müssen alle Verweise – insbesondere Sitemaps – passend geändert werden.

### 5.8 Nach dem Einfügen beide Sitemaps prüfen

sitemap.xml und sitemap.txt enthalten derzeit einzelne product.html?id=…-URLs für die Produkt-IDs. Bei einem neuen Produkt beide Dateien ergänzen; bei entferntem Produkt beide korrigieren. Doppelungen und alte IDs vermeiden. Anschließend checken, ob die erzeugten URLs dem echten Produkt-id-Wert entsprechen.

### 5.9 Kein automatisches Wholesale-Publishing

Der bestehende Katalog ist kuratiert. Nicht einfach Hunderte Feed-Produkte importieren, nur weil ein Feed verfügbar ist. Produkte anhand der Anfrage, Verfügbarkeit, Relevanz, gültiger Programmteilnahme, Datenqualität, passendem Zielmarkt und korrektem Tracking einzeln prüfen. Ein automatisierter Import ist nur einzurichten, wenn der Nutzer dies ausdrücklich möchte und Filter, Herkunft, Update-Regeln, Fehlerbehandlung und Rollback geklärt sind.

## 6. Neue Händler, Programme und Bewerbungen bei Awin

Wenn die Aufgabe einen neuen Händler betrifft, ist die Reihenfolge:

1. In Awin nach dem genauen Programm suchen, nicht nur nach dem Markennamen.
2. Status prüfen: Joined/Beigetreten, Pending/Ausstehend, Declined/Abgelehnt oder anderes.
3. AID, Region, Währung, erlaubte Domains, Deep-Link-Funktion, Provisionsmodell und Bedingungen aus dem aktuellen Programm ermitteln.
4. Die Bedingungen für Werbekanäle beachten. Eine Zulassung für Website-Werbung ist nicht automatisch eine Zulassung für jeden Social-Media-Kanal, Gutscheincode oder bezahlte Suchmaschinenanzeige.
5. Prüfen, ob der offizielle Link Builder eine Ziel-URL dieses Shops akzeptiert.
6. Einen einzelnen Link zur richtigen Produktseite erzeugen.
7. Weiterleitung und endgültige Zielseite prüfen.
8. Wenn Attribution unklar ist, den Status als unbestätigt notieren und eine echte Überprüfung über Awin-Klick-/Transaktionsdaten bzw. beim Awin-Support einplanen.
9. Erst nach dieser Prüfung Produkte für das Programm veröffentlichen oder den Status korrekt als vorläufig kennzeichnen.

Ein Awin-Link mit korrekter Publisher-ID ist notwendig, reicht aber nicht als alleiniger Nachweis, dass die konkrete Unterdomain, das Produkt und der Kauf korrekt vergütet werden. Die Programmbedingungen des konkreten Advertisers haben Vorrang.

Für Bewerbungen: Angaben zu Website, Reichweite, Social-Kanälen und Werbemethode ehrlich und erreichbar darstellen. Wenn ein Programm eine Bewerbung ablehnt, die konkrete Begründung ablesen und die Ursache beheben; nicht eine neue Kennung oder einen Tracking-Link einsetzen, um eine Ablehnung zu umgehen.

## 7. Automatisierter Feed-Import: aktueller Status und Regeln

Vorhandene Importer-Funktionen sind nicht dasselbe wie ein aktiv arbeitender Workflow.

- scripts/import-awin.mjs enthält Importlogik für unterschiedliche Feed-Formate und einige Filter-/Auswahlregeln.
- scripts/awin-stream.mjs unterstützt das stromweise Einlesen großer Feed-Dateien.
- .github/workflows/import-awin-products.yml läuft nach aktuellem Code nur bei manuellem Start. Der Workflow meldet, dass der Import deaktiviert ist und der Katalog manuell kuratiert wird; er ruft scripts/import-awin.mjs nicht auf.
- Es ist kein zeitgesteuerter Sechs-Stunden-Trigger in diesem Workflow vorhanden.
- Der frühere automatische Import wurde bewusst deaktiviert, um unpassende Produkte zu vermeiden. Das soll nicht aus Versehen rückgängig gemacht werden.

Wenn später ein Feed-Import wieder gewünscht ist:
1. Zweck und gewünschte Produktmenge klären.
2. Feed-URL bzw. Feed-Liste über Awin beziehen und Zugangsdaten nur als GitHub Secrets speichern, niemals in products.json, README oder Quellcode.
3. Join-Status, Advertiser-ID, Domain, Preise und Verfügbarkeit anhand der Feedfelder validieren.
4. Nur gewünschte Marken/Kategorien/Advertiser zulassen; keine pauschale Übernahme aller Produkte.
5. Regeln für Duplikate, Preisupdates, Ausverkauf, alte manuelle Datensätze und fehlende Bilder vorab festlegen.
6. Dry-Run oder Testdatei erstellen, die Änderungen als Diff prüfen, dann erst veröffentlichen.
7. Update begrenzen und Fehler protokollieren; einen fehlgeschlagenen Feed nicht als leere Produktliste veröffentlichen.
8. Anschließend Sitemaps aktualisieren und die Website testen.
9. Workflow und README synchron halten.

Der Importer darf keine geheimen Zugangsdaten ausgeben. Bei Feed-URLs mit Token gilt: als geheim behandeln, nicht in Chat- oder Commit-Inhalt wiederholen, falls sie einen Zugriff ermöglichen.

## 8. Änderungen an Design, Funktionen und Website-Texten

### Design
- Vorhandenes dunkles/helles Theme und responsives Layout berücksichtigen.
- Kleine und gezielte CSS-Änderungen bevorzugen.
- Desktop- und Mobilansicht testen.
- Keine Inhalte, Links oder Funktionen still entfernen, nur um eine visuelle Änderung zu erreichen.
- Animationen, reduzierte Bewegung, Bedienbarkeit per Tastatur und Lesbarkeit nicht ignorieren.

### JavaScript und Produktdarstellung
- app.js ist für die Liste/Filter/Suche zuständig; product.js rendert den generischen Produktdetail-Datensatz.
- Das Preisformat im aktuellen Code ist fest Euro.
- Produktlinks auf der Karte führen zunächst auf product.html?id=…; der externe Händlerlink liegt auf der Detailseite.
- Affiliate-Link-Buttons sind mit dem sponsored-Rel-Attribut versehen. Neue externe Affiliate-Links sollen ebenfalls semantisch korrekt als gesponserte Links gekennzeichnet sein.
- HTML-Ausgaben müssen korrekt escaped sein; keine rohen, fremden Produkttexte unkontrolliert in HTML einsetzen.
- Beim Umbau vorhandene Suche, Sortierung, Merkliste, verwandte Produkte, Galerie, Mobilmenü, Theme und Ladefehlerzustände erhalten oder bewusst ändern.

### Marken- und Händlerstreifen
Der Code enthält auch Begriffe wie adidas, PUMA, Samsung, Apple, Zalando, OTTO und REWE in einer statischen Liste. Diese Liste ist kein Beweis dafür, dass die jeweilige Partnerschaft aktuell genehmigt oder ein Produkt der Marke im Katalog vorhanden ist. Zukünftige Aussagen über verfügbare Händler oder aktive Programme nur auf aktuelle Daten stützen.

### SEO
- Seitentitel und Description sollten den echten Inhalt beschreiben.
- Bei Produkten, die hinzukommen/wegfallen, sitemap.xml und sitemap.txt pflegen.
- Prüfen, ob neue bzw. geänderte URLs aufrufbar sind und nicht 404 zurückgeben.
- Keine nicht existierenden Marken, Produkte oder Programmfreigaben für SEO behaupten.
- Nach technischen Änderungen prüfen, ob interne Links, Metadaten und Rechtliches weiterhin erreichbar sind.

## 9. Impressum, Datenschutz und geschäftliche Hinweise

Aktuell liegen impressum.html und datenschutz.html im Repository, beide markieren sich aber selbst als **Entwurf**. Im Impressum stehen Platzhalter für den vollständigen rechtlichen Namen, die Anschrift und E-Mail. Die Datenschutzerklärung weist ebenfalls auf fehlende Betreiberangaben und eine noch zu prüfende Beschreibung der Datenflüsse hin. Diese Seiten dürfen nicht fälschlich als fertig oder rechtlich geprüft beschrieben werden.

Bei Änderungen an diesen Seiten:
- tatsächliche Betreiberinformationen einsetzen – niemals Namen, Anschrift, Telefonnummer, Steuerdaten oder andere Pflichtangaben erfinden;
- alle genutzten Dienste und Datenflüsse prüfen (GitHub Pages, externe Produktbilder, localStorage/Merkliste, Affiliate-Link-Weiterleitung, gegebenenfalls später Analyse/Marketing);
- nicht behaupten, ein Cookie, Tracking-Script oder Dienst werde verwendet, wenn der Code ihn nicht verwendet; ebenso keine verwendeten Dienste verschweigen;
- bei neuen Analyse-, Werbe-, Cookie- oder Trackingtechniken die Datenschutztexte und erforderliche Einwilligungs-/Informationsmechanik neu bewerten;
- bei rechtlicher Unsicherheit kenntlich machen, was noch zu prüfen ist, und bei geschäftlichem Einsatz fachkundige Beratung empfehlen.

Rechtsquellen/Referenzen:
- § 5 DDG (Anbieterinformationen): https://www.gesetze-im-internet.de/ddg/__5.html
- § 11 PAngV (Preisermäßigungen): https://www.gesetze-im-internet.de/pangv_2022/__11.html
- § 25 TDDDG (Zugriff/Speicherung auf Endgeräten): https://www.gesetze-im-internet.de/ttdsg/__25.html
- Awin Publisher-Bedingungen: https://www.awin.com/de/publisher-terms
- Awin Datenschutz: https://www.awin.com/de/datenschutzerklarung

Das ist ein Arbeitsablauf, keine verbindliche Rechtsberatung. Bei Rechtsänderungen oder einem geschäftlichen Start die aktuelle Gesetzesfassung und die konkrete Situation erneut prüfen.

## 10. Qualitätskontrolle vor jedem Produkt-Commit

### Daten
- [ ] products.json lässt sich als gültiges JSON parsen.
- [ ] Jede id ist eindeutig, nicht leer und stabil.
- [ ] Preis ist eine positive Zahl in der erwarteten Währung.
- [ ] oldPrice ist optional; wenn vorhanden, größer als price und belegt.
- [ ] badge passt mathematisch zum Preisvergleich und ist nicht unbelegt.
- [ ] Beschreibung und Highlights beziehen sich auf genau dieses Modell.
- [ ] Kategorie, Marke und merchant sind korrekt.
- [ ] productUrl führt auf die passende offizielle Produktseite.
- [ ] Affiliate-URL ist vorhanden und nicht einfach versehentlich die normale Produkt-URL.
- [ ] AID und Publisher-ID passen zum aktuellen Awin-Programm.
- [ ] Ziel-URL im Affiliate-Link stimmt mit der Produktseite überein.
- [ ] Domain-/Unterdomain- und Trackingfragen sind geklärt oder als offene Punkte dokumentiert.
- [ ] Hauptbild lädt und zeigt das richtige Modell; Galerie-Bilder sind korrekt und eindeutig.
- [ ] Es gibt keine unbeabsichtigten doppelten Modelle/Datensätze.

### Sitemaps und Website
- [ ] sitemap.xml enthält den neuen Produktlink mit der exakten ID.
- [ ] sitemap.txt enthält denselben neuen Link.
- [ ] Bestehende Produkte und Rechteseiten sind weiter enthalten.
- [ ] Startseite lädt products.json; Produktanzahl und Händler-/Kategorie-Zähler passen zum tatsächlichen Katalog.
- [ ] Produktkarte öffnet die richtige Detailseite.
- [ ] Name, Bild, Beschreibung, Preis, Vergleichspreis, Badge und Highlights erscheinen richtig.
- [ ] Der Händlerknopf zeigt auf den Affiliate-Link.
- [ ] Affiliate-Hinweis bleibt sichtbar und sachlich richtig.
- [ ] Handy-Ansicht funktioniert, Bilder brechen das Layout nicht.
- [ ] Keine offensichtlichen JavaScript-/JSON-Fehler nach der Änderung.
- [ ] Die Startseite und mindestens eine betroffene Produktdetailseite wurden live überprüft, soweit möglich.

### Tracking
- [ ] Link leitet auf die erwartete Produktseite weiter.
- [ ] Der finale Host entspricht den aktuell erlaubten Domains.
- [ ] Klickreferenz ist eindeutig, sofern genutzt.
- [ ] Ein Weiterleitungs-Erfolg wird nicht als bestätigter Sale-Nachweis ausgegeben.
- [ ] Bei unbestätigter Attribution steht ausdrücklich, dass Tracking nicht verifiziert ist.

## 11. Qualitätskontrolle vor einem Website-/Code-Commit

- Betroffene Quell-Dateien vollständig lesen, bevor sie geändert werden.
- Nach Änderungen auf fehlende Element-IDs, falsche CSS-Selektoren und JavaScript-Fehler prüfen.
- Responsives Verhalten überprüfen.
- Keine ungeprüften Änderungen an SEO-Verifikationstoken, Impressum, Datenschutz oder Affiliate-Hinweisen vornehmen.
- Wenn ein Skript Daten neu schreibt, prüfen, ob es vorhandene manuelle Produktfelder, Bilder oder Links überschreibt.
- Wenn ein Workflow erstellt oder verändert wird, tatsächliche Trigger, Berechtigungen, Secrets, Update-Logik, Fehlerszenarien und Rollback prüfen.
- README-Kommentare aktualisieren, wenn sich der tatsächliche Workflow ändert.
- Nicht allein den grünen Workflow-Status als Beleg für richtige Produktdaten verwenden.

## 12. Vorgehen bei Fehlern

### Produkt erscheint nicht
1. Prüfen, ob products.json gültig ist und das Produkt im products-Array existiert.
2. Prüfen, ob id gefüllt und eindeutig ist.
3. Prüfen, ob die Website die richtige Datei lädt und kein alter Cache verwendet wird.
4. Prüfen, ob app.js bzw. product.js Fehler abfängt oder Daten nicht findet.
5. Prüfen, ob die Produkt-URL in der Sitemap vorhanden ist, falls die Sichtbarkeit/Indexierung das Problem ist.

### Produktdetailseite meldet „Produkt nicht gefunden“
- URL-Parameter id exakt mit product.id vergleichen; Groß-/Kleinschreibung und Bindestriche beachten.
- Nach ID-Änderungen die internen Verweise und beide Sitemaps prüfen.

### Bild fehlt
- Direkte Bild-URL prüfen, nicht nur die Produktseite.
- Offizielle Quelle und richtige Modellvariante prüfen.
- images und image prüfen; leere Galerie ist kein Problem, wenn image valide ist.
- Das bestehende Resolve-Missing-Images-Skript greift nach aktuellem Stand nur für fehlende Bilder auf eu.inmotionworld.com; es repariert keine falschen oder veralteten, bereits vorhandenen Bilder und ist keine universelle Bildsuche.

### Affiliate-Link funktioniert scheinbar, aber Attribution ist unklar
- Zuerst AID, PID, Ziel-URL und finale Landing-Domain prüfen.
- Link Builder und Programmbedingungen verwenden.
- Awin-Programmstatus und erlaubte Domains neu abrufen.
- Klick-/Transaktionsdaten bzw. Awin-Support zur Bestätigung verwenden.
- Bis dahin nur sagen, dass der Link vorhanden ist oder weiterleitet, nicht dass Provisionen garantiert werden.

### Website-Änderung ist im GitHub-Repository, aber nicht live
- Commit auf dem richtigen Branch prüfen.
- GitHub-Pages-Einstellungen bzw. Veröffentlichungsstatus und aktuelle Actions-Logs prüfen.
- Nach kurzer Wartezeit erneut aufrufen; Browser-Cache ausschließen.
- Falls Veröffentlichung weiterhin aussteht, den tatsächlichen Status nennen und nicht behaupten, die Live-Seite sei aktualisiert.

## 13. GitHub und Versionskontrolle

- Vor jeder Schreiboperation aktuelle Datei und SHA lesen.
- Bei einer Aktualisierung immer die vollständige aktuelle Datei als Basis verwenden, nicht nur ein altes Fragment neu abspeichern.
- Nicht dieselbe Datei parallel durch zwei Schreibvorgänge aktualisieren.
- Aussagekräftige Commit-Nachricht wählen, die den eigentlichen Umfang wiedergibt, etwa „Add verified INMOTION product entries“ oder „Correct affiliate target URL“.
- Nach dem Commit dessen SHA/URL prüfen und den tatsächlich geänderten Inhalt erneut abrufen.
- Große oder riskante Architekturänderungen nicht stillschweigend im selben Commit mit Produktupdates kombinieren.
- Keine Tokens, Feed-URLs mit Zugriffsschlüssel oder andere Geheimnisse committen.
- Eine Änderung am Repository und die erfolgreiche Veröffentlichung bei GitHub Pages sind getrennte Dinge; beide Status separat bestätigen.

GitHub-Pages-Dokumentation: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## 14. Antwortformat nach erledigter Arbeit

Die Abschlussantwort soll präzise sein und in der Regel enthalten:
1. **Ergebnis:** was hinzugefügt, entfernt oder repariert wurde.
2. **Umfang:** Anzahl betroffener Produkte/Dateien oder konkrete Funktion.
3. **Prüfung:** welche Daten bzw. Links geprüft wurden und welche Tests tatsächlich liefen.
4. **Commit:** direkter Link zur Änderung, sofern verfügbar.
5. **Live-Status:** live bestätigt, wartet auf Veröffentlichung oder nicht prüfbar.
6. **Offene Punkte:** ausschließlich echte, wichtige Einschränkungen wie ungeklärte Awin-Attribution oder fehlende offizielle Preisinformationen.

Nicht mit langen Vorreden antworten, wenn die Arbeit bereits erledigt werden kann. Keine falsche Sicherheit. Keine Erfolgsmeldung ohne sichtbaren Beleg. Wenn etwas blockiert, den konkreten technischen oder sachlichen Grund nennen und die bereits möglichen Teile trotzdem erledigen.

## 15. Aktuelle bekannte Baustellen zum Startpunkt dieses Handbuchs

Diese Punkte sind bei der nächsten passenden Anfrage erneut zu prüfen; es ist nicht automatisch der Auftrag, sie alle sofort umzubauen:

1. Das README behauptet einen Sechs-Stunden-Import, der tatsächliche Workflow führt keinen automatischen Awin-Import aus. Dokumentation und Realität müssen bei einer passenden Wartungsaufgabe angeglichen werden.
2. Impressum und Datenschutz sind als Entwürfe gekennzeichnet und enthalten Betreiber-Platzhalter. Vor dem regulären geschäftlichen Betrieb müssen diese Angaben nach den tatsächlichen Verhältnissen vollständig und korrekt sein.
3. INMOTION-Produkte verlinken auf eu.inmotionworld.com, während die zuletzt ausgelesenen Programmdaten nur inmotionworld.com als gültige Domain aufführten. Die Tracking-Zuordnung darf daher nicht als bestätigt dargestellt werden, bis aktuelle Programmdaten oder Awin das bestätigen.
4. Einige Produkte haben keinen oldPrice/Badge. Das ist in Ordnung, solange keine belastbare Vergleichspreisangabe vorhanden ist; nicht künstlich ergänzen.
5. Der aktuelle Katalog enthält 34 Datensätze, 22 NAVEE und 12 INMOTION. Das ist nur der gemessene Stand und muss vor späteren Änderungen frisch abgerufen werden.
6. Der Produktstreifen im Website-Code enthält statische Markenbegriffe, die nicht automatisch aktive Awin-Partnerschaften belegen.
7. Ein Eintrag nutzt einen tidd.ly-Kurzlink. Bei einer allgemeinen Trackingprüfung ist dessen endgültiges Ziel gesondert zu verifizieren, statt alle Einträge als gleich aufgebaut anzunehmen.

## 16. Verlässliche Referenzen

- Awin – Aufbau von Affiliate-Links: https://success.awin.com/articles/en_US/Knowledge/What-does-an-affiliate-link-look-like
- Awin – Tracking-Link erstellen: https://help.awin.com/advertisers/docs/de/create-a-tracking-link-for-partners
- Awin – Product Feed Publisher Guide: https://help.awin.com/developers/docs/product-feed-publisher-guide-intro
- Awin – Publisher-FAQ zu Produktfeeds und Programmen: https://help.awin.com/developers/docs/faqs-for-publishers
- Awin – Publisher-Bedingungen: https://www.awin.com/de/publisher-terms
- GitHub Pages – Website erstellen und veröffentlichen: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- Deutschland – § 5 DDG: https://www.gesetze-im-internet.de/ddg/__5.html
- Deutschland – § 11 PAngV: https://www.gesetze-im-internet.de/pangv_2022/__11.html
- Deutschland – § 25 TDDDG: https://www.gesetze-im-internet.de/ttdsg/__25.html

**Kernregel für künftige Awin-Deals-Aufgaben:** erst den aktuellen Zustand lesen, dann offizielle Quellen prüfen, anschließend gezielt ändern, alle abhängigen Daten/Sitemaps berücksichtigen, prüfen und ehrlich berichten. Nie raten, nie unnötig blockieren und niemals ungeprüfte Annahmen als bestätigte Fakten ausgeben.
