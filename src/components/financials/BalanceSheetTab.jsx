import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "../shared/CurrencyFormat";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function BalanceSheetTab({ data, asOfDate }) {
  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          No financial data available for the selected period.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Balance Check Alert */}
      {!data.balances && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Balance sheet does not balance. Assets: {formatCurrency(data.assets.totalAssets)}, Liabilities + Equity:{" "}
            {formatCurrency(data.totalLiabilitiesAndEquity)}
          </AlertDescription>
        </Alert>
      )}

      {data.balances && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-700">Balance sheet balances correctly</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Balance Sheet</CardTitle>
            <p className="text-sm text-slate-500">As of {format(asOfDate, "MMM d, yyyy")}</p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {/* ASSETS SECTION */}
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="font-bold text-slate-900 text-lg">
                  ASSETS
                </TableCell>
              </TableRow>

              {/* Current Assets */}
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="font-semibold text-slate-700 pl-4">
                  Current Assets
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Cash and Cash Equivalents</TableCell>
                <TableCell className="text-right">{formatCurrency(data.assets.currentAssets.cash)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Accounts Receivable</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.assets.currentAssets.accountsReceivable)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Work in Progress - Restoration Costs</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.assets.currentAssets.workInProgress)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Credit Inventory - Carbon</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.assets.currentAssets.creditInventory.carbon)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Credit Inventory - BNG Habitat</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.assets.currentAssets.creditInventory.bngHabitat)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Credit Inventory - BNG Hedgerow</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.assets.currentAssets.creditInventory.bngHedgerow)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Credit Inventory - Watercourse</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.assets.currentAssets.creditInventory.watercourse)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Credit Inventory - NFM</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.assets.currentAssets.creditInventory.nfm)}
                </TableCell>
              </TableRow>
              <TableRow className="font-semibold border-t">
                <TableCell className="pl-4">Total Current Assets</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.assets.currentAssets.totalCurrentAssets)}
                </TableCell>
              </TableRow>

              {/* Fixed Assets */}
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="font-semibold text-slate-700 pl-4 pt-4">
                  Fixed Assets
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Land Value</TableCell>
                <TableCell className="text-right">{formatCurrency(data.assets.fixedAssets.land)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Equipment</TableCell>
                <TableCell className="text-right">{formatCurrency(data.assets.fixedAssets.equipment)}</TableCell>
              </TableRow>
              <TableRow className="font-semibold border-t">
                <TableCell className="pl-4">Total Fixed Assets</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.assets.fixedAssets.totalFixedAssets)}
                </TableCell>
              </TableRow>

              {/* Total Assets */}
              <TableRow className="font-bold bg-emerald-50 border-t-2 border-slate-300">
                <TableCell className="text-lg">TOTAL ASSETS</TableCell>
                <TableCell className="text-right text-lg text-emerald-600">
                  {formatCurrency(data.assets.totalAssets)}
                </TableCell>
              </TableRow>

              {/* LIABILITIES SECTION */}
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="font-bold text-slate-900 text-lg pt-6">
                  LIABILITIES
                </TableCell>
              </TableRow>

              {/* Current Liabilities */}
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="font-semibold text-slate-700 pl-4">
                  Current Liabilities
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Accounts Payable</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.liabilities.currentLiabilities.accountsPayable)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Current Portion of Long-Term Debt</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.liabilities.currentLiabilities.currentDebt)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Deferred Revenue</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.liabilities.currentLiabilities.deferredRevenue)}
                </TableCell>
              </TableRow>
              <TableRow className="font-semibold border-t">
                <TableCell className="pl-4">Total Current Liabilities</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.liabilities.currentLiabilities.totalCurrentLiabilities)}
                </TableCell>
              </TableRow>

              {/* Long-Term Liabilities */}
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="font-semibold text-slate-700 pl-4 pt-4">
                  Long-Term Liabilities
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Private Debt</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.liabilities.longTermLiabilities.privateDebt)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Government Debt</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.liabilities.longTermLiabilities.governmentDebt)}
                </TableCell>
              </TableRow>
              <TableRow className="font-semibold border-t">
                <TableCell className="pl-4">Total Long-Term Liabilities</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.liabilities.longTermLiabilities.totalLongTermLiabilities)}
                </TableCell>
              </TableRow>

              {/* Total Liabilities */}
              <TableRow className="font-bold bg-amber-50 border-t-2">
                <TableCell className="text-lg">TOTAL LIABILITIES</TableCell>
                <TableCell className="text-right text-lg">{formatCurrency(data.liabilities.totalLiabilities)}</TableCell>
              </TableRow>

              {/* EQUITY SECTION */}
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="font-bold text-slate-900 text-lg pt-6">
                  EQUITY
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Equity Capital</TableCell>
                <TableCell className="text-right">{formatCurrency(data.equity.equityCapital)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Grant Funding</TableCell>
                <TableCell className="text-right">{formatCurrency(data.equity.grantFunding)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Retained Earnings</TableCell>
                <TableCell className={`text-right ${data.equity.retainedEarnings >= 0 ? "" : "text-red-600"}`}>
                  {formatCurrency(data.equity.retainedEarnings)}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold bg-blue-50 border-t-2">
                <TableCell className="text-lg">TOTAL EQUITY</TableCell>
                <TableCell className="text-right text-lg text-blue-600">
                  {formatCurrency(data.equity.totalEquity)}
                </TableCell>
              </TableRow>

              {/* Total Liabilities + Equity */}
              <TableRow className="font-bold bg-slate-100 border-t-4 border-slate-400">
                <TableCell className="text-lg">TOTAL LIABILITIES + EQUITY</TableCell>
                <TableCell className="text-right text-lg">{formatCurrency(data.totalLiabilitiesAndEquity)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}