import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, RefreshCw, Plus, Search } from "lucide-react";

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
import { Change } from "@shared/schema";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CreateChangeModal from "@/components/create-change-modal";

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

export default function Changes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all_statuses");
  const [typeFilter, setTypeFilter] = useState<string>("all_types");
  const [isCreateChangeModalOpen, setIsCreateChangeModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data: changes, isLoading } = useQuery<Change[]>({
    queryKey: ["/api/changes"],
  });

  const filteredChanges = changes?.filter((change) => {
    const matchesSearch = searchQuery === "" || 
      change.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      change.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      change.changeNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all_statuses" || change.status === statusFilter;
    const matchesType = typeFilter === "all_types" || change.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Change Management</h1>
          <p className="text-muted-foreground">
            Plan, approve, and implement organizational changes
          </p>
        </div>
        <Button 
          className="gap-1 bg-[#2196f3] hover:bg-[#1976d2] text-white"
          onClick={() => setIsCreateChangeModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>New Change</span>
        </Button>
      </div>
      
      <CreateChangeModal
        isOpen={isCreateChangeModalOpen}
        onClose={() => setIsCreateChangeModalOpen(false)}
      />
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            Changes
          </CardTitle>
          <CardDescription>
            View and manage change requests across the organization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search changes..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_types">All Types</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Change ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8} className="h-14 px-4 py-2">
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredChanges?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No changes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChanges?.slice(
                    pageIndex * pageSize,
                    (pageIndex + 1) * pageSize
                  ).map((change) => (
                    <TableRow key={change.id}>
                      <TableCell className="font-medium">{change.changeNumber}</TableCell>
                      <TableCell>{change.title}</TableCell>
                      <TableCell>{change.type}</TableCell>
                      <TableCell>{change.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColorMap[change.status]}>
                          {change.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={priorityColorMap[change.priority]}>
                          {change.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {change.scheduledStartTime ? 
                          new Date(change.scheduledStartTime).toLocaleDateString() : 
                          "Not scheduled"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/changes/${change.id}`}>
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
          {filteredChanges && (
            <DataTablePagination
              pageSize={pageSize}
              setPageSize={setPageSize}
              pageIndex={pageIndex}
              setPageIndex={setPageIndex}
              totalItems={filteredChanges.length}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}