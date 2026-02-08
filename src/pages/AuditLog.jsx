import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Search,
  User,
  FileText,
  Calendar,
  Filter
} from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import { format } from "date-fns";

export default function AuditLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEntity, setFilterEntity] = useState("all");
  const [filterAction, setFilterAction] = useState("all");

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 200),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const isAdmin = user?.role === "admin";

  const getActionColor = (action) => {
    if (action.includes("Created")) return "bg-green-100 text-green-800";
    if (action.includes("Updated")) return "bg-blue-100 text-blue-800";
    if (action.includes("Deleted")) return "bg-red-100 text-red-800";
    return "bg-slate-100 text-slate-800";
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntity = filterEntity === "all" || log.entity_type === filterEntity;
    const matchesAction = filterAction === "all" || log.action.includes(filterAction);

    return matchesSearch && matchesEntity && matchesAction;
  });

  const entityTypes = [...new Set(auditLogs.map(log => log.entity_type))];

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Admin Access Required</h3>
            <p className="text-sm text-slate-500">
              You need administrator privileges to view the audit log.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message="Loading audit log..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
        <p className="text-sm text-slate-500 mt-1">Track all system actions and changes</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search actions, entities, or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {entityTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="Created">Created</SelectItem>
            <SelectItem value="Updated">Updated</SelectItem>
            <SelectItem value="Deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p>No audit logs found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {log.entity_type}
                          </Badge>
                          {log.project_id && (
                            <span className="text-xs text-slate-500">
                              {getProjectName(log.project_id)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          <span className="font-medium">{log.user_id || "System"}</span>
                          {log.entity_id && (
                            <span className="text-slate-400"> • ID: {log.entity_id.slice(0, 8)}</span>
                          )}
                        </p>
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div className="mt-2 text-xs bg-slate-50 p-2 rounded">
                            <p className="font-medium text-slate-700 mb-1">Changes:</p>
                            <pre className="text-slate-600 overflow-x-auto">
                              {JSON.stringify(log.changes, null, 2)}
                            </pre>
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(log.created_date), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          {log.ip_address && (
                            <span>IP: {log.ip_address}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}