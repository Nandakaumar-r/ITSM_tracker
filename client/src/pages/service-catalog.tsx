import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Clock, UserCheck, Calendar, ArrowRight } from 'lucide-react';
import type { ServiceItem } from '@shared/schema';

const ServiceCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch service catalog items
  const { data: services = [], isLoading } = useQuery<ServiceItem[]>({
    queryKey: ['/api/services'],
  });
  
  // Filter services based on search query
  const filteredServices = services.filter(service => 
    searchQuery === '' || 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get unique categories
  const categories = Array.from(new Set(services.map(service => service.category)));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Service Catalog</h1>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
            </div>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Search className="h-16 w-16 text-neutral-300 mb-4" />
              <h3 className="text-xl font-medium text-neutral-800 mb-2">No services found</h3>
              <p className="text-neutral-500">Try adjusting your search to find what you're looking for.</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={categories[0] || "all"}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Services</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </TabsContent>
            
            {categories.map(category => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices
                    .filter(service => service.category === category)
                    .map(service => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

interface ServiceCardProps {
  service: ServiceItem;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{service.name}</CardTitle>
            <CardDescription className="mt-1">{service.category.charAt(0).toUpperCase() + service.category.slice(1)}</CardDescription>
          </div>
          <div className={`p-2 rounded-md ${
            service.approvalRequired 
              ? "bg-warning bg-opacity-10 text-warning" 
              : "bg-secondary bg-opacity-10 text-secondary"
          }`}>
            {service.approvalRequired ? (
              <UserCheck className="h-5 w-5" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-neutral-600 mb-4">{service.description}</p>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-neutral-500">
            <Clock className="h-4 w-4 mr-2" />
            <span>{service.estimatedTime || "Varies"}</span>
          </div>
          <div className="flex items-center text-sm text-neutral-500">
            <UserCheck className="h-4 w-4 mr-2" />
            <span>{service.approvalRequired ? "Approval required" : "No approval required"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-primary text-white">
          Request Service
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCatalog;
