// פונקציית שרת (Vercel Serverless Function).
// רצה בצד שרת בלבד - המפתח (GROQ_API_KEY) לעולם לא נחשף לדפדפן.
// Groq מריץ מודלים בקוד פתוח (כמו Llama) על חומרה מהירה משלהם, עם API
// שתואם לפורמט של OpenAI - די פשוט, והמכסה החינמית נדיבה משמעותית
// מזו של Gemini (30 בקשות בדקה, בלי כרטיס אשראי).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is not set");
    return res.status(500).json({ error: "Server is missing API key configuration" });
  }

  const { system, messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // פורמט OpenAI-style: system prompt הוא הודעה ראשונה עם role "system",
  // ואחריה שאר ההיסטוריה (role "user"/"assistant" - בדיוק כמו שכבר יש לנו).
  const openaiMessages = [{ role: "system", content: system || "" }, ...messages];

  // מודל פתוח, איכותי ומהיר, בעל מכסה חינמית טובה יחסית ב-Groq.
  // אפשר לבדוק מודלים נוספים ב-https://console.groq.com/docs/models
  const MODEL_ID = "llama-3.3-70b-versatile";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: openaiMessages,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", response.status, data);
      return res.status(response.status).json({ error: data });
    }

    const text = data?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ text });
  } catch (err) {
    console.error("chat.js server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
