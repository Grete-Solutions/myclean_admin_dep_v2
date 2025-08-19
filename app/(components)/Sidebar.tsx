'use client'
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Home, BarChart2, Settings, GitBranch, MapPin, User, Users, MessageSquare, Bell, HelpCircle, FileText, DollarSign, ChevronLeft, Shield, Sliders, Car, Globe, FileCheck, FileClock, FileX, Clock, FileTerminal, CheckCircle, Clock3, Star, Wallet2, UserCheck, UserX, UserMinus, UserX2,  AlertCircle, BarChart, PieChart, Menu } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// Define types for the navigation data
interface SubMenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  submenu?: boolean;
  subMenuItems?: SubMenuItem[];
}

interface NavGroup {
  title: string;
  menuList: MenuItem[];
}

// Define the navigation data with proper types
const SIDENAV_ITEMS: NavGroup[] = [
  {
    title: "Dashboards",
    menuList: [
      {
        title: 'Dashboard',
        path: '/',
        icon: <Home size={18} />,
      },
      {
        title: 'Analytics',
        path: '/analytics',
        icon: <BarChart2 size={18} />,
      }, 
      {
        title: 'Configurations',
        icon: <Settings size={18} />,
        submenu: true,
        subMenuItems: [
          { title: 'Privileges', path: '/configurations/privileges', icon: <Shield size={16} /> },
          { title: 'System Settings', path: '/configurations/system-settings', icon: <Sliders size={16} /> },
        ],
      },
    ],  
  },
  {
    title: "Manage",
    menuList: [
      {
        title: 'Master Data',
        icon: <GitBranch size={18} />,
        submenu: true,
        subMenuItems: [
          { title: 'Vehicle Make', path: '/master-data/vehicle-make', icon: <Car size={16} /> },
          { title: 'Country', path: '/master-data/country', icon: <Globe size={16} /> },
          { title: 'Driver Needed Documentation', path: '/master-data/driver-needed-documentation', icon: <FileCheck size={16} /> },
        ],
      },
      {
        title: 'Service Locations',
        path: '/service-locations',
        icon: <MapPin size={18} />,
      },
      {
        title: 'Admins',
        path: '/admin',
        icon: <User size={18} />,
      },
      {
        title: 'Pickup Requests',
        icon: <FileText size={18} />,
        submenu: true,
        subMenuItems: [
          { title: 'Completed Pickups', path: '/pickup-requests/completed-pickups', icon: <FileCheck size={16} /> },
          { title: 'Pending Pickups', path: '/pickup-requests/pending-pickups', icon: <FileClock size={16} /> },
          { title: 'Cancelled Pickups', path: '/pickup-requests/cancelled-pickups', icon: <FileX size={16} /> },
          { title: 'Ongoing Pickups', path: '/pickup-requests/ongoing-pickups', icon: <Clock size={16} /> },
          { title: 'Expired Pickups', path: '/pickup-requests/expired-pickups', icon: <FileTerminal size={16} /> },
        ],
      },
      {
        title: 'Manage Drivers',
        icon: <Users size={18} />,
        submenu: true,
        subMenuItems: [
          { title: 'Approved Drivers', path: '/manage-drivers/approved-drivers', icon: <CheckCircle size={16} /> },
          { title: 'Pending Drivers', path: '/manage-drivers/pending-drivers', icon: <Clock3 size={16} /> },
          { title: 'Driver Ratings', path: '/manage-drivers/driver-ratings', icon: <Star size={16} /> },
          { title: 'Negative Balance Drivers', path: '/manage-drivers/negative-balance-drivers', icon: <Wallet2 size={16} /> },
        ],
      },
      {
        title: 'Manage Users',
        icon: <User size={18} />,
        submenu: true,
        subMenuItems: [
          { title: 'Users', path: '/manage-users/users', icon: <UserCheck size={16} /> },
          { title: 'Suspended Users', path: '/manage-users/suspended-users', icon: <UserX size={16} /> },
          { title: 'Deactivated Users', path: '/manage-users/deactivated-users', icon: <UserMinus size={16} /> },
          { title: 'Deleted Users', path: '/manage-users/deleted-users', icon: <UserX2 size={16} /> },
        ],
      },
    ]
  },
  {
    title: "Others",
    menuList: [             
      {
        title: 'Chat',
        path: '/chat',
        icon: <MessageSquare size={18} />,
      },
       {
        title: 'Notification',
        path: '/push-notifications',
        icon: <Bell size={18} />,
      },
      {
        title: 'Promo Code',
        path: '/promo-code',
        icon: <DollarSign size={18} />,
      },
      {
        title: 'Complaints',
        icon: <HelpCircle size={18} />,
        submenu: true,
        subMenuItems: [
          { title: 'User Complaint', path: '/complaints/user-complaint', icon: <AlertCircle size={16} /> },
          { title: 'Driver Complaint', path: '/complaints/driver-complaint', icon: <AlertCircle size={16} /> },
        ],
      },
      {
        title: 'Reports',
        icon: <FileText size={18} />,
        submenu: true,
        subMenuItems: [
          { title: 'User Report', path: '/reports/user-report', icon: <BarChart size={16} /> },
          { title: 'Driver Report', path: '/reports/driver-report', icon: <BarChart size={16} /> },
          { title: 'Finance Report', path: '/reports/finance-report', icon: <PieChart size={16} /> },
        ],
      },
    ]
  }
];

interface SidebarProps {
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false); // Start collapsed on mobile
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [collapsedOpenMenu, setCollapsedOpenMenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Handle responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false); // Always start collapsed on mobile
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
 
  const toggleSidebar = (): void => {
    setIsOpen(!isOpen);
    setCollapsedOpenMenu(null);
  };

  const toggleSubmenu = (title: string): void => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const toggleCollapsedSubmenu = (title: string): void => {
    if (collapsedOpenMenu === title) {
      setCollapsedOpenMenu(null);
    } else {
      setCollapsedOpenMenu(title);
    }
  };

  const pathname = usePathname();

  const isActiveLink = (path: string | undefined): boolean => {
    if (!path) return false;
    return pathname === path;
  };

  const isActiveParent = (item: MenuItem): boolean => {
    if (item.submenu && item.subMenuItems) {
      return item.subMenuItems.some(subItem => pathname === subItem.path);
    }
    return false;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className="flex">
        {/* Sidebar */}
        <div 
          className={`
            h-screen bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 transition-all duration-300 flex-shrink-0 relative backdrop-blur-sm z-50
            ${isMobile 
              ? `fixed left-0 top-0 ${isOpen ? 'w-72 translate-x-0' : 'w-16 -translate-x-full lg:translate-x-0'}` 
              : `${isOpen ? 'w-72' : 'w-16'}`
            }
          `}
        >
        {/* Header */}
        <div className={`flex h-16 items-center border-b border-slate-200/60 bg-white/80 backdrop-blur-sm ${
          isOpen ? 'justify-between px-4' : 'justify-center px-2'
        }`}>
          {isOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center shadow-sm">
                  <Image src={'/a1.png'} width={20} height={20} alt="" className="w-5"/>
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-semibold text-slate-800 text-sm">Admin Portal</h1>
                  <p className="text-xs text-slate-500">Management Dashboard</p>
                </div>
              </div>
              <button 
                onClick={toggleSidebar} 
                className="p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 group"
              >
                <ChevronLeft size={16} className="text-slate-600 group-hover:text-slate-800" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8  rounded-lg flex items-center justify-center shadow-lg">
                <Image src={'/a1.png'} width={16} height={16} alt="" className="w-4"/>
              </div>
              <button 
                onClick={toggleSidebar} 
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-all duration-200 group"
              >
                <Menu size={14} className="text-slate-600 group-hover:text-slate-800" />
              </button>
            </div>
          )}
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {isOpen ? (
            // Full sidebar content
            <div className="p-3">
              {SIDENAV_ITEMS.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-6">
                  <div className="flex items-center gap-2 px-3 py-2 mb-3">
                    <h2 className="text-xs uppercase text-slate-500 font-semibold tracking-wider">
                      {group.title}
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
                  </div>
                  
                  <ul className="space-y-1">
                    {group.menuList.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        {item.submenu ? (
                          <div>
                            <button 
                              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                              ${isActiveParent(item) 
                                ? 'bg-gradient-to-r from-[#0A8791] to-[#0d9ba8] text-white shadow-md' 
                                : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                              }`}
                              onClick={() => toggleSubmenu(item.title)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg transition-colors ${
                                  isActiveParent(item) 
                                    ? 'bg-white/20' 
                                    : 'bg-slate-100 group-hover:bg-slate-200'
                                }`}>
                                  <span className={`${isActiveParent(item) ? 'text-white' : 'text-slate-600'}`}>
                                    {item.icon}
                                  </span>
                                </div>
                                <span className="font-medium">{item.title}</span>
                              </div>
                              <div className={`transition-transform duration-200 ${openMenus[item.title] ? 'rotate-180' : ''}`}>
                                <ChevronDown size={14} className={isActiveParent(item) ? 'text-white' : 'text-slate-400'} />
                              </div>
                            </button>
                            
                            {openMenus[item.title] && item.subMenuItems && (
                              <ul className="mt-2 ml-6 space-y-1 border-l-2 border-slate-100 pl-4">
                                {item.subMenuItems.map((subItem, subIndex) => (
                                  <li key={subIndex}>
                                    <a 
                                      href={subItem.path}
                                      className={`flex items-center py-2 px-3 rounded-lg text-sm transition-all duration-200 group relative
                                      ${isActiveLink(subItem.path) 
                                        ? 'bg-gradient-to-r from-[#0A8791] to-[#0d9ba8] text-white shadow-sm' 
                                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                                      }`}
                                      onClick={() => isMobile && setIsOpen(false)}
                                    >
                                      <span className={`mr-3 ${isActiveLink(subItem.path) ? 'text-white' : 'text-slate-400'}`}>
                                        {subItem.icon}
                                      </span>
                                      <span className="font-medium">{subItem.title}</span>
                                      {isActiveLink(subItem.path) && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></div>
                                      )}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <a 
                            href={item.path}
                            className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                            ${isActiveLink(item.path) 
                              ? 'bg-gradient-to-r from-[#0A8791] to-[#0d9ba8] text-white shadow-md' 
                              : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                            }`}
                            onClick={() => isMobile && setIsOpen(false)}
                          >
                            <div className={`p-1.5 rounded-lg transition-colors mr-3 ${
                              isActiveLink(item.path) 
                                ? 'bg-white/20' 
                                : 'bg-slate-100 group-hover:bg-slate-200'
                            }`}>
                              <span className={`${isActiveLink(item.path) ? 'text-white' : 'text-slate-600'}`}>
                                {item.icon}
                              </span>
                            </div>
                            <span className="font-medium">{item.title}</span>
                            {isActiveLink(item.path) && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                            )}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            // Collapsed sidebar with icons only
            <div className="py-2">
              {SIDENAV_ITEMS.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-4">
                  {/* Group separator line */}
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-2 mb-3"></div>
                  
                  <div className="px-1 space-y-1">
                    {group.menuList.map((item, itemIndex) => (
                      <div key={itemIndex} className="relative group">
                        {item.submenu ? (
                          <>
                            <button 
                              onClick={() => toggleCollapsedSubmenu(item.title)}
                              className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 relative mx-auto
                              ${isActiveParent(item) 
                                ? 'bg-gradient-to-r from-[#0A8791] to-[#0d9ba8] shadow-md' 
                                : collapsedOpenMenu === item.title 
                                  ? 'bg-slate-100 shadow-sm'
                                  : 'hover:bg-slate-100 hover:shadow-sm'
                              }`}
                              title={item.title}
                            >
                              <span className={`transition-colors ${
                                isActiveParent(item) 
                                  ? 'text-white' 
                                  : 'text-slate-600 group-hover:text-slate-800'
                              }`}>
                                {item.icon}
                              </span>
                              
                              {/* Active indicator */}
                              {isActiveParent(item) && (
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0A8791] rounded-r-full"></div>
                              )}
                              
                              {/* Submenu indicator */}
                              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center transition-all
                                ${isActiveParent(item) || collapsedOpenMenu === item.title
                                  ? 'bg-white shadow-sm' 
                                  : 'bg-slate-200 group-hover:bg-slate-300'
                                }`}>
                                <ChevronRight size={8} className={`transition-transform ${
                                  collapsedOpenMenu === item.title ? 'rotate-90' : ''
                                } ${isActiveParent(item) ? 'text-[#0A8791]' : 'text-slate-500'}`} />
                              </div>
                            </button>
                            
                            {/* Floating submenu - responsive positioning */}
                            {collapsedOpenMenu === item.title && item.subMenuItems && (
                              <div className={`absolute z-[99999] bg-white/95 backdrop-blur-sm shadow-2xl rounded-xl w-64 overflow-hidden border border-slate-200/60
                                ${isMobile 
                                  ? 'left-16 top-0' 
                                  : 'left-full top-0 ml-2'
                                }`}>
                                {/* Submenu header */}
                                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white/80">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-[#0A8791]/10">
                                      <span className="text-[#0A8791] text-sm">{item.icon}</span>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-800 text-sm">{item.title}</span>
                                      <p className="text-xs text-slate-500">Choose an option</p>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Submenu items */}
                                <div className="p-2">
                                  <ul className="space-y-1">
                                    {item.subMenuItems.map((subItem, subIndex) => (
                                      <li key={subIndex}>
                                        <a 
                                          href={subItem.path}
                                          className={`flex items-center py-2.5 px-3 rounded-lg text-sm transition-all duration-200 group
                                          ${isActiveLink(subItem.path) 
                                            ? 'bg-gradient-to-r from-[#0A8791] to-[#0d9ba8] text-white shadow-md' 
                                            : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                                          }`}
                                          onClick={() => isMobile && setIsOpen(false)}
                                        >
                                          <div className={`p-1 rounded-lg mr-3 transition-colors ${
                                            isActiveLink(subItem.path) 
                                              ? 'bg-white/20' 
                                              : 'bg-slate-100 group-hover:bg-slate-200'
                                          }`}>
                                            <span className={`${isActiveLink(subItem.path) ? 'text-white' : 'text-slate-500'}`}>
                                              {subItem.icon}
                                            </span>
                                          </div>
                                          <span className="font-medium">{subItem.title}</span>
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <a 
                            href={item.path}
                            className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 relative mx-auto
                            ${isActiveLink(item.path) 
                              ? 'bg-gradient-to-r from-[#0A8791] to-[#0d9ba8] shadow-md' 
                              : 'hover:bg-slate-100 hover:shadow-sm'
                            }`}
                            title={item.title}
                            onClick={() => isMobile && setIsOpen(false)}
                          >
                            <span className={`transition-colors ${
                              isActiveLink(item.path) 
                                ? 'text-white' 
                                : 'text-slate-600 group-hover:text-slate-800'
                            }`}>
                              {item.icon}
                            </span>
                            
                            {/* Active indicator */}
                            {isActiveLink(item.path) && (
                              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0A8791] rounded-r-full"></div>
                            )}
                          </a>
                        )}
                        
                        {/* Tooltip on hover - hide on mobile */}
                        {!isMobile && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-40">
                            {item.title}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
</>
  )
}

export default Sidebar;