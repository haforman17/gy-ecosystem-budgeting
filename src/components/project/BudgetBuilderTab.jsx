import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../shared/CurrencyFormat";
import { Plus, ChevronRight, ChevronDown, MoreVertical, Pencil, Trash2, FolderOpen, Download, Upload, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import BudgetDiagnostics from "./BudgetDiagnostics";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BudgetCategoryForm from "./BudgetCategoryForm";
import BudgetLineItemForm from "./BudgetLineItemForm";
import BudgetSubItemForm from "./BudgetSubItemForm";
import { toast } from "sonner";

export default function BudgetBuilderTab({ projectId, workingYear }) {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedLineItems, setExpandedLineItems] = useState({});
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showLineItemForm, setShowLineItemForm] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showSubItemForm, setShowSubItemForm] = useState(false);
  const [editingSubItem, setEditingSubItem] = useState(null);
  const [selectedLineItemId, setSelectedLineItemId] = useState(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const fileInputRef = React.useRef(null);
  
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["budgetCategories", projectId, workingYear],
    queryFn: () => base44.entities.BudgetCategory.filter({ project_id: projectId, year: workingYear }, "sort_order"),
    enabled: !!projectId && !!workingYear,
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ["lineItems", projectId, workingYear],
    queryFn: () => base44.entities.LineItem.filter({ project_id: projectId, year: workingYear }),
    enabled: !!projectId && !!workingYear,
  });

  const { data: subItems = [] } = useQuery({
    queryKey: ["subItems", projectId, workingYear],
    queryFn: async () => {
      const allLineItemIds = lineItems.map(li => li.id);
      if (allLineItemIds.length === 0) return [];
      const items = await base44.entities.SubItem.list();
      return items.filter(si => allLineItemIds.includes(si.line_item_id) && (!si.year || si.year === workingYear));
    },
    enabled: lineItems.length > 0,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.BudgetCategory.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetCategories", projectId, workingYear] });
      toast.success("Category deleted");
    },
  });

  const deleteLineItemMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.LineItem.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lineItems", projectId, workingYear] });
      toast.success("Line item deleted");
    },
  });

  const deleteSubItemMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.SubItem.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subItems", projectId] });
      toast.success("Sub-item deleted");
    },
  });

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const toggleLineItem = (lineItemId) => {
    setExpandedLineItems(prev => ({ ...prev, [lineItemId]: !prev[lineItemId] }));
  };

  const getCategoryLineItems = (categoryId) => {
    return lineItems.filter(li => li.budget_category_id === categoryId);
  };

  const getLineItemSubItems = (lineItemId) => {
    return subItems.filter(si => si.line_item_id === lineItemId);
  };

  const calculateCategoryTotal = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const categoryLineItems = getCategoryLineItems(categoryId);
    const lineItemsTotal = categoryLineItems.reduce((sum, li) => {
      const lineItemSubItems = getLineItemSubItems(li.id);
      const subItemTotal = lineItemSubItems.reduce((s, si) => s + (si.budget_amount || 0), 0);
      return sum + (li.budget_amount || 0) + subItemTotal;
    }, 0);
    return (category?.budget_amount || 0) + lineItemsTotal;
  };

  const calculateLineItemTotal = (lineItemId) => {
    const lineItem = lineItems.find(li => li.id === lineItemId);
    const lineItemSubItems = getLineItemSubItems(lineItemId);
    const subItemTotal = lineItemSubItems.reduce((sum, si) => sum + (si.budget_amount || 0), 0);
    return (lineItem?.budget_amount || 0) + subItemTotal;
  };

  const totalBudget = categories.reduce((sum, cat) => sum + calculateCategoryTotal(cat.id), 0);

  const downloadData = (format) => {
    const exportData = [];

    // Export categories
    categories.forEach((cat) => {
      exportData.push({
        "Type": "Category",
        "Cost Type": cat.cost_type === "OP_COSTS" ? "Op Costs" : cat.cost_type === "COGS" ? "COGS" : "",
        "Tier 1 Category": cat.tier_1_category || "",
        "Tier 2 Category": cat.tier_2_category || "",
        "Tier 3 Category": cat.tier_3_category || "",
        "Name": cat.name,
        "Description": cat.description || "",
        "Budget Amount": cat.budget_amount,
        "Month": cat.month || "",
        "Year": cat.year || "",
        "ID": cat.id,
        "Parent Category ID": "",
        "Parent Line Item ID": ""
      });

      // Export line items under this category
      const categoryLineItems = getCategoryLineItems(cat.id);
      categoryLineItems.forEach((li) => {
        exportData.push({
          "Type": "LineItem",
          "Cost Type": li.cost_type === "OP_COSTS" ? "Op Costs" : li.cost_type === "COGS" ? "COGS" : "",
          "Tier 1 Category": li.tier_1_category || "",
          "Tier 2 Category": li.tier_2_category || "",
          "Tier 3 Category": li.tier_3_category || "",
          "Name": li.name,
          "Description": li.description || "",
          "Budget Amount": li.budget_amount,
          "Month": li.month || "",
          "Year": li.year || "",
          "ID": li.id,
          "Parent Category ID": cat.id,
          "Parent Line Item ID": ""
        });

        // Export sub-items under this line item
        const lineItemSubItems = getLineItemSubItems(li.id);
        lineItemSubItems.forEach((si) => {
          exportData.push({
            "Type": "SubItem",
            "Cost Type": si.cost_type === "OP_COSTS" ? "Op Costs" : si.cost_type === "COGS" ? "COGS" : "",
            "Tier 1 Category": si.tier_1_category || "",
            "Tier 2 Category": si.tier_2_category || "",
            "Tier 3 Category": si.tier_3_category || "",
            "Name": si.name,
            "Description": si.description || "",
            "Budget Amount": si.budget_amount,
            "Month": si.month || "",
            "Year": si.year || "",
            "ID": si.id,
            "Parent Category ID": "",
            "Parent Line Item ID": li.id
          });
        });
      });
    });

    if (exportData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Budget Data");
    
    worksheet['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 25 }, 
      { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 8 }, { wch: 36 }, { wch: 25 }, { wch: 25 }
    ];

    const timestamp = new Date().toISOString().split('T')[0];
    if (format === "csv") {
      XLSX.writeFile(workbook, `budget_data_${timestamp}.csv`, { bookType: "csv" });
    } else {
      XLSX.writeFile(workbook, `budget_data_${timestamp}.xlsx`);
    }
    toast.success(`Data exported to ${format.toUpperCase()}`);
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Type": "Category",
        "Cost Type": "Op Costs",
        "Tier 1 Category": "Habitat Conversion Costs",
        "Tier 2 Category": "Broadleaf Woodland creation",
        "Tier 3 Category": "",
        "Name": "Example Category",
        "Description": "Example description",
        "Budget Amount": 10000,
        "Month": "January",
        "Year": "2025",
        "Parent Category ID": "",
        "Parent Line Item ID": ""
      },
      {
        "Type": "LineItem",
        "Cost Type": "Op Costs",
        "Tier 1 Category": "Habitat Conversion Costs",
        "Tier 2 Category": "Broadleaf Woodland creation",
        "Tier 3 Category": "",
        "Name": "Example Line Item",
        "Description": "Example description",
        "Budget Amount": 5000,
        "Month": "February",
        "Year": "2025",
        "Parent Category ID": "paste-category-id-here",
        "Parent Line Item ID": ""
      },
      {
        "Type": "SubItem",
        "Cost Type": "Op Costs",
        "Tier 1 Category": "Habitat Conversion Costs",
        "Tier 2 Category": "Broadleaf Woodland creation",
        "Tier 3 Category": "",
        "Name": "Example Sub-item",
        "Description": "Example description",
        "Budget Amount": 2000,
        "Month": "March",
        "Year": "2025",
        "Parent Category ID": "",
        "Parent Line Item ID": "paste-line-item-id-here"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Budget Template");
    
    worksheet['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 25 }, 
      { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 8 }, { wch: 25 }, { wch: 25 }
    ];

    XLSX.writeFile(workbook, "budget_builder_template.xlsx");
    toast.success("Template downloaded");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error("No data found in file");
        return;
      }

      let categoriesCreated = 0;
      let lineItemsCreated = 0;
      let subItemsCreated = 0;

      for (const row of jsonData) {
        const type = row["Type"];
        const rawCostType = row["Cost Type"];
        let cost_type = "OP_COSTS"; // default
        if (rawCostType === "COGS") cost_type = "COGS";
        else if (rawCostType === "Op Costs" || rawCostType === "OP_COSTS") cost_type = "OP_COSTS";

        const commonData = {
          tier_1_category: row["Tier 1 Category"],
          tier_2_category: row["Tier 2 Category"] || null,
          tier_3_category: row["Tier 3 Category"] || null,
          cost_type,
          name: row["Name"],
          description: row["Description"] || null,
          budget_amount: parseFloat(row["Budget Amount"]) || 0,
          month: row["Month"] || null,
          year: row["Year"]?.toString() || new Date().getFullYear().toString(),
        };

        if (type === "Category") {
          await base44.entities.BudgetCategory.create({
            ...commonData,
            project_id: projectId,
          });
          categoriesCreated++;
        } else if (type === "LineItem") {
          const categoryId = row["Parent Category ID"];
          if (!categoryId) {
            toast.error(`Line item "${row["Name"]}" is missing Parent Category ID`);
            continue;
          }
          await base44.entities.LineItem.create({
            ...commonData,
            project_id: projectId,
            budget_category_id: categoryId,
          });
          lineItemsCreated++;
        } else if (type === "SubItem") {
          const lineItemId = row["Parent Line Item ID"];
          if (!lineItemId) {
            toast.error(`Sub-item "${row["Name"]}" is missing Parent Line Item ID`);
            continue;
          }
          await base44.entities.SubItem.create({
            ...commonData,
            line_item_id: lineItemId,
          });
          subItemsCreated++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["budgetCategories", projectId] });
      queryClient.invalidateQueries({ queryKey: ["lineItems", projectId] });
      queryClient.invalidateQueries({ queryKey: ["subItems", projectId] });

      toast.success(`Imported: ${categoriesCreated} categories, ${lineItemsCreated} line items, ${subItemsCreated} sub-items`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
    }
  };

  // Group categories by Tier 1 Category
  const tier1Groups = categories.reduce((groups, category) => {
    const tier1 = category.tier_1_category || "Uncategorized";
    if (!groups[tier1]) {
      groups[tier1] = [];
    }
    groups[tier1].push(category);
    return groups;
  }, {});

  const tier1Order = ["Habitat Conversion Costs", "Operating Costs", "Other", "Uncategorized"];
  const sortedTier1Keys = Object.keys(tier1Groups).sort((a, b) => {
    const indexA = tier1Order.indexOf(a);
    const indexB = tier1Order.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Budget Builder</h2>
          <p className="text-sm text-slate-500 mt-1">Build hierarchical budgets with categories, line items, and sub-items</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => downloadData("xlsx")}>
                Export as XLSX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadData("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadTemplate}>
                Download Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button variant="outline" onClick={() => setShowDiagnostics(true)}>
            <AlertCircle className="h-4 w-4 mr-2" />
            Diagnostics
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b bg-slate-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Total Budget</CardTitle>
            <span className="text-2xl font-bold text-emerald-600">{formatCurrency(totalBudget)}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No budget categories yet</p>
              <Button onClick={() => setShowCategoryForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create First Category
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {sortedTier1Keys.map((tier1Key) => {
                const tier1Categories = tier1Groups[tier1Key];
                const tier1Total = tier1Categories.reduce((sum, cat) => sum + calculateCategoryTotal(cat.id), 0);
                const isTier1Expanded = expandedCategories[`tier1_${tier1Key}`];

                return (
                  <div key={tier1Key}>
                    {/* Tier 1 Group Header */}
                    <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-4 border-b-2 border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleCategory(`tier1_${tier1Key}`)}
                            className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                          >
                            {isTier1Expanded ? (
                              <ChevronDown className="h-5 w-5 text-slate-700" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-slate-700" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h2 className="text-lg font-bold text-slate-900">{tier1Key}</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {tier1Categories.length} categor{tier1Categories.length !== 1 ? 'ies' : 'y'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-slate-900">{formatCurrency(tier1Total)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Categories under this Tier 1 */}
                    {isTier1Expanded && (
                      <div className="bg-slate-50/30">
                        {tier1Categories.map((category) => {
                const isExpanded = expandedCategories[category.id];
                const categoryLineItems = getCategoryLineItems(category.id);
                const categoryTotal = calculateCategoryTotal(category.id);

                          return (
                            <div key={category.id}>
                              {/* Layer 1: Category */}
                              <div className="p-4 hover:bg-slate-100/50 transition-colors border-b border-slate-100 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-slate-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-600" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {category.cost_type && (
                                <span className="text-xs font-bold text-white bg-slate-700 px-2 py-0.5 rounded">
                                  {category.cost_type === "OP_COSTS" ? "Op Costs" : "COGS"}
                                </span>
                              )}
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{category.tier_1_category}</span>
                              {category.tier_2_category && (
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{category.tier_2_category}</span>
                              )}
                              {category.tier_3_category && (
                                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{category.tier_3_category}</span>
                              )}
                              <span className="text-xs text-slate-400">{category.date}</span>
                            </div>
                            <h3 className="font-semibold text-slate-900">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-slate-500 mt-0.5">{category.description}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              {categoryLineItems.length} line item{categoryLineItems.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(categoryTotal)}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-2">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedCategoryId(category.id);
                              setEditingLineItem(null);
                              setShowLineItemForm(true);
                            }}>
                              <Plus className="h-3.5 w-3.5 mr-2" /> Add Line Item
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditingCategory(category);
                              setShowCategoryForm(true);
                            }}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteCategoryMutation.mutate(category.id)} className="text-red-600">
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Layer 2: Line Items */}
                    {isExpanded && (
                      <div className="bg-slate-50/50 border-t">
                        {categoryLineItems.length === 0 ? (
                          <div className="p-8 text-center">
                            <p className="text-sm text-slate-500 mb-3">No line items in this category</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCategoryId(category.id);
                                setEditingLineItem(null);
                                setShowLineItemForm(true);
                              }}
                            >
                              <Plus className="h-3.5 w-3.5 mr-2" />
                              Add Line Item
                            </Button>
                          </div>
                        ) : (
                          categoryLineItems.map((lineItem) => {
                            const isLineItemExpanded = expandedLineItems[lineItem.id];
                            const lineItemSubItems = getLineItemSubItems(lineItem.id);
                            const lineItemTotal = calculateLineItemTotal(lineItem.id);

                            return (
                              <div key={lineItem.id} className="border-b last:border-b-0">
                                <div className="p-3 pl-12 hover:bg-slate-100/50 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                      <button
                                        onClick={() => toggleLineItem(lineItem.id)}
                                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                                      >
                                        {isLineItemExpanded ? (
                                          <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                                        ) : (
                                          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                                        )}
                                      </button>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                          {lineItem.cost_type && (
                                            <span className="text-xs font-bold text-white bg-slate-600 px-2 py-0.5 rounded">
                                              {lineItem.cost_type === "OP_COSTS" ? "Op Costs" : "COGS"}
                                            </span>
                                          )}
                                          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{lineItem.tier_1_category}</span>
                                          {lineItem.tier_2_category && (
                                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{lineItem.tier_2_category}</span>
                                          )}
                                          {lineItem.tier_3_category && (
                                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{lineItem.tier_3_category}</span>
                                          )}
                                          <span className="text-xs text-slate-400">{lineItem.date}</span>
                                        </div>
                                        <p className="font-medium text-slate-800">{lineItem.name}</p>
                                        {lineItem.description && (
                                          <p className="text-xs text-slate-500 mt-0.5">{lineItem.description}</p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-0.5">
                                          {lineItemSubItems.length} sub-item{lineItemSubItems.length !== 1 ? 's' : ''}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-slate-800">{formatCurrency(lineItemTotal)}</p>
                                      </div>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                                          <MoreVertical className="h-3.5 w-3.5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => {
                                          setSelectedLineItemId(lineItem.id);
                                          setEditingSubItem(null);
                                          setShowSubItemForm(true);
                                        }}>
                                          <Plus className="h-3 w-3 mr-2" /> Add Sub-item
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                          setSelectedCategoryId(category.id);
                                          setEditingLineItem(lineItem);
                                          setShowLineItemForm(true);
                                        }}>
                                          <Pencil className="h-3 w-3 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => deleteLineItemMutation.mutate(lineItem.id)} className="text-red-600">
                                          <Trash2 className="h-3 w-3 mr-2" /> Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>

                                {/* Layer 3: Sub-items */}
                                {isLineItemExpanded && (
                                  <div className="bg-white">
                                    {lineItemSubItems.length === 0 ? (
                                      <div className="p-6 pl-20 text-center">
                                        <p className="text-xs text-slate-500 mb-2">No sub-items</p>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setSelectedLineItemId(lineItem.id);
                                            setEditingSubItem(null);
                                            setShowSubItemForm(true);
                                          }}
                                        >
                                          <Plus className="h-3 w-3 mr-2" />
                                          Add Sub-item
                                        </Button>
                                      </div>
                                    ) : (
                                      lineItemSubItems.map((subItem) => (
                                        <div key={subItem.id} className="p-2.5 pl-20 hover:bg-slate-50 transition-colors border-t">
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                {subItem.cost_type && (
                                                  <span className="text-xs font-bold text-white bg-slate-500 px-1.5 py-0.5 rounded">
                                                    {subItem.cost_type === "OP_COSTS" ? "Op Costs" : "COGS"}
                                                  </span>
                                                )}
                                                <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">{subItem.tier_1_category}</span>
                                                {subItem.tier_2_category && (
                                                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{subItem.tier_2_category}</span>
                                                )}
                                                {subItem.tier_3_category && (
                                                  <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{subItem.tier_3_category}</span>
                                                )}
                                                <span className="text-xs text-slate-400">{subItem.date}</span>
                                              </div>
                                              <p className="text-sm font-medium text-slate-700">{subItem.name}</p>
                                              {subItem.description && (
                                                <p className="text-xs text-slate-500 mt-0.5">{subItem.description}</p>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <p className="text-sm font-medium text-slate-700">{formatCurrency(subItem.budget_amount)}</p>
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <MoreVertical className="h-3 w-3" />
                                                  </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                  <DropdownMenuItem onClick={() => {
                                                    setSelectedLineItemId(lineItem.id);
                                                    setEditingSubItem(subItem);
                                                    setShowSubItemForm(true);
                                                  }}>
                                                    <Pencil className="h-3 w-3 mr-2" /> Edit
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => deleteSubItemMutation.mutate(subItem.id)} className="text-red-600">
                                                    <Trash2 className="h-3 w-3 mr-2" /> Delete
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
          category={editingCategory}
          onClose={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      {showLineItemForm && (
        <BudgetLineItemForm
          projectId={projectId}
          categoryId={selectedCategoryId}
          lineItem={editingLineItem}
          onClose={() => {
            setShowLineItemForm(false);
            setEditingLineItem(null);
            setSelectedCategoryId(null);
          }}
        />
      )}

      {showSubItemForm && (
        <BudgetSubItemForm
          lineItemId={selectedLineItemId}
          subItem={editingSubItem}
          onClose={() => {
            setShowSubItemForm(false);
            setEditingSubItem(null);
            setSelectedLineItemId(null);
          }}
        />
      )}

      <BudgetDiagnostics
        projectId={projectId}
        open={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </div>
  );
}