import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface FiltersBarProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  selectedTurno: string;
  onTurnoChange: (turno: string) => void;
  onReset: () => void;
}

const turnos = [
  { value: 'todos', label: 'Todos los turnos' },
  { value: '12 a.m. – 6 a.m.', label: '12 a.m. – 6 a.m.' },
  { value: '6 a.m. – 12 p.m.', label: '6 a.m. – 12 p.m.' },
  { value: '12 p.m. – 6 p.m.', label: '12 p.m. – 6 p.m.' },
  { value: '6 p.m. – 12 a.m.', label: '6 p.m. – 12 a.m.' },
];

export function FiltersBar({
  dateRange,
  onDateRangeChange,
  selectedTurno,
  onTurnoChange,
  onReset,
}: FiltersBarProps) {
  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardContent className="flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filtros:</span>
        </div>

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[280px] justify-start text-left font-normal',
                !dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'dd MMM yyyy', { locale: es })} -{' '}
                    {format(dateRange.to, 'dd MMM yyyy', { locale: es })}
                  </>
                ) : (
                  format(dateRange.from, 'dd MMM yyyy', { locale: es })
                )
              ) : (
                'Seleccionar fechas'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>

        {/* Turno Select */}
        <Select value={selectedTurno} onValueChange={onTurnoChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar turno" />
          </SelectTrigger>
          <SelectContent>
            {turnos.map((turno) => (
              <SelectItem key={turno.value} value={turno.value}>
                {turno.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Button */}
        <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto">
          <RotateCcw className="mr-2 h-4 w-4" />
          Restablecer
        </Button>
      </CardContent>
    </Card>
  );
}
