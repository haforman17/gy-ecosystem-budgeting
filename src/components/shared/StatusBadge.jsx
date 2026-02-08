import { Badge } from "@/components/ui/badge";

const statusStyles = {
  PLANNING: "bg-amber-50 text-amber-700 border-amber-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MAINTENANCE: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-slate-100 text-slate-600 border-slate-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SOLD: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DRAWN: "bg-sky-50 text-sky-700 border-sky-200",
  CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
};

const typeLabels = {
  WOODLAND_CREATION: "Woodland Creation",
  PEATLAND_RESTORATION: "Peatland Restoration",
  WETLAND: "Wetland",
  AGROFORESTRY: "Agroforestry",
  MIXED: "Mixed",
  CARBON: "Carbon",
  BNG_HABITAT: "BNG Habitat",
  BNG_HEDGEROW: "BNG Hedgerow",
  WATERCOURSE: "Watercourse",
  NFM: "Natural Flood Mgmt",
  GRANT: "Grant",
  PRIVATE_DEBT: "Private Debt",
  GOVERNMENT_DEBT: "Gov. Debt",
  EQUITY: "Equity",
  EXPENSE: "Expense",
  REVENUE: "Revenue",
  FUNDING_DRAWDOWN: "Drawdown",
  DEBT_REPAYMENT: "Repayment",
  SITE_PREPARATION: "Site Prep",
  PLANTING: "Planting",
  FENCING: "Fencing",
  MONITORING: "Monitoring",
  MAINTENANCE: "Maintenance",
  LEGAL: "Legal",
  SURVEYS: "Surveys",
  EQUIPMENT: "Equipment",
  LABOR: "Labour",
  OVERHEAD: "Overhead",
  OTHER: "Other",
};

export function StatusBadge({ value, className = "" }) {
  const style = statusStyles[value] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <Badge variant="outline" className={`${style} font-medium text-xs ${className}`}>
      {typeLabels[value] || value}
    </Badge>
  );
}

export function getLabel(value) {
  return typeLabels[value] || value;
}