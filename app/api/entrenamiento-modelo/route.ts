import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

const EXCEL_PATH = path.join(process.cwd(), "data", "entrenamiento_modelo.xlsx");

// GET — comprobar si existe el Excel y ejecutar análisis
export async function GET() {
  if (!fs.existsSync(EXCEL_PATH)) {
    return NextResponse.json({ exists: false });
  }

  try {
    const buffer = fs.readFileSync(EXCEL_PATH);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Ignorar cabecera si existe
    const rows = raw.filter((r) => r.length >= 4);
    const hasHeader =
      typeof rows[0][0] === "string" &&
      rows[0][0].toLowerCase().includes("jugador");
    const data = hasHeader ? rows.slice(1) : rows;

    const registros = data.map((r) => ({
      jugador:      String(r[0] ?? ""),
      probabilidad: parseFloat(String(r[1])) || 0,
      resultado:    String(r[2] ?? "").toUpperCase().trim(),
      circuito:     String(r[3] ?? ""),
    }));

    const soloSI = registros.filter((r) => r.resultado === "SI");
    const soloNO = registros.filter((r) => r.resultado === "NO");

    const topSI     = [...soloSI].sort((a, b) => b.probabilidad - a.probabilidad).slice(0, 3);
    const topNO     = [...soloNO].sort((a, b) => b.probabilidad - a.probabilidad).slice(0, 3);
    const bottomSI  = [...soloSI].sort((a, b) => a.probabilidad - b.probabilidad).slice(0, 3);

    const seleccionIndices = new Set([
      ...topSI.map((r) => registros.indexOf(r)),
      ...topNO.map((r) => registros.indexOf(r)),
      ...bottomSI.map((r) => registros.indexOf(r)),
    ]);

    const seleccion = [...topSI, ...topNO, ...bottomSI];
    const resto = registros.filter((_, i) => !seleccionIndices.has(i));

    return NextResponse.json({
      exists: true,
      total: registros.length,
      seleccion,
      resto,
      grupos: {
        topSI,
        topNO,
        bottomSI,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Error al procesar el Excel." }, { status: 500 });
  }
}

// POST — subir/reemplazar el Excel
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Verificar que es un Excel válido
    try {
      XLSX.read(buffer, { type: "buffer" });
    } catch {
      return NextResponse.json({ error: "El archivo no es un Excel válido." }, { status: 400 });
    }

    // Crear carpeta data si no existe
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    fs.writeFileSync(EXCEL_PATH, buffer);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Error al guardar el archivo." }, { status: 500 });
  }
}