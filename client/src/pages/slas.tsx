import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Clock, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SlaDefinition } from "@shared/schema";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function Slas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all_priorities");
  const [activeFilter, setActiveFilter] = useState<string>("all_statuses");

  const { data: slas, isLoading } = useQuery<SlaDefinition[]>({
    queryKey: ["/api/slas"],
  });

  const filteredSlas = slas?.filter((sla) => {
    const matchesSearch = searchQuery === "" || 
      sla.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sla.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesPriority = priorityFilter === "all_priorities" || sla.priority === priorityFilter;
    const matchesActive = activeFilter === "all_statuses" || 
      (activeFilter === "active" && sla.active) || 
      (activeFilter === "inactive" && !sla.active);
    
    return matchesSearch && matchesPriority && matchesActive;
  });

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SLA Management</h1>
          <p className="text-muted-foreground">
            Manage service level agreements and response targets
          </p>
        </div>
        <Button className="gap-1">
          <Plus className="h-4 w-4" />
          <span>New SLA</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            Service Level Agreements
          </CardTitle>
          <CardDescription>
            Define and manage SLAs for different service priority levels
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search SLAs..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_priorities">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Resolution Time</TableHead>
                  <TableHead>Business Hours Only</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="h-14 px-4 py-2">
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredSlas?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No SLAs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSlas?.map((sla) => (
                    <TableRow key={sla.id}>
                      <TableCell className="font-medium">{sla.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityColorMap[sla.priority]}>
                          {sla.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatTimeInHours(sla.responseTime)}</TableCell>
                      <TableCell>{formatTimeInHours(sla.resolutionTime)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Switch checked={!!sla.businessHoursOnly} disabled />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Switch checked={!!sla.active} disabled />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/slas/${sla.id}`}>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}