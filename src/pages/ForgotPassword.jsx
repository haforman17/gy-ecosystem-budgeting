import React, { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation:
      // 1. Check if email exists
      // 2. Generate reset token
      // 3. Save token with expiry (1 hour)
      // 4. Send reset email
      
      console.log("Password reset requested for:", email);
      console.log("Reset email would be sent to:", email);
      
      setIsSubmitted(true);
      
      // Auto-redirect after 5 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 5000);
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout rightLink={{ text: "Remember your password? Log in", href: "/login" }}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <p className="text-sm text-slate-500 mt-2">
            {isSubmitted 
              ? "Check your email" 
              : "Enter your email address and we'll send you a reset link"}
          </p>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center space-y-6 py-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <p className="text-slate-600">
                  If an account exists with that email, you'll receive password reset instructions shortly.
                </p>
                <p className="text-sm text-slate-500">
                  Check your inbox and spam folder.
                </p>
              </div>
              <Button variant="outline" asChild className="w-full">
                <a href="/login">Return to Login</a>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={error ? "border-red-500" : ""}
                />
                {error && (
                  <p className="text-xs text-red-600">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>

              <p className="text-center text-sm text-slate-600">
                Remember your password?{" "}
                <a href="/login" className="text-blue-600 hover:underline font-medium">
                  Log in
                </a>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}