import React from "react";
import PublicLayout from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  Building2,
  FileText,
  TrendingUp,
  Shield,
  Download,
  Check,
  ArrowRight,
  Database,
  Cloud,
  FileSpreadsheet,
} from "lucide-react";

export default function Features() {
  const integrations = [
    { name: "QuickBooks", icon: Database },
    { name: "Xero", icon: Database },
    { name: "Google Drive", icon: Cloud },
    { name: "Dropbox", icon: Cloud },
    { name: "Excel", icon: FileSpreadsheet },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Everything You Need to Manage Nature-Based Projects
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Purpose-built features for land restoration, carbon, and biodiversity net gain projects
          </p>
        </div>
      </section>

      {/* Feature Section 1: Multi-Credit Revenue */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-emerald-100 to-yellow-100 rounded-2xl p-8 aspect-video flex items-center justify-center">
              <Leaf className="h-24 w-24 text-emerald-600" />
            </div>
            <div className="space-y-6">
              <Badge className="bg-emerald-100 text-emerald-800">Multi-Credit Revenue</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Track Every Environmental Credit Type
              </h2>
              <p className="text-lg text-slate-600">
                Manage all your environmental credit revenues in one place with complete visibility into generation, verification, and sales.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Carbon Credits:</strong> Woodland Carbon Code, Peatland Code with vintage tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>BNG Units:</strong> Statutory and tradable biodiversity net gain (habitat, hedgerow, watercourse)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Watercourse Units:</strong> Water quality credit generation and trading</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>NFM Credits:</strong> Natural flood management service payments</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Verification Status:</strong> Track pending, verified, and sold credits</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Buyer Management:</strong> Monitor contracts and delivery schedules</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Grant & Debt Funding */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 lg:order-2">
              <Badge className="bg-blue-100 text-blue-800">Grant & Debt Management</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Master Complex Funding Structures
              </h2>
              <p className="text-lg text-slate-600">
                Navigate the complex landscape of environmental project financing with confidence.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Grant Tracking:</strong> Monitor multiple grants with eligible spending categories</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Debt Facilities:</strong> Track private and government debt with covenant monitoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Equity Management:</strong> Manage investor capital and return expectations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Drawdown Schedules:</strong> Align funding availability with project phases</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Compliance Monitoring:</strong> Auto-check grant restrictions and debt covenants</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Reporting Automation:</strong> Generate funder reports on schedule</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 aspect-video flex items-center justify-center lg:order-1">
              <Building2 className="h-24 w-24 text-blue-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3: Financial Statements */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 aspect-video flex items-center justify-center">
              <FileText className="h-24 w-24 text-purple-600" />
            </div>
            <div className="space-y-6">
              <Badge className="bg-purple-100 text-purple-800">Professional Financials</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Professional Financial Statements, Automatically
              </h2>
              <p className="text-lg text-slate-600">
                Get bank-quality financial statements without the manual spreadsheet work.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Income Statement:</strong> Revenue by credit type, COGS, EBITDA, net income</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Balance Sheet:</strong> Proper accounting for credit inventory and long-term obligations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Cash Flow Statement:</strong> Operating, investing, and financing activities</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Statement of Changes in Equity:</strong> Track all capital movements</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Multi-Period Comparison:</strong> Compare to budget, prior period, and forecast</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Export Ready:</strong> Professional PDF and Excel formatting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 4: 30-Year Forecasting */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 lg:order-2">
              <Badge className="bg-yellow-100 text-yellow-800">30-Year Forecasting</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Model Your Project's Future
              </h2>
              <p className="text-lg text-slate-600">
                Plan for the long-term with sophisticated financial modeling built for environmental projects.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Credit Generation Curves:</strong> Model woodland carbon accretion and BNG unit delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Cash Flow Projections:</strong> 30-year forecasts for BNG and carbon obligations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Scenario Planning:</strong> Compare best case, worst case, and base case outcomes</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>NPV & IRR Calculations:</strong> Understand true project economics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Sensitivity Analysis:</strong> Test different credit prices and establishment success rates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Payback Period:</strong> Know when your project becomes cash positive</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-8 aspect-video flex items-center justify-center lg:order-1">
              <TrendingUp className="h-24 w-24 text-yellow-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 5: Compliance & Reporting */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-8 aspect-video flex items-center justify-center">
              <Shield className="h-24 w-24 text-green-600" />
            </div>
            <div className="space-y-6">
              <Badge className="bg-green-100 text-green-800">Compliance & Reporting</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Never Miss a Deadline
              </h2>
              <p className="text-lg text-slate-600">
                Stay on top of grant reports, covenant checks, and verification deadlines.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Compliance Calendar:</strong> All deadlines in one place</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Auto-Reminders:</strong> Email notifications before deadlines</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Grant Utilization:</strong> Monitor spending against eligible categories</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Covenant Monitoring:</strong> Auto-calculate debt service coverage ratios</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Status Dashboards:</strong> Green/amber/red compliance health indicators</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Audit Trail:</strong> Complete history of all financial changes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 6: Professional Reporting */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 lg:order-2">
              <Badge className="bg-indigo-100 text-indigo-800">Professional Reporting</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Impress Lenders and Investors
              </h2>
              <p className="text-lg text-slate-600">
                Create professional reports that meet lender and investor expectations.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Report Templates:</strong> Pre-built lender packages, grant compliance, investor updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>One-Click Generation:</strong> Comprehensive reports in seconds</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Customizable:</strong> Build your own report templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Multi-Format Export:</strong> PDF for presentation, Excel for analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Scheduled Reports:</strong> Auto-generate monthly/quarterly (coming soon)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Board-Ready:</strong> Professional formatting for any stakeholder</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl p-8 aspect-video flex items-center justify-center lg:order-1">
              <Download className="h-24 w-24 text-indigo-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Connects with Your Tools
            </h2>
            <Badge className="bg-slate-100 text-slate-600">Coming Soon</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {integrations.map((integration, idx) => (
              <Card key={idx} className="text-center hover:shadow-lg transition-shadow opacity-60">
                <CardContent className="pt-6">
                  <integration.icon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="font-medium text-slate-600">{integration.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-slate-500 mt-8">
            More integrations planned based on customer feedback
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            See Great Yellow in Action
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white hover:bg-slate-100 text-slate-900 font-semibold text-lg px-8 py-6"
              onClick={() => window.location.href = '/signup'}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white text-lg px-8 py-6">
              Watch Demo Video
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}