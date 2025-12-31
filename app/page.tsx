'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, Target, Clock } from 'lucide-react';
import type { CalculationData } from '@/lib/types';
import { loadData, saveData, createDefaultData } from '@/lib/storage';
import { calculateResults } from '@/lib/calculations';
import Dashboard from '@/components/dashboard/Dashboard';
import InputWizard from '@/components/forms/InputWizard';
import ScenarioManager from '@/components/scenarios/ScenarioManager';
import ScenarioComparison from '@/components/scenarios/ScenarioComparison';

export default function Home() {
  const [data, setData] = useState<CalculationData>(createDefaultData());
  const [activeTab, setActiveTab] = useState<'input' | 'dashboard'>('dashboard');
  const [results, setResults] = useState(calculateResults(data));

  useEffect(() => {
    const saved = loadData();
    if (saved) {
      setData(saved);
      setResults(calculateResults(saved));
    }
  }, []);

  const handleDataChange = (newData: CalculationData) => {
    setData(newData);
    setResults(calculateResults(newData));
    saveData(newData);
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold">Sektgut Profit Planner</h1>
                <p className="text-xs text-muted-foreground">by Hannes Pix</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setActiveTab('dashboard')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === 'input' ? 'default' : 'outline'}
                onClick={() => setActiveTab('input')}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Eingaben
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' ? (
          <>
            <Dashboard data={data} results={results} onDataChange={handleDataChange} />
            <div className="mt-8 space-y-8">
              <ScenarioManager currentData={data} onLoadScenario={handleDataChange} />
              <ScenarioComparison onLoadScenario={handleDataChange} />
            </div>
          </>
        ) : (
          <InputWizard 
            data={data} 
            onDataChange={handleDataChange}
            onFinish={() => setActiveTab('dashboard')}
          />
        )}
      </main>
    </div>
  );
}
