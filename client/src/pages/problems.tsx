import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, AlertTriangle, Plus, Search } from "lucide-react";

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
import { Problem } from "@shared/schema";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CreateProblemModal from "@/components/create-problem-modal";

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

export default function Problems() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all_statuses");
  const [priorityFilter, setPriorityFilter] = useState<string>("all_priorities");
  const [isCreateProblemModalOpen, setIsCreateProblemModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data: problems, isLoading } = useQuery<Problem[]>({
    queryKey: ["/api/problems"],
  });

  const filteredProblems = problems?.filter((problem) => {
    const matchesSearch = searchQuery === "" || 
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.problemNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all_statuses" || problem.status === statusFilter;
    const matchesPriority = priorityFilter === "all_priorities" || problem.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Problem Management</h1>
          <p className="text-muted-foreground">
            Manage and track recurring issues and root causes
          </p>
        </div>
        <Button className="gap-1" onClick={() => setIsCreateProblemModalOpen(true)}>
          <Plus className="h-4 w-4" />
          <span>New Problem</span>
        </Button>
      </div>
      
      <CreateProblemModal 
        isOpen={isCreateProblemModalOpen}
        onClose={() => setIsCreateProblemModalOpen(false)}
      />
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Problems
          </CardTitle>
          <CardDescription>
            View and manage problems across the organization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search problems..."
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
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="identified">Identified</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
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
            </div>
          </div>
          
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Problem ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Created</TableHead>
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
                ) : filteredProblems?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No problems found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProblems?.slice(
                    pageIndex * pageSize,
                    (pageIndex + 1) * pageSize
                  ).map((problem) => (
                    <TableRow key={problem.id}>
                      <TableCell className="font-medium">{problem.problemNumber}</TableCell>
                      <TableCell>{problem.title}</TableCell>
                      <TableCell>{problem.category}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColorMap[problem.status]}>
                          {problem.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityColorMap[problem.priority]}>
                          {problem.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{problem.impact}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(problem.createdAt || "").toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/problems/${problem.id}`}>
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
          {filteredProblems && (
            <DataTablePagination
              pageSize={pageSize}
              setPageSize={setPageSize}
              pageIndex={pageIndex}
              setPageIndex={setPageIndex}
              totalItems={filteredProblems.length}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}