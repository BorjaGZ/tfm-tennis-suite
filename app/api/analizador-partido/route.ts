import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key no configurada." }, { status: 500 });
    }

    // Leer prompt y modelo desde archivos
    const promptPath  = path.join(DATA_DIR, "prompt_ejecucion.md");
    const modeloPath  = path.join(DATA_DIR, "modelo_tierra_batida.md");

    if (!fs.existsSync(promptPath) || !fs.existsSync(modeloPath)) {
      return NextResponse.json({ error: "Archivos del modelo no encontrados en el servidor." }, { status: 500 });
    }

    const promptEjecucion = fs.readFileSync(promptPath, "utf-8");
    const modeloContenido = fs.readFileSync(modeloPath, "utf-8");

    // Leer imágenes del FormData
    const formData  = await req.formData();
    const imagen1   = formData.get("imagen1") as File;
    const imagen2   = formData.get("imagen2") as File;

    if (!imagen1 || !imagen2) {
      return NextResponse.json({ error: "Se requieren las dos imágenes." }, { status: 400 });
    }

    // Convertir imágenes a base64
    const buffer1   = Buffer.from(await imagen1.arrayBuffer());
    const buffer2   = Buffer.from(await imagen2.arrayBuffer());
    const base64_1  = buffer1.toString("base64");
    const base64_2  = buffer2.toString("base64");
    const mime1     = imagen1.type || "image/jpeg";
    const mime2     = imagen2.type || "image/jpeg";

    // Construir prompt completo
    const promptCompleto = `
${promptEjecucion}

---

## MODELO DE REFERENCIA

${modeloContenido}

---

## INSTRUCCIÓN FINAL

Ejecuta el modelo con las dos imágenes adjuntas:
- Imagen 1: Estadísticas en TODAS LAS SUPERFICIES (referencia secundaria)
- Imagen 2: Estadísticas en TIERRA BATIDA (fuente primaria)

Responde ÚNICAMENTE en este formato:
GANADOR: [Nombre completo]
PROBABILIDAD: [XX]%
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} } as any],
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mime1,
          data: base64_1,
        },
      },
      {
        inlineData: {
          mimeType: mime2,
          data: base64_2,
        },
      },
      { text: promptCompleto },
    ]);

    const texto = result.response.text().trim();

    // Parsear respuesta
    const ganadorMatch      = texto.match(/GANADOR:\s*(.+)/i);
    const probabilidadMatch = texto.match(/PROBABILIDAD:\s*(\d+)%/i);

    if (!ganadorMatch || !probabilidadMatch) {
      return NextResponse.json({ error: "Respuesta inesperada del modelo.", raw: texto }, { status: 500 });
    }

    return NextResponse.json({
      ganador:      ganadorMatch[1].trim(),
      probabilidad: parseInt(probabilidadMatch[1]),
      raw:          texto,
    });

  } catch (e: any) {
    console.error("Error Gemini:", e);
    return NextResponse.json({ error: "Error al analizar el partido." }, { status: 500 });
  }
}