import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, system, provider = 'gemini', model } = body;

    let aiText = "";

    if (provider === 'groq') {
      const apiKey = process.env.GROQ_API_KEY?.trim(); // Trim whitespace
      if (!apiKey) {
        throw new Error("GROQ_API_KEY is not configured in environment variables");
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || "llama-3.1-70b-versatile",
          messages: system ? [{ role: "system", content: system }, ...messages] : messages,
          temperature: 0.7
        })
      });
      const data = await response.json();
      if (data.error) {
        console.error("Groq API Error:", data.error);
        throw new Error(data.error.message || "Invalid API Key for Groq");
      }
      aiText = data.choices?.[0]?.message?.content || "";
    } 
    else if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY?.trim(); // Trim whitespace
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in environment variables");
      }

      const geminiModel = model || "gemini-1.5-flash";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages.map(m => ({
            role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content || m.text || "" }]
          })),
          system_instruction: system ? { parts: [{ text: system }] } : undefined,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          }
        })
      });
      const data = await response.json();
      if (data.error) {
        console.error("Gemini API Error:", data.error);
        throw new Error(data.error.message || "Invalid API Key for Gemini");
      }
      aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      throw new Error("Unsupported provider: " + provider);
    }

    return NextResponse.json({
      content: [{ text: aiText }]
    });

  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ 
      error: { message: error.message || "Internal Server Error" } 
    }, { status: 500 });
  }
}
