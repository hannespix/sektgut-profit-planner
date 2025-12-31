'use client';

import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import type { CalculationData, CalculationResults } from '@/lib/types';
import jsPDF from 'jspdf';

interface PDFExportProps {
  data: CalculationData;
  results: CalculationResults;
}

export default function PDFExport({ data, results }: PDFExportProps) {
  const handleExport = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Sektgut Kalkulation - Report', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, yPos);
    yPos += 15;

    // Grunddaten
    doc.setFontSize(16);
    doc.text('Grunddaten', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    const basicData = [
      `Jahresproduktion: ${results.numberOfBottles} Flaschen (${results.productionVolumePerYear.toFixed(2)} Liter)`,
      `Verkaufspreis Privatkunden: ${results.pricePerBottlePrivate.toFixed(2)} €/Flasche`,
      `Verkaufspreis Geschäftskunden: ${results.pricePerBottleBusiness.toFixed(2)} €/Flasche`,
      `Durchschnittspreis: ${results.averagePricePerBottle.toFixed(2)} €/Flasche`,
      `Kosten pro Flasche: ${results.costPerBottle.toFixed(2)} €`,
    ];

    basicData.forEach((line) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 25, yPos);
      yPos += 6;
    });

    yPos += 5;

    // Finanzübersicht
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text('Finanzübersicht (pro Jahr)', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    const financialData = [
      `Gesamtumsatz: ${results.totalRevenue.toFixed(2)} €`,
      `  - Privatkunden: ${results.revenuePrivate.toFixed(2)} €`,
      `  - Geschäftskunden: ${results.revenueBusiness.toFixed(2)} €`,
      `Gesamtkosten: ${results.totalCostsPerYear.toFixed(2)} €`,
      `  - Fixkosten: ${results.fixedCostsPerYear.toFixed(2)} €`,
      `  - Variable Kosten: ${(results.numberOfBottles * results.variableCostsPerBottle).toFixed(2)} €`,
      `Bruttogewinn: ${results.grossProfit.toFixed(2)} €`,
      `Steuern: ${results.totalTaxes.toFixed(2)} €`,
      `  - Umsatzsteuer: ${results.vatAmount.toFixed(2)} €`,
      `  - Sektsteuer: ${results.sektTaxAmount.toFixed(2)} €`,
      `  - Einkommenssteuer: ${results.incomeTaxAmount.toFixed(2)} €`,
      `Reingewinn: ${results.netProfit.toFixed(2)} €`,
      `Gewinnmarge: ${profitMargin.toFixed(1)}%`,
    ];

    financialData.forEach((line) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 25, yPos);
      yPos += 6;
    });

    yPos += 5;

    // Break-Even
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text('Break-Even-Analyse', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    const breakEvenData = [
      `Break-Even-Punkt: ${Math.ceil(results.breakEvenBottles)} Flaschen`,
      `Break-Even-Umsatz: ${results.breakEvenRevenue.toFixed(2)} €`,
    ];

    if (results.breakEvenTime) {
      if (results.breakEvenTime.year !== Infinity) {
        breakEvenData.push(`Break-Even erreicht: ${results.breakEvenTime.description}`);
      } else {
        breakEvenData.push(`Break-Even: ${results.breakEvenTime.description}`);
      }
    }

    breakEvenData.forEach((line) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 25, yPos);
      yPos += 6;
    });

    yPos += 5;

    // Weitere Kennzahlen
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text('Weitere Kennzahlen', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    const otherMetrics = [
      `Stundenlohn: ${results.hourlyWage.toFixed(2)} €/h`,
      `Optimale Produktionsmenge: ${results.optimalProductionVolume} Flaschen`,
      `Gewinn bei optimaler Menge: ${results.profitAtOptimalVolume.toFixed(2)} €/Monat`,
    ];

    otherMetrics.forEach((line) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 25, yPos);
      yPos += 6;
    });

    // Speichern
    doc.save(`sektgut-kalkulation-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const profitMargin = results.totalRevenue > 0 
    ? (results.netProfit / results.totalRevenue) * 100 
    : 0;

  return (
    <Button onClick={handleExport} variant="outline">
      <FileDown className="h-4 w-4 mr-2" />
      PDF exportieren
    </Button>
  );
}
