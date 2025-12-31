# Sektgut Profit Planner

**by Hannes Pix**

Ein webbasiertes Kalkulationstool zur Analyse der Wirtschaftlichkeit einer Sektgut-Selbständigkeit. Planen Sie Ihre Profitabilität mit präzisen Berechnungen und visuellen Analysen.

## Features

- ✅ **Komplexe Berechnungen** mit einfacher, moderner Benutzeroberfläche
- ✅ **Kostenkategorien**:
  - Persönliche Kosten (Sozialversicherungen, Lebenshaltungskosten)
  - Produktionskosten (Grundwein, Verarbeitung, Transport, Versektung)
  - Betriebskosten (Webserver, Onlineshop, Marketing)
  - Zeitaufwand
- ✅ **Berechnungen**:
  - Break-Even-Punkt
  - Gewinnschwellen-Analyse
  - Stundenlohn-Berechnung
  - Optimale Produktionsmenge (Sweet Spot)
  - Kostenverteilung
- ✅ **Visualisierungen**:
  - Dashboard mit Key Metrics
  - Kostenverteilungs-Diagramm
  - Break-Even-Diagramm
  - Gewinnschwellen-Charts
  - Produktions-Flowchart
  - Kanban-Board für Projektplanung
- ✅ **Daten-Persistenz**: Automatische Speicherung im Browser (localStorage)
- ✅ **Responsive Design**: Funktioniert auf Desktop, Tablet und Mobile

## Tech-Stack

- **Next.js 16** - React Framework mit App Router
- **TypeScript** - Type-Safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI-Komponenten
- **Recharts** - Chart-Bibliothek
- **React Hook Form** - Formular-Handling
- **Zod** - Schema-Validierung

## Installation

### Voraussetzungen

- Node.js 18+ und npm

### Setup

1. Abhängigkeiten installieren:
```bash
npm install
```

2. Entwicklungsserver starten:
```bash
npm run dev
```

3. Im Browser öffnen: [http://localhost:3000](http://localhost:3000)

## Deployment

### Lokal (Production)

```bash
npm run build
npm start
```

### Statischer Export

Das Projekt kann als statische Website exportiert werden:

```bash
npm run build
```

Die generierten Dateien befinden sich im `out/` Ordner und können auf jeden Webserver hochgeladen werden.

### Vercel (Empfohlen)

1. Projekt auf GitHub pushen
2. Auf [vercel.com](https://vercel.com) anmelden
3. Projekt importieren
4. Automatisches Deployment

### Netlify

1. Projekt auf GitHub pushen
2. Auf [netlify.com](https://netlify.com) anmelden
3. Projekt importieren
4. Build-Kommando: `npm run build`
5. Publish-Directory: `out`

### Eigener Server

Für einen eigenen Server mit Node.js:

```bash
npm run build
npm start
```

Die App läuft dann auf Port 3000 (oder dem in der Umgebungsvariable `PORT` angegebenen Port).

## Verwendung

1. **Eingaben**: Wechseln Sie zum "Eingaben"-Tab und füllen Sie alle Kostenkategorien aus:
   - Persönliche Kosten
   - Produktionskosten
   - Betriebskosten
   - Zeitaufwand
   - Verkaufsparameter

2. **Dashboard**: Wechseln Sie zum "Dashboard"-Tab, um die Berechnungsergebnisse zu sehen:
   - Key Metrics (Gewinn, Stundenlohn, Break-Even)
   - Gewinnschwellen-Analyse
   - Break-Even-Diagramm
   - Kostenverteilung
   - Optimale Produktionsmenge
   - Projekt-Diagramme

3. **Automatisches Speichern**: Alle Eingaben werden automatisch im Browser gespeichert.

## Projektstruktur

```
sektgut-profit-planner/
├── app/
│   ├── layout.tsx          # Root Layout
│   ├── page.tsx             # Hauptseite
│   └── globals.css          # Globale Styles
├── components/
│   ├── forms/               # Formular-Komponenten
│   ├── charts/              # Chart-Komponenten
│   ├── dashboard/           # Dashboard-Komponenten
│   ├── diagrams/            # Projekt-Diagramme
│   └── ui/                  # shadcn/ui Komponenten
├── lib/
│   ├── types.ts             # TypeScript-Typen
│   ├── calculations.ts      # Berechnungslogik
│   └── storage.ts           # localStorage-Helpers
└── public/                  # Statische Dateien
```

## Berechnungslogik

### Break-Even-Punkt
```
Break-Even (Flaschen) = Fixkosten / (Verkaufspreis - Variable Kosten pro Flasche)
```

### Gewinnschwellen
```
Benötigter Umsatz = (Fixkosten + Zielgewinn) / (Deckungsbeitrag / Verkaufspreis)
```

### Stundenlohn
```
Stundenlohn = (Gewinn - Lebenshaltungskosten) / Arbeitsstunden pro Monat
```

### Optimale Produktionsmenge
Die optimale Produktionsmenge wird durch eine iterative Suche ermittelt, die den Gewinn bei verschiedenen Produktionsmengen maximiert.

## Anpassungen

### Standardwerte ändern

Die Standardwerte können in `lib/storage.ts` in der Funktion `createDefaultData()` angepasst werden.

### Berechnungen anpassen

Die Berechnungslogik befindet sich in `lib/calculations.ts` und kann nach Bedarf angepasst werden.

## Lizenz

Dieses Projekt ist für den persönlichen Gebrauch erstellt worden.

## Support

Bei Fragen oder Problemen können Sie:
- Die Dokumentation in `PLAN.md` lesen
- Die Code-Kommentare in den Dateien überprüfen
- Issues im Repository erstellen (falls vorhanden)
