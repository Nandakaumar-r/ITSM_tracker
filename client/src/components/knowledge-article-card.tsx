import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Link } from 'wouter';
import { formatRelativeTime, truncateText } from '@/lib/utils';
import type { KnowledgeArticle } from '@shared/schema';

interface KnowledgeArticleCardProps {
  article: KnowledgeArticle;
}

const KnowledgeArticleCard = ({ article }: KnowledgeArticleCardProps) => {
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'network': 'bg-secondary-light bg-opacity-10 text-secondary',
      'software': 'bg-secondary-light bg-opacity-10 text-secondary',
      'hardware': 'bg-secondary-light bg-opacity-10 text-secondary',
      'email': 'bg-secondary-light bg-opacity-10 text-secondary',
      'access': 'bg-secondary-light bg-opacity-10 text-secondary',
    };
    
    return categoryColors[category] || 'bg-secondary-light bg-opacity-10 text-secondary';
  };
  
  const updatedText = formatRelativeTime(article.updatedAt);

  return (
    <Link href={`/knowledge/${article.id}`}>
      <Card className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 cursor-pointer h-full">
        <CardContent className="p-0">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-light bg-opacity-10 rounded-md">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <Badge className={getCategoryColor(article.category)} variant="outline">
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
            {truncateText(article.content, 120)}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-500">Updated {updatedText}</span>
            <span className="text-xs text-neutral-500 flex items-center">
              <Eye className="mr-1 h-4 w-4" />
              {article.views} views
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default KnowledgeArticleCard;
