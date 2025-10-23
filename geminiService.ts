
import type { NewsArticle } from '../types.ts';

/**
 * Agora, esta função está com o endereço CORRETO para a "cozinha" da Vercel.
 */
export async function fetchAndSummarizeNews(topic: string): Promise<NewsArticle[]> {
  try {
    // O endereço do nosso "garçom" na Vercel é '/api/gemini'.
    // A Vercel entende que 'api' é a pasta onde estão as funções seguras.
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ocorreu um erro no servidor.');
    }

    const { data: responseText } = await response.json();
    
    if (!responseText) {
        return [];
    }

    const articles: NewsArticle[] = [];
    const articleBlocks = responseText.split('%%').filter(block => block.trim() !== '');

    for (const block of articleBlocks) {
        const titleLine = block.split('\n').find(l => l.startsWith('Título:'));
        const linkLine = block.split('\n').find(l => l.startsWith('Link:'));
        
        const title = titleLine?.substring('Título:'.length).trim();
        const url = linkLine?.substring('Link:'.length).trim();

        const summaryStartIndex = block.indexOf('Resumo:') + 'Resumo:'.length;
        const summaryEndIndex = block.indexOf('Link:');

        if (title && url && summaryStartIndex > -1 && summaryEndIndex > -1 && summaryStartIndex < summaryEndIndex) {
            const summary = block.substring(summaryStartIndex, summaryEndIndex).trim();
            articles.push({ title, summary, url });
        }
    }

    return articles;

  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    if (error instanceof Error) {
        throw new Error(`Falha ao buscar as notícias: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido ao buscar as notícias.");
  }
}
