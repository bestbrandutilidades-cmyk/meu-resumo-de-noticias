import React, { useState, useCallback } from 'react';
import { fetchAndSummarizeNews } from './services/geminiService';
import type { NewsArticle } from './types';
import { SearchIcon, LinkIcon, NewspaperIcon, ZapIcon } from './components/Icons';

// ... (o resto do arquivo App.tsx continua exatamente igual)