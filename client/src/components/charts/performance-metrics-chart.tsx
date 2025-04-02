import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Ticket } from '@shared/schema';

interface PerformanceMetricsChartProps {
  tickets: Ticket[];
  timeRange: string;
}

const PerformanceMetricsChart = ({ tickets, timeRange }: PerformanceMetricsChartProps) => {
  // Process tickets data for the metrics visualization
  const data = useMemo(() => {
    // Map of month numbers to names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Filter tickets based on time range
    const filteredTickets = tickets.filter(ticket => {
      if (!ticket.createdAt) return false;
      
      const ticketDate = new Date(ticket.createdAt);
      const now = new Date();
      const diffTime = now.getTime() - ticketDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      
      switch (timeRange) {
        case '7d': return diffDays <= 7;
        case '30d': return diffDays <= 30;
        case '90d': return diffDays <= 90;
        case 'year': return diffDays <= 365;
        default: return true; // 'all' or any other value
      }
    });
    
    // Group tickets by month or day based on time range
    const grouped: Record<string, { created: number, resolved: number, firstResponseTime: number }> = {};
    
    filteredTickets.forEach(ticket => {
      if (!ticket.createdAt) return;
      
      const ticketDate = new Date(ticket.createdAt);
      let period: string;
      
      // For shorter time ranges, group by day
      if (timeRange === '7d' || timeRange === '30d') {
        period = `${ticketDate.getMonth() + 1}/${ticketDate.getDate()}`;
      } else {
        // For longer time ranges, group by month
        period = monthNames[ticketDate.getMonth()];
      }
      
      if (!grouped[period]) {
        grouped[period] = { created: 0, resolved: 0, firstResponseTime: 0 };
      }
      
      grouped[period].created += 1;
      
      // Count resolved tickets
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        grouped[period].resolved += 1;
      }
      
      // Calculate first response time (using timeToFirstResponse field if available)
      if (ticket.timeToFirstResponse !== null && ticket.timeToFirstResponse !== undefined) {
        // Using minutes as unit
        grouped[period].firstResponseTime += ticket.timeToFirstResponse;
      }
    });
    
    // Convert to array for charting and calculate averages
    return Object.entries(grouped).map(([period, stats]) => ({
      period,
      created: stats.created,
      resolved: stats.resolved,
      firstResponseTime: stats.created ? Math.round(stats.firstResponseTime / stats.created) : 0
    }));
  }, [tickets, timeRange]);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip formatter={(value, name: string) => {
          if (name === 'firstResponseTime') return [`${value} minutes`, 'Avg. Response Time'];
          return [`${value} tickets`, name === 'created' ? 'Created' : 'Resolved'];
        }} />
        <Legend />
        <Bar yAxisId="left" dataKey="created" name="Created" fill="#8884d8" />
        <Bar yAxisId="left" dataKey="resolved" name="Resolved" fill="#82ca9d" />
        <Bar yAxisId="right" dataKey="firstResponseTime" name="firstResponseTime" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceMetricsChart;