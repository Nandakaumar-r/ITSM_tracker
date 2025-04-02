import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MetricsCard from '@/components/metrics-card';
import TicketTable from '@/components/ticket-table';
import KnowledgeArticleCard from '@/components/knowledge-article-card';
import CreateTicketModal from '@/components/create-ticket-modal';
import { FileText, AlertTriangle, Clock, CheckCircle, Server, Briefcase, RefreshCw, Cpu } from 'lucide-react';
import { Ticket, KnowledgeArticle } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStats {
  openTickets: number;
  criticalIncidents: number;
  slaCompliance: number;
  avgResolutionTime: number;
  assetsCount?: number;
  pendingChanges?: number;
  openProblems?: number;
  hardwareIssues?: number;
}

const Dashboard = () => {
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading: isStatsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/stats'],
  });

  // Fetch tickets for the tickets table
  const { data: tickets = [], isLoading: isTicketsLoading } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets'],
  });

  // Fetch recent knowledge articles
  const { data: knowledgeArticles = [], isLoading: isArticlesLoading } = useQuery<KnowledgeArticle[]>({
    queryKey: ['/api/knowledge'],
  });

  // Only display the most recent 3 articles
  const recentArticles = [...knowledgeArticles]
    .sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-3">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Open Tickets"
            value={isStatsLoading ? '-' : stats?.openTickets.toString() || '0'}
            icon={<FileText className="h-6 w-6 text-primary" />}
            trend={{ 
              value: "12% from last week", 
              positive: true 
            }}
            iconBgColor="bg-primary-light bg-opacity-10"
          />

          <MetricsCard
            title="Critical Incidents"
            value={isStatsLoading ? '-' : stats?.criticalIncidents.toString() || '0'}
            icon={<AlertTriangle className="h-6 w-6 text-danger" />}
            trend={{ 
              value: "2 new today", 
              positive: false 
            }}
            iconBgColor="bg-danger-light bg-opacity-10"
          />

          <MetricsCard
            title="SLA Compliance"
            value={isStatsLoading ? '-' : `${stats?.slaCompliance || 0}%`}
            icon={<CheckCircle className="h-6 w-6 text-secondary" />}
            trend={{ 
              value: "3% from last month", 
              positive: true 
            }}
            iconBgColor="bg-secondary-light bg-opacity-10"
          />

          <MetricsCard
            title="Average Resolution Time"
            value={isStatsLoading ? '-' : `${stats?.avgResolutionTime.toFixed(1) || 0}h`}
            icon={<Clock className="h-6 w-6 text-warning" />}
            trend={{ 
              value: "30min improvement", 
              positive: true 
            }}
            iconBgColor="bg-warning-light bg-opacity-10"
          />
        </div>
      </div>

      <div className="mb-6">
        <TicketTable 
          tickets={tickets.slice(0, 5)} // Only show 5 most recent tickets on dashboard
          onCreateTicket={() => {
            setIsCreateTicketModalOpen(true);
          }}
        />
        <CreateTicketModal 
          open={isCreateTicketModalOpen}
          onClose={() => setIsCreateTicketModalOpen(false)}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-3">Advanced ITSM Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Assets Tracked"
            value={isStatsLoading ? '-' : stats?.assetsCount?.toString() || '112'}
            icon={<Server className="h-6 w-6 text-blue-600" />}
            trend={{ 
              value: "8 new this month", 
              positive: true 
            }}
            iconBgColor="bg-blue-100"
          />

          <MetricsCard
            title="Pending Changes"
            value={isStatsLoading ? '-' : stats?.pendingChanges?.toString() || '5'}
            icon={<RefreshCw className="h-6 w-6 text-emerald-600" />}
            trend={{ 
              value: "2 approvals needed", 
              positive: null 
            }}
            iconBgColor="bg-emerald-100"
          />

          <MetricsCard
            title="Open Problems"
            value={isStatsLoading ? '-' : stats?.openProblems?.toString() || '3'}
            icon={<Briefcase className="h-6 w-6 text-indigo-600" />}
            trend={{ 
              value: "1 critical priority", 
              positive: false 
            }}
            iconBgColor="bg-indigo-100"
          />

          <MetricsCard
            title="Hardware Issues"
            value={isStatsLoading ? '-' : stats?.hardwareIssues?.toString() || '7'}
            icon={<Cpu className="h-6 w-6 text-purple-600" />}
            trend={{ 
              value: "3 from auto-discovery", 
              positive: null 
            }}
            iconBgColor="bg-purple-100"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">Knowledge Base Articles</h2>
          <a href="/knowledge" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
            View All Articles
            <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isArticlesLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow h-[200px] animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-5 w-3/4 bg-gray-200 mb-2 rounded"></div>
                <div className="h-4 w-full bg-gray-200 mb-1 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 mb-4 rounded"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 w-28 bg-gray-200 rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            recentArticles.map((article) => (
              <KnowledgeArticleCard key={article.id} article={article} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;