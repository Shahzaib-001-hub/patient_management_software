"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { BodyPainMap } from "@/components/doctor/BodyPainMap";
import { Activity, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function DoctorAssessmentsPage() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [history, setHistory] = useState([]);
  const [savedBanner, setSavedBanner] = useState(false);

  const [painInfo, setPainInfo] = useState({
    primaryComplaint: "",
    location: "",
    onset: "",
    duration: "",
    frequency: "",
    aggravatingFactors: "",
    relievingFactors: "",
    previousTreatment: "",
  });

  const [painScores, setPainScores] = useState({
    current: 5,
    average24h: 5,
    worst: 7,
    atRest: 3,
    duringActivity: 6,
  });

  const [painLocations, setPainLocations] = useState([]);

  const [functional, setFunctional] = useState({
    walkingAbility: "",
    sittingTolerance: "",
    standingTolerance: "",
    sleepQuality: "",
    dailyActivityLimitations: "",
    rangeOfMotion: "",
    workLifestyleImpact: "",
  });

  const [clinical, setClinical] = useState({
    examinationNotes: "",
    findings: "",
    provisionalDiagnosis: "",
    confirmedDiagnosis: "",
    recommendedInvestigations: "",
  });

  useEffect(() => {
    fetch("/api/patients?status=active")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.patients?.length) {
          setPatients(d.patients);
          const urlParams = new URLSearchParams(window.location.search);
          const pre = urlParams.get("patientId");
          setPatientId(pre || d.patients[0]._id);
        }
      });
  }, []);

  const loadHistory = useCallback(async () => {
    if (!patientId) return;
    const res = await fetch(`/api/assessments?patientId=${patientId}`);
    if (res.ok) {
      const d = await res.json();
      setHistory(d.assessments || []);
    }
  }, [patientId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSavedBanner(false);
    const res = await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        painInfo: {
          ...painInfo,
          aggravatingFactors: painInfo.aggravatingFactors
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          relievingFactors: painInfo.relievingFactors
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        painScores,
        painLocations,
        functionalAssessment: functional,
        clinicalAssessment: {
          ...clinical,
          recommendedInvestigations: clinical.recommendedInvestigations
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      }),
    });
    if (res.ok) {
      setSavedBanner(true);
      loadHistory();
    }
  }

  const trendData = [...history]
    .reverse()
    .map((h) => ({
      date: new Date(h.assessedAt).toLocaleDateString(),
      current: h.painScores?.current ?? 0,
      worst: h.painScores?.worst ?? 0,
      atRest: h.painScores?.atRest ?? 0,
    }));

  return (
    <AppShell>
      <PageHeader
        title="Pain Assessment & Clinical Evaluation"
        subtitle="Structured 0–10 NRS pain scoring, interactive body mapping, functional evaluation, and historical comparison"
        actions={
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
          >
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.patientId} - {p.personalInfo.firstName}{" "}
                {p.personalInfo.lastName}
              </option>
            ))}
          </select>
        }
      />

      {savedBanner && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Pain assessment saved to patient&apos;s permanent clinical record.
        </div>
      )}

      {/* Historical Comparison Chart */}
      {trendData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Historical Pain Score Comparison (0–10 NRS)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="current"
                  name="Current Pain"
                  stroke="#BA2820"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="worst"
                  name="Worst Pain"
                  stroke="#283983"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="atRest"
                  name="At Rest"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* A. Pain Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#BA2820]" />
            A. Pain Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Primary Pain Complaint *"
              value={painInfo.primaryComplaint}
              onChange={(e) =>
                setPainInfo({ ...painInfo, primaryComplaint: e.target.value })
              }
              className="sm:col-span-2 px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Location (e.g., L4-L5)"
              value={painInfo.location}
              onChange={(e) =>
                setPainInfo({ ...painInfo, location: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Onset (e.g., Gradual / Sudden)"
              value={painInfo.onset}
              onChange={(e) =>
                setPainInfo({ ...painInfo, onset: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Duration (e.g., 3 months)"
              value={painInfo.duration}
              onChange={(e) =>
                setPainInfo({ ...painInfo, duration: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Frequency (e.g., Constant / Intermittent)"
              value={painInfo.frequency}
              onChange={(e) =>
                setPainInfo({ ...painInfo, frequency: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Aggravating Factors (comma-separated)"
              value={painInfo.aggravatingFactors}
              onChange={(e) =>
                setPainInfo({ ...painInfo, aggravatingFactors: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Relieving Factors (comma-separated)"
              value={painInfo.relievingFactors}
              onChange={(e) =>
                setPainInfo({ ...painInfo, relievingFactors: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Previous Treatment History"
              value={painInfo.previousTreatment}
              onChange={(e) =>
                setPainInfo({ ...painInfo, previousTreatment: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
          </div>
        </div>

        {/* B. 0-10 NRS Pain Intensity Scale */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              B. Pain Intensity Scale (0–10 NRS)
            </h2>
            <span className="text-[11px] text-slate-500">
              0 = No pain &bull; 10 = Worst pain
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { key: "current", label: "Current Pain" },
              { key: "average24h", label: "24h Average" },
              { key: "worst", label: "Worst Pain" },
              { key: "atRest", label: "At Rest" },
              { key: "duringActivity", label: "During Activity" },
            ].map((item) => (
              <div
                key={item.key}
                className="p-3.5 rounded-xl bg-[#F5F8FC] border border-slate-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-700">
                    {item.label}
                  </span>
                  <span className="font-mono font-bold text-sm text-[#BA2820]">
                    {painScores[item.key]}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painScores[item.key]}
                  onChange={(e) =>
                    setPainScores({
                      ...painScores,
                      [item.key]: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#BA2820]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* C. Body Pain Mapping */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            C. Interactive Body Pain Map
          </h2>
          <BodyPainMap value={painLocations} onChange={setPainLocations} />
        </div>

        {/* D. Functional Assessment */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            D. Functional Assessment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Walking Ability"
              value={functional.walkingAbility}
              onChange={(e) =>
                setFunctional({ ...functional, walkingAbility: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Sitting Tolerance"
              value={functional.sittingTolerance}
              onChange={(e) =>
                setFunctional({ ...functional, sittingTolerance: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Standing Tolerance"
              value={functional.standingTolerance}
              onChange={(e) =>
                setFunctional({
                  ...functional,
                  standingTolerance: e.target.value,
                })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Sleep Quality"
              value={functional.sleepQuality}
              onChange={(e) =>
                setFunctional({ ...functional, sleepQuality: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Range of Motion"
              value={functional.rangeOfMotion}
              onChange={(e) =>
                setFunctional({ ...functional, rangeOfMotion: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Work & Lifestyle Impact"
              value={functional.workLifestyleImpact}
              onChange={(e) =>
                setFunctional({
                  ...functional,
                  workLifestyleImpact: e.target.value,
                })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
          </div>
        </div>

        {/* E. Clinical Assessment & Diagnosis */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            E. Clinical Examination &amp; Diagnosis
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Provisional Diagnosis"
              value={clinical.provisionalDiagnosis}
              onChange={(e) =>
                setClinical({
                  ...clinical,
                  provisionalDiagnosis: e.target.value,
                })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
            <input
              type="text"
              placeholder="Confirmed Diagnosis"
              value={clinical.confirmedDiagnosis}
              onChange={(e) =>
                setClinical({ ...clinical, confirmedDiagnosis: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-slate-200"
            />
          </div>
          <textarea
            rows={2}
            placeholder="Doctor's Examination Notes & Clinical Findings"
            value={clinical.examinationNotes}
            onChange={(e) =>
              setClinical({ ...clinical, examinationNotes: e.target.value })
            }
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <input
            type="text"
            placeholder="Recommended Investigations (comma-separated, e.g., MRI Lumbosacral Spine)"
            value={clinical.recommendedInvestigations}
            onChange={(e) =>
              setClinical({
                ...clinical,
                recommendedInvestigations: e.target.value,
              })
            }
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#283983] hover:bg-[#1d2a66] text-white text-sm font-semibold"
            >
              Save Pain Assessment
            </button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
