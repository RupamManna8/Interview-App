import React from "react";

const toneClasses = {
  default: "bg-[#F1ECE6] text-[#0f172a] border-[#E5E7EB]",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  muted: "bg-[#F8F5F0] text-[#6B7280] border-[#E5E7EB]",
};

export function Badge({ className = "", tone = "default", ...props }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone] || toneClasses.default} ${className}`} {...props} />;
}

export default Badge;
