import React from "react";

export function Progress({ value = 0, className = "" }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-[#F1ECE6] ${className}`}>
      <div className="h-full rounded-full bg-[#0f172a] transition-all" style={{ width: `${clamped}%` }} />
    </div>
  );
}

export default Progress;
