import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { type KnowledgeArticle, type InsertKnowledgeArticle } from '@shared/schema';

export function useKnowledgeBase() {
  // Get all knowledge articles
  const {
    data: articles = [],
    isLoading,
    isError,
    error,
  } = useQuery<KnowledgeArticle[]>({
    queryKey: ['/api/knowledge'],
  });

  // Create a new article
  const createArticle = useMutation({
    mutationFn: async (newArticle: InsertKnowledgeArticle) => {
      const res = await apiRequest('POST', '/api/knowledge', newArticle);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge'] });
    },
  });

  // Get a single article by ID
  const getArticle = (id: number) => {
    return useQuery<KnowledgeArticle>({
      queryKey: [`/api/knowledge/${id}`],
      enabled: !!id,
    });
  };

  // Update an article
  const updateArticle = useMutation({
    mutationFn: async ({ id, article }: { id: number; article: Partial<KnowledgeArticle> }) => {
      const res = await apiRequest('PATCH', `/api/knowledge/${id}`, article);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge'] });
      queryClient.invalidateQueries({ queryKey: [`/api/knowledge/${variables.id}`] });
    },
  });

  // Get articles by category
  const getArticlesByCategory = (category: string) => {
    return articles.filter(article => article.category === category);
  };

  // Search articles
  const searchArticles = (query: string) => {
    if (!query.trim()) return articles;
    
    const searchTerm = query.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(searchTerm) || 
      article.content.toLowerCase().includes(searchTerm) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  };

  // Get most viewed articles
  const getMostViewedArticles = (limit: number = 5) => {
    return [...articles]
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  };

  // Get recently updated articles
  const getRecentArticles = (limit: number = 5) => {
    return [...articles]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  };

  // Get unique categories from articles
  const getCategories = () => {
    return Array.from(new Set(articles.map(article => article.category)));
  };

  return {
    articles,
    isLoading,
    isError,
    error,
    createArticle,
    getArticle,
    updateArticle,
    getArticlesByCategory,
    searchArticles,
    getMostViewedArticles,
    getRecentArticles,
    getCategories,
  };
}
