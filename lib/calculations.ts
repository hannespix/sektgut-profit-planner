import type {
  CalculationData,
  CalculationResults,
  PersonalCosts,
  ProductionCosts,
  OperatingCosts,
  SalesParameters,
  ProductVariant,
  DynamicCostItem,
  TimeInvestment,
} from './types';
import { calculateCriticalPoints, calculateStepCosts } from './criticalPoints';

const BOTTLE_SIZE_LITERS = 0.75; // Standard Flaschengröße

/**
 * Berechnet die Gesamtkosten pro Flasche für eine Produktvariante
 */
export function calculateCostPerBottleForVariant(
  variant: ProductVariant,
  defaultProductionCosts: ProductionCosts
): number {
  // Verwende individuelle Kosten der Variante oder Standardkosten
  const baseWinePerLiter = variant.baseWinePerLiter ?? defaultProductionCosts.baseWinePerLiter;
  const processingPerLiter = variant.processingPerLiter ?? defaultProductionCosts.processingPerLiter;
  const transportPerLiterKm = variant.transportPerLiterKm ?? defaultProductionCosts.transportPerLiterKm;
  const averageTransportDistance = variant.averageTransportDistance ?? defaultProductionCosts.averageTransportDistance;
  
  const bottlesPerLiter = 1 / BOTTLE_SIZE_LITERS; // ~1.33 Flaschen pro Liter

  // Kosten pro Liter
  const costPerLiter =
    baseWinePerLiter +
    processingPerLiter +
    transportPerLiterKm * averageTransportDistance;

  // Versektungskosten pro Flasche (individuell oder Standard)
  const bottling = variant.bottling ?? defaultProductionCosts.bottling;
  const bottlingCostPerBottle =
    (bottling.filling ?? defaultProductionCosts.bottling.filling) +
    (bottling.degorgement ?? defaultProductionCosts.bottling.degorgement) +
    (bottling.bottles ?? defaultProductionCosts.bottling.bottles) +
    (bottling.labels ?? defaultProductionCosts.bottling.labels) +
    (bottling.corks ?? defaultProductionCosts.bottling.corks) +
    (bottling.agraffes ?? defaultProductionCosts.bottling.agraffes) +
    (bottling.otherPackaging ?? defaultProductionCosts.bottling.otherPackaging);

  // Produktionskosten pro Flasche
  const productionCostPerBottle = costPerLiter / bottlesPerLiter;

  // Dynamische variable Kosten pro Flasche hinzufügen (nur Standard, da Varianten-spezifisch nicht implementiert)
  const dynamicVariableCosts = defaultProductionCosts.dynamicItems
    .filter(item => item.type === 'variable' && item.category === 'cost')
    .reduce((sum, item) => sum + item.amount, 0);

  // Dynamische variable Einnahmen pro Flasche abziehen (als negative Kosten)
  const dynamicVariableRevenue = defaultProductionCosts.dynamicItems
    .filter(item => item.type === 'variable' && item.category === 'revenue')
    .reduce((sum, item) => sum - item.amount, 0);

  return productionCostPerBottle + bottlingCostPerBottle + dynamicVariableCosts + dynamicVariableRevenue;
}

/**
 * Berechnet die Gesamtkosten pro Flasche (Legacy für Einzelprodukt)
 */
export function calculateCostPerBottle(
  productionCosts: ProductionCosts,
  salesParameters: SalesParameters
): number {
  const {
    baseWinePerLiter,
    processingPerLiter,
    transportPerLiterKm,
    averageTransportDistance,
    bottling,
  } = productionCosts;

  const bottlesPerLiter = 1 / BOTTLE_SIZE_LITERS; // ~1.33 Flaschen pro Liter

  // Kosten pro Liter
  const costPerLiter =
    baseWinePerLiter +
    processingPerLiter +
    transportPerLiterKm * averageTransportDistance;

  // Versektungskosten pro Flasche
  const bottlingCostPerBottle =
    bottling.filling +
    bottling.degorgement +
    bottling.bottles +
    bottling.labels +
    bottling.corks +
    bottling.agraffes +
    bottling.otherPackaging;

  // Produktionskosten pro Flasche
  const productionCostPerBottle = costPerLiter / bottlesPerLiter;

  // Dynamische variable Kosten pro Flasche hinzufügen
  const dynamicVariableCosts = productionCosts.dynamicItems
    .filter(item => item.type === 'variable' && item.category === 'cost')
    .reduce((sum, item) => sum + item.amount, 0);

  // Dynamische variable Einnahmen pro Flasche abziehen (als negative Kosten)
  const dynamicVariableRevenue = productionCosts.dynamicItems
    .filter(item => item.type === 'variable' && item.category === 'revenue')
    .reduce((sum, item) => sum - item.amount, 0);

  return productionCostPerBottle + bottlingCostPerBottle + dynamicVariableCosts + dynamicVariableRevenue;
}

/**
 * Berechnet die Fixkosten pro Monat
 */
export function calculateFixedCostsPerMonth(
  personalCosts: PersonalCosts,
  operatingCosts: OperatingCosts
): number {
  // Nur betriebliche Kosten - Lebenshaltungskosten sind persönliche Ausgaben, keine Betriebskosten
  const baseCosts = (
    personalCosts.healthInsurance +
    personalCosts.pensionInsurance +
    personalCosts.nursingInsurance +
    personalCosts.otherSocialInsurance +
    // livingCosts NICHT enthalten - werden vom Gewinn bezahlt, sind keine Betriebskosten
    operatingCosts.webServer +
    operatingCosts.onlineShop +
    operatingCosts.cms +
    operatingCosts.marketing +
    operatingCosts.office +
    operatingCosts.other
  );

  // Dynamische Fixkosten hinzufügen
  const dynamicFixedCosts = [
    ...personalCosts.dynamicItems,
    ...operatingCosts.dynamicItems,
  ]
    .filter(item => item.type === 'fixed' && item.category === 'cost')
    .reduce((sum, item) => sum + item.amount, 0);

  // Dynamische Fixeinnahmen abziehen (als negative Kosten)
  const dynamicFixedRevenue = [
    ...personalCosts.dynamicItems,
    ...operatingCosts.dynamicItems,
  ]
    .filter(item => item.type === 'fixed' && item.category === 'revenue')
    .reduce((sum, item) => sum - item.amount, 0);

  return baseCosts + dynamicFixedCosts + dynamicFixedRevenue;
}

/**
 * Berechnet Preise für eine einzelne Produktvariante
 */
export function calculateVariantPrices(variant: ProductVariant): {
  pricePerBottlePrivate: number;
  pricePerBottleBusiness: number;
  averagePricePerBottle: number;
} {
  const pricePerBottlePrivate = variant.pricePerLiterPrivate * BOTTLE_SIZE_LITERS;
  const discount = variant.businessDiscountPercent / 100;
  const pricePerBottleBusiness = pricePerBottlePrivate * (1 - discount);
  
  const businessShare = variant.businessCustomerShare / 100;
  const privateShare = 1 - businessShare;
  
  const averagePricePerBottle = 
    pricePerBottlePrivate * privateShare + 
    pricePerBottleBusiness * businessShare;

  return {
    pricePerBottlePrivate,
    pricePerBottleBusiness,
    averagePricePerBottle,
  };
}

/**
 * Berechnet Preise basierend auf Grundparametern (Legacy für Rückwärtskompatibilität)
 */
export function calculatePrices(salesParameters: SalesParameters): {
  pricePerBottlePrivate: number;
  pricePerBottleBusiness: number;
  averagePricePerBottle: number;
} {
  // Wenn Produktvarianten vorhanden sind, berechne gewichteten Durchschnitt
  // Einzelprodukt - keine Varianten mehr
  if (false && salesParameters.productVariants && salesParameters.productVariants.length > 0) {
    let totalBottles = 0;
    let weightedPricePrivate = 0;
    let weightedPriceBusiness = 0;
    
    salesParameters.productVariants.forEach(variant => {
      const prices = calculateVariantPrices(variant);
      totalBottles += variant.numberOfBottles;
      weightedPricePrivate += prices.pricePerBottlePrivate * variant.numberOfBottles;
      weightedPriceBusiness += prices.pricePerBottleBusiness * variant.numberOfBottles;
    });
    
    return {
      pricePerBottlePrivate: totalBottles > 0 ? weightedPricePrivate / totalBottles : 0,
      pricePerBottleBusiness: totalBottles > 0 ? weightedPriceBusiness / totalBottles : 0,
      averagePricePerBottle: totalBottles > 0 
        ? (weightedPricePrivate + weightedPriceBusiness) / (2 * totalBottles)
        : 0,
    };
  }
  
  // Legacy: Einzelprodukt
  const pricePerBottlePrivate = (salesParameters.pricePerLiterPrivate || 0) * BOTTLE_SIZE_LITERS;
  const discount = (salesParameters.businessDiscountPercent || 0) / 100;
  const pricePerBottleBusiness = pricePerBottlePrivate * (1 - discount);
  
  const businessShare = (salesParameters.businessCustomerShare || 0) / 100;
  const privateShare = 1 - businessShare;
  
  const averagePricePerBottle = 
    pricePerBottlePrivate * privateShare + 
    pricePerBottleBusiness * businessShare;

  return {
    pricePerBottlePrivate,
    pricePerBottleBusiness,
    averagePricePerBottle,
  };
}

/**
 * Berechnet Umsätze für eine einzelne Produktvariante
 */
export function calculateVariantRevenue(variant: ProductVariant): {
  revenuePrivate: number;
  revenueBusiness: number;
  totalRevenue: number;
} {
  const prices = calculateVariantPrices(variant);
  const businessShare = variant.businessCustomerShare / 100;
  const privateShare = 1 - businessShare;
  
  const bottlesBusiness = Math.round(variant.numberOfBottles * businessShare);
  const bottlesPrivate = variant.numberOfBottles - bottlesBusiness;
  
  const revenuePrivate = bottlesPrivate * prices.pricePerBottlePrivate;
  const revenueBusiness = bottlesBusiness * prices.pricePerBottleBusiness;
  const totalRevenue = revenuePrivate + revenueBusiness;

  return {
    revenuePrivate,
    revenueBusiness,
    totalRevenue,
  };
}

/**
 * Berechnet Gesamtumsätze für alle Produktvarianten
 */
export function calculateTotalRevenue(
  variants: ProductVariant[]
): {
  revenuePrivate: number;
  revenueBusiness: number;
  totalRevenue: number;
  variantRevenues: Array<{ variant: ProductVariant; revenue: { revenuePrivate: number; revenueBusiness: number; totalRevenue: number } }>;
} {
  let totalRevenuePrivate = 0;
  let totalRevenueBusiness = 0;
  const variantRevenues = variants.map(variant => {
    const revenue = calculateVariantRevenue(variant);
    totalRevenuePrivate += revenue.revenuePrivate;
    totalRevenueBusiness += revenue.revenueBusiness;
    return { variant, revenue };
  });

  return {
    revenuePrivate: totalRevenuePrivate,
    revenueBusiness: totalRevenueBusiness,
    totalRevenue: totalRevenuePrivate + totalRevenueBusiness,
    variantRevenues,
  };
}

/**
 * Berechnet Umsätze (Legacy für Rückwärtskompatibilität)
 */
export function calculateRevenue(
  numberOfBottles: number,
  prices: { pricePerBottlePrivate: number; pricePerBottleBusiness: number },
  businessCustomerShare: number
): {
  revenuePrivate: number;
  revenueBusiness: number;
  totalRevenue: number;
} {
  const businessShare = businessCustomerShare / 100;
  const privateShare = 1 - businessShare;
  
  const bottlesBusiness = Math.round(numberOfBottles * businessShare);
  const bottlesPrivate = numberOfBottles - bottlesBusiness;
  
  const revenuePrivate = bottlesPrivate * prices.pricePerBottlePrivate;
  const revenueBusiness = bottlesBusiness * prices.pricePerBottleBusiness;
  const totalRevenue = revenuePrivate + revenueBusiness;

  return {
    revenuePrivate,
    revenueBusiness,
    totalRevenue,
  };
}

/**
 * Berechnet Steuern
 */
export function calculateTaxes(
  totalRevenue: number,
  grossProfit: number,
  productionVolumeLiters: number,
  salesParameters: SalesParameters
): {
  vatAmount: number;
  sektTaxAmount: number;
  incomeTaxAmount: number;
  totalTaxes: number;
} {
  // Umsatzsteuer (auf Netto-Umsatz)
  const netRevenue = totalRevenue / (1 + salesParameters.vatRate / 100);
  const vatAmount = totalRevenue - netRevenue;
  
  // Sektsteuer (pro Liter)
  const sektTaxAmount = productionVolumeLiters * salesParameters.sektTaxPerLiter;
  
  // Einkommenssteuer (auf Gewinn)
  const incomeTaxAmount = grossProfit * (salesParameters.incomeTaxRate / 100);
  
  const totalTaxes = vatAmount + sektTaxAmount + incomeTaxAmount;

  return {
    vatAmount,
    sektTaxAmount,
    incomeTaxAmount,
    totalTaxes,
  };
}

/**
 * Berechnet den Break-Even-Punkt (auf Jahresbasis)
 */
export function calculateBreakEven(
  fixedCostsPerYear: number,
  averagePricePerBottle: number,
  variableCostsPerBottle: number
): { bottles: number; revenue: number } {
  const contributionMargin = averagePricePerBottle - variableCostsPerBottle;
  
  if (contributionMargin <= 0) {
    return { bottles: Infinity, revenue: Infinity };
  }

  // Break-Even: Fixkosten pro Jahr / Deckungsbeitrag pro Flasche
  const bottles = fixedCostsPerYear / contributionMargin;
  const revenue = bottles * averagePricePerBottle;

  return { bottles, revenue };
}

/**
 * Berechnet, wann Break-Even erreicht wird (bei jährlicher Produktion)
 * Gibt zurück: In welchem Jahr wird Break-Even erreicht (1 = erstes Jahr, 2 = zweites Jahr, etc.)
 */
export function calculateBreakEvenTime(
  fixedCostsPerYear: number,
  numberOfBottles: number,
  averagePricePerBottle: number,
  variableCostsPerBottle: number
): { year: number; months: number; description: string } {
  const contributionMargin = averagePricePerBottle - variableCostsPerBottle;
  
  if (contributionMargin <= 0 || numberOfBottles <= 0) {
    return { year: Infinity, months: Infinity, description: 'Break-Even nicht erreichbar' };
  }
  
  // Jahresumsatz
  const annualRevenue = numberOfBottles * averagePricePerBottle;
  const annualVariableCosts = numberOfBottles * variableCostsPerBottle;
  const annualContributionMargin = annualRevenue - annualVariableCosts;
  
  if (annualContributionMargin <= 0) {
    return { year: Infinity, months: Infinity, description: 'Break-Even nicht erreichbar' };
  }
  
  // Kumulierte Fixkosten über Jahre
  let cumulativeFixedCosts = 0;
  let year = 1;
  const maxYears = 10; // Maximal 10 Jahre prüfen
  
  while (year <= maxYears) {
    cumulativeFixedCosts += fixedCostsPerYear;
    const cumulativeContributionMargin = annualContributionMargin * year;
    
    if (cumulativeContributionMargin >= cumulativeFixedCosts) {
      // Break-Even in diesem Jahr erreicht
      const remainingFixedCosts = cumulativeFixedCosts - (annualContributionMargin * (year - 1));
      const months = Math.ceil((remainingFixedCosts / annualContributionMargin) * 12);
      
      return {
        year,
        months: Math.min(months, 12),
        description: `Break-Even im Jahr ${year}, nach ${months} Monaten`,
      };
    }
    
    year++;
  }
  
  return {
    year: Infinity,
    months: Infinity,
    description: `Break-Even nicht innerhalb von ${maxYears} Jahren erreichbar`,
  };
}

/**
 * Berechnet benötigten Umsatz für Zielgewinn
 */
export function calculateRequiredRevenueForProfit(
  fixedCostsPerYear: number,
  targetProfit: number,
  averagePricePerBottle: number,
  variableCostsPerBottle: number
): { revenue: number; bottles: number } {
  const contributionMargin = averagePricePerBottle - variableCostsPerBottle;
  
  if (contributionMargin <= 0) {
    return { revenue: Infinity, bottles: Infinity };
  }

  // Benötigte Flaschen: (Fixkosten + Zielgewinn) / Deckungsbeitrag pro Flasche
  const requiredBottles = (fixedCostsPerYear + targetProfit) / contributionMargin;
  const requiredRevenue = requiredBottles * averagePricePerBottle;

  return { revenue: requiredRevenue, bottles: requiredBottles };
}

/**
 * Berechnet produktive Arbeitsstunden pro Jahr
 * Berücksichtigt Urlaub, Krankheit, Feiertage und unproduktive Zeiten
 */
export function calculateProductiveHoursPerYear(
  workingHoursPerWeek: number,
  vacationDaysPerYear: number,
  sickDaysPerYear: number,
  publicHolidaysPerYear: number,
  productiveHoursPercentage: number
): number {
  // Arbeitstage pro Jahr (365 - Wochenenden)
  const totalDaysPerYear = 365;
  const weekendsPerYear = 52 * 2; // 52 Wochen × 2 Tage
  const workingDaysPerYear = totalDaysPerYear - weekendsPerYear;
  
  // Verfügbare Arbeitstage (abzüglich Urlaub, Krankheit, Feiertage)
  const availableWorkingDays = workingDaysPerYear - vacationDaysPerYear - sickDaysPerYear - publicHolidaysPerYear;
  
  // Arbeitsstunden pro Tag
  const hoursPerDay = workingHoursPerWeek / 5; // Annahme: 5-Tage-Woche
  
  // Gesamtarbeitsstunden pro Jahr
  const totalWorkingHoursPerYear = availableWorkingDays * hoursPerDay;
  
  // Produktive Stunden (abzüglich unproduktiver Zeiten wie Admin, Meetings)
  const productiveHoursPerYear = totalWorkingHoursPerYear * (productiveHoursPercentage / 100);
  
  return productiveHoursPerYear;
}

/**
 * Berechnet den effektiven Stundenlohn
 * Berücksichtigt produktive Stunden
 */
export function calculateHourlyWage(
  netProfitPerMonth: number,
  timeInvestment: TimeInvestment
): number {
  // Produktive Stunden pro Jahr berechnen
  const productiveHoursPerYear = calculateProductiveHoursPerYear(
    timeInvestment.workingHoursPerWeek,
    timeInvestment.vacationDaysPerYear,
    timeInvestment.sickDaysPerYear,
    timeInvestment.publicHolidaysPerYear,
    timeInvestment.productiveHoursPercentage
  );
  
  const productiveHoursPerMonth = productiveHoursPerYear / 12;
  
  if (productiveHoursPerMonth <= 0) {
    return 0;
  }

  // Stundenlohn = Netto-Gewinn / produktive Stunden
  // Lebenshaltungskosten werden vom Gewinn bezahlt, sind aber keine Betriebskosten
  return netProfitPerMonth / productiveHoursPerMonth;
}

/**
 * Findet die optimale Produktionsmenge (Sweet Spot)
 */
export function findOptimalProductionVolume(
  data: CalculationData,
  minBottles: number = 100,
  maxBottles: number = 10000,
  step: number = 100
): { volume: number; profit: number } {
  let maxProfit = -Infinity;
  let optimalVolume = minBottles;

  const prices = calculatePrices(data.salesParameters);
  const costPerBottle = calculateCostPerBottle(data.productionCosts, data.salesParameters);
  const fixedCostsPerMonth = calculateFixedCostsPerMonth(data.personalCosts, data.operatingCosts);

  for (let bottles = minBottles; bottles <= maxBottles; bottles += step) {
    const productionVolumeLiters = bottles * BOTTLE_SIZE_LITERS;
    const revenue = calculateRevenue(bottles, prices, data.salesParameters.businessCustomerShare || 0);
    const variableCosts = bottles * costPerBottle;
    const fixedCostsPerYear = fixedCostsPerMonth * 12;
    const grossProfit = revenue.totalRevenue - variableCosts - fixedCostsPerYear;
    
    const taxes = calculateTaxes(
      revenue.totalRevenue,
      grossProfit,
      productionVolumeLiters,
      data.salesParameters
    );
    
    const netProfit = grossProfit - taxes.totalTaxes;

    if (netProfit > maxProfit) {
      maxProfit = netProfit;
      optimalVolume = bottles;
    }
  }

  return { volume: optimalVolume, profit: maxProfit };
}

/**
 * Berechnet die Kostenverteilung
 */
export function calculateCostDistribution(
  data: CalculationData,
  numberOfBottles: number
): { category: string; amount: number; percentage: number }[] {
  const fixedCostsPerYear = calculateFixedCostsPerMonth(
    data.personalCosts,
    data.operatingCosts
  ) * 12;

  const costPerBottle = calculateCostPerBottle(data.productionCosts, data.salesParameters);
  const variableCostsPerYear = numberOfBottles * costPerBottle;

  const totalCosts = fixedCostsPerYear + variableCostsPerYear;

  const distribution = [
    {
      category: 'Sozialversicherungen',
      amount: (data.personalCosts.healthInsurance +
        data.personalCosts.pensionInsurance +
        data.personalCosts.nursingInsurance +
        data.personalCosts.otherSocialInsurance) * 12,
      percentage: 0,
    },
    {
      category: 'Betriebskosten',
      amount: (data.operatingCosts.webServer +
        data.operatingCosts.onlineShop +
        data.operatingCosts.cms +
        data.operatingCosts.marketing +
        data.operatingCosts.office +
        data.operatingCosts.other) * 12,
      percentage: 0,
    },
    {
      category: 'Produktionskosten',
      amount: variableCostsPerYear,
      percentage: 0,
    },
  ];

  // Dynamische Kosten hinzufügen
  const dynamicFixedCosts = [
    ...data.personalCosts.dynamicItems,
    ...data.operatingCosts.dynamicItems,
  ]
    .filter(item => item.type === 'fixed' && item.category === 'cost')
    .reduce((sum, item) => sum + item.amount * 12, 0);

  const dynamicVariableCosts = data.productionCosts.dynamicItems
    .filter(item => item.type === 'variable' && item.category === 'cost')
    .reduce((sum, item) => sum + item.amount * numberOfBottles, 0);

  if (dynamicFixedCosts > 0 || dynamicVariableCosts > 0) {
    distribution.push({
      category: 'Weitere Kosten',
      amount: dynamicFixedCosts + dynamicVariableCosts,
      percentage: 0,
    });
  }

  // Berechne Prozentsätze
  distribution.forEach((item) => {
    item.percentage = totalCosts > 0 ? (item.amount / totalCosts) * 100 : 0;
  });

  return distribution;
}

/**
 * Hauptberechnungsfunktion
 */
export function calculateResults(data: CalculationData): CalculationResults {
  // Einzelprodukt - keine Varianten mehr
  const numberOfBottles = data.salesParameters.numberOfBottles || 0;
  const productionVolumeLiters = numberOfBottles * BOTTLE_SIZE_LITERS;
  
  const prices = calculatePrices(data.salesParameters);
  
  const revenue = calculateRevenue(
    numberOfBottles,
    prices,
    data.salesParameters.businessCustomerShare || 0
  );
  
  const bottlesPerLiter = 1 / BOTTLE_SIZE_LITERS;
  const revenuePerMonth = revenue.totalRevenue / 12;
  
  // Kosten berechnen
  const costPerBottle = calculateCostPerBottle(data.productionCosts, data.salesParameters);
  const fixedCostsPerMonth = calculateFixedCostsPerMonth(data.personalCosts, data.operatingCosts);
  
  // Sprungfixe Kosten berechnen (basierend auf Arbeitszeit)
  const stepCosts = calculateStepCosts(numberOfBottles, fixedCostsPerMonth, data);
  const adjustedFixedCostsPerMonth = fixedCostsPerMonth + stepCosts.additionalCosts;
  const adjustedFixedCostsPerYear = adjustedFixedCostsPerMonth * 12;
  
  // Variable Kosten
  const variableCostsPerBottle = costPerBottle;
  const totalVariableCosts = numberOfBottles * variableCostsPerBottle;
  
  const totalCostsPerYear = adjustedFixedCostsPerYear + totalVariableCosts;
  
  // Gewinn vor Steuern
  const grossProfit = revenue.totalRevenue - totalCostsPerYear;
  
  // Steuern berechnen
  const taxes = calculateTaxes(
    revenue.totalRevenue,
    grossProfit,
    productionVolumeLiters,
    data.salesParameters
  );
  
  // Reingewinn (nach Steuern)
  const netProfit = grossProfit - taxes.totalTaxes;
  const netProfitPerMonth = netProfit / 12;
  
  // Variable Kosten pro Flasche (bereits oben definiert)
  
  // Break-Even (mit sprungfixen Kosten) - auf Jahresbasis
  const breakEven = calculateBreakEven(
    adjustedFixedCostsPerYear,
    prices.averagePricePerBottle,
    variableCostsPerBottle
  );
  
  // Break-Even mit Zeit: Wann wird Break-Even erreicht?
  const breakEvenTime = calculateBreakEvenTime(
    adjustedFixedCostsPerYear,
    numberOfBottles,
    prices.averagePricePerBottle,
    variableCostsPerBottle
  );
  
  // Gewinnschwellen (mit sprungfixen Kosten) - auf Jahresbasis
  const profitThresholds = [
    1000, 2000, 5000, 10000, 20000, 50000,
  ].map((targetProfit) => {
    const result = calculateRequiredRevenueForProfit(
      adjustedFixedCostsPerYear,
      targetProfit,
      prices.averagePricePerBottle,
      variableCostsPerBottle
    );
    return {
      targetProfit,
      requiredRevenue: result.revenue,
      requiredBottles: result.bottles,
    };
  });
  
  // Optimale Produktionsmenge
  const optimal = findOptimalProductionVolume(data);
  const profitAtOptimalVolume = optimal.profit / 12;
  
  // Stundenlohn (mit produktiven Stunden)
  const hourlyWage = calculateHourlyWage(
    netProfitPerMonth,
    data.timeInvestment
  );
  
  // Kostenverteilung
  const costDistribution = calculateCostDistribution(data, numberOfBottles);
  
  // Kritische Punkte berechnen (temporäres results-Objekt für calculateCriticalPoints)
  const tempResults: CalculationResults = {
    numberOfBottles,
    bottlesPerLiter,
    productionVolumePerYear: productionVolumeLiters,
    pricePerBottlePrivate: prices.pricePerBottlePrivate,
    pricePerBottleBusiness: prices.pricePerBottleBusiness,
    averagePricePerBottle: prices.averagePricePerBottle,
    costPerBottle,
    fixedCostsPerMonth: adjustedFixedCostsPerMonth,
    fixedCostsPerYear: adjustedFixedCostsPerYear,
    variableCostsPerBottle,
    totalCostsPerYear,
    revenuePrivate: revenue.revenuePrivate,
    revenueBusiness: revenue.revenueBusiness,
    totalRevenue: revenue.totalRevenue,
    revenuePerMonth,
    vatAmount: taxes.vatAmount,
    sektTaxAmount: taxes.sektTaxAmount,
    incomeTaxAmount: taxes.incomeTaxAmount,
    totalTaxes: taxes.totalTaxes,
    grossProfit,
    netProfit,
    netProfitPerMonth,
    breakEvenBottles: breakEven.bottles,
    breakEvenRevenue: breakEven.revenue,
    profitThresholds,
    hourlyWage,
    optimalProductionVolume: optimal.volume,
    profitAtOptimalVolume,
    costDistribution,
    criticalPoints: [],
    stepCosts: {
      additionalCosts: 0,
      description: '',
      requiredWorkingHours: 0,
      availableWorkingHours: 0,
      needsEmployee: false,
    },
  };
  
  const criticalPoints = calculateCriticalPoints(data, tempResults);
  
  return {
    numberOfBottles,
    bottlesPerLiter,
    productionVolumePerYear: productionVolumeLiters,
    pricePerBottlePrivate: prices.pricePerBottlePrivate,
    pricePerBottleBusiness: prices.pricePerBottleBusiness,
    averagePricePerBottle: prices.averagePricePerBottle,
    costPerBottle,
    fixedCostsPerMonth: adjustedFixedCostsPerMonth, // Mit sprungfixen Kosten
    fixedCostsPerYear: adjustedFixedCostsPerYear,
    variableCostsPerBottle,
    totalCostsPerYear,
    revenuePrivate: revenue.revenuePrivate,
    revenueBusiness: revenue.revenueBusiness,
    totalRevenue: revenue.totalRevenue,
    revenuePerMonth,
    vatAmount: taxes.vatAmount,
    sektTaxAmount: taxes.sektTaxAmount,
    incomeTaxAmount: taxes.incomeTaxAmount,
    totalTaxes: taxes.totalTaxes,
    grossProfit,
    netProfit,
    netProfitPerMonth,
    breakEvenBottles: breakEven.bottles,
    breakEvenRevenue: breakEven.revenue,
    breakEvenTime,
    profitThresholds,
    hourlyWage,
    optimalProductionVolume: optimal.volume,
    profitAtOptimalVolume,
    costDistribution,
    criticalPoints,
    stepCosts,
  };
}
