import React from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import moment from "moment";

export default function AdminMessages() {
  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => base44.entities.ContactMessage.list("-created_date"),
  });

  const getStatusBadge = (status) => {
    const variants = {
      NEW: { variant: "default", className: "bg-blue-100 text-blue-700" },
      IN_PROGRESS: { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      RESOLVED: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
      ARCHIVED: { variant: "secondary" },
    };
    return variants[status] || { variant: "secondary" };
  };

  return (
    <AdminLayout currentPageName="AdminMessages">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Contact Messages</h1>
      <Card>
        <CardContent className="p-0">
          {messages.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No messages yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Message
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Received
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{msg.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{msg.email}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {msg.message_type?.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">
                        {msg.message}
                      </td>
                      <td className="py-3 px-4">
                        <Badge {...getStatusBadge(msg.status)}>{msg.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {moment(msg.created_date).fromNow()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}