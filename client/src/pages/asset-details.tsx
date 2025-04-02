import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ChevronLeft, Edit, Database, FileText, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Asset } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const statusColorMap: Record<string, string> = {
  in_use: "bg-green-100 text-green-800 border-green-200",
  available: "bg-blue-100 text-blue-800 border-blue-200",
  maintenance: "bg-amber-100 text-amber-800 border-amber-200",
  repair: "bg-purple-100 text-purple-800 border-purple-200",
  retired: "bg-gray-100 text-gray-800 border-gray-200",
  lost: "bg-red-100 text-red-800 border-red-200",
};

const typeColorMap: Record<string, string> = {
  hardware: "bg-blue-500 hover:bg-blue-600",
  software: "bg-green-500 hover:bg-green-600",
  service: "bg-purple-500 hover:bg-purple-600",
  peripheral: "bg-amber-500 hover:bg-amber-600",
  infrastructure: "bg-cyan-500 hover:bg-cyan-600",
  network: "bg-indigo-500 hover:bg-indigo-600",
  mobile: "bg-rose-500 hover:bg-rose-600",
  license: "bg-emerald-500 hover:bg-emerald-600",
};

export default function AssetDetails() {
  const { id } = useParams<{ id: string }>();
  const assetId = parseInt(id);

  const { data: asset, isLoading } = useQuery<Asset>({
    queryKey: [`/api/assets/${assetId}`],
    enabled: !isNaN(assetId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Link href="/assets">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Skeleton className="h-10 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Link href="/assets">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Asset Not Found</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>The requested asset could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/assets">Return to Asset List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate warranty status
  const today = new Date();
  const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : null;
  const warrantyDate = asset.warrantyExpiryDate ? new Date(asset.warrantyExpiryDate) : null;
  
  let warrantyStatus = "Unknown";
  let warrantyProgress = 0;
  let warrantyClass = "text-gray-500";
  
  if (purchaseDate && warrantyDate) {
    const totalWarrantyDays = (warrantyDate.getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24);
    const elapsedDays = (today.getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24);
    warrantyProgress = Math.min(100, Math.max(0, Math.round((elapsedDays / totalWarrantyDays) * 100)));
    
    if (today > warrantyDate) {
      warrantyStatus = "Expired";
      warrantyClass = "text-red-500";
    } else {
      const daysLeft = Math.round((warrantyDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      warrantyStatus = `${daysLeft} days left`;
      if (daysLeft < 30) {
        warrantyClass = "text-amber-500";
      } else {
        warrantyClass = "text-green-500";
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/assets">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{asset.assetTag}</h1>
              <Badge variant="outline" className={statusColorMap[asset.status]}>
                {asset.status.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className={typeColorMap[asset.type] || ""}>
                {asset.type}
              </Badge>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{asset.name}</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {asset.status !== "maintenance" && asset.status !== "repair" && (
            <Button variant="outline" className="gap-1">
              <Calendar className="h-4 w-4" />
              <span>Schedule Maintenance</span>
            </Button>
          )}
          <Button className="gap-1">
            <Edit className="h-4 w-4" />
            <span>Edit Asset</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                Asset Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Manufacturer</div>
                    <p className="text-base">{asset.manufacturer || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Model</div>
                    <p className="text-base">{asset.model || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Serial Number</div>
                    <p className="text-base">{asset.serialNumber || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Specifications</div>
                    <p className="text-base">{asset.specifications || "Not specified"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Location</div>
                    <p className="text-base">{asset.location || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Assigned To</div>
                    <p className="text-base">
                      {asset.assignedToId ? `User ID: ${asset.assignedToId}` : "Not assigned"}
                    </p>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">License Information</div>
                    <p className="text-base">{asset.licenseInfo || "Not applicable"}</p>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Notes</div>
                    <p className="text-base">{asset.notes || "No notes"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifecycle" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle Information</CardTitle>
              <CardDescription>Dates and warranty information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Purchase Date</div>
                    <p className="text-base">
                      {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Last Audit Date</div>
                    <p className="text-base">
                      {asset.lastAuditDate ? new Date(asset.lastAuditDate).toLocaleDateString() : "Never audited"}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Warranty Status</div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`font-medium text-lg ${warrantyClass}`}>{warrantyStatus}</div>
                    <div className="text-sm text-muted-foreground">
                      Expires: {asset.warrantyExpiryDate ? new Date(asset.warrantyExpiryDate).toLocaleDateString() : "Unknown"}
                    </div>
                  </div>
                  <Progress value={warrantyProgress} className="h-2 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset History</CardTitle>
              <CardDescription>Maintenance and usage history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-24 text-muted-foreground">
                    {new Date(asset.createdAt || "").toLocaleDateString()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Asset created</p>
                    <p className="text-muted-foreground">Asset added to inventory</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Add Maintenance Record
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Related documents and attachments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No documents attached to this asset.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Attach Document
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}