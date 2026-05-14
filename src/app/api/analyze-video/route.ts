import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, exerciseName } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 1. Descargar vídeo
    const res = await fetch(videoUrl);
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // 2. Prompt minimalista
    const prompt = `Analiza la técnica de "${exerciseName}" en este vídeo. 
    Responde SOLO un JSON:
    {
      "postura": {"estado": "bien/mejorar", "texto": "descripción corta"},
      "rango": {"estado": "bien/mejorar", "texto": "descripción corta"},
      "estabilidad": {"estado": "bien/mejorar", "texto": "descripción corta"},
      "mensaje_general": "consejo corto"
    }`;

    const result = await model.generateContent([
      { inlineData: { mimeType: 'video/mp4', data: base64 } },
      { text: prompt },
    ]);

    const rawText = result.response.text();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Error de formato');

    return NextResponse.json({ success: true, feedback: JSON.parse(jsonMatch[0]) });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Google está saturado, descansa Laura' }, { status: 500 });
  }
}
