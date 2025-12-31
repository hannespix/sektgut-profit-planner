'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface BreakEvenChartProps {
  breakEvenBottles: number;
  sellingPrice: number;
  costPerBottle: number;
  fixedCosts: number;
}

export default function BreakEvenChart({
  breakEvenBottles,
  sellingPrice,
  costPerBottle,
  fixedCosts,
}: BreakEvenChartProps) {
  // Generiere Datenpunkte für verschiedene Flaschenanzahlen
  const maxBottles = Math.max(breakEvenBottles * 2, 500);
  const step = Math.max(Math.floor(maxBottles / 20), 10);
  
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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="bottles"
          label={{ value: 'Flaschen pro Monat', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          label={{ value: 'Betrag (€)', angle: -90, position: 'insideLeft' }}
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
        <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
      </LineChart>
    </ResponsiveContainer>
  );
}
