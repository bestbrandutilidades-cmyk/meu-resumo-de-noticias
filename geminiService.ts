import { GoogleGenAI } from "@google/genai";
import type { NewsArticle } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchAndSummarizeNews(topic: string): Promise<NewsArticle[]> {
  try {
    const prompt = `Busque as notícias mais recentes e relevantes sobre "${topic}". Para cada notícia encontrada, gere um bloco de texto. Cada bloco DEVE seguir ESTRITAMENTE o formato abaixo. Use "%%" como um separador EXATO entre cada bloco de notícia. NÃO adicione texto introdutório, cabeçalhos, rodapés, conclusões ou qualquer formatação markdown (como '*', '#', etc). A resposta deve conter apenas os blocos de notícias.

Título: [título da notícia]
Resumo: [resumo da notícia]
Link: [URL da notícia]
%%`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text;
    if (!responseText) {
        return [];
    }

    const articles: NewsArticle[] = [];
    const articleBlocks = responseText.split('%%').filter(block => block.trim() !== '');

    const titleRegex = /Título:\s*(.*)/;
    const summaryRegex = /Resumo:\s*([\s\S]*?)(?=Link:|$)/;
    const linkRegex = /Link:\s*(.*)/;

    for (const block of articleBlocks) {
        const titleMatch = block.match(titleRegex);
        const summaryMatch = block.match(summaryRegex);
        const linkMatch = block.match(linkRegex);

        const title = titleMatch?.[1]?.trim();
        const summary = summaryMatch?.[1]?.trim();
        const url = linkMatch?.[1]?.trim();

        if (title && summary && url) {
            articles.push({ title, summary, url });
        }
    }

    return articles;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Falha ao comunicar com a API do Gemini. Verifique a chave de API e a conectividade.");
  }
}
