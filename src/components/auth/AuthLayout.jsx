import React from "react";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

export default function AuthLayout({ children, rightLink }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50 flex flex-col">
      {/* Header */}
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-md">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight">Great Yellow</h1>
            </div>
          </Link>
          {rightLink && (
            <Link to={rightLink.href} className="text-sm text-slate-600 hover:text-slate-900">
              {rightLink.text}
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}