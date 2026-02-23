import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
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

export default function ProjectNew() {
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    project_type: "",
    location: "",
    site_area: "",
    start_date: "",
    end_date: "",
    status: "PLANNING",
  });
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.entities.Project.create({ ...data, owner_id: currentUser?.id, collaborators: [] });
      await base44.entities.AuditLog.create({
        action: "Created Project",
        entity_type: "Project",
        entity_id: result.id,
        project_id: result.id,
      });
      return result;
    },
    onSuccess: (result) => {
      toast.success("Project created successfully");
      navigate(createPageUrl(`ProjectDetail?id=${result.id}`));
    },
    onError: (err) => {
      toast.error("Failed to create project");
    },
  });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Project name is required";
    if (!form.project_type) errs.project_type = "Project type is required";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.site_area || Number(form.site_area) <= 0) errs.site_area = "Site area must be greater than 0";
    if (!form.start_date) errs.start_date = "Start date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({
      ...form,
      site_area: Number(form.site_area),
    });
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={createPageUrl("Projects")}>
          <Button variant="ghost" size="icon" className="rounded-lg">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Project</h1>
          <p className="text-sm text-slate-500">Create a nature-based services project</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                Project Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Oxfordshire Woodland Carbon"
                className={errors.name ? "border-red-300" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the project..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Project Type <span className="text-red-400">*</span>
                </Label>
                <Select value={form.project_type} onValueChange={(v) => updateField("project_type", v)}>
                  <SelectTrigger className={errors.project_type ? "border-red-300" : ""}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_type && <p className="text-xs text-red-500">{errors.project_type}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Status <span className="text-red-400">*</span>
                </Label>
                <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-slate-700">
                  Location <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g., Oxfordshire, UK"
                  className={errors.location ? "border-red-300" : ""}
                />
                {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_area" className="text-sm font-medium text-slate-700">
                  Site Area (hectares) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="site_area"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.site_area}
                  onChange={(e) => updateField("site_area", e.target.value)}
                  placeholder="e.g., 45"
                  className={errors.site_area ? "border-red-300" : ""}
                />
                {errors.site_area && <p className="text-xs text-red-500">{errors.site_area}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-sm font-medium text-slate-700">
                  Start Date <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  className={errors.start_date ? "border-red-300" : ""}
                />
                {errors.start_date && <p className="text-xs text-red-500">{errors.start_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-sm font-medium text-slate-700">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => updateField("end_date", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Link to={createPageUrl("Projects")}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}