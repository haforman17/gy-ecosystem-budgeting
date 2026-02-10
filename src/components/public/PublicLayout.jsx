import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Leaf } from "lucide-react";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">NBS Budget</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-sm text-slate-500">
            <p>&copy; 2026 NBS Budget. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}