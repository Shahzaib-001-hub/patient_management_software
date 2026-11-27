"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import {
  Calendar,
  ClipboardList,
  Dumbbell,
  CreditCard,
  FileText,
  Video,
} from "lucide-react";

export default function PatientDashboardPage() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setUser(d.user);
          if (d.user.patientProfileId) {
            fetch(`/api/patients/${d.user.patientProfileId}`)
              .then((res) => (res.ok ? res.json() : null))
              .then((pd) => pd && setData(pd));
          }
        }
      });
  }, []);

  const nextAppt = (data?.appointments || []).find(
    (a) =>
      new Date(a.scheduledAt) >= new Date(Date.now() - 3600000) &&
      !["cancelled", "completed"].includes(a.status)
  );
  const activeRehab = (data?.rehabPlans || []).filter(
    (r) => r.status === "active"
  );
  const activePlans = (data?.treatmentPlans || []).filter(
    (t) => t.status === "active"
  );
  const unpaidBalance = (data?.invoices || []).reduce(
    (sum, inv) => sum + (inv.balanceDue || 0),
    0
  );

  return (
    <AppShell>
      <PageHeader
        title={`Welcome, ${user?.name || "Patient"}`}
        subtitle={
          data?.patient?.patientId
            ? `Patient ID: ${data.patient.patientId} • Pain Relief & Wellness Center`
            : "Your personal pain care & rehabilitation portal"
        }
        actions={
          <Link
            href="/patient/appointments"
            className="px-4 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
          >
            Request Appointment
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Next Appointment"
          value={
            nextAppt
              ? new Date(nextAppt.scheduledAt).toLocaleDateString()
              : "None"
          }
          subtitle={nextAppt ? nextAppt.type.replace(/_/g, " ") : "Book a visit"}
          icon={Calendar}
          tone="primary"
        />
        <StatCard
          title="Active Treatment"
          value={activePlans.length}
          subtitle="Doctor-managed plans"
          icon={ClipboardList}
          tone="success"
        />
        <StatCard
          title="Assigned Exercises"
          value={activeRehab.reduce(
            (s, r) => s + (r.exercises?.length || 0),
            0
          )}
          subtitle={`${activeRehab.length} active program(s)`}
          icon={Dumbbell}
          tone="primary"
        />
        <StatCard
          title="Outstanding Balance"
          value={`PKR ${unpaidBalance.toLocaleString()}`}
          subtitle="View invoices & receipts"
          icon={CreditCard}
          tone={unpaidBalance > 0 ? "accent" : "success"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Appointment Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">
            Upcoming Appointment
          </h2>
          {nextAppt ? (
            <div className="p-4 rounded-xl bg-[#F5F8FC] border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 capitalize">
                  {nextAppt.type.replace(/_/g, " ")}
                </span>
                <Badge variant={statusBadgeVariant(nextAppt.status)}>
                  {nextAppt.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-600">
                Doctor: {nextAppt.doctorId?.name} &bull;{" "}
                {new Date(nextAppt.scheduledAt).toLocaleString()}
              </p>
              {nextAppt.meetingLink && (
                <a
                  href={nextAppt.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
                >
                  <Video className="w-3.5 h-3.5" />
                  Enter Online Consultation Room
                </a>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No upcoming appointments scheduled.
            </p>
          )}
        </div>

        {/* Recent Shared Documents */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Medical Reports
            </h2>
            <Link
              href="/patient/medical-records"
              className="text-xs font-semibold text-[#283983] hover:underline"
            >
              View all
            </Link>
          </div>
          {(data?.documents || []).length === 0 ? (
            <p className="text-xs text-slate-500">No shared reports yet.</p>
          ) : (
            data.documents.slice(0, 4).map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#283983]" />
                  <span className="font-semibold text-slate-800">
                    {doc.title}
                  </span>
                </div>
                <a
                  href={`/api/documents/${doc._id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#283983] font-semibold hover:underline"
                >
                  Open
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
