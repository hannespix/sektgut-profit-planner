import type { CalculationData } from './types';

const SCENARIOS_STORAGE_KEY = 'sektgut-kalkulator-scenarios';

export interface SavedScenario {
  id: string;
  name: string;
  data: CalculationData;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lädt alle gespeicherten Szenarien
 */
export function loadScenarios(): SavedScenario[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(SCENARIOS_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as SavedScenario[];
  } catch (error) {
    console.error('Fehler beim Laden der Szenarien:', error);
    return [];
  }
}

/**
 * Speichert ein Szenario
 */
export function saveScenario(scenario: Omit<SavedScenario, 'createdAt' | 'updatedAt'>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const scenarios = loadScenarios();
    const existingIndex = scenarios.findIndex(s => s.id === scenario.id);
    const now = new Date().toISOString();
    
    const scenarioToSave: SavedScenario = {
      ...scenario,
      createdAt: existingIndex >= 0 ? scenarios[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      scenarios[existingIndex] = scenarioToSave;
    } else {
      scenarios.push(scenarioToSave);
    }

    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(scenarios));
  } catch (error) {
    console.error('Fehler beim Speichern des Szenarios:', error);
  }
}

/**
 * Löscht ein Szenario
 */
export function deleteScenario(id: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const scenarios = loadScenarios();
    const filtered = scenarios.filter(s => s.id !== id);
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Fehler beim Löschen des Szenarios:', error);
  }
}

/**
 * Lädt ein spezifisches Szenario
 */
export function loadScenario(id: string): SavedScenario | null {
  const scenarios = loadScenarios();
  return scenarios.find(s => s.id === id) || null;
}
