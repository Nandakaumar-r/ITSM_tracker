import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { Upload, X } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';

// Extend the insert ticket schema with validation rules
const formSchema = insertTicketSchema.extend({
  subject: z.string().min(5, { message: "Subject must be at least 5 characters long" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters long" }),
});

interface IncidentFormProps {
  onClose: () => void;
  users: User[];
}

const IncidentForm = ({ onClose, users }: IncidentFormProps) => {
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
      type: 'incident',
      category: 'hardware',
      requesterId: users.length > 0 ? users[0].id : undefined,
      assigneeId: undefined,
      impact: 'medium',
      relatedAssets: [],
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
        description: "Incident ticket created successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create incident ticket: ${error.message}`,
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
        <div className="bg-[#fff8e1] border border-[#ffe0b2] rounded-md p-4">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2c3e50] font-medium">Incident Short Description</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Brief description of the issue" 
                    {...field} 
                    className="bg-white border-[#ffc107] focus:border-[#ff9800]" 
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
                <FormLabel className="text-[#2c3e50] font-medium">Detailed Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please provide detailed information about the issue including any error messages..." 
                    rows={5}
                    {...field} 
                    className="bg-white border-[#ffc107] focus:border-[#ff9800]" 
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
                  <FormLabel className="text-[#2c3e50] font-medium">Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#ff9800]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="access">Access/Permissions</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#ff9800]">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="critical">Critical - Service Down</SelectItem>
                      <SelectItem value="high">High - Severe Impact</SelectItem>
                      <SelectItem value="medium">Medium - Limited Impact</SelectItem>
                      <SelectItem value="low">Low - Minimal Impact</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Business Impact</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#ff9800]">
                        <SelectValue placeholder="Select impact" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High - Organization-wide</SelectItem>
                      <SelectItem value="medium">Medium - Multiple departments</SelectItem>
                      <SelectItem value="low">Low - Individual or small team</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FormLabel className="text-[#2c3e50] font-medium">Caller (User Reporting)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#ff9800]">
                        <SelectValue placeholder="Select caller" />
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
                  <FormLabel className="text-[#2c3e50] font-medium">Assignment Group</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "auto_assign" ? undefined : parseInt(value))}
                    defaultValue={field.value?.toString() || "auto_assign"}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#ff9800]">
                        <SelectValue placeholder="Auto Assign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto_assign">IT Support (Auto Assign)</SelectItem>
                      <SelectItem value="service_desk">Service Desk</SelectItem>
                      <SelectItem value="network_team">Network Team</SelectItem>
                      <SelectItem value="system_admin">System Administrators</SelectItem>
                      <SelectItem value="security">Security Team</SelectItem>
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
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#ff9800]">
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
          <FormLabel className="text-[#2c3e50] font-medium mb-2 inline-block">Attachments</FormLabel>
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
            className="bg-[#ff9800] hover:bg-[#f57c00] text-white"
            disabled={createTicketMutation.isPending}
          >
            {createTicketMutation.isPending ? "Creating..." : "Create Incident"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default IncidentForm;