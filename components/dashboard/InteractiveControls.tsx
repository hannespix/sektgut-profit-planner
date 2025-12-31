'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CalculationData } from '@/lib/types';

interface InteractiveControlsProps {
  data: CalculationData;
  onDataChange: (data: CalculationData) => void;
}

export default function InteractiveControls({ data, onDataChange }: InteractiveControlsProps) {
  const handleSliderChange = (key: string, value: number[]) => {
    const newValue = value[0];
    
    if (key.startsWith('sales.')) {
      const field = key.replace('sales.', '') as keyof CalculationData['salesParameters'];
      onDataChange({
        ...data,
        salesParameters: {
          ...data.salesParameters,
          [field]: newValue,
        },
      });
    } else if (key.startsWith('production.')) {
      const field = key.replace('production.', '');
      if (field === 'baseWinePerLiter') {
        // Synchronisiere mit Grundparametern
        onDataChange({
          ...data,
          productionCosts: {
            ...data.productionCosts,
            baseWinePerLiter: newValue,
          },
          salesParameters: {
            ...data.salesParameters,
            baseWinePurchasePrice: newValue,
          },
        });
      } else if (field.startsWith('bottling.')) {
        const bottlingField = field.replace('bottling.', '') as keyof CalculationData['productionCosts']['bottling'];
        onDataChange({
          ...data,
          productionCosts: {
            ...data.productionCosts,
            bottling: {
              ...data.productionCosts.bottling,
              [bottlingField]: newValue,
            },
          },
        });
      } else {
        const prodField = field as keyof CalculationData['productionCosts'];
        onDataChange({
          ...data,
          productionCosts: {
            ...data.productionCosts,
            [prodField]: newValue,
          },
        });
      }
    } else if (key.startsWith('operating.')) {
      const field = key.replace('operating.', '') as keyof CalculationData['operatingCosts'];
      onDataChange({
        ...data,
        operatingCosts: {
          ...data.operatingCosts,
          [field]: newValue,
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interaktive Parameter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Verkaufsparameter</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Preis pro Liter (Privatkunden)</Label>
              <span className="text-sm font-medium">{(data.salesParameters.pricePerLiterPrivate || 0).toFixed(2)} €</span>
            </div>
            <Slider
              value={[data.salesParameters.pricePerLiterPrivate || 0]}
              onValueChange={(value) => handleSliderChange('sales.pricePerLiterPrivate', value)}
              min={5}
              max={50}
              step={0.5}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Rabatt Geschäftskunden</Label>
              <span className="text-sm font-medium">{(data.salesParameters.businessDiscountPercent || 0).toFixed(1)} %</span>
            </div>
            <Slider
              value={[data.salesParameters.businessDiscountPercent || 0]}
              onValueChange={(value) => handleSliderChange('sales.businessDiscountPercent', value)}
              min={0}
              max={50}
              step={0.5}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Geschäftskundenanteil</Label>
              <span className="text-sm font-medium">{(data.salesParameters.businessCustomerShare || 0).toFixed(1)} %</span>
            </div>
            <Slider
              value={[data.salesParameters.businessCustomerShare || 0]}
              onValueChange={(value) => handleSliderChange('sales.businessCustomerShare', value)}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Anzahl Flaschen</Label>
              <span className="text-sm font-medium">{(data.salesParameters.numberOfBottles || 0).toFixed(0)}</span>
            </div>
            <Slider
              value={[data.salesParameters.numberOfBottles || 0]}
              onValueChange={(value) => handleSliderChange('sales.numberOfBottles', value)}
              min={100}
              max={10000}
              step={50}
            />
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold">Produktionskosten</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Grundwein (€/Liter)</Label>
              <span className="text-sm font-medium">{data.productionCosts.baseWinePerLiter.toFixed(2)} €</span>
            </div>
            <Slider
              value={[data.productionCosts.baseWinePerLiter]}
              onValueChange={(value) => handleSliderChange('production.baseWinePerLiter', value)}
              min={0.5}
              max={10}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Verarbeitung (€/Liter)</Label>
              <span className="text-sm font-medium">{data.productionCosts.processingPerLiter.toFixed(2)} €</span>
            </div>
            <Slider
              value={[data.productionCosts.processingPerLiter]}
              onValueChange={(value) => handleSliderChange('production.processingPerLiter', value)}
              min={0}
              max={5}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Flaschen (€/Flasche)</Label>
              <span className="text-sm font-medium">{data.productionCosts.bottling.bottles.toFixed(2)} €</span>
            </div>
            <Slider
              value={[data.productionCosts.bottling.bottles]}
              onValueChange={(value) => handleSliderChange('production.bottling.bottles', value)}
              min={0.2}
              max={2.0}
              step={0.05}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Korken (€/Flasche)</Label>
              <span className="text-sm font-medium">{data.productionCosts.bottling.corks.toFixed(2)} €</span>
            </div>
            <Slider
              value={[data.productionCosts.bottling.corks]}
              onValueChange={(value) => handleSliderChange('production.bottling.corks', value)}
              min={0.1}
              max={2.0}
              step={0.05}
            />
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold">Betriebskosten (monatlich)</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Marketing</Label>
              <span className="text-sm font-medium">{data.operatingCosts.marketing.toFixed(2)} €</span>
            </div>
            <Slider
              value={[data.operatingCosts.marketing]}
              onValueChange={(value) => handleSliderChange('operating.marketing', value)}
              min={0}
              max={2000}
              step={10}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Webserver/Onlineshop</Label>
              <span className="text-sm font-medium">{(data.operatingCosts.webServer + data.operatingCosts.onlineShop).toFixed(2)} €</span>
            </div>
            <Slider
              value={[data.operatingCosts.webServer + data.operatingCosts.onlineShop]}
              onValueChange={(value) => {
                const total = data.operatingCosts.webServer + data.operatingCosts.onlineShop;
                const ratio = total > 0 ? data.operatingCosts.webServer / total : 0.4;
                onDataChange({
                  ...data,
                  operatingCosts: {
                    ...data.operatingCosts,
                    webServer: value[0] * ratio,
                    onlineShop: value[0] * (1 - ratio),
                  },
                });
              }}
              min={0}
              max={200}
              step={5}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
