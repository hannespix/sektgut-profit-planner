'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DynamicItemsSection from '@/components/forms/DynamicItemsSection';
import type { ProductionCosts } from '@/lib/types';

const schema = z.object({
  baseWinePerLiter: z.number().min(0),
  processingPerLiter: z.number().min(0),
  transportPerLiterKm: z.number().min(0),
  averageTransportDistance: z.number().min(0),
  bottling: z.object({
    filling: z.number().min(0),
    degorgement: z.number().min(0),
    bottles: z.number().min(0),
    labels: z.number().min(0),
    corks: z.number().min(0),
    agraffes: z.number().min(0),
    otherPackaging: z.number().min(0),
  }),
});

interface ProductionCostsFormProps {
  data: ProductionCosts;
  onChange: (data: ProductionCosts) => void;
  baseWinePurchasePrice?: number; // Einkaufspreis aus Grundparametern
}

export default function ProductionCostsForm({ data, onChange, baseWinePurchasePrice }: ProductionCostsFormProps) {
  const { register, handleSubmit, watch } = useForm<Omit<ProductionCosts, 'dynamicItems'>>({
    resolver: zodResolver(schema),
    defaultValues: {
      baseWinePerLiter: data.baseWinePerLiter,
      processingPerLiter: data.processingPerLiter,
      transportPerLiterKm: data.transportPerLiterKm,
      averageTransportDistance: data.averageTransportDistance,
      bottling: data.bottling,
    },
  });

  const formData = watch();

  const handleChange = () => {
    handleSubmit((newData) => onChange({ ...newData, dynamicItems: data.dynamicItems }))();
  };

  const totalBottlingCost =
    (formData.bottling?.filling || 0) +
    (formData.bottling?.degorgement || 0) +
    (formData.bottling?.bottles || 0) +
    (formData.bottling?.labels || 0) +
    (formData.bottling?.corks || 0) +
    (formData.bottling?.agraffes || 0) +
    (formData.bottling?.otherPackaging || 0);

  const costPerLiter =
    (formData.baseWinePerLiter || 0) +
    (formData.processingPerLiter || 0) +
    ((formData.transportPerLiterKm || 0) * (formData.averageTransportDistance || 0));

  return (
    <form onChange={handleChange} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Grundkosten pro Liter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="baseWinePerLiter">
              Grundwein (€/Liter)
              <span className="text-xs text-muted-foreground ml-2">(Typisch: 2,5-3,5 €/Liter)</span>
            </Label>
            <Input
              id="baseWinePerLiter"
              type="number"
              step="0.01"
              {...register('baseWinePerLiter', { valueAsNumber: true, onChange: handleChange })}
            />
            {baseWinePurchasePrice !== undefined && (
              <p className="text-xs text-muted-foreground">
                Hinweis: Einkaufspreis aus Grundparametern: {baseWinePurchasePrice.toFixed(2)} €/Liter
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Einkaufspreis für Sektgrundwein (vor Verarbeitung)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="processingPerLiter">
              Verarbeitung/Vergärung (€/Liter)
              <span className="text-xs text-muted-foreground ml-2">(Typisch: 0,5-1,0 €/Liter)</span>
            </Label>
            <Input
              id="processingPerLiter"
              type="number"
              step="0.01"
              {...register('processingPerLiter', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Kosten für Gärung, Lagerung, Reifung, Rütteln
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transportPerLiterKm">
              Transport (€/Liter/km)
              <span className="text-xs text-muted-foreground ml-2">(Typisch: 0,05-0,10 €/Liter/km)</span>
            </Label>
            <Input
              id="transportPerLiterKm"
              type="number"
              step="0.01"
              {...register('transportPerLiterKm', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Transportkosten für Grundwein (pro Liter und Kilometer)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="averageTransportDistance">
              Durchschnittliche Transportdistanz (km)
              <span className="text-xs text-muted-foreground ml-2">(Typisch: 20-50 km)</span>
            </Label>
            <Input
              id="averageTransportDistance"
              type="number"
              step="0.1"
              {...register('averageTransportDistance', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Durchschnittliche Entfernung zum Grundwein-Lieferanten
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Versektungskosten (pro Flasche 0,75L)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Typische Gesamtkosten: 1,50-2,50 €/Flasche (Standard), bis 4,50 €/Flasche (Premium)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filling">
              Abfüllung (€)
              <span className="text-xs text-muted-foreground ml-2">(Typisch: 0,15-0,25 €)</span>
            </Label>
            <Input
              id="filling"
              type="number"
              step="0.01"
              {...register('bottling.filling', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Kosten für Abfüllung (Arbeitszeit, Maschinen)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="degorgement">
              Degorierung/Enthefung (€)
              <span className="text-xs text-muted-foreground ml-2">(Typisch: 0,15-0,30 €)</span>
            </Label>
            <Input
              id="degorgement"
              type="number"
              step="0.01"
              {...register('bottling.degorgement', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Entfernung der Hefe nach der Flaschengärung
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bottles">
              Flasche (€)
              <span className="text-xs text-muted-foreground ml-2">(Standard: 0,50-0,80 €, Premium: bis 1,70 €)</span>
            </Label>
            <Input
              id="bottles"
              type="number"
              step="0.01"
              {...register('bottling.bottles', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Kosten für die Flasche selbst (0,75L Standard-Sektflasche)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="labels">
              Etikett (€)
              <span className="text-xs text-muted-foreground ml-2">(Standard: 0,15-0,25 €, Premium: bis 0,30 €)</span>
            </Label>
            <Input
              id="labels"
              type="number"
              step="0.01"
              {...register('bottling.labels', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Druck und Material für Etikett
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="corks">
              Korken/Verschluss (€)
              <span className="text-xs text-muted-foreground ml-2">(Standard: 0,30-0,50 €, Premium: bis 1,70 €)</span>
            </Label>
            <Input
              id="corks"
              type="number"
              step="0.01"
              {...register('bottling.corks', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Korken oder alternativer Verschluss (z.B. Kronkorken, Schraubverschluss)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agraffes">
              Agraffe/Drahtkäfig (€)
              <span className="text-xs text-muted-foreground ml-2">(Typisch: 0,10-0,15 €)</span>
            </Label>
            <Input
              id="agraffes"
              type="number"
              step="0.01"
              {...register('bottling.agraffes', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Drahtkäfig zur Sicherung des Korkens
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherPackaging">
              Sonstiges Verpackungsmaterial (€)
              <span className="text-xs text-muted-foreground ml-2">(Typisch: 0,15-0,40 €)</span>
            </Label>
            <Input
              id="otherPackaging"
              type="number"
              step="0.01"
              {...register('bottling.otherPackaging', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Karton, Folie, Geschenkverpackung, etc.
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">
            Gesamtkosten Versektung pro Flasche:{' '}
            <span className="font-bold">
              {(
                (formData.bottling?.filling || 0) +
                (formData.bottling?.degorgement || 0) +
                (formData.bottling?.bottles || 0) +
                (formData.bottling?.labels || 0) +
                (formData.bottling?.corks || 0) +
                (formData.bottling?.agraffes || 0) +
                (formData.bottling?.otherPackaging || 0)
              ).toFixed(2)} €
            </span>
          </p>
        </div>
      </div>

      <DynamicItemsSection
        items={data.dynamicItems || []}
        onChange={(items) => onChange({ ...data, dynamicItems: items })}
        categoryName="Produktionskosten/Einnahmen"
      />

      <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
        <p className="text-sm font-medium">
          Kosten pro Liter (ohne Versektung):{' '}
          <span className="font-bold">{costPerLiter.toFixed(2)} €</span>
        </p>
        <p className="text-sm font-medium">
          Versektungskosten pro Flasche:{' '}
          <span className="font-bold">{totalBottlingCost.toFixed(2)} €</span>
        </p>
      </div>
    </form>
  );
}
