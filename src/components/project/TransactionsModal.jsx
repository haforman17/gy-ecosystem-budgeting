import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "../shared/CurrencyFormat";
import { format } from "date-fns";
import { Receipt } from "lucide-react";

export default function TransactionsModal({ open, onClose, title, transactions }) {
  const total = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-slate-400" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Receipt className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No transactions recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold">Description</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">
                        {tx.date ? format(new Date(tx.date), "dd MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-sm">{tx.description}</TableCell>
                      <TableCell className="text-sm text-right font-medium">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{tx.reference || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <span className="text-lg font-bold text-slate-900">{formatCurrency(total)}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}