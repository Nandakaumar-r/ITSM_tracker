import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { insertChangeSchema, type InsertChange, type User, type Asset } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X, Upload, Calendar, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

// Extend the insert change schema with validation rules
const formSchema = insertChangeSchema.extend({
  title: z.string().min(5, { message: "Title must be at least 5 characters long" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters long" }),
});

interface CreateChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateChangeModal = ({ isOpen, onClose }: CreateChangeModalProps) => {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  
  // Fetch users for the requester and assignee dropdowns
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: isOpen,
  });
  
  // Fetch assets for affected assets
  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
    enabled: isOpen,
  });
  
  // Get requester (users)
  const requesters = users.filter(user => user.role === 'user' || user.role === 'manager');
  
  // Get implementers (technicians)
  const technicians = users.filter(user => user.role === 'technician' || user.role === 'admin');
  
  // Setup react-hook-form with zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'normal',
      category: 'application',
      status: 'draft',
      priority: 'medium',
      impact: 'medium',
      risk: 'medium',
      implementationPlan: '',
      backoutPlan: '',
      testPlan: '',
      requesterId: 1, // Default to admin
      assignedToId: undefined, // No default assignee
      affectedServices: [],
      affectedAssets: [],
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createChangeMutation.mutate(data as InsertChange);
  };
  
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
      setAttachments([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create change request. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating change:", error);
    },
  });
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };
  
  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#2196f3] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Create New Change Request
          </DialogTitle>
          <DialogDescription>
            Plan and document changes to the IT environment or services.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Change Details</TabsTrigger>
            <TabsTrigger value="plans">Implementation Plans</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling & Risk</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TabsContent value="details" className="space-y-4">
                <div className="bg-[#f5f9ff] border border-[#e1effe] rounded-md p-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2c3e50] font-medium">Change Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Brief title of the change" 
                            {...field} 
                            className="bg-white border-[#c7d4e4] focus:border-[#2196f3]" 
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
                        <FormLabel className="text-[#2c3e50] font-medium">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed description of the change and its purpose" 
                            rows={4} 
                            {...field} 
                            className="bg-white border-[#c7d4e4] focus:border-[#2196f3]" 
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
                              <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#2196f3]">
                                <SelectValue placeholder="Select change type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                              <SelectItem value="minor">Minor</SelectItem>
                              <SelectItem value="major">Major</SelectItem>
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
                              <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#2196f3]">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="application">Application</SelectItem>
                              <SelectItem value="hardware">Hardware</SelectItem>
                              <SelectItem value="network">Network</SelectItem>
                              <SelectItem value="server">Server</SelectItem>
                              <SelectItem value="database">Database</SelectItem>
                              <SelectItem value="infrastructure">Infrastructure</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
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
                          <FormLabel className="text-[#2c3e50] font-medium">Requested By</FormLabel>
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
                              {requesters.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.fullName} ({user.username})
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
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#2196f3]">
                                <SelectValue placeholder="Select assignee" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {technicians.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.fullName} ({user.username})
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
              </TabsContent>
              
              <TabsContent value="plans" className="space-y-4">
                <div className="bg-[#f5f9ff] border border-[#e1effe] rounded-md p-4">
                  <FormField
                    control={form.control}
                    name="implementationPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2c3e50] font-medium">Implementation Plan</FormLabel>
                        <FormDescription>
                          Detailed step-by-step instructions for implementing the change
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="List the steps required to implement this change" 
                            rows={6} 
                            {...field}
                            value={field.value || ''} 
                            className="bg-white border-[#c7d4e4] focus:border-[#2196f3]" 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#f5f9ff] border border-[#e1effe] rounded-md p-4">
                    <FormField
                      control={form.control}
                      name="backoutPlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#2c3e50] font-medium">Backout Plan</FormLabel>
                          <FormDescription>
                            Steps to reverse the change if needed
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="How will you roll back if needed" 
                              rows={4} 
                              {...field}
                              value={field.value || ''}
                              className="bg-white border-[#c7d4e4] focus:border-[#2196f3]" 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="bg-[#f5f9ff] border border-[#e1effe] rounded-md p-4">
                    <FormField
                      control={form.control}
                      name="testPlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#2c3e50] font-medium">Test Plan</FormLabel>
                          <FormDescription>
                            How you will verify the change was successful
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Test steps to validate the change" 
                              rows={4} 
                              {...field}
                              value={field.value || ''}
                              className="bg-white border-[#c7d4e4] focus:border-[#2196f3]" 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="scheduling" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="scheduledStartTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#2c3e50] font-medium">Scheduled Start Time</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <Input 
                                type="datetime-local" 
                                {...field}
                                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                                onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                className="bg-white border-[#c7d4e4] focus:border-[#2196f3]"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="ml-2"
                                onClick={() => field.onChange(new Date())}
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="scheduledEndTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#2c3e50] font-medium">Scheduled End Time</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <Input 
                                type="datetime-local" 
                                {...field}
                                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                                onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                className="bg-white border-[#c7d4e4] focus:border-[#2196f3]"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="ml-2"
                                onClick={() => {
                                  const now = new Date();
                                  now.setHours(now.getHours() + 2);
                                  field.onChange(now);
                                }}
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
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
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
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
                          <FormLabel className="text-[#2c3e50] font-medium">Impact</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#2196f3]">
                                <SelectValue placeholder="Select impact" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low: Affects few users/services</SelectItem>
                              <SelectItem value="medium">Medium: Affects a department</SelectItem>
                              <SelectItem value="high">High: Affects multiple departments</SelectItem>
                              <SelectItem value="critical">Critical: Affects entire organization</SelectItem>
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
                          <FormLabel className="text-[#2c3e50] font-medium">Risk</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#2196f3]">
                                <SelectValue placeholder="Select risk level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low: Well understood, fully tested</SelectItem>
                              <SelectItem value="medium">Medium: Standard change, some uncertainty</SelectItem>
                              <SelectItem value="high">High: Complex change, significant uncertainty</SelectItem>
                              <SelectItem value="critical">Critical: High chance of disruption</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="py-2">
                  <h3 className="text-[#2c3e50] font-medium mb-2">Attachments</h3>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="fileUpload"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('fileUpload')?.click()}
                      className="bg-white border-[#c7d4e4] hover:bg-[#f0f7ff] text-[#2196f3]"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Attach Files
                    </Button>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-muted-foreground">Attached files:</p>
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-neutral-100 border rounded-full pl-2 pr-1 py-1 text-xs"
                          >
                            <span className="truncate max-w-[120px]">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <Separator className="my-4" />
              
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
                  disabled={createChangeMutation.isPending}
                >
                  {createChangeMutation.isPending ? "Creating..." : "Create Change"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChangeModal;