// Survey questions and options structure based on real ER satisfaction survey

export interface SurveyQuestion {
  id: string;
  numero: number;
  pregunta: string;
  tipo: 'seleccion' | 'texto' | 'fecha';
  opciones: string[];
  shortTitle: string;
  chartType: 'bar' | 'pie' | 'donut' | 'none';
}

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: '1',
    numero: 1,
    pregunta: '¿Cuánto tiempo esperó desde su llegada hasta su clasificación en el TRIAJE?',
    tipo: 'seleccion',
    opciones: ['Menos de 5 minutos', 'De 5 minutos a 15 minutos', 'De 15 minutos a 30 minutos', 'De 30 minutos a 1 hora', 'Mayor de 1 hora'],
    shortTitle: 'Tiempo espera TRIAJE',
    chartType: 'bar',
  },
  {
    id: '2',
    numero: 2,
    pregunta: '¿Cuánto tiempo esperó desde su clasificación en el TRIAJE hasta su atención por el médico?',
    tipo: 'seleccion',
    opciones: ['Menos de 30 minutos', '30 – 60 minutos', '1 – 2 horas', '2 – 4 horas', 'Mayor a 4 horas'],
    shortTitle: 'Tiempo TRIAJE a médico',
    chartType: 'bar',
  },
  {
    id: '3',
    numero: 3,
    pregunta: '¿Cómo califica el trato recibido por el médico de filtro?',
    tipo: 'seleccion',
    opciones: ['Excelente', 'Buena', 'Regular', 'Debe mejorar'],
    shortTitle: 'Trato médico filtro',
    chartType: 'pie',
  },
  {
    id: '4',
    numero: 4,
    pregunta: '¿Cómo califica la atención recibida por el médico tratante?',
    tipo: 'seleccion',
    opciones: ['Excelente', 'Buena', 'Regular', 'Debe mejorar'],
    shortTitle: 'Atención médico tratante',
    chartType: 'pie',
  },
  {
    id: '5',
    numero: 5,
    pregunta: '¿Cuánto tiempo esperó desde su atención hasta su egreso?',
    tipo: 'seleccion',
    opciones: ['Menos de 30 minutos', '30 – 60 minutos', '1 – 2 horas', '2 – 4 horas', '4 – 6 horas', 'Más de 6 horas'],
    shortTitle: 'Tiempo hasta egreso',
    chartType: 'bar',
  },
  {
    id: '6',
    numero: 6,
    pregunta: '¿Recibió de parte de los médicos la información y explicación de su caso?',
    tipo: 'seleccion',
    opciones: ['Sí', 'Un poco', 'No'],
    shortTitle: 'Info del caso',
    chartType: 'donut',
  },
  {
    id: '7',
    numero: 7,
    pregunta: '¿Cómo califica el trato del personal de caja?',
    tipo: 'seleccion',
    opciones: ['Excelente', 'Bueno', 'Regular', 'Debe mejorar'],
    shortTitle: 'Trato personal caja',
    chartType: 'pie',
  },
  {
    id: '8',
    numero: 8,
    pregunta: '¿Cómo califica el trato del personal de Registros Médicos al tomar los datos?',
    tipo: 'seleccion',
    opciones: ['Excelente', 'Bueno', 'Regular', 'Debe mejorar'],
    shortTitle: 'Trato Registros Médicos',
    chartType: 'pie',
  },
  {
    id: '9',
    numero: 9,
    pregunta: '¿Cómo califica el proceso de obtención del cupo en Registros Médicos?',
    tipo: 'seleccion',
    opciones: ['Rápido', 'Moderado', 'Lento'],
    shortTitle: 'Proceso obtención cupo',
    chartType: 'donut',
  },
  {
    id: '10',
    numero: 10,
    pregunta: '¿Cómo califica el trato recibido por el personal de Enfermería?',
    tipo: 'seleccion',
    opciones: ['Excelente', 'Bueno', 'Regular', 'Debe mejorar'],
    shortTitle: 'Trato Enfermería',
    chartType: 'pie',
  },
  {
    id: '11',
    numero: 11,
    pregunta: '¿Considera que la limpieza del servicio de urgencias es adecuada?',
    tipo: 'seleccion',
    opciones: ['Sí', 'Debe mejorar', 'No'],
    shortTitle: 'Limpieza urgencias',
    chartType: 'donut',
  },
  {
    id: '12',
    numero: 12,
    pregunta: '¿Cómo califica la atención del personal de Rayos X?',
    tipo: 'seleccion',
    opciones: ['Excelente', 'Buena', 'Regular', 'Debe mejorar'],
    shortTitle: 'Atención Rayos X',
    chartType: 'pie',
  },
  {
    id: '13',
    numero: 13,
    pregunta: '¿Qué tiempo le tomó obtener el resultado de sus estudios de radiología?',
    tipo: 'seleccion',
    opciones: ['Menos de 1 hora', '1 – 2 horas', '2 – 4 horas', 'Mayor de 4 horas', 'No se me envió a radiología'],
    shortTitle: 'Tiempo resultados radiología',
    chartType: 'bar',
  },
  {
    id: '14',
    numero: 14,
    pregunta: '¿Cómo califica el trato recibido por el personal de Laboratorio?',
    tipo: 'seleccion',
    opciones: ['Excelente', 'Bueno', 'Regular', 'Debe mejorar'],
    shortTitle: 'Trato Laboratorio',
    chartType: 'pie',
  },
  {
    id: '15',
    numero: 15,
    pregunta: '¿Qué tiempo le tomó que le dieran sus resultados de laboratorio?',
    tipo: 'seleccion',
    opciones: ['30 – 60 minutos', '1 – 2 horas', '2 – 4 horas', 'Mayor de 4 horas', 'No se me envió a laboratorio'],
    shortTitle: 'Tiempo resultados laboratorio',
    chartType: 'bar',
  },
  {
    id: '16',
    numero: 16,
    pregunta: 'De manera global, ¿cómo califica la atención recibida en el servicio de urgencias desde su llegada hasta su egreso?',
    tipo: 'seleccion',
    opciones: ['Excelente', 'Buena', 'Regular', 'Debe mejorar'],
    shortTitle: 'Satisfacción global',
    chartType: 'pie',
  },
  {
    id: '17',
    numero: 17,
    pregunta: 'Con respecto a la atención recibida el día de hoy, ¿regresaría nuevamente de necesitarlo?',
    tipo: 'seleccion',
    opciones: ['Sí', 'Lo pensaría', 'No'],
    shortTitle: '¿Regresaría?',
    chartType: 'donut',
  },
  {
    id: '18',
    numero: 18,
    pregunta: '¿Qué medidas considera usted que se deben adoptar para mejorar la atención?',
    tipo: 'texto',
    opciones: [],
    shortTitle: 'Sugerencias',
    chartType: 'none',
  },
  {
    id: '19',
    numero: 19,
    pregunta: '¿En qué turno llegó al cuarto de urgencias?',
    tipo: 'seleccion',
    opciones: ['12 a.m. – 6 a.m.', '6 a.m. – 12 p.m.', '12 p.m. – 6 p.m.', '6 p.m. – 12 a.m.'],
    shortTitle: 'Turno',
    chartType: 'donut',
  },
  {
    id: '20',
    numero: 20,
    pregunta: 'Escriba aquí la fecha de la atención:',
    tipo: 'fecha',
    opciones: [],
    shortTitle: 'Fecha atención',
    chartType: 'none',
  },
];

// Get questions that should be displayed as charts
export const chartQuestions = surveyQuestions.filter(q => q.chartType !== 'none');

// Get turno options for filter
export const turnoOptions = surveyQuestions.find(q => q.id === '19')?.opciones || [];

// Color palettes for different question types
export const ratingColors: Record<string, string> = {
  'Excelente': 'hsl(var(--chart-3))',
  'Buena': 'hsl(var(--chart-1))',
  'Bueno': 'hsl(var(--chart-1))',
  'Regular': 'hsl(var(--chart-4))',
  'Debe mejorar': 'hsl(var(--chart-5))',
};

export const yesNoColors: Record<string, string> = {
  'Sí': 'hsl(var(--chart-3))',
  'Un poco': 'hsl(var(--chart-4))',
  'No': 'hsl(var(--chart-5))',
  'Debe mejorar': 'hsl(var(--chart-4))',
};

export const speedColors: Record<string, string> = {
  'Rápido': 'hsl(var(--chart-3))',
  'Moderado': 'hsl(var(--chart-4))',
  'Lento': 'hsl(var(--chart-5))',
};

export const returnColors: Record<string, string> = {
  'Sí': 'hsl(var(--chart-3))',
  'Lo pensaría': 'hsl(var(--chart-4))',
  'No': 'hsl(var(--chart-5))',
};

export const turnoColors: Record<string, string> = {
  '12 a.m. – 6 a.m.': 'hsl(var(--chart-6))',
  '6 a.m. – 12 p.m.': 'hsl(var(--chart-1))',
  '12 p.m. – 6 p.m.': 'hsl(var(--chart-2))',
  '6 p.m. – 12 a.m.': 'hsl(var(--chart-4))',
};

// Time-based questions get sequential colors
export const timeQuestionIds = ['1', '2', '5', '13', '15'];

// Get color for an option based on question type
export function getOptionColor(questionId: string, option: string, index: number): string {
  if (ratingColors[option]) return ratingColors[option];
  if (yesNoColors[option]) return yesNoColors[option];
  if (speedColors[option]) return speedColors[option];
  if (returnColors[option]) return returnColors[option];
  if (turnoColors[option]) return turnoColors[option];
  
  // Default colors for time-based questions
  const defaultColors = [
    'hsl(var(--chart-3))',
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--chart-6))',
  ];
  return defaultColors[index % defaultColors.length];
}
