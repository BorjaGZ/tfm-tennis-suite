import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { put, head } from "@vercel/blob";

export const dynamic = "force-dynamic";

const BLOB_KEY = "estadisticas.xlsx";
const TOKEN    = process.env.BLOB2_READ_WRITE_TOKEN;

interface Registro { probabilidad: number; cuota: number; resultado: string; }
interface Metricas { total: number; aciertos: number; pctAcierto: number; beneficio: number; yield: number; pIni: number; pFin: number; }
interface Estrategia { m1: Metricas; m15: Metricas; m2: Metricas; beneficioTotal: number; formula: string; exito: boolean; }

function leerExcelBuffer(buffer: ArrayBuffer): Registro[] {
  const wb  = XLSX.read(buffer, { type: "array" });
  const ws  = wb.Sheets[wb.SheetNames[0]];
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
  registros: Registro[], cuotaMin: number,
  minS1: number, minS2: number, minS3: number
): Estrategia | null {
  const probs = [...new Set(registros.map((r) => r.probabilidad))].sort((a, b) => a - b);
  const MIN_APUESTAS = 10;
  const validos: Record<string, { m: Metricas; i: number; j: number }[]> = { s1: [], s2: [], s3: [] };

  for (let i = 0; i < probs.length; i++) {
    for (let j = i; j < probs.length; j++) {
      const mS1 = calcularMetricas(registros, 1,   probs[i], probs[j], cuotaMin, minS1, MIN_APUESTAS);
      const mS2 = calcularMetricas(registros, 1.5, probs[i], probs[j], cuotaMin, minS2, MIN_APUESTAS);
      const mS3 = calcularMetricas(registros, 2,   probs[i], probs[j], cuotaMin, minS3, MIN_APUESTAS);
      if (mS1) validos.s1.push({ m: mS1, i, j });
      if (mS2) validos.s2.push({ m: mS2, i, j });
      if (mS3) validos.s3.push({ m: mS3, i, j });
    }
  }

  let mejorTotal = -Infinity;
  let mejorCombo: { m1: Metricas; m15: Metricas; m2: Metricas } | null = null;

  for (const { m: m1, j: j1 } of validos.s1) {
    for (const { m: m15, i: i15, j: j15 } of validos.s2) {
      if (i15 <= j1) continue;
      for (const { m: m2, i: i2 } of validos.s3) {
        if (i2 <= j15) continue;
        const total = m1.beneficio + m15.beneficio + m2.beneficio;
        if (total > mejorTotal) { mejorTotal = total; mejorCombo = { m1, m15, m2 }; }
      }
    }
  }

  if (!mejorCombo) return null;
  const { m1, m15, m2 } = mejorCombo;
  return { m1, m15, m2, beneficioTotal: mejorTotal, formula: generarFormula(m1, m15, m2, cuotaMin), exito: minS1 > 0 };
}

function generarFormula(m1: Metricas, m15: Metricas, m2: Metricas, cuotaMin: number): string {
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const dec = (v: number) => v.toFixed(2).replace(".", ",");

  const s1ini = pct(m1.pIni);   const s1fin = pct(m1.pFin);
  const s2ini = pct(m15.pIni);  const s2fin = pct(m15.pFin);
  const s3ini = pct(m2.pIni);   const s3fin = pct(m2.pFin);

  const s1ini_id = pct(m1.pIni * m1.pIni);    const s1fin_id = pct(m1.pFin * m1.pFin);
  const s2ini_id = pct(m15.pIni * m15.pIni);  const s2fin_id = pct(m15.pFin * m15.pFin);
  const s3ini_id = pct(m2.pIni * m2.pIni);    const s3fin_id = pct(m2.pFin * m2.pFin);

  const ramaID = (
    `IF(AND($B2>=${s3ini_id};$B2<=${s3fin_id});"STAKE 3";` +
    `IF(AND($B2>=${s2ini_id};$B2<=${s2fin_id});"STAKE 2";` +
    `IF(AND($B2>=${s1ini_id};$B2<=${s1fin_id});"STAKE 1";"NO APOSTAR")))`
  );
  const ramaNormal = (
    `IF(AND($B2>=${s3ini};$B2<=${s3fin});"STAKE 3";` +
    `IF(AND($B2>=${s2ini};$B2<=${s2fin});"STAKE 2";` +
    `IF(AND($B2>=${s1ini};$B2<=${s1fin});"STAKE 1";"NO APOSTAR")))`
  );
  return `=IF(LEFT($A2;2)="ID";${ramaID};${ramaNormal})`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minS1 = parseFloat(searchParams.get("minS1") ?? "60");
    const minS2 = parseFloat(searchParams.get("minS2") ?? "60");
    const minS3 = parseFloat(searchParams.get("minS3") ?? "60");

    let blobInfo;
    try { blobInfo = await head(BLOB_KEY, { token: TOKEN }); }
    catch { return NextResponse.json({ existe: false }); }

    const res       = await fetch(blobInfo.url, { cache: "no-store" });
    const buffer    = await res.arrayBuffer();
    const registros = leerExcelBuffer(buffer);

    let estrategia = buscarEstrategia(registros, 1.2, minS1, minS2, minS3);
    let exito      = true;
    if (!estrategia) { estrategia = buscarEstrategia(registros, 1.2, 0, 0, 0); exito = false; }
    if (estrategia) estrategia.exito = exito;

    return NextResponse.json({ existe: true, total: registros.length, estrategia, umbrales: { minS1, minS2, minS3 } });
  } catch (e) {
    console.error(e);
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

    await put(BLOB_KEY, buffer, { access: "public", allowOverwrite: true, token: TOKEN });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al guardar el archivo." }, { status: 500 });
  }
}