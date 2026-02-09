import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { format } from "date-fns";
import { CheckCircle2, Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function CashFlowTab({ data, startDate, endDate }) {
  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          No financial data available for the selected period.
        </CardContent>
      </Card>
    );
  }

  const exportToCSV = () => {
    const csvData = [
      ["Statement of Cash Flows", `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`],
      [],
      ["OPERATING ACTIVITIES"],
      ["Net Income", data.operatingActivities.netIncome],
      ["Add back: Interest Expense", data.operatingActivities.adjustments.interestExpense],
      ["Change in Accounts Receivable", data.operatingActivities.adjustments.changeInAR],
      ["Change in Credit Inventory", data.operatingActivities.adjustments.changeInInventory],
      ["Change in Accounts Payable", data.operatingActivities.adjustments.changeInAP],
      ["Net Cash from Operating", data.operatingActivities.netOperatingCash],
      [],
      ["INVESTING ACTIVITIES"],
      ["Land Acquisition", data.investingActivities.landAcquisition],
      ["Equipment Purchases", data.investingActivities.equipmentPurchases],
      ["Capital Improvements", data.investingActivities.capitalImprovements],
      ["Net Cash from Investing", data.investingActivities.netInvestingCash],
      [],
      ["FINANCING ACTIVITIES"],
      ["Grant Receipts", data.financingActivities.grantReceipts],
      ["Debt Drawdowns", data.financingActivities.debtDrawdowns],
      ["Debt Repayments", data.financingActivities.debtRepayments],
      ["Equity Contributions", data.financingActivities.equityContributions],
      ["Net Cash from Financing", data.financingActivities.netFinancingCash],
      [],
      ["NET CHANGE IN CASH", data.netChangeInCash],
      ["Beginning Cash Balance", data.beginningCash],
      ["Ending Cash Balance", data.endingCash],
    ];
    
    const csv = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cash-flow-${format(startDate, "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const wsData = [
      ["Statement of Cash Flows", `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`],
      [],
      ["OPERATING ACTIVITIES"],
      ["Net Income", data.operatingActivities.netIncome],
      ["Add back: Interest Expense", data.operatingActivities.adjustments.interestExpense],
      ["Change in Accounts Receivable", data.operatingActivities.adjustments.changeInAR],
      ["Change in Credit Inventory", data.operatingActivities.adjustments.changeInInventory],
      ["Change in Accounts Payable", data.operatingActivities.adjustments.changeInAP],
      ["Net Cash from Operating", data.operatingActivities.netOperatingCash],
      [],
      ["INVESTING ACTIVITIES"],
      ["Land Acquisition", data.investingActivities.landAcquisition],
      ["Equipment Purchases", data.investingActivities.equipmentPurchases],
      ["Capital Improvements", data.investingActivities.capitalImprovements],
      ["Net Cash from Investing", data.investingActivities.netInvestingCash],
      [],
      ["FINANCING ACTIVITIES"],
      ["Grant Receipts", data.financingActivities.grantReceipts],
      ["Debt Drawdowns", data.financingActivities.debtDrawdowns],
      ["Debt Repayments", data.financingActivities.debtRepayments],
      ["Equity Contributions", data.financingActivities.equityContributions],
      ["Net Cash from Financing", data.financingActivities.netFinancingCash],
      [],
      ["NET CHANGE IN CASH", data.netChangeInCash],
      ["Beginning Cash Balance", data.beginningCash],
      ["Ending Cash Balance", data.endingCash],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cash Flow");
    XLSX.writeFile(wb, `cash-flow-${format(startDate, "yyyy-MM-dd")}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Reconciliation Check */}
      <Alert className="bg-blue-50 border-blue-200">
        <CheckCircle2 className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Cash reconciliation: Beginning {formatCurrency(data.beginningCash)} + Net Change{" "}
          {formatCurrency(data.netChangeInCash)} = Ending {formatCurrency(data.endingCash)}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Statement of Cash Flows</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {/* OPERATING ACTIVITIES */}
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="font-bold text-slate-900 text-lg">
                  OPERATING ACTIVITIES
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Net Income</TableCell>
                <TableCell className="text-right">{formatCurrency(data.operatingActivities.netIncome)}</TableCell>
              </TableRow>
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="font-semibold text-slate-700 pl-8 pt-2">
                  Adjustments to Reconcile Net Income:
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-12 text-sm">Add back: Interest Expense</TableCell>
                <TableCell className="text-right text-sm">
                  {formatCurrency(data.operatingActivities.adjustments.interestExpense)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="font-semibold text-slate-700 pl-12 pt-2 text-sm">
                  Changes in Working Capital:
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-16 text-sm">Increase/Decrease in Accounts Receivable</TableCell>
                <TableCell className="text-right text-sm">
                  {formatCurrency(data.operatingActivities.adjustments.changeInAR)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-16 text-sm">Increase/Decrease in Credit Inventory</TableCell>
                <TableCell className="text-right text-sm">
                  {formatCurrency(data.operatingActivities.adjustments.changeInInventory)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-16 text-sm">Increase/Decrease in Accounts Payable</TableCell>
                <TableCell className="text-right text-sm">
                  {formatCurrency(data.operatingActivities.adjustments.changeInAP)}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold bg-emerald-50 border-t-2">
                <TableCell>Net Cash from Operating Activities</TableCell>
                <TableCell className="text-right text-emerald-600">
                  {formatCurrency(data.operatingActivities.netOperatingCash)}
                </TableCell>
              </TableRow>

              {/* INVESTING ACTIVITIES */}
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="font-bold text-slate-900 text-lg pt-4">
                  INVESTING ACTIVITIES
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Land Acquisition</TableCell>
                <TableCell className="text-right">
                  {data.investingActivities.landAcquisition !== 0
                    ? `(${formatCurrency(data.investingActivities.landAcquisition)})`
                    : "—"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Equipment Purchases</TableCell>
                <TableCell className="text-right">
                  {data.investingActivities.equipmentPurchases !== 0
                    ? `(${formatCurrency(data.investingActivities.equipmentPurchases)})`
                    : "—"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Capital Improvements</TableCell>
                <TableCell className="text-right">
                  {data.investingActivities.capitalImprovements !== 0
                    ? `(${formatCurrency(data.investingActivities.capitalImprovements)})`
                    : "—"}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold bg-amber-50 border-t-2">
                <TableCell>Net Cash from Investing Activities</TableCell>
                <TableCell className={`text-right ${data.investingActivities.netInvestingCash >= 0 ? "" : "text-red-600"}`}>
                  {data.investingActivities.netInvestingCash < 0 ? "(" : ""}
                  {formatCurrency(Math.abs(data.investingActivities.netInvestingCash))}
                  {data.investingActivities.netInvestingCash < 0 ? ")" : ""}
                </TableCell>
              </TableRow>

              {/* FINANCING ACTIVITIES */}
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="font-bold text-slate-900 text-lg pt-4">
                  FINANCING ACTIVITIES
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Grant Receipts</TableCell>
                <TableCell className="text-right text-emerald-600">
                  {formatCurrency(data.financingActivities.grantReceipts)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Debt Drawdowns</TableCell>
                <TableCell className="text-right text-blue-600">
                  {formatCurrency(data.financingActivities.debtDrawdowns)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Debt Repayments</TableCell>
                <TableCell className="text-right text-red-600">
                  {data.financingActivities.debtRepayments !== 0
                    ? `(${formatCurrency(data.financingActivities.debtRepayments)})`
                    : "—"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Equity Contributions</TableCell>
                <TableCell className="text-right text-purple-600">
                  {formatCurrency(data.financingActivities.equityContributions)}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold bg-blue-50 border-t-2">
                <TableCell>Net Cash from Financing Activities</TableCell>
                <TableCell className="text-right text-blue-600">
                  {formatCurrency(data.financingActivities.netFinancingCash)}
                </TableCell>
              </TableRow>

              {/* NET CHANGE IN CASH */}
              <TableRow className="font-bold bg-slate-100 border-t-4 border-slate-400 pt-4">
                <TableCell className="text-lg">NET CHANGE IN CASH</TableCell>
                <TableCell className={`text-right text-lg ${data.netChangeInCash >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(data.netChangeInCash)}
                </TableCell>
              </TableRow>

              {/* CASH RECONCILIATION */}
              <TableRow className="border-t-2 pt-2">
                <TableCell className="pl-4">Beginning Cash Balance</TableCell>
                <TableCell className="text-right">{formatCurrency(data.beginningCash)}</TableCell>
              </TableRow>
              <TableRow className="font-bold bg-emerald-50">
                <TableCell className="text-lg">Ending Cash Balance</TableCell>
                <TableCell className="text-right text-lg text-emerald-600">
                  {formatCurrency(data.endingCash)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}