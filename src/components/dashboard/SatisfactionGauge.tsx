import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SatisfactionGaugeProps {
  title: string;
  satisfactionRate: number;
  highLabel?: string;
  lowLabel?: string;
}

export function SatisfactionGauge({
  title,
  satisfactionRate,
  highLabel = 'Excelente + Buena',
  lowLabel = 'Regular + Debe mejorar',
}: SatisfactionGaugeProps) {
  const lowRate = 100 - satisfactionRate;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative h-32 w-32">
            <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--success))"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${satisfactionRate * 2.51} 251`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-success">{satisfactionRate}%</span>
              <span className="text-xs text-muted-foreground">Satisfacción</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">{highLabel}</span>
            </div>
            <span className="font-semibold text-success">{satisfactionRate}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-warning" />
              <span className="text-sm text-muted-foreground">{lowLabel}</span>
            </div>
            <span className="font-semibold text-warning">{lowRate}%</span>
          </div>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-success transition-all duration-500"
            style={{ width: `${satisfactionRate}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
