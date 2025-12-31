'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import CalculationExplanation from './CalculationExplanation';
import type { CalculationData, CalculationResults } from '@/lib/types';

interface ClickableValueProps {
  value: number;
  type: string;
  data: CalculationData;
  results: CalculationResults;
  className?: string;
  format?: (value: number) => string;
  children?: React.ReactNode;
}

export default function ClickableValue({
  value,
  type,
  data,
  results,
  className = '',
  format = (v) => v.toFixed(2),
  children,
}: ClickableValueProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`group relative inline-flex items-center gap-1 hover:text-primary transition-colors cursor-help ${className}`}
        title="Klicken Sie für Berechnungserklärung"
      >
        {children || format(value)}
        <Info className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
      </button>
      <CalculationExplanation
        open={isOpen}
        onOpenChange={setIsOpen}
        type={type}
        value={value}
        data={data}
        results={results}
      />
    </>
  );
}
