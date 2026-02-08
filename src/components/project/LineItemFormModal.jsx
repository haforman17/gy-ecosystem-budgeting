import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const categories = [
  "SITE_PREPARATION", "PLANTING", "FENCING", "MONITORING", "MAINTENANCE",
  "LEGAL", "SURVEYS", "EQUIPMENT", "LABOR", "OVERHEAD", "OTHER",
];

const categoryLabels = {
  SITE_PREPARATION: "Site Preparation", PLANTING: "Planting", FENCING: "Fencing",
  MONITORING: "Monitoring", MAINTENANCE: "Maintenance", LEGAL: "Legal",
  SURVEYS: "Surveys", EQUIPMENT: "Equipment", LABOR: "Labour",
  OVERHEAD: "Overhead", OTHER: "Other",
};

export default function LineItemFormModal({ projectId, item, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    category: item?.category || "",
    description: item?.description || "",
    budget_amount: item?.budget_amount || "",
    date: item?.date || new Date().getFullYear().toString(),
    notes: item?.notes || "",
  });
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LineItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lineItems", projectId] });
      toast.success("Line item added");
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.LineItem.update(item.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lineItems", projectId] });
      toast.success("Line item updated");
      onClose();
    },
  });

  const validate = () => {
    const errs = {};
    if (!form.category) errs.category = "Required";
    if (!form.description.trim()) errs.description = "Required";
    if (!form.budget_amount || Number(form.budget_amount) <= 0) errs.budget_amount = "Must be > 0";
    if (!form.date) errs.date = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      ...form,
      budget_amount: Number(form.budget_amount),
    };
    if (item) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate({ ...data, project_id: projectId });
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Line Item" : "Add Line Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Category *</Label>
            <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
              <SelectTrigger className={errors.category ? "border-red-300" : ""}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{categoryLabels[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Description *</Label>
            <Input
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className={errors.description ? "border-red-300" : ""}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Budget Amount (£) *</Label>
              <Input
                type="number" step="0.01" min="0"
                value={form.budget_amount}
                onChange={(e) => updateField("budget_amount", e.target.value)}
                className={errors.budget_amount ? "border-red-300" : ""}
              />
              {errors.budget_amount && <p className="text-xs text-red-500">{errors.budget_amount}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Year *</Label>
              <Select value={form.date} onValueChange={(v) => updateField("date", v)}>
                <SelectTrigger className={errors.date ? "border-red-300" : ""}>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {item ? "Update Line Item" : "Add Line Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}