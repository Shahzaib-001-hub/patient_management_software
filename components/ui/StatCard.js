"use client";

export function StatCard({ title, value, subtitle, icon: Icon, tone = "primary" }) {
  const toneClasses = {
    primary: "bg-[#EEF2FF] text-[#283983]",
    accent: "bg-[#FEF2F2] text-[#BA2820]",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 font-mono">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              toneClasses[tone] || toneClasses.primary
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
