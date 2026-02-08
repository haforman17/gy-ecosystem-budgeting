import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "../shared/CurrencyFormat";
import { StatusBadge, getLabel } from "../shared/StatusBadge";
import EmptyState from "../shared/EmptyState";
import ConfirmDialog from "../shared/ConfirmDialog";
import { Plus, Trash2, Droplets, MoreVertical, Pencil } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import RevenueFormModal from "./RevenueFormModal";
import TransactionsModal from "./TransactionsModal";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const COLORS = ["#059669", "#0891b2", "#7c3aed", "#db2777", "#d97706"];

export default function RevenueTab({ projectId, revenueStreams }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedRevenue, setSelectedRevenue] = useState(null);
  const queryClient = useQueryClient();

  // Fetch transactions to calculate real values
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", projectId],
    queryFn: () => base44.entities.Transaction.filter({ project_id: projectId }),
    initialData: [],
    enabled: !!projectId,
  });

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
    mutationFn: (id) => base44.entities.RevenueStream.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenueStreams", projectId] });
      toast.success("Revenue stream deleted");
      setDeleteId(null);
    },
  });

  // Chart data by credit type
  const typeData = {};
  revenueStreams.forEach((rs) => {
    const t = rs.credit_type || "OTHER";
    typeData[t] = (typeData[t] || 0) + ((rs.estimated_volume || 0) * (rs.price_per_unit || 0));
  });
  const chartData = Object.entries(typeData).map(([name, value]) => ({
    name: getLabel(name),
    value,
  }));

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
                              <DropdownMenuItem onClick={() => setDeleteId(rs.id)} className="text-red-600">
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
              <CardTitle className="text-sm font-semibold text-slate-600">Revenue by Credit Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {showForm && <RevenueFormModal projectId={projectId} onClose={() => setShowForm(false)} />}

      {editItem && <RevenueFormModal projectId={projectId} item={editItem} onClose={() => setEditItem(null)} />}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Revenue Stream"
        description="Are you sure? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate(deleteId)}
        destructive
      />

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