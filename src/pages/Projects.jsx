import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, MapPin, Calendar, Ruler } from "lucide-react";
import { StatusBadge, getLabel } from "../components/shared/StatusBadge";
import { formatCurrency } from "../components/shared/CurrencyFormat";
import EmptyState from "../components/shared/EmptyState";
import LoadingState from "../components/shared/LoadingState";
import { FolderTree } from "lucide-react";
import { format } from "date-fns";

export default function Projects() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ["lineItems"],
    queryFn: () => base44.entities.LineItem.list(),
  });

  if (isLoading) return <LoadingState message="Loading projects..." />;

  const getProjectBudget = (projectId) =>
    lineItems.filter((li) => li.project_id === projectId).reduce((sum, li) => sum + (li.budget_amount || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Link to={createPageUrl("ProjectNew")}>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No projects yet"
          description="Create your first project to begin budgeting for nature-based services."
          actionLabel="Create Project"
          onAction={() => window.location.href = createPageUrl("ProjectNew")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
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
    </div>
  );
}