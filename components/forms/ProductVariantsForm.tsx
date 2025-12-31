'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Package, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProductVariant, SalesParameters, ProductionCosts } from '@/lib/types';
import { calculateCostPerBottleForVariant } from '@/lib/calculations';

interface ProductVariantsFormProps {
  data: SalesParameters;
  onChange: (data: SalesParameters) => void;
  defaultProductionCosts: ProductionCosts;
}

export default function ProductVariantsForm({ data, onChange, defaultProductionCosts }: ProductVariantsFormProps) {
  const variants = data.productVariants || [];

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `variant-${Date.now()}`,
      name: 'Neue Variante',
      numberOfBottles: 100,
      pricePerLiterPrivate: 20,
      businessDiscountPercent: 10,
      businessCustomerShare: 30,
    };
    onChange({
      ...data,
      productVariants: [...variants, newVariant],
    });
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    onChange({
      ...data,
      productVariants: variants.map(v => v.id === id ? { ...v, ...updates } : v),
    });
  };

  const deleteVariant = (id: string) => {
    if (variants.length <= 1) {
      alert('Mindestens eine Variante muss vorhanden sein.');
      return;
    }
    onChange({
      ...data,
      productVariants: variants.filter(v => v.id !== id),
    });
  };

  const totalBottles = variants.reduce((sum, v) => sum + v.numberOfBottles, 0);
  const totalLiters = totalBottles * 0.75;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Produktvarianten (Sortiment)</h3>
          <p className="text-sm text-muted-foreground">
            Definieren Sie verschiedene Sekt-Qualitätsstufen mit unterschiedlichen Preisen, Mengen und Gestehungskosten
          </p>
        </div>
        <Button onClick={addVariant} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Variante hinzufügen
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {variants.map((variant, index) => {
          const [showCosts, setShowCosts] = useState(false);
          const pricePerBottlePrivate = variant.pricePerLiterPrivate * 0.75;
          const discount = variant.businessDiscountPercent / 100;
          const pricePerBottleBusiness = pricePerBottlePrivate * (1 - discount);
          const businessShare = variant.businessCustomerShare / 100;
          const privateShare = 1 - businessShare;
          const averagePrice = pricePerBottlePrivate * privateShare + pricePerBottleBusiness * businessShare;
          const variantLiters = variant.numberOfBottles * 0.75;
          
          // Berechne Kosten pro Flasche für diese Variante
          const costPerBottle = calculateCostPerBottleForVariant(variant, defaultProductionCosts);
          const profitPerBottle = averagePrice - costPerBottle;
          const totalCosts = variant.numberOfBottles * costPerBottle;
          const totalRevenue = variant.numberOfBottles * averagePrice;
          const totalProfit = totalRevenue - totalCosts;

          return (
            <Card key={variant.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {variant.name || `Variante ${index + 1}`}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCosts(!showCosts)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Gestehungskosten
                      {showCosts ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                    </Button>
                    {variants.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteVariant(variant.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${variant.id}`}>Name der Variante</Label>
                    <Input
                      id={`name-${variant.id}`}
                      value={variant.name}
                      onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                      placeholder="z.B. Einfach, Classic, Premium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`bottles-${variant.id}`}>Anzahl Flaschen (0,75L)</Label>
                    <Input
                      id={`bottles-${variant.id}`}
                      type="number"
                      step="1"
                      value={variant.numberOfBottles}
                      onChange={(e) => updateVariant(variant.id, { numberOfBottles: Number(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">
                      {variantLiters.toFixed(2)} Liter
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`price-${variant.id}`}>Preis pro Liter (Privatkunden) (€)</Label>
                    <Input
                      id={`price-${variant.id}`}
                      type="number"
                      step="0.01"
                      value={variant.pricePerLiterPrivate}
                      onChange={(e) => updateVariant(variant.id, { pricePerLiterPrivate: Number(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Pro Flasche: {pricePerBottlePrivate.toFixed(2)} €
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`discount-${variant.id}`}>Rabatt Geschäftskunden (%)</Label>
                    <Input
                      id={`discount-${variant.id}`}
                      type="number"
                      step="0.1"
                      value={variant.businessDiscountPercent}
                      onChange={(e) => updateVariant(variant.id, { businessDiscountPercent: Number(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Pro Flasche: {pricePerBottleBusiness.toFixed(2)} €
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`share-${variant.id}`}>Geschäftskundenanteil (%)</Label>
                    <Input
                      id={`share-${variant.id}`}
                      type="number"
                      step="0.1"
                      value={variant.businessCustomerShare}
                      onChange={(e) => updateVariant(variant.id, { businessCustomerShare: Number(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Privat: {((1 - businessShare) * 100).toFixed(1)}% | Geschäft: {(businessShare * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {showCosts && (
                  <div className="pt-4 border-t space-y-4">
                    <CardDescription className="text-sm font-semibold mb-2">
                      Individuelle Gestehungskosten (leer = Standardkosten verwenden)
                    </CardDescription>
                    
                    <Tabs defaultValue="production" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="production">Produktion</TabsTrigger>
                        <TabsTrigger value="bottling">Versektung</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="production" className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`baseWine-${variant.id}`}>
                              Grundwein (€/Liter)
                              {variant.baseWinePerLiter === undefined && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (Standard: {defaultProductionCosts.baseWinePerLiter.toFixed(2)} €)
                                </span>
                              )}
                            </Label>
                            <Input
                              id={`baseWine-${variant.id}`}
                              type="number"
                              step="0.01"
                              value={variant.baseWinePerLiter ?? ''}
                              onChange={(e) => updateVariant(variant.id, { 
                                baseWinePerLiter: e.target.value ? Number(e.target.value) : undefined 
                              })}
                              placeholder={defaultProductionCosts.baseWinePerLiter.toFixed(2)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`processing-${variant.id}`}>
                              Verarbeitung (€/Liter)
                              {variant.processingPerLiter === undefined && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (Standard: {defaultProductionCosts.processingPerLiter.toFixed(2)} €)
                                </span>
                              )}
                            </Label>
                            <Input
                              id={`processing-${variant.id}`}
                              type="number"
                              step="0.01"
                              value={variant.processingPerLiter ?? ''}
                              onChange={(e) => updateVariant(variant.id, { 
                                processingPerLiter: e.target.value ? Number(e.target.value) : undefined 
                              })}
                              placeholder={defaultProductionCosts.processingPerLiter.toFixed(2)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`transport-${variant.id}`}>
                              Transport (€/Liter/km)
                              {variant.transportPerLiterKm === undefined && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (Standard: {defaultProductionCosts.transportPerLiterKm.toFixed(4)} €)
                                </span>
                              )}
                            </Label>
                            <Input
                              id={`transport-${variant.id}`}
                              type="number"
                              step="0.0001"
                              value={variant.transportPerLiterKm ?? ''}
                              onChange={(e) => updateVariant(variant.id, { 
                                transportPerLiterKm: e.target.value ? Number(e.target.value) : undefined 
                              })}
                              placeholder={defaultProductionCosts.transportPerLiterKm.toFixed(4)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`distance-${variant.id}`}>
                              Transportdistanz (km)
                              {variant.averageTransportDistance === undefined && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (Standard: {defaultProductionCosts.averageTransportDistance.toFixed(1)} km)
                                </span>
                              )}
                            </Label>
                            <Input
                              id={`distance-${variant.id}`}
                              type="number"
                              step="0.1"
                              value={variant.averageTransportDistance ?? ''}
                              onChange={(e) => updateVariant(variant.id, { 
                                averageTransportDistance: e.target.value ? Number(e.target.value) : undefined 
                              })}
                              placeholder={defaultProductionCosts.averageTransportDistance.toFixed(1)}
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="bottling" className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`filling-${variant.id}`}>
                              Abfüllung (€/Flasche)
                              {variant.bottling?.filling === undefined && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (Standard: {defaultProductionCosts.bottling.filling.toFixed(2)} €)
                                </span>
                              )}
                            </Label>
                            <Input
                              id={`filling-${variant.id}`}
                              type="number"
                              step="0.01"
                              value={variant.bottling?.filling ?? ''}
                              onChange={(e) => updateVariant(variant.id, { 
                                bottling: {
                                  ...variant.bottling,
                                  filling: e.target.value ? Number(e.target.value) : undefined
                                }
                              })}
                              placeholder={defaultProductionCosts.bottling.filling.toFixed(2)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`degorgement-${variant.id}`}>
                              Degorierung (€/Flasche)
                              {variant.bottling?.degorgement === undefined && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (Standard: {defaultProductionCosts.bottling.degorgement.toFixed(2)} €)
                                </span>
                              )}
                            </Label>
                            <Input
                              id={`degorgement-${variant.id}`}
                              type="number"
                              step="0.01"
                              value={variant.bottling?.degorgement ?? ''}
                              onChange={(e) => updateVariant(variant.id, { 
                                bottling: {
                                  ...variant.bottling,
                                  degorgement: e.target.value ? Number(e.target.value) : undefined
                                }
                              })}
                              placeholder={defaultProductionCosts.bottling.degorgement.toFixed(2)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`bottles-${variant.id}`}>
                              Flaschen (€/Flasche)
                              {variant.bottling?.bottles === undefined && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (Standard: {defaultProductionCosts.bottling.bottles.toFixed(2)} €)
                                </span>
                              )}
                            </Label>
                            <Input
                              id={`bottles-${variant.id}`}
                              type="number"
                              step="0.01"
                              value={variant.bottling?.bottles ?? ''}
                              onChange={(e) => updateVariant(variant.id, { 
                                bottling: {
                                  ...variant.bottling,
                                  bottles: e.target.value ? Number(e.target.value) : undefined
                                }
                              })}
                              placeholder={defaultProductionCosts.bottling.bottles.toFixed(2)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`labels-${variant.id}`}>
                              Etiketten (€/Flasche)
                              {variant.bottling?.labels === undefined && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (Standard: {defaultProductionCosts.bottling.labels.toFixed(2)} €)
                                </span>
                              )}
                            </Label>
                            <Input
                              id={`labels-${variant.id}`}
                              type="number"
                              step="0.01"
                              value={variant.bottling?.labels ?? ''}
                              onChange={(e) => updateVariant(variant.id, { 
                                bottling: {
                                  ...variant.bottling,
                                  labels: e.target.value ? Number(e.target.value) : undefined
                                }
                              })}
                              placeholder={defaultProductionCosts.bottling.labels.toFixed(2)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`corks-${variant.id}`}>
                              Korken (€/Flasche)
                              {variant.bottling?.corks === undefined && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (Standard: {defaultProductionCosts.bottling.corks.toFixed(2)} €)
                                </span>
                              )}
                            </Label>
                            <Input
                              id={`corks-${variant.id}`}
                              type="number"
                              step="0.01"
                              value={variant.bottling?.corks ?? ''}
                              onChange={(e) => updateVariant(variant.id, { 
                                bottling: {
                                  ...variant.bottling,
                                  corks: e.target.value ? Number(e.target.value) : undefined
                                }
                              })}
                              placeholder={defaultProductionCosts.bottling.corks.toFixed(2)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`agraffes-${variant.id}`}>
                              Agraffen (€/Flasche)
                              {variant.bottling?.agraffes === undefined && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (Standard: {defaultProductionCosts.bottling.agraffes.toFixed(2)} €)
                                </span>
                              )}
                            </Label>
                            <Input
                              id={`agraffes-${variant.id}`}
                              type="number"
                              step="0.01"
                              value={variant.bottling?.agraffes ?? ''}
                              onChange={(e) => updateVariant(variant.id, { 
                                bottling: {
                                  ...variant.bottling,
                                  agraffes: e.target.value ? Number(e.target.value) : undefined
                                }
                              })}
                              placeholder={defaultProductionCosts.bottling.agraffes.toFixed(2)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`other-${variant.id}`}>
                              Sonstiges Verpackungsmaterial (€/Flasche)
                              {variant.bottling?.otherPackaging === undefined && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (Standard: {defaultProductionCosts.bottling.otherPackaging.toFixed(2)} €)
                                </span>
                              )}
                            </Label>
                            <Input
                              id={`other-${variant.id}`}
                              type="number"
                              step="0.01"
                              value={variant.bottling?.otherPackaging ?? ''}
                              onChange={(e) => updateVariant(variant.id, { 
                                bottling: {
                                  ...variant.bottling,
                                  otherPackaging: e.target.value ? Number(e.target.value) : undefined
                                }
                              })}
                              placeholder={defaultProductionCosts.bottling.otherPackaging.toFixed(2)}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
                
                <div className="pt-2 border-t space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Ø Verkaufspreis pro Flasche:</span>
                    <span className="font-bold">{averagePrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Kosten pro Flasche:</span>
                    <span className="font-bold">{costPerBottle.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Gewinn pro Flasche:</span>
                    <span className={`font-bold ${profitPerBottle >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitPerBottle >= 0 ? '+' : ''}{profitPerBottle.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Erwarteter Umsatz (Jahr):</span>
                    <span className="font-bold">{totalRevenue.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Gesamtkosten (Jahr):</span>
                    <span className="font-bold">{totalCosts.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Gewinn (Jahr):</span>
                    <span className={`font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Gesamt Flaschen:</p>
              <p className="text-lg font-bold">{totalBottles}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Gesamt Liter:</p>
              <p className="text-lg font-bold">{totalLiters.toFixed(2)} L</p>
            </div>
            <div>
              <p className="text-muted-foreground">Anzahl Varianten:</p>
              <p className="text-lg font-bold">{variants.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ø Preis/Flasche:</p>
              <p className="text-lg font-bold">
                {variants.length > 0
                  ? (
                      variants.reduce((sum, v) => {
                        const pricePrivate = v.pricePerLiterPrivate * 0.75;
                        const priceBusiness = pricePrivate * (1 - v.businessDiscountPercent / 100);
                        const avg = pricePrivate * (1 - v.businessCustomerShare / 100) + priceBusiness * (v.businessCustomerShare / 100);
                        return sum + (avg * v.numberOfBottles);
                      }, 0) / totalBottles
                    ).toFixed(2)
                  : '0.00'
                } €
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
