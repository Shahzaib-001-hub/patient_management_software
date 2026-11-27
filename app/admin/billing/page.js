"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, CreditCard, Printer } from "lucide-react";

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null);

  const [invForm, setInvForm] = useState({
    patientId: "",
    category: "initial_consultation",
    description: "Pain Management Consultation",
    unitPrice: 5000,
    discount: 0,
    currency: "PKR",
  });

  const [payForm, setPayForm] = useState({
    amount: "",
    method: "cash",
    type: "payment",
    reference: "",
    notes: "",
  });

  const load = useCallback(async () => {
    const [iRes, pRes, ptRes] = await Promise.all([
      fetch("/api/invoices"),
      fetch("/api/payments"),
      fetch("/api/patients?status=active"),
    ]);
    if (iRes.ok) {
      const d = await iRes.json();
      setInvoices(d.invoices || []);
    }
    if (pRes.ok) {
      const d = await pRes.json();
      setPayments(d.payments || []);
    }
    if (ptRes.ok) {
      const d = await ptRes.json();
      setPatients(d.patients || []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createInvoice(e) {
    e.preventDefault();
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: invForm.patientId,
        category: invForm.category,
        discount: Number(invForm.discount || 0),
        currency: invForm.currency,
        items: [
          {
            description: invForm.description,
            quantity: 1,
            unitPrice: Number(invForm.unitPrice || 0),
          },
        ],
      }),
    });
    if (res.ok) {
      setInvoiceModal(false);
      load();
    }
  }

  async function recordPayment(e) {
    e.preventDefault();
    if (!paymentModal) return;
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceId: paymentModal._id,
        ...payForm,
      }),
    });
    if (res.ok) {
      setPaymentModal(null);
      setPayForm({ amount: "", method: "cash", type: "payment", reference: "", notes: "" });
      load();
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Billing & Payment Management"
        subtitle="Generate invoices, record cash/bank/online payments, partial balances, and refunds"
        actions={
          <button
            onClick={() => setInvoiceModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            Generate Invoice
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4 font-semibold">Invoice #</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Total</th>
                  <th className="py-3 px-4 font-semibold">Balance</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-semibold text-[#283983]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      {inv.patientId?.personalInfo?.firstName}{" "}
                      {inv.patientId?.personalInfo?.lastName}
                      <span className="block font-mono text-[11px] text-slate-500">
                        {inv.patientId?.patientId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {inv.currency} {inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#BA2820]">
                      {inv.currency} {inv.balanceDue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusBadgeVariant(inv.status)}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setPaymentModal(inv);
                          setPayForm({
                            amount: inv.balanceDue || "",
                            method: "cash",
                            type: "payment",
                            reference: "",
                            notes: "",
                          });
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EEF2FF] text-[#283983] font-semibold"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay / Refund
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Receipts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Payment Receipts
          </h2>
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
            {payments.map((p) => (
              <div
                key={p._id}
                className="p-3 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
              >
                <div>
                  <p className="font-mono font-semibold text-slate-900">
                    {p.receiptNumber}
                  </p>
                  <p className="text-slate-600">
                    {p.currency} {p.amount.toLocaleString()} ({p.method.replace("_", " ")})
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {new Date(p.paidAt).toLocaleDateString()} &bull; {p.type}
                  </span>
                </div>
                <button
                  onClick={() => setReceiptModal(p)}
                  className="p-1.5 rounded-lg text-[#283983] hover:bg-[#EEF2FF]"
                  title="Print Receipt"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Modal
        open={invoiceModal}
        onClose={() => setInvoiceModal(false)}
        title="Generate Patient Invoice"
      >
        <form onSubmit={createInvoice} className="space-y-3">
          <select
            required
            value={invForm.patientId}
            onChange={(e) => setInvForm({ ...invForm, patientId: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
          >
            <option value="">-- Select Patient --</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.patientId} - {p.personalInfo.firstName}{" "}
                {p.personalInfo.lastName}
              </option>
            ))}
          </select>
          <select
            value={invForm.category}
            onChange={(e) => setInvForm({ ...invForm, category: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
          >
            <option value="initial_consultation">Initial Consultation</option>
            <option value="follow_up_consultation">Follow-up Consultation</option>
            <option value="online_consultation">Online Consultation</option>
            <option value="rehabilitation_session">Rehabilitation Session</option>
            <option value="treatment_procedure">Treatment Procedure</option>
            <option value="rehabilitation_package">Rehabilitation Package</option>
          </select>
          <input
            type="text"
            required
            placeholder="Service Description"
            value={invForm.description}
            onChange={(e) =>
              setInvForm({ ...invForm, description: e.target.value })
            }
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              required
              placeholder="Amount"
              value={invForm.unitPrice}
              onChange={(e) =>
                setInvForm({ ...invForm, unitPrice: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="number"
              placeholder="Discount"
              value={invForm.discount}
              onChange={(e) =>
                setInvForm({ ...invForm, discount: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <select
              value={invForm.currency}
              onChange={(e) =>
                setInvForm({ ...invForm, currency: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
            >
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="AED">AED</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setInvoiceModal(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#283983] rounded-lg"
            >
              Create Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        open={Boolean(paymentModal)}
        onClose={() => setPaymentModal(null)}
        title={`Record Payment / Refund (${paymentModal?.invoiceNumber || ""})`}
      >
        <form onSubmit={recordPayment} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={payForm.type}
              onChange={(e) => setPayForm({ ...payForm, type: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
            >
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
            </select>
            <select
              value={payForm.method}
              onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online Payment</option>
            </select>
          </div>
          <input
            type="number"
            required
            placeholder="Amount"
            value={payForm.amount}
            onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <input
            type="text"
            placeholder="Transaction Reference (optional)"
            value={payForm.reference}
            onChange={(e) =>
              setPayForm({ ...payForm, reference: e.target.value })
            }
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPaymentModal(null)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#283983] rounded-lg"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </Modal>

      {/* Receipt Print Modal */}
      <Modal
        open={Boolean(receiptModal)}
        onClose={() => setReceiptModal(null)}
        title="Payment Receipt"
      >
        {receiptModal && (
          <div className="space-y-3 text-sm">
            <div className="border-b border-slate-200 pb-3">
              <p className="font-bold text-[#283983]">
                Pain Relief &amp; Wellness Center
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Receipt: {receiptModal.receiptNumber}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="text-slate-500">Invoice:</span>
              <span className="font-mono font-semibold">
                {receiptModal.invoiceId?.invoiceNumber}
              </span>
              <span className="text-slate-500">Amount:</span>
              <span className="font-mono font-bold">
                {receiptModal.currency} {receiptModal.amount.toLocaleString()}
              </span>
              <span className="text-slate-500">Method:</span>
              <span className="capitalize">
                {receiptModal.method.replace("_", " ")}
              </span>
              <span className="text-slate-500">Date:</span>
              <span>{new Date(receiptModal.paidAt).toLocaleString()}</span>
            </div>
            <button
              onClick={() => window.print()}
              className="w-full py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold no-print"
            >
              Print / Save as PDF
            </button>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
