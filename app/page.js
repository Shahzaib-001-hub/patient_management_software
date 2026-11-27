import Link from "next/link";
import {
  HeartPulse,
  ShieldCheck,
  Video,
  Activity,
  Dumbbell,
  ArrowRight,
  CalendarCheck,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#283983] flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight block">
                Pain Relief &amp; Wellness Center
              </span>
              <span className="text-[11px] text-slate-500 block">
                Clinical Pain Management &amp; Rehabilitation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/store"
              className="px-4 py-2 text-sm font-semibold text-[#BA2820] hover:bg-[#FEF2F2] rounded-lg transition-colors"
            >
              Wellness Store &amp; Oils
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold text-[#283983] hover:bg-[#EEF2FF] rounded-lg transition-colors"
            >
              Online Patient Sign Up
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#283983] hover:bg-[#1d2a66] rounded-lg transition-colors shadow-xs"
            >
              Portal Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#283983] text-xs font-semibold border border-[#C7D2FE]">
              <ShieldCheck className="w-4 h-4" />
              Centralized Physical &amp; Online Care Platform
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 leading-tight tracking-tight">
              Structured Pain Assessment, Treatment &amp; Rehabilitation Care
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              A unified digital clinic platform for Pain Relief &amp; Wellness Center.
              Manage in-clinic visits, overseas telehealth consultations, structured
              0–10 pain mapping, personalized rehabilitation programs, and billing in one
              secure system.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#283983] hover:bg-[#1d2a66] text-white text-sm font-semibold shadow-sm transition-colors"
              >
                Access Staff / Patient Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-sm font-semibold shadow-2xs transition-colors"
              >
                New Online Patient Registration
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] text-[#283983] flex items-center justify-center mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900">Pain Mapping &amp; NRS</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Interactive front/back body pain diagrams and 0–10 clinical scoring with
                historical comparison.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] text-[#BA2820] flex items-center justify-center mb-3">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900">Guided Rehab Portal</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Curated exercise bundles, video instructions, and post-session pain
                feedback tracking.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900">Online Consultations</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Timezone-aware telehealth scheduling, secure document sharing, and
                digital treatment plans.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900">RBAC &amp; Audit Trail</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Dedicated panels for Admin, Doctors, Reception, Rehab Staff, Accountants,
                and Patients.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        Pain Relief &amp; Wellness Center (PRWC) &bull; Clinical &amp; Rehabilitation
        Management System v1.0
      </footer>
    </div>
  );
}
