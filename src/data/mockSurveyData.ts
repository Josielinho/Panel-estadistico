// Mock data for ER Satisfaction Survey Dashboard
// Based on 20 real survey questions

import { surveyQuestions, getOptionColor } from './surveyQuestions';

export interface SurveyResponse {
  id: string;
  fecha_atencion: string;
  turno: string;
  respuestas: Record<string, string>; // questionId -> selected option
  comentario: string;
}

// Sample comments for question 18
const comentariosEjemplo = [
  'Excelente atención, muy profesionales todos.',
  'El tiempo de espera fue largo pero la atención fue buena.',
  'Muy satisfecho con el servicio de enfermería.',
  'Las instalaciones estaban muy limpias.',
  'El doctor fue muy amable y explicó todo claramente.',
  'Deberían mejorar los tiempos de espera en triaje.',
  'La atención en caja fue rápida y eficiente.',
  'El personal de laboratorio fue muy profesional.',
  'Agradezco la atención recibida, muy humana.',
  'Las enfermeras fueron muy atentas y cuidadosas.',
  'El área de rayos X tiene excelente servicio.',
  'Mejorar el sistema de turnos por favor.',
  'Todo bien, regresaría sin duda.',
  'La sala de espera estaba algo incómoda.',
  'Atención de primera, felicidades al equipo.',
  'El médico tratante fue excepcional.',
  'Se requiere más personal en horas pico.',
  'Muy agradecido por el trato recibido.',
  'Las instalaciones necesitan mantenimiento.',
  'El proceso de registro fue muy ágil.',
  'Reducir tiempo de espera para laboratorio.',
  'Mejorar comunicación entre personal.',
  'Más sillas en sala de espera.',
  'Excelente trato del personal de enfermería.',
  'Agilizar proceso de registro.',
];

// Generate random date within last 90 days
function randomDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
}

// Weighted random selection (for realistic distributions)
function weightedRandom<T>(options: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < options.length; i++) {
    random -= weights[i];
    if (random <= 0) return options[i];
  }
  
  return options[options.length - 1];
}

// Get realistic weights for different question types
function getWeightsForQuestion(questionId: string, optionCount: number): number[] {
  // Rating questions (Excelente, Buena, Regular, Debe mejorar) - mostly positive
  if (['3', '4', '7', '8', '10', '12', '14', '16'].includes(questionId)) {
    return [35, 40, 18, 7];
  }
  
  // Time wait questions - most common in middle ranges
  if (['1', '2', '5', '13', '15'].includes(questionId)) {
    if (optionCount === 5) return [25, 35, 25, 10, 5];
    if (optionCount === 6) return [20, 30, 25, 15, 7, 3];
    return Array(optionCount).fill(100 / optionCount);
  }
  
  // Yes/No/Maybe questions
  if (['6', '11'].includes(questionId)) {
    return [60, 30, 10]; // Mostly positive
  }
  
  // Return question
  if (questionId === '17') {
    return [65, 28, 7];
  }
  
  // Speed question (Rápido, Moderado, Lento)
  if (questionId === '9') {
    return [40, 45, 15];
  }
  
  // Turno question - weighted by typical ER visit times
  if (questionId === '19') {
    return [10, 35, 35, 20];
  }
  
  // Default even distribution
  return Array(optionCount).fill(100 / optionCount);
}

// Generate a random response for a question
function randomResponse(questionId: string): string {
  const question = surveyQuestions.find(q => q.id === questionId);
  if (!question || question.opciones.length === 0) return '';
  
  const weights = getWeightsForQuestion(questionId, question.opciones.length);
  return weightedRandom(question.opciones, weights);
}

// Generate mock survey responses
export function generateMockData(count: number = 500): SurveyResponse[] {
  const responses: SurveyResponse[] = [];
  
  for (let i = 0; i < count; i++) {
    const respuestas: Record<string, string> = {};
    
    // Generate response for each selection question
    surveyQuestions.forEach(q => {
      if (q.tipo === 'seleccion') {
        respuestas[q.id] = randomResponse(q.id);
      }
    });
    
    const turno = respuestas['19'] || '6 a.m. – 12 p.m.';
    const comentario = Math.random() > 0.3 
      ? comentariosEjemplo[Math.floor(Math.random() * comentariosEjemplo.length)] 
      : '';
    
    responses.push({
      id: `resp-${i + 1}`,
      fecha_atencion: randomDate(),
      turno,
      respuestas,
      comentario,
    });
  }
  
  return responses;
}

// Pre-generated data for consistent display
export const mockSurveyData = generateMockData(500);

// Aggregation utilities
export function countByQuestion(data: SurveyResponse[], questionId: string): Record<string, number> {
  return data.reduce((acc, item) => {
    const value = item.respuestas[questionId];
    if (value) {
      acc[value] = (acc[value] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
}

export function calculatePercentages(counts: Record<string, number>): Record<string, number> {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return {};
  return Object.fromEntries(
    Object.entries(counts).map(([key, value]) => [key, Math.round((value / total) * 100)])
  );
}

export function filterByDateRange(data: SurveyResponse[], startDate: string, endDate: string): SurveyResponse[] {
  return data.filter(item => {
    const date = item.fecha_atencion;
    return date >= startDate && date <= endDate;
  });
}

export function filterByTurno(data: SurveyResponse[], turno: string): SurveyResponse[] {
  if (!turno || turno === 'todos') return data;
  return data.filter(item => item.turno === turno);
}

// Get satisfaction rate from question 16 (global satisfaction)
export function getSatisfactionRate(data: SurveyResponse[]): number {
  const counts = countByQuestion(data, '16');
  const positive = (counts['Excelente'] || 0) + (counts['Buena'] || 0);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return total > 0 ? Math.round((positive / total) * 100) : 0;
}

// Get return rate from question 17
export function getReturnRate(data: SurveyResponse[]): { si: number; pensaria: number; no: number } {
  const counts = countByQuestion(data, '17');
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return {
    si: total > 0 ? Math.round(((counts['Sí'] || 0) / total) * 100) : 0,
    pensaria: total > 0 ? Math.round(((counts['Lo pensaría'] || 0) / total) * 100) : 0,
    no: total > 0 ? Math.round(((counts['No'] || 0) / total) * 100) : 0,
  };
}

// Get most frequent answer for a question
export function getMostFrequent(counts: Record<string, number>): string {
  let maxCount = 0;
  let mostFrequent = '';
  
  for (const [key, value] of Object.entries(counts)) {
    if (value > maxCount) {
      maxCount = value;
      mostFrequent = key;
    }
  }
  
  return mostFrequent;
}

// Generate chart data for a specific question
export function getChartDataForQuestion(data: SurveyResponse[], questionId: string): Array<{
  name: string;
  value: number;
  percentage: number;
  color: string;
}> {
  const question = surveyQuestions.find(q => q.id === questionId);
  if (!question) return [];
  
  const counts = countByQuestion(data, questionId);
  const percentages = calculatePercentages(counts);
  
  return question.opciones.map((opcion, index) => ({
    name: opcion,
    value: counts[opcion] || 0,
    percentage: percentages[opcion] || 0,
    color: getOptionColor(questionId, opcion, index),
  }));
}
