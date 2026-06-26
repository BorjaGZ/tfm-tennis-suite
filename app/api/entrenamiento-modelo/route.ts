import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { put, head } from "@vercel/blob";

const BLOB_KEY = "entrenamiento_modelo.xlsx";

export async function GET() {
  let blobInfo;
  try {
    blobInfo = await head(BLOB_KEY);
  } catch {
    return NextResponse.json({ exists: false });
  }

  try {
    const res    = await fetch(blobInfo.url);
    const buffer = await res.arrayBuffer();
    const wb     = XLSX.read(buffer, { type: "array" });
    const ws     = wb.Sheets[wb.SheetNames[0]];
    const raw: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const rows = raw.filter((r) => r.length >= 4);
    const hasHeader = typeof rows[0][0] === "string" && rows[0][0].toLowerCase().includes("jugador");
    const data = hasHeader ? rows.slice(1) : rows;

    const registros = data.map((r) => ({
      jugador:      String(r[0] ?? ""),
      probabilidad: parseFloat(String(r[1])) || 0,
      resultado:    String(r[2] ?? "").toUpperCase().trim(),
      circuito:     String(r[3] ?? ""),
    }));

    const soloSI = registros.filter((r) => r.resultado === "SI");
    const soloNO = registros.filter((r) => r.resultado === "NO");

    const topSI    = [...soloSI].sort((a, b) => b.probabilidad - a.probabilidad).slice(0, 3);
    const topNO    = [...soloNO].sort((a, b) => b.probabilidad - a.probabilidad).slice(0, 3);
    const bottomSI = [...soloSI].sort((a, b) => a.probabilidad - b.probabilidad).slice(0, 3);

    const seleccionIndices = new Set([
      ...topSI.map((r) => registros.indexOf(r)),
      ...topNO.map((r) => registros.indexOf(r)),
      ...bottomSI.map((r) => registros.indexOf(r)),
    ]);

    const seleccion = [...topSI, ...topNO, ...bottomSI];
    const resto     = registros.filter((_, i) => !seleccionIndices.has(i));

    return NextResponse.json({ exists: true, total: registros.length, seleccion, resto, grupos: { topSI, topNO, bottomSI } });
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

    await put(BLOB_KEY, buffer, { access: "public", allowOverwrite: true });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al guardar el archivo." }, { status: 500 });
  }
}