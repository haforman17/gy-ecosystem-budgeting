import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Button } from "@/components/ui/button";
import { StatusBadge, getLabel } from "../shared/StatusBadge";
import { ArrowLeft, MapPin, Calendar as CalendarIcon, Ruler, Pencil, Trash2, FileText, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function ProjectHeader({ project, onEdit, onDelete, onFinancials, onForecast }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to={createPageUrl("Projects")}>
          <Button variant="ghost" size="icon" className="rounded-lg">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <StatusBadge value={project.status} />
                <StatusBadge value={project.project_type} />
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3 w-3" /> {project.location}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Ruler className="h-3 w-3" /> {project.site_area} ha
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <CalendarIcon className="h-3 w-3" />
                  {project.start_date ? format(new Date(project.start_date), "MMM yyyy") : "—"}
                  {project.end_date && ` – ${format(new Date(project.end_date), "MMM yyyy")}`}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {onFinancials && (
                <Button variant="outline" size="sm" onClick={onFinancials}>
                  <FileText className="h-3.5 w-3.5 mr-1.5" /> Financials
                </Button>
              )}
              {onForecast && (
                <Button variant="outline" size="sm" onClick={onForecast}>
                  <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Forecast
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
      {project.description && (
        <p className="text-sm text-slate-500 ml-12">{project.description}</p>
      )}
    </div>
  );
}