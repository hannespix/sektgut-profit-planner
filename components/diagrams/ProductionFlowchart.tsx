'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Package, Factory, Truck, ShoppingCart } from 'lucide-react';

export default function ProductionFlowchart() {
  const steps = [
    {
      icon: Package,
      title: 'Grundwein',
      description: 'Einkauf des Grundweins',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    {
      icon: Factory,
      title: 'Verarbeitung',
      description: 'Vergärung und Verarbeitung',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    },
    {
      icon: Truck,
      title: 'Transport',
      description: 'Transport zum Versektungsort',
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    },
    {
      icon: Package,
      title: 'Versektung',
      description: 'Füllung, Degorierung, Etikettierung',
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
    {
      icon: ShoppingCart,
      title: 'Verkauf',
      description: 'Verkauf über Onlineshop',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produktionsablauf</CardTitle>
        <CardDescription>
          Übersicht des Produktionsprozesses von Grundwein bis Verkauf
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-center gap-4 py-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`${step.color} p-6 rounded-lg shadow-md flex flex-col items-center justify-center min-w-[120px]`}
                  >
                    <Icon className="h-8 w-8 mb-2" />
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                    <p className="text-xs mt-1 text-center opacity-80">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
