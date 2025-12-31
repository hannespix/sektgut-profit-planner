'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Clock, 
  Package, 
  Receipt,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  PieChart,
  LineChart,
  ChevronDown,
  ChevronUp,
  Info,
  Zap
} from 'lucide-react';
import type { CalculationData, CalculationResults } from '@/lib/types';
import CostDistributionChart from '@/components/charts/CostDistributionChart';
import ProfitThresholdsChart from '@/components/charts/ProfitThresholdsChart';
import DynamicBreakEvenChart from '@/components/charts/DynamicBreakEvenChart';
import ProductionFlowchart from '@/components/diagrams/ProductionFlowchart';
import InteractiveControls from '@/components/dashboard/InteractiveControls';
import PDFExport from '@/components/export/PDFExport';
import ClickableValue from '@/components/explanation/ClickableValue';

interface DashboardProps {
  data: CalculationData;
  results: CalculationResults;
  onDataChange?: (data: CalculationData) => void;
}

export default function Dashboard({ data, results, onDataChange }: DashboardProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    critical: true,
    details: false,
    charts: true,
  });

  const isProfitable = results.netProfit > 0;
  const profitMargin = results.totalRevenue > 0 
    ? (results.netProfit * Math.pow(results.totalRevenue, -1)) * 100 
    : 0;
  
  // Berechne Aufschlüsselung der Arbeitszeit
  const productionHours = (results.numberOfBottles * data.timeInvestment.minutesPerBottle) * Math.pow(60, -1);
  const numberOfOrders = results.numberOfBottles * data.stepCostParameters.ordersPerBottle;
  const orderHours = numberOfOrders * data.timeInvestment.hoursPerOrder;
  const marketingHours = data.timeInvestment.hoursPerMarketing;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calculateAvgPrice = (revenue: number, bottles: number) => {
    if (bottles <= 0) return 0;
    return revenue * Math.pow(bottles, -1);
  };

  return (
    <div className="space-y-6">
      {/* Header mit PDF-Export */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <PDFExport data={data} results={results} />
      </div>

      {/* Interaktive Steuerung */}
      {onDataChange && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interaktive Parameter
            </CardTitle>
            <CardDescription>
              Passen Sie die wichtigsten Werte an und sehen Sie die Auswirkungen in Echtzeit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InteractiveControls data={data} onDataChange={onDataChange} />
          </CardContent>
        </Card>
      )}

      {/* Executive Summary - Wichtigste KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={isProfitable ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/10' : 'border-red-500/50 bg-red-50/50 dark:bg-red-900/10'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reingewinn/Monat</CardTitle>
            {isProfitable ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={isProfitable ? 'text-3xl font-bold text-green-600' : 'text-3xl font-bold text-red-600'}>
              <ClickableValue
                value={results.netProfitPerMonth}
                type="netProfit"
                data={data}
                results={results}
                format={(v) => (v >= 0 ? '+' : '') + v.toFixed(0) + ' EUR'}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={isProfitable ? 'default' : 'destructive'} className="text-xs">
                {isProfitable ? 'Profitabel' : 'Verlust'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {profitMargin.toFixed(1)}% Marge
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monatlicher Umsatz</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <ClickableValue
                value={results.revenuePerMonth}
                type="totalRevenue"
                data={data}
                results={results}
                format={(v) => v.toFixed(0) + ' EUR'}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {results.numberOfBottles} Flaschen × {results.averagePricePerBottle.toFixed(2)} EUR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Break-Even</CardTitle>
            <Target className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {results.breakEvenBottles > 0 && isFinite(results.breakEvenBottles) ? (
                <ClickableValue
                  value={results.breakEvenBottles}
                  type="breakEven"
                  data={data}
                  results={results}
                  format={(v) => `${Math.ceil(v)}`}
                />
              ) : (
                'N/A'
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {results.numberOfBottles >= (results.breakEvenBottles || 0) ? (
                <Badge variant="default" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Erreicht
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Noch {Math.ceil((results.breakEvenBottles || 0) - results.numberOfBottles)} Flaschen
                </Badge>
              )}
            </div>
            {results.breakEvenTime && results.breakEvenTime.year !== Infinity && (
              <p className="text-xs text-muted-foreground mt-2">
                Break-Even erreicht: {results.breakEvenTime.description}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stundenlohn</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <ClickableValue
                value={results.hourlyWage}
                type="hourlyWage"
                data={data}
                results={results}
                format={(v) => v.toFixed(2) + ' EUR pro Stunde'}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Netto-Gewinn pro produktive Stunde
            </p>
            {data.personalCosts.livingCosts > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Lebenshaltungskosten: {data.personalCosts.livingCosts.toFixed(0)} EUR/Monat
                {results.netProfitPerMonth >= data.personalCosts.livingCosts ? (
                  <span className="text-green-600 ml-1">✓ Gedeckt</span>
                ) : (
                  <span className="text-red-600 ml-1">⚠️ Nicht gedeckt</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kritische Kennzahlen & Warnungen */}
      {(results.criticalPoints.length > 0 || results.stepCosts.additionalCosts > 0 || results.stepCosts.needsEmployee) && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Kritische Kennzahlen & Warnungen
                </CardTitle>
                <CardDescription>
                  Wichtige Meilensteine und Handlungsempfehlungen
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('critical')}
              >
                {expandedSections.critical ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          </CardHeader>
          {expandedSections.critical && (
            <CardContent className="space-y-4">
              {results.stepCosts.needsEmployee && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                        ⚠️ Zusätzliche Arbeitszeit erforderlich!
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                        Die benötigte Arbeitszeit übersteigt Ihre verfügbare Kapazität. Ein zusätzlicher Mitarbeiter wird empfohlen.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-red-600 dark:text-red-400 font-medium">
                            Benötigt: {results.stepCosts.requiredWorkingHours.toFixed(1)}h/Monat
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Produktion: {productionHours.toFixed(1)}h | Bestellungen: {orderHours.toFixed(1)}h | Marketing: {marketingHours.toFixed(0)}h
                          </p>
                        </div>
                        <div>
                          <p className="text-red-600 dark:text-red-400 font-medium">
                            Verfügbar: {results.stepCosts.availableWorkingHours.toFixed(1)}h/Monat
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Fehlend: {(results.stepCosts.requiredWorkingHours - results.stepCosts.availableWorkingHours).toFixed(1)}h/Monat
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {results.stepCosts.additionalCosts > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                        Sprungfixe Kosten aktiv
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {results.stepCosts.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                        +{results.stepCosts.additionalCosts.toFixed(0)} EUR/Monat
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!results.stepCosts.needsEmployee && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-800 dark:text-green-200">
                        ✓ Arbeitszeit ausreichend
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Reserve: {(results.stepCosts.availableWorkingHours - results.stepCosts.requiredWorkingHours).toFixed(1)} h/Monat
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {results.criticalPoints.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Kritische Meilensteine</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.criticalPoints.map((point, index) => (
                      <div
                        key={index}
                        className={point.type === 'break-even'
                            ? 'p-3 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : point.type === 'cost'
                            ? 'p-3 rounded-lg border bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                            : point.type === 'milestone'
                            ? 'p-3 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-sm mb-1">{point.description}</h5>
                            <p className="text-xs text-muted-foreground">{point.impact}</p>
                          </div>
                          <div className="text-right ml-3">
                            <p className="text-lg font-bold">{point.bottles.toFixed(0)}</p>
                            <p className="text-xs text-muted-foreground">Flaschen</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Finanzübersicht mit Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="revenue">Umsätze</TabsTrigger>
          <TabsTrigger value="costs">Kosten</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Umsatz & Gewinn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gesamtumsatz (Jahr):</span>
                    <span className="font-bold text-lg">{results.totalRevenue.toFixed(0)} EUR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gesamtumsatz (Monat):</span>
                    <span className="font-medium">{results.revenuePerMonth.toFixed(0)} EUR</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-semibold">Bruttogewinn (Jahr):</span>
                    <span className="font-bold text-lg">{results.grossProfit.toFixed(0)} EUR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Reingewinn (Jahr):</span>
                    <span className={isProfitable ? 'font-bold text-lg text-green-600' : 'font-bold text-lg text-red-600'}>
                      {results.netProfit.toFixed(0)} EUR
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Reingewinn (Monat):</span>
                    <span className={isProfitable ? 'font-bold text-green-600' : 'font-bold text-red-600'}>
                      {results.netProfitPerMonth.toFixed(0)} EUR
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Steuern
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Umsatzsteuer:</span>
                    <span className="font-medium">{results.vatAmount.toFixed(0)} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sektsteuer:</span>
                    <span className="font-medium">{results.sektTaxAmount.toFixed(0)} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Einkommenssteuer:</span>
                    <span className="font-medium">{results.incomeTaxAmount.toFixed(0)} EUR</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-semibold">Gesamtsteuern:</span>
                    <span className="font-bold text-lg">{results.totalTaxes.toFixed(0)} EUR</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produktion & Preise
                  {results.productVariants && results.productVariants.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({results.productVariants.length} Varianten)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.productVariants && results.productVariants.length > 0 ? (
                  <div className="space-y-4">
                    {results.productVariants.map((pv, idx) => {
                      const avgPricePerBottle = calculateAvgPrice(pv.revenue.totalRevenue, pv.variant.numberOfBottles);
                      return (
                        <div key={pv.variant.id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{pv.variant.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {pv.variant.numberOfBottles} Flaschen
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Umsatz:</span>
                              <span className="ml-2 font-medium">{pv.revenue.totalRevenue.toFixed(2)} EUR</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Kosten pro Flasche:</span>
                              <span className="ml-2 font-medium">{pv.costPerBottle.toFixed(2) + ' EUR'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Ø Preis pro Flasche:</span>
                              <span className="ml-2 font-medium">
                                {avgPricePerBottle.toFixed(2) + ' EUR'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Gewinn:</span>
                              <span className={pv.profit >= 0 ? 'ml-2 font-medium text-green-600' : 'ml-2 font-medium text-red-600'}>
                                {pv.profit >= 0 ? '+' : ''}{pv.profit.toFixed(2) + ' EUR'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gesamt Flaschen:</span>
                        <span className="font-bold">{results.numberOfBottles}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Flaschen pro Monat:</span>
                      <span className="font-medium">{results.numberOfBottles.toFixed(0)}</span>
                    </div>
                  </div>
                )}
                {/* {results.productVariants && results.productVariants.length > 0 ? (
                  <div className="space-y-4">
                    {results.productVariants.map((pv, idx) => {
                      const avgPricePerBottle = calculateAvgPrice(pv.revenue.totalRevenue, pv.variant.numberOfBottles);
                      return (
                        <div key={pv.variant.id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{pv.variant.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {pv.variant.numberOfBottles} Flaschen
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Umsatz:</span>
                              <span className="ml-2 font-medium">{pv.revenue.totalRevenue.toFixed(2)} EUR</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Kosten pro Flasche:</span>
                              <span className="ml-2 font-medium">{pv.costPerBottle.toFixed(2) + String.fromCharCode(32, 69, 85, 82)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Ø Preis pro Flasche:</span>
                              <span className="ml-2 font-medium">
                                {avgPricePerBottle.toFixed(2) + String.fromCharCode(32, 69, 85, 82)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Gewinn:</span>
                              <span className={pv.profit >= 0 ? 'ml-2 font-medium text-green-600' : 'ml-2 font-medium text-red-600'}>
                                {pv.profit >= 0 ? '+' : ''}{pv.profit.toFixed(2) + String.fromCharCode(32, 69, 85, 82)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gesamt Flaschen:</span>
                        <span className="font-bold">{results.numberOfBottles}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Flaschen pro Monat:</span>
                    <span className="font-medium">{results.numberOfBottles.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Liter pro Jahr:</span>
                    <span className="font-medium">{results.productionVolumePerYear.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Ø Preis pro Flasche:</span>
                    <span className="font-medium">
                      <ClickableValue
                        value={results.averagePricePerBottle}
                        type="averagePrice"
                        data={data}
                        results={results}
                        format={(v) => {
                          const formatted = v.toFixed(2);
                          return formatted + String.fromCharCode(32, 69, 85, 82);
                        }}
                        className="text-base"
                      />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Kosten pro Flasche:</span>
                    <span className="font-medium">
                      <ClickableValue
                        value={results.costPerBottle}
                        type="costPerBottle"
                        data={data}
                        results={results}
                        format={(v) => {
                          const formatted = v.toFixed(2);
                          return formatted + String.fromCharCode(32, 69, 85, 82);
                        }}
                        className="text-base"
                      />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gewinn pro Flasche:</span>
                    <span className={isProfitable ? 'font-medium text-green-600' : 'font-medium text-red-600'}>
                      {(() => {
                        const profit = (results.averagePricePerBottle - results.costPerBottle) || 0;
                        const formatted = profit.toFixed(2);
                        return formatted + String.fromCharCode(32, 69, 85, 82);
                      })()}
                    </span>
                  </div>
                </div>
                )} */}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Umsatzaufteilung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Privatkunden</p>
                    <p className="text-xs text-muted-foreground">
                      {((1 - (data.salesParameters.businessCustomerShare || 0) * Math.pow(100, -1)) * 100).toFixed(1)}% Anteil
                    </p>
                  </div>
                  <p className="text-lg font-bold">{results.revenuePrivate.toFixed(0)} EUR</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Geschäftskunden</p>
                    <p className="text-xs text-muted-foreground">
                      {(data.salesParameters.businessCustomerShare || 0).toFixed(1)}% Anteil
                    </p>
                  </div>
                  <p className="text-lg font-bold">{results.revenueBusiness.toFixed(0) + ' EUR'}</p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-sm font-semibold">Gesamtumsatz:</span>
                  <span className="text-xl font-bold">
                    <ClickableValue
                      value={results.totalRevenue}
                      type="totalRevenue"
                      data={data}
                      results={results}
                      format={(v) => v.toFixed(0) + ' EUR'}
                    />
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preisstruktur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Preis Privatkunden:</span>
                    <span className="font-medium">{results.pricePerBottlePrivate.toFixed(2)} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Preis Geschäftskunden:</span>
                    <span className="font-medium">{results.pricePerBottleBusiness.toFixed(2)} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rabatt Geschäftskunden:</span>
                    <span className="font-medium">{(data.salesParameters.businessDiscountPercent || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-semibold">Ø Verkaufspreis:</span>
                    <span className="font-bold">{results.averagePricePerBottle.toFixed(2)} EUR</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Kostenaufstellung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fixkosten (Jahr):</span>
                  <span className="font-medium">{results.fixedCostsPerYear.toFixed(0)} EUR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fixkosten (Monat):</span>
                  <span className="font-medium">{results.fixedCostsPerMonth.toFixed(0)} EUR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Variable Kosten:</span>
                  <span className="font-medium">{(results.numberOfBottles * results.variableCostsPerBottle).toFixed(0)} EUR</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">Gesamtkosten (Jahr):</span>
                  <span className="font-bold text-lg">
                    <ClickableValue
                      value={results.totalCostsPerYear}
                      type="totalCosts"
                      data={data}
                      results={results}
                      format={(v) => v.toFixed(0) + ' EUR'}
                    />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">Gesamtkosten (Monat):</span>
                  <span className="font-bold">{((results.totalCostsPerYear * (1.0 * Math.pow(12, -1))) || 0).toFixed(0)} EUR</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kosten pro Flasche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Variable Kosten:</span>
                    <span className="font-medium">{results.variableCostsPerBottle.toFixed(2)} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fixkostenanteil:</span>
                    <span className="font-medium">{((results.fixedCostsPerMonth * (1.0 * Math.pow(results.numberOfBottles, -1))) || 0).toFixed(2)} EUR</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-semibold">Gesamtkosten pro Flasche:</span>
                    <span className="font-bold text-lg">{results.costPerBottle.toFixed(2)} EUR</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Visualisierungen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Break-Even-Analyse
            </CardTitle>
            <CardDescription>
              Visualisierung der Gewinnzone und kritischer Punkte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DynamicBreakEvenChart
              breakEvenBottles={results.breakEvenBottles}
              sellingPrice={results.averagePricePerBottle}
              costPerBottle={results.costPerBottle}
              fixedCosts={results.fixedCostsPerMonth}
              numberOfBottles={results.numberOfBottles}
              criticalPoints={results.criticalPoints}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Kostenverteilung
            </CardTitle>
            <CardDescription>
              Aufteilung der Gesamtkosten nach Kategorien
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CostDistributionChart distribution={results.costDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Gewinnschwellen-Analyse */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gewinnschwellen-Analyse
          </CardTitle>
          <CardDescription>
            Benötigter Umsatz für verschiedene Zielgewinne
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfitThresholdsChart thresholds={results.profitThresholds} />
        </CardContent>
      </Card>

      {/* Optimale Produktionsmenge */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Optimale Produktionsmenge
          </CardTitle>
          <CardDescription>
            Sweet Spot für maximale Rentabilität
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Optimale Menge:</span>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {results.optimalProductionVolume.toFixed(0)} Flaschen
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gewinn bei optimaler Menge:</span>
                  <span className="font-bold text-lg text-green-600">
                    {results.profitAtOptimalVolume.toFixed(0)} EUR/Monat
                  </span>
                </div>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Aktuelle Menge:</span>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {results.numberOfBottles.toFixed(0)} Flaschen
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gewinn bei aktueller Menge:</span>
                  <span className={`font-bold text-lg ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                    {results.netProfitPerMonth.toFixed(0)} EUR/Monat
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <h4 className="text-sm font-semibold mb-3">Potenzial</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Differenz:</span>
                  <span className="font-medium">
                    {(results.optimalProductionVolume - results.numberOfBottles).toFixed(0)} Flaschen
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Zusätzlicher Gewinn:</span>
                  <span className="font-bold text-green-600">
                    +{(results.profitAtOptimalVolume - results.netProfitPerMonth).toFixed(0)} EUR/Monat
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gewinnschwellen-Tabelle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gewinnschwellen im Detail</CardTitle>
              <CardDescription>
                Benötigter Umsatz und Flaschenanzahl für verschiedene Zielgewinne
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('details')}
            >
              {expandedSections.details ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.details && (
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Zielgewinn (EUR/Monat)</th>
                    <th className="text-right p-3 font-semibold">Benötigter Umsatz (EUR/Monat)</th>
                    <th className="text-right p-3 font-semibold">Benötigte Flaschen (pro Monat)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.profitThresholds.map((threshold, index) => (
                    <tr key={threshold.targetProfit} className={index % 2 === 0 ? 'border-b bg-muted/50' : 'border-b'}>
                      <td className="p-3 font-medium">{threshold.targetProfit.toFixed(0)}</td>
                      <td className="p-3 text-right">
                        {isFinite(threshold.requiredRevenue)
                          ? threshold.requiredRevenue.toFixed(0) + ' EUR'
                          : 'Nicht erreichbar'}
                      </td>
                      <td className="p-3 text-right">
                        {isFinite(threshold.requiredBottles)
                          ? threshold.requiredBottles.toFixed(0)
                          : 'Nicht erreichbar'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Projekt-Diagramm */}
      <Card>
        <CardHeader>
          <CardTitle>Produktionsprozess</CardTitle>
          <CardDescription>
            Übersicht des Produktionsablaufs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductionFlowchart />
        </CardContent>
      </Card>
    </div>
  );
}
