# Awin Deals

Moderne öffentliche Produkt- und Affiliate-Deal-Seite für GitHub Pages.

## Features
- responsives Shop-Design
- Suche und Kategorien
- Sortierung
- Produktkarten mit Bild, Preis, Händler und Awin-Link
- eigene Produktdetailseite für jedes Produkt
- Bildergalerie mit Thumbnails, Pfeilen und Wischen/Drag
- Merkliste mit localStorage
- zentrale Produktverwaltung über products.json

## Produkt hinzufügen
Jedes Produkt bekommt automatisch eine eigene Detailseite über seine id.

```json
{
  "id": "produkt-001",
  "name": "Produktname",
  "merchant": "Shopname",
  "category": "Technik",
  "price": 99.99,
  "oldPrice": 129.99,
  "badge": "-23%",
  "image": "https://example.com/bild.jpg",
  "images": [
    "https://example.com/bild.jpg",
    "https://example.com/bild-2.jpg",
    "https://example.com/bild-3.jpg"
  ],
  "description": "Kurze Beschreibung.",
  "affiliateUrl": "DEIN-AWIN-AFFILIATE-LINK",
  "productUrl": "NORMALE-PRODUKTSEITE-BEIM-HÄNDLER",
  "highlights": [
    "Highlight 1",
    "Highlight 2"
  ]
}
```

images ist die Bildergalerie. Wenn keine Galerie vorhanden ist, verwendet die Detailseite automatisch image.

Affiliate-Links können Provisionen erzeugen. Preise und Verfügbarkeit bestimmt der jeweilige Händler.

## Automatischer Awin-Produktimport

Das Repository enthält einen automatisierten Importer unter `scripts/import-awin.mjs`.

Der Importer kann Awin-Produktfeeds als CSV, JSON oder JSONL verarbeiten und übernimmt unter anderem:

- Awin-Deep-Link als `affiliateUrl`
- Händler-Produktseite als `productUrl`
- Produktname, Marke, Kategorie und Beschreibung
- aktuellen Preis und – falls vorhanden – alten Preis
- Rabattprozent
- Hauptbild und weitere Bilder
- verfügbare Produkt-Highlights
- Duplikaterkennung und Validierung
- automatische Aktualisierung vorhandener Feed-Produkte

### Automatische Feed-Liste

Der Importer kann statt einzelner Produktfeed-URLs die von Awin bereitgestellte **Produkt-Feed-Liste** einlesen. Dadurch werden die darin aufgeführten Produktfeeds automatisch gefunden und bei jedem Lauf erneut geladen.

Standardmäßig werden nur Feeds von Advertisern übernommen, bei denen der Publisher den Status **Joined/Beigetreten** hat. Mit `AWIN_INCLUDE_NOT_JOINED=true` kann dieses Verhalten bewusst erweitert werden.

### GitHub Actions einrichten

Der Workflow `.github/workflows/import-awin-products.yml` läuft automatisch alle 6 Stunden und kann zusätzlich manuell gestartet werden.

In GitHub unter **Settings → Secrets and variables → Actions** ein Secret namens `AWIN_FEED_LIST_URLS` anlegen. Darin kommt die vollständige Awin-Feed-Listen-URL hinein. Mehrere Feed-Listen können zeilenweise angegeben werden.

Direkte Produktfeed-URLs bleiben als Fallback über das Secret `AWIN_PRODUCT_FEED_URLS` unterstützt.

Awin beschreibt den Product Feed List Download als automatisierbaren Download einer Liste der verfügbaren Feeds inklusive Download-URL und Membership-Status. Produktfeeds enthalten unter anderem Produktnamen, Preise, Bilder und Awin-Deep-Links.

Der Workflow übernimmt standardmäßig maximal **1.000 Produkte pro Importlauf**. Das Limit kann später erhöht werden; bei sehr großen Katalogen sollte die Darstellung auf der Startseite zusätzlich schrittweise geladen werden.

Wichtig: Die Feed-Listen-URL enthält einen Feed-Zugriffsschlüssel und gehört deshalb nicht in `products.json` oder in den Quellcode, sondern in GitHub Secrets.
