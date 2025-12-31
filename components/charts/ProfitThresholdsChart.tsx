'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProfitThresholdsChartProps {
  thresholds: {
    targetProfit: number;
    requiredRevenue: number;
    requiredBottles: number;
  }[];
}

export default function ProfitThresholdsChart({ thresholds }: ProfitThresholdsChartProps) {
  const data = thresholds
    .filter((t) => isFinite(t.requiredRevenue) && isFinite(t.requiredBottles))
    .map((threshold) => ({
      name: `${threshold.targetProfit}€`,
      'Benötigter Umsatz (€)': Math.round(threshold.requiredRevenue),
      'Benötigte Flaschen': Math.round(threshold.requiredBottles),
    }));

  // Dynamische Skalierung für Y-Achsen
  const maxRevenue = Math.max(...data.map(d => d['Benötigter Umsatz (€)']), 0);
  const maxBottles = Math.max(...data.map(d => d['Benötigte Flaschen']), 0);
  
  const revenueFormatter = (value: number) => {
    if (maxRevenue >= 100000) return `${(value / 1000).toFixed(0)}k €`;
    if (maxRevenue >= 10000) return `${(value / 1000).toFixed(1)}k €`;
    return `${value.toFixed(0)} €`;
  };
  
  const bottlesFormatter = (value: number) => {
    if (maxBottles >= 10000) return `${(value / 1000).toFixed(1)}k`;
    return `${value.toFixed(0)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis 
          yAxisId="left" 
          orientation="left" 
          stroke="#8884d8"
          tickFormatter={revenueFormatter}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="#82ca9d"
          tickFormatter={bottlesFormatter}
        />
        <Tooltip
          formatter={(value: number | undefined, name: string | undefined) => {
            if (value === undefined) return ['', ''];
            if (name?.includes('Umsatz')) {
              return [`${value.toFixed(2)} €`, 'Umsatz'];
            }
            return [value.toFixed(0), 'Flaschen'];
          }}
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="Benötigter Umsatz (€)"
          fill="#8884d8"
          name="Umsatz (€)"
        />
        <Bar
          yAxisId="right"
          dataKey="Benötigte Flaschen"
          fill="#82ca9d"
          name="Flaschen"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
