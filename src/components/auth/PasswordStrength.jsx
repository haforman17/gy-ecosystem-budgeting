import React from "react";

export default function PasswordStrength({ password }) {
  const calculateStrength = () => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      return { strength: 1, label: "Weak", color: "bg-red-500" };
    } else if (strength <= 4) {
      return { strength: 2, label: "Medium", color: "bg-yellow-500" };
    } else {
      return { strength: 3, label: "Strong", color: "bg-green-500" };
    }
  };

  const { strength, label, color } = calculateStrength();

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <div className={`h-1 flex-1 rounded ${strength >= 1 ? color : "bg-slate-200"}`} />
        <div className={`h-1 flex-1 rounded ${strength >= 2 ? color : "bg-slate-200"}`} />
        <div className={`h-1 flex-1 rounded ${strength >= 3 ? color : "bg-slate-200"}`} />
      </div>
      {label && (
        <p className="text-xs text-slate-600">
          Password strength: <span className="font-medium">{label}</span>
        </p>
      )}
    </div>
  );
}