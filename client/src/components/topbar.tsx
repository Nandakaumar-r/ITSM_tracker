
import { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';

const Topbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const notifications = [
    { message: "New ticket assigned to you", time: "5 minutes ago" },
    { message: "SLA breach alert for ticket T-1001", time: "10 minutes ago" },
    { message: "System maintenance scheduled", time: "1 hour ago" }
  ];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsOpen || userMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          setNotificationsOpen(false);
          setUserMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [notificationsOpen, userMenuOpen]);
  
  const { data: currentUser } = useQuery({
    queryKey: ['/api/users/1'],
    staleTime: Infinity,
  });

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 flex justify-between items-center px-4 py-2 shadow-sm">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">Nexole ITSM</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search..."
            className="bg-neutral-100 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-neutral-400" />
        </div>
        
        <div className="relative group">
          <Bell 
            className="h-6 w-6 text-neutral-500 cursor-pointer hover:text-neutral-700" 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            3
          </span>
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div key={index} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"} />
              <AvatarFallback>
                {currentUser?.fullName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="ml-2 text-sm font-medium text-neutral-700">
              {currentUser?.fullName || 'User'}
            </span>
            <svg className={`ml-1 h-4 w-4 text-neutral-500 transform transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
              <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
              <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
              <div className="border-t border-gray-200 my-1"></div>
              <a href="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
