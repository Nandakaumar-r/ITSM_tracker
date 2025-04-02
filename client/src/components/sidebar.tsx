import { Link, useLocation } from "react-router-dom";
import { IoExitOutline, IoStatsChartSharp } from "react-icons/io5";
import { MdDashboard, MdSettings, MdMenuBook, MdChangeCircle } from "react-icons/md";
import { FaTicketAlt, FaLaptop } from "react-icons/fa";
import { BiSolidBarcode } from "react-icons/bi";
import { RiErrorWarningFill } from "react-icons/ri";
import { HiTemplate } from "react-icons/hi";
import { cn } from "@/lib/utils";

const SidebarIcon = ({ 
  icon: Icon, 
  label, 
  href, 
  isActive = false
}: { 
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}) => {
  return (
    <Link to={href}> {/* Changed to <Link to={href}> */}
      <div className={cn(
        "flex items-center px-4 py-3 mx-2 rounded-lg transition-colors duration-200",
        "cursor-pointer hover:bg-[#2563eb]/10",
        isActive ? "bg-[#1ba8d4] text-white" : "text-white"
      )}>
        <Icon className="h-5 w-5" />
        <span className="ml-3 text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="fixed top-16 left-0 h-[calc(100vh-64px)] w-64 bg-[#25c7eb] shadow-lg flex flex-col">
      <div className="flex-1 py-4 overflow-y-auto">
        <SidebarIcon 
          icon={MdDashboard} 
          label="Dashboard" 
          href="/" 
          isActive={currentPath === "/dashboard"}
        />

        <SidebarIcon 
          icon={FaTicketAlt} 
          label="Tickets" 
          href="/tickets" 
          isActive={currentPath.startsWith("/tickets")}
        />

        <SidebarIcon 
          icon={RiErrorWarningFill} 
          label="Problems" 
          href="/problems" 
          isActive={currentPath.startsWith("/problems")}
        />

        <SidebarIcon 
          icon={MdChangeCircle} 
          label="Changes" 
          href="/changes" 
          isActive={currentPath.startsWith("/changes")}
        />

        <div className="mx-4 my-4 border-t border-white/20" />

        <SidebarIcon 
          icon={FaLaptop} 
          label="Assets" 
          href="/assets" 
          isActive={currentPath === "/assets" || (currentPath.startsWith("/assets/") && !currentPath.includes("/discovery"))}
        />

        <SidebarIcon 
          icon={BiSolidBarcode} 
          label="Asset Discovery" 
          href="/asset-discovery" 
          isActive={currentPath === "/asset-discovery"}
        />

        <SidebarIcon 
          icon={HiTemplate} 
          label="Service Catalog" 
          href="/service-catalog" 
          isActive={currentPath === "/service-catalog"}
        />

        <div className="mx-4 my-4 border-t border-white/20" />

        <SidebarIcon 
          icon={MdMenuBook} 
          label="Knowledge Base" 
          href="/knowledge-base" 
          isActive={currentPath === "/knowledge-base"}
        />

        <SidebarIcon 
          icon={IoStatsChartSharp} 
          label="Reports" 
          href="/reports" 
          isActive={currentPath === "/reports"}
        />

        <SidebarIcon 
          icon={MdSettings} 
          label="Settings" 
          href="/settings" 
          isActive={currentPath === "/settings"}
        />
      </div>

      <div className="p-4 border-t border-white/20">
        <SidebarIcon 
          icon={IoExitOutline} 
          label="Logout" 
          href="#logout"
        />
      </div>
    </div>
  );
};

export default Sidebar;