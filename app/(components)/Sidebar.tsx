'use client'
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Home, BarChart2, Settings, GitBranch, MapPin, User, Users, MessageSquare, Bell, HelpCircle, FileText, DollarSign, ChevronLeft, Shield, Sliders, Car, Globe, FileCheck, FileClock, FileX, Clock, FileTerminal, CheckCircle, Clock3, Star, Wallet2, UserCheck, UserX, UserMinus, UserX2, Send, Mail, AlertCircle, BarChart, PieChart } from 'lucide-react';
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
  path?: string; // Made optional since it's not needed for items with submenu
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
        icon: <Home size={20} />,
      },
      {
        title: 'Analytics',
        path: '/analytics',
        icon: <BarChart2 size={20} />,
      }, 
      {
        title: 'Configurations',
        icon: <Settings size={20} />,
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
        icon: <GitBranch size={20} />,
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
        icon: <MapPin size={20} />,
      },
      {
        title: 'Admins',
        path: '/admin',
        icon: <User size={20} />,
      },
      {
        title: 'Pickup Requests',
        icon: <FileText size={20} />,
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
        icon: <Users size={20} />,
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
        icon: <User size={20} />,
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
        icon: <MessageSquare size={20} />,
      },
      {
        title: 'Notification',
        icon: <Bell size={20} />,
        submenu: true,
        subMenuItems: [
          { title: 'Push Notifications', path: '/notification/push-notifications', icon: <Send size={16} /> },
          { title: 'Email Notifications', path: '/notification/email-notifications', icon: <Mail size={16} /> },
        ],
      },
      {
        title: 'Promo Code',
        path: '/promo-code',
        icon: <DollarSign size={20} />,
      },
      {
        title: 'Complaints',
        icon: <HelpCircle size={20} />,
        submenu: true,
        subMenuItems: [
          { title: 'User Complaint', path: '/complaints/user-complaint', icon: <AlertCircle size={16} /> },
          { title: 'Driver Complaint', path: '/complaints/driver-complaint', icon: <AlertCircle size={16} /> },
        ],
      },
      {
        title: 'Reports',
        icon: <FileText size={20} />,
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
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  // To track which submenu is open in collapsed mode
  const [collapsedOpenMenu, setCollapsedOpenMenu] = useState<string | null>(null);
 
  const toggleSidebar = (): void => {
    setIsOpen(!isOpen);
    // Clear any open collapsed submenus when expanding
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
    <div className="flex">
      {/* Sidebar */}
      <div 
        className={`
          h-screen bg-white font-medium shadow-lg transition-all duration-300 flex-shrink-0 relative
          ${isOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="flex h-16 justify-between items-center p-4 border-b border-gray-200">
          {isOpen ? (
            <Image src={'/a1.png'} width={35} height={80} alt="" className="w-12 mx-3.5 min-h-fit"/>
          ) : (
            <span></span>
          )}
          <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-gray-200 focus:outline-none transition-colors">
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          {isOpen ? (
            // Full sidebar content
            SIDENAV_ITEMS.map((group, groupIndex) => (
              <div key={groupIndex} className="mt-4">
                <h2 className="px-4 py-2 text-xs uppercase text-gray-400 font-semibold">
                  {group.title}
                </h2>
                
                <ul>
                  {group.menuList.map((item, itemIndex) => (
                    <li key={itemIndex} className="px-2 py-1">
                      {item.submenu ? (
                        <div>
                          <button 
                            className={`flex items-center justify-between w-full px-4 py-3 hover:bg-[#0A8791] hover:text-white transition-colors rounded-lg
                            ${isActiveParent(item) ? 'bg-[#0A8791] text-white' : ''}`}
                            onClick={() => toggleSubmenu(item.title)}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`${isActiveParent(item) ? 'text-white' : 'text-gray-400'}`}>{item.icon}</span>
                              <span>{item.title}</span>
                            </div>
                            {openMenus[item.title] ? 
                              <ChevronDown size={16} /> : 
                              <ChevronRight size={16} />
                            }
                          </button>
                          
                          {openMenus[item.title] && item.subMenuItems && (
                            <ul className="pl-10 pr-2 py-2">
                              {item.subMenuItems.map((subItem, subIndex) => (
                                <li key={subIndex} className="mb-1">
                                  <a 
                                    href={subItem.path}
                                    className={`flex items-center py-2 px-4 rounded-lg hover:bg-[#0A8791] hover:text-white transition-colors
                                    ${isActiveLink(subItem.path) ? 'bg-[#0A8791] text-white' : ''}`}
                                  >
                                    <span className={`mr-3 ${isActiveLink(subItem.path) ? 'text-white' : 'text-gray-400'}`}>
                                      {subItem.icon}
                                    </span>
                                    <span>{subItem.title}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <a 
                          href={item.path}
                          className={`flex items-center px-4 py-3 hover:bg-[#0A8791] hover:text-white transition-colors gap-3 rounded-lg
                          ${isActiveLink(item.path) ? 'bg-[#0A8791] text-white' : ''}`}
                        >
                          <span className={`${isActiveLink(item.path) ? 'text-white' : 'text-gray-400'}`}>{item.icon}</span>
                          <span>{item.title}</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            // Collapsed sidebar with icons and floating submenus
            SIDENAV_ITEMS.map((group, groupIndex) => (
              <div key={groupIndex} className="mt-4">
                <div className="py-2 border-b border-gray-100 mx-2"></div>
                <ul>
                  {group.menuList.map((item, itemIndex) => (
                    <li key={itemIndex} className="relative px-2 py-1">
                      {item.submenu ? (
                        <div>
                          <button 
                            onClick={() => toggleCollapsedSubmenu(item.title)}
                            className={`flex justify-center w-full py-3 hover:bg-[#0A8791] hover:text-white transition-colors rounded-lg
                            ${isActiveParent(item) || collapsedOpenMenu === item.title ? 'bg-[#0A8791]' : ''}`}
                            title={item.title}
                          >
                            <span className={`${isActiveParent(item) || collapsedOpenMenu === item.title ? 'text-white' : 'text-gray-400'}`}>
                              {item.icon}
                            </span>
                          </button>
                          
                          {/* Floating submenu for collapsed mode */}
                          {collapsedOpenMenu === item.title && item.subMenuItems && (
                            <div className="absolute left-full top-0 z-50 bg-white shadow-lg rounded-lg w-64 mt-1 ml-2 overflow-hidden">
                              <div className="p-3 border-b border-gray-100 font-medium text-gray-700 bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-500">{item.icon}</span>
                                  <span>{item.title}</span>
                                </div>
                              </div>
                              <ul className="p-2">
                                {item.subMenuItems.map((subItem, subIndex) => (
                                  <li key={subIndex} className="mb-1">
                                    <a 
                                      href={subItem.path}
                                      className={`flex items-center py-2 px-4 rounded-lg hover:bg-[#0A8791] hover:text-white transition-colors
                                      ${isActiveLink(subItem.path) ? 'bg-[#0A8791] text-white' : ''}`}
                                    >
                                      <span className={`mr-3 ${isActiveLink(subItem.path) ? 'text-white' : 'text-gray-400'}`}>
                                        {subItem.icon}
                                      </span>
                                      <span>{subItem.title}</span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <a 
                          href={item.path}
                          className={`flex justify-center py-3 hover:bg-[#0A8791] hover:text-white transition-colors rounded-lg
                          ${isActiveLink(item.path) ? 'bg-[#0A8791]' : ''}`}
                          title={item.title}
                        >
                          <span className={`${isActiveLink(item.path) ? 'text-white' : 'text-gray-400'}`}>
                            {item.icon}
                          </span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;