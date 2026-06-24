import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

const EXCEL_PATH = path.join(process.cwd(), "data", "gestor_stakes.xlsx");

// ── GET — leer historial ───────────────────────────────────────────────────
export async function GET() {
  if (!fs.existsSync(EXCEL_PATH)) {
    return NextResponse.json({ historial: [] });
  }

  try {
    const buffer   = fs.readFileSync(EXCEL_PATH);
    const wb       = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const ws       = wb.Sheets[wb.SheetNames[0]];
    const raw      = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

    const historial = raw.map((r) => ({
      fecha:          r["Fecha"] instanceof Date
                        ? r["Fecha"].toLocaleDateString("es-ES")
                        : String(r["Fecha"] ?? ""),
      bank:           parseFloat(String(r["Bank"] ?? 0)),
      stake1:         parseFloat(String(r["Stake 1"] ?? 0)),
      stake2:         parseFloat(String(r["Stake 2"] ?? 0)),
      stake3:         parseFloat(String(r["Stake 3"] ?? 0)),
      limiteSuperior: parseFloat(String(r["Límite Superior"] ?? 0)),
      limiteInferior: parseFloat(String(r["Límite Inferior"] ?? 0)),
    }));

    return NextResponse.json({ historial });
  } catch {
    return NextResponse.json({ error: "Error al leer el historial." }, { status: 500 });
  }
}

// ── POST — añadir fila al historial ───────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bank, stake1, stake2, stake3, limiteSuperior, limiteInferior } = body;

    const fecha = new Date().toLocaleDateString("es-ES");

    let wb: XLSX.WorkBook;

    if (fs.existsSync(EXCEL_PATH)) {
      const buffer = fs.readFileSync(EXCEL_PATH);
      wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
    } else {
      wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ["Fecha", "Bank", "Stake 1", "Stake 2", "Stake 3", "Límite Superior", "Límite Inferior"]
      ]);
      XLSX.utils.book_append_sheet(wb, ws, "Historial");
    }

    const ws = wb.Sheets[wb.SheetNames[0]];
    XLSX.utils.sheet_add_aoa(ws, [[
      fecha, bank, stake1, stake2, stake3, limiteSuperior, limiteInferior
    ]], { origin: -1 });

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    fs.writeFileSync(EXCEL_PATH, buffer);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al guardar el registro." }, { status: 500 });
  }
}