"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Dumbbell } from "lucide-react";

export default function DoctorRehabilitationPage() {
  const [plans, setPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [mode, setMode] = useState("bundle");
  const [patientId, setPatientId] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [selectedExIds, setSelectedExIds] = useState([]);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [instructions, setInstructions] = useState("");

  const load = useCallback(async () => {
    const [rRes, pRes, bRes, eRes] = await Promise.all([
      fetch("/api/rehabilitation"),
      fetch("/api/patients?status=active"),
      fetch("/api/bundles"),
      fetch("/api/exercises?activeOnly=true"),
    ]);
    if (rRes.ok) setPlans((await rRes.json()).plans || []);
    if (pRes.ok) setPatients((await pRes.json()).patients || []);
    if (bRes.ok) setBundles((await bRes.json()).bundles || []);
    if (eRes.ok) setExercises((await eRes.json()).exercises || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAssign(e) {
    e.preventDefault();
    const payload = {
      patientId,
      title,
      frequency,
      doctorInstructions: instructions,
      bundleId: mode === "bundle" ? bundleId : null,
      exercises:
        mode === "individual"
          ? selectedExIds.map((id) => ({
              exerciseId: id,
              phaseName: "Custom Plan",
              sets: 3,
              reps: "10",
            }))
          : [],
    };
    const res = await fetch("/api/rehabilitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setModalOpen(false);
      setTitle("");
      setSelectedExIds([]);
      load();
    }
  }

  async function updatePlanStatus(id, status) {
    await fetch(`/api/rehabilitation/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <AppShell>
      <PageHeader
        title="Rehabilitation Assignments & Progress"
        subtitle="Assign complete bundles or individual exercises and review patient pain & completion feedback"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            Assign Rehabilitation Plan
          </button>
        }
      />

      <div className="space-y-4">
        {plans.map((rp) => (
          <div
            key={rp._id}
            className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#283983]" />
                  <h3 className="text-base font-semibold text-slate-900">
                    {rp.title}
                  </h3>
                  <Badge variant={statusBadgeVariant(rp.status)}>
                    {rp.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient: {rp.patientId?.personalInfo?.firstName}{" "}
                  {rp.patientId?.personalInfo?.lastName} (
                  <span className="font-mono">{rp.patientId?.patientId}</span>)
                  &bull; {rp.frequency}
                </p>
              </div>
              <select
                value={rp.status}
                onChange={(e) => updatePlanStatus(rp._id, e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#F5F8FC] border border-slate-200">
                <p className="font-semibold text-slate-800 mb-1.5">
                  Assigned Exercises ({rp.exercises?.length || 0})
                </p>
                <ul className="space-y-1 text-slate-600">
                  {(rp.exercises || []).map((ex, i) => (
                    <li key={i}>
                      &bull; {ex.exerciseId?.name || "Exercise"} ({ex.sets}x
                      {ex.reps})
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-[#F5F8FC] border border-slate-200">
                <p className="font-semibold text-slate-800 mb-1.5">
                  Patient Completion &amp; Pain Logs ({rp.logs?.length || 0})
                </p>
                {(rp.logs || []).length === 0 ? (
                  <p className="text-slate-500">No sessions logged yet.</p>
                ) : (
                  <ul className="space-y-1 text-slate-600 max-h-28 overflow-y-auto">
                    {rp.logs.slice(-5).reverse().map((l, i) => (
                      <li key={i}>
                        {new Date(l.completedAt).toLocaleDateString()} &bull; Pain:{" "}
                        <strong className="text-[#BA2820]">
                          {l.painAfter}/10
                        </strong>{" "}
                        ({l.difficulty}) — {l.feedback || "No comment"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Assign Rehabilitation Program"
      >
        <form onSubmit={handleAssign} className="space-y-3">
          <select
            required
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
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
            placeholder="Assignment Title (e.g., Phase 1 Lumbar Rehab)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("bundle")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${
                mode === "bundle"
                  ? "bg-[#283983] text-white border-[#283983]"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              Option 1: Assign Bundle
            </button>
            <button
              type="button"
              onClick={() => setMode("individual")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${
                mode === "individual"
                  ? "bg-[#283983] text-white border-[#283983]"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              Option 2: Custom Exercises
            </button>
          </div>

          {mode === "bundle" ? (
            <select
              required
              value={bundleId}
              onChange={(e) => setBundleId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
            >
              <option value="">-- Select Exercise Bundle --</option>
              {bundles.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.bodyArea})
                </option>
              ))}
            </select>
          ) : (
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
              {exercises.map((ex) => (
                <label
                  key={ex._id}
                  className="flex items-center gap-2 text-xs p-1 hover:bg-slate-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedExIds.includes(ex._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExIds([...selectedExIds, ex._id]);
                      } else {
                        setSelectedExIds(
                          selectedExIds.filter((id) => id !== ex._id)
                        );
                      }
                    }}
                  />
                  <span>
                    {ex.name} ({ex.bodyArea})
                  </span>
                </label>
              ))}
            </div>
          )}

          <input
            type="text"
            placeholder="Frequency (e.g., Daily, 5x/week)"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <textarea
            rows={2}
            placeholder="Doctor Instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
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
              Assign Program
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
