import React, { useState, useCallback } from 'react';
import { fetchAndSummarizeNews } from './services/geminiService';
import type { NewsArticle } from './types';
import { SearchIcon, LinkIcon, NewspaperIcon, ZapIcon } from './components/Icons';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [results, setResults] = useState<NewsArticle[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Por favor, insira um tema para a busca.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const newsArticles = await fetchAndSummarizeNews(topic);
      setResults(newsArticles);
    } catch (err) {
      console.error(err);
      // The JSON parsing error is a strong indicator of an invalid API Key,
      // as Google's API gateway may return an HTML error page instead of a JSON response.
      // We provide a more specific and helpful message for this common deployment issue.
      if (err instanceof Error && err.message.toLowerCase().includes('json')) {
        setError('Falha na comunicação com a API. Isso geralmente ocorre por uma Chave de API inválida ou mal configurada. Verifique se a variável de ambiente API_KEY foi adicionada corretamente na sua plataforma de hospedagem (ex: Vercel).');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
        setError(`Ocorreu um erro ao buscar as notícias. Detalhes: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [topic]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
             <div className="p-3 bg-orange-500/20 rounded-full">
                <NewspaperIcon className="w-8 h-8 text-orange-400" />
             </div>
             <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-yellow-400 text-transparent bg-clip-text">
                Resumo de Notícias - ATUALIZADO
             </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Digite um tema para buscar e resumir as últimas notícias.
          </p>
        </header>

        <main>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-grow">
               <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5"/>
               <input
                 type="text"
                 value={topic}
                 onChange={(e) => setTopic(e.target.value)}
                 placeholder="Ex: Inovações em inteligência artificial"
                 className="w-full h-14 pl-12 pr-4 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-300 placeholder-slate-500"
                 disabled={loading}
               />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 h-14 px-8 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-orange-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <ZapIcon className="w-5 h-5"/>
                  <span>Buscar</span>
                </>
              )}
            </button>
          </form>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                <p>{error}</p>
              </div>
            )}

            {!loading && !results && !error && (
                <div className="text-center py-16 px-4 border-2 border-dashed border-slate-700 rounded-lg">
                    <NewspaperIcon className="mx-auto h-12 w-12 text-slate-600" />
                    <h3 className="mt-2 text-xl font-semibold text-slate-300">Aguardando sua busca</h3>
                    <p className="mt-1 text-slate-500">Os resultados aparecerão aqui.</p>
                </div>
            )}

            {!loading && results && results.length === 0 && (
                <div className="text-center py-16 px-4 border-2 border-dashed border-slate-700 rounded-lg">
                    <SearchIcon className="mx-auto h-12 w-12 text-slate-600" />
                    <h3 className="mt-2 text-xl font-semibold text-slate-300">Nenhuma notícia encontrada</h3>
                    <p className="mt-1 text-slate-500">Tente um termo de busca diferente.</p>
                </div>
            )}
            
            {results && results.length > 0 && (
              <div className="space-y-6">
                 {results.map((article, index) => (
                    <article key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-6 sm:p-8 transition-all duration-300 hover:border-orange-500/50 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <h2 className="text-xl font-bold mb-3 text-orange-400">{article.title}</h2>
                        <p className="text-slate-300 mb-4 prose prose-invert max-w-none">
                            {article.summary}
                        </p>
                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200 group"
                        >
                            <LinkIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="group-hover:underline underline-offset-2">Ver notícia original</span>
                        </a>
                    </article>
                 ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;