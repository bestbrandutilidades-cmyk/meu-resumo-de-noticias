import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
    throw new Error("A variável de ambiente API_KEY não está configurada.");
}

const ai = new GoogleGenAI({ apiKey });

export async function handler(event: { body: string }) {
  try {
    const { topic } = JSON.parse(event.body);

    if (!topic) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'O tema é obrigatório.' }),
      };
    }

    const prompt = `Busque as notícias mais recentes e relevantes sobre "${topic}". 
Para cada notícia encontrada, formate a saída estritamente da seguinte maneira, usando "%%" como separador entre as notícias. Não adicione nenhuma introdução, cabeçalho, rodapé ou conclusão, apenas a lista de notícias no formato especificado.

Título: [O título da notícia]
Resumo: [Um resumo conciso da notícia em português cobrindo os pontos principais]
Link: [A URL completa da notícia original]
%%`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text;

    return {
      statusCode: 200,
      body: JSON.stringify({ data: responseText }),
    };
  } catch (error) {
    console.error("Erro na função do servidor:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha ao comunicar com a API do Gemini no servidor.' }),
    };
  }
}
