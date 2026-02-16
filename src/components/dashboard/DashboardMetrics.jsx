import MetricCard from "../shared/MetricCard";
import { formatCurrency } from "../shared/CurrencyFormat";
import { FolderTree, Wallet, TrendingUp, PiggyBank } from "lucide-react";

export default function DashboardMetrics({ projects = [], lineItems = [], revenueStreams = [], fundingSources = [], transactions = [], budgetCategories = [], subItems = [] }) {
  // Calculate total budget from all budget sources
  const lineItemsTotal = lineItems.reduce((sum, li) => sum + (Number(li.budget_amount) || 0), 0);
  const categoriesTotal = budgetCategories.reduce((sum, bc) => sum + (Number(bc.budget_amount) || 0), 0);
  const subItemsTotal = subItems.reduce((sum, si) => sum + (Number(si.budget_amount) || 0), 0);
  const totalBudget = lineItemsTotal + categoriesTotal + subItemsTotal;
  
  const totalActualSpend = transactions
    .filter((t) => t.transaction_type === "EXPENSE")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalRevenueForecast = revenueStreams.reduce(
    (sum, rs) => sum + ((Number(rs.estimated_volume) || 0) * (Number(rs.estimated_price_per_unit) || Number(rs.price_per_unit) || 0)),
    0
  );
  const totalFundingDrawn = transactions
    .filter((t) => t.transaction_type === "FUNDING_DRAWDOWN")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const cashPosition = totalFundingDrawn - totalActualSpend;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={FolderTree}
        label="Total Projects"
        value={projects.length}
        subtitle={`${projects.filter((p) => p.status === "ACTIVE").length} active`}
      />
      <MetricCard
        icon={Wallet}
        label="Total Budget"
        value={formatCurrency(totalBudget)}
        subtitle={`${formatCurrency(totalActualSpend)} spent`}
      />
      <MetricCard
        icon={TrendingUp}
        label="Revenue Forecast"
        value={formatCurrency(totalRevenueForecast)}
        subtitle={`${revenueStreams.length} streams`}
      />
      <MetricCard
        icon={PiggyBank}
        label="Cash Position"
        value={formatCurrency(cashPosition)}
        subtitle={`${formatCurrency(totalFundingDrawn)} drawn`}
      />
    </div>
  );
}