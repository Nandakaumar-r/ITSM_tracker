import { useState } from 'react';
import { useParams, useLocation, useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  MessageSquare,
  UserCircle,
  Tag,
  Send
} from 'lucide-react';

import {
  statusConfig,
  priorityConfig,
  formatTicketNumber,
  formatDate,
  formatRelativeTime
} from '@/lib/utils';

import { Ticket, User, TicketComment } from '@shared/schema';

// Comment form schema
const commentSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty" }),
});

const TicketDetails = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const ticketId = parseInt(id);

  // State for comment form
  const commentForm = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  });

  // Fetch ticket details
  const { data: ticket, isLoading } = useQuery<Ticket>({
    queryKey: [`/api/tickets/${ticketId}`],
    enabled: !isNaN(ticketId),
  });

  // Fetch users for names
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch ticket comments
  const { data: comments = [] } = useQuery<TicketComment[]>({
    queryKey: [`/api/tickets/${ticketId}/comments`],
    enabled: !isNaN(ticketId),
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      return apiRequest('POST', `/api/tickets/${ticketId}/comments`, {
        content: data.content,
        userId: 1, // Assuming current user ID is 1 (admin)
        ticketId: ticketId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}/comments`] });
      commentForm.reset();
      toast({
        title: "Comment added",
        description: "Your comment has been added to the ticket",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async (data: Partial<Ticket>) => {
      return apiRequest('PATCH', `/api/tickets/${ticketId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}`] });
      toast({
        title: "Ticket updated",
        description: "The ticket has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update ticket: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle comment submission
  const onSubmitComment = (data: z.infer<typeof commentSchema>) => {
    addCommentMutation.mutate(data);
  };

  // Helper to get user by ID
  const getUserById = (id: number | null) => {
    if (!id) return null;
    return users.find(user => user.id === id);
  };

  // Helper to get user name
  const getUserName = (id: number | null) => {
    const user = getUserById(id);
    return user?.fullName || 'Unknown User';
  };

  // Status update handler
  const handleStatusChange = (status: string) => {
    updateTicketMutation.mutate({ status });
  };

  // Priority update handler
  const handlePriorityChange = (priority: string) => {
    updateTicketMutation.mutate({ priority });
  };

  // Assignee update handler
  const handleAssigneeChange = (assigneeId: string) => {
    updateTicketMutation.mutate({ 
      assigneeId: assigneeId ? parseInt(assigneeId) : null 
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Ticket not found. The ticket may have been deleted or you don't have permission to view it.</p>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/tickets')}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusStyle = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
  const priorityStyle = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium;

  return (
    <div className="p-6">
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/tickets">Tickets</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/tickets/${ticket.id}`}>
                {formatTicketNumber(ticket.ticketNumber)}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-semibold">
                    {ticket.subject}
                  </CardTitle>
                  <CardDescription>
                    {formatTicketNumber(ticket.ticketNumber)} - Opened {formatRelativeTime(ticket.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/tickets')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                <p className="text-neutral-700">{ticket.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Comments</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-neutral-500 text-sm">No comments yet</p>
                  ) : (
                    comments.map((comment) => {
                      const user = getUserById(comment.userId);
                      return (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.avatarUrl || undefined} />
                            <AvatarFallback>{user?.fullName.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{getUserName(comment.userId)}</span>
                                <span className="text-xs text-neutral-500">{formatRelativeTime(comment.createdAt)}</span>
                              </div>
                              <p className="text-sm text-neutral-700">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-4">
                  <Form {...commentForm}>
                    <form onSubmit={commentForm.handleSubmit(onSubmitComment)} className="space-y-2">
                      <FormField
                        control={commentForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex gap-2">
                                <Textarea
                                  placeholder="Add a comment..."
                                  className="flex-1"
                                  {...field}
                                />
                                <Button
                                  type="submit"
                                  className="bg-primary text-white"
                                  disabled={addCommentMutation.isPending}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Tag className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                  <Select
                    value={ticket.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className={`w-[130px] h-7 text-xs font-semibold ${statusStyle.bgColor} ${statusStyle.textColor} border-0`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Tag className="h-4 w-4" />
                    <span>Priority</span>
                  </div>
                  <Select
                    value={ticket.priority}
                    onValueChange={handlePriorityChange}
                  >
                    <SelectTrigger className={`w-[130px] h-7 text-xs font-semibold ${priorityStyle.bgColor} ${priorityStyle.textColor} border-0`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <UserCircle className="h-4 w-4" />
                    <span>Assignee</span>
                  </div>
                  <Select
                    value={ticket.assigneeId?.toString() || ""}
                    onValueChange={handleAssigneeChange}
                  >
                    <SelectTrigger className="w-[130px] h-7 text-xs border border-neutral-200">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users
                        .filter(user => user.role === 'technician')
                        .map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <UserCircle className="h-4 w-4 text-neutral-500" />
                  <span className="text-neutral-600">Requester:</span>
                  <span className="font-medium">{getUserName(ticket.requesterId)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-neutral-500" />
                  <span className="text-neutral-600">Type:</span>
                  <span className="font-medium capitalize">{ticket.type.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-neutral-500" />
                  <span className="text-neutral-600">Category:</span>
                  <span className="font-medium capitalize">{ticket.category}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-neutral-500" />
                  <span className="text-neutral-600">Created:</span>
                  <span className="font-medium">{formatDate(ticket.createdAt)}</span>
                </div>

                {ticket.dueDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-neutral-500" />
                    <span className="text-neutral-600">Due:</span>
                    <span className="font-medium">{formatDate(ticket.dueDate)}</span>
                  </div>
                )}

                {ticket.timeSpent && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-neutral-500" />
                    <span className="text-neutral-600">Time spent:</span>
                    <span className="font-medium">{ticket.timeSpent} minutes</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-neutral-500" />
                  <span className="text-neutral-600">Comments:</span>
                  <span className="font-medium">{comments.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
