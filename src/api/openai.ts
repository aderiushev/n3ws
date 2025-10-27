import axios from 'axios';
import curlirize from 'axios-curlirize';
import { PERPLEXITY_API_KEY } from '@env';
import { NewsItem, NewsCategory } from '../types/news';
import { newsCache } from './newsCache';

// Fallback API key (temporary workaround for react-native-dotenv issues)
const API_KEY = PERPLEXITY_API_KEY || 'PERPLEXITY_API_KEY';

// Configure axios for Chat Completions API
const apiClient = axios.create({
  baseURL: 'https://api.perplexity.ai',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
});

curlirize(apiClient);

interface SearchResult {
  title: string;
  url: string;
  date?: string;
}

interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
  search_results?: SearchResult[];
}

// Prompts designed to get 3 different news items with intelligent 3-word headlines
const PROMPTS = {
  Russia: {
    system: 'Ты редактор. Пиши только заголовки из 3 слов на русском, по одному в строке.',
    user: 'Найди 3 важные новости России сегодня и создай по заголовку из ровно 3 слов. Формат:\nслово1 слово2 слово3\nслово1 слово2 слово3\nслово1 слово2 слово3',
  },
  Spain: {
    system: 'Eres editor. Escribe solo titulares de 3 palabras en español, uno por línea.',
    user: 'Busca 3 noticias importantes de España hoy y crea un titular de exactamente 3 palabras cada una. Formato:\npalabra1 palabra2 palabra3\npalabra1 palabra2 palabra3\npalabra1 palabra2 palabra3',
  },
  World: {
    system: 'You are an editor. Write only 3-word English headlines, one per line.',
    user: 'Find 3 major world news stories today and create one 3-word headline per story. Format:\nword1 word2 word3\nword1 word2 word3\nword1 word2 word3',
  },
};

// Helper to parse and validate 3-word headlines from AI response
const parseHeadlines = (text: string, expectedCount: number = 3): string[] => {
  const lines = text
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const headlines: string[] = [];

  for (const line of lines) {
    // Remove any numbering (1., 2., etc.) or bullet points
    const cleaned = line.replace(/^[\d\.\-\*\)\]]+\s*/, '').trim();

    // Extract only letters and spaces (keep Cyrillic, Latin, Spanish chars)
    const words = cleaned
      .replace(/[^\u0400-\u04FFa-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);

    // Take exactly 3 words
    if (words.length >= 3) {
      headlines.push(words.slice(0, 3).join(' '));
    }

    if (headlines.length >= expectedCount) {
      break;
    }
  }

  // Fallback if we didn't get enough headlines
  while (headlines.length < expectedCount) {
    headlines.push('News unavailable');
  }

  return headlines.slice(0, expectedCount);
};

export const fetchNews = async (): Promise<NewsItem[]> => {
  try {
    // Check cache first (async)
    const cachedNews = await newsCache.get();
    if (cachedNews) {
      console.log('🎯 Returning cached news (API call saved!)');
      return cachedNews;
    }

    console.log('🌐 Cache miss - fetching fresh news from API');
    const categories: NewsCategory[] = ['Russia', 'Spain', 'World'];
    const allNews: NewsItem[] = [];

    // Fetch 3 news items per category in a single API call (3 total calls)
    for (const category of categories) {
      const prompt = PROMPTS[category];

      console.log(`🔍 Fetching news for ${category}...`);

      const response = await apiClient.post<ChatCompletionResponse>('/chat/completions', {
        model: 'sonar', // Cost-efficient model with built-in web search
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
        max_tokens: 100, // Enough for 3 headlines + formatting
        temperature: 0.8, // Higher temperature for more diverse results
      });

      const content = response.data.choices[0]?.message?.content || '';
      const searchResults = response.data.search_results || [];

      // Parse the response to extract 3 headlines
      const headlines = parseHeadlines(content, 3);

      // Create news items with source URLs from search results
      headlines.forEach((headline, index) => {
        const sourceUrl = searchResults[index]?.url || 'https://www.perplexity.ai';

        allNews.push({
          id: `${category}-${Date.now()}-${index}`,
          category,
          headline,
          timestamp: Date.now(),
          source: sourceUrl,
        });
      });

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Cache the results (async)
    await newsCache.set(allNews);

    return allNews;
  } catch (error) {
    console.error('❌ Error fetching news from Perplexity:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw new Error('Failed to fetch news from Perplexity Chat Completions API');
  }
};

