import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

type FeedbackPoint = { estado: 'bien' | 'mejorar'; texto: string };
type AIFeedback = {
  postura: FeedbackPoint;
  rango: FeedbackPoint;
  estabilidad: FeedbackPoint;
  mensaje_general: string;
};

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, exerciseName } = await req.json();

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return NextResponse.json({ success: false, error: 'GEMINI_API_KEY no configurada en .env.local' }, { status: 500 });
    }
    if (!videoUrl) {
      return NextResponse.json({ success: false, error: 'videoUrl es obligatoria' }, { status: 400 });
    }

    // 1. Download video from Supabase Storage public URL
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error(`No se pudo descargar el vídeo (${videoRes.status})`);

    const videoBuffer = await videoRes.arrayBuffer();
    const base64Video = Buffer.from(videoBuffer).toString('base64');
    const mimeType = (videoRes.headers.get('content-type') || 'video/mp4') as string;

    // 2. Call Gemini Vision
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel(
      { model: 'gemini-2.0-flash' },
      { apiVersion: 'v1beta' }
    );

    const prompt = `Eres un entrenador personal experto en biomecánica y movimiento funcional. 
Analiza este vídeo del ejercicio "${exerciseName}" y proporciona feedback profesional.

Responde ÚNICAMENTE con un JSON válido con exactamente esta estructura (sin texto adicional, sin markdown):
{
  "postura": { "estado": "bien", "texto": "Descripción concisa de la postura (máx 20 palabras)" },
  "rango": { "estado": "mejorar", "texto": "Descripción del rango de movimiento (máx 20 palabras)" },
  "estabilidad": { "estado": "bien", "texto": "Descripción de la estabilidad del core (máx 20 palabras)" },
  "mensaje_general": "Frase motivadora de resumen específica al ejercicio (máx 25 palabras)"
}

Reglas:
- "estado" solo puede ser "bien" o "mejorar"
- Sé específico al ejercicio "${exerciseName}", no genérico
- Tono: motivador, directo, profesional
- Si el vídeo no muestra claramente el ejercicio, usa criterios razonables`;

    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64Video } },
      { text: prompt },
    ]);

    const rawText = result.response.text().trim();

    // Parse JSON — handle possible markdown code blocks
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('La IA no devolvió un JSON válido');

    const feedback: AIFeedback = JSON.parse(jsonMatch[0]);

    // Validate structure
    const required = ['postura', 'rango', 'estabilidad', 'mensaje_general'] as const;
    for (const key of required) {
      if (!feedback[key]) throw new Error(`Falta el campo "${key}" en el feedback`);
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error('❌ Error en AI Video Analysis:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error desconocido' }, { status: 500 });
  }
}
