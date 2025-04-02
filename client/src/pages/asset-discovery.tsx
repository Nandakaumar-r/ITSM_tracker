import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Laptop, 
  Server, 
  AlertCircle, 
  Download, 
  RefreshCw, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Check, 
  UploadCloud 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export default function AssetDiscovery() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('agent');
  const [isGeneratingAgent, setIsGeneratingAgent] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanActive, setIsScanActive] = useState(false);
  const [scannedAssets, setScannedAssets] = useState<any[]>([]);
  const [networkRange, setNetworkRange] = useState('192.168.1.0/24');
  const [agentConfig, setAgentConfig] = useState({
    companyName: 'Your Company',
    reportInterval: '60',
    scanHardware: true,
    scanSoftware: true,
    scanNetworkInfo: true,
    scanPrinters: false,
    scanUserInfo: true
  });

  // Mock data for discovered assets (in a real app this would come from the API)
  const mockAssets = [
    {
      id: 1,
      hostname: 'DESKTOP-7ABC123',
      ipAddress: '192.168.1.105',
      macAddress: '00:1A:2B:3C:4D:5E',
      osType: 'Windows 10 Pro',
      osVersion: '21H2',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      status: 'online',
      cpuModel: 'Intel Core i7-10700K',
      memoryTotal: '32GB',
      diskTotal: '1TB',
      softwareCount: 86
    },
    {
      id: 2,
      hostname: 'LAPTOP-XYZ456',
      ipAddress: '192.168.1.110',
      macAddress: '11:22:33:44:55:66',
      osType: 'Windows 11 Home',
      osVersion: '22H2',
      lastSeen: new Date(Date.now() - 25 * 60 * 1000),
      status: 'online',
      cpuModel: 'AMD Ryzen 7 5800H',
      memoryTotal: '16GB',
      diskTotal: '512GB',
      softwareCount: 64
    },
    {
      id: 3,
      hostname: 'SERVER-DB01',
      ipAddress: '192.168.1.5',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      osType: 'Windows Server',
      osVersion: '2022',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'online',
      cpuModel: 'Intel Xeon E5-2680',
      memoryTotal: '64GB',
      diskTotal: '4TB',
      softwareCount: 42
    }
  ];

  // Simulate asset discovery scan
  const startScan = () => {
    setIsScanActive(true);
    setScanProgress(0);
    setScannedAssets([]);
    
    // Simulate progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        
        // Add discovered assets as we go
        if (newProgress > 30 && scannedAssets.length === 0) {
          setScannedAssets([mockAssets[0]]);
        } else if (newProgress > 60 && scannedAssets.length === 1) {
          setScannedAssets([mockAssets[0], mockAssets[1]]);
        } else if (newProgress > 85 && scannedAssets.length === 2) {
          setScannedAssets([mockAssets[0], mockAssets[1], mockAssets[2]]);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsScanActive(false);
          toast({
            title: "Scan Complete",
            description: `Discovered ${scannedAssets.length} assets on your network.`,
          });
          return 100;
        }
        return newProgress;
      });
    }, 1000);
  };

  // Simulate agent generation
  const generateAgent = () => {
    setIsGeneratingAgent(true);
    
    // Simulate API call with delay
    setTimeout(() => {
      setIsGeneratingAgent(false);
      toast({
        title: "Agent Created Successfully",
        description: "Your Windows asset discovery agent is ready to download.",
      });
    }, 3000);
  };

  // Function to simulate agent download
  const downloadAgent = () => {
    toast({
      title: "Download Started",
      description: "Agent setup file is being downloaded. Install on your Windows machines to start collecting asset data.",
    });
  };

  // Formatting functions
  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Discovery</h1>
          <p className="text-muted-foreground">
            Discover and inventory all assets on your network
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agent">Windows Agent</TabsTrigger>
          <TabsTrigger value="network">Network Scan</TabsTrigger>
          <TabsTrigger value="discovered">Discovered Assets</TabsTrigger>
        </TabsList>
        
        {/* Windows Agent Tab */}
        <TabsContent value="agent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Laptop className="mr-2 h-6 w-6 text-primary" />
                Windows Asset Discovery Agent
              </CardTitle>
              <CardDescription>
                Generate and deploy a lightweight agent to automatically discover and inventory Windows assets
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="company">Company Name</Label>
                  <Input 
                    id="company" 
                    value={agentConfig.companyName} 
                    onChange={(e) => setAgentConfig({...agentConfig, companyName: e.target.value})}
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be displayed in the agent console
                  </p>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="interval">Reporting Interval (minutes)</Label>
                  <Input 
                    id="interval" 
                    type="number" 
                    value={agentConfig.reportInterval} 
                    onChange={(e) => setAgentConfig({...agentConfig, reportInterval: e.target.value})}
                  />
                  <p className="text-sm text-muted-foreground">
                    How often the agent will report inventory data
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Data Collection Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="hardware" 
                        checked={agentConfig.scanHardware}
                        onCheckedChange={(checked) => setAgentConfig({...agentConfig, scanHardware: checked})}
                      />
                      <Label htmlFor="hardware">Hardware Information</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="software" 
                        checked={agentConfig.scanSoftware}
                        onCheckedChange={(checked) => setAgentConfig({...agentConfig, scanSoftware: checked})}
                      />
                      <Label htmlFor="software">Installed Software</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="network" 
                        checked={agentConfig.scanNetworkInfo}
                        onCheckedChange={(checked) => setAgentConfig({...agentConfig, scanNetworkInfo: checked})}
                      />
                      <Label htmlFor="network">Network Information</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="printers" 
                        checked={agentConfig.scanPrinters}
                        onCheckedChange={(checked) => setAgentConfig({...agentConfig, scanPrinters: checked})}
                      />
                      <Label htmlFor="printers">Connected Printers</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="users" 
                        checked={agentConfig.scanUserInfo}
                        onCheckedChange={(checked) => setAgentConfig({...agentConfig, scanUserInfo: checked})}
                      />
                      <Label htmlFor="users">User Information</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              {isGeneratingAgent ? (
                <Button disabled>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Agent...
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button onClick={generateAgent}>
                    Generate Agent
                  </Button>
                  <Button variant="secondary" onClick={downloadAgent}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Agent
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Deployment Instructions</CardTitle>
              <CardDescription>
                Follow these steps to deploy the agent on your Windows systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <ol className="space-y-2 ml-4 list-decimal">
                    <li>Download the asset discovery agent installer</li>
                    <li>Run the installer on each Windows computer you want to inventory</li>
                    <li>Follow the on-screen instructions to complete installation</li>
                    <li>The agent will start automatically and run as a Windows service</li>
                    <li>Asset data will appear in the Discovered Assets tab as it's collected</li>
                  </ol>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Administrator Rights Required</AlertTitle>
                  <AlertDescription>
                    Installation requires administrator privileges on the target machine.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Network Scan Tab */}
        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-6 w-6 text-primary" />
                Network Asset Discovery
              </CardTitle>
              <CardDescription>
                Scan your network to discover assets without installing agents
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="network-range">Network Range</Label>
                  <Input 
                    id="network-range" 
                    value={networkRange} 
                    onChange={(e) => setNetworkRange(e.target.value)}
                    placeholder="192.168.1.0/24"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter IP range using CIDR notation (e.g., 192.168.1.0/24)
                  </p>
                </div>
                
                {isScanActive && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Scan Progress</Label>
                      <span className="text-sm">{Math.round(scanProgress)}%</span>
                    </div>
                    <Progress value={scanProgress} />
                    <p className="text-sm text-muted-foreground">
                      Scanning network for devices... Found {scannedAssets.length} assets so far.
                    </p>
                  </div>
                )}
                
                {scannedAssets.length > 0 && !isScanActive && (
                  <div className="rounded-md bg-muted p-4">
                    <h3 className="font-medium mb-2">Latest Scan Results</h3>
                    <p>Found {scannedAssets.length} assets on your network.</p>
                    <Button 
                      variant="link" 
                      onClick={() => setSelectedTab('discovered')}
                      className="p-0 h-auto font-normal"
                    >
                      View discovered assets
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter>
              {isScanActive ? (
                <Button variant="destructive" onClick={() => setIsScanActive(false)}>
                  Cancel Scan
                </Button>
              ) : (
                <Button onClick={startScan}>
                  Start Network Scan
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Network Scan Information</CardTitle>
              <CardDescription>
                Important details about the network discovery process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The network scan uses ICMP and common TCP ports to discover devices on your network.
                  It attempts to identify device types, operating systems, and open services.
                </p>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Limited Information</AlertTitle>
                  <AlertDescription>
                    Network scans provide limited asset details compared to the Windows agent. 
                    For complete hardware and software inventory, using the agent is recommended.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Discovered Assets Tab */}
        <TabsContent value="discovered" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="mr-2 h-6 w-6 text-primary" />
                Discovered Assets
              </CardTitle>
              <CardDescription>
                View and manage assets discovered by the Windows agent and network scans
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hostname</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>Hardware</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(scannedAssets.length > 0 ? scannedAssets : mockAssets).map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.hostname}</TableCell>
                        <TableCell>{asset.ipAddress}</TableCell>
                        <TableCell>
                          {asset.osType} {asset.osVersion}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs flex items-center">
                              <Cpu className="h-3 w-3 mr-1" /> {asset.cpuModel}
                            </span>
                            <span className="text-xs flex items-center">
                              <HardDrive className="h-3 w-3 mr-1" /> {asset.memoryTotal} RAM, {asset.diskTotal}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={asset.status === 'online' ? 'default' : 'secondary'}>
                            {asset.status === 'online' ? (
                              <span className="flex items-center">
                                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                                Online
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <span className="h-2 w-2 rounded-full bg-gray-500 mr-1"></span>
                                Offline
                              </span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatLastSeen(asset.lastSeen)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <UploadCloud className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => setSelectedTab('agent')}>
                  Deploy More Agents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}