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