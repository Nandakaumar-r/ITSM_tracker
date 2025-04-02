import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ChevronLeft, Edit, Clock, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { SlaDefinition } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const priorityColorMap: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-red-100 text-red-800 border-red-200",
  critical: "bg-purple-100 text-purple-800 border-purple-200",
};

function formatTimeInHours(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else if (minutes === 60) {
    return "1 hour";
  } else if (minutes < 1440) {
    const hours = minutes / 60;
    return `${hours} hours`;
  } else {
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    
    if (remainingHours === 0) {
      return days === 1 ? "1 day" : `${days} days`;
    } else {
      return days === 1 
        ? `1 day ${remainingHours} hours` 
        : `${days} days ${remainingHours} hours`;
    }
  }
}

export default function SlaDetails() {
  const { id } = useParams<{ id: string }>();
  const slaId = parseInt(id);

  const { data: sla, isLoading } = useQuery<SlaDefinition>({
    queryKey: [`/api/slas/${slaId}`],
    enabled: !isNaN(slaId),
  });

  // Mock data for related business hours
  const businessHours = [
    { day: "Monday", start: "08:00", end: "17:00", isWorkingDay: true },
    { day: "Tuesday", start: "08:00", end: "17:00", isWorkingDay: true },
    { day: "Wednesday", start: "08:00", end: "17:00", isWorkingDay: true },
    { day: "Thursday", start: "08:00", end: "17:00", isWorkingDay: true },
    { day: "Friday", start: "08:00", end: "17:00", isWorkingDay: true },
    { day: "Saturday", start: "00:00", end: "00:00", isWorkingDay: false },
    { day: "Sunday", start: "00:00", end: "00:00", isWorkingDay: false },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Link href="/slas">
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

  if (!sla) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Link href="/slas">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">SLA Not Found</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>The requested SLA could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/slas">Return to SLA List</Link>
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
          <Link href="/slas">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{sla.name}</h1>
              <Badge variant="outline" className={priorityColorMap[sla.priority]}>
                {sla.priority}
              </Badge>
              <Badge variant={sla.active ? "default" : "secondary"}>
                {sla.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{sla.description}</p>
          </div>
        </div>
        <Button className="gap-1">
          <Edit className="h-4 w-4" />
          <span>Edit SLA</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              SLA Targets
            </CardTitle>
            <CardDescription>Response and resolution targets for this SLA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                  <p className="font-medium text-lg">{formatTimeInHours(sla.responseTime)}</p>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Resolution Time</div>
                  <p className="font-medium text-lg">{formatTimeInHours(sla.resolutionTime)}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Business Hours Only</div>
                  <Switch checked={!!sla.businessHoursOnly} disabled />
                </div>
                <p className="text-sm text-muted-foreground">
                  {!!sla.businessHoursOnly 
                    ? "SLA timer only counts during defined business hours" 
                    : "SLA timer counts 24/7 regardless of business hours"}
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Status</div>
                  <Switch checked={!!sla.active} disabled />
                </div>
                <p className="text-sm text-muted-foreground">
                  {!!sla.active 
                    ? "This SLA is currently active and will be applied to new tickets" 
                    : "This SLA is inactive and won't be applied to new tickets"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Business Hours
            </CardTitle>
            <CardDescription>Hours during which this SLA is measured</CardDescription>
          </CardHeader>
          <CardContent>
            {!!sla.businessHoursOnly ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Working Day</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessHours.map((hours, index) => (
                    <TableRow key={index}>
                      <TableCell>{hours.day}</TableCell>
                      <TableCell>
                        {hours.isWorkingDay ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{hours.isWorkingDay ? hours.start : "-"}</TableCell>
                      <TableCell>{hours.isWorkingDay ? hours.end : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">
                  This SLA is measured 24/7 regardless of business hours
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>SLA Usage</CardTitle>
          <CardDescription>Services and tickets using this SLA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No services or tickets are currently using this SLA</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}