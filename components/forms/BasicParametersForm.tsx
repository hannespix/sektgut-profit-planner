'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SalesParameters } from '@/lib/types';
import ProductVariantsForm from './ProductVariantsForm';

const schema = z.object({
  pricePerLiterPrivate: z.number().min(0).optional(),
  businessDiscountPercent: z.number().min(0).max(100).optional(),
  businessCustomerShare: z.number().min(0).max(100).optional(),
  baseWinePurchasePrice: z.number().min(0).optional(),
  numberOfBottles: z.number().min(0).optional(),
  vatRate: z.number().min(0).max(100),
  incomeTaxRate: z.number().min(0).max(100),
  sektTaxPerLiter: z.number().min(0),
});

interface BasicParametersFormProps {
  data: SalesParameters & { productionCosts?: any };
  onChange: (data: SalesParameters) => void;
}

export default function BasicParametersForm({ data, onChange }: BasicParametersFormProps) {
  const { register, handleSubmit, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      pricePerLiterPrivate: data.pricePerLiterPrivate || 0,
      businessDiscountPercent: data.businessDiscountPercent || 0,
      businessCustomerShare: data.businessCustomerShare || 0,
      baseWinePurchasePrice: data.baseWinePurchasePrice || 0,
      numberOfBottles: data.numberOfBottles || 0,
      vatRate: data.vatRate,
      incomeTaxRate: data.incomeTaxRate,
      sektTaxPerLiter: data.sektTaxPerLiter,
    },
  });

  const formData = watch();

  const handleChange = () => {
    handleSubmit((newData) => {
      // Behalte productVariants bei, wenn vorhanden
      onChange({
        ...data,
        ...newData,
      });
    })();
  };

  const pricePerBottlePrivate = ((formData as any).pricePerLiterPrivate || 0) * 0.75;
  const discount = (formData.businessDiscountPercent || 0) / 100;
  const pricePerBottleBusiness = pricePerBottlePrivate * (1 - discount);
  const businessShare = (formData.businessCustomerShare || 0) / 100;
  const privateShare = 1 - businessShare;
  const averagePricePerBottle = pricePerBottlePrivate * privateShare + pricePerBottleBusiness * businessShare;
  const productionVolumeLiters = (formData.numberOfBottles || 0) * 0.75;

  const hasVariants = data.productVariants && data.productVariants.length > 0;
  const [useVariants, setUseVariants] = useState(hasVariants);

  return (
    <div className="space-y-4">
      <Tabs value={useVariants ? 'variants' : 'single'} onValueChange={(v) => setUseVariants(v === 'variants')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Einzelprodukt</TabsTrigger>
          <TabsTrigger value="variants">Sortiment (Varianten)</TabsTrigger>
        </TabsList>

        <TabsContent value="variants" className="space-y-4">
          <ProductVariantsForm 
            data={data} 
            onChange={onChange}
            defaultProductionCosts={data.productionCosts}
          />
        </TabsContent>

        <TabsContent value="single">
          <form onChange={handleChange} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pricePerLiterPrivate">Flaschenpreis pro Liter für Privatkunden (€)</Label>
          <Input
            id="pricePerLiterPrivate"
            type="number"
            step="0.01"
            {...register('pricePerLiterPrivate', { valueAsNumber: true, onChange: handleChange })}
          />
          <p className="text-xs text-muted-foreground">
            Pro Flasche (0,75L): {pricePerBottlePrivate.toFixed(2)} €
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDiscountPercent">Rabatt für Geschäftskunden (%)</Label>
          <Input
            id="businessDiscountPercent"
            type="number"
            step="0.1"
            {...register('businessDiscountPercent', { valueAsNumber: true, onChange: handleChange })}
          />
          <p className="text-xs text-muted-foreground">
            Pro Flasche: {pricePerBottleBusiness.toFixed(2)} €
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessCustomerShare">Geschäftskundenanteil (%)</Label>
          <Input
            id="businessCustomerShare"
            type="number"
            step="0.1"
            {...register('businessCustomerShare', { valueAsNumber: true, onChange: handleChange })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="baseWinePurchasePrice">Einkaufspreis Sektgrundwein (€/Liter)</Label>
          <Input
            id="baseWinePurchasePrice"
            type="number"
            step="0.01"
            {...register('baseWinePurchasePrice', { valueAsNumber: true, onChange: handleChange })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfBottles">Jahresproduktion: Anzahl der produzierten Flaschen (0,75L)</Label>
          <Input
            id="numberOfBottles"
            type="number"
            step="1"
            {...register('numberOfBottles', { valueAsNumber: true, onChange: handleChange })}
          />
          <p className="text-xs text-muted-foreground">
            Jahresproduktion: {productionVolumeLiters.toFixed(2)} Liter (einmal pro Jahr versektet, dann über das Jahr verkauft)
          </p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Steuern</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vatRate">Umsatzsteuer (%)</Label>
            <Input
              id="vatRate"
              type="number"
              step="0.1"
              {...register('vatRate', { valueAsNumber: true, onChange: handleChange })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="incomeTaxRate">Einkommenssteuer (%)</Label>
            <Input
              id="incomeTaxRate"
              type="number"
              step="0.1"
              {...register('incomeTaxRate', { valueAsNumber: true, onChange: handleChange })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sektTaxPerLiter">Sektsteuer (€/Liter)</Label>
            <Input
              id="sektTaxPerLiter"
              type="number"
              step="0.01"
              {...register('sektTaxPerLiter', { valueAsNumber: true, onChange: handleChange })}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
        <p className="text-sm font-medium">
          Durchschnittlicher Verkaufspreis pro Flasche:{' '}
          <span className="font-bold">{averagePricePerBottle.toFixed(2)} €</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Privatkunden: {pricePerBottlePrivate.toFixed(2)} € | Geschäftskunden: {pricePerBottleBusiness.toFixed(2)} €
        </p>
      </div>
    </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
