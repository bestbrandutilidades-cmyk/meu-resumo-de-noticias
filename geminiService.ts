import type { NewsArticle } from '../types';

export async function fetchAndSummarizeNews(topic: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch('/.netlify/functions/fetch-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch news from the server.');
    }

    const newsArticles: NewsArticle[] = await response.json();
    return newsArticles;

  } catch (error) {
    console.error("Error calling backend function:", error);
    if (error instanceof Error) {
        throw new Error(`Falha ao buscar notícias: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido ao buscar as notícias.");
  }
}