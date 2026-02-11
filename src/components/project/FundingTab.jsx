import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "../shared/CurrencyFormat";
import { StatusBadge } from "../shared/StatusBadge";
import EmptyState from "../shared/EmptyState";
import ConfirmDialog from "../shared/ConfirmDialog";
import { Plus, Trash2, Landmark, MoreVertical, Pencil } from "lucide-react";
import FundingFormModal from "./FundingFormModal";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function FundingTab({ projectId, fundingSources }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.FundingSource.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fundingSources", projectId] });
      toast.success("Funding source deleted");
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete funding source");
      console.error(error);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Funding Sources</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Funding Source
        </Button>
      </div>

      {fundingSources.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No funding sources"
          description="Add grants, debt, or equity funding to track your project financing."
          actionLabel="Add Funding Source"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60">
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">Funder</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Total</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Drawn</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Available</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">Interest</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">Utilisation</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fundingSources.map((fs) => {
                    const available = (fs.total_amount || 0) - (fs.drawn_amount || 0);
                    const utilisation = fs.total_amount > 0 ? Math.round(((fs.drawn_amount || 0) / fs.total_amount) * 100) : 0;
                    return (
                      <TableRow key={fs.id}>
                        <TableCell><StatusBadge value={fs.funding_type} /></TableCell>
                        <TableCell className="text-sm font-medium text-slate-700">{fs.funder_name}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(fs.total_amount)}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(fs.drawn_amount)}</TableCell>
                        <TableCell className="text-right text-sm font-medium text-emerald-600">{formatCurrency(available)}</TableCell>
                        <TableCell className="text-right text-sm text-slate-500">
                          {fs.interest_rate ? `${fs.interest_rate}%` : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={utilisation} className="h-1.5 w-16" />
                            <span className="text-xs text-slate-500">{utilisation}%</span>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge value={fs.status} /></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditItem(fs)}>
                                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeleteId(fs.id)} className="text-red-600">
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && <FundingFormModal projectId={projectId} onClose={() => setShowForm(false)} />}

      {editItem && <FundingFormModal projectId={projectId} item={editItem} onClose={() => setEditItem(null)} />}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Funding Source"
        description="Are you sure? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate(deleteId)}
        destructive
      />
    </div>
  );
}