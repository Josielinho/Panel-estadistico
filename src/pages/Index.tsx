import { useState } from 'react';
import {
  Activity,
  Users,
  ThumbsUp,
  Clock,
  Heart,
  Download,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useSurveyData } from '@/hooks/useSurveyData';
import { KPICard } from '@/components/dashboard/KPICard';
import { BarChartCard } from '@/components/dashboard/BarChartCard';
import { PieChartCard } from '@/components/dashboard/PieChartCard';
import { CommentsTable } from '@/components/dashboard/CommentsTable';
import { FiltersBar } from '@/components/dashboard/FiltersBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { downloadSurveyBackupExcel, deleteAllSurveyResponses } from '@/services/surveyResponses';

const Index = () => {
  const {
    stats,
    allChartData,
    comments,
    loading,
    error,
    dateRange,
    setDateRange,
    selectedTurno,
    setSelectedTurno,
    resetFilters,
    refetch,
    chartQuestions,
  } = useSurveyData();

  const timeQuestions = chartQuestions.filter(q =>
    ['1', '2', '5', '13', '15'].includes(q.id)
  );

  const ratingQuestions = chartQuestions.filter(q =>
    ['3', '4', '7', '8', '10', '12', '14'].includes(q.id)
  );

  const renderChart = (questionId: string, title: string, chartType: string, height = 280) => {
    const data = allChartData[questionId];
    if (!data) return null;

    if (chartType === 'bar') {
      return (
        <BarChartCard
          key={questionId}
          title={title}
          data={data}
          layout="vertical"
          height={height}
        />
      );
    }

    return (
      <PieChartCard
        key={questionId}
        title={title}
        data={data}
        innerRadius={chartType === 'donut' ? 40 : 0}
        outerRadius={80}
        height={height}
      />
    );
  };

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [understand, setUnderstand] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const DELETE_PHRASE = 'ELIMINAR TODO';
  const canDelete = understand && confirmText.trim().toUpperCase() === DELETE_PHRASE;

  const handleBackup = async () => {
    try {
      setActionLoading(true);
      const res = await downloadSurveyBackupExcel({ limit: 50000 });
      toast({
        title: 'Backup generado',
        description: `Descargado desde ${res.tableUsed} (${res.rows} filas).`,
      });
    } catch (e: any) {
      toast({
        title: 'Error en backup',
        description: e?.message ?? 'Error desconocido',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setActionLoading(true);
      await deleteAllSurveyResponses();
      toast({
        title: 'Datos eliminados',
        description: 'Todas las encuestas fueron eliminadas.',
      });
      setDeleteOpen(false);
      setConfirmText('');
      setUnderstand(false);
      await refetch();
    } catch (e: any) {
      toast({
        title: 'Error al eliminar',
        description: e?.message ?? 'Revisa permisos DELETE (RLS)',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Panel de Satisfacción - Urgencias
            </h1>
            <p className="text-sm text-muted-foreground">
              Análisis de las 20 preguntas de la encuesta
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6">
        {loading && (
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Cargando datos desde Supabase...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            <p className="font-medium">No se pudieron cargar los datos.</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <FiltersBar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedTurno={selectedTurno}
          onTurnoChange={setSelectedTurno}
          onReset={resetFilters}
        />

        {/* Actions */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              setActionLoading(true);
              await refetch();
              setActionLoading(false);
              toast({
                title: 'Actualizado',
                description: 'Datos refrescados correctamente.',
              });
            }}
            disabled={actionLoading || loading}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleBackup}
            disabled={actionLoading || loading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Backup (Excel)
          </Button>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={actionLoading || loading || stats.totalResponses === 0}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar resultados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar TODAS las encuestas</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción es irreversible.
                  <br />
                  Escribe <strong>ELIMINAR TODO</strong> para confirmar.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={understand}
                    onChange={(e) => setUnderstand(e.target.checked)}
                  />
                  Entiendo que se eliminarán todos los datos
                </label>

                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Escribe: ELIMINAR TODO"
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAll}
                  disabled={!canDelete || actionLoading}
                >
                  Eliminar todo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>

        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Encuestas"
            value={stats.totalResponses.toLocaleString()}
            subtitle="Respuestas recibidas"
            icon={Users}
            variant="info"
          />
          <KPICard
            title="Satisfacción Global"
            value={`${stats.satisfactionRate}%`}
            subtitle="Excelente + Buena (P16)"
            icon={ThumbsUp}
            variant="success"
          />
          <KPICard
            title="Regresaría"
            value={`${stats.returnRates.si}%`}
            subtitle={`${stats.returnRates.pensaria}% lo pensaría`}
            icon={Heart}
            variant="success"
          />
          <KPICard
            title="Espera Triaje"
            value={stats.modaTriaje}
            subtitle="Tiempo más frecuente (P1)"
            icon={Clock}
            variant="warning"
          />
        </section>

        {/* Charts */}
        <section className="grid gap-6 lg:grid-cols-2">
          {timeQuestions.map(q =>
            renderChart(q.id, `P${q.numero}. ${q.shortTitle}`, q.chartType, 300)
          )}
          {ratingQuestions.map(q =>
            renderChart(q.id, `P${q.numero}. ${q.shortTitle}`, q.chartType, 260)
          )}
        </section>

        {/* Comments */}
        <CommentsTable comments={comments} pageSize={8} />
      </main>
    </div>
  );
};

export default Index;
