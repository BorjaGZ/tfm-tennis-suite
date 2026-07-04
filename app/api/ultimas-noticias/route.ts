import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key no configurada." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} } as any],
      generationConfig: {
        temperature: 0.1, // Muy bajo para reducir alucinaciones
      } as any,
    });

    const hoy = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    const prompt = `Hoy es ${hoy}. 
    
IMPORTANTE: Usa Google Search para buscar noticias REALES de tenis de HOY ${hoy}. NO inventes noticias. Solo incluye noticias que hayas encontrado mediante búsqueda web con fecha de hoy o de los últimos 2 días.

Dame las 6 noticias más importantes del tenis de hoy que hayas encontrado en internet.
Para cada noticia incluye:
- Titular en español
- Resumen breve de 2-3 líneas basado en lo que has encontrado
- Categoría (ATP / WTA / Challenger / Otro)

Responde ÚNICAMENTE en formato JSON válido, sin texto adicional ni bloques de código, con esta estructura exacta:
{
  "fecha": "fecha de hoy",
  "noticias": [
    {
      "titular": "...",
      "resumen": "...",
      "categoria": "ATP"
    }
  ]
}`;

    const result   = await model.generateContent(prompt);
    const response = result.response;
    const text     = response.text();

    const clean = text.replace(/```json|```/g, "").trim();
    const data  = JSON.parse(clean);

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("Error Gemini:", e);
    return NextResponse.json({ error: "Error al obtener noticias." }, { status: 500 });
  }
}