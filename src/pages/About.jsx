import React from "react";
import PublicLayout from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Eye, HeadphonesIcon, ArrowRight, Linkedin } from "lucide-react";

export default function About() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Financial Clarity for Nature-Based Services
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We're on a mission to make environmental finance accessible and transparent.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Our Mission</h2>
              <div className="space-y-4 text-lg text-slate-600">
                <p>
                  Land restoration projects are critical to addressing climate change and biodiversity loss. These projects generate valuable environmental credits—carbon credits, biodiversity net gain units, water quality credits, and flood management services—that provide essential revenue streams.
                </p>
                <p>
                  Yet managing the complex financial structures remains unnecessarily difficult. Project managers juggle multiple spreadsheets, struggle with grant compliance, and spend countless hours creating reports for lenders and investors.
                </p>
                <p>
                  Great Yellow exists to change that. We believe project managers should spend their time restoring nature, not wrestling with financial administration. Our tool brings professional-grade financial management to the nature-based services sector, making it easier to secure funding, meet compliance requirements, and demonstrate impact to stakeholders.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-yellow-100 rounded-2xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="h-32 w-32 rounded-full bg-white/80 flex items-center justify-center mx-auto mb-4">
                  <span className="text-6xl">🌳</span>
                </div>
                <p className="text-slate-700 font-medium">Nature Restoration in Action</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 aspect-video flex items-center justify-center lg:order-2">
              <div className="text-center">
                <div className="h-32 w-32 rounded-full bg-white/80 flex items-center justify-center mx-auto mb-4">
                  <span className="text-6xl">💡</span>
                </div>
                <p className="text-slate-700 font-medium">Built by Professionals</p>
              </div>
            </div>
            <div className="space-y-6 lg:order-1">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Built by People Who Understand Your Work
              </h2>
              <div className="space-y-4 text-lg text-slate-600">
                <p>
                  Great Yellow was founded by professionals who have worked directly in land restoration and environmental finance. We've experienced firsthand the challenges of managing woodland carbon projects, navigating BNG obligations, reporting to grant funders, and satisfying lender covenants.
                </p>
                <p>
                  After years of building custom spreadsheets, missing compliance deadlines, and struggling to forecast 30-year revenue streams, we decided there had to be a better way. We built Great Yellow to be the tool we wish we'd had—purpose-built for the unique needs of projects generating environmental credits.
                </p>
                <p>
                  Today, Great Yellow helps restoration projects across the UK manage millions of pounds in environmental credits, ensuring they have the financial clarity needed to succeed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-12 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">Purpose-Built</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  We focus exclusively on nature-based services, not generic project management. Every feature is designed for environmental credit projects.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Transparent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  No hidden fees, clear pricing, and your data is always yours. We believe in honest, straightforward business practices.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <HeadphonesIcon className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Support-Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  We're here to help you succeed. Our team provides responsive, expert support from people who understand your work.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-12 text-center">
            Meet the Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center mx-auto text-white text-3xl font-bold">
                  JD
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">John Doe</h3>
                  <p className="text-sm text-slate-500 mb-3">Founder & CEO</p>
                  <p className="text-sm text-slate-600">
                    Former environmental consultant with 10+ years managing land restoration projects. Built Great Yellow to solve the financial management challenges faced by every nature-based service project.
                  </p>
                </div>
                <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
                  <Linkedin className="h-5 w-5" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-2 border-dashed border-slate-300">
              <CardContent className="pt-6 space-y-4 flex flex-col justify-center h-full">
                <div className="h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 text-5xl">
                  👋
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">We're Hiring!</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Join us in supporting nature restoration. We're looking for talented people who care about environmental impact.
                  </p>
                  <Button variant="outline">View Open Positions</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-12 text-center">
            Our Impact
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="pt-6">
                <p className="text-5xl font-bold text-emerald-700 mb-2">£25M+</p>
                <p className="text-lg text-slate-700 font-medium">
                  in Environmental Credits Managed
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-5xl font-bold text-blue-700 mb-2">50+</p>
                <p className="text-lg text-slate-700 font-medium">
                  Restoration Projects Supported
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="pt-6">
                <p className="text-5xl font-bold text-yellow-700 mb-2">10,000+</p>
                <p className="text-lg text-slate-700 font-medium">
                  Hectares Under Management
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Join Us in Supporting Nature Restoration
          </h2>
          <p className="text-xl text-slate-800 mb-8">
            Help restore nature with better financial management
          </p>
          <Button size="lg" className="bg-white hover:bg-slate-100 text-slate-900 font-semibold text-lg px-12 py-6">
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}