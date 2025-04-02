import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ChevronLeft, Edit, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Problem } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const statusColorMap: Record<string, string> = {
  new: "bg-blue-500 hover:bg-blue-600",
  in_progress: "bg-amber-500 hover:bg-amber-600",
  identified: "bg-purple-500 hover:bg-purple-600",
  resolved: "bg-green-500 hover:bg-green-600",
  closed: "bg-gray-500 hover:bg-gray-600",
};

const priorityColorMap: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-red-100 text-red-800 border-red-200",
  critical: "bg-purple-100 text-purple-800 border-purple-200",
};

export default function ProblemDetails() {
  const { id } = useParams<{ id: string }>();
  const problemId = parseInt(id);

  const { data: problem, isLoading } = useQuery<Problem>({
    queryKey: [`/api/problems/${problemId}`],
    enabled: !isNaN(problemId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Link href="/problems">
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

  if (!problem) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Link href="/problems">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Problem Not Found</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>The requested problem could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/problems">Return to Problem List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/problems">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{problem.problemNumber}</h1>
              <Badge variant="secondary" className={statusColorMap[problem.status]}>
                {problem.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={priorityColorMap[problem.priority]}>
                {problem.priority}
              </Badge>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{problem.title}</h2>
          </div>
        </div>
        <Button className="gap-1">
          <Edit className="h-4 w-4" />
          <span>Edit Problem</span>
        </Button>
      </div>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="related">Related Tickets</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Problem Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Description</div>
                  <p className="text-base">{problem.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Category</div>
                    <p className="text-base">{problem.category}</p>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Impact</div>
                    <p className="text-base">{problem.impact}</p>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Created</div>
                    <p className="text-base">
                      {new Date(problem.createdAt || "").toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid gap-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Root Cause</div>
                  {problem.rootCause ? (
                    <p className="text-base">{problem.rootCause}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No root cause identified yet</p>
                  )}
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Workaround</div>
                  {problem.workaround ? (
                    <p className="text-base">{problem.workaround}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No workaround available</p>
                  )}
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Resolution</div>
                  {problem.resolution ? (
                    <p className="text-base">{problem.resolution}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Not resolved yet</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <div className="text-sm font-medium text-muted-foreground mb-2">Add Note</div>
                <Textarea placeholder="Add notes or updates about this problem..." />
                <Button className="mt-2">Add Note</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="related" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Related Tickets</CardTitle>
              <CardDescription>Tickets associated with this problem</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No related tickets found.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Problem Timeline</CardTitle>
              <CardDescription>History of activities for this problem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-24 text-muted-foreground">
                    {new Date(problem.createdAt || "").toLocaleDateString()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Problem created</p>
                    <p className="text-muted-foreground">Initial problem report created</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}