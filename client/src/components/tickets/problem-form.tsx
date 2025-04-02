import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { insertProblemSchema, type InsertProblem, type User } from '@shared/schema';
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
import { Upload, X } from 'lucide-react';
import { useState } from 'react';

// Extend the insert problem schema with validation rules
const formSchema = insertProblemSchema.extend({
  title: z.string().min(5, { message: "Title must be at least 5 characters long" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters long" }),
});

interface ProblemFormProps {
  onClose: () => void;
  users: User[];
}

const ProblemForm = ({ onClose, users }: ProblemFormProps) => {
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
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      impact: 'medium',
      category: 'software',
      createdById: users.length > 0 ? users[0].id : undefined,
      assignedToId: undefined,
      rootCause: '',
      workaround: '',
      affectedServices: [],
      knownErrors: undefined,
    },
  });

  // Create problem mutation
  const createProblemMutation = useMutation({
    mutationFn: async (data: InsertProblem) => {
      const res = await apiRequest('POST', '/api/problems', data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate problems cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/problems'] });
      toast({
        title: "Success",
        description: "Problem record created successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create problem record: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createProblemMutation.mutate(values);
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
        <div className="border border-[#c5cae9] rounded-md p-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2c3e50] font-medium">Problem Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Brief description of the problem" 
                    {...field} 
                    className="bg-white border-[#7986cb] focus:border-[#3f51b5]" 
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
                <FormLabel className="text-[#2c3e50] font-medium">Problem Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please provide detailed information about the problem, including symptoms and frequency..." 
                    rows={5}
                    {...field} 
                    className="bg-white border-[#7986cb] focus:border-[#3f51b5]" 
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
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#3f51b5]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="application">Application</SelectItem>
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
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#3f51b5]">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="critical">Critical - Immediate Resolution Required</SelectItem>
                      <SelectItem value="high">High - Significant Impact</SelectItem>
                      <SelectItem value="medium">Medium - Moderate Impact</SelectItem>
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
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#3f51b5]">
                        <SelectValue placeholder="Select impact" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High - Widespread Service Disruption</SelectItem>
                      <SelectItem value="medium">Medium - Limited Service Disruption</SelectItem>
                      <SelectItem value="low">Low - Minimal Impact on Services</SelectItem>
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
              name="createdById"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Problem Manager</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#3f51b5]">
                        <SelectValue placeholder="Select problem manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {technicians.map(user => (
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
                  <FormLabel className="text-[#2c3e50] font-medium">Assignment Group</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "auto_assign" ? undefined : parseInt(value))}
                    defaultValue={field.value?.toString() || "auto_assign"}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-[#c7d4e4] focus:border-[#3f51b5]">
                        <SelectValue placeholder="Auto Assign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto_assign">Problem Management (Auto Assign)</SelectItem>
                      <SelectItem value="service_desk">IT Operations</SelectItem>
                      <SelectItem value="network_team">Network Team</SelectItem>
                      <SelectItem value="system_admin">System Administrators</SelectItem>
                      <SelectItem value="security">Security Team</SelectItem>
                      <SelectItem value="development">Development Team</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rootCause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2c3e50] font-medium">Known Cause (if known)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any known information about the root cause..." 
                      rows={3}
                      {...field} 
                      value={field.value || ''}
                      className="bg-white border-[#c7d4e4] focus:border-[#3f51b5]" 
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="workaround"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#2c3e50] font-medium">Temporary Workaround (if any)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe any temporary solutions available while the problem is being fixed..." 
                  rows={3}
                  {...field} 
                  value={field.value || ''}
                  className="bg-white border-[#c7d4e4] focus:border-[#3f51b5]" 
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <div className="bg-white border border-[#e2e8f0] rounded-md p-4">
          <FormLabel className="text-[#2c3e50] font-medium mb-2 inline-block">Related Documents</FormLabel>
          <div className="border border-dashed border-[#c7d4e4] rounded-md px-3 py-4">
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-[#3f51b5]" />
              <p className="mt-1 text-sm text-[#475569]">
                Drag and drop files here, or{' '}
                <label className="text-[#3f51b5] font-medium cursor-pointer">
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
            className="bg-[#3f51b5] hover:bg-[#303f9f] text-white"
            disabled={createProblemMutation.isPending}
          >
            {createProblemMutation.isPending ? "Creating..." : "Create Problem Record"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ProblemForm;