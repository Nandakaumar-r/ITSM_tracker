import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Database, Plus, Search, Scan } from "lucide-react";

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
import { Asset } from "@shared/schema";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function Assets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all_statuses");
  const [typeFilter, setTypeFilter] = useState<string>("all_types");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  const filteredAssets = assets?.filter((asset) => {
    const matchesSearch = searchQuery === "" || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.model && asset.model.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all_statuses" || asset.status === statusFilter;
    const matchesType = typeFilter === "all_types" || asset.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Management</h1>
          <p className="text-muted-foreground">
            Track and manage all IT assets in the organization
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/assets/discovery">
            <Button variant="outline" className="gap-1">
              <Scan className="h-4 w-4" />
              <span>Asset Discovery</span>
            </Button>
          </Link>
          <Link href="/assets/new">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              <span>New Asset</span>
            </Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Database className="h-5 w-5 text-green-500" />
            Assets
          </CardTitle>
          <CardDescription>
            View and manage hardware, software, and other IT assets
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, tag, serial number..."
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
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_types">All Types</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="peripheral">Peripheral</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="license">License</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Tag</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Assigned To</TableHead>
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
                ) : filteredAssets?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No assets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets?.slice(
                    pageIndex * pageSize,
                    (pageIndex + 1) * pageSize
                  ).map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.assetTag}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={typeColorMap[asset.type] || ""}>
                          {asset.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColorMap[asset.status] || ""}>
                          {asset.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{asset.model || "-"}</TableCell>
                      <TableCell>{asset.location || "-"}</TableCell>
                      <TableCell>{asset.assignedToId ? `User ID: ${asset.assignedToId}` : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/assets/${asset.id}`}>
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
          {filteredAssets && (
            <DataTablePagination
              pageSize={pageSize}
              setPageSize={setPageSize}
              pageIndex={pageIndex}
              setPageIndex={setPageIndex}
              totalItems={filteredAssets.length}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}