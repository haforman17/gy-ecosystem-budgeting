import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function BudgetDiagnostics({ projectId, open, onClose }) {
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["budgetCategories", projectId],
    queryFn: () => base44.entities.BudgetCategory.filter({ project_id: projectId }),
    enabled: !!projectId && open,
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ["lineItems", projectId],
    queryFn: () => base44.entities.LineItem.filter({ project_id: projectId }),
    enabled: !!projectId && open,
  });

  const { data: subItems = [] } = useQuery({
    queryKey: ["subItems", projectId],
    queryFn: () => base44.entities.SubItem.list(),
    enabled: open,
  });

  const deleteItemMutation = useMutation({
    mutationFn: async ({ type, id }) => {
      if (type === "category") {
        await base44.entities.BudgetCategory.delete(id);
      } else if (type === "lineItem") {
        await base44.entities.LineItem.delete(id);
      } else if (type === "subItem") {
        await base44.entities.SubItem.delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetCategories", projectId] });
      queryClient.invalidateQueries({ queryKey: ["lineItems", projectId] });
      queryClient.invalidateQueries({ queryKey: ["subItems", projectId] });
      toast.success("Item deleted");
    },
  });

  // Find problematic items
  const categoriesWithoutTier1 = categories.filter((c) => !c.tier_1_category);
  
  const categoryIds = new Set(categories.map((c) => c.id));
  const orphanedLineItems = lineItems.filter(
    (li) => !li.budget_category_id || !categoryIds.has(li.budget_category_id)
  );
  
  const lineItemIds = new Set(lineItems.map((li) => li.id));
  const orphanedSubItems = subItems.filter(
    (si) => !si.line_item_id || !lineItemIds.has(si.line_item_id)
  );

  const lineItemsWithoutTier1 = lineItems.filter((li) => !li.tier_1_category);
  const subItemsWithoutTier1 = subItems.filter((si) => !si.tier_1_category);

  const hasIssues =
    categoriesWithoutTier1.length > 0 ||
    orphanedLineItems.length > 0 ||
    orphanedSubItems.length > 0 ||
    lineItemsWithoutTier1.length > 0 ||
    subItemsWithoutTier1.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Budget Data Diagnostics</DialogTitle>
        </DialogHeader>

        {!hasIssues ? (
          <Alert className="bg-emerald-50 border-emerald-200">
            <AlertCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              No issues found! All budget items are properly configured.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {categoriesWithoutTier1.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">
                  Categories without Tier 1 ({categoriesWithoutTier1.length})
                </h3>
                <div className="space-y-2">
                  {categoriesWithoutTier1.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">{cat.name}</p>
                        <p className="text-xs text-slate-500">ID: {cat.id}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteItemMutation.mutate({ type: "category", id: cat.id })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {orphanedLineItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">
                  Orphaned Line Items ({orphanedLineItems.length})
                </h3>
                <p className="text-xs text-slate-500 mb-2">
                  These line items reference deleted or invalid categories
                </p>
                <div className="space-y-2">
                  {orphanedLineItems.map((li) => (
                    <div
                      key={li.id}
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">{li.name}</p>
                        <p className="text-xs text-slate-500">
                          Category ID: {li.budget_category_id || "missing"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteItemMutation.mutate({ type: "lineItem", id: li.id })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {orphanedSubItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">
                  Orphaned Sub-Items ({orphanedSubItems.length})
                </h3>
                <p className="text-xs text-slate-500 mb-2">
                  These sub-items reference deleted or invalid line items
                </p>
                <div className="space-y-2">
                  {orphanedSubItems.map((si) => (
                    <div
                      key={si.id}
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">{si.name}</p>
                        <p className="text-xs text-slate-500">
                          Line Item ID: {si.line_item_id || "missing"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteItemMutation.mutate({ type: "subItem", id: si.id })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lineItemsWithoutTier1.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">
                  Line Items without Tier 1 ({lineItemsWithoutTier1.length})
                </h3>
                <div className="space-y-2">
                  {lineItemsWithoutTier1.map((li) => (
                    <div
                      key={li.id}
                      className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">{li.name}</p>
                        <p className="text-xs text-slate-500">ID: {li.id}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteItemMutation.mutate({ type: "lineItem", id: li.id })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subItemsWithoutTier1.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">
                  Sub-Items without Tier 1 ({subItemsWithoutTier1.length})
                </h3>
                <div className="space-y-2">
                  {subItemsWithoutTier1.map((si) => (
                    <div
                      key={si.id}
                      className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">{si.name}</p>
                        <p className="text-xs text-slate-500">ID: {si.id}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteItemMutation.mutate({ type: "subItem", id: si.id })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}