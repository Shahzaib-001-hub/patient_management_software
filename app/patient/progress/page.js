"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function PatientProgressPage() {
  const [assessments, setAssessments] = useState([]);
  const [rehabPlans, setRehabPlans] = useState([]);

  useEffect(() => {
    fetch("/api/assessments")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.assessments && setAssessments(d.assessments));
    fetch("/api/rehabilitation")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.plans && setRehabPlans(d.plans));
  }, []);

  const chartData = [...assessments].reverse().map((a) => ({
    date: new Date(a.assessedAt).toLocaleDateString(),
    current: a.painScores?.current ?? 0,
    worst: a.painScores?.worst ?? 0,
  }));

  const logs = rehabPlans.flatMap((p) =>
    (p.logs || []).map((l) => ({ ...l, planTitle: p.title }))
  );

  return (
    <AppShell>
      <PageHeader
        title="My Recovery Progress"
        subtitle="Track your pain score trends and completed rehabilitation sessions"
      />

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          Pain Score Trend (0–10 NRS)
        </h2>
        {chartData.length === 0 ? (
          <p className="text-xs text-slate-500">No pain assessments recorded yet.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="current"
                  name="Current Pain"
                  stroke="#BA2820"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="worst"
                  name="Worst Pain"
                  stroke="#283983"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          Exercise Activity History
        </h2>
        {logs.length === 0 ? (
          <p className="text-xs text-slate-500">No completed exercises logged yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.reverse().map((l, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 text-xs flex flex-wrap justify-between gap-2"
              >
                <div>
                  <span className="font-semibold text-slate-900">
                    {l.planTitle}
                  </span>
                  <span className="text-slate-500 block">
                    {new Date(l.completedAt).toLocaleString()} &bull; Difficulty:{" "}
                    {l.difficulty}
                  </span>
                </div>
                <span className="font-mono font-bold text-[#BA2820]">
                  Post-exercise pain: {l.painAfter}/10
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
