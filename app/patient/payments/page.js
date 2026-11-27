"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";

export default function PatientPaymentsPage() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.invoices && setInvoices(d.invoices));
    fetch("/api/payments")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.payments && setPayments(d.payments));
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="My Invoices & Payments"
        subtitle="View your clinic invoices, remaining balances, and payment receipts"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Invoices</h2>
          {invoices.length === 0 ? (
            <p className="text-xs text-slate-500">No invoices issued yet.</p>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv._id}
                className="p-3.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
              >
                <div>
                  <p className="font-mono font-semibold text-[#283983]">
                    {inv.invoiceNumber}
                  </p>
                  <p className="text-slate-600">
                    Total: {inv.currency} {inv.totalAmount.toLocaleString()} &bull;
                    Balance: {inv.currency} {inv.balanceDue.toLocaleString()}
                  </p>
                </div>
                <Badge variant={statusBadgeVariant(inv.status)}>
                  {inv.status}
                </Badge>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">
            Payment Receipts
          </h2>
          {payments.length === 0 ? (
            <p className="text-xs text-slate-500">No payments recorded yet.</p>
          ) : (
            payments.map((p) => (
              <div
                key={p._id}
                className="p-3.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
              >
                <div>
                  <p className="font-mono font-semibold text-slate-900">
                    {p.receiptNumber}
                  </p>
                  <p className="text-slate-500">
                    {new Date(p.paidAt).toLocaleDateString()} &bull;{" "}
                    {p.method.replace("_", " ")}
                  </p>
                </div>
                <span className="font-mono font-bold text-emerald-700">
                  {p.currency} {p.amount.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
