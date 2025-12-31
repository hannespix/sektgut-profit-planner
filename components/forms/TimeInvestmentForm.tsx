'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import type { TimeInvestment } from '@/lib/types';
import { calculateProductiveHoursPerYear } from '@/lib/calculations';

const schema = z.object({
  minutesPerBottle: z.number().min(0),
  hoursPerOrder: z.number().min(0),
  hoursPerMarketing: z.number().min(0),
  workingHoursPerWeek: z.number().min(0).max(168),
  vacationDaysPerYear: z.number().min(0).max(365),
  sickDaysPerYear: z.number().min(0).max(365),
  publicHolidaysPerYear: z.number().min(0).max(365),
  productiveHoursPercentage: z.number().min(0).max(100),
});

interface TimeInvestmentFormProps {
  data: TimeInvestment;
  onChange: (data: TimeInvestment) => void;
}

export default function TimeInvestmentForm({ data, onChange }: TimeInvestmentFormProps) {
  const { register, handleSubmit, watch } = useForm<TimeInvestment>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const formData = watch();

  const handleChange = () => {
    handleSubmit((newData) => onChange(newData))();
  };

  // Berechne produktive Stunden
  const productiveHoursPerYear = calculateProductiveHoursPerYear(
    formData.workingHoursPerWeek || 0,
    formData.vacationDaysPerYear || 0,
    formData.sickDaysPerYear || 0,
    formData.publicHolidaysPerYear || 0,
    formData.productiveHoursPercentage || 0
  );
  const productiveHoursPerMonth = productiveHoursPerYear / 12;
  const productiveHoursPerWeek = productiveHoursPerYear / 52;

  return (
    <form onChange={handleChange} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Zeitaufwand pro Einheit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minutesPerBottle">
              Minuten pro Flasche
              <span className="text-xs text-muted-foreground ml-2">(Typisch: 5-10 Min/Flasche)</span>
            </Label>
            <Input
              id="minutesPerBottle"
              type="number"
              step="0.5"
              {...register('minutesPerBottle', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Gesamtzeit: Abfüllung (1-2 Min) + Degorgement (0,5-1 Min) + Etikettierung (0,5-1 Min) + Verpackung (1-2 Min) + sonstiges (2-4 Min)
            </p>
            <p className="text-xs text-muted-foreground">
              Beispiel: 7 Minuten = ca. 8-9 Flaschen pro Stunde
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hoursPerOrder">
              Stunden pro Bestellung
              <span className="text-xs text-muted-foreground ml-2">(Typisch: 0,5-1,5 Stunden)</span>
            </Label>
            <Input
              id="hoursPerOrder"
              type="number"
              step="0.1"
              {...register('hoursPerOrder', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Zeit für Bestellabwicklung, Verpackung, Versand, Rechnung, Kundenkommunikation
            </p>
            <p className="text-xs text-muted-foreground">
              Abhängig von Bestellgröße: Einzelflasche (0,5-1h) vs. Großbestellung (1-2h)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hoursPerMarketing">
              Stunden Marketing pro Monat
            </Label>
            <Input
              id="hoursPerMarketing"
              type="number"
              step="0.5"
              {...register('hoursPerMarketing', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Zeit für Social Media, Werbung, Kundenakquise
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Verfügbare Arbeitszeit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workingHoursPerWeek">Arbeitsstunden pro Woche</Label>
            <Input
              id="workingHoursPerWeek"
              type="number"
              step="0.5"
              {...register('workingHoursPerWeek', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Ihre verfügbare Arbeitszeit pro Woche
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productiveHoursPercentage">
              Produktive Stunden (%)
              <span className="text-xs text-muted-foreground ml-2">(Rest für Admin, Meetings)</span>
            </Label>
            <Input
              id="productiveHoursPercentage"
              type="number"
              step="1"
              {...register('productiveHoursPercentage', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Anteil der Zeit, die produktiv genutzt wird (z.B. 80% = 20% für Admin)
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Ausfallzeiten pro Jahr</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vacationDaysPerYear">Urlaubstage</Label>
            <Input
              id="vacationDaysPerYear"
              type="number"
              step="1"
              {...register('vacationDaysPerYear', { valueAsNumber: true, onChange: handleChange })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sickDaysPerYear">Krankheitstage</Label>
            <Input
              id="sickDaysPerYear"
              type="number"
              step="1"
              {...register('sickDaysPerYear', { valueAsNumber: true, onChange: handleChange })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publicHolidaysPerYear">Feiertage</Label>
            <Input
              id="publicHolidaysPerYear"
              type="number"
              step="1"
              {...register('publicHolidaysPerYear', { valueAsNumber: true, onChange: handleChange })}
            />
          </div>
        </div>
      </div>

      {/* Zusammenfassung */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Berechnete produktive Arbeitszeit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Pro Jahr:</p>
              <p className="text-lg font-bold">{productiveHoursPerYear.toFixed(0)} Stunden</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pro Monat:</p>
              <p className="text-lg font-bold">{productiveHoursPerMonth.toFixed(0)} Stunden</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pro Woche:</p>
              <p className="text-lg font-bold">{productiveHoursPerWeek.toFixed(1)} Stunden</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pro Tag:</p>
              <p className="text-lg font-bold">{(productiveHoursPerWeek / 5).toFixed(1)} Stunden</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Diese Werte berücksichtigen Urlaub, Krankheit, Feiertage und unproduktive Zeiten.
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
