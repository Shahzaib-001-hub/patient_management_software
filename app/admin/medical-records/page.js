"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FileText, Upload, Download } from "lucide-react";

export default function AdminMedicalRecordsPage() {
  const [documents, setDocuments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("mri");
  const [file, setFile] = useState(null);

  const load = useCallback(async () => {
    const [dRes, pRes] = await Promise.all([
      fetch("/api/documents"),
      fetch("/api/patients?status=active"),
    ]);
    if (dRes.ok) {
      const d = await dRes.json();
      setDocuments(d.documents || []);
    }
    if (pRes.ok) {
      const p = await pRes.json();
      setPatients(p.patients || []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file || !patientId) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("patientId", patientId);
    fd.append("title", title || file.name);
    fd.append("category", category);

    const res = await fetch("/api/documents", { method: "POST", body: fd });
    if (res.ok) {
      setModalOpen(false);
      setTitle("");
      setFile(null);
      load();
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Medical Records & Document Repository"
        subtitle="Private, permission-controlled storage for MRI, X-ray, CT scans, lab reports, and prescriptions"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
            <tr>
              <th className="py-3 px-4 font-semibold">Document</th>
              <th className="py-3 px-4 font-semibold">Patient</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold">Uploaded By</th>
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold text-right">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No medical documents uploaded yet.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#283983]" />
                    {doc.title}
                  </td>
                  <td className="py-3 px-4">
                    {doc.patientId?.personalInfo?.firstName}{" "}
                    {doc.patientId?.personalInfo?.lastName}
                    <span className="block font-mono text-[11px] text-slate-500">
                      {doc.patientId?.patientId}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="primary">
                      {doc.category.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {doc.uploadedBy?.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(doc.documentDate || doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`/api/documents/${doc._id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EEF2FF] text-[#283983] font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Authorized View
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload Medical Document"
        subtitle="Stored privately — accessible only to authorized clinic staff and the patient."
      >
        <form onSubmit={handleUpload} className="space-y-3">
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
            placeholder="Document Title (e.g., Cervical Spine MRI)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
          >
            <option value="mri">MRI Report</option>
            <option value="xray">X-Ray Report</option>
            <option value="ct_scan">CT Scan</option>
            <option value="lab_report">Laboratory Report</option>
            <option value="prescription">Prescription</option>
            <option value="referral">Referral Letter</option>
            <option value="discharge_summary">Discharge Summary</option>
            <option value="other">Other</option>
          </select>
          <input
            type="file"
            required
            accept=".pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-xs"
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
              Upload
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
