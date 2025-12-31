import type { CalculationData } from './types';

const STORAGE_KEY = 'sektgut-kalkulator-data';

/**
 * Lädt gespeicherte Daten aus localStorage
 */
export function loadData(): CalculationData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    const data = JSON.parse(stored) as CalculationData;
    // Rückwärtskompatibilität
    if (!data.personalCosts.dynamicItems) {
      data.personalCosts.dynamicItems = [];
    }
    if (!data.productionCosts.dynamicItems) {
      data.productionCosts.dynamicItems = [];
    }
    if (!data.operatingCosts.dynamicItems) {
      data.operatingCosts.dynamicItems = [];
    }
    // Migriere alte SalesParameters zu neuen Produktvarianten
    if (!data.salesParameters.productVariants) {
      // Erstelle Standard-Variante aus alten Parametern
      data.salesParameters.productVariants = [
        {
          id: 'variant-default',
          name: 'Standard',
          numberOfBottles: data.salesParameters.numberOfBottles || 1000,
          pricePerLiterPrivate: data.salesParameters.pricePerLiterPrivate || 20,
          businessDiscountPercent: data.salesParameters.businessDiscountPercent || 10,
          businessCustomerShare: data.salesParameters.businessCustomerShare || 30,
        },
      ];
    }
    
    if (data.salesParameters.sellingPricePerBottle && !data.salesParameters.pricePerLiterPrivate) {
      data.salesParameters.pricePerLiterPrivate = data.salesParameters.sellingPricePerBottle / 0.75;
    }
    if (data.salesParameters.numberOfBottles === undefined) {
      const liters = data.salesParameters.productionVolumePerYear || 1000;
      data.salesParameters.numberOfBottles = Math.round(liters / 0.75);
    }
    if (!data.salesParameters.vatRate) {
      data.salesParameters.vatRate = 19;
    }
    if (!data.salesParameters.incomeTaxRate) {
      data.salesParameters.incomeTaxRate = 30;
    }
    if (!data.salesParameters.sektTaxPerLiter) {
      data.salesParameters.sektTaxPerLiter = 0.51;
    }
    // Rückwärtskompatibilität für timeInvestment
    const timeInv = data.timeInvestment as any;
    if (timeInv.hoursPerLiterProduction !== undefined) {
      // Alte Struktur: Stunden pro Liter -> neue Struktur: Minuten pro Flasche
      data.timeInvestment.minutesPerBottle = (timeInv.hoursPerLiterProduction * 60) * 0.75; // Liter zu Flasche
    }
    if (data.timeInvestment.minutesPerBottle === undefined) {
      data.timeInvestment.minutesPerBottle = 10; // Default: 10 Minuten pro Flasche
    }
    if (data.timeInvestment.vacationDaysPerYear === undefined) {
      data.timeInvestment.vacationDaysPerYear = 25;
    }
    if (data.timeInvestment.sickDaysPerYear === undefined) {
      data.timeInvestment.sickDaysPerYear = 5;
    }
    if (data.timeInvestment.publicHolidaysPerYear === undefined) {
      data.timeInvestment.publicHolidaysPerYear = 10;
    }
    if (data.timeInvestment.productiveHoursPercentage === undefined) {
      data.timeInvestment.productiveHoursPercentage = 80;
    }
    
    // Rückwärtskompatibilität für stepCostParameters
    if (!data.stepCostParameters) {
      data.stepCostParameters = {
        employeeCostPerMonth: 3000,
        maxWorkingHoursPerWeek: data.timeInvestment.workingHoursPerWeek || 20,
        ordersPerBottle: 0.1,
      };
    }
    return data;
  } catch (error) {
    console.error('Fehler beim Laden der Daten:', error);
    return null;
  }
}

/**
 * Speichert Daten in localStorage
 */
export function saveData(data: CalculationData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Fehler beim Speichern der Daten:', error);
  }
}

/**
 * Erstellt Standard-Daten
 */
export function createDefaultData(): CalculationData {
  return {
    personalCosts: {
      healthInsurance: 400,
      pensionInsurance: 200,
      nursingInsurance: 50,
      otherSocialInsurance: 0,
      livingCosts: 1500,
      dynamicItems: [],
    },
    productionCosts: {
      baseWinePerLiter: 3.0, // Typisch: 2,5-3,5 €/Liter für Grundwein
      processingPerLiter: 0.8, // Verarbeitung, Gärung, Lagerung
      transportPerLiterKm: 0.08, // Transportkosten pro Liter und km
      averageTransportDistance: 30, // Durchschnittliche Transportdistanz
      bottling: {
        filling: 0.15, // Abfüllung (ca. 0,15-0,25 €)
        degorgement: 0.20, // Degorierung/Enthefung (ca. 0,15-0,30 €)
        bottles: 0.60, // Flasche 0,75L (Standard: 0,50-0,80 €, Premium: bis 1,70 €)
        labels: 0.20, // Etikett (Standard: 0,15-0,25 €, Premium: bis 0,30 €)
        corks: 0.40, // Korken/Verschluss (Standard: 0,30-0,50 €, Premium: bis 1,70 €)
        agraffes: 0.12, // Agraffe/Drahtkäfig (ca. 0,10-0,15 €)
        otherPackaging: 0.25, // Karton, Folie, etc. (ca. 0,15-0,40 €)
      },
      dynamicItems: [],
    },
    operatingCosts: {
      webServer: 20,
      onlineShop: 30,
      cms: 10,
      marketing: 200,
      office: 100,
      other: 50,
      dynamicItems: [],
    },
    timeInvestment: {
      minutesPerBottle: 7, // Typisch: 5-10 Min/Flasche (Abfüllung: 1-2 Min, Degorgement: 0,5-1 Min, Etikettierung: 0,5-1 Min, Verpackung: 1-2 Min, sonstiges: 2-4 Min)
      hoursPerOrder: 0.75, // Typisch: 0,5-1,5h pro Bestellung (Bearbeitung, Verpackung, Versand, Rechnung)
      hoursPerMarketing: 10, // Marketing pro Monat
      workingHoursPerWeek: 20, // 20 Wochenstunden verfügbar
      vacationDaysPerYear: 25, // 25 Urlaubstage
      sickDaysPerYear: 5, // 5 Krankheitstage
      publicHolidaysPerYear: 10, // 10 Feiertage
      productiveHoursPercentage: 80, // 80% produktive Stunden (20% für Admin, Meetings, etc.)
    },
    salesParameters: {
      // Standard-Produktvarianten
      productVariants: [
        {
          id: 'variant-einfach',
          name: 'Einfach',
          numberOfBottles: 400,
          pricePerLiterPrivate: 15, // 11.25€/Flasche
          businessDiscountPercent: 10,
          businessCustomerShare: 40,
        },
        {
          id: 'variant-classic',
          name: 'Classic',
          numberOfBottles: 400,
          pricePerLiterPrivate: 20, // 15€/Flasche
          businessDiscountPercent: 10,
          businessCustomerShare: 30,
        },
        {
          id: 'variant-premium',
          name: 'Premium',
          numberOfBottles: 200,
          pricePerLiterPrivate: 30, // 22.50€/Flasche
          businessDiscountPercent: 10,
          businessCustomerShare: 20,
        },
      ],
      // Legacy-Parameter (für Rückwärtskompatibilität)
      pricePerLiterPrivate: 20, // 20€/Liter = 15€/Flasche (0.75L)
      businessDiscountPercent: 10, // 10% Rabatt
      businessCustomerShare: 30, // 30% Geschäftskunden
      baseWinePurchasePrice: 3.0, // Einkaufspreis Grundwein (typisch: 2,5-3,5 €/Liter)
      numberOfBottles: 1000, // Anzahl Flaschen (wird aus Varianten berechnet)
      vatRate: 19, // Umsatzsteuer 19%
      incomeTaxRate: 30, // Einkommenssteuer 30%
      sektTaxPerLiter: 0.51, // Sektsteuer 0.51€/Liter
    },
    stepCostParameters: {
      employeeCostPerMonth: 3000, // Kosten pro zusätzlichem Mitarbeiter
      maxWorkingHoursPerWeek: 20, // Maximale verfügbare Arbeitsstunden
      ordersPerBottle: 0.1, // 1 Bestellung pro 10 Flaschen (10% der Flaschen werden einzeln bestellt)
    },
  };
}
