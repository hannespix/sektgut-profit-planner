'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DynamicItemsSection from '@/components/forms/DynamicItemsSection';
import type { OperatingCosts } from '@/lib/types';

const schema = z.object({
  webServer: z.number().min(0),
  onlineShop: z.number().min(0),
  cms: z.number().min(0),
  marketing: z.number().min(0),
  office: z.number().min(0),
  other: z.number().min(0),
});

interface OperatingCostsFormProps {
  data: OperatingCosts;
  onChange: (data: OperatingCosts) => void;
}

export default function OperatingCostsForm({ data, onChange }: OperatingCostsFormProps) {
  const { register, handleSubmit, watch } = useForm<Omit<OperatingCosts, 'dynamicItems'>>({
    resolver: zodResolver(schema),
    defaultValues: {
      webServer: data.webServer,
      onlineShop: data.onlineShop,
      cms: data.cms,
      marketing: data.marketing,
      office: data.office,
      other: data.other,
    },
  });

  const formData = watch();

  const handleChange = () => {
    handleSubmit((newData) => onChange({ ...newData, dynamicItems: data.dynamicItems }))();
  };

  const total =
    (formData.webServer || 0) +
    (formData.onlineShop || 0) +
    (formData.cms || 0) +
    (formData.marketing || 0) +
    (formData.office || 0) +
    (formData.other || 0);

  return (
    <form onChange={handleChange} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="webServer">Webserver/Hosting (€/Monat)</Label>
          <Input
            id="webServer"
            type="number"
            step="0.01"
            {...register('webServer', { valueAsNumber: true, onChange: handleChange })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="onlineShop">Onlineshop-System (€/Monat)</Label>
          <Input
            id="onlineShop"
            type="number"
            step="0.01"
            {...register('onlineShop', { valueAsNumber: true, onChange: handleChange })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cms">CMS (€/Monat)</Label>
          <Input
            id="cms"
            type="number"
            step="0.01"
            {...register('cms', { valueAsNumber: true, onChange: handleChange })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marketing">Marketing/Vermarktung (€/Monat)</Label>
          <Input
            id="marketing"
            type="number"
            step="0.01"
            {...register('marketing', { valueAsNumber: true, onChange: handleChange })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="office">Büro/Infrastruktur (€/Monat)</Label>
          <Input
            id="office"
            type="number"
            step="0.01"
            {...register('office', { valueAsNumber: true, onChange: handleChange })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="other">Sonstige Betriebskosten (€/Monat)</Label>
          <Input
            id="other"
            type="number"
            step="0.01"
            {...register('other', { valueAsNumber: true, onChange: handleChange })}
          />
        </div>
      </div>

      <DynamicItemsSection
        items={data.dynamicItems || []}
        onChange={(items) => onChange({ ...data, dynamicItems: items })}
        categoryName="Betriebskosten/Einnahmen"
      />

      <div className="mt-4 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium">
          Gesamt Betriebskosten pro Monat:{' '}
          <span className="font-bold">
            {(
              total +
              ((data.dynamicItems || []).filter(i => i.type === 'fixed' && i.category === 'cost').reduce((s, i) => s + i.amount, 0)) -
              ((data.dynamicItems || []).filter(i => i.type === 'fixed' && i.category === 'revenue').reduce((s, i) => s + i.amount, 0))
            ).toFixed(2)} €
          </span>
        </p>
      </div>
    </form>
  );
}
