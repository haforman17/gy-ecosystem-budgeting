import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "../shared/CurrencyFormat";
import { StatusBadge, getLabel } from "../shared/StatusBadge";
import EmptyState from "../shared/EmptyState";
import { Plus, Droplets, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts";
import RevenueFormModal from "./RevenueFormModal";
import TransactionsModal from "./TransactionsModal";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const COLORS = ["#059669", "#0891b2", "#7c3aed", "#db2777", "#d97706"];

export default function RevenueTab({ projectId, revenueStreams, transactions = [], workingYear }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedRevenue, setSelectedRevenue] = useState(null);
  const queryClient = useQueryClient();

  // Filter revenue streams by working year (vintage matches working year)
  const filteredRevenueStreams = useMemo(() => {
    if (!workingYear) return revenueStreams;
    return revenueStreams.filter(rs => !rs.vintage || rs.vintage === workingYear.toString());
  }, [revenueStreams, workingYear]);

  // Calculate real values from transactions for each revenue stream
  const revenueCalcs = useMemo(() => {
    const calcs = {};
    revenueStreams.forEach((rs) => {
      const relatedTxs = transactions.filter(
        (tx) => tx.transaction_type === "REVENUE" && tx.revenue_stream_id === rs.id
      );
      
      const totalQuantity = relatedTxs.reduce((sum, tx) => {
        const qty = Number(tx.units_quantity) || 0;
        return sum + qty;
      }, 0);
      
      const totalRevenue = relatedTxs.reduce((sum, tx) => {
        const amt = Number(tx.amount) || 0;
        return sum + amt;
      }, 0);
      
      const avgPrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;
      
      calcs[rs.id] = {
        realVolume: totalQuantity,
        realAvgPrice: avgPrice,
        realRevenue: totalRevenue,
      };
    });
    return calcs;
  }, [transactions, revenueStreams]);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.RevenueStream.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenueStreams", projectId] });
      toast.success("Revenue stream deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete revenue stream");
      console.error(error);
    },
  });

  // Chart data by credit type - Estimated Revenue
  const typeData = {};
  revenueStreams.forEach((rs) => {
    const t = rs.credit_type || "OTHER";
    typeData[t] = (typeData[t] || 0) + ((rs.estimated_volume || 0) * (rs.estimated_price_per_unit || rs.price_per_unit || 0));
  });
  const estimatedChartData = Object.entries(typeData).map(([name, value]) => ({
    name: getLabel(name),
    value,
  }));

  // Chart data - Estimated vs Real Revenue by type
  const comparisonData = {};
  revenueStreams.forEach((rs) => {
    const t = rs.credit_type || "OTHER";
    if (!comparisonData[t]) {
      comparisonData[t] = { estimated: 0, real: 0 };
    }
    comparisonData[t].estimated += (rs.estimated_volume || 0) * (rs.estimated_price_per_unit || rs.price_per_unit || 0);
    comparisonData[t].real += revenueCalcs[rs.id]?.realRevenue || 0;
  });
  const comparisonChartData = Object.entries(comparisonData).map(([name, values]) => ({
    name: getLabel(name),
    Estimated: values.estimated,
    Real: values.real,
  }));

  // Total revenue comparison
  const totalEstimated = revenueStreams.reduce(
    (sum, rs) => sum + ((rs.estimated_volume || 0) * (rs.estimated_price_per_unit || rs.price_per_unit || 0)),
    0
  );
  const totalReal = Object.values(revenueCalcs).reduce((sum, calc) => sum + (calc.realRevenue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Revenue Streams</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Revenue Stream
        </Button>
      </div>

      {revenueStreams.length === 0 ? (
        <EmptyState
          icon={Droplets}
          title="No revenue streams"
          description="Add revenue streams from environmental credits to track forecasted income."
          actionLabel="Add Revenue Stream"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Total Estimated Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalEstimated)}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Total Real Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalReal)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {totalEstimated > 0 ? `${((totalReal / totalEstimated) * 100).toFixed(1)}% of estimated` : "No estimate"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm lg:col-span-2">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/60">
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase">Ecosystem Services</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase">Description</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Est. Vol.</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Est. Price/Unit</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Est. Revenue</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Real Volume</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Real Avg Price/Unit</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Real Revenue</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase">Year</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueStreams.map((rs) => (
                      <TableRow key={rs.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedRevenue(rs)}>
                        <TableCell><StatusBadge value={rs.credit_type} /></TableCell>
                        <TableCell className="text-sm text-slate-700">{rs.description}</TableCell>
                        <TableCell className="text-right text-sm">{formatNumber(rs.estimated_volume)}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(rs.estimated_price_per_unit || rs.price_per_unit)}</TableCell>
                        <TableCell className="text-right text-sm font-medium text-emerald-700">
                          {formatCurrency(rs.estimated_revenue || ((rs.estimated_volume || 0) * (rs.estimated_price_per_unit || rs.price_per_unit || 0)))}
                        </TableCell>
                        <TableCell className="text-right text-sm">{formatNumber(revenueCalcs[rs.id]?.realVolume || 0)}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(revenueCalcs[rs.id]?.realAvgPrice || 0)}</TableCell>
                        <TableCell className="text-right text-sm font-medium text-emerald-700">
                          {formatCurrency(revenueCalcs[rs.id]?.realRevenue || 0)}
                        </TableCell>
                        <TableCell><StatusBadge value={rs.verification_status} /></TableCell>
                        <TableCell className="text-xs text-slate-500">{rs.vintage || "—"}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditItem(rs)}>
                                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteMutation.mutate(rs.id)} className="text-red-600">
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Estimated Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={estimatedChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {estimatedChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Estimated vs Real Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="Estimated" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Real" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Revenue Achievement Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart 
                  data={comparisonChartData.map(d => ({
                    name: d.name,
                    rate: d.Estimated > 0 ? ((d.Real / d.Estimated) * 100) : 0
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                  <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {comparisonChartData.map((entry, i) => {
                      const rate = entry.Estimated > 0 ? (entry.Real / entry.Estimated) * 100 : 0;
                      const color = rate >= 100 ? "#10b981" : rate >= 75 ? "#f59e0b" : "#ef4444";
                      return <Cell key={i} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        </>
      )}

      {showForm && <RevenueFormModal projectId={projectId} onClose={() => setShowForm(false)} />}

      {editItem && <RevenueFormModal projectId={projectId} item={editItem} onClose={() => setEditItem(null)} />}

      {selectedRevenue && (
        <TransactionsModal
          open={!!selectedRevenue}
          onClose={() => setSelectedRevenue(null)}
          title={`${getLabel(selectedRevenue.credit_type)} - ${selectedRevenue.description}`}
          transactions={transactions.filter(
            (tx) => tx.transaction_type === "REVENUE" && tx.revenue_stream_id === selectedRevenue.id
          )}
        />
      )}
    </div>
  );
}