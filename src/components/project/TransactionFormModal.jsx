import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "../shared/CurrencyFormat";

const txTypes = [
  { value: "EXPENSE", label: "Expense" },
  { value: "REVENUE", label: "Revenue" },
  { value: "FUNDING_DRAWDOWN", label: "Funding Drawdown" },
  { value: "DEBT_REPAYMENT", label: "Debt Repayment" },
];

export default function TransactionFormModal({ projectId, transaction, lineItems, revenueStreams, fundingSources, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    transaction_type: transaction?.transaction_type || "",
    amount: transaction?.amount || "",
    date: transaction?.date || "",
    description: transaction?.description || "",
    line_item_id: transaction?.line_item_id || "",
    revenue_stream_id: transaction?.revenue_stream_id || "",
    funding_source_id: transaction?.funding_source_id || "",
    reference: transaction?.reference || "",
    vintage: transaction?.vintage || "",
    units_quantity: transaction?.units_quantity || "",
    unit_price: transaction?.unit_price || "",
    sale_date: transaction?.sale_date || "",
    receipt_url: transaction?.receipt_url || "",
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const currentYear = new Date().getFullYear();
  const vintageYears = Array.from({ length: 20 }, (_, i) => currentYear - 5 + i);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", projectId] });
      toast.success("Transaction added");
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.update(transaction.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", projectId] });
      toast.success("Transaction updated");
      onClose();
    },
  });

  const validate = () => {
    const errs = {};
    if (!form.transaction_type) errs.transaction_type = "Required";
    if (isRevenue) {
      if (!form.units_quantity || Number(form.units_quantity) <= 0) errs.units_quantity = "Must be > 0";
      if (!form.unit_price || Number(form.unit_price) <= 0) errs.unit_price = "Must be > 0";
      if (!form.sale_date) errs.sale_date = "Required";
    } else {
      if (!form.amount || Number(form.amount) <= 0) errs.amount = "Must be > 0";
      if (!form.date) errs.date = "Required";
    }
    if (!form.description.trim()) errs.description = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateField("receipt_url", file_url);
      toast.success("Receipt uploaded");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      transaction_type: form.transaction_type,
      amount: isRevenue ? calculatedRevenue : Number(form.amount),
      date: isRevenue ? form.sale_date : form.date,
      description: form.description,
      reference: form.reference || undefined,
      receipt_url: form.receipt_url || undefined,
    };
    if (form.line_item_id) data.line_item_id = form.line_item_id;
    if (form.revenue_stream_id) data.revenue_stream_id = form.revenue_stream_id;
    if (form.funding_source_id) data.funding_source_id = form.funding_source_id;
    if (isRevenue) {
      data.vintage = form.vintage || undefined;
      data.units_quantity = Number(form.units_quantity) || undefined;
      data.unit_price = Number(form.unit_price) || undefined;
      data.sale_date = form.sale_date || undefined;
    }
    if (transaction) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate({ ...data, project_id: projectId });
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const isExpense = form.transaction_type === "EXPENSE";
  const isRevenue = form.transaction_type === "REVENUE";
  
  const calculatedRevenue = isRevenue ? (Number(form.units_quantity) || 0) * (Number(form.unit_price) || 0) : 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
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

{isRevenue ? (
            <>
              {revenueStreams.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Link to Ecosystem Service</Label>
                  <Select value={form.revenue_stream_id} onValueChange={(v) => updateField("revenue_stream_id", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ecosystem service" />
                    </SelectTrigger>
                    <SelectContent>
                      {revenueStreams.map((rs) => (
                        <SelectItem key={rs.id} value={rs.id}>
                          {rs.credit_type} - {rs.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm">Vintage</Label>
                <Select value={form.vintage} onValueChange={(v) => updateField("vintage", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {vintageYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Units Quantity *</Label>
                  <Input
                    type="number" step="0.01" min="0"
                    value={form.units_quantity}
                    onChange={(e) => updateField("units_quantity", e.target.value)}
                    className={errors.units_quantity ? "border-red-300" : ""}
                  />
                  {errors.units_quantity && <p className="text-xs text-red-500">{errors.units_quantity}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Unit Price (£) *</Label>
                  <Input
                    type="number" step="0.01" min="0"
                    value={form.unit_price}
                    onChange={(e) => updateField("unit_price", e.target.value)}
                    className={errors.unit_price ? "border-red-300" : ""}
                  />
                  {errors.unit_price && <p className="text-xs text-red-500">{errors.unit_price}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Sale Date *</Label>
                <Input
                  type="date" value={form.sale_date}
                  onChange={(e) => updateField("sale_date", e.target.value)}
                  className={errors.sale_date ? "border-red-300" : ""}
                />
                {errors.sale_date && <p className="text-xs text-red-500">{errors.sale_date}</p>}
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

              {calculatedRevenue > 0 && (
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-emerald-600 font-medium">Revenue</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrency(calculatedRevenue)}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm">Reference</Label>
                <Input value={form.reference} onChange={(e) => updateField("reference", e.target.value)} placeholder="e.g., INV-001" />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm">Receipt / Document</Label>
            {form.receipt_url ? (
              <div className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
                <FileText className="h-4 w-4 text-slate-500" />
                <a
                  href={form.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex-1 truncate"
                >
                  View receipt
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => updateField("receipt_url", "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-slate-500">Upload receipt, invoice, or supporting document (max 10MB)</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {transaction ? "Update Transaction" : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}