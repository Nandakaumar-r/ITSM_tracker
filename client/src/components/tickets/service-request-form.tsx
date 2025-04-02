import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { insertTicketSchema, type InsertTicket, type User } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Upload, X, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Extend the insert ticket schema with validation rules for service requests
const formSchema = insertTicketSchema.extend({
  subject: z.string().min(5, { message: "Subject must be at least 5 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  dueDate: z.date().optional(),
});

interface ServiceRequestFormProps {
  onClose: () => void;
  users: User[];
}

const ServiceRequestForm = ({ onClose, users }: ServiceRequestFormProps) => {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Get requesters (regular users)
  const requesters = users.filter(user => user.role === 'user');
  
  // Get technicians (assignees)
  const technicians = users.filter(user => user.role === 'technician');
  
  // Setup react-hook-form with zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      description: '',
      status: 'open',
      priority: 'medium',
      type: 'service_request',
      category: 'access',
      requesterId: users.length > 0 ? users[0].id : undefined,
      assigneeId: undefined,
      impact: 'low',
      relatedAssets: [],
      dueDate: undefined,
    },
  });
  
  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: InsertTicket) => {
      const res = await apiRequest('POST', '/api/tickets', data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate tickets cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      toast({
        title: "Success",
        description: "Service request created successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create service request: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createTicketMutation.mutate(values);
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };
  
  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-[#e3f2fd] border border-[#bbdefb] rounded-md p-4">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2c3e50] font-medium">Service Request Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Brief description of what you need" 
                    {...field} 
                    className="bg-white border-[#64b5f6] focus:border-[#2196f3]" 
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="text-[#2c3e50] font-medium">Request Details</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please provide details about your request and any relevant information..." 
                    rows={5}
                    {...field} 
                    className="bg-white border-[#64b5f6] focus:border-[#2196f3]" 
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Request Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#2196f3]">
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="access">Access Request</SelectItem>
                      <SelectItem value="software">Software Installation</SelectItem>
                      <SelectItem value="hardware">Hardware Request</SelectItem>
                      <SelectItem value="account">Account Management</SelectItem>
                      <SelectItem value="information">Information Request</SelectItem>
                      <SelectItem value="other">Other Request</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#2196f3]">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High - Business Critical</SelectItem>
                      <SelectItem value="medium">Medium - Important</SelectItem>
                      <SelectItem value="low">Low - Standard Request</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[#2c3e50] font-medium">Needed By Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal bg-white border-[#c7d4e4] focus:border-[#2196f3]",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="requesterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Requested For</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#2196f3]">
                        <SelectValue placeholder="Select requester" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {requesters.map(user => (
                        <SelectItem key={user.id} value={user.id.toString() || `user-${user.id}`}>
                          {user.fullName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Fulfillment Group</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "auto_assign" ? undefined : parseInt(value))}
                    defaultValue={field.value?.toString() || "auto_assign"}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#2196f3]">
                        <SelectValue placeholder="Auto Assign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto_assign">Service Delivery (Auto Assign)</SelectItem>
                      <SelectItem value="service_desk">Service Desk</SelectItem>
                      <SelectItem value="it_procurement">IT Procurement</SelectItem>
                      <SelectItem value="network_team">Network Team</SelectItem>
                      <SelectItem value="system_admin">System Administrators</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Assigned To</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "auto_assign" ? undefined : parseInt(value))}
                    defaultValue={field.value?.toString() || "auto_assign"}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#2196f3]">
                        <SelectValue placeholder="Auto Assign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto_assign">Auto Assign</SelectItem>
                      {technicians.map(tech => (
                        <SelectItem key={tech.id} value={tech.id.toString() || `tech-${tech.id}`}>
                          {tech.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="bg-[#f5f9ff] border border-[#e1effe] rounded-md p-4">
          <FormLabel className="text-[#2c3e50] font-medium mb-2 inline-block">Attachments (Optional)</FormLabel>
          <div className="border border-dashed border-[#c7d4e4] rounded-md px-3 py-4">
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-[#2196f3]" />
              <p className="mt-1 text-sm text-[#475569]">
                Drag and drop files here, or{' '}
                <label className="text-[#2196f3] font-medium cursor-pointer">
                  browse
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </p>
              <p className="mt-1 text-xs text-[#64748b]">Maximum file size: 10MB</p>
            </div>
          </div>
          
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border border-[#e2e8f0]">
                  <span className="text-sm text-[#475569] truncate max-w-[400px]">
                    {file.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="text-[#94a3b8] hover:text-[#ff5252]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose()}
            className="border-[#c7d4e4] hover:bg-[#f0f7ff] text-[#2c3e50]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#2196f3] hover:bg-[#1976d2] text-white"
            disabled={createTicketMutation.isPending}
          >
            {createTicketMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ServiceRequestForm;