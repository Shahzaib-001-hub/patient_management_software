"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import {
  Calendar,
  Activity,
  ClipboardList,
  Dumbbell,
  Video,
  Users,
} from "lucide-react";

export default function DoctorDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d));
  }, []);

  const kpis = data?.kpis || {};

  return (
    <AppShell>
      <PageHeader
        title="Doctor Clinical Workspace"
        subtitle="Today's consultations, pain assessments, treatment plans, and rehabilitation progress"
        actions={
          <>
            <Link
              href="/doctor/assessments"
              className="px-4 py-2 rounded-lg bg-[#BA2820] hover:bg-[#991f18] text-white text-xs font-semibold"
            >
              + New Pain Assessment
            </Link>
            <Link
              href="/doctor/treatment-plans"
              className="px-4 py-2 rounded-lg bg-[#283983] hover:bg-[#1d2a66] text-white text-xs font-semibold"
            >
              + Create Treatment Plan
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Today's Consultations"
          value={kpis.todaysAppointments ?? 0}
          icon={Calendar}
          tone="primary"
        />
        <StatCard
          title="Active Patients"
          value={kpis.activePatients ?? 0}
          icon={Users}
          tone="success"
        />
        <StatCard
          title="Active Treatment Plans"
          value={kpis.activeTreatmentPlans ?? 0}
          icon={ClipboardList}
          tone="primary"
        />
        <StatCard
          title="Active Rehab Programs"
          value={kpis.activeRehabPrograms ?? 0}
          icon={Dumbbell}
          tone="accent"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Upcoming Consultations &amp; Telehealth Queue
          </h2>
          <Link
            href="/admin/appointments"
            className="text-xs font-semibold text-[#283983] hover:underline"
          >
            Full Schedule
          </Link>
        </div>

        <div className="space-y-3">
          {(data?.recentAppointments || []).length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No upcoming consultations scheduled.
            </p>
          ) : (
            data.recentAppointments.map((a) => (
              <div
                key={a._id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#283983] flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <Link
                      href={`/admin/patients/${a.patientId?._id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-[#283983]"
                    >
                      {a.patientId?.personalInfo?.firstName}{" "}
                      {a.patientId?.personalInfo?.lastName}
                    </Link>
                    <p className="text-xs text-slate-500">
                      <span className="font-mono text-[#283983]">
                        {a.patientId?.patientId}
                      </span>{" "}
                      &bull; {a.type.replace(/_/g, " ")} &bull;{" "}
                      {new Date(a.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusBadgeVariant(a.status)}>
                    {a.status.replace(/_/g, " ")}
                  </Badge>
                  {a.meetingLink && (
                    <a
                      href={a.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#283983] text-white text-xs font-semibold"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Video
                    </a>
                  )}
                  <Link
                    href={`/doctor/assessments?patientId=${a.patientId?._id}`}
                    className="px-3 py-1.5 rounded-lg bg-[#EEF2FF] text-[#283983] text-xs font-semibold"
                  >
                    Assess Pain
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
