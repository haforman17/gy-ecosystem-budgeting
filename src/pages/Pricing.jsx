import React, { useState } from "react";
import PublicLayout from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  ArrowRight,
  Shield,
  Lock,
  CheckCircle2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const tiers = [
    {
      name: "Free Trial",
      price: "£0",
      duration: "14 days",
      badge: "Try Before You Buy",
      cta: "Start Free Trial",
      highlight: false,
      features: [
        "All features unlocked",
        "Up to 2 projects",
        "Unlimited users",
        "Full financial statements",
        "Report generation",
        "Email support",
        "No credit card required",
      ],
    },
    {
      name: "Starter",
      price: isAnnual ? "£490" : "£49",
      duration: isAnnual ? "per year" : "per month",
      savings: isAnnual ? "Save £98/year" : null,
      bestFor: "Individual project managers",
      cta: "Choose Starter",
      highlight: false,
      features: [
        "Everything in Free Trial, plus:",
        "Up to 5 projects",
        "Unlimited users",
        "10GB storage",
        "Priority email support",
        "Custom report templates",
        "30-day money-back guarantee",
      ],
    },
    {
      name: "Professional",
      price: isAnnual ? "£1,490" : "£149",
      duration: isAnnual ? "per year" : "per month",
      savings: isAnnual ? "Save £298/year" : null,
      badge: "Most Popular",
      bestFor: "Conservation organizations",
      cta: "Choose Professional",
      highlight: true,
      features: [
        "Everything in Starter, plus:",
        "Up to 25 projects",
        "50GB storage",
        "Multi-project portfolio view",
        "Advanced forecasting",
        "API access (coming soon)",
        "Phone & email support",
        "Onboarding assistance",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      duration: "pricing",
      bestFor: "Large land managers",
      cta: "Contact Sales",
      highlight: false,
      features: [
        "Everything in Professional, plus:",
        "Unlimited projects",
        "Unlimited storage",
        "Dedicated account manager",
        "Custom integrations",
        "On-premise deployment option",
        "SLA guarantee",
        "Training & onboarding",
        "Custom contracts",
      ],
    },
  ];

  const comparisonFeatures = [
    { name: "Number of Projects", trial: "2", starter: "5", pro: "25", enterprise: "Unlimited" },
    { name: "Number of Users", trial: "Unlimited", starter: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Storage", trial: "1GB", starter: "10GB", pro: "50GB", enterprise: "Unlimited" },
    { name: "Financial Statements", trial: true, starter: true, pro: true, enterprise: true },
    { name: "30-Year Forecasting", trial: true, starter: true, pro: true, enterprise: true },
    { name: "Scenario Planning", trial: true, starter: true, pro: true, enterprise: true },
    { name: "Report Generation", trial: true, starter: true, pro: true, enterprise: true },
    { name: "Custom Report Templates", trial: false, starter: true, pro: true, enterprise: true },
    { name: "Portfolio View", trial: false, starter: false, pro: true, enterprise: true },
    { name: "API Access", trial: false, starter: false, pro: "Coming Soon", enterprise: true },
    { name: "Support", trial: "Email", starter: "Priority Email", pro: "Phone & Email", enterprise: "Dedicated Manager" },
    { name: "Onboarding", trial: "Self-service", starter: "Self-service", pro: "Assisted", enterprise: "White-glove" },
  ];

  const faqs = [
    {
      question: "How does the 14-day free trial work?",
      answer: "The free trial gives you full access to all Great Yellow features for 14 days. No credit card required. At the end of your trial, you can choose a plan or your account will be paused (your data saved for 30 days).",
    },
    {
      question: "Can I change plans later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "You can export all your data before canceling. We retain your data for 30 days after cancellation in case you want to reactivate.",
    },
    {
      question: "Do you offer discounts for nonprofits?",
      answer: "Yes! Registered charities and nonprofits receive 25% off all paid plans. Contact us with your charity registration details.",
    },
    {
      question: "Is my financial data secure?",
      answer: "Absolutely. We use bank-level encryption (AES-256), secure data centers, and regular security audits. Your data is yours and never shared.",
    },
    {
      question: "Can I add more users to my account?",
      answer: "All paid plans include unlimited users at no extra cost. Collaborate with your team freely.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, Amex). Annual plans can be paid via Direct Debit or invoice (Professional and Enterprise tiers).",
    },
    {
      question: "Do you offer training or onboarding?",
      answer: "Professional plans include onboarding assistance. Enterprise plans include comprehensive training. All plans have access to our help documentation and video tutorials.",
    },
    {
      question: "Can I get a demo before signing up?",
      answer: "Yes! Contact us to schedule a personalized demo with our team. Or start your free trial to explore on your own.",
    },
    {
      question: "What if I need more than 25 projects?",
      answer: "Upgrade to Enterprise for unlimited projects, or contact us to discuss a custom plan.",
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Transparent Pricing for Projects of All Sizes
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center gap-4">
            <span className={`text-lg font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-yellow-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-emerald-100 text-emerald-800">Save 17%</Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tiers.map((tier, idx) => (
              <Card
                key={idx}
                className={`relative ${
                  tier.highlight
                    ? 'border-2 border-yellow-500 shadow-xl'
                    : 'border border-slate-200'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-slate-900 px-4 py-1">
                      {tier.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                    <span className="text-slate-600 ml-2">{tier.duration}</span>
                  </div>
                  {tier.savings && (
                    <p className="text-sm text-emerald-600 font-medium">{tier.savings}</p>
                  )}
                  {tier.bestFor && (
                    <p className="text-sm text-slate-500 mt-2">Best for: {tier.bestFor}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button
                    className={`w-full ${
                      tier.highlight
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900'
                        : idx === 0
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {tier.cta}
                  </Button>
                  <ul className="space-y-3">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Free Trial</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Starter</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 bg-yellow-50">Professional</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {comparisonFeatures.map((feature, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{feature.name}</td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.trial === 'boolean' ? (
                        feature.trial ? (
                          <Check className="h-5 w-5 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-slate-700">{feature.trial}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.starter === 'boolean' ? (
                        feature.starter ? (
                          <Check className="h-5 w-5 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-slate-700">{feature.starter}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center bg-yellow-50">
                      {typeof feature.pro === 'boolean' ? (
                        feature.pro ? (
                          <Check className="h-5 w-5 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-slate-700">{feature.pro}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.enterprise === 'boolean' ? (
                        feature.enterprise ? (
                          <Check className="h-5 w-5 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-slate-700">{feature.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border border-slate-200 rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-slate-900 hover:text-emerald-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <p className="font-semibold text-slate-900">30-Day Money-Back</p>
                <p className="text-sm text-slate-500">Guarantee</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <p className="font-semibold text-slate-900">No Long-Term</p>
                <p className="text-sm text-slate-500">Contracts</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Lock className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <p className="font-semibold text-slate-900">Bank-Level</p>
                <p className="text-sm text-slate-500">Security</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="font-semibold text-slate-900">GDPR</p>
                <p className="text-sm text-slate-500">Compliant</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Start Your Free Trial Today
          </h2>
          <p className="text-lg text-slate-800 mb-8">
            No credit card required. Full access for 14 days.
          </p>
          <Button 
            size="lg" 
            className="bg-white hover:bg-slate-100 text-slate-900 font-semibold text-lg px-12 py-6"
            onClick={() => window.location.href = '/signup'}
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}