"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  CheckCircle2,
  Activity,
  Dumbbell,
  CreditCard,
  TrendingUp,
  FileBarChart2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`/api/dashboard?${params.toString()}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const kpis = data?.kpis || {};
  const chartData = (data?.patientTypeBreakdown || []).map((item) => ({
    name: item._id === "online" ? "Online Patients" : "Physical Patients",
    count: item.count,
  }));

  return (
    <AppShell>
      <PageHeader
        title="Clinic Operations Dashboard"
        subtitle="Overview of patients, appointments, rehabilitation programs, and clinic revenue"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              aria-label="From date"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              aria-label="To date"
            />
            {(from || to) && (
              <button
                onClick={() => {
                  setFrom("");
                  setTo("");
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Reset
              </button>
            )}
          </div>
        }
      />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        <Link
          href="/admin/patients?new=1"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#283983] hover:bg-[#1d2a66] text-white text-xs font-semibold transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Register Patient
        </Link>
        <Link
          href="/admin/appointments?new=1"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors"
        >
          <Calendar className="w-4 h-4 text-[#283983]" />
          Create Appointment
        </Link>
        <Link
          href="/admin/staff"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors"
        >
          <Users className="w-4 h-4 text-[#283983]" />
          Add Doctor / Staff
        </Link>
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors"
        >
          <FileBarChart2 className="w-4 h-4 text-[#BA2820]" />
          Generate Reports
        </Link>
      </div>

      {/* KPI Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(10)].map((_, idx) => (
            <div
              key={idx}
              className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Patients"
            value={kpis.totalPatients ?? 0}
            subtitle={`${kpis.activePatients ?? 0} active profiles`}
            icon={Users}
            tone="primary"
          />
          <StatCard
            title="New This Month"
            value={kpis.newPatientsThisMonth ?? 0}
            subtitle="Registered this month"
            icon={UserPlus}
            tone="success"
          />
          <StatCard
            title="Today's Appts"
            value={kpis.todaysAppointments ?? 0}
            subtitle="Scheduled today"
            icon={Calendar}
            tone="primary"
          />
          <StatCard
            title="Pending Appts"
            value={kpis.pendingAppointments ?? 0}
            subtitle="Awaiting confirmation"
            icon={Clock}
            tone="warning"
          />
          <StatCard
            title="Completed Visits"
            value={kpis.completedConsultations ?? 0}
            subtitle="Consultations done"
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            title="Upcoming Follow-Ups"
            value={kpis.upcomingFollowUps ?? 0}
            subtitle="Scheduled follow-ups"
            icon={Activity}
            tone="primary"
          />
          <StatCard
            title="Active Rehab Plans"
            value={kpis.activeRehabPrograms ?? 0}
            subtitle="Assigned programs"
            icon={Dumbbell}
            tone="primary"
          />
          <StatCard
            title="Active Treatments"
            value={kpis.activeTreatmentPlans ?? 0}
            subtitle="Ongoing care plans"
            icon={Activity}
            tone="success"
          />
          <StatCard
            title="Pending Payments"
            value={`PKR ${(kpis.pendingPaymentsAmount ?? 0).toLocaleString()}`}
            subtitle={`${kpis.pendingPaymentsCount ?? 0} open invoices`}
            icon={CreditCard}
            tone="accent"
          />
          <StatCard
            title="Monthly Revenue"
            value={`PKR ${(kpis.monthlyRevenue ?? 0).toLocaleString()}`}
            subtitle="Collected payments"
            icon={TrendingUp}
            tone="success"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming / Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Today&apos;s &amp; Upcoming Schedule
            </h2>
            <Link
              href="/admin/appointments"
              className="text-xs font-semibold text-[#283983] hover:underline"
            >
              View full calendar
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 uppercase">
                  <th className="py-2.5 pr-3 font-semibold">Patient</th>
                  <th className="py-2.5 pr-3 font-semibold">Doctor</th>
                  <th className="py-2.5 pr-3 font-semibold">Type</th>
                  <th className="py-2.5 pr-3 font-semibold">Date &amp; Time</th>
                  <th className="py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.recentAppointments || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No upcoming appointments found.
                    </td>
                  </tr>
                ) : (
                  data.recentAppointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-slate-50">
                      <td className="py-3 pr-3 font-medium text-slate-900">
                        {appt.patientId?.personalInfo?.firstName}{" "}
                        {appt.patientId?.personalInfo?.lastName}
                        <span className="block text-[11px] font-mono text-slate-500">
                          {appt.patientId?.patientId}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-slate-600">
                        {appt.doctorId?.name}
                      </td>
                      <td className="py-3 pr-3 capitalize text-slate-600">
                        {appt.type?.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 pr-3 text-slate-600">
                        {new Date(appt.scheduledAt).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <Badge variant={statusBadgeVariant(appt.status)}>
                          {appt.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Type Distribution Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Patient Mix (Physical vs Online)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#283983" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
