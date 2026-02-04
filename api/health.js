import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        ok: false,
        error: "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY",
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ✅ usa una tabla que exista (si no existe "productos", cambia el nombre)
    const { data, error } = await supabase
      .from("productos")
      .select("id")
      .limit(1);

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({
      ok: true,
      ts: new Date().toISOString(),
      rows_sample: data?.length ?? 0,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
