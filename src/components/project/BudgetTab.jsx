import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "../shared/CurrencyFormat";
import EmptyState from "../shared/EmptyState";
import { FileText, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export default function BudgetTab({ projectId }) {
  // Fetch all budget data from Budget Builder
  const { data: categories = [] } = useQuery({
    queryKey: ["budgetCategories", projectId],
    queryFn: () => base44.entities.BudgetCategory.filter({ project_id: projectId }),
    initialData: [],
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ["lineItems", projectId],
    queryFn: () => base44.entities.LineItem.filter({ project_id: projectId }),
    initialData: [],
  });

  const { data: subItems = [] } = useQuery({
    queryKey: ["subItems", projectId],
    queryFn: () => base44.entities.SubItem.list(),
    initialData: [],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", projectId],
    queryFn: () => base44.entities.Transaction.filter({ project_id: projectId }),
    initialData: [],
  });

  const [expandedTier1, setExpandedTier1] = React.useState({});

  // Combine all budget items into a single flat list
  const allBudgetItems = useMemo(() => {
    const items = [];

    // Add categories
    categories.forEach((cat) => {
      items.push({
        id: cat.id,
        type: "category",
        tier_1_category: cat.tier_1_category,
        tier_2_category: cat.tier_2_category,
        tier_3_category: cat.tier_3_category,
        name: cat.name,
        budget: cat.budget_amount || 0,
        year: cat.date ? format(new Date(cat.date), "yyyy") : "",
      });
    });

    // Add line items
    lineItems.forEach((li) => {
      items.push({
        id: li.id,
        type: "lineItem",
        tier_1_category: li.tier_1_category,
        tier_2_category: li.tier_2_category,
        tier_3_category: li.tier_3_category,
        name: li.name,
        budget: li.budget_amount || 0,
        year: li.date ? format(new Date(li.date), "yyyy") : "",
      });
    });

    // Add sub-items
    subItems.forEach((si) => {
      items.push({
        id: si.id,
        type: "subItem",
        tier_1_category: si.tier_1_category,
        tier_2_category: si.tier_2_category,
        tier_3_category: si.tier_3_category,
        name: si.name,
        budget: si.budget_amount || 0,
        year: si.date ? format(new Date(si.date), "yyyy") : "",
      });
    });

    return items;
  }, [categories, lineItems, subItems]);

  // Calculate actuals for each budget item from transactions
  const calculateActuals = (item) => {
    const matchingTransactions = transactions.filter(
      (tx) =>
        tx.transaction_type === "EXPENSE" &&
        tx.tier_1_category === item.tier_1_category &&
        tx.tier_2_category === item.tier_2_category &&
        tx.tier_3_category === item.tier_3_category &&
        tx.budget_item_name === item.name &&
        tx.year === item.year
    );
    return matchingTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  };

  // Group by Tier 1
  const tier1Groups = useMemo(() => {
    const groups = {};
    allBudgetItems.forEach((item) => {
      const tier1 = item.tier_1_category || "Uncategorized";
      if (!groups[tier1]) {
        groups[tier1] = [];
      }
      const actuals = calculateActuals(item);
      groups[tier1].push({
        ...item,
        actuals,
        variance: item.budget - actuals,
      });
    });
    return groups;
  }, [allBudgetItems, transactions]);

  const tier1Order = ["Habitat Conversion Costs", "Operating Costs", "Other", "Uncategorized"];
  const sortedTier1Keys = Object.keys(tier1Groups).sort((a, b) => {
    const indexA = tier1Order.indexOf(a);
    const indexB = tier1Order.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  // Calculate tier1 totals
  const tier1Totals = useMemo(() => {
    const totals = {};
    Object.keys(tier1Groups).forEach((tier1) => {
      const items = tier1Groups[tier1];
      totals[tier1] = {
        budget: items.reduce((sum, item) => sum + item.budget, 0),
        actuals: items.reduce((sum, item) => sum + item.actuals, 0),
      };
      totals[tier1].variance = totals[tier1].budget - totals[tier1].actuals;
    });
    return totals;
  }, [tier1Groups]);

  const grandTotals = useMemo(() => {
    const budget = allBudgetItems.reduce((sum, item) => sum + item.budget, 0);
    const actuals = allBudgetItems.reduce((sum, item) => sum + calculateActuals(item), 0);
    return {
      budget,
      actuals,
      variance: budget - actuals,
    };
  }, [allBudgetItems, transactions]);

  const toggleTier1 = (tier1Key) => {
    setExpandedTier1((prev) => ({ ...prev, [tier1Key]: !prev[tier1Key] }));
  };

  if (allBudgetItems.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={FileText}
          title="No budget items"
          description="Create budget items in the Budget Builder tab first."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Budget Overview</h2>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60">
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase w-12"></TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">Tier 1</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">Tier 2</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">Tier 3</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">Name</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Budget</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Actuals</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Variance</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTier1Keys.map((tier1Key) => {
                  const items = tier1Groups[tier1Key];
                  const totals = tier1Totals[tier1Key];
                  const isExpanded = expandedTier1[tier1Key];

                  return (
                    <React.Fragment key={tier1Key}>
                      {/* Tier 1 Group Header */}
                      <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 border-slate-200 font-semibold hover:from-slate-150 hover:to-slate-100">
                        <TableCell>
                          <button
                            onClick={() => toggleTier1(tier1Key)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-slate-700" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-700" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell colSpan={4} className="text-sm font-bold text-slate-900">
                          {tier1Key}
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-slate-900">
                          {formatCurrency(totals.budget)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-slate-900">
                          {formatCurrency(totals.actuals)}
                        </TableCell>
                        <TableCell className={`text-right text-sm font-bold ${totals.variance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {formatCurrency(totals.variance)}
                        </TableCell>
                        <TableCell />
                      </TableRow>

                      {/* Items under this Tier 1 */}
                      {isExpanded &&
                        items.map((item) => (
                          <TableRow key={`${item.type}-${item.id}`} className="hover:bg-slate-50">
                            <TableCell />
                            <TableCell className="text-xs text-slate-600">{item.tier_1_category || "—"}</TableCell>
                            <TableCell className="text-xs text-slate-600">{item.tier_2_category || "—"}</TableCell>
                            <TableCell className="text-xs text-slate-600">{item.tier_3_category || "—"}</TableCell>
                            <TableCell className="text-sm text-slate-700">{item.name}</TableCell>
                            <TableCell className="text-right text-sm">{formatCurrency(item.budget)}</TableCell>
                            <TableCell className="text-right text-sm">{formatCurrency(item.actuals)}</TableCell>
                            <TableCell className={`text-right text-sm font-medium ${item.variance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {formatCurrency(item.variance)}
                            </TableCell>
                            <TableCell className="text-xs text-slate-400">{item.year || "—"}</TableCell>
                          </TableRow>
                        ))}
                    </React.Fragment>
                  );
                })}

                {/* Grand Total Row */}
                <TableRow className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <TableCell />
                  <TableCell colSpan={4} className="text-sm text-slate-900">
                    TOTAL
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-900">{formatCurrency(grandTotals.budget)}</TableCell>
                  <TableCell className="text-right text-sm text-slate-900">{formatCurrency(grandTotals.actuals)}</TableCell>
                  <TableCell className={`text-right text-sm ${grandTotals.variance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatCurrency(grandTotals.variance)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}