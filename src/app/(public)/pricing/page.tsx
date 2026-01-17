"use client";

import Link from "next/link";
import { Check, X, Zap, Building2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started with learning",
    price: 0,
    period: "forever",
    icon: GraduationCap,
    features: [
      { name: "Access to free courses", included: true },
      { name: "Basic progress tracking", included: true },
      { name: "Community forum access", included: true },
      { name: "Email support", included: true },
      { name: "Premium courses", included: false },
      { name: "Certificate of completion", included: false },
      { name: "Live sessions access", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started",
    ctaLink: "/register",
    popular: false,
  },
  {
    name: "Pro",
    description: "Best for serious learners and professionals",
    price: 29,
    period: "month",
    icon: Zap,
    features: [
      { name: "Access to all courses", included: true },
      { name: "Advanced progress tracking", included: true },
      { name: "Community forum access", included: true },
      { name: "Priority email support", included: true },
      { name: "Unlimited premium courses", included: true },
      { name: "Certificates of completion", included: true },
      { name: "Live sessions access", included: true },
      { name: "Downloadable resources", included: true },
    ],
    cta: "Start Free Trial",
    ctaLink: "/register?plan=pro",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For teams and organizations",
    price: null,
    period: "custom",
    icon: Building2,
    features: [
      { name: "Everything in Pro", included: true },
      { name: "Custom learning paths", included: true },
      { name: "Team management dashboard", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Custom course creation", included: true },
      { name: "API access", included: true },
      { name: "SSO integration", included: true },
      { name: "SLA & priority support", included: true },
    ],
    cta: "Contact Sales",
    ctaLink: "/contact?subject=enterprise",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and in some regions, local payment methods through our payment partners.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, the Pro plan comes with a 7-day free trial. You won't be charged until the trial period ends.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
  },
  {
    question: "Do certificates expire?",
    answer: "No, certificates you earn are yours forever. You can share and verify them at any time.",
  },
  {
    question: "What happens to my progress if I cancel?",
    answer: "Your progress is saved and will be available if you resubscribe. However, you'll lose access to premium content.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="container max-w-6xl text-center">
          <Badge className="mb-4 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30">
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Choose the plan that fits your learning goals. Start free and upgrade as you grow.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container max-w-6xl py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={cn(
                  "relative overflow-hidden",
                  plan.popular && "border-primary shadow-lg scale-105"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-primary">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-1">
                    {plan.price !== null ? (
                      <>
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.period}</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold">Custom</span>
                    )}
                  </div>

                  <Button
                    asChild
                    size="lg"
                    className={cn("w-full", plan.popular ? "" : "variant-outline")}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    <Link href={plan.ctaLink}>{plan.cta}</Link>
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature.name} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-600 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            !feature.included && "text-muted-foreground"
                          )}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Individual Course Pricing */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Prefer to pay per course?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Not ready for a subscription? You can also purchase individual courses
            starting from $9.99. Each purchase gives you lifetime access to that course.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-muted/30 py-16">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of learners who are advancing their skills with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
