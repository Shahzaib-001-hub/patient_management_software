"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CalendarPlus, Video, Clock } from "lucide-react";

const STATUSES = [
  "pending",
  "confirmed",
  "checked_in",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
  "rescheduled",
];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [viewMode, setViewMode] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    type: "in_clinic",
    scheduledAt: "",
    durationMinutes: 30,
    notes: "",
  });

  const loadAppointments = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);

    const base = new Date(selectedDate);
    if (viewMode === "daily") {
      const start = new Date(base);
      start.setHours(0, 0, 0, 0);
      const end = new Date(base);
      end.setHours(23, 59, 59, 999);
      params.set("from", start.toISOString());
      params.set("to", end.toISOString());
    } else if (viewMode === "weekly") {
      const start = new Date(base);
      start.setDate(base.getDate() - base.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start.getTime() + 7 * 86400000);
      params.set("from", start.toISOString());
      params.set("to", end.toISOString());
    } else if (viewMode === "monthly") {
      const start = new Date(base.getFullYear(), base.getMonth(), 1);
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59);
      params.set("from", start.toISOString());
      params.set("to", end.toISOString());
    }

    const res = await fetch(`/api/appointments?${params.toString()}`);
    if (res.ok) {
      const d = await res.json();
      setAppointments(d.appointments || []);
    }
  }, [selectedDate, viewMode, statusFilter]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    fetch("/api/patients?status=active")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.patients && setPatients(d.patients));
    fetch("/api/staff?role=doctor")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.staff && setDoctors(d.staff));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not book appointment");
      return;
    }
    setModalOpen(false);
    loadAppointments();
  }

  async function handleStatusChange(id, nextStatus) {
    let cancellationReason = "";
    if (nextStatus === "cancelled") {
      cancellationReason =
        window.prompt("Enter cancellation reason (optional):") || "";
    }
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, cancellationReason }),
    });
    loadAppointments();
  }

  return (
    <AppShell>
      <PageHeader
        title="Appointment Management"
        subtitle="Schedule in-clinic and online video consultations with double-booking protection"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#283983] hover:bg-[#1d2a66] text-white text-xs font-semibold"
          >
            <CalendarPlus className="w-4 h-4" />
            Book Appointment
          </button>
        }
      />

      {/* Calendar Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {["daily", "weekly", "monthly", "all"].map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                viewMode === m
                  ? "bg-[#283983] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {viewMode !== "all" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200"
            />
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                <th className="py-3 px-4 font-semibold">Patient</th>
                <th className="py-3 px-4 font-semibold">Doctor</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No appointments in this view.
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(a.scheduledAt).toLocaleString()}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {a.durationMinutes} mins
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {a.patientId?.personalInfo?.firstName}{" "}
                        {a.patientId?.personalInfo?.lastName}
                      </span>
                      <span className="font-mono text-[11px] text-[#283983]">
                        {a.patientId?.patientId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{a.doctorId?.name}</td>
                    <td className="py-3 px-4 capitalize">
                      {a.type.replace(/_/g, " ")}
                      {a.meetingLink && (
                        <a
                          href={a.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[#283983] font-semibold hover:underline block"
                        >
                          <Video className="w-3 h-3" /> Join Video
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusBadgeVariant(a.status)}>
                        {a.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a._id, e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Appointment"
        subtitle="System automatically checks doctor availability to prevent double booking."
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] text-xs font-medium text-[#BA2820]">
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient *
            </label>
            <select
              required
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
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
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Doctor *
            </label>
            <select
              required
              value={form.doctorId}
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
              >
                <option value="in_clinic">In-clinic consultation</option>
                <option value="online_video">Online video consultation</option>
                <option value="follow_up">Follow-up consultation</option>
                <option value="rehab_session">Rehabilitation session</option>
                <option value="treatment_procedure">Treatment procedure</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date &amp; Time *
              </label>
              <input
                type="datetime-local"
                required
                value={form.scheduledAt}
                onChange={(e) =>
                  setForm({ ...form, scheduledAt: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (mins)
              </label>
              <input
                type="number"
                min={10}
                max={180}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#283983] rounded-lg"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
