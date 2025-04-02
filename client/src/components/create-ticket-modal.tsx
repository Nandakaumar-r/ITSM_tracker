import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import IncidentForm from './tickets/incident-form';
import ServiceRequestForm from './tickets/service-request-form';
import ProblemForm from './tickets/problem-form';
import ChangeRequestForm from './tickets/change-request-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, HelpCircle, Settings, Plus } from 'lucide-react';
import { type User } from '@shared/schema';

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  userRole: string;
}

const CreateTicketModal = ({ open, onClose, userRole }: CreateTicketModalProps) => {
  const [selectedTab, setSelectedTab] = useState<string>('incident');

  // Fetch users for assignee and requester dropdowns
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Close handler
  const handleClose = () => {
    onClose();
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const canAssignTickets = ['technician', 'manager', 'admin'].includes(userRole);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto bg-white shadow-xl border-0">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2c3e50]">
            Create New Ticket
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="incident" value={selectedTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="incident" className="flex items-center gap-1.5" disabled={!canAssignTickets}>
              <AlertTriangle className="h-4 w-4 text-[#ff9800]" />
              <span>Incident</span>
            </TabsTrigger>
            <TabsTrigger value="service_request" className="flex items-center gap-1.5" disabled={!canAssignTickets}>
              <HelpCircle className="h-4 w-4 text-[#2196f3]" />
              <span>Service Request</span>
            </TabsTrigger>
            <TabsTrigger value="problem" className="flex items-center gap-1.5" disabled={!canAssignTickets}>
              <AlertTriangle className="h-4 w-4 text-[#3f51b5]" />
              <span>Problem</span>
            </TabsTrigger>
            <TabsTrigger value="change" className="flex items-center gap-1.5" disabled={!canAssignTickets}>
              <Settings className="h-4 w-4 text-[#009688]" />
              <span>Change</span>
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2196f3]"></div>
            </div>
          ) : (
            <>
              <TabsContent value="incident">
                <IncidentForm onClose={handleClose} users={users} />
              </TabsContent>

              <TabsContent value="service_request">
                <ServiceRequestForm onClose={handleClose} users={users} />
              </TabsContent>

              <TabsContent value="problem">
                <ProblemForm onClose={handleClose} users={users} />
              </TabsContent>

              <TabsContent value="change">
                <ChangeRequestForm onClose={handleClose} users={users} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketModal;