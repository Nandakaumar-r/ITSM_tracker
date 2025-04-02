import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Schema for the form validation
const adConfigSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  baseDN: z.string().min(1, { message: "Base DN is required" }),
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  useTLS: z.boolean().default(true),
  useGraphAPI: z.boolean().default(false),
});

type ADConfigFormValues = z.infer<typeof adConfigSchema>;

export function ActiveDirectoryConfiguration() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('ldap');
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // Set up form with Zod validation
  const form = useForm<ADConfigFormValues>({
    resolver: zodResolver(adConfigSchema),
    defaultValues: {
      url: '',
      baseDN: '',
      username: '',
      password: '',
      useTLS: true,
      useGraphAPI: false,
    },
  });
  
  // Save AD configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (data: ADConfigFormValues) => {
      const res = await apiRequest('POST', '/api/settings/ad-config', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Active Directory configuration saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save configuration: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Test AD connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (data: ADConfigFormValues) => {
      const res = await apiRequest('POST', '/api/settings/ad-test', data);
      return res.json();
    },
    onSuccess: (data) => {
      setTestResult({
        success: data.success,
        message: data.message,
      });
      toast({
        title: data.success ? "Success" : "Warning",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      setTestResult({
        success: false,
        message: `Connection test failed: ${error.message}`,
      });
      toast({
        title: "Error",
        description: `Connection test failed: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: ADConfigFormValues) => {
    saveConfigMutation.mutate(data);
  };
  
  // Test connection handler
  const handleTestConnection = () => {
    const values = form.getValues();
    testConnectionMutation.mutate(values);
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-[#f5f9ff] border-b border-[#e1effe]">
        <CardTitle className="text-lg font-semibold text-[#2196f3]">
          Active Directory Integration
        </CardTitle>
        <CardDescription>
          Configure Active Directory integration for user authentication and validation
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ldap">LDAP Configuration</TabsTrigger>
                <TabsTrigger value="graph">Microsoft Graph API</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ldap" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LDAP Server URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ldap://ad.example.com:389" 
                            {...field} 
                            className="bg-white border-[#c7d4e4] focus:border-[#2196f3]"
                          />
                        </FormControl>
                        <FormDescription>
                          The URL of your Active Directory LDAP server
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="baseDN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base DN</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="dc=example,dc=com" 
                            {...field} 
                            className="bg-white border-[#c7d4e4] focus:border-[#2196f3]"
                          />
                        </FormControl>
                        <FormDescription>
                          The base Distinguished Name for LDAP queries
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Account Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="serviceAccount@example.com" 
                            {...field} 
                            className="bg-white border-[#c7d4e4] focus:border-[#2196f3]"
                          />
                        </FormControl>
                        <FormDescription>
                          The username of a service account with read permissions in AD
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Account Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="bg-white border-[#c7d4e4] focus:border-[#2196f3]"
                          />
                        </FormControl>
                        <FormDescription>
                          The password for the service account
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="useTLS"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Use TLS/SSL</FormLabel>
                        <FormDescription>
                          Enable secure LDAP connections using TLS/SSL
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
                
                <Alert className="bg-[#e3f2fd] text-[#0d47a1] border-[#bbdefb]">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Note</AlertTitle>
                  <AlertDescription>
                    The service account should have read permissions to query user information in Active Directory.
                    For security, consider using LDAPS (LDAP over SSL) by checking the 'Use TLS/SSL' option.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="graph" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="useGraphAPI"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Use Microsoft Graph API</FormLabel>
                        <FormDescription>
                          Use Microsoft Graph API instead of LDAP for Azure AD integrations
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
                
                <Alert className="bg-[#e8f5e9] text-[#1b5e20] border-[#c8e6c9]">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Microsoft Graph API Configuration</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p>To use Microsoft Graph API, you'll need to register an application in Azure AD:</p>
                    <ol className="list-decimal list-inside ml-2 mt-2 space-y-1">
                      <li>Go to Azure Portal &gt; Azure Active Directory &gt; App Registrations</li>
                      <li>Create a new registration for this ITSM application</li>
                      <li>Set up proper permissions for Microsoft Graph API</li>
                      <li>Configure a client secret</li>
                      <li>Enter the client ID and secret in the fields below</li>
                    </ol>
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application (client) ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="11111111-2222-3333-4444-555555555555" 
                            {...field} 
                            className="bg-white border-[#c7d4e4] focus:border-[#2196f3]"
                          />
                        </FormControl>
                        <FormDescription>
                          The application ID from your Azure AD app registration
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Secret</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="bg-white border-[#c7d4e4] focus:border-[#2196f3]"
                          />
                        </FormControl>
                        <FormDescription>
                          The client secret created for your application
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="baseDN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="yourtenant.onmicrosoft.com" 
                          {...field} 
                          className="bg-white border-[#c7d4e4] focus:border-[#2196f3]"
                        />
                      </FormControl>
                      <FormDescription>
                        Your Azure AD tenant ID or domain name
                      </FormDescription>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            {testResult && (
              <Alert
                className={`${
                  testResult.success
                    ? "bg-[#e8f5e9] text-[#1b5e20] border-[#c8e6c9]"
                    : "bg-[#ffebee] text-[#b71c1c] border-[#ffcdd2]"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{testResult.success ? "Connection Successful" : "Connection Failed"}</AlertTitle>
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between bg-[#f5f9ff] border-t border-[#e1effe] p-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={testConnectionMutation.isPending || saveConfigMutation.isPending}
              className="border-[#2196f3] text-[#2196f3] hover:bg-[#e3f2fd]"
            >
              {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
            </Button>
            <Button
              type="submit"
              disabled={saveConfigMutation.isPending}
              className="bg-[#2196f3] hover:bg-[#1976d2] text-white"
            >
              {saveConfigMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default ActiveDirectoryConfiguration;