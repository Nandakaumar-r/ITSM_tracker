import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ChevronLeft, Edit, RefreshCw, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Change } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const statusColorMap: Record<string, string> = {
  draft: "bg-blue-100 text-blue-800 border-blue-200",
  submitted: "bg-purple-100 text-purple-800 border-purple-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  scheduled: "bg-amber-100 text-amber-800 border-amber-200",
  in_progress: "bg-cyan-100 text-cyan-800 border-cyan-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-rose-100 text-rose-800 border-rose-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityColorMap: Record<string, string> = {
  low: "bg-blue-500 hover:bg-blue-600",
  medium: "bg-amber-500 hover:bg-amber-600",
  high: "bg-red-500 hover:bg-red-600",
  emergency: "bg-purple-500 hover:bg-purple-600",
};

export default function ChangeDetails() {
  const { id } = useParams<{ id: string }>();
  const changeId = parseInt(id);

  const { data: change, isLoading } = useQuery<Change>({
    queryKey: [`/api/changes/${changeId}`],
    enabled: !isNaN(changeId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Link href="/changes">
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

  if (!change) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Link href="/changes">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Change Not Found</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>The requested change could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/changes">Return to Change List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/changes">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{change.changeNumber}</h1>
              <Badge variant="outline" className={statusColorMap[change.status]}>
                {change.status.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className={priorityColorMap[change.priority]}>
                {change.priority}
              </Badge>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{change.title}</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {change.status === "approved" && (
            <Button variant="outline" className="gap-1">
              <Calendar className="h-4 w-4" />
              <span>Schedule</span>
            </Button>
          )}
          <Button className="gap-1">
            <Edit className="h-4 w-4" />
            <span>Edit Change</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="plans">Implementation Plans</TabsTrigger>
          <TabsTrigger value="related">Related Items</TabsTrigger>
          <TabsTrigger value="approval">Approval</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                Change Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Description</div>
                  <p className="text-base">{change.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Type</div>
                      <p className="text-base">{change.type}</p>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Category</div>
                      <p className="text-base">{change.category}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Impact</div>
                      <p className="text-base">{change.impact}</p>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Risk</div>
                      <p className="text-base">{change.risk}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Requested By</div>
                      <p className="text-base">User ID: {change.requesterId}</p>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Created</div>
                      <p className="text-base">
                        {new Date(change.createdAt || "").toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Schedule</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Scheduled Start</div>
                      <p className="font-medium">
                        {change.scheduledStartTime ? 
                          new Date(change.scheduledStartTime).toLocaleString() : 
                          "Not scheduled"}
                      </p>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Scheduled End</div>
                      <p className="font-medium">
                        {change.scheduledEndTime ? 
                          new Date(change.scheduledEndTime).toLocaleString() : 
                          "Not scheduled"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Add Note</div>
                  <Textarea placeholder="Add notes or updates about this change..." />
                  <Button className="mt-2">Add Note</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="plans" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Plans</CardTitle>
              <CardDescription>Planning details for this change</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Implementation Plan</h3>
                  {change.implementationPlan ? (
                    <p>{change.implementationPlan}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No implementation plan provided</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Test Plan</h3>
                  {change.testPlan ? (
                    <p>{change.testPlan}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No test plan provided</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Backout Plan</h3>
                  {change.backoutPlan ? (
                    <p>{change.backoutPlan}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No backout plan provided</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="related" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Related Items</CardTitle>
              <CardDescription>Items associated with this change</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Affected Services</h3>
                  {change.affectedServices ? (
                    <p>{change.affectedServices}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No affected services specified</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Affected Assets</h3>
                  {change.affectedAssets ? (
                    <p>{change.affectedAssets}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No affected assets specified</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approval" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Information</CardTitle>
              <CardDescription>Approval status and details for this change</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Approval Status</div>
                    <p className="font-medium">
                      {change.status === "approved" ? "Approved" : 
                       change.status === "rejected" ? "Rejected" : 
                       "Not submitted for approval"}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Approved By</div>
                    <p className="font-medium">
                      {change.approvedById ? `User ID: ${change.approvedById}` : "Not approved yet"}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Approval Date</div>
                  <p className="font-medium">
                    {change.approvalDate ? 
                      new Date(change.approvalDate).toLocaleString() : 
                      "Not approved yet"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {change.status === "submitted" && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" className="gap-1">
                    <span>Approve Change</span>
                  </Button>
                  <Button variant="destructive" className="gap-1">
                    <span>Reject Change</span>
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}