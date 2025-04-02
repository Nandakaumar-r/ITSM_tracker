import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { type Ticket, type InsertTicket } from '@shared/schema';

export function useTickets() {
  // Get all tickets
  const {
    data: tickets = [],
    isLoading,
    isError,
    error,
  } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets'],
  });

  // Create a new ticket
  const createTicket = useMutation({
    mutationFn: async (newTicket: InsertTicket) => {
      const res = await apiRequest('POST', '/api/tickets', newTicket);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
    },
  });

  // Get a single ticket by ID
  const getTicket = (id: number) => {
    return useQuery<Ticket>({
      queryKey: [`/api/tickets/${id}`],
      enabled: !!id,
    });
  };

  // Update a ticket
  const updateTicket = useMutation({
    mutationFn: async ({ id, ticket }: { id: number; ticket: Partial<Ticket> }) => {
      const res = await apiRequest('PATCH', `/api/tickets/${id}`, ticket);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${variables.id}`] });
    },
  });

  // Get tickets by status
  const getTicketsByStatus = (status: string) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  // Get tickets by priority
  const getTicketsByPriority = (priority: string) => {
    return tickets.filter(ticket => ticket.priority === priority);
  };

  // Get tickets by assignee
  const getTicketsByAssignee = (assigneeId: number | null) => {
    return tickets.filter(ticket => {
      if (assigneeId === null) {
        return ticket.assigneeId === null;
      }
      return ticket.assigneeId === assigneeId;
    });
  };

  // Get ticket statistics
  const getTicketStats = () => {
    const totalTickets = tickets.length;
    
    const openTickets = tickets.filter(ticket => 
      ['open', 'in_progress', 'on_hold'].includes(ticket.status)
    ).length;
    
    const criticalIncidents = tickets.filter(ticket => 
      ticket.priority === 'critical' && ticket.type === 'incident'
    ).length;
    
    const resolvedTickets = tickets.filter(ticket => 
      ticket.status === 'resolved' || ticket.status === 'closed'
    ).length;
    
    const ticketsByStatus = {
      open: tickets.filter(ticket => ticket.status === 'open').length,
      in_progress: tickets.filter(ticket => ticket.status === 'in_progress').length,
      on_hold: tickets.filter(ticket => ticket.status === 'on_hold').length,
      resolved: tickets.filter(ticket => ticket.status === 'resolved').length,
      closed: tickets.filter(ticket => ticket.status === 'closed').length,
    };
    
    const ticketsByPriority = {
      critical: tickets.filter(ticket => ticket.priority === 'critical').length,
      high: tickets.filter(ticket => ticket.priority === 'high').length,
      medium: tickets.filter(ticket => ticket.priority === 'medium').length,
      low: tickets.filter(ticket => ticket.priority === 'low').length,
    };
    
    return {
      totalTickets,
      openTickets,
      criticalIncidents,
      resolvedTickets,
      ticketsByStatus,
      ticketsByPriority,
    };
  };

  return {
    tickets,
    isLoading,
    isError,
    error,
    createTicket,
    getTicket,
    updateTicket,
    getTicketsByStatus,
    getTicketsByPriority,
    getTicketsByAssignee,
    getTicketStats,
  };
}
