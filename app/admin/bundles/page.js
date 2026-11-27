"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Layers } from "lucide-react";

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [bodyArea, setBodyArea] = useState("back");
  const [description, setDescription] = useState("");
  const [phaseName, setPhaseName] = useState("Phase 1: Initial Rehabilitation");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState([]);

  const load = useCallback(async () => {
    const [bRes, eRes] = await Promise.all([
      fetch("/api/bundles"),
      fetch("/api/exercises?activeOnly=true"),
    ]);
    if (bRes.ok) {
      const b = await bRes.json();
      setBundles(b.bundles || []);
    }
    if (eRes.ok) {
      const e = await eRes.json();
      setExercises(e.exercises || []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    const payload = {
      name,
      bodyArea,
      description,
      phases: [
        {
          phaseName,
          exercises: selectedExerciseIds.map((id) => ({
            exerciseId: id,
            sets: 3,
            reps: "10",
          })),
        },
      ],
    };
    const res = await fetch("/api/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setModalOpen(false);
      setName("");
      setSelectedExerciseIds([]);
      load();
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Rehabilitation Exercise Bundles"
        subtitle="Create reusable multi-phase rehabilitation packages for quick doctor assignment"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            Create Bundle
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bundles.map((b) => (
          <div
            key={b._id}
            className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#283983]" />
                <h3 className="text-sm font-semibold text-slate-900">{b.name}</h3>
              </div>
              <Badge variant="primary">{b.bodyArea}</Badge>
            </div>
            <p className="text-xs text-slate-600">{b.description}</p>
            <div className="space-y-2">
              {(b.phases || []).map((ph, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#F5F8FC] border border-slate-200 text-xs"
                >
                  <p className="font-semibold text-slate-800">{ph.phaseName}</p>
                  <ul className="mt-1 space-y-0.5 text-slate-600 list-disc pl-4">
                    {(ph.exercises || []).map((ex, i) => (
                      <li key={i}>
                        {ex.exerciseId?.name || "Exercise"} ({ex.sets}x{ex.reps})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Exercise Bundle"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Bundle Name (e.g., ACL Rehabilitation Program)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <select
            value={bodyArea}
            onChange={(e) => setBodyArea(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
          >
            <option value="back">Back</option>
            <option value="knee">Knee</option>
            <option value="neck">Neck</option>
            <option value="shoulder">Shoulder</option>
            <option value="hip">Hip</option>
            <option value="ankle">Ankle</option>
            <option value="general">General</option>
          </select>
          <textarea
            rows={2}
            placeholder="Program Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <input
            type="text"
            placeholder="Phase Name"
            value={phaseName}
            onChange={(e) => setPhaseName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1.5">
              Select Exercises for this Phase
            </p>
            <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
              {exercises.map((ex) => (
                <label
                  key={ex._id}
                  className="flex items-center gap-2 text-xs p-1.5 hover:bg-slate-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedExerciseIds.includes(ex._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExerciseIds([...selectedExerciseIds, ex._id]);
                      } else {
                        setSelectedExerciseIds(
                          selectedExerciseIds.filter((id) => id !== ex._id)
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
              Save Bundle
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
