import { useEffect, useMemo, useState } from 'react';
import {
  countByQuestion,
  calculatePercentages,
  filterByDateRange,
  filterByTurno,
  getSatisfactionRate,
  getReturnRate,
  getMostFrequent,
  getChartDataForQuestion,
  SurveyResponse,
} from '@/data/mockSurveyData';
import { surveyQuestions, chartQuestions, turnoOptions, turnoColors } from '@/data/surveyQuestions';
import { fetchSurveyResponses } from '@/services/surveyResponses';

import { DateRange } from 'react-day-picker';

export function useSurveyData() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedTurno, setSelectedTurno] = useState<string>('todos');

  const [sourceData, setSourceData] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tableUsed, setTableUsed] = useState<string | null>(null);

const refetch = async () => {
  try {
    setLoading(true);
    setError(null);
    const res = await fetchSurveyResponses({ limit: 10000 });
    setSourceData(res.data);
    setTableUsed(res.tableUsed);
  } catch (e: any) {
    setError(e?.message ?? 'Error cargando datos');
    setSourceData([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchSurveyResponses({ limit: 10000 });
        if (cancelled) return;
        setSourceData(res.data);
        setTableUsed(res.tableUsed);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? 'Error cargando datos');
        setSourceData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredData = useMemo(() => {
    let data = sourceData;

    if (dateRange?.from && dateRange?.to) {
      const startDate = dateRange.from.toISOString().split('T')[0];
      const endDate = dateRange.to.toISOString().split('T')[0];
      data = filterByDateRange(data, startDate, endDate);
    }

    data = filterByTurno(data, selectedTurno);

    return data;
  }, [sourceData, dateRange, selectedTurno]);

  const stats = useMemo(() => {
    const totalResponses = filteredData.length;
    const satisfactionRate = getSatisfactionRate(filteredData);
    const returnRates = getReturnRate(filteredData);

    // Get most common wait times
    const triajeCounts = countByQuestion(filteredData, '1');
    const medicoCounts = countByQuestion(filteredData, '2');
    const modaTriaje = getMostFrequent(triajeCounts);
    const modaMedico = getMostFrequent(medicoCounts);

    return {
      totalResponses,
      satisfactionRate,
      returnRates,
      modaTriaje,
      modaMedico,
    };
  }, [filteredData]);

  // Generate chart data for all chart questions
  const allChartData = useMemo(() => {
    const data: Record<string, Array<{ name: string; value: number; percentage: number; color: string }>> = {};
    
    chartQuestions.forEach(question => {
      data[question.id] = getChartDataForQuestion(filteredData, question.id);
    });
    
    return data;
  }, [filteredData]);

  // Turno distribution data
  const turnoData = useMemo(() => {
    const counts = countByQuestion(filteredData, '19');
    const percentages = calculatePercentages(counts);
    
    return turnoOptions.map((turno) => ({
      name: turno,
      value: counts[turno] || 0,
      percentage: percentages[turno] || 0,
      color: turnoColors[turno] || 'hsl(var(--chart-1))',
    }));
  }, [filteredData]);

  // Comments from question 18
  const comments = useMemo(() => {
    return filteredData
      .filter((r) => r.comentario && r.comentario.trim() !== '')
      .map((r) => ({
        id: r.id,
        fecha: r.fecha_atencion,
        turno: r.turno,
        comentario: r.comentario,
      }));
  }, [filteredData]);

  const resetFilters = () => {
    setDateRange(undefined);
    setSelectedTurno('todos');
  };

  return {
    filteredData,
    stats,
    allChartData,
    turnoData,
    comments,
    loading,
    error,
    tableUsed,
    dateRange,
    setDateRange,
    selectedTurno,
    setSelectedTurno,
    resetFilters,
    refetch,
    surveyQuestions,
    chartQuestions,
    turnoOptions,
  };
}
