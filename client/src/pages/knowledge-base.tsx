import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import KnowledgeArticleCard from '@/components/knowledge-article-card';
import CreateArticleModal from '@/components/create-article-modal';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, PlusCircle, Download } from 'lucide-react';
import type { KnowledgeArticle } from '@shared/schema';

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCreateArticleModalOpen, setIsCreateArticleModalOpen] = useState(false);
  
  // Fetch knowledge articles
  const { data: articles = [], isLoading } = useQuery<KnowledgeArticle[]>({
    queryKey: ['/api/knowledge'],
  });
  
  // Export knowledge base as CSV
  const exportKnowledgeBase = () => {
    if (!articles.length) return;
    
    // Prepare CSV headers
    let csvContent = "ID,Title,Category,Author ID,Content,Views,Published,Created At\n";
    
    // Add each article to CSV
    articles.forEach(article => {
      const row = [
        article.id,
        `"${article.title.replace(/"/g, '""')}"`, // Escape quotes in title
        article.category,
        article.authorId,
        `"${article.content.replace(/"/g, '""')}"`, // Escape quotes in content
        article.views || 0,
        article.published ? 'Yes' : 'No',
        article.createdAt ? new Date(article.createdAt).toLocaleDateString() : ''
      ];
      csvContent += row.join(',') + "\n";
    });
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `knowledge-base-export-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Apply filters
  let filteredArticles = [...articles];
  
  if (categoryFilter !== 'all') {
    filteredArticles = filteredArticles.filter(article => article.category === categoryFilter);
  }
  
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    filteredArticles = filteredArticles.filter(article => 
      article.title.toLowerCase().includes(query) || 
      article.content.toLowerCase().includes(query) ||
      article.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Group articles by category for display
  const categories = ['network', 'software', 'hardware', 'email', 'access'];
  
  // Get unique categories from actual articles
  const availableCategories = Array.from(new Set(articles.map(article => article.category)));

  return (
    <div className="p-6">
      <CreateArticleModal 
        isOpen={isCreateArticleModalOpen}
        onClose={() => setIsCreateArticleModalOpen(false)}
      />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Knowledge Base</h1>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={exportKnowledgeBase} 
                  disabled={articles.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button 
                  className="bg-primary text-white"
                  onClick={() => setIsCreateArticleModalOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Article
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Search className="h-16 w-16 text-neutral-300 mb-4" />
              <h3 className="text-xl font-medium text-neutral-800 mb-2">No articles found</h3>
              <p className="text-neutral-500">Try adjusting your search or filter to find what you're looking for.</p>
            </CardContent>
          </Card>
        ) : categoryFilter === 'all' ? (
          // When showing all categories, group by category
          categories
            .filter(category => filteredArticles.some(article => article.category === category))
            .map(category => (
              <div key={category} className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-neutral-800 capitalize">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles
                    .filter(article => article.category === category)
                    .map(article => (
                      <KnowledgeArticleCard key={article.id} article={article} />
                    ))}
                </div>
              </div>
            ))
        ) : (
          // When filtering by a specific category, just show the articles
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <KnowledgeArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
