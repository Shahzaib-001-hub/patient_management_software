"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import { ClipboardList } from "lucide-react";

export default function PatientTreatmentPage() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch("/api/treatment-plans")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.plans && setPlans(d.plans));
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="My Treatment Plan"
        subtitle="Doctor-authored diagnosis, treatment goals, recommendations, and prescribed medications (Read-Only)"
      />

      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-500">
            No treatment plans assigned yet.
          </div>
        ) : (
          plans.map((tp) => (
            <div
              key={tp._id}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#283983]" />
                  <h2 className="text-base font-semibold text-slate-900">
                    {tp.title}
                  </h2>
                </div>
                <Badge variant={statusBadgeVariant(tp.status)}>{tp.status}</Badge>
              </div>
              <p className="text-xs text-slate-700">
                <strong>Doctor:</strong> {tp.doctorId?.name}
              </p>
              <div className="p-3.5 rounded-lg bg-[#F5F8FC] text-xs space-y-1.5">
                <p>
                  <strong>Diagnosis:</strong> {tp.diagnosis}
                </p>
                <p>
                  <strong>Goals:</strong> {tp.goals}
                </p>
                <p>
                  <strong>Recommendations:</strong> {tp.recommendations}
                </p>
              </div>
              {tp.medications?.length > 0 && (
                <div className="text-xs">
                  <strong className="block mb-1">Prescribed Medications</strong>
                  <ul className="space-y-1">
                    {tp.medications.map((m, i) => (
                      <li key={i} className="p-2 rounded bg-slate-50 border border-slate-200">
                        {m.name} {m.dosage} — {m.frequency} ({m.duration}){" "}
                        {m.instructions && `• ${m.instructions}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
