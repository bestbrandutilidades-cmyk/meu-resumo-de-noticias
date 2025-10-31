import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Você precisa configurar a variável GEMINI_API_KEY na Vercel.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { topic } = req.body || {};
    if (!topic) {
      return res.status(400).json({ error: "O tópico é obrigatório" });
    }

    const prompt = `
Busque as 3 notícias mais recentes e relevantes sobre "${topic}".
Para cada notícia, retorne:
- "title": título original exato
- "summary": resumo conciso em português
- "url": link original
Responda APENAS com um array JSON válido.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonText = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

    const articles = JSON.parse(jsonText);
    return res.status(200).json(articles);
  } catch (error) {
    console.error("Erro /api/noticias:", error);
    return res.status(500).json({ error: "Erro ao buscar notícias." });
  }
}
