import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, isBefore, isAfter } from 'date-fns';
import type { Ticket } from '@shared/schema';

interface ResolutionTimeChartProps {
  tickets: Ticket[];
  days?: number;
}

const ResolutionTimeChart = ({ tickets, days = 30 }: ResolutionTimeChartProps) => {
  // Generate chart data showing resolution time trend
  const data = useMemo(() => {
    // Filter resolved tickets that have time spent data
    const resolvedTickets = tickets.filter(
      ticket => 
        ticket.status === 'resolved' && 
        ticket.timeSpent !== null && 
        ticket.timeSpent !== undefined
    );
    
    // Generate a date range for the last N days
    const today = new Date();
    const dateRange = Array.from({ length: days }, (_, i) => {
      const date = subDays(today, days - i - 1);
      return {
        date,
        dateStr: format(date, 'MMM dd'),
        formattedDate: format(date, 'yyyy-MM-dd'),
      };
    });
    
    // Group tickets by date and calculate average resolution time
    return dateRange.map(({ date, dateStr, formattedDate }) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Find tickets resolved on this date
      const ticketsForDay = resolvedTickets.filter(ticket => {
        const ticketDate = new Date(ticket.updatedAt);
        return isAfter(ticketDate, startOfDay) && isBefore(ticketDate, endOfDay);
      });
      
      // Calculate average resolution time in hours
      let avgTimeHours = 0;
      if (ticketsForDay.length > 0) {
        const totalTime = ticketsForDay.reduce((sum, ticket) => sum + (ticket.timeSpent || 0), 0);
        avgTimeHours = totalTime / ticketsForDay.length / 60; // Convert from minutes to hours
      }
      
      return {
        name: dateStr,
        hours: parseFloat(avgTimeHours.toFixed(1)),
        date: formattedDate,
        count: ticketsForDay.length,
      };
    });
  }, [tickets, days]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
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
          interval="preserveStartEnd"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          label={{ 
            value: 'Hours', 
            angle: -90, 
            position: 'insideLeft',
            style: { fontSize: 12, textAnchor: 'middle' }
          }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value} hours`, 'Avg. Resolution Time']}
          contentStyle={{ fontSize: '12px' }}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="hours"
          stroke="hsl(220, 98%, 50%)"
          activeDot={{ r: 8 }}
          strokeWidth={2}
          name="Avg. Resolution Time"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ResolutionTimeChart;
