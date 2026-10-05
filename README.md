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

Fehlerhafte oder nicht verfügbare Datensätze werden übersprungen. Wenn ein Feed beim Import ausfällt, bleiben die zuletzt funktionierenden Feed-Produkte erhalten, damit der Katalog nicht versehentlich geleert wird.

### GitHub Actions einrichten

Der Workflow `.github/workflows/import-awin-products.yml` läuft automatisch alle 6 Stunden und kann zusätzlich manuell gestartet werden.

In GitHub unter **Settings → Secrets and variables → Actions** ein Secret namens `AWIN_PRODUCT_FEED_URLS` anlegen. Darin kommen die vollständigen Awin-Produktfeed-Download-URLs hinein, eine URL pro Zeile.

Awin beschreibt Produktfeeds als aktuelle Produktdaten mit Preisen, Bildern und Awin-Deep-Links; für Publisher können die Feed-URLs über **Toolbox → Create-a-Feed** bzw. die Produktfeed-Funktionen bereitgestellt werden. citeturn217431search0turn217431search3turn217431search7

Der Workflow übernimmt standardmäßig maximal **1.000 Produkte pro Importlauf**. Das Limit kann später erhöht werden; bei sehr großen Katalogen sollte die Darstellung auf der Startseite zusätzlich schrittweise geladen werden.

Wichtig: Die Feed-Download-URL bzw. der dafür verwendete Schlüssel gehört nicht in `products.json` oder in den Quellcode, sondern ausschließlich in GitHub Secrets. Awin weist außerdem darauf hin, dass der Schlüssel für die Produktfeed-Liste vom normalen Partner-API-Schlüssel getrennt sein kann. citeturn217431search7turn217431search10
