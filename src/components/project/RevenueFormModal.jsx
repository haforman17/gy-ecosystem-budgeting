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
import { formatCurrency } from "../shared/CurrencyFormat";
import { toast } from "sonner";

const creditTypes = [
  { value: "CARBON", label: "Carbon" },
  { value: "BNG_HABITAT", label: "BNG Habitat" },
  { value: "BNG_HEDGEROW", label: "BNG Hedgerow" },
  { value: "WATERCOURSE", label: "Watercourse" },
  { value: "NFM", label: "Natural Flood Management" },
];

export default function RevenueFormModal({ projectId, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    credit_type: "", description: "", estimated_volume: "", price_per_unit: "",
    generation_start_date: "", vintage: "", notes: "",
  });
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RevenueStream.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenueStreams", projectId] });
      toast.success("Revenue stream added");
      onClose();
    },
  });

  const validate = () => {
    const errs = {};
    if (!form.credit_type) errs.credit_type = "Required";
    if (!form.description.trim()) errs.description = "Required";
    if (!form.estimated_volume || Number(form.estimated_volume) <= 0) errs.estimated_volume = "Must be > 0";
    if (!form.price_per_unit || Number(form.price_per_unit) <= 0) errs.price_per_unit = "Must be > 0";
    if (!form.generation_start_date) errs.generation_start_date = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const vol = Number(form.estimated_volume);
    const price = Number(form.price_per_unit);
    createMutation.mutate({
      ...form,
      project_id: projectId,
      estimated_volume: vol,
      price_per_unit: price,
      estimated_revenue: vol * price,
      verified_volume: 0,
      sold_volume: 0,
      actual_revenue: 0,
      verification_status: "PENDING",
    });
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const estimatedRevenue = (Number(form.estimated_volume) || 0) * (Number(form.price_per_unit) || 0);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Revenue Stream</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Credit Type *</Label>
            <Select value={form.credit_type} onValueChange={(v) => updateField("credit_type", v)}>
              <SelectTrigger className={errors.credit_type ? "border-red-300" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {creditTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.credit_type && <p className="text-xs text-red-500">{errors.credit_type}</p>}
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
              <Label className="text-sm">Estimated Volume *</Label>
              <Input
                type="number" step="0.01" min="0"
                value={form.estimated_volume}
                onChange={(e) => updateField("estimated_volume", e.target.value)}
                className={errors.estimated_volume ? "border-red-300" : ""}
              />
              {errors.estimated_volume && <p className="text-xs text-red-500">{errors.estimated_volume}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Price Per Unit (£) *</Label>
              <Input
                type="number" step="0.01" min="0"
                value={form.price_per_unit}
                onChange={(e) => updateField("price_per_unit", e.target.value)}
                className={errors.price_per_unit ? "border-red-300" : ""}
              />
              {errors.price_per_unit && <p className="text-xs text-red-500">{errors.price_per_unit}</p>}
            </div>
          </div>

          {estimatedRevenue > 0 && (
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-xs text-emerald-600 font-medium">Estimated Revenue</p>
              <p className="text-lg font-bold text-emerald-700">{formatCurrency(estimatedRevenue)}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Generation Start *</Label>
              <Input
                type="date" value={form.generation_start_date}
                onChange={(e) => updateField("generation_start_date", e.target.value)}
                className={errors.generation_start_date ? "border-red-300" : ""}
              />
              {errors.generation_start_date && <p className="text-xs text-red-500">{errors.generation_start_date}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Vintage</Label>
              <Input
                value={form.vintage}
                onChange={(e) => updateField("vintage", e.target.value)}
                placeholder="e.g. 2025"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Revenue Stream
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}