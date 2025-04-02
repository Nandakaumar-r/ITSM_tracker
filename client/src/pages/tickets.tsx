
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import TicketTable from '@/components/ticket-table';
import CreateTicketModal from '@/components/create-ticket-modal';
import { type Ticket } from '@shared/schema';

const Tickets = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch all tickets
  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets'],
  });

  return (
    <div className="p-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <TicketTable 
          tickets={tickets} 
          onCreateTicket={() => setCreateModalOpen(true)} 
        />
      )}

      <CreateTicketModal 
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};

export default Tickets;
