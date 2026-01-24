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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6"><T>Contact Us</T></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            <T>Have a question or need help? We're here for you. Reach out to our team and we'll get back to you as soon as possible.</T>
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <Card key={method.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                      <method.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t(method.title)}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {t(method.description)}
                      </p>
                      <a
                        href={method.href}
                        className="text-primary hover:underline text-sm font-medium"
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

      {/* Contact Form & FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-2"><T>Send us a message</T></h2>
              <p className="text-muted-foreground mb-8">
                <T>Fill out the form below and we'll respond within 24-48 hours.</T>
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
                  className="w-full sm:w-auto"
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

            {/* Quick Links */}
            <div>
              <h2 className="text-2xl font-bold mb-2"><T>Quick Help</T></h2>
              <p className="text-muted-foreground mb-8">
                <T>Find answers to common questions or explore our resources.</T>
              </p>

              <div className="space-y-4">
                <Card>
                  <CardContent className="py-4">
                    <Link
                      href="/faq"
                      className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-100 flex items-center justify-center">
                        <HelpCircle className="h-5 w-5 text-blue-600" />
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

                <Card>
                  <CardContent className="py-4">
                    <Link
                      href="/courses"
                      className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-green-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-green-600" />
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

                <Card>
                  <CardContent className="py-4">
                    <Link
                      href="/about"
                      className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
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

              {/* Business Hours */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-lg"><T>Business Hours</T></CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground"><T>Monday - Friday</T></span>
                      <span>9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground"><T>Saturday</T></span>
                      <span>10:00 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground"><T>Sunday</T></span>
                      <span><T>Closed</T></span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
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
