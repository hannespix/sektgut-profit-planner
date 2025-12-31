'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DynamicItemsSection from '@/components/forms/DynamicItemsSection';
import type { PersonalCosts } from '@/lib/types';

const schema = z.object({
  healthInsurance: z.number().min(0),
  pensionInsurance: z.number().min(0),
  nursingInsurance: z.number().min(0),
  otherSocialInsurance: z.number().min(0),
  livingCosts: z.number().min(0),
});

interface PersonalCostsFormProps {
  data: PersonalCosts;
  onChange: (data: PersonalCosts) => void;
}

export default function PersonalCostsForm({ data, onChange }: PersonalCostsFormProps) {
  const { register, handleSubmit, watch } = useForm<Omit<PersonalCosts, 'dynamicItems'>>({
    resolver: zodResolver(schema),
    defaultValues: {
      healthInsurance: data.healthInsurance,
      pensionInsurance: data.pensionInsurance,
      nursingInsurance: data.nursingInsurance,
      otherSocialInsurance: data.otherSocialInsurance,
      livingCosts: data.livingCosts,
    },
  });

  const formData = watch();

  // Auto-save bei Änderungen
  const handleChange = () => {
    handleSubmit((newData) => onChange({ ...newData, dynamicItems: data.dynamicItems }))();
  };

  return (
    <form onChange={handleChange} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Sozialversicherungen (betriebliche Kosten)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="healthInsurance">Krankenversicherung (€/Monat)</Label>
            <Input
              id="healthInsurance"
              type="number"
              step="0.01"
              {...register('healthInsurance', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Krankenversicherung für Selbstständige
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pensionInsurance">Rentenversicherung (€/Monat)</Label>
            <Input
              id="pensionInsurance"
              type="number"
              step="0.01"
              {...register('pensionInsurance', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Rentenversicherung für Selbstständige
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nursingInsurance">Pflegeversicherung (€/Monat)</Label>
            <Input
              id="nursingInsurance"
              type="number"
              step="0.01"
              {...register('nursingInsurance', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Pflegeversicherung für Selbstständige
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherSocialInsurance">Sonstige Sozialversicherungen (€/Monat)</Label>
            <Input
              id="otherSocialInsurance"
              type="number"
              step="0.01"
              {...register('otherSocialInsurance', { valueAsNumber: true, onChange: handleChange })}
            />
            <p className="text-xs text-muted-foreground">
              Weitere Versicherungen (z.B. Berufsunfähigkeit)
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Persönliche Referenzwerte</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Diese Werte sind <strong>keine Betriebskosten</strong>, sondern dienen als Referenz, um zu prüfen, ob der Gewinn ausreicht.
        </p>
        <div className="space-y-2">
          <Label htmlFor="livingCosts">
            Lebenshaltungskosten (€/Monat)
            <span className="text-xs text-muted-foreground ml-2">(Optional, nur als Referenz)</span>
          </Label>
          <Input
            id="livingCosts"
            type="number"
            step="0.01"
            {...register('livingCosts', { valueAsNumber: true, onChange: handleChange })}
          />
          <p className="text-xs text-muted-foreground">
            Ihre persönlichen Lebenshaltungskosten (Miete, Essen, etc.). Diese werden vom Gewinn bezahlt, sind aber keine Betriebskosten.
          </p>
        </div>
      </div>

      <DynamicItemsSection
        items={data.dynamicItems || []}
        onChange={(items) => onChange({ ...data, dynamicItems: items })}
        categoryName="persönliche Kosten/Einnahmen"
      />

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-medium mb-2">
          Betriebliche Sozialversicherungen pro Monat:{' '}
          <span className="font-bold">
            {(
              (formData.healthInsurance || 0) +
              (formData.pensionInsurance || 0) +
              (formData.nursingInsurance || 0) +
              (formData.otherSocialInsurance || 0) +
              ((data.dynamicItems || []).filter(i => i.type === 'fixed' && i.category === 'cost').reduce((s, i) => s + i.amount, 0)) -
              ((data.dynamicItems || []).filter(i => i.type === 'fixed' && i.category === 'revenue').reduce((s, i) => s + i.amount, 0))
            ).toFixed(2)} €
          </span>
        </p>
        {formData.livingCosts > 0 && (
          <p className="text-xs text-muted-foreground">
            Lebenshaltungskosten (Referenz): {formData.livingCosts.toFixed(2)} €/Monat
          </p>
        )}
      </div>
    </form>
  );
}
