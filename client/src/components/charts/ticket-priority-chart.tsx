import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Ticket } from '@shared/schema';

interface TicketPriorityChartProps {
  tickets: Ticket[];
}

const TicketPriorityChart = ({ tickets }: TicketPriorityChartProps) => {
  // Calculate ticket counts by priority
  const data = useMemo(() => {
    const priorityCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Ensure all priorities are included even if count is 0
    const priorities = ['low', 'medium', 'high', 'critical'];
    const result = priorities.map(priority => {
      const count = priorityCounts[priority] || 0;
      
      // Format priority names for display
      let name = priority.charAt(0).toUpperCase() + priority.slice(1);
      
      return { name, count, priority };
    });
    
    return result;
  }, [tickets]);
  
  // Define colors for each priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'hsl(0, 0%, 60%)';
      case 'medium':
        return 'hsl(0, 0%, 40%)';
      case 'high':
        return 'hsl(31, 100%, 60%)';
      case 'critical':
        return 'hsl(0, 91%, 48%)';
      default:
        return 'hsl(0, 0%, 60%)';
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }} 
        />
        <YAxis 
          allowDecimals={false}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value} tickets`, 'Count']}
          contentStyle={{ fontSize: '12px' }}
        />
        <Bar 
          dataKey="count" 
          name="Tickets" 
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getPriorityColor(entry.priority)} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TicketPriorityChart;
