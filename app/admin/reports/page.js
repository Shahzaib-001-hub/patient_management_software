"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Download, Printer } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`/api/reports?${params.toString()}`);
    if (res.ok) setData(await res.json());
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  function exportCSV() {
    if (!data) return;
    const rows = [
      ["Section", "Label", "Value"],
      ...(data.appointmentStats || []).map((a) => ["Appointment Status", a._id, a.count]),
      ...(data.revenueStats || []).map((r) => ["Revenue by Method", r._id, r.total]),
      ...(data.outstandingInvoices || []).map((inv) => [
        "Outstanding Invoice",
        inv.invoiceNumber,
        inv.balanceDue,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prwc-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  const apptChart = (data?.appointmentStats || []).map((a) => ({
    status: a._id,
    count: a.count,
  }));

  const revChart = (data?.revenueStats || []).map((r) => ({
    method: r._id.replace("_", " "),
    total: r.total,
  }));

  return (
    <AppShell>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Filterable clinic operations, financial, and clinical rehabilitation reports"
        actions={
          <div className="flex flex-wrap items-center gap-2 no-print">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            />
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#283983] text-white text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / PDF
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Appointment Statistics
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apptChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#283983" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Revenue by Payment Method
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="method" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#BA2820" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {data?.rehabCompletionSummary?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Rehabilitation Program Activity
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 uppercase">
                <tr>
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Program</th>
                  <th className="py-2 pr-3">Exercises</th>
                  <th className="py-2">Completed Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.rehabCompletionSummary.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5 pr-3 font-medium">
                      {r.patientName} ({r.patientCode})
                    </td>
                    <td className="py-2.5 pr-3">{r.planTitle}</td>
                    <td className="py-2.5 pr-3 font-mono">{r.totalExercises}</td>
                    <td className="py-2.5 font-mono font-semibold text-[#283983]">
                      {r.completedLogs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
