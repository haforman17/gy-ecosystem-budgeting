import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  Mail,
  Settings,
  Menu,
  Database,
  X,
  ChevronRight,
  ExternalLink,
  LogOut,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { base44 } from "@/api/base44Client";

const adminNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, page: "AdminDashboard" },
  { label: "Organizations", icon: Building2, page: "AdminOrganizations" },
  { label: "Users", icon: Users, page: "AdminUsers" },
  { label: "Project Data", icon: Database, page: "AdminProjectData" },
  { label: "Activity", icon: Activity, page: "AdminActivity" },
  { label: "Messages", icon: Mail, page: "AdminMessages" },
  { label: "Settings", icon: Settings, page: "AdminSettings" },
];

export default function AdminLayout({ children, currentPageName, breadcrumbs }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        // TODO: Re-enable super admin check once you have super admin users
        // if (!currentUser?.is_super_admin) {
        //   navigate(createPageUrl("Dashboard"));
        //   return;
        // }
        
        setUser(currentUser);
      } catch (error) {
        navigate(createPageUrl("Dashboard"));
      }
    };

    checkAdminAccess();
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-slate-800"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-lg font-bold">Great Yellow Admin Portal</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-slate-800">
                <User className="h-4 w-4 mr-2" />
                {user.full_name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm text-slate-500">
                Logged in as: {user.full_name}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(createPageUrl("Dashboard"))}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live App
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => base44.auth.logout()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-[73px] left-0 z-40 h-[calc(100vh-73px)] w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">GY</span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Admin</h2>
                  <p className="text-xs text-slate-500">Control Panel</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {adminNavItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-yellow-50 text-yellow-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-yellow-600" : ""}`} />
                    {item.label}
                    {isActive && <ChevronRight className="h-3 w-3 ml-auto text-yellow-400" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight className="h-4 w-4" />}
                    {crumb.href ? (
                      <Link to={crumb.href} className="hover:text-slate-900">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-slate-900 font-medium">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}