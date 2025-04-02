import { useState } from 'react';
import { Link } from 'wouter';
import { Eye, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  statusConfig, 
  priorityConfig, 
  formatRelativeTime, 
  formatTicketNumber
} from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Ticket, User } from '@shared/schema';

interface TicketTableProps {
  tickets: Ticket[];
  onCreateTicket: () => void;
}

const TicketTable = ({ tickets, onCreateTicket }: TicketTableProps) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  // Fetch all users for assignee filtering/display
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Apply filters and sorting
  let filteredTickets = [...tickets];

  if (statusFilter !== 'all') {
    filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter);
  }

  if (priorityFilter !== 'all') {
    filteredTickets = filteredTickets.filter(ticket => ticket.priority === priorityFilter);
  }

  if (assigneeFilter !== 'all') {
    const assigneeId = parseInt(assigneeFilter);
    if (assigneeFilter === 'unassigned') {
      filteredTickets = filteredTickets.filter(ticket => ticket.assigneeId === null);
    } else if (!isNaN(assigneeId)) {
      filteredTickets = filteredTickets.filter(ticket => ticket.assigneeId === assigneeId);
    }
  }

  // Apply sorting
  if (sortBy === 'latest') {
    filteredTickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } else if (sortBy === 'created') {
    filteredTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === 'priority') {
    const priorityOrder: Record<string, number> = { "critical": 0, "high": 1, "medium": 2, "low": 3 };
    filteredTickets.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  // Get user by ID (for requester and assignee)
  const getUserById = (id: number | null) => {
    if (!id) return null;
    return users.find(user => user.id === id);
  };

  // Get status and priority styles
  const getStatusStyle = (status: string) => {
    //Corrected Status Styling
    switch (status) {
      case 'open': return { bgColor: 'bg-red-100', textColor: 'text-red-800', label: 'Open' };
      case 'resolved': return { bgColor: 'bg-green-100', textColor: 'text-green-800', label: 'Resolved' };
      case 'in_progress': return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', label: 'In Progress' };
      case 'on_hold': return { bgColor: 'bg-blue-100', textColor: 'text-blue-800', label: 'On Hold' };
      case 'closed': return { bgColor: 'bg-gray-100', textColor: 'text-gray-800', label: 'Closed' };
      default: return { bgColor: 'bg-gray-100', textColor: 'text-gray-800', label: status };
    }
  };

  const getPriorityStyle = (priority: string) => {
    return priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Tickets</h2>
        <Button 
          onClick={onCreateTicket}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2"
        >
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Ticket
        </Button>
      </div>

      <div className="bg-white p-3 rounded-t-lg border border-neutral-200 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-500">Filter by:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-sm border border-neutral-300 rounded-md h-8 w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="text-sm border border-neutral-300 rounded-md h-8 w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="text-sm border border-neutral-300 rounded-md h-8 w-40">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technicians</SelectItem>
              {users
                .filter(user => user.role === 'technician')
                .map(user => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.fullName}
                  </SelectItem>
                ))}
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="text-sm border border-neutral-300 rounded-md h-8 w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest Update</SelectItem>
              <SelectItem value="created">Creation Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-b-lg shadow overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Ticket</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Subject</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Requester</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Assigned To</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Priority</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Created</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-sm text-neutral-500">
                  No tickets found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => {
                const requester = getUserById(ticket.requesterId);
                const assignee = getUserById(ticket.assigneeId);
                const statusStyle = getStatusStyle(ticket.status);
                const priorityStyle = getPriorityStyle(ticket.priority);

                return (
                  <TableRow key={ticket.id} className="hover:bg-neutral-50">
                    <TableCell className="text-sm font-medium text-primary">
                      {formatTicketNumber(ticket.ticketNumber)}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-800">
                      {ticket.subject}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600">
                      {requester?.fullName || 'Unknown User'}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600">
                      {assignee ? (
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={assignee.avatarUrl || undefined} />
                            <AvatarFallback>{assignee.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {assignee.fullName}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full mr-2 bg-neutral-200 flex items-center justify-center text-xs">?</div>
                          Unassigned
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyle.bgColor} ${statusStyle.textColor}`}>
                        {statusStyle.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityStyle.bgColor} ${priorityStyle.textColor}`}>
                        {priorityStyle.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-500">
                      {formatRelativeTime(ticket.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/tickets/${ticket.id}`}>
                          <div className="text-primary hover:text-primary-dark cursor-pointer">
                            <Eye className="h-5 w-5" />
                          </div>
                        </Link>
                        <Link href={`/tickets/${ticket.id}?edit=true`}>
                          <div className="text-primary hover:text-primary-dark cursor-pointer">
                            <Edit className="h-5 w-5" />
                          </div>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TicketTable;