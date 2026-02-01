/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  HelpCircle,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { T, useT } from "@/components/t";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Send us an email anytime",
    value: "support@trainingsuite.com",
    href: "mailto:support@trainingsuite.com",
  },
  {
    icon: Phone,
    title: "Phone",
    description: "Mon-Fri from 9am to 5pm",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    icon: MapPin,
    title: "Office",
    description: "Visit our headquarters",
    value: "123 Learning Street, Education City, EC 12345",
    href: "#",
  },
];

const supportCategories = [
  { value: "general", label: "General Inquiry" },
  { value: "technical", label: "Technical Support" },
  { value: "billing", label: "Billing & Payments" },
  { value: "courses", label: "Course Content" },
  { value: "partnership", label: "Partnership Inquiry" },
  { value: "other", label: "Other" },
];

export default function ContactPage() {
  const { toast } = useToast();
  const { t } = useT();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: t("Message sent!"),
      description: t("We'll get back to you as soon as possible."),
      variant: "success",
    });

    setFormData({
      name: "",
      email: "",
      category: "",
      subject: "",
      message: "",
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="py-14 sm:py-20 md:py-24 border-b border-gray-200">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4"><T>Contact Us</T></h1>
          <p className="font-sans text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            <T>Have a question or need help? We&apos;re here for you. Reach out to our team and we&apos;ll get back to you as soon as possible.</T>
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 border-b border-gray-200">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <Card key={method.title} className="border-gray-200 rounded-[12px] shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-[10px] bg-[#0052CC]/10 flex items-center justify-center">
                      <method.icon className="h-6 w-6 text-[#0052CC]" />
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-black">{t(method.title)}</h3>
                      <p className="font-sans text-sm text-gray-600 mb-2">
                        {t(method.description)}
                      </p>
                      <a
                        href={method.href}
                        className="font-sans text-[#0052CC] hover:underline text-sm font-medium"
                      >
                        {method.value}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-sans text-2xl font-bold text-black mb-2"><T>Send us a message</T></h2>
              <p className="font-sans text-gray-600 mb-8">
                <T>Fill out the form below and we&apos;ll respond within 24-48 hours.</T>
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name"><T>Full Name</T> *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder={t("John Doe")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email"><T>Email Address</T> *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category"><T>Category</T> *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select category")} />
                      </SelectTrigger>
                      <SelectContent>
                        {supportCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {t(cat.label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject"><T>Subject</T> *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder={t("How can we help?")}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message"><T>Message</T> *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder={t("Tell us more about your inquiry...")}
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto rounded-[10px] h-11 px-8 bg-[#0052CC] hover:bg-[#0052CC]/90 text-white font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <T>Sending...</T>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      <T>Send Message</T>
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div>
              <h2 className="font-sans text-2xl font-bold text-black mb-2"><T>Quick Help</T></h2>
              <p className="font-sans text-gray-600 mb-8">
                <T>Find answers to common questions or explore our resources.</T>
              </p>

              <div className="space-y-4">
                <Card className="border-gray-200 rounded-[12px] shadow-sm">
                  <CardContent className="py-4">
                    <Link
                      href="/faq"
                      className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-[10px] bg-[#0052CC]/10 flex items-center justify-center">
                        <HelpCircle className="h-5 w-5 text-[#0052CC]" />
                      </div>
                      <div>
                        <h3 className="font-semibold"><T>Frequently Asked Questions</T></h3>
                        <p className="text-sm text-muted-foreground">
                          <T>Find answers to common questions</T>
                        </p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 rounded-[12px] shadow-sm">
                  <CardContent className="py-4">
                    <Link
                      href="/courses"
                      className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-[10px] bg-[#0052CC]/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-[#0052CC]" />
                      </div>
                      <div>
                        <h3 className="font-semibold"><T>Browse Courses</T></h3>
                        <p className="text-sm text-muted-foreground">
                          <T>Explore our course catalog</T>
                        </p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 rounded-[12px] shadow-sm">
                  <CardContent className="py-4">
                    <Link
                      href="/about"
                      className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-[10px] bg-[#0052CC]/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#0052CC]" />
                      </div>
                      <div>
                        <h3 className="font-semibold"><T>About Us</T></h3>
                        <p className="text-sm text-muted-foreground">
                          <T>Learn more about our mission</T>
                        </p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-8 border-gray-200 rounded-[12px] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-sans text-lg font-bold text-black"><T>Business Hours</T></CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-sans space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span><T>Monday - Friday</T></span>
                      <span>9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span><T>Saturday</T></span>
                      <span>10:00 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span><T>Sunday</T></span>
                      <span><T>Closed</T></span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-gray-500 mt-4">
                    <T>* Response times may vary during holidays</T>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
