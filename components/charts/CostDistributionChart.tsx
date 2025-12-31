'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CostDistributionChartProps {
  distribution: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function CostDistributionChart({ distribution }: CostDistributionChartProps) {
  const data = distribution.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage.toFixed(1),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${percent !== undefined ? (percent * 100).toFixed(1) : '0'}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(2)} €`, 'Kosten'] : ['', '']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
