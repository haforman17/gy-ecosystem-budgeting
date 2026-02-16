import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
    cost_type: transaction?.cost_type || "",
    amount: transaction?.amount || "",
    date: transaction?.date || "",
    description: transaction?.description || "",
    line_item_id: transaction?.line_item_id || "",
    revenue_stream_id: transaction?.revenue_stream_id || "",
    funding_source_id: transaction?.funding_source_id || "",
    reference: transaction?.reference || "",
    tier_1_category: transaction?.tier_1_category || "",
    tier_2_category: transaction?.tier_2_category || "",
    month: transaction?.month || "",
    year: transaction?.year || "",
    units_quantity: transaction?.units_quantity || "",
    unit_price: transaction?.unit_price || "",
    receipt_url: transaction?.receipt_url || "",
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  // Fetch budget data for picklists
  const { data: budgetCategories = [] } = useQuery({
    queryKey: ["budgetCategories", projectId],
    queryFn: () => base44.entities.BudgetCategory.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: budgetLineItems = [] } = useQuery({
    queryKey: ["budgetLineItems", projectId],
    queryFn: () => base44.entities.LineItem.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: budgetSubItems = [] } = useQuery({
    queryKey: ["budgetSubItems"],
    queryFn: () => base44.entities.SubItem.list(),
    enabled: true,
  });

  // Extract unique values from budget data
  const tier1Options = useMemo(() => {
    const all = [...budgetCategories, ...budgetLineItems, ...budgetSubItems];
    const unique = [...new Set(all.map(item => item.tier_1_category).filter(Boolean))];
    return unique.sort();
  }, [budgetCategories, budgetLineItems, budgetSubItems]);

  const tier2Options = useMemo(() => {
    if (!form.tier_1_category) return [];
    const all = [...budgetCategories, ...budgetLineItems, ...budgetSubItems];
    const filtered = all.filter(item => item.tier_1_category === form.tier_1_category);
    const unique = [...new Set(filtered.map(item => item.tier_2_category).filter(Boolean))];
    return unique.sort();
  }, [form.tier_1_category, budgetCategories, budgetLineItems, budgetSubItems]);

  const monthOptions = useMemo(() => {
    const all = [...budgetCategories, ...budgetLineItems, ...budgetSubItems];
    const unique = [...new Set(all.map(item => item.month).filter(Boolean))];
    return unique.sort();
  }, [budgetCategories, budgetLineItems, budgetSubItems]);

  const yearOptions = useMemo(() => {
    const all = [...budgetCategories, ...budgetLineItems, ...budgetSubItems];
    const unique = [...new Set(all.map(item => item.year).filter(Boolean))];
    return unique.sort();
  }, [budgetCategories, budgetLineItems, budgetSubItems]);

  const ecosystemServiceOptions = useMemo(() => {
    const unique = [...new Set(revenueStreams.map(rs => rs.credit_type).filter(Boolean))];
    return unique;
  }, [revenueStreams]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.entities.Transaction.create(data);
      await base44.entities.AuditLog.create({
        action: "Created Transaction",
        entity_type: "Transaction",
        entity_id: result.id,
        project_id: projectId,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", projectId] });
      toast.success("Transaction added");
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.entities.Transaction.update(transaction.id, data);
      await base44.entities.AuditLog.create({
        action: "Updated Transaction",
        entity_type: "Transaction",
        entity_id: transaction.id,
        project_id: projectId,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", projectId] });
      toast.success("Transaction updated");
      onClose();
    },
  });

  const validate = () => {
    const errs = {};
    if (!form.transaction_type) errs.transaction_type = "Required";
    if (isExpense && !form.cost_type) errs.cost_type = "Required for expenses";
    if (!form.amount || Number(form.amount) <= 0) errs.amount = "Must be > 0";
    if (!form.date) errs.date = "Required";
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
      amount: Number(form.amount),
      date: form.date,
      description: form.description,
      reference: form.reference || undefined,
      receipt_url: form.receipt_url || undefined,
    };
    if (form.revenue_stream_id) data.revenue_stream_id = form.revenue_stream_id;
    if (form.funding_source_id) data.funding_source_id = form.funding_source_id;
    if (isExpense) {
      if (form.cost_type) data.cost_type = form.cost_type;
      if (form.tier_1_category) data.tier_1_category = form.tier_1_category;
      if (form.tier_2_category) data.tier_2_category = form.tier_2_category;
      if (form.month) data.month = form.month;
      if (form.year) data.year = form.year;
    }
    if (isRevenue) {
      if (form.units_quantity) data.units_quantity = Number(form.units_quantity);
      if (form.unit_price) data.unit_price = Number(form.unit_price);
    }
    if (transaction) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate({ ...data, project_id: projectId });
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset tier_2 when tier_1 changes
      if (field === "tier_1_category" && value !== prev.tier_1_category) {
        updated.tier_2_category = "";
      }
      // Auto-calculate amount for revenue when units or price changes
      if (updated.transaction_type === "REVENUE" && (field === "units_quantity" || field === "unit_price")) {
        const units = field === "units_quantity" ? Number(value) : Number(updated.units_quantity);
        const price = field === "unit_price" ? Number(value) : Number(updated.unit_price);
        updated.amount = (units || 0) * (price || 0);
      }
      return updated;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const isExpense = form.transaction_type === "EXPENSE";
  const isRevenue = form.transaction_type === "REVENUE";
  const isFundingDrawdown = form.transaction_type === "FUNDING_DRAWDOWN";

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

{isExpense ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm">Cost Type *</Label>
                <Select value={form.cost_type} onValueChange={(v) => updateField("cost_type", v)}>
                  <SelectTrigger className={errors.cost_type ? "border-red-300" : ""}>
                    <SelectValue placeholder="Select cost type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OP_COSTS">Operating Costs</SelectItem>
                    <SelectItem value="COGS">Cost of Goods Sold</SelectItem>
                  </SelectContent>
                </Select>
                {errors.cost_type && <p className="text-xs text-red-500">{errors.cost_type}</p>}
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

              {tier1Options.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Tier 1</Label>
                  <Select value={form.tier_1_category} onValueChange={(v) => updateField("tier_1_category", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {tier1Options.map((t1) => (
                        <SelectItem key={t1} value={t1}>{t1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {tier2Options.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Tier 2</Label>
                  <Select value={form.tier_2_category} onValueChange={(v) => updateField("tier_2_category", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {tier2Options.map((t2) => (
                        <SelectItem key={t2} value={t2}>{t2}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {monthOptions.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Month</Label>
                  <Select value={form.month} onValueChange={(v) => updateField("month", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {yearOptions.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Year</Label>
                  <Select value={form.year} onValueChange={(v) => updateField("year", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm">Description *</Label>
                <Input
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={errors.description ? "border-red-300" : ""}
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>

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

              {fundingSources.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Funding Source</Label>
                  <Select value={form.funding_source_id} onValueChange={(v) => updateField("funding_source_id", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding source" />
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
          ) : isRevenue ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm">Date *</Label>
                <Input
                  type="date" value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className={errors.date ? "border-red-300" : ""}
                />
                {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
              </div>

              {ecosystemServiceOptions.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Ecosystem Service</Label>
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
                  <Label className="text-sm">Number of Units</Label>
                  <Input
                    type="number" step="0.01" min="0"
                    value={form.units_quantity}
                    onChange={(e) => updateField("units_quantity", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Price per Unit (£)</Label>
                  <Input
                    type="number" step="0.01" min="0"
                    value={form.unit_price}
                    onChange={(e) => updateField("unit_price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Amount (£) *</Label>
                <Input
                  type="number" step="0.01" min="0"
                  value={form.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  className={errors.amount ? "border-red-300" : ""}
                  disabled={form.units_quantity && form.unit_price}
                  title={form.units_quantity && form.unit_price ? "Calculated from units × price" : "Enter amount or provide units & price"}
                />
                {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                {form.units_quantity && form.unit_price && (
                  <p className="text-xs text-slate-500">
                    {Number(form.units_quantity).toLocaleString()} × {formatCurrency(form.unit_price)} = {formatCurrency(form.amount)}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Reference</Label>
                <Input value={form.reference} onChange={(e) => updateField("reference", e.target.value)} placeholder="e.g., INV-001" />
              </div>
            </>
          ) : isFundingDrawdown ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm">Date *</Label>
                <Input
                  type="date" value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className={errors.date ? "border-red-300" : ""}
                />
                {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
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

              {fundingSources.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Funding Source</Label>
                  <Select value={form.funding_source_id} onValueChange={(v) => updateField("funding_source_id", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding source" />
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