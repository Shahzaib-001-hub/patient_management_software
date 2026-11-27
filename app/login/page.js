"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartPulse, Lock, Mail, ArrowRight } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Super Admin", email: "superadmin@prwc.pk", pw: "Admin@1234" },
  { label: "Clinic Admin", email: "admin@prwc.pk", pw: "Admin@1234" },
  { label: "Doctor", email: "doctor@prwc.pk", pw: "Doctor@1234" },
  { label: "Receptionist", email: "reception@prwc.pk", pw: "Staff@1234" },
  { label: "Rehab Staff", email: "rehab@prwc.pk", pw: "Staff@1234" },
  { label: "Accountant", email: "accountant@prwc.pk", pw: "Staff@1234" },
  { label: "Patient", email: "patient1@prwc.pk", pw: "Patient@1234" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign in failed");
        setLoading(false);
        return;
      }
      router.push(data.redirectTo || "/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#283983] flex items-center justify-center shadow-xs">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="font-bold text-slate-900 text-base block">
                Pain Relief &amp; Wellness Center
              </span>
              <span className="text-xs text-slate-500 block">
                Secure Clinic &amp; Patient Portal
              </span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-slate-900">Sign in to your account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your clinic staff or patient credentials
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#BA2820]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@prwc.pk"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#283983]/20 focus:border-[#283983]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#283983]/20 focus:border-[#283983]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#283983] hover:bg-[#1d2a66] text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New online patient?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#283983] hover:underline"
              >
                Create a patient account
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Demo Role Switcher */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
            Quick Demo Role Fill
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.pw);
                }}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#F5F8FC] hover:bg-[#EEF2FF] text-slate-700 hover:text-[#283983] border border-slate-200 transition-colors"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
