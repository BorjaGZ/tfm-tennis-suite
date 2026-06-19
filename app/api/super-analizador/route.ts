import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const PATH_NORMAL = path.join(DATA_DIR, "estadisticas.xlsx");
const PATH_MINI   = path.join(DATA_DIR, "estadisticas_mini.xlsx");

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Registro { probabilidad: number; cuota: number; resultado: string; }
interface Metricas { total: number; aciertos: number; pctAcierto: number; beneficio: number; yield: number; pIni: number; pFin: number; }
interface Estrategia { m1: Metricas; m15: Metricas; m2: Metricas; beneficioTotal: number; formula: string; exito: boolean; }
interface ResultadoArchivo { nombre: string; total: number; estrategia: Estrategia | null; error?: string; }

// ── Leer Excel ─────────────────────────────────────────────────────────────
function leerExcel(filePath: string): Registro[] {
  const buffer = fs.readFileSync(filePath);
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  return raw.map((r) => ({
    probabilidad: parseFloat(String(r["Probabilidad"] ?? r["probabilidad"] ?? 0)),
    cuota:        parseFloat(String(r["Cuota"]        ?? r["cuota"]        ?? 0)),
    resultado:    String(r["Resultado"] ?? r["resultado"] ?? "").toUpperCase().trim(),
  })).filter((r) => !isNaN(r.probabilidad) && !isNaN(r.cuota));
}

// ── Calcular métricas para un rango ────────────────────────────────────────
function calcularMetricas(
  registros: Registro[], stake: number, pIni: number, pFin: number,
  cuotaMin: number, cuotaMax: number, minAcierto: number, minApuestas: number
): Metricas | null {
  const filtro = registros.filter(
    (r) => r.probabilidad >= pIni && r.probabilidad <= pFin &&
           r.cuota >= cuotaMin && r.cuota <= cuotaMax
  );
  if (filtro.length < minApuestas) return null;

  const aciertos   = filtro.filter((r) => r.resultado === "SI").length;
  const pctAcierto = (aciertos / filtro.length) * 100;
  if (pctAcierto < minAcierto) return null;

  const ganancias = filtro.filter((r) => r.resultado === "SI").reduce((s, r) => s + r.cuota * stake, 0);
  const perdidas  = (filtro.length - aciertos) * stake;
  const beneficio = ganancias - aciertos * stake - perdidas;
  const yieldPct  = (beneficio / (filtro.length * stake)) * 100;

  return { total: filtro.length, aciertos, pctAcierto, beneficio, yield: yieldPct, pIni, pFin };
}

// ── Buscar mejor combinación 3 rangos no solapados ─────────────────────────
function buscarEstrategia(
  registros: Registro[], cuotaMin: number, cuotaMax: number,
  minAcierto: number
): Estrategia | null {
  const probs = [...new Set(registros.map((r) => r.probabilidad))].sort((a, b) => a - b);
  const MIN_APUESTAS = 5;

  // Precalcular todas las métricas válidas por stake
  const validos: Record<number, { m: Metricas; i: number; j: number }[]> = { 1: [], 1.5: [], 2: [] };

  for (let i = 0; i < probs.length; i++) {
    for (let j = i; j < probs.length; j++) {
      for (const stake of [1, 1.5, 2]) {
        const m = calcularMetricas(registros, stake, probs[i], probs[j], cuotaMin, cuotaMax, minAcierto, MIN_APUESTAS);
        if (m) validos[stake].push({ m, i, j });
      }
    }
  }

  let mejorTotal = -Infinity;
  let mejorCombo: { m1: Metricas; m15: Metricas; m2: Metricas } | null = null;

  for (const { m: m1, j: j1 } of validos[1]) {
    for (const { m: m15, i: i15, j: j15 } of validos[1.5]) {
      if (i15 <= j1) continue;
      for (const { m: m2, i: i2 } of validos[2]) {
        if (i2 <= j15) continue;
        const total = m1.beneficio + m15.beneficio + m2.beneficio;
        if (total > mejorTotal) { mejorTotal = total; mejorCombo = { m1, m15: m15, m2 }; }
      }
    }
  }

  if (!mejorCombo) return null;

  const { m1, m15, m2 } = mejorCombo;
  const formula = generarFormula(m1, m15, m2, cuotaMin, cuotaMax);

  return { m1, m15, m2, beneficioTotal: mejorTotal, formula, exito: minAcierto > 0 };
}

// ── Generar fórmula Excel ──────────────────────────────────────────────────
function generarFormula(m1: Metricas, m15: Metricas, m2: Metricas, cuotaMin: number, cuotaMax: number): string {
  const pct  = (v: number) => `${Math.round(v * 100)}%`;
  const dec  = (v: number) => v.toFixed(2).replace(".", ",");
  const cond = `$D2>=${dec(cuotaMin)};$D2<=${dec(cuotaMax)}`;

  return (
    `=IF(AND($B2>=${pct(m1.pIni)};$B2<=${pct(m1.pFin)};${cond});"STAKE 1";` +
    `IF(AND($B2>=${pct(m15.pIni)};$B2<=${pct(m15.pFin)};${cond});"STAKE 1.5";` +
    `IF(AND($B2>=${pct(m2.pIni)};$B2<=${pct(m2.pFin)};${cond});"STAKE 2";"NO APOSTAR")))`
  );
}

// ── Procesar un archivo ────────────────────────────────────────────────────
function procesarArchivo(filePath: string, nombre: string, cuotaMin: number, cuotaMax: number): ResultadoArchivo {
  const registros = leerExcel(filePath);

  let estrategia = buscarEstrategia(registros, cuotaMin, cuotaMax, 60);
  let exito = true;

  if (!estrategia) {
    estrategia = buscarEstrategia(registros, cuotaMin, cuotaMax, 0);
    exito = false;
  }

  if (estrategia) estrategia.exito = exito;

  return { nombre, total: registros.length, estrategia };
}

// ── GET — comprobar existencia y analizar ──────────────────────────────────
export async function GET() {
  const existeNormal = fs.existsSync(PATH_NORMAL);
  const existeMini   = fs.existsSync(PATH_MINI);

  if (!existeNormal && !existeMini) {
    return NextResponse.json({ existeNormal: false, existeMini: false });
  }

  if (!existeNormal || !existeMini) {
    return NextResponse.json({ existeNormal, existeMini });
  }

  try {
    const normal = procesarArchivo(PATH_NORMAL, "Estadísticas Normales", 1.5, 2.62);
    const mini   = procesarArchivo(PATH_MINI,   "Estadísticas Mini",    1.2, 1.49);
    return NextResponse.json({ existeNormal: true, existeMini: true, normal, mini });
  } catch (e) {
    return NextResponse.json({ error: "Error al procesar los Excel." }, { status: 500 });
  }
}

// ── POST — subir uno de los dos Excel ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file  = formData.get("file") as File;
    const tipo  = formData.get("tipo") as string; // "normal" | "mini"

    if (!file || !tipo) {
      return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    try { XLSX.read(buffer, { type: "buffer" }); }
    catch { return NextResponse.json({ error: "El archivo no es un Excel válido." }, { status: 400 }); }

    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

    const destino = tipo === "mini" ? PATH_MINI : PATH_NORMAL;
    fs.writeFileSync(destino, buffer);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al guardar el archivo." }, { status: 500 });
  }
}