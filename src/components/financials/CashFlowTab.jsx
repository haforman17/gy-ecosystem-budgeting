import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "../shared/CurrencyFormat";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

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
            <CardTitle>Statement of Cash Flows</CardTitle>
            <p className="text-sm text-slate-500">
              {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
            </p>
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