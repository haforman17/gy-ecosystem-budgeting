import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const fundingTypes = [
  { value: "GRANT", label: "Grant" },
  { value: "PRIVATE_DEBT", label: "Private Debt" },
  { value: "GOVERNMENT_DEBT", label: "Government Debt" },
  { value: "EQUITY", label: "Equity" },
];

const grantCategories = [
  "SITE_PREPARATION", "PLANTING", "FENCING", "MONITORING", "MAINTENANCE",
  "LEGAL", "SURVEYS", "EQUIPMENT", "LABOR", "OVERHEAD",
];

const categoryLabels = {
  SITE_PREPARATION: "Site Preparation", PLANTING: "Planting", FENCING: "Fencing",
  MONITORING: "Monitoring", MAINTENANCE: "Maintenance", LEGAL: "Legal",
  SURVEYS: "Surveys", EQUIPMENT: "Equipment", LABOR: "Labour", OVERHEAD: "Overhead",
};

export default function FundingFormModal({ projectId, item, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    funding_type: item?.funding_type || "",
    funder_name: item?.funder_name || "",
    total_amount: item?.total_amount || "",
    drawn_amount: item?.drawn_amount || "",
    interest_rate: item?.interest_rate || "",
    repayment_term_months: item?.repayment_term_months || "",
    start_date: item?.start_date || "",
    end_date: item?.end_date || "",
    status: item?.status || "PENDING",
    terms: item?.terms || "",
    eligible_categories: item?.eligible_categories || [],
  });
  const [errors, setErrors] = useState({});

  const isDebt = form.funding_type === "PRIVATE_DEBT" || form.funding_type === "GOVERNMENT_DEBT";
  const isGrant = form.funding_type === "GRANT";

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FundingSource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fundingSources", projectId] });
      toast.success("Funding source added");
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.FundingSource.update(item.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fundingSources", projectId] });
      toast.success("Funding source updated");
      onClose();
    },
  });

  const validate = () => {
    const errs = {};
    if (!form.funding_type) errs.funding_type = "Required";
    if (!form.funder_name.trim()) errs.funder_name = "Required";
    if (!form.total_amount || Number(form.total_amount) <= 0) errs.total_amount = "Must be > 0";
    if (!form.start_date) errs.start_date = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      funding_type: form.funding_type,
      funder_name: form.funder_name,
      total_amount: Number(form.total_amount),
      drawn_amount: Number(form.drawn_amount) || 0,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
      terms: form.terms || undefined,
      status: form.status,
    };
    if (isDebt) {
      data.interest_rate = form.interest_rate ? Number(form.interest_rate) : undefined;
      data.repayment_term_months = form.repayment_term_months ? Number(form.repayment_term_months) : undefined;
    }
    if (isGrant && form.eligible_categories.length > 0) {
      data.eligible_categories = form.eligible_categories;
    }
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

  const toggleCategory = (cat) => {
    setForm((prev) => ({
      ...prev,
      eligible_categories: prev.eligible_categories.includes(cat)
        ? prev.eligible_categories.filter((c) => c !== cat)
        : [...prev.eligible_categories, cat],
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Funding Source" : "Add Funding Source"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Funding Type *</Label>
            <Select value={form.funding_type} onValueChange={(v) => updateField("funding_type", v)}>
              <SelectTrigger className={errors.funding_type ? "border-red-300" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {fundingTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.funding_type && <p className="text-xs text-red-500">{errors.funding_type}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Funder Name *</Label>
            <Input
              value={form.funder_name}
              onChange={(e) => updateField("funder_name", e.target.value)}
              className={errors.funder_name ? "border-red-300" : ""}
            />
            {errors.funder_name && <p className="text-xs text-red-500">{errors.funder_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Total Amount (£) *</Label>
              <Input
                type="number" step="0.01" min="0"
                value={form.total_amount}
                onChange={(e) => updateField("total_amount", e.target.value)}
                className={errors.total_amount ? "border-red-300" : ""}
              />
              {errors.total_amount && <p className="text-xs text-red-500">{errors.total_amount}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Drawn Amount (£)</Label>
              <Input
                type="number" step="0.01" min="0"
                value={form.drawn_amount}
                onChange={(e) => updateField("drawn_amount", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Start Date *</Label>
              <Input
                type="date" value={form.start_date}
                onChange={(e) => updateField("start_date", e.target.value)}
                className={errors.start_date ? "border-red-300" : ""}
              />
              {errors.start_date && <p className="text-xs text-red-500">{errors.start_date}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">End Date</Label>
              <Input type="date" value={form.end_date} onChange={(e) => updateField("end_date", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Status</Label>
            <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DRAWN">Drawn</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isDebt && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Interest Rate (%)</Label>
                <Input
                  type="number" step="0.01" min="0"
                  value={form.interest_rate}
                  onChange={(e) => updateField("interest_rate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Repayment Term (months)</Label>
                <Input
                  type="number" min="1"
                  value={form.repayment_term_months}
                  onChange={(e) => updateField("repayment_term_months", e.target.value)}
                />
              </div>
            </div>
          )}

          {isGrant && (
            <div className="space-y-2">
              <Label className="text-sm">Eligible Categories</Label>
              <div className="grid grid-cols-2 gap-2">
                {grantCategories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <Checkbox
                      checked={form.eligible_categories.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    {categoryLabels[cat]}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm">Terms</Label>
            <Textarea value={form.terms} onChange={(e) => updateField("terms", e.target.value)} rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {item ? "Update Funding Source" : "Add Funding Source"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}