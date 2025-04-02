import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { insertChangeSchema, type InsertChange, type User } from '@shared/schema';
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

// Extend the insert change schema with validation rules
const formSchema = insertChangeSchema.extend({
  title: z.string().min(5, { message: "Title must be at least 5 characters long" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters long" }),
  implementationPlan: z.string().min(20, { message: "Implementation plan must be at least 20 characters long" }),
  backoutPlan: z.string().min(10, { message: "Backout plan must be at least 10 characters long" }),
  scheduledStartTime: z.date().optional(),
  scheduledEndTime: z.date().optional(),
});

interface ChangeRequestFormProps {
  onClose: () => void;
  users: User[];
}

const ChangeRequestForm = ({ onClose, users }: ChangeRequestFormProps) => {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Get technicians (assignees and approvers)
  const technicians = users.filter(user => user.role === 'technician');
  
  // Setup react-hook-form with zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'normal', // normal, standard, emergency
      status: 'draft',
      priority: 'medium',
      risk: 'medium',
      impact: 'medium',
      category: 'software',
      requesterId: users.length > 0 ? users[0].id : undefined,
      assignedToId: undefined,
      implementationPlan: '',
      backoutPlan: '',
      testPlan: '',
      scheduledStartTime: undefined,
      scheduledEndTime: undefined,
      affectedServices: [],
      affectedAssets: [],
    },
  });
  
  // Create change mutation
  const createChangeMutation = useMutation({
    mutationFn: async (data: InsertChange) => {
      const res = await apiRequest('POST', '/api/changes', data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate changes cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/changes'] });
      toast({
        title: "Success",
        description: "Change request created successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create change request: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createChangeMutation.mutate(values);
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
        <div className="bg-[#e0f2f1] border border-[#b2dfdb] rounded-md p-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2c3e50] font-medium">Change Request Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Brief description of the change" 
                    {...field} 
                    className="bg-white border-[#4db6ac] focus:border-[#009688]" 
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
                <FormLabel className="text-[#2c3e50] font-medium">Change Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please provide detailed information about what needs to be changed..." 
                    rows={4}
                    {...field} 
                    className="bg-white border-[#4db6ac] focus:border-[#009688]" 
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Change Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#009688]">
                        <SelectValue placeholder="Select change type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="normal">Normal Change</SelectItem>
                      <SelectItem value="standard">Standard Change</SelectItem>
                      <SelectItem value="emergency">Emergency Change</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
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
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#009688]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
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
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#009688]">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="risk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Risk Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#009688]">
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
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
              name="impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Business Impact</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#009688]">
                        <SelectValue placeholder="Select impact" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High - Enterprise-wide</SelectItem>
                      <SelectItem value="medium">Medium - Multiple Groups</SelectItem>
                      <SelectItem value="low">Low - Isolated Impact</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requesterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Requested By</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#009688]">
                        <SelectValue placeholder="Select requester" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map(user => (
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
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Assigned To</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "auto_assign" ? undefined : parseInt(value))}
                    defaultValue={field.value?.toString() || "auto_assign"}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#009688]">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto_assign">Change Manager (Auto Assign)</SelectItem>
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
            
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="scheduledStartTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[#2c3e50] font-medium">Planned Start</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal bg-white border-[#c7d4e4] focus:border-[#009688]",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select date</span>
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="scheduledEndTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[#2c3e50] font-medium">Planned End</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal bg-white border-[#c7d4e4] focus:border-[#009688]",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select date</span>
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-md p-4 space-y-4">
          <FormField
            control={form.control}
            name="implementationPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2c3e50] font-medium">Implementation Plan</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Detail the step-by-step process for implementing this change..." 
                    rows={4}
                    {...field} 
                    className="bg-white border-[#c7d4e4] focus:border-[#009688]" 
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="backoutPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2c3e50] font-medium">Rollback Plan</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe how to reverse the change if problems occur..." 
                    rows={3}
                    {...field} 
                    className="bg-white border-[#c7d4e4] focus:border-[#009688]" 
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="testPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2c3e50] font-medium">Testing Plan</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe how the change will be tested after implementation..." 
                    rows={3}
                    {...field} 
                    value={field.value || ''}
                    className="bg-white border-[#c7d4e4] focus:border-[#009688]" 
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>
        
        <div className="border rounded-md p-4">
          <FormLabel className="text-[#2c3e50] font-medium mb-2 inline-block">Supporting Documents</FormLabel>
          <div className="border border-dashed border-[#c7d4e4] rounded-md px-3 py-4">
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-[#009688]" />
              <p className="mt-1 text-sm text-[#475569]">
                Drag and drop files here, or{' '}
                <label className="text-[#009688] font-medium cursor-pointer">
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
            className="bg-[#009688] hover:bg-[#00796b] text-white"
            disabled={createChangeMutation.isPending}
          >
            {createChangeMutation.isPending ? "Creating..." : "Submit Change Request"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ChangeRequestForm;