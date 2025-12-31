'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import type { CalculationData, CalculationResults } from '@/lib/types';

interface CalculationExplanationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  value: number;
  data: CalculationData;
  results: CalculationResults;
}

export default function CalculationExplanation({
  open,
  onOpenChange,
  type,
  value,
  data,
  results,
}: CalculationExplanationProps) {
  const explanations: Record<string, { title: string; formula: string; explanation: string; steps: string[] }> = {
    netProfit: {
      title: 'Reingewinn (nach Steuern)',
      formula: 'Reingewinn = Bruttogewinn - Gesamtsteuern',
      explanation: 'Der Reingewinn ist der Gewinn nach Abzug aller Steuern (Umsatzsteuer, Sektsteuer, Einkommenssteuer).',
      steps: [
        `Gesamtumsatz: ${results.totalRevenue.toFixed(2)} €`,
        `Gesamtkosten: ${results.totalCostsPerYear.toFixed(2)} €`,
        `Bruttogewinn: ${results.grossProfit.toFixed(2)} €`,
        ``,
        `Steuerberechnung:`,
        `Umsatzsteuer (${data.salesParameters.vatRate}%): ${results.vatAmount.toFixed(2)} €`,
        `Sektsteuer (${data.salesParameters.sektTaxPerLiter} €/Liter): ${results.sektTaxAmount.toFixed(2)} €`,
        `Einkommenssteuer (${data.salesParameters.incomeTaxRate}%): ${results.incomeTaxAmount.toFixed(2)} €`,
        `Gesamtsteuern: ${results.totalTaxes.toFixed(2)} €`,
        ``,
        `Reingewinn = ${results.grossProfit.toFixed(2)} € - ${results.totalTaxes.toFixed(2)} € = ${results.netProfit.toFixed(2)} €`,
        `Reingewinn pro Monat = ${results.netProfit.toFixed(2)} € / 12 = ${results.netProfitPerMonth.toFixed(2)} €`,
      ],
    },
    grossProfit: {
      title: 'Bruttogewinn (vor Steuern)',
      formula: 'Bruttogewinn = Gesamtumsatz - Gesamtkosten',
      explanation: 'Der Bruttogewinn ist der Gewinn vor Abzug der Steuern.',
      steps: [
        `Gesamtumsatz: ${results.totalRevenue.toFixed(2)} €`,
        `  - Umsatz Privatkunden: ${results.revenuePrivate.toFixed(2)} €`,
        `  - Umsatz Geschäftskunden: ${results.revenueBusiness.toFixed(2)} €`,
        ``,
        `Gesamtkosten: ${results.totalCostsPerYear.toFixed(2)} €`,
        `  - Fixkosten: ${results.fixedCostsPerYear.toFixed(2)} €`,
        `  - Variable Kosten: ${(results.numberOfBottles * results.variableCostsPerBottle).toFixed(2)} €`,
        ``,
        `Bruttogewinn = ${results.totalRevenue.toFixed(2)} € - ${results.totalCostsPerYear.toFixed(2)} € = ${results.grossProfit.toFixed(2)} €`,
      ],
    },
    totalRevenue: {
      title: 'Gesamtumsatz',
      formula: 'Gesamtumsatz = Umsatz Privatkunden + Umsatz Geschäftskunden',
      explanation: 'Der Gesamtumsatz setzt sich aus den Umsätzen von Privat- und Geschäftskunden zusammen.',
      steps: [
        `Anzahl Flaschen: ${results.numberOfBottles}`,
        `Preis Privatkunden: ${results.pricePerBottlePrivate.toFixed(2)} €/Flasche`,
        `Preis Geschäftskunden: ${results.pricePerBottleBusiness.toFixed(2)} €/Flasche`,
        `Privatkundenanteil: ${((1 - (data.salesParameters.businessCustomerShare || 0) / 100) * 100).toFixed(1)}%`,
        `Geschäftskundenanteil: ${(data.salesParameters.businessCustomerShare || 0).toFixed(1)}%`,
        `Flaschen Privatkunden: ${Math.round(results.numberOfBottles * (1 - (data.salesParameters.businessCustomerShare || 0) / 100))}`,
        `Flaschen Geschäftskunden: ${Math.round(results.numberOfBottles * (data.salesParameters.businessCustomerShare || 0) / 100)}`,
        `Umsatz Privatkunden: ${Math.round(results.numberOfBottles * (1 - (data.salesParameters.businessCustomerShare || 0) / 100))} × ${results.pricePerBottlePrivate.toFixed(2)} € = ${results.revenuePrivate.toFixed(2)} €`,
        `Umsatz Geschäftskunden: ${Math.round(results.numberOfBottles * (data.salesParameters.businessCustomerShare || 0) / 100)} × ${results.pricePerBottleBusiness.toFixed(2)} € = ${results.revenueBusiness.toFixed(2)} €`,
        `Gesamtumsatz = ${results.revenuePrivate.toFixed(2)} € + ${results.revenueBusiness.toFixed(2)} € = ${results.totalRevenue.toFixed(2)} €`,
      ],
    },
    revenuePerMonth: {
      title: 'Monatlicher Umsatz',
      formula: 'Monatlicher Umsatz = Gesamtumsatz / 12',
      explanation: 'Der monatliche Umsatz ist der Gesamtumsatz geteilt durch 12 Monate.',
      steps: [
        `Gesamtumsatz pro Jahr: ${results.totalRevenue.toFixed(2)} €`,
        `Monatlicher Umsatz = ${results.totalRevenue.toFixed(2)} € / 12 = ${results.revenuePerMonth.toFixed(2)} €`,
      ],
    },
    totalCosts: {
      title: 'Gesamtkosten',
      formula: 'Gesamtkosten = Fixkosten + Variable Kosten',
      explanation: 'Die Gesamtkosten setzen sich aus Fixkosten (jährlich) und variablen Kosten (pro Flasche) zusammen.',
      steps: [
        `Fixkosten pro Monat: ${results.fixedCostsPerMonth.toFixed(2)} €`,
        `  - Sozialversicherungen: ${(data.personalCosts.healthInsurance + data.personalCosts.pensionInsurance + data.personalCosts.nursingInsurance + data.personalCosts.otherSocialInsurance).toFixed(2)} €`,
        `  - Betriebskosten: ${(data.operatingCosts.webServer + data.operatingCosts.onlineShop + data.operatingCosts.cms + data.operatingCosts.marketing + data.operatingCosts.office + data.operatingCosts.other).toFixed(2)} €`,
        `  - Sprungfixe Kosten: ${results.stepCosts.additionalCosts.toFixed(2)} €`,
        `Fixkosten pro Jahr: ${results.fixedCostsPerYear.toFixed(2)} €`,
        `Variable Kosten: ${results.numberOfBottles} Flaschen × ${results.variableCostsPerBottle.toFixed(2)} € = ${(results.numberOfBottles * results.variableCostsPerBottle).toFixed(2)} €`,
        `Gesamtkosten = ${results.fixedCostsPerYear.toFixed(2)} € + ${(results.numberOfBottles * results.variableCostsPerBottle).toFixed(2)} € = ${results.totalCostsPerYear.toFixed(2)} €`,
      ],
    },
    breakEven: {
      title: 'Break-Even-Punkt',
      formula: 'Break-Even = Fixkosten / (Verkaufspreis - Variable Kosten pro Flasche)',
      explanation: 'Der Break-Even-Punkt ist die Anzahl der Flaschen, die verkauft werden müssen, um alle Kosten zu decken. Ab diesem Punkt wird Gewinn erzielt.',
      steps: [
        `Fixkosten pro Jahr: ${results.fixedCostsPerYear.toFixed(2)} €`,
        `Verkaufspreis (Ø): ${results.averagePricePerBottle.toFixed(2)} €`,
        `Variable Kosten pro Flasche: ${results.variableCostsPerBottle.toFixed(2)} €`,
        `Deckungsbeitrag pro Flasche: ${(results.averagePricePerBottle - results.variableCostsPerBottle).toFixed(2)} €`,
        ``,
        `Break-Even = ${results.fixedCostsPerYear.toFixed(2)} € / ${(results.averagePricePerBottle - results.variableCostsPerBottle).toFixed(2)} € = ${results.breakEvenBottles.toFixed(2)} Flaschen`,
        `Break-Even (gerundet): ${Math.ceil(results.breakEvenBottles)} Flaschen`,
        `Break-Even-Umsatz: ${results.breakEvenRevenue.toFixed(2)} €`,
        ...(results.breakEvenTime && results.breakEvenTime.year !== Infinity ? [
          `Break-Even erreicht: ${results.breakEvenTime.description}`
        ] : results.breakEvenTime ? [
          `Break-Even: ${results.breakEvenTime.description}`
        ] : []),
      ],
    },
    hourlyWage: {
      title: 'Stundenlohn',
      formula: 'Stundenlohn = Reingewinn pro Monat / Produktive Stunden pro Monat',
      explanation: 'Der Stundenlohn zeigt, wie viel Netto-Gewinn pro produktiver Arbeitsstunde erzielt wird.',
      steps: [
        `Reingewinn pro Monat: ${results.netProfitPerMonth.toFixed(2)} €`,
        ``,
        `Berechnung produktive Stunden:`,
        `Max. Arbeitsstunden pro Woche: ${data.stepCostParameters.maxWorkingHoursPerWeek} h`,
        `Arbeitsstunden pro Jahr: ${data.stepCostParameters.maxWorkingHoursPerWeek * 52} h`,
        `Urlaubstage: ${data.timeInvestment.vacationDaysPerYear} Tage`,
        `Krankheitstage: ${data.timeInvestment.sickDaysPerYear} Tage`,
        `Feiertage: ${data.timeInvestment.publicHolidaysPerYear} Tage`,
        `Unproduktive Zeit: ${data.timeInvestment.productiveHoursPercentage ? (100 - data.timeInvestment.productiveHoursPercentage) : 20}%`,
        ``,
        `Verfügbare Stunden pro Jahr: ${(data.stepCostParameters.maxWorkingHoursPerWeek * 52).toFixed(1)} h`,
        `Produktive Stunden pro Jahr: ${((data.stepCostParameters.maxWorkingHoursPerWeek * 52) * (data.timeInvestment.productiveHoursPercentage || 80) / 100).toFixed(1)} h`,
        `Produktive Stunden pro Monat: ${(((data.stepCostParameters.maxWorkingHoursPerWeek * 52) * (data.timeInvestment.productiveHoursPercentage || 80) / 100) / 12).toFixed(1)} h`,
        ``,
        `Stundenlohn = ${results.netProfitPerMonth.toFixed(2)} € / ${(((data.stepCostParameters.maxWorkingHoursPerWeek * 52) * (data.timeInvestment.productiveHoursPercentage || 80) / 100) / 12).toFixed(1)} h = ${results.hourlyWage.toFixed(2)} €/h`,
      ],
    },
    costPerBottle: {
      title: 'Kosten pro Flasche',
      formula: 'Kosten pro Flasche = Produktionskosten + Versektungskosten',
      explanation: 'Die Kosten pro Flasche setzen sich aus den Produktionskosten (Grundwein, Verarbeitung, Transport) und den Versektungskosten (Abfüllung, Flasche, Etikett, etc.) zusammen.',
      steps: [
        `Grundwein: ${data.productionCosts.baseWinePerLiter.toFixed(2)} €/Liter`,
        `Verarbeitung: ${data.productionCosts.processingPerLiter.toFixed(2)} €/Liter`,
        `Transport: ${(data.productionCosts.transportPerLiterKm * data.productionCosts.averageTransportDistance).toFixed(2)} €/Liter`,
        `Produktionskosten pro Liter: ${(data.productionCosts.baseWinePerLiter + data.productionCosts.processingPerLiter + data.productionCosts.transportPerLiterKm * data.productionCosts.averageTransportDistance).toFixed(2)} €`,
        `Produktionskosten pro Flasche (0,75L): ${((data.productionCosts.baseWinePerLiter + data.productionCosts.processingPerLiter + data.productionCosts.transportPerLiterKm * data.productionCosts.averageTransportDistance) * 0.75).toFixed(2)} €`,
        ``,
        `Versektungskosten:`,
        `  - Abfüllung: ${data.productionCosts.bottling.filling.toFixed(2)} €`,
        `  - Degorierung: ${data.productionCosts.bottling.degorgement.toFixed(2)} €`,
        `  - Flasche: ${data.productionCosts.bottling.bottles.toFixed(2)} €`,
        `  - Etikett: ${data.productionCosts.bottling.labels.toFixed(2)} €`,
        `  - Korken: ${data.productionCosts.bottling.corks.toFixed(2)} €`,
        `  - Agraffen: ${data.productionCosts.bottling.agraffes.toFixed(2)} €`,
        `  - Sonstiges: ${data.productionCosts.bottling.otherPackaging.toFixed(2)} €`,
        `Gesamt Versektungskosten: ${(data.productionCosts.bottling.filling + data.productionCosts.bottling.degorgement + data.productionCosts.bottling.bottles + data.productionCosts.bottling.labels + data.productionCosts.bottling.corks + data.productionCosts.bottling.agraffes + data.productionCosts.bottling.otherPackaging).toFixed(2)} €`,
        ``,
        `Kosten pro Flasche = ${((data.productionCosts.baseWinePerLiter + data.productionCosts.processingPerLiter + data.productionCosts.transportPerLiterKm * data.productionCosts.averageTransportDistance) * 0.75) + (data.productionCosts.bottling.filling + data.productionCosts.bottling.degorgement + data.productionCosts.bottling.bottles + data.productionCosts.bottling.labels + data.productionCosts.bottling.corks + data.productionCosts.bottling.agraffes + data.productionCosts.bottling.otherPackaging).toFixed(2)} €`,
      ],
    },
    averagePrice: {
      title: 'Durchschnittlicher Verkaufspreis',
      formula: 'Ø Preis = (Preis Privat × Privatanteil) + (Preis Geschäft × Geschäftsanteil)',
      explanation: 'Der durchschnittliche Verkaufspreis ist der gewichtete Durchschnitt der Preise für Privat- und Geschäftskunden.',
      steps: [
        `Preis Privatkunden: ${results.pricePerBottlePrivate.toFixed(2)} €`,
        `Preis Geschäftskunden: ${results.pricePerBottleBusiness.toFixed(2)} €`,
        `Privatkundenanteil: ${((1 - (data.salesParameters.businessCustomerShare || 0) / 100) * 100).toFixed(1)}%`,
        `Geschäftskundenanteil: ${(data.salesParameters.businessCustomerShare || 0).toFixed(1)}%`,
        ``,
        `Ø Preis = ${results.pricePerBottlePrivate.toFixed(2)} € × ${((1 - (data.salesParameters.businessCustomerShare || 0) / 100) * 100).toFixed(1)}% + ${results.pricePerBottleBusiness.toFixed(2)} € × ${(data.salesParameters.businessCustomerShare || 0).toFixed(1)}%`,
        `Ø Preis = ${(results.pricePerBottlePrivate * (1 - (data.salesParameters.businessCustomerShare || 0) / 100)).toFixed(2)} € + ${(results.pricePerBottleBusiness * (data.salesParameters.businessCustomerShare || 0) / 100).toFixed(2)} € = ${results.averagePricePerBottle.toFixed(2)} €`,
      ],
    },
  };

  const explanation = explanations[type] || {
    title: 'Berechnung',
    formula: 'Wert',
    explanation: 'Keine Erklärung verfügbar.',
    steps: [],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{explanation.title}</DialogTitle>
          <DialogDescription>
            {explanation.explanation}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold">Formel:</p>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {explanation.formula}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold mb-2">Berechnungsschritte:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {explanation.steps.filter((step) => step && step.trim() !== '').map((step, index) => (
                    <li key={index} className={step.trim() === '' ? 'list-none' : 'text-muted-foreground'}>
                      {step.trim() === '' ? <br /> : step}
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
          <div className="text-center pt-2">
            <p className="text-2xl font-bold text-primary">
              Ergebnis: {formatValue(value, type)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatValue(value: number, type: string): string {
  if (type === 'hourlyWage') {
    return `${value.toFixed(2)} €/h`;
  }
  if (type === 'breakEven') {
    return `${Math.ceil(value)} Flaschen`;
  }
  if (type === 'averagePrice' || type === 'costPerBottle') {
    return `${value.toFixed(2)} €`;
  }
  return `${value.toFixed(2)} €`;
}
