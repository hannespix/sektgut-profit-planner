// TypeScript-Typen für das Sektgut-Kalkulationstool

export interface PersonalCosts {
  // Sozialversicherungen (monatlich in EUR) - betriebliche Kosten
  healthInsurance: number; // Krankenversicherung (Selbstständige)
  pensionInsurance: number; // Rentenversicherung (Selbstständige)
  nursingInsurance: number; // Pflegeversicherung (Selbstständige)
  otherSocialInsurance: number; // Sonstige Sozialversicherungen
  
  // Persönliche Referenzwerte (nicht in Betriebskosten enthalten)
  livingCosts: number; // Lebenshaltungskosten (nur als Referenz, wird vom Gewinn bezahlt)
  
  dynamicItems: DynamicCostItem[]; // Zusätzliche persönliche Kosten/Einnahmen
}

export interface ProductionCosts {
  // Grundwein (pro Liter in EUR)
  baseWinePerLiter: number;
  
  // Verarbeitung (pro Liter in EUR)
  processingPerLiter: number;
  
  // Transport (pro Liter/km in EUR)
  transportPerLiterKm: number;
  averageTransportDistance: number; // km
  
  // Versektungskosten (pro Flasche in EUR)
  bottling: {
    filling: number; // Füllung
    degorgement: number; // Degorierung
    bottles: number; // Flaschen
    labels: number; // Etiketten
    corks: number; // Korken
    agraffes: number; // Agraffen
    otherPackaging: number; // Sonstiges Verpackungsmaterial
  };
  dynamicItems: DynamicCostItem[]; // Zusätzliche Produktionskosten/Einnahmen
}

export interface OperatingCosts {
  // Betriebskosten (monatlich in EUR)
  webServer: number; // Webserver/Hosting
  onlineShop: number; // Onlineshop-System
  cms: number; // CMS
  marketing: number; // Marketing/Vermarktung
  office: number; // Büro/Infrastruktur
  other: number; // Sonstige Betriebskosten
  dynamicItems: DynamicCostItem[]; // Zusätzliche Betriebskosten/Einnahmen
}

export interface TimeInvestment {
  // Zeitaufwand pro Einheit
  minutesPerBottle: number; // Minuten pro Flasche (Produktion + Abfüllung)
  hoursPerOrder: number; // Stunden pro Bestellung (Bearbeitung, Versand, Verwaltung)
  hoursPerMarketing: number; // Stunden pro Marketing (pro Monat)
  
  // Verfügbare Arbeitszeit
  workingHoursPerWeek: number; // Arbeitsstunden pro Woche
  vacationDaysPerYear: number; // Urlaubstage pro Jahr
  sickDaysPerYear: number; // Krankheitstage pro Jahr
  publicHolidaysPerYear: number; // Feiertage pro Jahr
  
  // Produktivität
  productiveHoursPercentage: number; // Anteil produktiver Stunden (z.B. 80% = 20% für Admin, Meetings, etc.)
}

export interface StepCostParameters {
  // Mitarbeiter-Parameter
  employeeCostPerMonth: number; // Kosten pro zusätzlichem Mitarbeiter (€/Monat)
  maxWorkingHoursPerWeek: number; // Maximale verfügbare Arbeitsstunden pro Woche
  
  // Bestellungen
  ordersPerBottle: number; // Durchschnittliche Anzahl Bestellungen pro Flasche (z.B. 0.1 = 1 Bestellung pro 10 Flaschen)
}

export interface ProductVariant {
  id: string;
  name: string; // z.B. "Einfach", "Classic", "Premium"
  numberOfBottles: number; // Anzahl der produzierten Flaschen dieser Variante
  pricePerLiterPrivate: number; // Verkaufspreis pro Liter für Privatkunden (EUR)
  businessDiscountPercent: number; // Rabatt für Geschäftskunden (%)
  businessCustomerShare: number; // Geschäftskundenanteil dieser Variante (%)
  
  // Individuelle Gestehungskosten (optional, wenn nicht gesetzt werden Standardkosten verwendet)
  baseWinePerLiter?: number; // Einkaufspreis Grundwein pro Liter (EUR/Liter)
  processingPerLiter?: number; // Verarbeitungskosten pro Liter (EUR/Liter)
  transportPerLiterKm?: number; // Transportkosten pro Liter/km (EUR/Liter/km)
  averageTransportDistance?: number; // Durchschnittliche Transportdistanz (km)
  
  // Versektungskosten (optional)
  bottling?: {
    filling?: number; // Abfüllung (EUR/Flasche)
    degorgement?: number; // Degorierung (EUR/Flasche)
    bottles?: number; // Flaschen (EUR/Flasche)
    labels?: number; // Etiketten (EUR/Flasche)
    corks?: number; // Korken (EUR/Flasche)
    agraffes?: number; // Agraffen (EUR/Flasche)
    otherPackaging?: number; // Sonstiges Verpackungsmaterial (EUR/Flasche)
  };
  
  // Legacy: Gesamtkosten pro Flasche (wird berechnet, wenn nicht gesetzt)
  costPerBottle?: number;
}

export interface SalesParameters {
  // Produktvarianten (neue Struktur)
  productVariants: ProductVariant[];
  
  // Legacy-Parameter (für Rückwärtskompatibilität)
  pricePerLiterPrivate?: number; // Flaschenpreis pro Liter für Privatkunden (EUR)
  businessDiscountPercent?: number; // Rabatt für Geschäftskunden (%)
  businessCustomerShare?: number; // Geschäftskundenanteil (%)
  baseWinePurchasePrice?: number; // Einkaufspreis Sektgrundwein (EUR/Liter)
  numberOfBottles?: number; // Anzahl der produzierten Flaschen (0,75l)
  
  // Steuern
  vatRate: number; // Umsatzsteuer (%)
  incomeTaxRate: number; // Einkommenssteuer (%)
  sektTaxPerLiter: number; // Sektsteuer (EUR/Liter)
  
  // Weitere Legacy (für Rückwärtskompatibilität)
  sellingPricePerBottle?: number;
  bottlesPerLiter?: number;
  targetProfitPerMonth?: number;
  productionVolumePerYear?: number;
}

export interface DynamicCostItem {
  id: string;
  name: string;
  amount: number; // Betrag
  type: 'fixed' | 'variable'; // Fixkosten (monatlich) oder variable Kosten (pro Flasche)
  category: 'cost' | 'revenue'; // Kosten oder Einnahmen
  description?: string; // Optional: Beschreibung
}

export interface CalculationData {
  personalCosts: PersonalCosts;
  productionCosts: ProductionCosts;
  operatingCosts: OperatingCosts;
  timeInvestment: TimeInvestment;
  salesParameters: SalesParameters;
  stepCostParameters: StepCostParameters; // Parameter für sprungfixe Kosten
}

export interface CalculationResults {
  // Grunddaten
  numberOfBottles: number;
  bottlesPerLiter: number;
  productionVolumePerYear: number; // Liter
  
  // Produktvarianten (wenn verwendet)
  productVariants?: Array<{
    variant: ProductVariant;
    revenue: {
      revenuePrivate: number;
      revenueBusiness: number;
      totalRevenue: number;
    };
    costPerBottle: number;
    profit: number;
  }>;
  
  // Preise (gewichtet, wenn mehrere Varianten)
  pricePerBottlePrivate: number;
  pricePerBottleBusiness: number;
  averagePricePerBottle: number;
  
  // Kosten
  costPerBottle: number;
  fixedCostsPerMonth: number;
  fixedCostsPerYear: number;
  variableCostsPerBottle: number;
  totalCostsPerYear: number;
  
  // Umsätze
  revenuePrivate: number;
  revenueBusiness: number;
  totalRevenue: number;
  revenuePerMonth: number;
  
  // Steuern
  vatAmount: number;
  sektTaxAmount: number;
  incomeTaxAmount: number;
  totalTaxes: number;
  
  // Gewinne
  grossProfit: number; // Vor Steuern
  netProfit: number; // Nach Steuern (Reingewinn)
  netProfitPerMonth: number;
  
  // Break-Even-Punkt
  breakEvenBottles: number;
  breakEvenRevenue: number;
  breakEvenTime?: {
    year: number;
    months: number;
    description: string;
  };
  
  // Gewinnschwellen
  profitThresholds: {
    targetProfit: number;
    requiredRevenue: number;
    requiredBottles: number;
  }[];
  
  // Stundenlohn
  hourlyWage: number;
  
  // Optimale Produktionsmenge (Sweet Spot)
  optimalProductionVolume: number;
  profitAtOptimalVolume: number;
  
  // Kostenverteilung
  costDistribution: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  
  // Kritische Punkte
  criticalPoints: {
    bottles: number;
    description: string;
    impact: string;
    type: 'cost' | 'revenue' | 'break-even' | 'milestone';
  }[];
  
  // Sprungfixe Kosten
  stepCosts: {
    additionalCosts: number;
    description: string;
    requiredWorkingHours: number;
    availableWorkingHours: number;
    needsEmployee: boolean;
  };
}
