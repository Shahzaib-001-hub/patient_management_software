"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/audit-logs")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.logs && setLogs(d.logs));
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Security & Audit Logs"
        subtitle="Immutable trail of sensitive record views, edits, downloads, and financial actions"
      />
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Resource</th>
                <th className="py-3 px-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l._id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    {l.userName}
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge variant="primary">{l.userRole}</Badge>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-[#283983]">
                    {l.action}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{l.resourceType}</td>
                  <td className="py-2.5 px-4 text-slate-600">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
