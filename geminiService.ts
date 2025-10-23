import type { NewsArticle } from '../types';

export async function fetchAndSummarizeNews(topic: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch('/api/gemini', {
// ... (o resto do arquivo geminiService.ts continua exatamente igual, com o endereço /api/gemini)