import { supabase } from '@/integrations/supabase/clients';
import type { SurveyResponse } from '@/data/mockSurveyData';
import { surveyQuestions } from '@/data/surveyQuestions';

type AnyRow = Record<string, any>;

const DEFAULT_TABLE_CANDIDATES = [
  // Most likely names
  'encuesta_respuestas',
  'encuesta_respuesta',
  'respuestas_encuesta',
  'survey_responses',
  'responses',
];

function toISODate(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') {
    // Accept YYYY-MM-DD or ISO
    return value.includes('T') ? value.split('T')[0] : value;
  }
  if (value instanceof Date) return value.toISOString().split('T')[0];
  return String(value);
}

function pickFirst<T>(row: AnyRow, keys: string[]): T | undefined {
  for (const k of keys) {
    if (row && Object.prototype.hasOwnProperty.call(row, k) && row[k] != null) {
      return row[k] as T;
    }
  }
  return undefined;
}

function normalizeQuestionKey(rawKey: string): string {
  const k = String(rawKey).trim();
  // Accept "P16" / "p16" -> "16"
  const m = /^p(\d+)$/i.exec(k);
  if (m) return m[1];
  return k;
}

function buildOptionIdToTextMap(optionRows: AnyRow[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const r of optionRows) {
    const id = pickFirst<any>(r, ['id', 'opcion_id', 'option_id']);
    const text = pickFirst<any>(r, ['opcion', 'texto', 'text', 'label', 'value']);
    if (id != null && text != null) {
      map[String(id)] = String(text);
    }
  }
  return map;
}

function looksLikeOptionId(value: unknown): boolean {
  // numeric ids like "64" or 64
  if (value == null) return false;
  const s = String(value).trim();
  return /^\d+$/.test(s);
}

function isKnownOptionText(questionId: string, value: string): boolean {
  const q = surveyQuestions.find((x) => x.id === questionId);
  if (!q) return true; // if unknown, don't block
  return q.opciones.includes(value);
}

/**
 * Normalize different possible DB schemas into the dashboard's SurveyResponse shape.
 *
 * Supported shapes:
 *  A) One row per survey submission:
 *     - id
 *     - fecha_atencion (date/string)
 *     - turno (string)
 *     - respuestas (json/object) -> { "1": "Menos de 5 minutos", ... }
 *     - comentario (string)
 *
 *  B) One row per answered question (normalized). Needs a submission id:
 *     - encuesta_id / submission_id / response_id
 *     - pregunta_id / pregunta_numero / numero
 *     - opcion / respuesta / opcion_text
 *     - comentario (optional for pregunta 18)
 *     - fecha_atencion, turno (can be repeated per row)
 */
export function normalizeRows(rows: AnyRow[], optionIdToText?: Record<string, string>): SurveyResponse[] {
  if (rows.length === 0) return [];

  const first = rows[0];

  // Shape A: respuestas is a JSON object on each row
  const respuestasObj = pickFirst<Record<string, string>>(first, ['respuestas', 'answers', 'responses']);
  if (respuestasObj && typeof respuestasObj === 'object' && !Array.isArray(respuestasObj)) {
    return rows.map((r) => {
      const id = String(pickFirst(r, ['id', 'uuid', 'response_id', 'encuesta_id']) ?? cryptoRandomId());
      const fecha_atencion = toISODate(pickFirst(r, ['fecha_atencion', 'fecha', 'date', 'created_at']));
      const turno = String(pickFirst(r, ['turno', 'shift']) ?? '');
      const comentario = String(pickFirst(r, ['comentario', 'comment', 'observaciones']) ?? '');

      const respuestas = (pickFirst<Record<string, any>>(r, ['respuestas', 'answers', 'responses']) ?? {}) as Record<
        string,
        any
      >;

      // Ensure all values are strings and normalize keys ("P16" -> "16")
      const respuestasStr: Record<string, string> = {};
      Object.entries(respuestas).forEach(([k, v]) => {
        if (v == null) return;
        const qKey = normalizeQuestionKey(k);
        let value = String(v);

        // If DB stores option ids, translate them to option text
        if (optionIdToText && looksLikeOptionId(value)) {
          const translated = optionIdToText[value];
          if (translated) value = translated;
        }

        respuestasStr[qKey] = value;
      });

      // If turno isn't stored separately, try to infer from question 19
      const inferredTurno = respuestasStr['19'];

      // If comentario isn't stored separately, try question 18
      const inferredComment = respuestasStr['18'];

      return {
        id,
        fecha_atencion,
        turno: turno || inferredTurno || '',
        respuestas: respuestasStr,
        comentario: comentario || inferredComment || '',
      };
    });
  }

  // Shape B: normalized (one row per question)
  const submissionKey =
    (
      [
        // Your real schema groups one submission under a shared "resultado_id"
        'resultado_id',
        // Other common keys
        'encuesta_id',
        'submission_id',
        'response_id',
        'survey_id',
        'id_respuesta',
      ] as const
    ).find((k) => Object.prototype.hasOwnProperty.call(first, k)) ?? 'resultado_id';

  const bySubmission = new Map<string, SurveyResponse>();

  for (const r of rows) {
    const submissionId = String(r[submissionKey] ?? r.id ?? cryptoRandomId());

    if (!bySubmission.has(submissionId)) {
      const fecha_atencion = toISODate(pickFirst(r, ['fecha_atencion', 'fecha', 'date', 'created_at']));
      const turno = String(pickFirst(r, ['turno', 'shift']) ?? '');
      bySubmission.set(submissionId, {
        id: submissionId,
        fecha_atencion,
        turno,
        respuestas: {},
        comentario: '',
      });
    }

    const item = bySubmission.get(submissionId)!;

    const qIdRaw = pickFirst<any>(r, ['pregunta_id', 'pregunta_numero', 'numero', 'question_id', 'question_number']);
    const qId = qIdRaw != null ? normalizeQuestionKey(String(qIdRaw)) : '';

    // In your schema, most answers are stored as opcion_id (FK to encuesta_opciones),
    // but open questions use respuesta_texto.
    const answer = pickFirst<any>(r, [
      // text answers
      'respuesta_texto',
      // option text (if you already queried a view)
      'opcion',
      'opcion_text',
      // generic fallbacks
      'respuesta',
      'answer',
      'value',
      // option id
      'opcion_id',
      'option_id',
    ]);

    if (qId && answer != null) {
      let value = String(answer);

      // If DB stores option ids (e.g., 64) instead of text ("Excelente"), translate them.
      if (optionIdToText && looksLikeOptionId(value)) {
        const translated = optionIdToText[value];
        if (translated) value = translated;
      }

      item.respuestas[qId] = value;

      // Special handling for your survey:
      // - P18 (texto libre) -> comentario
      // - P20 (fecha) -> fecha_atencion
      if (qId === '18' && value.trim()) {
        item.comentario = value;
      }
      if (qId === '20' && value.trim() && !item.fecha_atencion) {
        item.fecha_atencion = toISODate(value);
      }
    }

    // If you store a separate comment field, capture it too.
    const comment = pickFirst<any>(r, ['comentario', 'comment', 'observaciones']);
    if (comment && String(comment).trim()) {
      item.comentario = String(comment);
    }
  }

  // Infer turno/comment from answers if missing
  for (const v of bySubmission.values()) {
    if (!v.turno) v.turno = v.respuestas['19'] ?? '';
    if (!v.comentario) v.comentario = v.respuestas['18'] ?? '';
  }

  return Array.from(bySubmission.values());
}

function cryptoRandomId(): string {
  // Avoid importing extra deps. Good enough for client-side ids.
  return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

async function tableExists(table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select('*', { head: true, count: 'exact' }).limit(1);
  if (!error) return true;
  // Postgres "relation does not exist" => 42P01
  if ((error as any).code === '42P01') return false;
  // Other errors mean the table exists but is blocked (RLS / permissions) or other issue.
  return true;
}

async function fetchOptionsMap(): Promise<Record<string, string> | null> {
  // Most likely name for options table in your project
  const optionTableCandidates = ['encuesta_opciones', 'survey_options', 'opciones', 'options'];
  for (const t of optionTableCandidates) {
    try {
      const exists = await tableExists(t);
      if (!exists) continue;
      const { data, error } = await supabase.from(t).select('*').limit(1000);
      if (error) continue;
      return buildOptionIdToTextMap((data ?? []) as AnyRow[]);
    } catch {
      // try next
    }
  }
  return null;
}


async function resolveResponsesTable(preferredTable?: string): Promise<{ tableUsed: string; optionMap: Record<string, string> | null }> {
  const envTable = (import.meta.env.VITE_SUPABASE_RESPONSES_TABLE as string | undefined)?.trim();
  const candidates = [preferredTable, envTable, ...DEFAULT_TABLE_CANDIDATES].filter(Boolean) as string[];
  const uniqueCandidates = Array.from(new Set(candidates));

  let selectedTable: string | null = null;

  for (const t of uniqueCandidates) {
    try {
      const exists = await tableExists(t);
      if (exists) {
        selectedTable = t;
        break;
      }
    } catch {
      // ignore and try next
    }
  }

  if (!selectedTable) {
    throw new Error(
      `No se encontró la tabla de respuestas. Intenté: ${uniqueCandidates.join(', ')}. ` +
        `Configura VITE_SUPABASE_RESPONSES_TABLE con el nombre exacto.`
    );
  }

  // Translate option ids (FK) -> option text if possible
  const optionMap = await fetchOptionsMap();

  return { tableUsed: selectedTable, optionMap };
}

function escapeCsvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  // Escape quotes by doubling them; wrap if contains special chars
  const needsWrap = /[",\n\r;]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsWrap ? `"${escaped}"` : escaped;
}

function downloadFile(filename: string, content: Blob) {
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Backup (Excel-friendly): downloads a CSV that Excel can open.
 * Includes id, fecha_atencion, turno, comentario, and P1..P20.
 */
export async function downloadSurveyBackupExcel(opts?: { table?: string; limit?: number }) {
  const { tableUsed, optionMap } = await resolveResponsesTable(opts?.table);
  const limit = opts?.limit ?? 50000;

  const { data, error } = await supabase
    .from(tableUsed)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Error leyendo Supabase (${tableUsed}): ${error.message}`);
  }

  const normalized = normalizeRows((data ?? []) as AnyRow[], optionMap ?? undefined);

  const questionIds = surveyQuestions.map((q) => q.id);
  const headers = ['id', 'fecha_atencion', 'turno', 'comentario', ...questionIds.map((id) => `P${id}`)];

  const lines: string[] = [];
  // UTF-8 BOM helps Excel show accents correctly
  lines.push(headers.join(';'));

  for (const r of normalized) {
    const row: Record<string, string> = {
      id: r.id ?? '',
      fecha_atencion: r.fecha_atencion ?? '',
      turno: r.turno ?? '',
      comentario: r.comentario ?? '',
    };

    for (const qid of questionIds) {
      row[`P${qid}`] = r.respuestas?.[qid] ?? '';
    }

    lines.push(headers.map((h) => escapeCsvCell(row[h])).join(';'));
  }

  const csv = '\uFEFF' + lines.join('\n');
  const filename = `backup-encuestas-${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(filename, new Blob([csv], { type: 'text/csv;charset=utf-8' }));

  return { tableUsed, rows: normalized.length };
}

/**
 * Deletes ALL rows from the responses table.
 * Requires DELETE permission (RLS) for the anon/public key you are using.
 */
export async function deleteAllSurveyResponses(opts?: { table?: string }) {
  const { tableUsed } = await resolveResponsesTable(opts?.table);

  // Figure out a safe column to use as a filter (Supabase requires a filter for deletes).
  const { data: sample, error: sampleErr } = await supabase.from(tableUsed).select('*').limit(1);

  if (sampleErr) {
    throw new Error(`No se pudo verificar columnas en (${tableUsed}): ${sampleErr.message}`);
  }

  const firstRow = (sample ?? [])[0] as AnyRow | undefined;

  // If table is empty, nothing to do
  if (!firstRow) {
    return { tableUsed, deleted: 0 };
  }

  const deleteColumnCandidates = ['id', 'uuid', 'response_id', 'encuesta_id', 'resultado_id', 'submission_id', 'created_at'];
  const deleteColumn =
    deleteColumnCandidates.find((c) => Object.prototype.hasOwnProperty.call(firstRow, c)) ?? Object.keys(firstRow)[0];

  // Try to get count (best effort)
  let beforeCount: number | null = null;
  try {
    const { count } = await supabase.from(tableUsed).select('*', { head: true, count: 'exact' });
    if (typeof count === 'number') beforeCount = count;
  } catch {
    // ignore
  }

  const { error } = await supabase.from(tableUsed).delete().not(deleteColumn, 'is', null);

  if (error) {
    throw new Error(
      `Error eliminando datos en Supabase (${tableUsed}): ${error.message}. ` +
        `Revisa RLS: habilita DELETE para anon/public, o implementa un endpoint seguro (RPC / Edge Function).`
    );
  }

  return { tableUsed, deleted: beforeCount ?? -1 };
}

export async function fetchSurveyResponses(opts?: {
  table?: string;
  limit?: number;
}): Promise<{ tableUsed: string; data: SurveyResponse[] }> {
  const { tableUsed, optionMap } = await resolveResponsesTable(opts?.table);

  const limit = opts?.limit ?? 10000;

  // Try to keep the payload reasonable.
  // If your table is huge, create a view/RPC for aggregated stats.
  const { data, error } = await supabase
    .from(tableUsed)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(
      `Error leyendo Supabase (${tableUsed}): ${error.message}. ` +
        `Revisa RLS: habilita SELECT para anon/public si el dashboard no usa login.`
    );
  }

  const normalized = normalizeRows((data ?? []) as AnyRow[], optionMap ?? undefined);
  return { tableUsed, data: normalized };
}
