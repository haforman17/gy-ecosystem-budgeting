import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Plus, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText
} from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import ComplianceItemForm from "@/components/compliance/ComplianceItemForm";
import { format, isBefore, isAfter, addDays } from "date-fns";

export default function Compliance() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedProject, setSelectedProject] = useState("all");

  const { data: complianceItems = [], isLoading } = useQuery({
    queryKey: ["complianceItems"],
    queryFn: () => base44.entities.ComplianceItem.list("-due_date"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: fundingSources = [] } = useQuery({
    queryKey: ["fundingSources"],
    queryFn: () => base44.entities.FundingSource.list(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, completed_date }) => 
      base44.entities.ComplianceItem.update(id, { status, completed_date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complianceItems"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.ComplianceItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complianceItems"] });
    },
  });

  const getStatusColor = (status) => {
    const colors = {
      UPCOMING: "bg-blue-100 text-blue-800",
      DUE_SOON: "bg-yellow-100 text-yellow-800",
      OVERDUE: "bg-red-100 text-red-800",
      COMPLETED: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-slate-100 text-slate-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: "bg-slate-100 text-slate-600",
      MEDIUM: "bg-blue-100 text-blue-700",
      HIGH: "bg-orange-100 text-orange-700",
      CRITICAL: "bg-red-100 text-red-700",
    };
    return colors[priority] || "bg-slate-100 text-slate-800";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "OVERDUE":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const calculateStatus = (item) => {
    if (item.status === "COMPLETED") return "COMPLETED";
    const today = new Date();
    const dueDate = new Date(item.due_date);
    const sevenDaysFromNow = addDays(today, 7);
    
    if (isBefore(dueDate, today)) return "OVERDUE";
    if (isBefore(dueDate, sevenDaysFromNow)) return "DUE_SOON";
    return "UPCOMING";
  };

  const filteredItems = complianceItems
    .map(item => ({ ...item, calculatedStatus: calculateStatus(item) }))
    .filter(item => selectedProject === "all" || item.project_id === selectedProject);

  const upcomingItems = filteredItems.filter(item => item.calculatedStatus === "UPCOMING");
  const dueSoonItems = filteredItems.filter(item => item.calculatedStatus === "DUE_SOON");
  const overdueItems = filteredItems.filter(item => item.calculatedStatus === "OVERDUE");
  const completedItems = filteredItems.filter(item => item.calculatedStatus === "COMPLETED");

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleMarkComplete = (item) => {
    updateStatusMutation.mutate({
      id: item.id,
      status: "COMPLETED",
      completed_date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  if (isLoading) {
    return <LoadingState message="Loading compliance items..." />;
  }

  const renderItemCard = (item) => (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(item.calculatedStatus)}
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
            </div>
            <p className="text-sm text-slate-600">{item.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStatusColor(item.calculatedStatus)}>
                {item.calculatedStatus.replace("_", " ")}
              </Badge>
              <Badge className={getPriorityColor(item.priority)}>
                {item.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {item.item_type.replace("_", " ")}
              </Badge>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due: {format(new Date(item.due_date), "MMM d, yyyy")}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Project: {getProjectName(item.project_id)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
              Edit
            </Button>
            {item.calculatedStatus !== "COMPLETED" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleMarkComplete(item)}
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Tracking</h1>
          <p className="text-sm text-slate-500 mt-1">Manage grant reporting, covenants, and regulatory deadlines</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Compliance Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueItems.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Due Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{dueSoonItems.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingItems.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedItems.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overdue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overdue" className="data-[state=active]:text-red-600">
            Overdue ({overdueItems.length})
          </TabsTrigger>
          <TabsTrigger value="due-soon" className="data-[state=active]:text-yellow-600">
            Due Soon ({dueSoonItems.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:text-blue-600">
            Upcoming ({upcomingItems.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:text-green-600">
            Completed ({completedItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="space-y-3">
          {overdueItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">
                No overdue items
              </CardContent>
            </Card>
          ) : (
            overdueItems.map(renderItemCard)
          )}
        </TabsContent>

        <TabsContent value="due-soon" className="space-y-3">
          {dueSoonItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">
                No items due soon
              </CardContent>
            </Card>
          ) : (
            dueSoonItems.map(renderItemCard)
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-3">
          {upcomingItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">
                No upcoming items
              </CardContent>
            </Card>
          ) : (
            upcomingItems.map(renderItemCard)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completedItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">
                No completed items
              </CardContent>
            </Card>
          ) : (
            completedItems.map(renderItemCard)
          )}
        </TabsContent>
      </Tabs>

      {showForm && (
        <ComplianceItemForm
          open={showForm}
          onOpenChange={setShowForm}
          item={editingItem}
          projects={projects}
          fundingSources={fundingSources}
          onSuccess={() => {
            setShowForm(false);
            setEditingItem(null);
            queryClient.invalidateQueries({ queryKey: ["complianceItems"] });
          }}
        />
      )}
    </div>
  );
}