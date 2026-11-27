"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.settings && setSettings(d.settings));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) setSaved(true);
  }

  return (
    <AppShell>
      <PageHeader
        title="Clinic Settings"
        subtitle="Configure Pain Relief & Wellness Center operating hours, currency, and defaults"
      />
      {settings && (
        <form
          onSubmit={handleSave}
          className="max-w-2xl bg-white rounded-xl border border-slate-200 p-6 space-y-4"
        >
          {saved && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
              Clinic settings saved successfully.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinic Name
              </label>
              <input
                type="text"
                value={settings.clinicName}
                onChange={(e) =>
                  setSettings({ ...settings, clinicName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Currency
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) =>
                  setSettings({ ...settings, defaultCurrency: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
              >
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Consultation Duration (mins)
              </label>
              <input
                type="number"
                value={settings.defaultConsultationDuration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultConsultationDuration: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#283983] text-white text-xs font-semibold hover:bg-[#1d2a66]"
          >
            Save Configuration
          </button>
        </form>
      )}
    </AppShell>
  );
}
