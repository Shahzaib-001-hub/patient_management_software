"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Dumbbell, AlertTriangle } from "lucide-react";

const AREAS = ["all", "knee", "back", "neck", "shoulder", "hip", "ankle", "general"];

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [area, setArea] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    videoUrl: "",
    bodyArea: "back",
    injuryCategory: "",
    difficulty: "beginner",
    instructions: "",
    defaultSets: 3,
    defaultReps: "10",
    durationMinutes: 10,
    frequency: "Daily",
    precautions: "",
    equipmentRequired: "None",
  });

  const load = useCallback(async () => {
    const res = await fetch(`/api/exercises?bodyArea=${area}`);
    if (res.ok) {
      const d = await res.json();
      setExercises(d.exercises || []);
    }
  }, [area]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setModalOpen(false);
      load();
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Exercise Library"
        subtitle="Manage curated rehabilitation exercises, video demonstrations, and precautions"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </button>
        }
      />

      <div className="flex flex-wrap gap-1.5 mb-6">
        {AREAS.map((a) => (
          <button
            key={a}
            onClick={() => setArea(a)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
              area === a
                ? "bg-[#283983] text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map((ex) => (
          <div
            key={ex._id}
            className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#283983] shrink-0" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    {ex.name}
                  </h3>
                </div>
                <Badge variant="primary">{ex.bodyArea}</Badge>
              </div>
              <p className="text-xs text-slate-600">{ex.description}</p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span>
                  {ex.defaultSets} sets &times; {ex.defaultReps} reps
                </span>
                <span>&bull; {ex.difficulty}</span>
                <span>&bull; {ex.frequency}</span>
              </div>
              {ex.precautions && (
                <div className="p-2.5 rounded-lg bg-[#FEF2F2] text-[11px] text-[#BA2820] flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{ex.precautions}</span>
                </div>
              )}
            </div>
            {ex.videoUrl && (
              <a
                href={ex.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#283983] hover:underline"
              >
                Preview Demonstration Video &rarr;
              </a>
            )}
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Exercise to Library"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Exercise Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <select
              value={form.bodyArea}
              onChange={(e) => setForm({ ...form, bodyArea: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
            >
              {AREAS.filter((a) => a !== "all").map((a) => (
                <option key={a} value={a}>
                  {a.toUpperCase()}
                </option>
              ))}
            </select>
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <input
              type="text"
              placeholder="Video URL (YouTube / Private Stream)"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="number"
              placeholder="Default Sets"
              value={form.defaultSets}
              onChange={(e) =>
                setForm({ ...form, defaultSets: Number(e.target.value) })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Default Reps (e.g. 10-12)"
              value={form.defaultReps}
              onChange={(e) => setForm({ ...form, defaultReps: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
          </div>
          <textarea
            rows={2}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <textarea
            rows={2}
            placeholder="Step-by-step Instructions"
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <input
            type="text"
            placeholder="Precautions / Red Flags"
            value={form.precautions}
            onChange={(e) => setForm({ ...form, precautions: e.target.value })}
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
              Save Exercise
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
