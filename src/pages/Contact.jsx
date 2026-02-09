import React, { useState } from "react";
import PublicLayout from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Briefcase, Headphones, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    message_type: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "This field is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "This field is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message_type) {
      newErrors.message_type = "Please select a message type";
    }

    if (!formData.message.trim()) {
      newErrors.message = "This field is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Please enter at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await base44.entities.ContactMessage.create({
        ...formData,
        status: "NEW",
      });

      console.log("New contact message received:", formData);
      console.log("Email notification would be sent to admin");

      setIsSubmitted(true);
    } catch (error) {
      setErrors({ submit: "Failed to send message. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      message_type: "",
    });
    setIsSubmitted(false);
    setErrors({});
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Have questions? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Sales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Interested in Enterprise pricing or have questions before signing up? Reach out to our sales team.
                </p>
                <p className="text-sm font-medium text-slate-900">sales@greatyellow.io</p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:sales@greatyellow.io">Email Sales</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Need help with your account or have a technical question? Our support team is here to help.
                </p>
                <p className="text-sm font-medium text-slate-900">support@greatyellow.io</p>
                <Button variant="outline" className="w-full">
                  Visit Help Center
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Everything else—partnerships, press inquiries, or just to say hello.
                </p>
                <p className="text-sm font-medium text-slate-900">hello@greatyellow.io</p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:hello@greatyellow.io">Send Email</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Send Us a Message
          </h2>

          {isSubmitted ? (
            <Card>
              <CardContent className="py-12 text-center space-y-6">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">Thank You!</h3>
                  <p className="text-slate-600">
                    We've received your message and will get back to you within 24 hours.
                  </p>
                </div>
                <Button onClick={resetForm} variant="outline">
                  Send Another Message
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message_type">Message Type *</Label>
                    <Select
                      value={formData.message_type}
                      onValueChange={(value) => handleChange("message_type", value)}
                    >
                      <SelectTrigger className={errors.message_type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select message type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General Inquiry</SelectItem>
                        <SelectItem value="SUPPORT">Support Request</SelectItem>
                        <SelectItem value="SALES">Sales Question</SelectItem>
                        <SelectItem value="DEMO_REQUEST">Demo Request</SelectItem>
                        <SelectItem value="PARTNERSHIP">Partnership Opportunity</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.message_type && (
                      <p className="text-sm text-red-600">{errors.message_type}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject (Optional)</Label>
                    <Input
                      id="subject"
                      placeholder="Brief subject"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className={errors.message ? "border-red-500" : ""}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-600">{errors.message}</p>
                    )}
                  </div>

                  {errors.submit && (
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>

                  <p className="text-sm text-slate-500 text-center">
                    We typically respond within 24 hours on business days.
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Office Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Visit Us</h2>
            <div className="inline-flex items-center gap-3 text-slate-600">
              <MapPin className="h-5 w-5" />
              <p className="text-lg">Great Yellow Ltd, London, United Kingdom</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}