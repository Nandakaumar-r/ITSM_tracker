import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Ticket } from '@shared/schema';

interface TicketStatusChartProps {
  tickets: Ticket[];
}

const TicketStatusChart = ({ tickets }: TicketStatusChartProps) => {
  // Calculate ticket counts by status
  const data = useMemo(() => {
    const statusCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Transform counts to array format for the chart
    return Object.entries(statusCounts).map(([status, count]) => {
      let name = status;
      
      // Format status names for display
      if (status === 'in_progress') name = 'In Progress';
      else if (status === 'on_hold') name = 'On Hold';
      else name = status.charAt(0).toUpperCase() + status.slice(1);
      
      return { name, value: count, status };
    });
  }, [tickets]);
  
  // Define colors for each status
  const COLORS = {
    open: 'hsl(0, 0%, 85%)',        // Light gray
    in_progress: 'hsl(220, 98%, 50%)', // Primary blue
    on_hold: 'hsl(31, 100%, 60%)',    // Warning orange
    resolved: 'hsl(138, 55%, 52%)',   // Success green
    closed: 'hsl(0, 0%, 60%)',       // Dark gray
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.status as keyof typeof COLORS] || '#CCCCCC'} 
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value} tickets`, 'Count']} />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          formatter={(value) => <span className="text-xs">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default TicketStatusChart;
