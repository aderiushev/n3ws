export type NewsCategory = 'Russia' | 'Spain' | 'World';

export interface NewsItem {
  id: string;
  category: NewsCategory;
  headline: string;
  timestamp: number;
  source?: string;
}

export interface NewsByCategory {
  Russia: NewsItem[];
  Spain: NewsItem[];
  World: NewsItem[];
}

