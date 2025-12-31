'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { StepCostParameters } from '@/lib/types';

const schema = z.object({
  employeeCostPerMonth: z.number().min(0),
  maxWorkingHoursPerWeek: z.number().min(0).max(168),
  ordersPerBottle: z.number().min(0).max(1),
});

interface StepCostParametersFormProps {
  data: StepCostParameters;
  onChange: (data: StepCostParameters) => void;
}

export default function StepCostParametersForm({ data, onChange }: StepCostParametersFormProps) {
  const { register, handleSubmit, watch } = useForm<StepCostParameters>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const formData = watch();

  const handleChange = () => {
    handleSubmit((newData) => onChange(newData))();
  };

  const maxWorkingHoursPerMonth = (formData.maxWorkingHoursPerWeek || 0) * 4.33;

  return (
    <form onChange={handleChange} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxWorkingHoursPerWeek">Max. verfügbare Arbeitsstunden pro Woche</Label>
          <Input
            id="maxWorkingHoursPerWeek"
            type="number"
            step="0.5"
            {...register('maxWorkingHoursPerWeek', { valueAsNumber: true, onChange: handleChange })}
          />
          <p className="text-xs text-muted-foreground">
            Pro Monat: {maxWorkingHoursPerMonth.toFixed(1)} Stunden
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employeeCostPerMonth">Kosten pro zusätzlichem Mitarbeiter (€/Monat)</Label>
          <Input
            id="employeeCostPerMonth"
            type="number"
            step="10"
            {...register('employeeCostPerMonth', { valueAsNumber: true, onChange: handleChange })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ordersPerBottle">Bestellungen pro Flasche</Label>
          <Input
            id="ordersPerBottle"
            type="number"
            step="0.01"
            {...register('ordersPerBottle', { valueAsNumber: true, onChange: handleChange })}
          />
          <p className="text-xs text-muted-foreground">
            Beispiel: 0.1 = 1 Bestellung pro 10 Flaschen (10% werden einzeln bestellt)
          </p>
        </div>
      </div>
    </form>
  );
}
