import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [isValidToken, setIsValidToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    
    if (!urlToken) {
      setIsValidToken(false);
      return;
    }

    setToken(urlToken);
    
    // In a real implementation, validate token with backend
    // For now, simulate validation
    setTimeout(() => {
      setIsValidToken(true); // Assume valid for demo
    }, 500);
  }, []);

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters with uppercase, lowercase, and number";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      // In a real implementation:
      // 1. Verify token is still valid
      // 2. Hash new password
      // 3. Update user record
      // 4. Clear reset token
      
      console.log("Resetting password with token:", token);
      
      setIsSuccess(true);
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setErrors({ submit: "Failed to reset password. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: "Minimum 8 characters" },
    { met: /[A-Z]/.test(formData.password), text: "At least one uppercase letter" },
    { met: /[a-z]/.test(formData.password), text: "At least one lowercase letter" },
    { met: /[0-9]/.test(formData.password), text: "At least one number" },
  ];

  if (isValidToken === null) {
    return (
      <AuthLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">Validating reset link...</p>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  if (isValidToken === false) {
    return (
      <AuthLayout>
        <Card>
          <CardContent className="py-12 text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">Invalid Reset Link</h3>
              <p className="text-slate-600">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>
            <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
              <a href="/forgot-password">Request New Link</a>
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isSuccess ? "Password Reset Successful" : "Create New Password"}
          </CardTitle>
          {!isSuccess && (
            <p className="text-sm text-slate-500 mt-2">Enter your new password below</p>
          )}
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-6 py-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <p className="text-slate-600">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
                <p className="text-sm text-slate-500">
                  Redirecting to login in 3 seconds...
                </p>
              </div>
              <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900">
                <a href="/login">Log In Now</a>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={formData.password} />
                {formData.password && (
                  <div className="space-y-1">
                    {passwordRequirements.map((req, idx) => (
                      <p key={idx} className={`text-xs ${req.met ? "text-green-600" : "text-slate-500"}`}>
                        {req.met ? "✓" : "○"} {req.text}
                      </p>
                    ))}
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {errors.submit && (
                <p className="text-sm text-red-600 text-center">{errors.submit}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}