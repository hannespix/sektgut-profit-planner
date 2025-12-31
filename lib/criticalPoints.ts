import type { CalculationData, CalculationResults } from './types';

export interface CriticalPoint {
  bottles: number;
  description: string;
  impact: string;
  type: 'cost' | 'revenue' | 'break-even' | 'milestone';
}

const BOTTLE_SIZE_LITERS = 0.75;

/**
 * Berechnet benötigte Arbeitszeit basierend auf Flaschenanzahl
 */
function calculateRequiredWorkingHours(
  numberOfBottles: number,
  minutesPerBottle: number,
  hoursPerOrder: number,
  hoursPerMarketing: number,
  ordersPerBottle: number
): number {
  // Produktionszeit (Minuten in Stunden umrechnen)
  const productionHours = (numberOfBottles * minutesPerBottle) / 60;
  
  // Bestellungszeit (Annahme: ordersPerBottle = 0.1 bedeutet 1 Bestellung pro 10 Flaschen)
  const numberOfOrders = numberOfBottles * ordersPerBottle;
  const orderHours = numberOfOrders * hoursPerOrder;
  
  // Marketing (fix pro Monat)
  const marketingHours = hoursPerMarketing;
  
  // Gesamt pro Monat
  return productionHours + orderHours + marketingHours;
}

/**
 * Berechnet, ab welcher Flaschenanzahl zusätzliche Arbeitszeit/Mitarbeiter nötig sind
 */
function calculateEmployeeThreshold(
  maxWorkingHoursPerWeek: number,
  minutesPerBottle: number,
  hoursPerOrder: number,
  hoursPerMarketing: number,
  ordersPerBottle: number
): number {
  const maxWorkingHoursPerMonth = maxWorkingHoursPerWeek * 4.33;
  
  // Iterative Suche nach der Flaschenanzahl, bei der die Arbeitszeit überschritten wird
  for (let bottles = 100; bottles <= 20000; bottles += 50) {
    const requiredHours = calculateRequiredWorkingHours(
      bottles,
      minutesPerBottle,
      hoursPerOrder,
      hoursPerMarketing,
      ordersPerBottle
    );
    
    if (requiredHours > maxWorkingHoursPerMonth) {
      return bottles;
    }
  }
  
  return Infinity; // Nie überschritten
}

/**
 * Berechnet kritische Punkte und sprungfixe Kostenpunkte
 */
export function calculateCriticalPoints(
  data: CalculationData,
  results: CalculationResults
): CriticalPoint[] {
  const points: CriticalPoint[] = [];
  const params = data.stepCostParameters;

  // Break-Even-Punkt
  if (isFinite(results.breakEvenBottles) && results.breakEvenBottles > 0) {
    points.push({
      bottles: results.breakEvenBottles,
      description: 'Break-Even-Punkt',
      impact: `Ab ${Math.ceil(results.breakEvenBottles)} Flaschen pro Monat wird Gewinn erzielt`,
      type: 'break-even',
    });
  }

  // Berechne, ab wann zusätzliche Arbeitszeit/Mitarbeiter nötig sind
  const employeeThreshold = calculateEmployeeThreshold(
    params.maxWorkingHoursPerWeek,
    data.timeInvestment.minutesPerBottle,
    data.timeInvestment.hoursPerOrder,
    data.timeInvestment.hoursPerMarketing,
    params.ordersPerBottle
  );

  if (isFinite(employeeThreshold) && results.numberOfBottles >= employeeThreshold * 0.8) {
    const requiredHours = calculateRequiredWorkingHours(
      employeeThreshold,
      data.timeInvestment.minutesPerBottle,
      data.timeInvestment.hoursPerOrder,
      data.timeInvestment.hoursPerMarketing,
      params.ordersPerBottle
    );
    const maxHours = params.maxWorkingHoursPerWeek * 4.33;
    const additionalHours = requiredHours - maxHours;
    
    points.push({
      bottles: employeeThreshold,
      description: 'Zusätzlicher Mitarbeiter nötig',
      impact: `Ab ${employeeThreshold} Flaschen/Monat: ${additionalHours.toFixed(1)}h zusätzliche Arbeitszeit nötig (+${params.employeeCostPerMonth}€/Monat)`,
      type: 'cost',
    });
  }

  // Sortiere nach Flaschenanzahl
  return points.sort((a, b) => a.bottles - b.bottles);
}

/**
 * Berechnet sprungfixe Kosten basierend auf Flaschenanzahl und Arbeitszeit
 */
export function calculateStepCosts(
  numberOfBottles: number,
  fixedCostsPerMonth: number,
  data: CalculationData
): {
  additionalCosts: number;
  description: string;
  requiredWorkingHours: number;
  availableWorkingHours: number;
  needsEmployee: boolean;
} {
  const params = data.stepCostParameters;
  let additionalCosts = 0;
  const descriptions: string[] = [];

  const requiredHours = calculateRequiredWorkingHours(
    numberOfBottles,
    data.timeInvestment.minutesPerBottle,
    data.timeInvestment.hoursPerOrder,
    data.timeInvestment.hoursPerMarketing,
    params.ordersPerBottle
  );
  
  const availableHours = params.maxWorkingHoursPerWeek * 4.33;
  const needsEmployee = requiredHours > availableHours;

  // Zusätzlicher Mitarbeiter bei Überschreitung der Arbeitszeit
  if (needsEmployee) {
    additionalCosts += params.employeeCostPerMonth;
    descriptions.push('Zusätzlicher Mitarbeiter');
  }

  return {
    additionalCosts,
    description: descriptions.join(', ') || 'Keine sprungfixen Kosten',
    requiredWorkingHours: requiredHours,
    availableWorkingHours: availableHours,
    needsEmployee,
  };
}
