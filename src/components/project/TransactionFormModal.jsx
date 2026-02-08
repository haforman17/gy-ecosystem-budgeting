import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const txTypes = [
  { value: "EXPENSE", label: "Expense" },
  { value: "REVENUE", label: "Revenue" },
  { value: "FUNDING_DRAWDOWN", label: "Funding Drawdown" },
  { value: "DEBT_REPAYMENT", label: "Debt Repayment" },
];

export default function TransactionFormModal({ projectId, lineItems, revenueStreams, fundingSources, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    transaction_type: "", amount: "", date: "", description: "",
    line_item_id: "", revenue_stream_id: "", funding_source_id: "", reference: "",
  });
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", projectId] });
      toast.success("Transaction added");
      onClose();
    },
  });

  const validate = () => {
    const errs = {};
    if (!form.transaction_type) errs.transaction_type = "Required";
    if (!form.amount || Number(form.amount) <= 0) errs.amount = "Must be > 0";
    if (!form.date) errs.date = "Required";
    if (!form.description.trim()) errs.description = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      project_id: projectId,
      transaction_type: form.transaction_type,
      amount: Number(form.amount),
      date: form.date,
      description: form.description,
      reference: form.reference || undefined,
    };
    if (form.line_item_id) data.line_item_id = form.line_item_id;
    if (form.revenue_stream_id) data.revenue_stream_id = form.revenue_stream_id;
    if (form.funding_source_id) data.funding_source_id = form.funding_source_id;
    createMutation.mutate(data);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const isExpense = form.transaction_type === "EXPENSE";
  const isRevenue = form.transaction_type === "REVENUE";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Transaction Type *</Label>
            <Select value={form.transaction_type} onValueChange={(v) => updateField("transaction_type", v)}>
              <SelectTrigger className={errors.transaction_type ? "border-red-300" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {txTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.transaction_type && <p className="text-xs text-red-500">{errors.transaction_type}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Amount (£) *</Label>
              <Input
                type="number" step="0.01" min="0"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                className={errors.amount ? "border-red-300" : ""}
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Date *</Label>
              <Input
                type="date" value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                className={errors.date ? "border-red-300" : ""}
              />
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>
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

          {isExpense && lineItems.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm">Link to Line Item</Label>
              <Select value={form.line_item_id} onValueChange={(v) => updateField("line_item_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {lineItems.map((li) => (
                    <SelectItem key={li.id} value={li.id}>{li.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isRevenue && revenueStreams.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm">Link to Revenue Stream</Label>
              <Select value={form.revenue_stream_id} onValueChange={(v) => updateField("revenue_stream_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {revenueStreams.map((rs) => (
                    <SelectItem key={rs.id} value={rs.id}>{rs.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {fundingSources.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm">Funding Source</Label>
              <Select value={form.funding_source_id} onValueChange={(v) => updateField("funding_source_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {fundingSources.map((fs) => (
                    <SelectItem key={fs.id} value={fs.id}>{fs.funder_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm">Reference</Label>
            <Input value={form.reference} onChange={(e) => updateField("reference", e.target.value)} placeholder="e.g., INV-001" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}