import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key no configurada." }, { status: 500 });
    }

    const genAI  = new GoogleGenerativeAI(apiKey);
    
    const model  = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", 
      tools: [{ googleSearch: {} } as any],
    });

    const hoy    = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    const prompt = `Hoy es ${hoy}. Dame las 6 noticias más importantes del tenis de hoy. 
    Para cada noticia incluye:
    - Titular en español
    - Resumen breve de 2-3 líneas
    - Categoría (ATP / WTA / Grand Slam / Otro)
    
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

    //Limpiar las etiquetas Markdown ```json ... ```
    const clean = text.replace(/```json|```/g, "").trim();
    const data  = JSON.parse(clean);

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("Error Gemini:", e);
    return NextResponse.json({ error: e.message ?? "Error desconocido.", detalle: e.toString() }, { status: 500 });
  }
}