import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import TicketStatusChart from '@/components/charts/ticket-status-chart';
import TicketPriorityChart from '@/components/charts/ticket-priority-chart';
import ResolutionTimeChart from '@/components/charts/resolution-time-chart';
import PerformanceMetricsChart from '@/components/charts/performance-metrics-chart';
import SlaComplianceChart from '@/components/charts/sla-compliance-chart';
import TechnicianMetricsChart from '@/components/charts/technician-metrics-chart';
import { FileDown, Calendar } from 'lucide-react';
import type { Ticket, User } from '@shared/schema';

// Component that wraps TechnicianMetricsChart with user data
const TechnicianMetricsWithUsers = ({ tickets, timeRange }: { tickets: Ticket[], timeRange: string }) => {
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <TechnicianMetricsChart tickets={tickets} users={users} timeRange={timeRange} />;
};

const Reports = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch tickets for report data
  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets'],
  });

  // Simple statistics calculations
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(ticket => 
    ['open', 'in_progress', 'on_hold'].includes(ticket.status)
  ).length;
  const resolvedTickets = tickets.filter(ticket => 
    ['resolved', 'closed'].includes(ticket.status)
  ).length;

  const criticalPriorityTickets = tickets.filter(ticket => 
    ticket.priority === 'critical'
  ).length;

  const highPriorityTickets = tickets.filter(ticket => 
    ticket.priority === 'high'
  ).length;

  const ticketsWithTimeSpent = tickets
    .filter(ticket => ticket.status === 'resolved' && ticket.timeSpent !== null && ticket.timeSpent !== undefined);

  const avgResolutionTimeData = ticketsWithTimeSpent.length > 0
    ? ticketsWithTimeSpent.reduce((acc, ticket) => acc + (ticket.timeSpent || 0), 0) / ticketsWithTimeSpent.length / 60
    : 0; // Convert to hours

  const avgResolutionTime = isNaN(avgResolutionTimeData) ? 0 : avgResolutionTimeData.toFixed(1);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-neutral-500 mt-1">Track and analyze service desk performance</p>
        </div>

        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-500" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                "Report Data\nExported on " + new Date().toLocaleDateString();
              const link = document.createElement("a");
              link.setAttribute("href", encodeURI(csvContent));
              link.setAttribute("download", "report.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-neutral-500">Total Tickets</p>
              <p className="text-2xl font-semibold">{totalTickets}</p>
              <p className="text-xs text-neutral-500">
                All tickets in the system
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-neutral-500">Open Tickets</p>
              <p className="text-2xl font-semibold">{openTickets}</p>
              <p className="text-xs text-neutral-500">
                {Math.round((openTickets / totalTickets) * 100) || 0}% of total tickets
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-neutral-500">High Priority</p>
              <p className="text-2xl font-semibold">{highPriorityTickets + criticalPriorityTickets}</p>
              <p className="text-xs text-neutral-500">
                {Math.round(((highPriorityTickets + criticalPriorityTickets) / totalTickets) * 100) || 0}% of total tickets
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-neutral-500">Avg. Resolution Time</p>
              <p className="text-2xl font-semibold">{avgResolutionTime}h</p>
              <p className="text-xs text-neutral-500">
                Based on {resolvedTickets} resolved tickets
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sla">SLA Compliance</TabsTrigger>
          <TabsTrigger value="technicians">Technician Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Tickets by Status</CardTitle>
                <CardDescription>Distribution of tickets across different statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <TicketStatusChart tickets={tickets} />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Tickets by Priority</CardTitle>
                <CardDescription>Distribution of tickets across priority levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <TicketPriorityChart tickets={tickets} />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Resolution Time Trend</CardTitle>
                <CardDescription>Average resolution time over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <ResolutionTimeChart tickets={tickets} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Ticket volume and response time metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <PerformanceMetricsChart tickets={tickets} timeRange={timeRange} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla">
          <Card>
            <CardHeader>
              <CardTitle>SLA Compliance</CardTitle>
              <CardDescription>Service level agreement compliance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <SlaComplianceChart tickets={tickets} timeRange={timeRange} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians">
          <Card>
            <CardHeader>
              <CardTitle>Technician Metrics</CardTitle>
              <CardDescription>Performance metrics by support staff</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <TechnicianMetricsWithUsers tickets={tickets} timeRange={timeRange} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;