"use client";

import { useState } from "react";
import {
  Search,
  HelpCircle,
  BookOpen,
  CreditCard,
  User,
  Award,
  Video,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const categories = [
  { id: "getting-started", label: "Getting Started", icon: BookOpen },
  { id: "account", label: "Account & Profile", icon: User },
  { id: "courses", label: "Courses & Learning", icon: Video },
  { id: "payments", label: "Payments & Billing", icon: CreditCard },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "technical", label: "Technical Issues", icon: HelpCircle },
];

const faqs = [
  {
    category: "getting-started",
    question: "How do I create an account?",
    answer: "Creating an account is easy! Click the 'Sign Up' button at the top of the page, enter your email address and create a password. You can also sign up using your Google or social media accounts for faster registration.",
  },
  {
    category: "getting-started",
    question: "Is Training Suite free to use?",
    answer: "Training Suite offers both free and paid courses. You can browse our course catalog and access many free courses without any payment. Premium courses require a one-time purchase or subscription.",
  },
  {
    category: "getting-started",
    question: "How do I enroll in a course?",
    answer: "To enroll in a course, navigate to the course page and click the 'Enroll' button. For free courses, you'll have immediate access. For paid courses, you'll be prompted to complete the payment before gaining access.",
  },
  {
    category: "account",
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' on the login page and enter your email address. We'll send you a password reset link that's valid for 24 hours. Follow the link to create a new password.",
  },
  {
    category: "account",
    question: "Can I change my email address?",
    answer: "Yes, you can change your email address in your account settings. Go to Settings > Profile and update your email. You'll need to verify your new email address before the change takes effect.",
  },
  {
    category: "account",
    question: "How do I delete my account?",
    answer: "To delete your account, go to Settings > Account and scroll to the bottom to find the 'Delete Account' option. Please note that this action is irreversible and you'll lose access to all your courses and certificates.",
  },
  {
    category: "courses",
    question: "How long do I have access to a course after purchasing?",
    answer: "Once you purchase a course, you have lifetime access to all course materials, including any future updates the instructor makes. You can learn at your own pace without any time limits.",
  },
  {
    category: "courses",
    question: "Can I download course videos for offline viewing?",
    answer: "Currently, course videos are available for streaming only and cannot be downloaded. However, you can download supplementary materials like PDFs, worksheets, and code files if provided by the instructor.",
  },
  {
    category: "courses",
    question: "What if I'm not satisfied with a course?",
    answer: "We offer a 30-day money-back guarantee for all paid courses. If you're not satisfied with your purchase, you can request a refund within 30 days of enrollment, no questions asked.",
  },
  {
    category: "courses",
    question: "Can I access courses on mobile devices?",
    answer: "Yes! Training Suite is fully responsive and works on all devices. You can access your courses from your smartphone, tablet, or computer. We also have mobile apps available for iOS and Android.",
  },
  {
    category: "payments",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers in select regions. All payments are processed securely through our payment partners.",
  },
  {
    category: "payments",
    question: "Are there any hidden fees?",
    answer: "No, the price you see is the price you pay. There are no hidden fees or additional charges. Any applicable taxes will be displayed before checkout based on your location.",
  },
  {
    category: "payments",
    question: "How do I request a refund?",
    answer: "To request a refund, go to your purchase history in Settings > Payments, find the course, and click 'Request Refund'. Alternatively, contact our support team with your order details.",
  },
  {
    category: "certificates",
    question: "How do I earn a certificate?",
    answer: "To earn a certificate, you must complete all lessons in a course. Once completed, your certificate will be automatically generated.",
  },
  {
    category: "certificates",
    question: "Are certificates shareable on LinkedIn?",
    answer: "Yes! You can easily share your certificates on LinkedIn and other social media platforms. Each certificate has a unique URL that you can add to your LinkedIn profile.",
  },
  {
    category: "certificates",
    question: "Do certificates expire?",
    answer: "No, our certificates do not expire. Once earned, your certificate is yours forever and can be accessed from your profile at any time.",
  },
  {
    category: "technical",
    question: "Why can't I play videos?",
    answer: "If you're having trouble playing videos, try clearing your browser cache, disabling browser extensions, or using a different browser. Make sure your internet connection is stable. If the issue persists, contact our support team.",
  },
  {
    category: "technical",
    question: "The website is loading slowly. What should I do?",
    answer: "Try refreshing the page, clearing your browser cache, or using a different browser. Check your internet connection speed. If the problem continues, it might be a temporary server issue - please try again in a few minutes.",
  },
  {
    category: "technical",
    question: "How do I report a bug or issue?",
    answer: "You can report bugs through our contact form or by emailing support@trainingsuite.com. Please include details about the issue, your browser/device, and screenshots if possible to help us resolve it quickly.",
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !activeCategory || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions about Training Suite. Can't find what
            you're looking for? Contact our support team.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
            >
              All Topics
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
              >
                <cat.icon className="h-4 w-4 mr-2" />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No results found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or browse all categories
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory(null);
                    }}
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Still have questions?</CardTitle>
              <CardDescription>
                Can't find the answer you're looking for? Our support team is here
                to help.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:support@trainingsuite.com">
                  Email Us
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
