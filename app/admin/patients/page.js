"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Search, UserPlus, Eye } from "lucide-react";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
    patientType: "physical",
    assignedDoctor: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    allergiesText: "",
    illnessesText: "",
    createPortalLogin: false,
    portalPassword: "",
  });

  const loadPatients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: statusFilter });
    if (q) params.set("q", q);
    if (typeFilter) params.set("patientType", typeFilter);
    const res = await fetch(`/api/patients?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setPatients(data.patients || []);
    }
    setLoading(false);
  }, [q, statusFilter, typeFilter]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    fetch("/api/staff?role=doctor")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.staff) setDoctors(d.staff);
      });
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const payload = {
      ...form,
      allergies: form.allergiesText
        ? form.allergiesText.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      previousIllnesses: form.illnessesText
        ? form.illnessesText.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Failed to register patient");
      return;
    }
    setModalOpen(false);
    loadPatients();
  }

  return (
    <AppShell>
      <PageHeader
        title="Patient Management"
        subtitle="Search, register, and manage physical and online patient profiles"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#283983] hover:bg-[#1d2a66] text-white text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Register New Patient
          </button>
        }
      />

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by Patient ID (PRWC-2026-...), name, or phone..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#283983]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
        >
          <option value="">All Patient Types</option>
          <option value="physical">Physical</option>
          <option value="online">Online</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All Statuses</option>
        </select>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">Patient ID</th>
                <th className="py-3 px-4 font-semibold">Full Name</th>
                <th className="py-3 px-4 font-semibold">Contact</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Assigned Doctor</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    Loading patients...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No matching patients found.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-[#283983]">
                      {p.patientId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {p.personalInfo.firstName} {p.personalInfo.lastName}
                      <span className="block text-xs text-slate-500">
                        {p.personalInfo.gender}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {p.contact.phone}
                      {p.contact.email && (
                        <span className="block text-slate-400">
                          {p.contact.email}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={p.patientType === "online" ? "info" : "primary"}>
                        {p.patientType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {p.registration?.assignedDoctor?.name || "Unassigned"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusBadgeVariant(p.status)}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/patients/${p._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF2FF] text-[#283983] hover:bg-[#283983] hover:text-white text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Profile
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Patient"
        subtitle="A unique Patient ID (PRWC-YYYY-NNNNN) will be generated automatically."
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] text-xs font-medium text-[#BA2820]">
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender *
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone *
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Type
              </label>
              <select
                value={form.patientType}
                onChange={(e) => setForm({ ...form, patientType: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
              >
                <option value="physical">Physical (In-Clinic)</option>
                <option value="online">Online (Telehealth)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Doctor
              </label>
              <select
                value={form.assignedDoctor}
                onChange={(e) =>
                  setForm({ ...form, assignedDoctor: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Allergies (comma-separated)
              </label>
              <input
                type="text"
                value={form.allergiesText}
                onChange={(e) =>
                  setForm({ ...form, allergiesText: e.target.value })
                }
                placeholder="Penicillin, Latex"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Previous Illnesses (comma-separated)
              </label>
              <input
                type="text"
                value={form.illnessesText}
                onChange={(e) =>
                  setForm({ ...form, illnessesText: e.target.value })
                }
                placeholder="Hypertension, Diabetes"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F5F8FC] border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.createPortalLogin}
                onChange={(e) =>
                  setForm({ ...form, createPortalLogin: e.target.checked })
                }
              />
              Create Patient Portal Login Account
            </label>
            {form.createPortalLogin && (
              <input
                type="password"
                required
                minLength={6}
                placeholder="Set temporary portal password"
                value={form.portalPassword}
                onChange={(e) =>
                  setForm({ ...form, portalPassword: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#283983] hover:bg-[#1d2a66] rounded-lg"
            >
              {submitting ? "Registering..." : "Register Patient"}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
