'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { loadScenarios, type SavedScenario } from '@/lib/scenarioStorage';
import { calculateResults } from '@/lib/calculations';
import type { CalculationData } from '@/lib/types';

interface ScenarioComparisonProps {
  onLoadScenario: (data: CalculationData) => void;
}

export default function ScenarioComparison({ onLoadScenario }: ScenarioComparisonProps) {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  useEffect(() => {
    setScenarios(loadScenarios());
  }, []);

  const toggleScenario = (id: string) => {
    setSelectedScenarios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectedScenarioData = scenarios.filter((s) => selectedScenarios.includes(s.id));

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Keine Szenarien zum Vergleichen vorhanden. Speichern Sie zuerst einige Szenarien.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Szenario-Vergleich</h3>
        {selectedScenarios.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedScenarios([])}
          >
            <X className="h-4 w-4 mr-2" />
            Auswahl löschen
          </Button>
        )}
      </div>

      {/* Szenario-Auswahl */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenarios.map((scenario) => {
          const isSelected = selectedScenarios.includes(scenario.id);
          const results = calculateResults(scenario.data);
          
          return (
            <Card
              key={scenario.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary border-2 bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => toggleScenario(scenario.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{scenario.name}</CardTitle>
                  {isSelected && (
                    <Badge variant="default" className="text-xs">Ausgewählt</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    {scenario.data.salesParameters.numberOfBottles} Flaschen
                  </p>
                  <p className="text-muted-foreground">
                    {(scenario.data.salesParameters.pricePerLiterPrivate || 0).toFixed(2)} €/L
                  </p>
                  <p className={`font-semibold ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.netProfit >= 0 ? '+' : ''}{results.netProfit.toFixed(0)} € Gewinn/Jahr
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Vergleichstabelle */}
      {selectedScenarios.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Vergleichstabelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Kennzahl</th>
                    {selectedScenarioData.map((scenario) => (
                      <th key={scenario.id} className="text-right p-2 font-semibold">
                        {scenario.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedScenarioData.map((scenario) => {
                    const results = calculateResults(scenario.data);
                    return null; // Wird in separaten Zeilen gerendert
                  })}
                  <tr className="border-b">
                    <td className="p-2">Jahresproduktion</td>
                    {selectedScenarioData.map((scenario) => {
                      const results = calculateResults(scenario.data);
                      return (
                        <td key={scenario.id} className="text-right p-2">
                          {results.numberOfBottles} Flaschen
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Verkaufspreis (Ø)</td>
                    {selectedScenarioData.map((scenario) => {
                      const results = calculateResults(scenario.data);
                      return (
                        <td key={scenario.id} className="text-right p-2">
                          {results.averagePricePerBottle.toFixed(2)} €
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Gesamtumsatz</td>
                    {selectedScenarioData.map((scenario) => {
                      const results = calculateResults(scenario.data);
                      return (
                        <td key={scenario.id} className="text-right p-2">
                          {results.totalRevenue.toFixed(0)} €
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Gesamtkosten</td>
                    {selectedScenarioData.map((scenario) => {
                      const results = calculateResults(scenario.data);
                      return (
                        <td key={scenario.id} className="text-right p-2">
                          {results.totalCostsPerYear.toFixed(0)} €
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b font-semibold">
                    <td className="p-2">Reingewinn</td>
                    {selectedScenarioData.map((scenario) => {
                      const results = calculateResults(scenario.data);
                      return (
                        <td
                          key={scenario.id}
                          className={`text-right p-2 ${
                            results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {results.netProfit >= 0 ? '+' : ''}
                          {results.netProfit.toFixed(0)} €
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Break-Even (Flasche)</td>
                    {selectedScenarioData.map((scenario) => {
                      const results = calculateResults(scenario.data);
                      return (
                        <td key={scenario.id} className="text-right p-2">
                          {isFinite(results.breakEvenBottles)
                            ? Math.ceil(results.breakEvenBottles)
                            : 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-2">Stundenlohn</td>
                    {selectedScenarioData.map((scenario) => {
                      const results = calculateResults(scenario.data);
                      return (
                        <td key={scenario.id} className="text-right p-2">
                          {results.hourlyWage.toFixed(2)} €/h
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
