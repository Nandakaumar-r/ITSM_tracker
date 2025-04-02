import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { Ticket, User } from '@shared/schema';

interface TechnicianMetricsChartProps {
  tickets: Ticket[];
  users?: User[];
  timeRange: string;
}

const TechnicianMetricsChart = ({ tickets, users = [], timeRange }: TechnicianMetricsChartProps) => {
  // Calculate technician performance metrics
  const technicianData = useMemo(() => {
    // Filter tickets based on time range that have assignees
    const filteredTickets = tickets.filter(ticket => {
      if (!ticket.createdAt || !ticket.assigneeId) return false;
      
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
    
    // Group by assignee ID
    const assigneeGroups: Record<number, {
      ticketCount: number;
      resolvedCount: number;
      resolvedOnTime: number;
      responseTimeSum: number;
      resolutionTimeSum: number;
      satisfactionSum: number;
      satisfactionCount: number;
    }> = {};
    
    filteredTickets.forEach(ticket => {
      if (!ticket.assigneeId) return;
      
      if (!assigneeGroups[ticket.assigneeId]) {
        assigneeGroups[ticket.assigneeId] = {
          ticketCount: 0,
          resolvedCount: 0,
          resolvedOnTime: 0,
          responseTimeSum: 0,
          resolutionTimeSum: 0,
          satisfactionSum: 0,
          satisfactionCount: 0
        };
      }
      
      const group = assigneeGroups[ticket.assigneeId];
      group.ticketCount++;
      
      // Count resolved tickets
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        group.resolvedCount++;
        
        // Count on-time resolutions
        if (ticket.slaStatus === 'completed' || ticket.slaStatus === 'on_track') {
          group.resolvedOnTime++;
        }
        
        // Sum resolution time
        if (ticket.timeSpent) {
          group.resolutionTimeSum += ticket.timeSpent;
        }
      }
      
      // Sum response time
      if (ticket.timeToFirstResponse !== null && ticket.timeToFirstResponse !== undefined) {
        group.responseTimeSum += ticket.timeToFirstResponse;
      }
      
      // Sum satisfaction scores
      if (ticket.satisfactionScore !== null && ticket.satisfactionScore !== undefined) {
        // Convert to number if it's not already
        const score = typeof ticket.satisfactionScore === 'number' 
          ? ticket.satisfactionScore 
          : Number(ticket.satisfactionScore);
        
        if (!isNaN(score)) {
          group.satisfactionSum += score;
          group.satisfactionCount++;
        }
      }
    });
    
    // Map user data to assignee IDs
    const techData = Object.entries(assigneeGroups).map(([assigneeId, stats]) => {
      const user = users.find(u => u.id === parseInt(assigneeId));
      const name = user ? user.fullName || user.username : `Tech #${assigneeId}`;
      
      return {
        name,
        ticketCount: stats.ticketCount,
        resolvedCount: stats.resolvedCount,
        resolutionRate: stats.ticketCount > 0 
          ? Math.round((stats.resolvedCount / stats.ticketCount) * 100) 
          : 0,
        onTimeRate: stats.resolvedCount > 0 
          ? Math.round((stats.resolvedOnTime / stats.resolvedCount) * 100) 
          : 0,
        avgResponseTime: stats.ticketCount > 0 
          ? Math.round(stats.responseTimeSum / stats.ticketCount) 
          : 0,
        avgResolutionTime: stats.resolvedCount > 0 
          ? Math.round(stats.resolutionTimeSum / stats.resolvedCount) 
          : 0,
        satisfaction: stats.satisfactionCount > 0 
          ? Math.round((stats.satisfactionSum / stats.satisfactionCount) * 10) / 10 
          : 0,
      };
    });
    
    // Sort by ticket count for bar chart
    const sortedForBar = [...techData].sort((a, b) => b.ticketCount - a.ticketCount);
    
    // Take top 5 technicians for radar chart
    const topTechs = [...techData]
      .sort((a, b) => b.resolutionRate - a.resolutionRate)
      .slice(0, 5);
    
    // Prepare radar chart data - restructuring for radar format
    const radarMetrics = ['resolutionRate', 'onTimeRate', 'satisfaction'];
    const radarData = radarMetrics.map(metric => {
      const dataPoint: Record<string, any> = { metric: metric };
      
      topTechs.forEach(tech => {
        let value = tech[metric as keyof typeof tech];
        // For satisfaction, scale to 0-100 for consistency
        if (metric === 'satisfaction') {
          // Assuming satisfaction is on a 1-5 scale, convert to 0-100
          value = typeof value === 'number' ? value * 20 : 0;
        }
        dataPoint[tech.name] = value;
      });
      
      return dataPoint;
    });
    
    return {
      barData: sortedForBar,
      radarData,
      radarTechs: topTechs.map(t => t.name)
    };
  }, [tickets, users, timeRange]);
  
  // Format metric names for display
  const formatMetric = (metric: string) => {
    switch (metric) {
      case 'resolutionRate': return 'Resolution Rate';
      case 'onTimeRate': return 'On-Time Rate';
      case 'satisfaction': return 'Satisfaction';
      default: return metric;
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <div>
        <h3 className="text-base font-medium mb-2 text-center">Ticket Volume by Technician</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={technicianData.barData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'avgResponseTime' || name === 'avgResolutionTime') {
                    return [`${value} min`, name === 'avgResponseTime' ? 'Avg Response Time' : 'Avg Resolution Time'];
                  }
                  if (name === 'satisfaction') {
                    return [`${value}/5`, 'Satisfaction Rating'];
                  }
                  if (name === 'resolutionRate' || name === 'onTimeRate') {
                    return [`${value}%`, name === 'resolutionRate' ? 'Resolution Rate' : 'On-Time Rate'];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="ticketCount" name="Assigned" fill="#8884d8" />
              <Bar dataKey="resolvedCount" name="Resolved" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h3 className="text-base font-medium mb-2 text-center">Performance Comparison (Top 5)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              outerRadius={90} 
              width={500} 
              height={300} 
              data={technicianData.radarData}
            >
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="metric" 
                tickFormatter={formatMetric}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
              />
              {technicianData.radarTechs.map((tech, index) => (
                <Radar 
                  key={tech}
                  name={tech} 
                  dataKey={tech} 
                  stroke={`hsl(${index * 60}, 70%, 50%)`} 
                  fill={`hsl(${index * 60}, 70%, 50%)`} 
                  fillOpacity={0.2} 
                />
              ))}
              <Legend />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => {
                  const metricName = props.payload.metric;
                  if (metricName === 'satisfaction') {
                    return [`${(value / 20).toFixed(1)}/5`, name];
                  }
                  return [`${value}%`, name];
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TechnicianMetricsChart;