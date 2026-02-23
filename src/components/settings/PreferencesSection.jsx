import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { SlidersHorizontal, Save } from "lucide-react";

export default function PreferencesSection({ user, onUpdate }) {
  const [form, setForm] = useState({
    default_currency: user?.default_currency || "GBP",
    date_format: user?.date_format || "DD/MM/YYYY",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      default_currency: user?.default_currency || "GBP",
      date_format: user?.date_format || "DD/MM/YYYY",
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    toast.success("Preferences saved");
    setSaving(false);
    onUpdate?.();
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Default Currency</Label>
            <Select value={form.default_currency} onValueChange={(v) => setForm({ ...form, default_currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="GBP">GBP – British Pound (£)</SelectItem>
                <SelectItem value="USD">USD – US Dollar ($)</SelectItem>
                <SelectItem value="EUR">EUR – Euro (€)</SelectItem>
                <SelectItem value="CAD">CAD – Canadian Dollar</SelectItem>
                <SelectItem value="AUD">AUD – Australian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Date Format</Label>
            <Select value={form.date_format} onValueChange={(v) => setForm({ ...form, date_format: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (e.g. 23/02/2026)</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (e.g. 02/23/2026)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-02-23)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}