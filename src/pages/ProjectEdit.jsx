import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProjectAccess } from "../components/shared/useProjectAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import LoadingState from "../components/shared/LoadingState";
import { toast } from "sonner";

const projectTypes = [
  { value: "WOODLAND_CREATION", label: "Woodland Creation" },
  { value: "PEATLAND_RESTORATION", label: "Peatland Restoration" },
  { value: "WETLAND", label: "Wetland" },
  { value: "AGROFORESTRY", label: "Agroforestry" },
  { value: "MIXED", label: "Mixed" },
];

const statuses = [
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "COMPLETED", label: "Completed" },
];

export default function ProjectEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId,
  });

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name || "",
        description: project.description || "",
        project_type: project.project_type || "",
        location: project.location || "",
        site_area: project.site_area?.toString() || "",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
        status: project.status || "PLANNING",
      });
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.entities.Project.update(projectId, data);
      await base44.entities.AuditLog.create({
        action: "Updated Project",
        entity_type: "Project",
        entity_id: projectId,
        project_id: projectId,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated");
      navigate(createPageUrl(`ProjectDetail?id=${projectId}`));
    },
  });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.project_type) errs.project_type = "Required";
    if (!form.location.trim()) errs.location = "Required";
    if (!form.site_area || Number(form.site_area) <= 0) errs.site_area = "Must be > 0";
    if (!form.start_date) errs.start_date = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateMutation.mutate({ ...form, site_area: Number(form.site_area) });
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const access = useProjectAccess(project, currentUser);

  if (isLoading || !form) return <LoadingState message="Loading project..." />;

  if (project && currentUser && !access.canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied (403)</h2>
        <p className="text-slate-500 text-sm">You do not have permission to edit this project.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={createPageUrl(`ProjectDetail?id=${projectId}`)}>
          <Button variant="ghost" size="icon" className="rounded-lg">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Project</h1>
          <p className="text-sm text-slate-500">{project?.name}</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Project Name *</Label>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} className={errors.name ? "border-red-300" : ""} />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Description</Label>
              <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Project Type *</Label>
                <Select value={form.project_type} onValueChange={(v) => updateField("project_type", v)}>
                  <SelectTrigger className={errors.project_type ? "border-red-300" : ""}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.project_type && <p className="text-xs text-red-500">{errors.project_type}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Status</Label>
                <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Location *</Label>
                <Input value={form.location} onChange={(e) => updateField("location", e.target.value)} className={errors.location ? "border-red-300" : ""} />
                {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Site Area (hectares) *</Label>
                <Input type="number" step="0.01" min="0" value={form.site_area} onChange={(e) => updateField("site_area", e.target.value)} className={errors.site_area ? "border-red-300" : ""} />
                {errors.site_area && <p className="text-xs text-red-500">{errors.site_area}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Start Date *</Label>
                <Input type="date" value={form.start_date} onChange={(e) => updateField("start_date", e.target.value)} className={errors.start_date ? "border-red-300" : ""} />
                {errors.start_date && <p className="text-xs text-red-500">{errors.start_date}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">End Date</Label>
                <Input type="date" value={form.end_date} onChange={(e) => updateField("end_date", e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Link to={createPageUrl(`ProjectDetail?id=${projectId}`)}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}