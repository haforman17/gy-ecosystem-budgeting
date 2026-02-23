import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderTree,
  Leaf,
  Menu,
  X,
  ChevronRight,
  LogOut,
  FileText,
  Shield,
  History,
  Settings,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { label: "Projects", icon: FolderTree, page: "Projects" },
  { label: "Reports", icon: FileText, page: "Reports" },
  { label: "Compliance", icon: Shield, page: "Compliance" },
  { label: "Audit Log", icon: History, page: "AuditLog", adminOnly: true },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">NBS Budget</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-sm tracking-tight">NBS Budget</h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Nature Services</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              if (item.adminOnly && user?.role !== "admin") return null;
              
              const isActive = currentPageName === item.page || 
                (item.page === "Projects" && currentPageName?.startsWith("Project")) ||
                (item.page === "Reports" && currentPageName?.startsWith("Report"));
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : ""}`} />
                  {item.label}
                  {isActive && <ChevronRight className="h-3 w-3 ml-auto text-emerald-400" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-3 py-4 border-t border-slate-50">
            <button
              onClick={() => base44.auth.logout()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all w-full"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}