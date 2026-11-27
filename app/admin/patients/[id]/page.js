"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Archive,
  FileText,
  Download,
  Activity,
  ClipboardList,
  Dumbbell,
  CreditCard,
  Calendar,
} from "lucide-react";

export default function PatientDetailPage({ params }) {
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("mri");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/patients/${id}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleArchiveToggle() {
    const nextStatus =
      data.patient.status === "active" ? "archived" : "active";
    await fetch(`/api/patients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    load();
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    await fetch(`/api/patients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalNote: noteText }),
    });
    setNoteText("");
    load();
  }

  async function handleDocumentUpload(e) {
    e.preventDefault();
    if (!uploadFile) return;
    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("patientId", id);
    fd.append("title", uploadTitle || uploadFile.name);
    fd.append("category", uploadCategory);
    const res = await fetch("/api/documents", { method: "POST", body: fd });
    if (res.ok) {
      setUploadFile(null);
      setUploadTitle("");
      load();
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="p-8 text-center text-sm text-slate-500">
          Loading patient record...
        </div>
      </AppShell>
    );
  }

  if (!data?.patient) {
    return (
      <AppShell>
        <div className="p-8 text-center text-sm text-slate-500">
          Patient record not found or access restricted.
        </div>
      </AppShell>
    );
  }

  const {
    patient,
    appointments,
    assessments,
    treatmentPlans,
    rehabPlans,
    documents,
    invoices,
  } = data;

  const tabs = [
    { id: "overview", label: "Overview & History" },
    { id: "appointments", label: `Appointments (${appointments.length})` },
    { id: "assessments", label: `Pain Assessments (${assessments.length})` },
    { id: "treatments", label: `Treatment Plans (${treatmentPlans.length})` },
    { id: "rehab", label: `Rehabilitation (${rehabPlans.length})` },
    { id: "documents", label: `Documents (${documents.length})` },
    { id: "billing", label: `Billing (${invoices.length})` },
  ];

  return (
    <AppShell>
      <div className="mb-4">
        <Link
          href="/admin/patients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#283983]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Patient Directory
        </Link>
      </div>

      <PageHeader
        title={`${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`}
        subtitle={`Patient ID: ${patient.patientId} • ${patient.contact.phone} • ${patient.patientType.toUpperCase()} PATIENT`}
        actions={
          <>
            <Badge variant={statusBadgeVariant(patient.status)}>
              {patient.status}
            </Badge>
            <Link
              href={`/doctor/assessments?patientId=${id}`}
              className="px-3.5 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold hover:bg-[#1d2a66]"
            >
              + New Pain Assessment
            </Link>
            <button
              onClick={handleArchiveToggle}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Archive className="w-3.5 h-3.5" />
              {patient.status === "active" ? "Archive Profile" : "Restore Profile"}
            </button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1.5 pb-2 mb-6 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              tab === t.id
                ? "bg-[#283983] text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">
                Personal &amp; Contact Information
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Date of Birth</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(patient.personalInfo.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gender</span>
                  <span className="font-semibold text-slate-900">
                    {patient.personalInfo.gender}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Timezone</span>
                  <span className="font-semibold text-slate-900">
                    {patient.contact.timezone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email</span>
                  <span className="font-semibold text-slate-900">
                    {patient.contact.email || "—"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Address</span>
                  <span className="font-semibold text-slate-900">
                    {patient.contact.address || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Emergency Contact</span>
                  <span className="font-semibold text-slate-900">
                    {patient.emergencyContact?.name || "—"}{" "}
                    {patient.emergencyContact?.relationship
                      ? `(${patient.emergencyContact.relationship})`
                      : ""}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Emergency Phone</span>
                  <span className="font-semibold text-slate-900">
                    {patient.emergencyContact?.phone || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">
                Medical &amp; Surgical History
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">
                    Previous Illnesses
                  </span>
                  <p className="text-slate-800">
                    {patient.medicalHistory?.previousIllnesses?.join(", ") || "None recorded"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">
                    Surgical History
                  </span>
                  <p className="text-slate-800">
                    {patient.medicalHistory?.surgicalHistory?.join(", ") || "None recorded"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">
                    Allergies
                  </span>
                  <p className="text-[#BA2820] font-semibold">
                    {patient.medicalHistory?.allergies?.join(", ") || "None known"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">
                    Current Medications
                  </span>
                  {patient.medicalHistory?.currentMedications?.length ? (
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-800">
                      {patient.medicalHistory.currentMedications.map((m, i) => (
                        <li key={i}>
                          {m.name} {m.dosage} ({m.frequency})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-800">None recorded</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
            <h2 className="text-base font-semibold text-slate-900 mb-3">
              Internal Clinic Notes
            </h2>
            <div className="flex-1 space-y-2.5 max-h-72 overflow-y-auto mb-4">
              {(patient.internalNotes || []).length === 0 ? (
                <p className="text-xs text-slate-500">No internal notes yet.</p>
              ) : (
                patient.internalNotes.map((n, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#F5F8FC] border border-slate-200 text-xs"
                  >
                    <p className="text-slate-800">{n.note}</p>
                    <span className="block text-[10px] text-slate-500 mt-1">
                      {n.createdByName} &bull;{" "}
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add internal staff note..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold hover:bg-[#1d2a66]"
              >
                Save Note
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === "appointments" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          {appointments.length === 0 ? (
            <p className="text-xs text-slate-500">No appointments recorded.</p>
          ) : (
            appointments.map((a) => (
              <div
                key={a._id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#283983]" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 capitalize">
                      {a.type.replace(/_/g, " ")} with {a.doctorId?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(a.scheduledAt).toLocaleString()} ({a.durationMinutes} mins)
                    </p>
                  </div>
                </div>
                <Badge variant={statusBadgeVariant(a.status)}>{a.status}</Badge>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "assessments" && (
        <div className="space-y-4">
          {assessments.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-500">
              No pain assessments recorded for this patient.
            </div>
          ) : (
            assessments.map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#BA2820]" />
                    <span className="text-sm font-semibold text-slate-900">
                      {a.painInfo?.primaryComplaint}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(a.assessedAt).toLocaleDateString()} &bull;{" "}
                    {a.assessedBy?.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#F5F8FC]">
                    <span className="text-slate-500 block">Current</span>
                    <span className="font-mono font-bold text-[#BA2820]">
                      {a.painScores?.current}/10
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F5F8FC]">
                    <span className="text-slate-500 block">24h Avg</span>
                    <span className="font-mono font-bold text-slate-900">
                      {a.painScores?.average24h}/10
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F5F8FC]">
                    <span className="text-slate-500 block">Worst</span>
                    <span className="font-mono font-bold text-slate-900">
                      {a.painScores?.worst}/10
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F5F8FC]">
                    <span className="text-slate-500 block">At Rest</span>
                    <span className="font-mono font-bold text-slate-900">
                      {a.painScores?.atRest}/10
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F5F8FC]">
                    <span className="text-slate-500 block">Activity</span>
                    <span className="font-mono font-bold text-slate-900">
                      {a.painScores?.duringActivity}/10
                    </span>
                  </div>
                </div>
                {a.clinicalAssessment?.confirmedDiagnosis && (
                  <p className="text-xs text-slate-700">
                    <strong>Diagnosis:</strong>{" "}
                    {a.clinicalAssessment.confirmedDiagnosis}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "treatments" && (
        <div className="space-y-4">
          {treatmentPlans.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-500">
              No treatment plans created yet.
            </div>
          ) : (
            treatmentPlans.map((tp) => (
              <div
                key={tp._id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#283983]" />
                    <span className="text-sm font-semibold text-slate-900">
                      {tp.title} (v{tp.version})
                    </span>
                  </div>
                  <Badge variant={statusBadgeVariant(tp.status)}>{tp.status}</Badge>
                </div>
                <p className="text-xs text-slate-700">
                  <strong>Diagnosis:</strong> {tp.diagnosis}
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Goals:</strong> {tp.goals}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "rehab" && (
        <div className="space-y-4">
          {rehabPlans.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-500">
              No rehabilitation programs assigned.
            </div>
          ) : (
            rehabPlans.map((rp) => (
              <div
                key={rp._id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#283983]" />
                    <span className="text-sm font-semibold text-slate-900">
                      {rp.title}
                    </span>
                  </div>
                  <Badge variant={statusBadgeVariant(rp.status)}>{rp.status}</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  {rp.exercises?.length || 0} exercises &bull; {rp.logs?.length || 0}{" "}
                  completed logs
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "documents" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">
              Centralized Medical Documents
            </h2>
            {documents.length === 0 ? (
              <p className="text-xs text-slate-500">No documents uploaded.</p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#283983]" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-slate-500 uppercase">
                        {doc.category.replace(/_/g, " ")} &bull; {doc.fileName}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/documents/${doc._id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EEF2FF] text-[#283983] text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    View
                  </a>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleDocumentUpload}
            className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 h-fit"
          >
            <h3 className="text-sm font-semibold text-slate-900">
              Upload Medical Report
            </h3>
            <input
              type="text"
              placeholder="Document title (e.g., Lumbar MRI)"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
            />
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="mri">MRI Report</option>
              <option value="xray">X-Ray Report</option>
              <option value="ct_scan">CT Scan</option>
              <option value="lab_report">Lab Report</option>
              <option value="prescription">Prescription</option>
              <option value="referral">Referral Letter</option>
              <option value="discharge_summary">Discharge Summary</option>
              <option value="other">Other</option>
            </select>
            <input
              type="file"
              required
              accept=".pdf,image/*"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-xs"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold hover:bg-[#1d2a66]"
            >
              Upload Securely
            </button>
          </form>
        </div>
      )}

      {tab === "billing" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          {invoices.length === 0 ? (
            <p className="text-xs text-slate-500">No invoices for this patient.</p>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv._id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-[#283983]" />
                  <div>
                    <p className="text-xs font-mono font-semibold text-slate-900">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      Total: {inv.currency} {inv.totalAmount.toLocaleString()} &bull;
                      Balance: {inv.currency} {inv.balanceDue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant={statusBadgeVariant(inv.status)}>{inv.status}</Badge>
              </div>
            ))
          )}
        </div>
      )}
    </AppShell>
  );
}
