"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { FileText, Download, Upload } from "lucide-react";

export default function PatientMedicalRecordsPage() {
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("mri");
  const [file, setFile] = useState(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/documents");
    if (res.ok) setDocuments((await res.json()).documents || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title || file.name);
    fd.append("category", category);
    const res = await fetch("/api/documents", { method: "POST", body: fd });
    if (res.ok) {
      setTitle("");
      setFile(null);
      load();
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="My Medical Records"
        subtitle="Securely view shared reports and upload your MRI, X-ray, or lab documents for your doctor"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          {documents.length === 0 ? (
            <p className="text-xs text-slate-500">No medical documents yet.</p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#283983]" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="primary">
                        {doc.category.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-[11px] text-slate-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
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
          onSubmit={handleUpload}
          className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 h-fit"
        >
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#283983]" />
            Upload Report for Doctor
          </h2>
          <input
            type="text"
            placeholder="Report Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
          >
            <option value="mri">MRI Report</option>
            <option value="xray">X-Ray Report</option>
            <option value="ct_scan">CT Scan</option>
            <option value="lab_report">Lab Report</option>
            <option value="other">Other</option>
          </select>
          <input
            type="file"
            required
            accept=".pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-xs"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-[#283983] text-white text-xs font-semibold"
          >
            Upload Securely
          </button>
        </form>
      </div>
    </AppShell>
  );
}
