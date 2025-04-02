import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ActiveDirectoryConfiguration from '@/components/ad-configuration';
import { UserManagement } from "../components/user-management"; // Added import for UserManagement

const profileFormSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  webNotifications: z.boolean(),
  ticketUpdates: z.boolean(),
  knowledgeBaseUpdates: z.boolean(),
  systemUpdates: z.boolean(),
});

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "admin",
      email: "admin@example.com",
      name: "Admin User",
    },
  });

  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      webNotifications: true,
      ticketUpdates: true,
      knowledgeBaseUpdates: false,
      systemUpdates: true,
    },
  });

  function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsLoading(false);
    }, 1000);
  }

  function onNotificationsSubmit(data: z.infer<typeof notificationsFormSchema>) {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been updated successfully",
      });
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-neutral-500 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="mb-6">
        <TabsList className="mb-6 grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="active-directory">Active Directory</TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is your full name that will be displayed to others.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Your username" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is your username used to login.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email address" {...field} />
                        </FormControl>
                        <FormDescription>
                          This email will be used for notifications and password recovery.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <h3 className="text-lg font-medium">Profile Picture</h3>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="w-20 h-20 rounded-full bg-neutral-200 relative overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" size="sm">
                            Change Picture
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="text-red-500">
                            Remove
                          </Button>
                        </div>
                        <p className="text-xs text-neutral-500">
                          Recommended size: 256x256px. Max file size: 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-primary text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    <Separator />

                    <FormField
                      control={notificationsForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationsForm.control}
                      name="webNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Web Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications in the application
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <h3 className="text-lg font-medium mt-6">Notification Types</h3>
                    <Separator />

                    <FormField
                      control={notificationsForm.control}
                      name="ticketUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Ticket Updates</FormLabel>
                            <FormDescription>
                              Get notified about ticket status changes and comments
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationsForm.control}
                      name="knowledgeBaseUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Knowledge Base Updates</FormLabel>
                            <FormDescription>
                              Get notified about new articles and updates
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationsForm.control}
                      name="systemUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">System Updates</FormLabel>
                            <FormDescription>
                              Get notified about system maintenance and updates
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-primary text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-3 cursor-pointer bg-white flex flex-col items-center justify-center h-24 relative border-primary">
                      <div className="w-8 h-8 rounded-full bg-white border mb-2"></div>
                      <span className="text-sm">Light</span>
                      <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full"></div>
                    </div>
                    <div className="border rounded-lg p-3 cursor-pointer bg-neutral-800 flex flex-col items-center justify-center h-24 text-white">
                      <div className="w-8 h-8 rounded-full bg-neutral-700 border mb-2"></div>
                      <span className="text-sm">Dark</span>
                    </div>
                    <div className="border rounded-lg p-3 cursor-pointer bg-gradient-to-b from-white to-neutral-800 flex flex-col items-center justify-center h-24">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-b from-white to-neutral-700 border mb-2"></div>
                      <span className="text-sm">System</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Accent Color</h3>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="w-full aspect-square rounded-full bg-primary cursor-pointer border-2 border-neutral-300"></div>
                    <div className="w-full aspect-square rounded-full bg-blue-500 cursor-pointer"></div>
                    <div className="w-full aspect-square rounded-full bg-purple-500 cursor-pointer"></div>
                    <div className="w-full aspect-square rounded-full bg-green-500 cursor-pointer"></div>
                    <div className="w-full aspect-square rounded-full bg-orange-500 cursor-pointer"></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Font Size</h3>
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium (Default)</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Default</Button>
              <Button className="bg-primary text-white">Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">SLA Configuration</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-1 block">Critical Priority SLA</label>
                        <Select defaultValue="4h">
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2h">2 hours</SelectItem>
                            <SelectItem value="4h">4 hours</SelectItem>
                            <SelectItem value="8h">8 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-1 block">High Priority SLA</label>
                        <Select defaultValue="8h">
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4h">4 hours</SelectItem>
                            <SelectItem value="8h">8 hours</SelectItem>
                            <SelectItem value="24h">24 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-1 block">Medium Priority SLA</label>
                        <Select defaultValue="24h">
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8h">8 hours</SelectItem>
                            <SelectItem value="24h">24 hours</SelectItem>
                            <SelectItem value="48h">48 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700 mb-1 block">Low Priority SLA</label>
                        <Select defaultValue="48h">
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24h">24 hours</SelectItem>
                            <SelectItem value="48h">48 hours</SelectItem>
                            <SelectItem value="72h">72 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Business Hours</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">Start Time</label>
                      <Select defaultValue="9:00">
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8:00">8:00 AM</SelectItem>
                          <SelectItem value="9:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">End Time</label>
                      <Select defaultValue="17:00">
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:00">4:00 PM</SelectItem>
                          <SelectItem value="17:00">5:00 PM</SelectItem>
                          <SelectItem value="18:00">6:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="bg-primary-light bg-opacity-10 text-primary">Monday</Button>
                    <Button variant="outline" size="sm" className="bg-primary-light bg-opacity-10 text-primary">Tuesday</Button>
                    <Button variant="outline" size="sm" className="bg-primary-light bg-opacity-10 text-primary">Wednesday</Button>
                    <Button variant="outline" size="sm" className="bg-primary-light bg-opacity-10 text-primary">Thursday</Button>
                    <Button variant="outline" size="sm" className="bg-primary-light bg-opacity-10 text-primary">Friday</Button>
                    <Button variant="outline" size="sm">Saturday</Button>
                    <Button variant="outline" size="sm">Sunday</Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Ticket Auto-Assignment</h3>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h4 className="text-base font-medium">Enable Auto-Assignment</h4>
                      <p className="text-sm text-neutral-500">Automatically assign tickets to technicians based on workload and category</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-directory">
          <Card>
            <CardHeader>
              <CardTitle>Active Directory Integration</CardTitle>
              <CardDescription>Configure and manage Active Directory integration settings</CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveDirectoryConfiguration />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-management">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and their roles in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;