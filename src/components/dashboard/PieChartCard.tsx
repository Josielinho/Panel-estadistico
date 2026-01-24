import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartData {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
}

interface PieChartCardProps {
  title: string;
  data: PieChartData[];
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  height?: number;
}

const defaultColors = [
  'hsl(var(--chart-3))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-6))',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          Respuestas: <span className="font-semibold text-foreground">{data.value}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Porcentaje: <span className="font-semibold text-foreground">{data.percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percentage < 5) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${percentage}%`}
    </text>
  );
};

const CustomLegend = ({ payload }: any) => {
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`legend-${index}`} className="flex items-center gap-2 text-sm">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export function PieChartCard({
  title,
  data,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 100,
  height = 300,
}: PieChartCardProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map((item, index) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
    color: item.color || defaultColors[index % defaultColors.length],
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend content={<CustomLegend />} />}
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
