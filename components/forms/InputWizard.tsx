'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingCart, 
  User, 
  Factory, 
  Briefcase, 
  Clock, 
  Settings,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  TrendingUp
} from 'lucide-react';
import type { CalculationData } from '@/lib/types';
import BasicParametersForm from '@/components/forms/BasicParametersForm';
import PersonalCostsForm from '@/components/forms/PersonalCostsForm';
import ProductionCostsForm from '@/components/forms/ProductionCostsForm';
import OperatingCostsForm from '@/components/forms/OperatingCostsForm';
import TimeInvestmentForm from '@/components/forms/TimeInvestmentForm';
import StepCostParametersForm from '@/components/forms/StepCostParametersForm';
import { calculateResults } from '@/lib/calculations';

interface InputWizardProps {
  data: CalculationData;
  onDataChange: (data: CalculationData) => void;
  onFinish?: () => void; // Callback für "Fertig"
}

const steps = [
  {
    id: 'basics',
    title: 'Grundparameter',
    description: 'Preise, Produktionsmenge und Steuern',
    icon: ShoppingCart,
    component: BasicParametersForm,
    getData: (data: CalculationData) => ({ ...data.salesParameters, productionCosts: data.productionCosts }),
    updateData: (data: CalculationData, newData: any) => {
      const { productionCosts, ...salesParams } = newData;
      return { ...data, salesParameters: salesParams };
    },
  },
  {
    id: 'personal',
    title: 'Persönliche Kosten',
    description: 'Sozialversicherungen und Lebenshaltung',
    icon: User,
    component: PersonalCostsForm,
    getData: (data: CalculationData) => data.personalCosts,
    updateData: (data: CalculationData, newData: any) => ({ ...data, personalCosts: newData }),
  },
  {
    id: 'production',
    title: 'Produktionskosten',
    description: 'Grundwein, Verarbeitung und Versektung',
    icon: Factory,
    component: ProductionCostsForm,
    getData: (data: CalculationData) => data.productionCosts,
    updateData: (data: CalculationData, newData: any) => ({ ...data, productionCosts: newData }),
    getProps: (data: CalculationData) => ({ baseWinePurchasePrice: data.salesParameters.baseWinePurchasePrice }),
  },
  {
    id: 'operating',
    title: 'Betriebskosten',
    description: 'Webserver, Marketing und sonstige Kosten',
    icon: Briefcase,
    component: OperatingCostsForm,
    getData: (data: CalculationData) => data.operatingCosts,
    updateData: (data: CalculationData, newData: any) => ({ ...data, operatingCosts: newData }),
  },
  {
    id: 'time',
    title: 'Zeitaufwand',
    description: 'Arbeitszeit und Zeitaufwand',
    icon: Clock,
    component: TimeInvestmentForm,
    getData: (data: CalculationData) => data.timeInvestment,
    updateData: (data: CalculationData, newData: any) => ({ ...data, timeInvestment: newData }),
  },
  {
    id: 'advanced',
    title: 'Erweiterte Einstellungen',
    description: 'Mitarbeiter und sprungfixe Kosten',
    icon: Settings,
    component: StepCostParametersForm,
    getData: (data: CalculationData) => data.stepCostParameters,
    updateData: (data: CalculationData, newData: any) => ({ ...data, stepCostParameters: newData }),
  },
];

export default function InputWizard({ data, onDataChange, onFinish }: InputWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const results = calculateResults(data);
  
  const currentStepData = steps[currentStep];
  const FormComponent = currentStepData.component as any;
  const stepData = currentStepData.getData(data);
  const stepProps = currentStepData.getProps ? currentStepData.getProps(data) : {};

  const handleStepChange = (newData: any) => {
    const updatedData = currentStepData.updateData(data, newData);
    onDataChange(updatedData);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Schritt {currentStep + 1} von {steps.length}</span>
          <span className="font-medium">{Math.round(progress)}% abgeschlossen</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${isActive 
                  ? 'border-primary bg-primary/5' 
                  : isCompleted 
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/10' 
                  : 'border-border bg-card hover:bg-accent'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="text-xs font-medium">{step.title}</div>
            </button>
          );
        })}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-primary/10`}>
              <currentStepData.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FormComponent
            data={stepData}
            onChange={handleStepChange}
            {...stepProps}
          />
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live-Vorschau
          </CardTitle>
          <CardDescription>
            Aktuelle Berechnung basierend auf Ihren Eingaben
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Monatlicher Umsatz</p>
              <p className="text-2xl font-bold">{results.revenuePerMonth.toFixed(0)} €</p>
              <p className="text-xs text-muted-foreground mt-1">
                {results.numberOfBottles} Flaschen/Monat
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Monatliche Kosten</p>
              <p className="text-2xl font-bold text-red-600">
                {(results.fixedCostsPerMonth + (results.numberOfBottles * results.costPerBottle / 12)).toFixed(0)} €
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Fix: {results.fixedCostsPerMonth.toFixed(0)} €
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Reingewinn/Monat</p>
              <p className={`text-2xl font-bold ${results.netProfitPerMonth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {results.netProfitPerMonth >= 0 ? '+' : ''}{results.netProfitPerMonth.toFixed(0)} €
              </p>
              <p className={`text-xs mt-1 ${results.netProfitPerMonth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {results.netProfitPerMonth >= 0 ? '✓ Profitabel' : '⚠️ Verlust'}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Break-Even-Punkt</p>
              <p className="text-2xl font-bold">
                {results.breakEvenBottles > 0 && isFinite(results.breakEvenBottles) 
                  ? Math.ceil(results.breakEvenBottles) 
                  : 'N/A'} 
                {results.breakEvenBottles > 0 && isFinite(results.breakEvenBottles) && ' Flaschen'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {results.numberOfBottles >= (results.breakEvenBottles || 0) 
                  ? '✓ Erreicht' 
                  : 'Noch nicht erreicht'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        {currentStep === steps.length - 1 ? (
          <Button
            onClick={() => onFinish && onFinish()}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Fertig
          </Button>
        ) : (
          <Button
            onClick={nextStep}
          >
            Weiter
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
