"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { UserPlus } from "lucide-react";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
    phone: "",
    specialization: "",
  });

  const loadStaff = useCallback(async () => {
    const res = await fetch("/api/staff");
    if (res.ok) {
      const d = await res.json();
      setStaff(d.staff || []);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    if (!res.ok) {
      setError(d.error || "Failed to add staff");
      return;
    }
    setModalOpen(false);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "doctor",
      phone: "",
      specialization: "",
    });
    loadStaff();
  }

  async function toggleActive(member) {
    await fetch(`/api/staff/${member._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !member.isActive }),
    });
    loadStaff();
  }

  return (
    <AppShell>
      <PageHeader
        title="Doctors & Staff Management"
        subtitle="Manage clinic roles, permissions, and account status"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#283983] hover:bg-[#1d2a66] text-white text-xs font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff Member
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
            <tr>
              <th className="py-3 px-4 font-semibold">Name</th>
              <th className="py-3 px-4 font-semibold">Email</th>
              <th className="py-3 px-4 font-semibold">Role</th>
              <th className="py-3 px-4 font-semibold">Specialization</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((m) => (
              <tr key={m._id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-slate-900">
                  {m.name}
                </td>
                <td className="py-3 px-4 text-slate-600">{m.email}</td>
                <td className="py-3 px-4">
                  <Badge variant="primary">{m.role.replace(/_/g, " ")}</Badge>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {m.specialization || "—"}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={m.isActive ? "success" : "danger"}>
                    {m.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => toggleActive(m)}
                    className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold"
                  >
                    {m.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Staff Account"
      >
        {error && (
          <div className="mb-3 p-3 rounded-lg bg-[#FEF2F2] text-xs text-[#BA2820]">
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Full Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="email"
              required
              placeholder="Email Address *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
            >
              <option value="doctor">Doctor</option>
              <option value="clinic_admin">Clinic Admin</option>
              <option value="receptionist">Receptionist</option>
              <option value="rehab_staff">Rehabilitation Staff</option>
              <option value="accountant">Accountant</option>
            </select>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Temporary Password *"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Specialization (if doctor/PT)"
              value={form.specialization}
              onChange={(e) =>
                setForm({ ...form, specialization: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#283983] rounded-lg"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
