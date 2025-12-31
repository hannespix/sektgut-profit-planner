'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DynamicBreakEvenChartProps {
  breakEvenBottles: number;
  sellingPrice: number;
  costPerBottle: number;
  fixedCosts: number;
  numberOfBottles: number; // Aktuelle Produktionsmenge
  criticalPoints?: Array<{
    bottles: number;
    description: string;
    type: string;
  }>;
}

export default function DynamicBreakEvenChart({
  breakEvenBottles,
  sellingPrice,
  costPerBottle,
  fixedCosts,
  numberOfBottles,
  criticalPoints = [],
}: DynamicBreakEvenChartProps) {
  // Dynamische Skalierung basierend auf aktueller Produktionsmenge
  const maxBottles = Math.max(
    numberOfBottles * 1.5,
    breakEvenBottles * 2,
    500
  );
  const step = Math.max(Math.floor(maxBottles / 30), 10);
  
  const data = [];
  for (let bottles = 0; bottles <= maxBottles; bottles += step) {
    const revenue = bottles * sellingPrice;
    const totalCosts = fixedCosts + bottles * costPerBottle;
    const profit = revenue - totalCosts;
    
    data.push({
      bottles,
      Umsatz: revenue,
      Kosten: totalCosts,
      Gewinn: profit,
    });
  }

  // Formatierung für Y-Achse basierend auf Max-Werten
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.Umsatz, d.Kosten, Math.abs(d.Gewinn)))
  );
  const yAxisFormatter = (value: number) => {
    if (maxValue >= 100000) {
      return `${(value / 1000).toFixed(0)}k €`;
    }
    return `${value.toFixed(0)} €`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="bottles"
          label={{ value: 'Flaschen pro Monat', position: 'insideBottom', offset: -5 }}
          domain={[0, maxBottles]}
        />
        <YAxis
          label={{ value: 'Betrag (€)', angle: -90, position: 'insideLeft' }}
          tickFormatter={yAxisFormatter}
        />
        <Tooltip
          formatter={(value: number | undefined) => value !== undefined ? `${value.toFixed(2)} €` : ''}
          labelFormatter={(label) => `${label} Flaschen`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="Umsatz"
          stroke="#8884d8"
          strokeWidth={2}
          name="Umsatz"
        />
        <Line
          type="monotone"
          dataKey="Kosten"
          stroke="#ff8042"
          strokeWidth={2}
          name="Kosten"
        />
        <Line
          type="monotone"
          dataKey="Gewinn"
          stroke="#82ca9d"
          strokeWidth={2}
          name="Gewinn"
        />
        <ReferenceLine
          x={breakEvenBottles}
          stroke="red"
          strokeDasharray="5 5"
          label={{ value: 'Break-Even', position: 'top' }}
        />
        {criticalPoints.map((point, index) => (
          <ReferenceLine
            key={index}
            x={point.bottles}
            stroke={point.type === 'cost' ? '#ff6b6b' : point.type === 'milestone' ? '#4ecdc4' : '#95a5a6'}
            strokeDasharray="3 3"
            label={{ value: point.description, position: 'top', angle: -45 }}
          />
        ))}
        <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
        {/* Markiere aktuelle Produktionsmenge */}
        <ReferenceLine
          x={numberOfBottles}
          stroke="#3498db"
          strokeWidth={2}
          label={{ value: 'Aktuell', position: 'bottom' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
