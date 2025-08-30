import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Folder, 
  Users, 
  FileText, 
  Archive, 
  Settings, 
  LogOut,
  Menu,
  User
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { AuthService } from '@/lib/auth';
import { Button } from '@/components/ui/button';

const adminMenuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Cases', url: '/cases', icon: Folder },
  { title: 'Victims', url: '/victims', icon: Users },
  { title: 'Suspects', url: '/suspects', icon: User },
  { title: 'Evidence', url: '/evidence', icon: FileText },
  { title: 'Reports', url: '/reports', icon: Archive },
  { title: 'Users', url: '/users', icon: User },
  { title: 'Audit Logs', url: '/audit', icon: Shield },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const currentUser = AuthService.getCurrentUser();
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/';
  };

  return (
    <Sidebar 
      className={`${collapsed ? 'w-14' : 'w-64'} border-r border-sidebar-border bg-sidebar transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-orbitron font-bold text-lg text-sidebar-foreground">CIM</h2>
                <p className="text-sm text-sidebar-foreground/60">Investigation Manager</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {currentUser && (
          <div className="px-6 pb-4">
            <div className={`flex items-center space-x-3 p-3 rounded-lg bg-sidebar-accent/50 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-semibold">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 capitalize">
                    {currentUser.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>}
          
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.url)
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <div className="mt-auto p-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            size={collapsed ? "sm" : "default"}
            className={`w-full ${collapsed ? 'px-2' : 'justify-start'} border-sidebar-border hover:bg-destructive hover:text-destructive-foreground transition-colors`}
          >
            <LogOut className={`w-4 h-4 ${collapsed ? '' : 'mr-2'}`} />
            {!collapsed && 'Logout'}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}