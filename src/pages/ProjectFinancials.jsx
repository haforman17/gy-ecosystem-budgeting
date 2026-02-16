import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Calendar, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { startOfYear, endOfYear } from "date-fns";

export default function ProjectFinancials() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");
  
  const currentYear = new Date().getFullYear();
  const [selectedYears, setSelectedYears] = useState([
    currentYear - 2,
    currentYear - 1,
    currentYear
  ]);

  // Generate year options (10 years back, 5 years forward)
  const yearOptions = Array.from({ length: 16 }, (_, i) => currentYear - 10 + i);

  const handleYearChange = (position, newYear) => {
    const newYears = [...selectedYears];
    newYears[position] = parseInt(newYear);
    setSelectedYears(newYears.sort((a, b) => a - b));
  };

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
    select: (data) => data[0],
    enabled: !!projectId,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions", projectId],
    queryFn: () => base44.entities.Transaction.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: revenueStreams = [], isLoading: revenueLoading } = useQuery({
    queryKey: ["revenueStreams", projectId],
    queryFn: () => base44.entities.RevenueStream.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: lineItems = [], isLoading: lineItemsLoading } = useQuery({
    queryKey: ["lineItems", projectId],
    queryFn: () => base44.entities.LineItem.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: fundingSources = [], isLoading: fundingLoading } = useQuery({
    queryKey: ["fundingSources", projectId],
    queryFn: () => base44.entities.FundingSource.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const financialStatementsByYear = useMemo(() => {
    if (!transactions.length) return null;

    const statementsByYear = {};

    selectedYears.forEach(year => {
      const startDate = startOfYear(new Date(year, 0, 1));
      const endDate = endOfYear(new Date(year, 11, 31));

      const yearTransactions = transactions.filter(t => {
        if (!t.date) return false;
        const txDate = new Date(t.date);
        return txDate >= startDate && txDate <= endDate;
      });

      const incomeStatement = calculateIncomeStatement(
        yearTransactions,
        revenueStreams,
        lineItems,
        startDate,
        endDate
      );

      const balanceSheet = calculateBalanceSheet(
        yearTransactions,
        revenueStreams,
        fundingSources,
        lineItems,
        endDate
      );

      const cashFlowStatement = calculateCashFlowStatement(
        yearTransactions,
        fundingSources,
        incomeStatement,
        lineItems,
        startDate,
        endDate
      );

      const equityStatement = calculateEquityStatement(
        yearTransactions,
        fundingSources,
        incomeStatement,
        startDate,
        endDate
      );

      statementsByYear[year] = {
        incomeStatement,
        balanceSheet,
        cashFlowStatement,
        equityStatement,
      };
    });

    return statementsByYear;
  }, [transactions, revenueStreams, lineItems, fundingSources, selectedYears]);

  if (projectLoading || transactionsLoading || revenueLoading || lineItemsLoading || fundingLoading) {
    return <LoadingState />;
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-sm text-slate-500 mt-1">Financial Statements (Transaction-Driven)</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(createPageUrl(`ProjectDetail?id=${projectId}`))}
        >
          Back to Project
        </Button>
      </div>

      {/* Year Selector Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <div>
              <CardTitle className="text-base">Year Comparison</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Select three years to compare side-by-side</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((position) => (
              <div key={position}>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">
                  Year {position + 1}
                </label>
                <Select 
                  value={selectedYears[position]?.toString()} 
                  onValueChange={(value) => handleYearChange(position, value)}
                >
                  <SelectTrigger className="bg-emerald-50 border-emerald-200 font-semibold text-emerald-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700 text-sm">
          All financial statements are <strong>auto-generated</strong> from transactions and <strong>cannot be manually edited</strong>. 
          Values update in real-time when transactions are added, modified, or deleted.
        </AlertDescription>
      </Alert>

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
          <IncomeStatementTab 
            statementsByYear={financialStatementsByYear} 
            selectedYears={selectedYears}
          />
        </TabsContent>

        <TabsContent value="balance">
          <BalanceSheetTab 
            statementsByYear={financialStatementsByYear} 
            selectedYears={selectedYears}
          />
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowTab 
            statementsByYear={financialStatementsByYear} 
            selectedYears={selectedYears}
          />
        </TabsContent>

        <TabsContent value="equity">
          <EquityStatementTab 
            statementsByYear={financialStatementsByYear} 
            selectedYears={selectedYears}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}