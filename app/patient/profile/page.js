"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";

export default function PatientProfilePage() {
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({
    inApp: true,
    email: true,
    whatsapp: false,
    sms: false,
  });
  const [field, setField] = useState("Phone Number");
  const [requestedValue, setRequestedValue] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setUser(d.user);
          if (d.user.notificationPreferences) {
            setPrefs(d.user.notificationPreferences);
          }
        }
      });
  }, []);

  async function savePrefs() {
    await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationPreferences: prefs }),
    });
    setMsg("Notification preferences updated.");
  }

  async function submitCorrection(e) {
    e.preventDefault();
    if (!user?.patientProfileId) return;
    const res = await fetch(`/api/patients/${user.patientProfileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correctionRequest: { field, requestedValue, reason },
      }),
    });
    if (res.ok) {
      setRequestedValue("");
      setReason("");
      setMsg("Correction request submitted for clinic staff review.");
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Profile & Notification Settings"
        subtitle="Manage your notification channels or submit a profile correction request for staff review"
      />

      {msg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Notification Preferences
          </h2>
          <div className="space-y-2.5 text-xs">
            {[
              { key: "inApp", label: "In-App Notifications" },
              { key: "email", label: "Email Reminders" },
              { key: "whatsapp", label: "WhatsApp Business Reminders" },
              { key: "sms", label: "SMS Reminders" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={prefs[item.key]}
                  onChange={(e) =>
                    setPrefs({ ...prefs, [item.key]: e.target.checked })
                  }
                />
                <span className="font-medium text-slate-800">{item.label}</span>
              </label>
            ))}
          </div>
          <button
            onClick={savePrefs}
            className="px-4 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
          >
            Save Preferences
          </button>
        </div>

        <form
          onSubmit={submitCorrection}
          className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
        >
          <h2 className="text-base font-semibold text-slate-900">
            Request Profile / Record Correction
          </h2>
          <p className="text-xs text-slate-500">
            Clinical records cannot be edited directly by patients. Submit a
            request for clinic staff verification.
          </p>
          <input
            type="text"
            required
            placeholder="Field to update (e.g., Address, Phone)"
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <input
            type="text"
            required
            placeholder="New / Corrected Value"
            value={requestedValue}
            onChange={(e) => setRequestedValue(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <textarea
            rows={2}
            placeholder="Reason for correction"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
          >
            Submit for Review
          </button>
        </form>
      </div>
    </AppShell>
  );
}
