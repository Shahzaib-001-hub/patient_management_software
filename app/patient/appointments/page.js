"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CalendarPlus, Video } from "lucide-react";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    doctorId: "",
    type: "online_video",
    scheduledAt: "",
    notes: "",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/appointments");
    if (res.ok) setAppointments((await res.json()).appointments || []);
  }, []);

  useEffect(() => {
    load();
    fetch("/api/staff?role=doctor")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.staff && setDoctors(d.staff));
  }, [load]);

  async function handleRequest(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not request appointment");
      return;
    }
    setModalOpen(false);
    load();
  }

  return (
    <AppShell>
      <PageHeader
        title="My Appointments"
        subtitle="View your consultation history and request in-clinic or online video appointments"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
          >
            <CalendarPlus className="w-4 h-4" />
            Request Appointment
          </button>
        }
      />

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-500">
            No appointments found.
          </div>
        ) : (
          appointments.map((a) => (
            <div
              key={a._id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 capitalize">
                  {a.type.replace(/_/g, " ")} — {a.doctorId?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(a.scheduledAt).toLocaleString()} ({a.durationMinutes}{" "}
                  mins)
                </p>
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
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Request Appointment"
      >
        {error && (
          <div className="mb-3 p-3 rounded-lg bg-[#FEF2F2] text-xs text-[#BA2820]">
            {error}
          </div>
        )}
        <form onSubmit={handleRequest} className="space-y-3">
          <select
            required
            value={form.doctorId}
            onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
          >
            <option value="">-- Select Pain Specialist --</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
          >
            <option value="online_video">Online Video Consultation</option>
            <option value="in_clinic">In-Clinic Consultation</option>
            <option value="follow_up">Follow-up Consultation</option>
          </select>
          <input
            type="datetime-local"
            required
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <textarea
            rows={2}
            placeholder="Describe your symptoms or reason for visit"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <div className="flex justify-end gap-2">
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
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
