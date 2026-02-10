import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  Calculator,
  TrendingUp,
  FileText,
  Shield,
  Download,
  Layers,
  CheckSquare,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Building2,
  Users,
  Briefcase,
  TreeDeciduous,
} from "lucide-react";

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-yellow-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Financial Management Built for{" "}
                  <span className="text-emerald-700">Land Restoration</span> Projects
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                  Track carbon credits, BNG units, grant funding, and debt financing in one powerful tool designed specifically for nature-based services.
                </p>
              </div>


            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-4 border border-slate-200">
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-yellow-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Leaf className="h-24 w-24 text-emerald-600 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-500 mb-8">
            Trusted by land restoration projects across the UK
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
            <div className="text-xl font-semibold text-slate-400">Woodland Trust</div>
            <div className="text-xl font-semibold text-slate-400">Wildlife Trusts</div>
            <div className="text-xl font-semibold text-slate-400">Natural England</div>
            <div className="text-xl font-semibold text-slate-400">The Nature Conservancy</div>
            <div className="text-xl font-semibold text-slate-400">Forestry Commission</div>
          </div>
          <p className="text-center text-sm text-slate-600 mt-8 font-medium">
            Join 50+ projects managing £25M+ in environmental credits
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Managing Complex Environmental Finance Shouldn't Be Complicated
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <Layers className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Multiple Credit Types</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Juggling carbon credits, BNG units, watercourse credits, and NFM payments across different buyers and contracts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <CheckSquare className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Compliance Burden</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Meeting grant reporting requirements, debt covenant checks, and verification deadlines without missing a beat.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Long-Term Forecasting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Projecting 30-year revenue streams from evolving environmental credit markets with confidence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              One Tool. Complete Financial Clarity.
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Purpose-built for nature-based services, Great Yellow brings professional financial management to land restoration projects.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Badge className="bg-emerald-100 text-emerald-800">Multi-Credit Revenue</Badge>
              <h3 className="text-2xl font-bold text-slate-900">Track Every Environmental Credit Type</h3>
              <p className="text-lg text-slate-600">
                Carbon, BNG, watercourse, and NFM credits in one place with verification status and buyer management.
              </p>
              <div className="bg-gradient-to-br from-emerald-100 to-yellow-100 rounded-xl p-8 aspect-video flex items-center justify-center">
                <TrendingUp className="h-16 w-16 text-emerald-600" />
              </div>
            </div>

            <div className="space-y-6">
              <Badge className="bg-blue-100 text-blue-800">Grant & Debt Management</Badge>
              <h3 className="text-2xl font-bold text-slate-900">Master Complex Funding Structures</h3>
              <p className="text-lg text-slate-600">
                Monitor grants, debt covenants, and equity investments with automated compliance tracking.
              </p>
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-8 aspect-video flex items-center justify-center">
                <Building2 className="h-16 w-16 text-blue-600" />
              </div>
            </div>

            <div className="space-y-6">
              <Badge className="bg-purple-100 text-purple-800">Professional Financials</Badge>
              <h3 className="text-2xl font-bold text-slate-900">Automated Financial Statements</h3>
              <p className="text-lg text-slate-600">
                Income statements, balance sheets, and cash flow statements generated automatically from your data.
              </p>
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-8 aspect-video flex items-center justify-center">
                <FileText className="h-16 w-16 text-purple-600" />
              </div>
            </div>

            <div className="space-y-6">
              <Badge className="bg-yellow-100 text-yellow-800">30-Year Forecasting</Badge>
              <h3 className="text-2xl font-bold text-slate-900">Model Your Project's Future</h3>
              <p className="text-lg text-slate-600">
                Credit generation curves, scenario planning, NPV and IRR calculations for long-term planning.
              </p>
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-8 aspect-video flex items-center justify-center">
                <TrendingUp className="h-16 w-16 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Budget Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Build detailed project budgets with restoration-specific categories and track spending in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Revenue Streams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Track multiple environmental credit types, verification status, and buyer contracts.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Funding Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Manage grants, debt facilities, and equity investments with compliance monitoring.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Financial Statements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Auto-generated Income Statement, Balance Sheet, Cash Flow, and Equity Statement.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Compliance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Never miss a grant report, covenant check, or verification deadline.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Professional Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Export PDF and Excel reports for lenders, investors, and grant administrators.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Get Started in Minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 rounded-full bg-yellow-500 text-slate-900 font-bold text-2xl items-center justify-center mb-4">
                1
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto">
                <TreeDeciduous className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Set Up Your Project</h3>
              <p className="text-slate-600">
                Add your restoration project details, budget, and funding sources in minutes.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 rounded-full bg-yellow-500 text-slate-900 font-bold text-2xl items-center justify-center mb-4">
                2
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Track Revenue & Funding</h3>
              <p className="text-slate-600">
                Monitor credit generation, sales, and funding drawdowns as your project progresses.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 rounded-full bg-yellow-500 text-slate-900 font-bold text-2xl items-center justify-center mb-4">
                3
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Report with Confidence</h3>
              <p className="text-slate-600">
                Generate professional reports for stakeholders in seconds, not hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Built for Nature-Based Service Professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <TreeDeciduous className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle>Land Restoration Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Manage multiple revenue streams, funding sources, and compliance requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Conservation Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Track grants, demonstrate impact, and report to funders with ease.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Estate Managers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Diversify estate income with environmental credits while maintaining financial clarity.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>Environmental Consultants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Deliver comprehensive financial insights and planning to your clients.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-6 italic">
                  "Great Yellow transformed how we manage our woodland carbon project. The grant compliance tracking alone saves us hours every month."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                    SJ
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Sarah Johnson</p>
                    <p className="text-sm text-slate-500">Project Manager, Oxfordshire Woodland Trust</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-6 italic">
                  "Finally, a tool that understands BNG obligations and 30-year forecasting. The lender reports are exactly what our bank needs."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                    MC
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Michael Chen</p>
                    <p className="text-sm text-slate-500">Finance Director, Somerset Land Restoration Ltd</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-6 italic">
                  "As a consultant, Great Yellow helps me deliver better financial planning to my clients. The scenario modeling is invaluable."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">
                    EW
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Emma Williams</p>
                    <p className="text-sm text-slate-500">Environmental Consultant, Green Future Consulting</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>




    </PublicLayout>
  );
}