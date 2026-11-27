"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Dumbbell, CheckCircle2, AlertTriangle, PlayCircle } from "lucide-react";

export default function PatientExercisesPage() {
  const [plans, setPlans] = useState([]);
  const [logModal, setLogModal] = useState(null);
  const [painAfter, setPainAfter] = useState(3);
  const [difficulty, setDifficulty] = useState("moderate");
  const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/rehabilitation");
    if (res.ok) setPlans((await res.json()).plans || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLog(e) {
    e.preventDefault();
    if (!logModal) return;
    const res = await fetch(`/api/rehabilitation/${logModal.planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logEntry: {
          exerciseId: logModal.exerciseId,
          painAfter,
          difficulty,
          feedback,
          status: "completed",
        },
      }),
    });
    if (res.ok) {
      setLogModal(null);
      setFeedback("");
      load();
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="My Rehabilitation Exercises"
        subtitle="Watch exercise demonstrations, follow instructions, and log your post-exercise pain levels"
      />

      <div className="space-y-6">
        {plans.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-500">
            No rehabilitation programs assigned yet.
          </div>
        ) : (
          plans.map((rp) => (
            <div
              key={rp._id}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {rp.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Assigned by {rp.assignedBy?.name} &bull; {rp.frequency}
                  </p>
                </div>
                <Badge variant={statusBadgeVariant(rp.status)}>
                  {rp.status}
                </Badge>
              </div>

              {rp.doctorInstructions && (
                <p className="text-xs text-slate-700 bg-[#EEF2FF] p-3 rounded-lg">
                  <strong>Doctor Instructions:</strong> {rp.doctorInstructions}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(rp.exercises || []).map((item, idx) => {
                  const ex = item.exerciseId;
                  if (!ex) return null;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-[#F5F8FC] flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-[#283983]" />
                            <h3 className="text-sm font-semibold text-slate-900">
                              {ex.name}
                            </h3>
                          </div>
                          <Badge variant="primary">{ex.bodyArea}</Badge>
                        </div>
                        <p className="text-xs font-semibold text-[#283983]">
                          {item.sets} sets &times; {item.reps} reps
                        </p>
                        <p className="text-xs text-slate-600">
                          {ex.instructions || ex.description}
                        </p>
                        {ex.precautions && (
                          <div className="p-2 rounded bg-[#FEF2F2] text-[11px] text-[#BA2820] flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{ex.precautions}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {ex.videoUrl && (
                          <a
                            href={ex.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700"
                          >
                            <PlayCircle className="w-3.5 h-3.5 text-[#283983]" />
                            Watch Video
                          </a>
                        )}
                        {rp.status === "active" && (
                          <button
                            onClick={() =>
                              setLogModal({
                                planId: rp._id,
                                exerciseId: ex._id,
                                name: ex.name,
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#283983] text-white text-xs font-semibold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={Boolean(logModal)}
        onClose={() => setLogModal(null)}
        title={`Log Exercise: ${logModal?.name || ""}`}
      >
        <form onSubmit={handleLog} className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Pain Level After Exercise (0–10)</span>
              <span className="font-mono text-[#BA2820]">{painAfter}/10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={painAfter}
              onChange={(e) => setPainAfter(Number(e.target.value))}
              className="w-full accent-[#BA2820]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Difficulty / Comfort
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
            >
              <option value="easy">Easy / Comfortable</option>
              <option value="moderate">Moderate Effort</option>
              <option value="hard">Hard / Challenging</option>
              <option value="painful">Painful / Discomfort</option>
            </select>
          </div>

          <textarea
            rows={2}
            placeholder="Any discomfort or notes for your doctor..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setLogModal(null)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#283983] rounded-lg"
            >
              Submit Completion
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
