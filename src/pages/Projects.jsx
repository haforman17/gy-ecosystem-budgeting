import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { filterAccessibleProjects } from "../components/shared/useProjectAccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, MapPin, Calendar, Ruler, Settings, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { StatusBadge, getLabel } from "../components/shared/StatusBadge";
import { formatCurrency } from "../components/shared/CurrencyFormat";
import EmptyState from "../components/shared/EmptyState";
import LoadingState from "../components/shared/LoadingState";
import { FolderTree } from "lucide-react";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Projects() {
  const [manageMode, setManageMode] = useState(false);
  const [orderedProjects, setOrderedProjects] = useState([]);
  const [deleteProject, setDeleteProject] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: allProjects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  const projects = filterAccessibleProjects(allProjects, currentUser);

  const { data: lineItems = [] } = useQuery({
    queryKey: ["lineItems"],
    queryFn: () => base44.entities.LineItem.list(),
  });

  const { data: budgetCategories = [] } = useQuery({
    queryKey: ["budgetCategories"],
    queryFn: () => base44.entities.BudgetCategory.list(),
  });

  const { data: subItems = [] } = useQuery({
    queryKey: ["subItems"],
    queryFn: () => base44.entities.SubItem.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (projectId) => {
      await base44.entities.Project.delete(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully");
      setDeleteProject(null);
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  React.useEffect(() => {
    if (projects.length > 0 && orderedProjects.length === 0) {
      setOrderedProjects(projects);
    }
  }, [projects]);

  React.useEffect(() => {
    if (!manageMode) {
      setOrderedProjects(projects);
    }
  }, [manageMode, projects]);

  if (isLoading) return <LoadingState message="Loading projects..." />;

  const getProjectBudget = (projectId) => {
    const lineItemsTotal = lineItems
      .filter((li) => li.project_id === projectId)
      .reduce((sum, li) => sum + (Number(li.budget_amount) || 0), 0);
    
    const categoriesTotal = budgetCategories
      .filter((bc) => bc.project_id === projectId)
      .reduce((sum, bc) => sum + (Number(bc.budget_amount) || 0), 0);
    
    const subItemsTotal = subItems
      .filter((si) => {
        const parentLineItem = lineItems.find((li) => li.id === si.line_item_id);
        return parentLineItem?.project_id === projectId;
      })
      .reduce((sum, si) => sum + (Number(si.budget_amount) || 0), 0);
    
    return lineItemsTotal + categoriesTotal + subItemsTotal;
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(orderedProjects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setOrderedProjects(items);
  };

  const displayProjects = manageMode ? orderedProjects : projects;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          {projects.length > 0 && (
            <Button
              variant={manageMode ? "default" : "outline"}
              onClick={() => setManageMode(!manageMode)}
              className={manageMode ? "bg-slate-800 hover:bg-slate-700" : ""}
            >
              {manageMode ? <X className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
              {manageMode ? "Done" : "Manage Projects"}
            </Button>
          )}
          <Link to={createPageUrl("ProjectNew")}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No projects yet"
          description="Create your first project to begin budgeting for nature-based services."
          actionLabel="Create Project"
          onAction={() => window.location.href = createPageUrl("ProjectNew")}
        />
      ) : manageMode ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {displayProjects.map((project, index) => (
                  <Draggable key={project.id} draggableId={project.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? "opacity-50" : ""}`}
                      >
                        <Card className="border-0 shadow-sm h-full">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                  <GripVertical className="h-5 w-5 text-slate-400" />
                                </div>
                                <StatusBadge value={project.status} />
                              </div>
                              <div className="flex gap-1">
                                <Link to={createPageUrl(`ProjectEdit?id=${project.id}`)}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Pencil className="h-4 w-4 text-slate-500" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setDeleteProject(project)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            <h3 className="font-semibold text-slate-800 text-lg mb-2">{project.name}</h3>
                            {project.description && (
                              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description}</p>
                            )}
                            <div className="space-y-2 mt-4">
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <MapPin className="h-3 w-3" />
                                <span>{project.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Ruler className="h-3 w-3" />
                                <span>{project.site_area} hectares</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Calendar className="h-3 w-3" />
                                <span>{project.start_date ? format(new Date(project.start_date), "MMM yyyy") : "—"}</span>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-50">
                              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Budget</p>
                              <p className="text-lg font-bold text-slate-800">{formatCurrency(getProjectBudget(project.id))}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayProjects.map((project) => (
            <Link key={project.id} to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <StatusBadge value={project.status} />
                    <StatusBadge value={project.project_type} />
                  </div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors text-lg mb-2">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description}</p>
                  )}
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Ruler className="h-3 w-3" />
                      <span>{project.site_area} hectares</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>{project.start_date ? format(new Date(project.start_date), "MMM yyyy") : "—"}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Budget</p>
                    <p className="text-lg font-bold text-slate-800">{formatCurrency(getProjectBudget(project.id))}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProject?.name}"? This action cannot be undone and will delete all associated data including budget items, transactions, and reports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteProject.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}