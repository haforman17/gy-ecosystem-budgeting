// Financial calculation utilities for Phase 2

// Calculate Income Statement from transactions and revenue streams
export function calculateIncomeStatement(
  transactions,
  revenueStreams,
  lineItems,
  startDate,
  endDate
) {
  const start = startDate.getTime();
  const end = endDate.getTime();

  // Filter transactions in date range
  const periodTransactions = transactions.filter((tx) => {
    if (!tx.date) return false;
    const txDate = new Date(tx.date).getTime();
    return txDate >= start && txDate <= end;
  });

  // Revenue by type
  const revenueTxs = periodTransactions.filter((tx) => tx.transaction_type === "REVENUE");
  const carbonSales = revenueTxs
    .filter((tx) => {
      const rs = revenueStreams.find((r) => r.id === tx.revenue_stream_id);
      return rs?.credit_type === "CARBON";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const bngSales = revenueTxs
    .filter((tx) => {
      const rs = revenueStreams.find((r) => r.id === tx.revenue_stream_id);
      return rs?.credit_type === "BNG_HABITAT" || rs?.credit_type === "BNG_HEDGEROW";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const watercourseSales = revenueTxs
    .filter((tx) => {
      const rs = revenueStreams.find((r) => r.id === tx.revenue_stream_id);
      return rs?.credit_type === "WATERCOURSE";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const nfmSales = revenueTxs
    .filter((tx) => {
      const rs = revenueStreams.find((r) => r.id === tx.revenue_stream_id);
      return rs?.credit_type === "NFM";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const otherRevenue = revenueTxs
    .filter((tx) => !tx.revenue_stream_id)
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const totalRevenue = carbonSales + bngSales + watercourseSales + nfmSales + otherRevenue;

  // COGS - direct project costs
  const expenseTxs = periodTransactions.filter((tx) => tx.transaction_type === "EXPENSE");
  const sitePreparation = expenseTxs
    .filter((tx) => {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li?.category === "SITE_PREPARATION";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const planting = expenseTxs
    .filter((tx) => {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li?.category === "PLANTING";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const fencing = expenseTxs
    .filter((tx) => {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li?.category === "FENCING";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const surveys = expenseTxs
    .filter((tx) => {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li?.category === "SURVEYS";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const totalCOGS = sitePreparation + planting + fencing + surveys;
  const grossProfit = totalRevenue - totalCOGS;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Operating Expenses
  const monitoring = expenseTxs
    .filter((tx) => {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li?.category === "MONITORING";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const maintenance = expenseTxs
    .filter((tx) => {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li?.category === "MAINTENANCE";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const legal = expenseTxs
    .filter((tx) => {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li?.category === "LEGAL";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const labor = expenseTxs
    .filter((tx) => {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li?.category === "LABOR";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const overhead = expenseTxs
    .filter((tx) => {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li?.category === "OVERHEAD";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const other = expenseTxs
    .filter((tx) => {
      const li = lineItems.find((l) => l.id === tx.line_item_id);
      return li?.category === "OTHER" || li?.category === "EQUIPMENT";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const totalOperatingExpenses = monitoring + maintenance + legal + labor + overhead + other;
  const ebitda = grossProfit - totalOperatingExpenses;

  // Other Income/Expenses
  const fundingTxs = periodTransactions.filter((tx) => tx.transaction_type === "FUNDING_DRAWDOWN");
  const grantIncome = fundingTxs.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const debtPayments = periodTransactions.filter((tx) => tx.transaction_type === "DEBT_REPAYMENT");
  const interestExpense = debtPayments.reduce((sum, tx) => sum + (Number(tx.amount) || 0) * 0.1, 0);

  const totalOther = grantIncome - interestExpense;
  const netIncome = ebitda + totalOther;
  const netMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

  return {
    revenue: {
      carbonSales,
      bngSales,
      watercourseSales,
      nfmSales,
      otherRevenue,
      totalRevenue,
    },
    cogs: {
      sitePreparation,
      planting,
      fencing,
      surveys,
      totalCOGS,
    },
    grossProfit,
    grossMargin,
    operatingExpenses: {
      monitoring,
      maintenance,
      legal,
      labor,
      overhead,
      other,
      totalOperatingExpenses,
    },
    ebitda,
    otherIncome: {
      grantIncome,
      interestExpense,
      totalOther,
    },
    netIncome,
    netMargin,
  };
}

// Calculate Balance Sheet as of a specific date
export function calculateBalanceSheet(
  transactions,
  revenueStreams,
  fundingSources,
  lineItems,
  asOfDate
) {
  const asOf = asOfDate.getTime();

  const historicalTxs = transactions.filter((tx) => {
    if (!tx.date) return false;
    return new Date(tx.date).getTime() <= asOf;
  });

  // Cash
  const cashIn = historicalTxs
    .filter((tx) => tx.transaction_type === "REVENUE" || tx.transaction_type === "FUNDING_DRAWDOWN")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const cashOut = historicalTxs
    .filter((tx) => tx.transaction_type === "EXPENSE" || tx.transaction_type === "DEBT_REPAYMENT")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const cash = cashIn - cashOut;

  // Accounts Receivable
  const accountsReceivable = revenueStreams
    .filter((rs) => rs.verification_status === "VERIFIED")
    .reduce((sum, rs) => sum + ((rs.estimated_revenue || 0) - (rs.actual_revenue || 0)), 0);

  // Work in Progress
  const workInProgress = historicalTxs
    .filter((tx) => tx.transaction_type === "EXPENSE")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  // Credit Inventory
  const verifiedRevenue = revenueStreams.filter((rs) => rs.verification_status === "VERIFIED");
  const carbonInventory = verifiedRevenue
    .filter((rs) => rs.credit_type === "CARBON")
    .reduce((sum, rs) => {
      const unsold = (rs.estimated_volume || 0) - (rs.actual_volume || 0);
      return sum + unsold * (rs.estimated_price_per_unit || 0);
    }, 0);

  const bngHabitatInventory = verifiedRevenue
    .filter((rs) => rs.credit_type === "BNG_HABITAT")
    .reduce((sum, rs) => {
      const unsold = (rs.estimated_volume || 0) - (rs.actual_volume || 0);
      return sum + unsold * (rs.estimated_price_per_unit || 0);
    }, 0);

  const bngHedgerowInventory = verifiedRevenue
    .filter((rs) => rs.credit_type === "BNG_HEDGEROW")
    .reduce((sum, rs) => {
      const unsold = (rs.estimated_volume || 0) - (rs.actual_volume || 0);
      return sum + unsold * (rs.estimated_price_per_unit || 0);
    }, 0);

  const watercourseInventory = verifiedRevenue
    .filter((rs) => rs.credit_type === "WATERCOURSE")
    .reduce((sum, rs) => {
      const unsold = (rs.estimated_volume || 0) - (rs.actual_volume || 0);
      return sum + unsold * (rs.estimated_price_per_unit || 0);
    }, 0);

  const nfmInventory = verifiedRevenue
    .filter((rs) => rs.credit_type === "NFM")
    .reduce((sum, rs) => {
      const unsold = (rs.estimated_volume || 0) - (rs.actual_volume || 0);
      return sum + unsold * (rs.estimated_price_per_unit || 0);
    }, 0);

  const totalInventory = carbonInventory + bngHabitatInventory + bngHedgerowInventory + watercourseInventory + nfmInventory;

  const totalCurrentAssets = cash + accountsReceivable + workInProgress + totalInventory;
  const land = 0;
  const equipment = 0;
  const totalFixedAssets = land + equipment;
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  // Liabilities
  const accountsPayable = 0;

  const totalDebtDrawn = historicalTxs
    .filter((tx) => tx.transaction_type === "FUNDING_DRAWDOWN")
    .filter((tx) => {
      const fs = fundingSources.find((f) => f.id === tx.funding_source_id);
      return fs?.funding_type === "PRIVATE_DEBT" || fs?.funding_type === "GOVERNMENT_DEBT";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const totalDebtRepaid = historicalTxs
    .filter((tx) => tx.transaction_type === "DEBT_REPAYMENT")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const outstandingDebt = totalDebtDrawn - totalDebtRepaid;
  const currentDebt = outstandingDebt * 0.1;
  const longTermDebt = outstandingDebt * 0.9;
  const privateDebt = longTermDebt * 0.5;
  const governmentDebt = longTermDebt * 0.5;
  const deferredRevenue = 0;

  const totalCurrentLiabilities = accountsPayable + currentDebt + deferredRevenue;
  const totalLongTermLiabilities = privateDebt + governmentDebt;
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  // Equity
  const equityDrawn = historicalTxs
    .filter((tx) => tx.transaction_type === "FUNDING_DRAWDOWN")
    .filter((tx) => {
      const fs = fundingSources.find((f) => f.id === tx.funding_source_id);
      return fs?.funding_type === "EQUITY";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const grantDrawn = historicalTxs
    .filter((tx) => tx.transaction_type === "FUNDING_DRAWDOWN")
    .filter((tx) => {
      const fs = fundingSources.find((f) => f.id === tx.funding_source_id);
      return fs?.funding_type === "GRANT";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const allRevenue = historicalTxs
    .filter((tx) => tx.transaction_type === "REVENUE")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const allExpenses = historicalTxs
    .filter((tx) => tx.transaction_type === "EXPENSE")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const retainedEarnings = allRevenue - allExpenses;
  const totalEquity = equityDrawn + grantDrawn + retainedEarnings;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const balances = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

  return {
    assets: {
      currentAssets: {
        cash,
        accountsReceivable,
        workInProgress,
        creditInventory: {
          carbon: carbonInventory,
          bngHabitat: bngHabitatInventory,
          bngHedgerow: bngHedgerowInventory,
          watercourse: watercourseInventory,
          nfm: nfmInventory,
          total: totalInventory,
        },
        totalCurrentAssets,
      },
      fixedAssets: {
        land,
        equipment,
        totalFixedAssets,
      },
      totalAssets,
    },
    liabilities: {
      currentLiabilities: {
        accountsPayable,
        currentDebt,
        deferredRevenue,
        totalCurrentLiabilities,
      },
      longTermLiabilities: {
        privateDebt,
        governmentDebt,
        totalLongTermLiabilities,
      },
      totalLiabilities,
    },
    equity: {
      equityCapital: equityDrawn,
      grantFunding: grantDrawn,
      retainedEarnings,
      totalEquity,
    },
    totalLiabilitiesAndEquity,
    balances,
  };
}

// Calculate Cash Flow Statement
export function calculateCashFlowStatement(
  transactions,
  fundingSources,
  incomeStatement,
  startDate,
  endDate
) {
  const start = startDate.getTime();
  const end = endDate.getTime();

  const periodTransactions = transactions.filter((tx) => {
    if (!tx.date) return false;
    const txDate = new Date(tx.date).getTime();
    return txDate >= start && txDate <= end;
  });

  const netIncome = incomeStatement.netIncome;
  const interestExpense = incomeStatement.otherIncome.interestExpense;

  const changeInAR = 0;
  const changeInInventory = 0;
  const changeInAP = 0;

  const netOperatingCash = netIncome + interestExpense + changeInAR + changeInInventory + changeInAP;

  const equipmentPurchases = periodTransactions
    .filter((tx) => tx.transaction_type === "EXPENSE" && tx.description?.toLowerCase().includes("equipment"))
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const netInvestingCash = -equipmentPurchases;

  const grantReceipts = periodTransactions
    .filter((tx) => {
      if (tx.transaction_type !== "FUNDING_DRAWDOWN") return false;
      const fs = fundingSources.find((f) => f.id === tx.funding_source_id);
      return fs?.funding_type === "GRANT";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const debtDrawdowns = periodTransactions
    .filter((tx) => {
      if (tx.transaction_type !== "FUNDING_DRAWDOWN") return false;
      const fs = fundingSources.find((f) => f.id === tx.funding_source_id);
      return fs?.funding_type === "PRIVATE_DEBT" || fs?.funding_type === "GOVERNMENT_DEBT";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const debtRepayments = periodTransactions
    .filter((tx) => tx.transaction_type === "DEBT_REPAYMENT")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const equityContributions = periodTransactions
    .filter((tx) => {
      if (tx.transaction_type !== "FUNDING_DRAWDOWN") return false;
      const fs = fundingSources.find((f) => f.id === tx.funding_source_id);
      return fs?.funding_type === "EQUITY";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const netFinancingCash = grantReceipts + debtDrawdowns - debtRepayments + equityContributions;
  const netChangeInCash = netOperatingCash + netInvestingCash + netFinancingCash;

  const priorTxs = transactions.filter((tx) => {
    if (!tx.date) return false;
    return new Date(tx.date).getTime() < start;
  });

  const priorCashIn = priorTxs
    .filter((tx) => tx.transaction_type === "REVENUE" || tx.transaction_type === "FUNDING_DRAWDOWN")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const priorCashOut = priorTxs
    .filter((tx) => tx.transaction_type === "EXPENSE" || tx.transaction_type === "DEBT_REPAYMENT")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const beginningCash = priorCashIn - priorCashOut;
  const endingCash = beginningCash + netChangeInCash;

  return {
    operatingActivities: {
      netIncome,
      adjustments: {
        interestExpense,
        changeInAR,
        changeInInventory,
        changeInAP,
      },
      netOperatingCash,
    },
    investingActivities: {
      landAcquisition: 0,
      equipmentPurchases,
      capitalImprovements: 0,
      netInvestingCash,
    },
    financingActivities: {
      grantReceipts,
      debtDrawdowns,
      debtRepayments,
      equityContributions,
      netFinancingCash,
    },
    netChangeInCash,
    beginningCash,
    endingCash,
  };
}

// Calculate Statement of Changes in Equity
export function calculateEquityStatement(
  transactions,
  fundingSources,
  incomeStatement,
  startDate,
  endDate
) {
  const start = startDate.getTime();
  const end = endDate.getTime();

  const priorTxs = transactions.filter((tx) => {
    if (!tx.date) return false;
    return new Date(tx.date).getTime() < start;
  });

  const beginningEquity = priorTxs
    .filter((tx) => {
      if (tx.transaction_type !== "FUNDING_DRAWDOWN") return false;
      const fs = fundingSources.find((f) => f.id === tx.funding_source_id);
      return fs?.funding_type === "EQUITY";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const beginningGrants = priorTxs
    .filter((tx) => {
      if (tx.transaction_type !== "FUNDING_DRAWDOWN") return false;
      const fs = fundingSources.find((f) => f.id === tx.funding_source_id);
      return fs?.funding_type === "GRANT";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const priorRevenue = priorTxs
    .filter((tx) => tx.transaction_type === "REVENUE")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const priorExpenses = priorTxs
    .filter((tx) => tx.transaction_type === "EXPENSE")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const beginningRetained = priorRevenue - priorExpenses;

  const periodTxs = transactions.filter((tx) => {
    if (!tx.date) return false;
    const txDate = new Date(tx.date).getTime();
    return txDate >= start && txDate <= end;
  });

  const equityContributions = periodTxs
    .filter((tx) => {
      if (tx.transaction_type !== "FUNDING_DRAWDOWN") return false;
      const fs = fundingSources.find((f) => f.id === tx.funding_source_id);
      return fs?.funding_type === "EQUITY";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const grantIncome = periodTxs
    .filter((tx) => {
      if (tx.transaction_type !== "FUNDING_DRAWDOWN") return false;
      const fs = fundingSources.find((f) => f.id === tx.funding_source_id);
      return fs?.funding_type === "GRANT";
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const netIncome = incomeStatement.netIncome;
  const distributions = 0;

  return {
    beginningBalance: {
      contributed: beginningEquity,
      grants: beginningGrants,
      retained: beginningRetained,
      total: beginningEquity + beginningGrants + beginningRetained,
    },
    changes: {
      equityContributions,
      grantIncome,
      netIncome,
      distributions,
    },
    endingBalance: {
      contributed: beginningEquity + equityContributions,
      grants: beginningGrants + grantIncome,
      retained: beginningRetained + netIncome,
      total: beginningEquity + equityContributions + beginningGrants + grantIncome + beginningRetained + netIncome,
    },
  };
}