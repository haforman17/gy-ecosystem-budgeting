import React, { useState, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import IncomeStatementTab from "@/components/financials/IncomeStatementTab";
import BalanceSheetTab from "@/components/financials/BalanceSheetTab";
import CashFlowTab from "@/components/financials/CashFlowTab";
import EquityStatementTab from "@/components/financials/EquityStatementTab";
import {
  calculateIncomeStatement,
  calculateBalanceSheet,
  calculateCashFlowStatement,
  calculateEquityStatement,
} from "@/components/lib/calculations";
import { startOfYear, endOfYear, subYears, startOfMonth, endOfMonth } from "date-fns";

export default function ProjectFinancials() {
  const { id } = useParams();
  const [dateRange, setDateRange] = useState("current_year");

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => base44.entities.Project.filter({ id }),
    select: (data) => data[0],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions", id],
    queryFn: () => base44.entities.Transaction.filter({ project_id: id }),
    enabled: !!id,
  });

  const { data: revenueStreams = [], isLoading: revenueLoading } = useQuery({
    queryKey: ["revenueStreams", id],
    queryFn: () => base44.entities.RevenueStream.filter({ project_id: id }),
    enabled: !!id,
  });

  const { data: lineItems = [], isLoading: lineItemsLoading } = useQuery({
    queryKey: ["lineItems", id],
    queryFn: () => base44.entities.LineItem.filter({ project_id: id }),
    enabled: !!id,
  });

  const { data: fundingSources = [], isLoading: fundingLoading } = useQuery({
    queryKey: ["fundingSources", id],
    queryFn: () => base44.entities.FundingSource.filter({ project_id: id }),
    enabled: !!id,
  });

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case "current_year":
        return { startDate: startOfYear(now), endDate: endOfYear(now) };
      case "last_year":
        return { startDate: startOfYear(subYears(now, 1)), endDate: endOfYear(subYears(now, 1)) };
      case "ytd":
        return { startDate: startOfYear(now), endDate: now };
      case "last_12_months":
        return { startDate: subYears(now, 1), endDate: now };
      case "this_month":
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
      case "all_time":
        return {
          startDate: project?.start_date ? new Date(project.start_date) : startOfYear(subYears(now, 10)),
          endDate: now,
        };
      default:
        return { startDate: startOfYear(now), endDate: endOfYear(now) };
    }
  }, [dateRange, project]);

  const financialStatements = useMemo(() => {
    if (!transactions.length) return null;

    const incomeStatement = calculateIncomeStatement(
      transactions,
      revenueStreams,
      lineItems,
      startDate,
      endDate
    );

    const balanceSheet = calculateBalanceSheet(
      transactions,
      revenueStreams,
      fundingSources,
      lineItems,
      endDate
    );

    const cashFlowStatement = calculateCashFlowStatement(
      transactions,
      fundingSources,
      incomeStatement,
      startDate,
      endDate
    );

    const equityStatement = calculateEquityStatement(
      transactions,
      fundingSources,
      incomeStatement,
      startDate,
      endDate
    );

    return {
      incomeStatement,
      balanceSheet,
      cashFlowStatement,
      equityStatement,
    };
  }, [transactions, revenueStreams, lineItems, fundingSources, startDate, endDate]);

  if (projectLoading || transactionsLoading || revenueLoading || lineItemsLoading || fundingLoading) {
    return <LoadingState />;
  }

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-sm text-slate-500 mt-1">Financial Statements</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="current_year">Current Year</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="last_12_months">Last 12 Months</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="income" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="income">
            <FileText className="h-4 w-4 mr-2" />
            Income Statement
          </TabsTrigger>
          <TabsTrigger value="balance">
            <FileText className="h-4 w-4 mr-2" />
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="cashflow">
            <FileText className="h-4 w-4 mr-2" />
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="equity">
            <FileText className="h-4 w-4 mr-2" />
            Equity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <IncomeStatementTab data={financialStatements?.incomeStatement} startDate={startDate} endDate={endDate} />
        </TabsContent>

        <TabsContent value="balance">
          <BalanceSheetTab data={financialStatements?.balanceSheet} asOfDate={endDate} />
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowTab data={financialStatements?.cashFlowStatement} startDate={startDate} endDate={endDate} />
        </TabsContent>

        <TabsContent value="equity">
          <EquityStatementTab data={financialStatements?.equityStatement} startDate={startDate} endDate={endDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}