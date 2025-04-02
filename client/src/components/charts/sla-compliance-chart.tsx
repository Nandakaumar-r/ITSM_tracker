import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import type { Ticket } from '@shared/schema';

interface SlaComplianceChartProps {
  tickets: Ticket[];
  timeRange: string;
}

const SlaComplianceChart = ({ tickets, timeRange }: SlaComplianceChartProps) => {
  // Calculate SLA compliance data
  const complianceData = useMemo(() => {
    // Filter tickets based on time range and that have SLA status
    const filteredTickets = tickets.filter(ticket => {
      if (!ticket.createdAt || !ticket.slaStatus) return false;
      
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
    
    // Calculate stats for radial bar chart
    const totalCount = filteredTickets.length;
    const compliantCount = filteredTickets.filter(t => 
      t.slaStatus === 'completed' || t.slaStatus === 'on_track'
    ).length;
    const violatedCount = filteredTickets.filter(t => 
      t.slaStatus === 'breached' || t.slaStatus === 'at_risk'
    ).length;
    const noSlaCount = totalCount - compliantCount - violatedCount;
    
    // Prepare data for radial bar chart
    const radialData = [
      {
        name: 'Compliant',
        value: totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0,
        fill: '#26c486'
      },
      {
        name: 'At Risk/Breached',
        value: totalCount > 0 ? Math.round((violatedCount / totalCount) * 100) : 0,
        fill: '#ff5757'
      },
      {
        name: 'No SLA Defined',
        value: totalCount > 0 ? Math.round((noSlaCount / totalCount) * 100) : 0,
        fill: '#b8b8b8'
      }
    ];
    
    // Group tickets by priority to analyze SLA compliance per priority
    const priorityGroups: Record<string, { total: number, compliant: number }> = {
      'critical': { total: 0, compliant: 0 },
      'high': { total: 0, compliant: 0 },
      'medium': { total: 0, compliant: 0 },
      'low': { total: 0, compliant: 0 }
    };
    
    filteredTickets.forEach(ticket => {
      if (!ticket.priority || !priorityGroups[ticket.priority]) return;
      
      priorityGroups[ticket.priority].total++;
      if (ticket.slaStatus === 'completed' || ticket.slaStatus === 'on_track') {
        priorityGroups[ticket.priority].compliant++;
      }
    });
    
    // Convert priority data to chart format
    const priorityData = Object.entries(priorityGroups).map(([priority, data]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      complianceRate: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0,
      total: data.total
    }));
    
    return {
      radialData,
      priorityData,
      overallCompliance: totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0
    };
  }, [tickets, timeRange]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <div>
        <h3 className="text-base font-medium mb-2 text-center">Overall SLA Compliance</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="20%" 
              outerRadius="80%" 
              barSize={20} 
              data={complianceData.radialData} 
              startAngle={90} 
              endAngle={-270}
            >
              <RadialBar
                label={{ 
                  position: 'insideStart', 
                  fill: '#fff',
                  formatter: (value: number) => `${value}%`
                }}
                background
                dataKey="value"
              />
              <Legend 
                iconSize={10} 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, '']}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h3 className="text-base font-medium mb-2 text-center">SLA Compliance by Priority</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={complianceData.priorityData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value: number) => [`${value}%`, 'Compliance Rate']} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="complianceRate" 
                name="Compliance Rate"
                stroke="#26c486" 
                fill="#26c486" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="text-center md:col-span-2">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-50 mb-2">
          <div className="text-4xl font-bold text-blue-600">{complianceData.overallCompliance}%</div>
        </div>
        <p className="text-neutral-500">Overall SLA compliance across all tickets</p>
      </div>
    </div>
  );
};

export default SlaComplianceChart;