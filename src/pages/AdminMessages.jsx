import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import moment from "moment";

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [response, setResponse] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => base44.entities.ContactMessage.list("-created_date"),
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContactMessage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      setSelectedMessage(null);
      setResponse("");
    },
  });

  const handleSendResponse = async () => {
    if (!selectedMessage || !response.trim()) return;

    const currentUser = await base44.auth.me();

    updateMessageMutation.mutate({
      id: selectedMessage.id,
      data: {
        status: "RESOLVED",
        response: response,
        responded_at: new Date().toISOString(),
        responded_by: currentUser.id,
      },
    });

    console.log("Email would be sent to:", selectedMessage.email);
    console.log("Response:", response);
  };

  const handleMarkResolved = () => {
    if (!selectedMessage) return;

    updateMessageMutation.mutate({
      id: selectedMessage.id,
      data: { status: "RESOLVED" },
    });
  };

  const filteredMessages = messages.filter((msg) =>
    statusFilter === "all" ? true : msg.status === statusFilter
  );

  const newCount = messages.filter((m) => m.status === "NEW").length;

  const getStatusBadge = (status) => {
    const variants = {
      NEW: { variant: "default", className: "bg-red-100 text-red-700" },
      IN_PROGRESS: { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      RESOLVED: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
      ARCHIVED: { variant: "secondary" },
    };
    return variants[status] || { variant: "secondary" };
  };

  return (
    <AdminLayout currentPageName="AdminMessages">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contact Messages</h1>
          {newCount > 0 && (
            <p className="text-sm text-slate-500 mt-1">{newCount} new messages</p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">New Messages</p>
            <p className="text-2xl font-bold text-red-600">{newCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">
              {messages.filter((m) => m.status === "IN_PROGRESS").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Resolved</p>
            <p className="text-2xl font-bold text-green-600">
              {messages.filter((m) => m.status === "RESOLVED").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-1">Resolution Rate</p>
            <p className="text-2xl font-bold text-slate-900">
              {messages.length > 0
                ? Math.round(
                    (messages.filter((m) => m.status === "RESOLVED").length / messages.length) * 100
                  )
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardContent className="p-0">
          {filteredMessages.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No messages</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Message
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((msg) => (
                    <tr
                      key={msg.id}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <td className="py-3 px-4">
                        <Badge {...getStatusBadge(msg.status)}>{msg.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {moment(msg.created_date).format("MMM D")}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{msg.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{msg.email}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {msg.message_type?.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">
                        {msg.message}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMessage(msg);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">From</p>
                  <p className="font-medium">{selectedMessage.name}</p>
                  <p className="text-slate-600">{selectedMessage.email}</p>
                </div>
                <div>
                  <p className="text-slate-500">Type</p>
                  <Badge>{selectedMessage.message_type}</Badge>
                </div>
                <div>
                  <p className="text-slate-500">Date</p>
                  <p className="font-medium">
                    {moment(selectedMessage.created_date).format("MMM D, YYYY [at] h:mm A")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <Badge {...getStatusBadge(selectedMessage.status)}>
                    {selectedMessage.status}
                  </Badge>
                </div>
              </div>

              {selectedMessage.subject && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Subject</p>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-500 mb-1">Message</p>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {selectedMessage.response && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Response Sent</p>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-slate-900 whitespace-pre-wrap">{selectedMessage.response}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Responded {moment(selectedMessage.responded_at).fromNow()}
                  </p>
                </div>
              )}

              {!selectedMessage.response && selectedMessage.status !== "RESOLVED" && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Write Response</p>
                  <Textarea
                    placeholder="Type your response..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={6}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedMessage && !selectedMessage.response && (
              <>
                {response.trim() && (
                  <Button onClick={handleSendResponse} disabled={updateMessageMutation.isPending}>
                    Send Response
                  </Button>
                )}
                <Button variant="outline" onClick={handleMarkResolved}>
                  Mark Resolved
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={() => setSelectedMessage(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}