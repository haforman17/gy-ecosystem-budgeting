import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import BudgetCategoryForm from "./BudgetCategoryForm";
import BudgetLineItemForm from "./BudgetLineItemForm";
import BudgetSubItemForm from "./BudgetSubItemForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function BudgetBuilderTab({ projectId }) {
  const queryClient = useQueryClient();
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedLineItems, setExpandedLineItems] = useState({});
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showLineItemForm, setShowLineItemForm] = useState(false);
  const [showSubItemForm, setShowSubItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedLineItemId, setSelectedLineItemId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, item: null });

  const { data: categories = [] } = useQuery({
    queryKey: ["budgetCategories", projectId],
    queryFn: () => base44.entities.BudgetCategory.filter({ project_id: projectId }, "sort_order"),
    enabled: !!projectId,
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ["budgetLineItems", projectId],
    queryFn: () => base44.entities.BudgetLineItem.filter({ project_id: projectId }, "sort_order"),
    enabled: !!projectId,
  });

  const { data: subItems = [] } = useQuery({
    queryKey: ["budgetSubItems", projectId],
    queryFn: () => base44.entities.BudgetSubItem.filter({ project_id: projectId }, "sort_order"),
    enabled: !!projectId,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId) => {
      const categoryLineItems = lineItems.filter((li) => li.category_id === categoryId);
      const lineItemIds = categoryLineItems.map((li) => li.id);
      const categorySubItems = subItems.filter((si) => lineItemIds.includes(si.line_item_id));
      
      await Promise.all(categorySubItems.map((si) => base44.entities.BudgetSubItem.delete(si.id)));
      await Promise.all(categoryLineItems.map((li) => base44.entities.BudgetLineItem.delete(li.id)));
      await base44.entities.BudgetCategory.delete(categoryId);
    },
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["budgetCategories"] });
      queryClient.invalidateQueries({ queryKey: ["budgetLineItems"] });
      queryClient.invalidateQueries({ queryKey: ["budgetSubItems"] });
    },
  });

  const deleteLineItemMutation = useMutation({
    mutationFn: async (lineItemId) => {
      const lineItemSubItems = subItems.filter((si) => si.line_item_id === lineItemId);
      await Promise.all(lineItemSubItems.map((si) => base44.entities.BudgetSubItem.delete(si.id)));
      await base44.entities.BudgetLineItem.delete(lineItemId);
    },
    onSuccess: () => {
      toast.success("Line item deleted");
      queryClient.invalidateQueries({ queryKey: ["budgetLineItems"] });
      queryClient.invalidateQueries({ queryKey: ["budgetSubItems"] });
    },
  });

  const deleteSubItemMutation = useMutation({
    mutationFn: (subItemId) => base44.entities.BudgetSubItem.delete(subItemId),
    onSuccess: () => {
      toast.success("Sub-item deleted");
      queryClient.invalidateQueries({ queryKey: ["budgetSubItems"] });
    },
  });

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const toggleLineItem = (lineItemId) => {
    setExpandedLineItems((prev) => ({ ...prev, [lineItemId]: !prev[lineItemId] }));
  };

  const getCategoryLineItems = (categoryId) => {
    return lineItems.filter((li) => li.category_id === categoryId);
  };

  const getLineItemSubItems = (lineItemId) => {
    return subItems.filter((si) => si.line_item_id === lineItemId);
  };

  const getCategoryTotal = (categoryId) => {
    const categoryLineItems = getCategoryLineItems(categoryId);
    return categoryLineItems.reduce((sum, li) => {
      const lineItemSubItems = getLineItemSubItems(li.id);
      const subItemsTotal = lineItemSubItems.reduce((s, si) => s + (si.budget_amount || 0), 0);
      return sum + (li.budget_amount || 0) + subItemsTotal;
    }, 0);
  };

  const getLineItemTotal = (lineItemId) => {
    const lineItemSubItems = getLineItemSubItems(lineItemId);
    const lineItem = lineItems.find((li) => li.id === lineItemId);
    const subItemsTotal = lineItemSubItems.reduce((s, si) => s + (si.budget_amount || 0), 0);
    return (lineItem?.budget_amount || 0) + subItemsTotal;
  };

  const handleAddCategory = () => {
    setEditingItem(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingItem(category);
    setShowCategoryForm(true);
  };

  const handleAddLineItem = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setEditingItem(null);
    setShowLineItemForm(true);
  };

  const handleEditLineItem = (lineItem) => {
    setSelectedCategoryId(lineItem.category_id);
    setEditingItem(lineItem);
    setShowLineItemForm(true);
  };

  const handleAddSubItem = (lineItemId) => {
    setSelectedLineItemId(lineItemId);
    setEditingItem(null);
    setShowSubItemForm(true);
  };

  const handleEditSubItem = (subItem) => {
    setSelectedLineItemId(subItem.line_item_id);
    setEditingItem(subItem);
    setShowSubItemForm(true);
  };

  const handleDelete = (type, item) => {
    setDeleteDialog({ open: true, type, item });
  };

  const confirmDelete = async () => {
    const { type, item } = deleteDialog;
    try {
      if (type === "category") {
        await deleteCategoryMutation.mutateAsync(item.id);
      } else if (type === "lineItem") {
        await deleteLineItemMutation.mutateAsync(item.id);
      } else if (type === "subItem") {
        await deleteSubItemMutation.mutateAsync(item.id);
      }
    } catch (error) {
      toast.error("Failed to delete: " + error.message);
    } finally {
      setDeleteDialog({ open: false, type: null, item: null });
    }
  };

  const grandTotal = categories.reduce((sum, cat) => sum + getCategoryTotal(cat.id), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Budget Builder</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Build your budget with categories, line items, and sub-items
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-slate-500">Total Budget</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(grandTotal)}</p>
              </div>
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No budget categories yet. Click "Add Category" to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => {
                const categoryLineItems = getCategoryLineItems(category.id);
                const isExpanded = expandedCategories[category.id];
                const total = getCategoryTotal(category.id);

                return (
                  <div key={category.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    {/* Category Level */}
                    <div className="bg-slate-50 p-4 flex items-center justify-between hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-slate-500">{category.description}</p>
                          )}
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm text-slate-500">Category Total</p>
                          <p className="font-semibold text-slate-900">{formatCurrency(total)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete("category", category);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Line Items */}
                    {isExpanded && (
                      <div className="bg-white">
                        {categoryLineItems.length === 0 ? (
                          <div className="p-4 text-center text-slate-500 text-sm">
                            No line items yet.{" "}
                            <button
                              onClick={() => handleAddLineItem(category.id)}
                              className="text-emerald-600 hover:underline"
                            >
                              Add one now
                            </button>
                          </div>
                        ) : (
                          categoryLineItems.map((lineItem) => {
                            const lineItemSubItems = getLineItemSubItems(lineItem.id);
                            const isLineItemExpanded = expandedLineItems[lineItem.id];
                            const lineItemTotal = getLineItemTotal(lineItem.id);

                            return (
                              <div key={lineItem.id} className="border-t border-slate-100">
                                {/* Line Item Level */}
                                <div className="p-4 pl-12 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-3 flex-1">
                                    <button
                                      onClick={() => toggleLineItem(lineItem.id)}
                                      className="text-slate-500 hover:text-slate-700"
                                    >
                                      {isLineItemExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </button>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-slate-800">{lineItem.name}</h4>
                                      {lineItem.description && (
                                        <p className="text-sm text-slate-500">{lineItem.description}</p>
                                      )}
                                    </div>
                                    <div className="text-right mr-4">
                                      <p className="text-xs text-slate-500">Line Total</p>
                                      <p className="font-medium text-slate-800">
                                        {formatCurrency(lineItemTotal)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditLineItem(lineItem);
                                      }}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete("lineItem", lineItem);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3 text-red-500" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Sub Items */}
                                {isLineItemExpanded && (
                                  <div className="bg-slate-50/50">
                                    {lineItemSubItems.length === 0 ? (
                                      <div className="p-3 pl-20 text-center text-slate-500 text-sm">
                                        No sub-items yet.{" "}
                                        <button
                                          onClick={() => handleAddSubItem(lineItem.id)}
                                          className="text-emerald-600 hover:underline"
                                        >
                                          Add one now
                                        </button>
                                      </div>
                                    ) : (
                                      lineItemSubItems.map((subItem) => (
                                        <div
                                          key={subItem.id}
                                          className="p-3 pl-20 flex items-center justify-between border-t border-slate-100 hover:bg-white transition-colors"
                                        >
                                          <div className="flex-1">
                                            <h5 className="text-sm font-medium text-slate-700">
                                              {subItem.name}
                                            </h5>
                                            {subItem.description && (
                                              <p className="text-xs text-slate-500">{subItem.description}</p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <p className="text-sm font-medium text-slate-700">
                                              {formatCurrency(subItem.budget_amount || 0)}
                                            </p>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleEditSubItem(subItem);
                                                }}
                                              >
                                                <Pencil className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDelete("subItem", subItem);
                                                }}
                                              >
                                                <Trash2 className="h-3 w-3 text-red-500" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                    <div className="p-2 pl-20">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddSubItem(lineItem.id)}
                                      >
                                        <Plus className="h-3 w-3 mr-2" />
                                        Add Sub-item
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                        <div className="p-3 pl-12 border-t border-slate-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddLineItem(category.id)}
                          >
                            <Plus className="h-3 w-3 mr-2" />
                            Add Line Item
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showCategoryForm && (
        <BudgetCategoryForm
          projectId={projectId}
          category={editingItem}
          onClose={() => {
            setShowCategoryForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {showLineItemForm && (
        <BudgetLineItemForm
          projectId={projectId}
          categoryId={selectedCategoryId}
          lineItem={editingItem}
          onClose={() => {
            setShowLineItemForm(false);
            setEditingItem(null);
            setSelectedCategoryId(null);
          }}
        />
      )}

      {showSubItemForm && (
        <BudgetSubItemForm
          projectId={projectId}
          lineItemId={selectedLineItemId}
          subItem={editingItem}
          onClose={() => {
            setShowSubItemForm(false);
            setEditingItem(null);
            setSelectedLineItemId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: null, item: null })}
        title={`Delete ${deleteDialog.type === "category" ? "Category" : deleteDialog.type === "lineItem" ? "Line Item" : "Sub-item"}`}
        description={`This will permanently delete this ${deleteDialog.type === "category" ? "category and all its line items and sub-items" : deleteDialog.type === "lineItem" ? "line item and all its sub-items" : "sub-item"}. This cannot be undone.`}
        onConfirm={confirmDelete}
        destructive
      />
    </div>
  );
}