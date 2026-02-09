import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminSettings() {
  return (
    <AdminLayout currentPageName="AdminSettings">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Settings</h1>
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-500">Admin settings coming in Phase 4D Part 2</p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}