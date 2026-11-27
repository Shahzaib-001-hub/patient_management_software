"use client";

const VARIANT_CLASSES = {
  primary: "bg-[#EEF2FF] text-[#283983] border-[#C7D2FE]",
  accent: "bg-[#FEF2F2] text-[#BA2820] border-[#FECACA]",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

export function Badge({ children, variant = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function statusBadgeVariant(status) {
  switch (status) {
    case "active":
    case "confirmed":
    case "completed":
    case "paid":
      return "success";
    case "pending":
    case "partial":
    case "on_hold":
    case "rescheduled":
      return "warning";
    case "in_progress":
    case "checked_in":
      return "info";
    case "cancelled":
    case "no_show":
    case "unpaid":
    case "discontinued":
    case "revoked":
    case "archived":
      return "danger";
    default:
      return "neutral";
  }
}
