import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/components/shared/CurrencyFormat";
import { calculateIncomeStatement, calculateBalanceSheet, calculateCashFlowStatement } from "@/components/lib/calculations";
import { startOfYear, endOfYear } from "date-fns";

export default function ReportFinancialStatements({
  projectId,
  selectedYear,
  transactions,
  revenueStreams,
  lineItems,
  fundingSources,
}) {
  const statements = useMemo(() => {
    const startDate = startOfYear(new Date(selectedYear, 0, 1));
    const endDate = endOfYear(new Date(selectedYear, 11, 31));

    const incomeStatement = calculateIncomeStatement(transactions, revenueStreams, lineItems, startDate, endDate);
    const balanceSheet = calculateBalanceSheet(transactions, revenueStreams, fundingSources, lineItems, endDate);
    const cashFlowStatement = calculateCashFlowStatement(transactions, fundingSources, incomeStatement, lineItems, startDate, endDate);

    return { incomeStatement, balanceSheet, cashFlowStatement };
  }, [transactions, revenueStreams, lineItems, fundingSources, selectedYear]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income Statement */}
      <Card>
        <CardHeader>
          <CardTitle>Income Statement - FY{selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow className="font-semibold bg-slate-50">
                <TableCell>Revenue</TableCell>
                <TableCell className="text-right text-emerald-600">
                  {formatCurrency(statements.incomeStatement?.revenue?.totalRevenue || 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Cost of Goods Sold</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(statements.incomeStatement?.cogs?.totalCOGS || 0)}
                </TableCell>
              </TableRow>
              <TableRow className="font-semibold">
                <TableCell>Gross Profit</TableCell>
                <TableCell className="text-right text-emerald-600">
                  {formatCurrency(statements.incomeStatement?.grossProfit || 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Operating Expenses</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(statements.incomeStatement?.operatingExpenses?.totalOperatingExpenses || 0)}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold bg-emerald-50">
                <TableCell>Net Income</TableCell>
                <TableCell className="text-right text-emerald-600">
                  {formatCurrency(statements.incomeStatement?.netIncome || 0)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Balance Sheet */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet - Dec 31, {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow className="font-semibold bg-slate-50">
                <TableCell>Total Assets</TableCell>
                <TableCell className="text-right text-emerald-600">
                  {formatCurrency(statements.balanceSheet?.assets?.totalAssets || 0)}
                </TableCell>
              </TableRow>
              <TableRow className="font-semibold bg-slate-50">
                <TableCell>Total Liabilities</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(statements.balanceSheet?.liabilities?.totalLiabilities || 0)}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold bg-blue-50">
                <TableCell>Total Equity</TableCell>
                <TableCell className="text-right text-blue-600">
                  {formatCurrency(statements.balanceSheet?.equity?.totalEquity || 0)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cash Flow Statement */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Cash Flow Statement - FY{selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow className="font-semibold">
                <TableCell>Operating Activities</TableCell>
                <TableCell className="text-right text-emerald-600">
                  {formatCurrency(statements.cashFlowStatement?.operatingActivities?.netOperatingCash || 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Investing Activities</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(statements.cashFlowStatement?.investingActivities?.netInvestingCash || 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Financing Activities</TableCell>
                <TableCell className="text-right text-blue-600">
                  {formatCurrency(statements.cashFlowStatement?.financingActivities?.netFinancingCash || 0)}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold bg-emerald-50">
                <TableCell>Net Change in Cash</TableCell>
                <TableCell className="text-right text-emerald-600">
                  {formatCurrency(statements.cashFlowStatement?.netChangeInCash || 0)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}