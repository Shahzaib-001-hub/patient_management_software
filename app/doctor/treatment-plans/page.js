"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, ClipboardList } from "lucide-react";

export default function DoctorTreatmentPlansPage() {
  const [plans, setPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [sessionModal, setSessionModal] = useState(null);
  const [sessionNote, setSessionNote] = useState("");
  const [progressSummary, setProgressSummary] = useState("");

  const [form, setForm] = useState({
    patientId: "",
    title: "",
    diagnosis: "",
    goals: "",
    recommendations: "",
    doctorNotes: "",
    medName: "",
    medDosage: "",
    medFrequency: "",
    medDuration: "",
    medInstructions: "",
  });

  const load = useCallback(async () => {
    const [pRes, ptRes] = await Promise.all([
      fetch("/api/treatment-plans"),
      fetch("/api/patients?status=active"),
    ]);
    if (pRes.ok) {
      const d = await pRes.json();
      setPlans(d.plans || []);
    }
    if (ptRes.ok) {
      const d = await ptRes.json();
      setPatients(d.patients || []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    const medications = form.medName
      ? [
          {
            name: form.medName,
            dosage: form.medDosage,
            frequency: form.medFrequency,
            duration: form.medDuration,
            instructions: form.medInstructions,
          },
        ]
      : [];
    const res = await fetch("/api/treatment-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: form.patientId,
        title: form.title,
        diagnosis: form.diagnosis,
        goals: form.goals,
        recommendations: form.recommendations,
        doctorNotes: form.doctorNotes,
        medications,
      }),
    });
    if (res.ok) {
      setModalOpen(false);
      load();
    }
  }

  async function handleAddSession(e) {
    e.preventDefault();
    if (!sessionModal) return;
    await fetch(`/api/treatment-plans/${sessionModal._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionNote, progressSummary }),
    });
    setSessionModal(null);
    setSessionNote("");
    setProgressSummary("");
    load();
  }

  async function handleStatusChange(id, status) {
    let discontinueReason = "";
    if (status === "discontinued") {
      discontinueReason =
        window.prompt("Reason for discontinuing treatment plan:") || "";
    }
    await fetch(`/api/treatment-plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, discontinueReason }),
    });
    load();
  }

  return (
    <AppShell>
      <PageHeader
        title="Treatment Plan Management"
        subtitle="Create versioned treatment plans, prescribe medications, and document treatment sessions"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            New Treatment Plan
          </button>
        }
      />

      <div className="space-y-4">
        {plans.map((tp) => (
          <div
            key={tp._id}
            className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#283983]" />
                  <h3 className="text-base font-semibold text-slate-900">
                    {tp.title}
                  </h3>
                  <Badge variant="neutral">v{tp.version}</Badge>
                  <Badge variant={statusBadgeVariant(tp.status)}>
                    {tp.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient: {tp.patientId?.personalInfo?.firstName}{" "}
                  {tp.patientId?.personalInfo?.lastName} (
                  <span className="font-mono">{tp.patientId?.patientId}</span>)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSessionModal(tp)}
                  className="px-3 py-1.5 rounded-lg bg-[#EEF2FF] text-[#283983] text-xs font-semibold"
                >
                  + Session Note
                </button>
                <select
                  value={tp.status}
                  onChange={(e) => handleStatusChange(tp._id, e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F5F8FC] p-3.5 rounded-lg">
              <div>
                <span className="font-semibold text-slate-700 block">
                  Diagnosis
                </span>
                <p className="text-slate-600">{tp.diagnosis}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">
                  Treatment Goals
                </span>
                <p className="text-slate-600">{tp.goals || "—"}</p>
              </div>
            </div>

            {tp.medications?.length > 0 && (
              <div className="text-xs">
                <span className="font-semibold text-slate-700 block mb-1">
                  Prescribed Medications
                </span>
                <div className="flex flex-wrap gap-2">
                  {tp.medications.map((m, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800"
                    >
                      {m.name} {m.dosage} &bull; {m.frequency} ({m.duration})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tp.sessions?.length > 0 && (
              <div className="text-xs border-t border-slate-100 pt-3 space-y-1.5">
                <span className="font-semibold text-slate-700 block">
                  Session Notes ({tp.sessions.length})
                </span>
                {tp.sessions.map((s, idx) => (
                  <div key={idx} className="text-slate-600">
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(s.sessionDate).toLocaleDateString()}:
                    </span>{" "}
                    {s.notes}{" "}
                    {s.progressSummary && (
                      <span className="text-[#283983] font-medium">
                        ({s.progressSummary})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Treatment Plan"
      >
        <form onSubmit={handleCreate} className="space-y-3">
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
          <input
            type="text"
            required
            placeholder="Plan Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <input
            type="text"
            required
            placeholder="Doctor-Recorded Diagnosis *"
            value={form.diagnosis}
            onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <textarea
            rows={2}
            placeholder="Treatment Goals"
            value={form.goals}
            onChange={(e) => setForm({ ...form, goals: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <textarea
            rows={2}
            placeholder="Clinical Recommendations"
            value={form.recommendations}
            onChange={(e) =>
              setForm({ ...form, recommendations: e.target.value })
            }
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <div className="p-3 rounded-lg bg-[#F5F8FC] border border-slate-200 space-y-2">
            <p className="text-xs font-semibold text-slate-700">
              Medication (Doctor-Prescribed)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Medication Name"
                value={form.medName}
                onChange={(e) => setForm({ ...form, medName: e.target.value })}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
              <input
                type="text"
                placeholder="Dosage (e.g., 75mg)"
                value={form.medDosage}
                onChange={(e) =>
                  setForm({ ...form, medDosage: e.target.value })
                }
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
              <input
                type="text"
                placeholder="Frequency"
                value={form.medFrequency}
                onChange={(e) =>
                  setForm({ ...form, medFrequency: e.target.value })
                }
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
              <input
                type="text"
                placeholder="Duration"
                value={form.medDuration}
                onChange={(e) =>
                  setForm({ ...form, medDuration: e.target.value })
                }
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
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
              Save Plan
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(sessionModal)}
        onClose={() => setSessionModal(null)}
        title="Add Treatment Session Note"
      >
        <form onSubmit={handleAddSession} className="space-y-3">
          <textarea
            rows={3}
            required
            placeholder="Clinical session notes..."
            value={sessionNote}
            onChange={(e) => setSessionNote(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <input
            type="text"
            placeholder="Progress summary against goals"
            value={progressSummary}
            onChange={(e) => setProgressSummary(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSessionModal(null)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#283983] rounded-lg"
            >
              Save Session
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
