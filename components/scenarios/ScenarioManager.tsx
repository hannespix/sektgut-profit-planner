'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Save, FolderOpen, Trash2, Plus } from 'lucide-react';
import type { CalculationData } from '@/lib/types';
import { loadScenarios, saveScenario, deleteScenario, type SavedScenario } from '@/lib/scenarioStorage';

interface ScenarioManagerProps {
  currentData: CalculationData;
  onLoadScenario: (data: CalculationData) => void;
}

export default function ScenarioManager({ currentData, onLoadScenario }: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  useEffect(() => {
    setScenarios(loadScenarios());
  }, []);

  const handleSave = () => {
    if (!scenarioName.trim()) {
      alert('Bitte geben Sie einen Namen für das Szenario ein.');
      return;
    }

    const newScenario: Omit<SavedScenario, 'createdAt' | 'updatedAt'> = {
      id: `scenario-${Date.now()}`,
      name: scenarioName.trim(),
      data: currentData,
    };

    saveScenario(newScenario);
    setScenarios(loadScenarios());
    setScenarioName('');
    setIsDialogOpen(false);
  };

  const handleLoad = (scenario: SavedScenario) => {
    if (confirm(`Möchten Sie das Szenario "${scenario.name}" laden? Aktuelle Daten werden überschrieben.`)) {
      onLoadScenario(scenario.data);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Möchten Sie das Szenario "${name}" wirklich löschen?`)) {
      deleteScenario(id);
      setScenarios(loadScenarios());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Szenarien verwalten</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Neues Szenario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Szenario speichern</DialogTitle>
              <DialogDescription>
                Speichern Sie die aktuellen Einstellungen als neues Szenario für den Vergleich.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="scenario-name">Szenario-Name</Label>
                <Input
                  id="scenario-name"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="z.B. Konservativ, Realistisch, Optimistisch"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSave();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {scenarios.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch keine Szenarien gespeichert.</p>
      ) : (
        <div className="space-y-2">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
            >
              <div className="flex-1">
                <p className="font-medium">{scenario.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(scenario.updatedAt).toLocaleDateString('de-DE')} •{' '}
                  {scenario.data.salesParameters.numberOfBottles} Flaschen
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoad(scenario)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Laden
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(scenario.id, scenario.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
