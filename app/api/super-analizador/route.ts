import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

const DATA_DIR  = path.join(process.cwd(), "data");
const EXCEL_PATH = path.join(DATA_DIR, "estadisticas.xlsx");

interface Registro { probabilidad: number; cuota: number; resultado: string; }
interface Metricas { total: number; aciertos: number; pctAcierto: number; beneficio: number; yield: number; pIni: number; pFin: number; }
interface Estrategia { m1: Metricas; m15: Metricas; m2: Metricas; beneficioTotal: number; formula: string; exito: boolean; }
interface ResultadoArchivo { nombre: string; total: number; estrategia: Estrategia | null; }

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

function calcularMetricas(
  registros: Registro[], stake: number, pIni: number, pFin: number,
  cuotaMin: number, minAcierto: number, minApuestas: number
): Metricas | null {
  const filtro = registros.filter(
    (r) => r.probabilidad >= pIni && r.probabilidad <= pFin && r.cuota >= cuotaMin
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

function buscarEstrategia(
  registros: Registro[], cuotaMin: number, minAcierto: number
): Estrategia | null {
  const probs = [...new Set(registros.map((r) => r.probabilidad))].sort((a, b) => a - b);
  const MIN_APUESTAS = 5;

  const validos: Record<number, { m: Metricas; i: number; j: number }[]> = { 1: [], 1.5: [], 2: [] };

  for (let i = 0; i < probs.length; i++) {
    for (let j = i; j < probs.length; j++) {
      for (const stake of [1, 1.5, 2]) {
        const m = calcularMetricas(registros, stake, probs[i], probs[j], cuotaMin, minAcierto, MIN_APUESTAS);
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
        if (total > mejorTotal) { mejorTotal = total; mejorCombo = { m1, m15, m2 }; }
      }
    }
  }

  if (!mejorCombo) return null;

  const { m1, m15, m2 } = mejorCombo;
  const formula = generarFormula(m1, m15, m2, cuotaMin);
  return { m1, m15, m2, beneficioTotal: mejorTotal, formula, exito: minAcierto > 0 };
}

function generarFormula(m1: Metricas, m15: Metricas, m2: Metricas, cuotaMin: number): string {
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const dec = (v: number) => v.toFixed(2).replace(".", ",");
  const cond = `$D2>=${dec(cuotaMin)}`;

  // Umbrales normales
  const s3 = pct(m2.pIni);
  const s2 = pct(m15.pIni);
  const s1 = pct(m1.pIni);

  // Umbrales ID (cuadrado de los normales)
  const s3id = pct(m2.pIni * m2.pIni);
  const s2id = pct(m15.pIni * m15.pIni);
  const s1id = pct(m1.pIni * m1.pIni);

  const ramaID = (
    `IF($B2>=${s3id};"STAKE 3";` +
    `IF($B2>=${s2id};"STAKE 2";` +
    `IF($B2>=${s1id};"STAKE 1";"NO APOSTAR")))`
  );

  const ramaNormal = (
    `IF($B2>=${s3};"STAKE 3";` +
    `IF($B2>=${s2};"STAKE 2";` +
    `IF($B2>=${s1};"STAKE 1";"NO APOSTAR")))`
  );

  return `=IF(LEFT($A2;2)="ID";${ramaID};${ramaNormal})`;
}

export async function GET() {
  const existe = fs.existsSync(EXCEL_PATH);
  if (!existe) return NextResponse.json({ existe: false });

  try {
    const registros = leerExcel(EXCEL_PATH);
    let estrategia  = buscarEstrategia(registros, 1.2, 60);
    let exito       = true;

    if (!estrategia) {
      estrategia = buscarEstrategia(registros, 1.2, 0);
      exito      = false;
    }

    if (estrategia) estrategia.exito = exito;

    return NextResponse.json({
      existe: true,
      total: registros.length,
      estrategia,
    });
  } catch {
    return NextResponse.json({ error: "Error al procesar el Excel." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    try { XLSX.read(buffer, { type: "buffer" }); }
    catch { return NextResponse.json({ error: "El archivo no es un Excel válido." }, { status: 400 }); }

    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
    fs.writeFileSync(EXCEL_PATH, buffer);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al guardar el archivo." }, { status: 500 });
  }
}