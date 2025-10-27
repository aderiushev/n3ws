import { create } from 'zustand';
import { NewsItem, NewsByCategory, NewsCategory } from '../types/news';

interface NewsState {
  news: NewsByCategory;
  isLoading: boolean;
  error: string | null;
  addNews: (newItems: NewsItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  news: {
    Russia: [],
    Spain: [],
    World: [],
  },
  isLoading: false,
  error: null,

  addNews: (newItems: NewsItem[]) =>
    set((state) => {
      const updatedNews = { ...state.news };

      newItems.forEach((item) => {
        const category = item.category;
        const categoryNews = [...updatedNews[category], item];

        // Keep only the latest 3 items per category
        if (categoryNews.length > 3) {
          // Remove oldest items (keep the newest 3)
          categoryNews.shift();
        }

        updatedNews[category] = categoryNews;
      });

      return { news: updatedNews };
    }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),
}));

