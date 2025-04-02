import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean | null;
  };
  iconBgColor?: string;
}

const MetricsCard = ({
  title,
  value,
  icon,
  trend,
  iconBgColor = "bg-primary-light bg-opacity-10",
}: MetricsCardProps) => {
  return (
    <Card className="service-now-card snow-card-hover">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-[#607d8b] font-medium">{title}</p>
            <p className="text-2xl font-semibold text-gradient-blue mt-1">{value}</p>
          </div>
          <div className={cn("p-2.5 rounded-full shadow-sm", iconBgColor || "bg-[#e3f2fd]")}>
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center">
            <span className={cn(
              "text-xs font-medium flex items-center rounded px-1.5 py-0.5",
              trend.positive === true 
                ? "bg-[#e8f5e9] text-[#4caf50]" 
                : trend.positive === false 
                  ? "bg-[#ffebee] text-[#f44336]" 
                  : "bg-[#e0f7fa] text-[#00bcd4]"
            )}>
              {trend.positive === true ? (
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
              ) : trend.positive === false ? (
                <ArrowDownRight className="h-3.5 w-3.5 mr-1" />
              ) : null}
              {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
