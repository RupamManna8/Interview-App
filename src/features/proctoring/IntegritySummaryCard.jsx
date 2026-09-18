import React from "react";
import { ShieldCheck, Maximize, ExternalLink, Users, EyeOff, Copy, ClipboardCheck } from "lucide-react";

export const IntegritySummaryCard = ({
  summary = {},
  title = "Interview Integrity Telemetry",
  subtitle = "Lightweight browser interaction signals recorded during the session",
}) => {
  const metrics = [
    {
      label: "Fullscreen Exits",
      value: summary.fullscreenExits || 0,
      icon: Maximize,
      status: (summary.fullscreenExits || 0) === 0 ? "clean" : "flagged",
    },
    {
      label: "Tab Visibility Switches",
      value: summary.tabSwitches || 0,
      icon: ExternalLink,
      status: (summary.tabSwitches || 0) === 0 ? "clean" : "flagged",
    },
    {
      label: "Multiple Face Events",
      value: summary.multipleFaceEvents || 0,
      icon: Users,
      status: (summary.multipleFaceEvents || 0) === 0 ? "clean" : "flagged",
    },
    {
      label: "Face Missing Events",
      value: summary.faceMissingEvents || 0,
      icon: EyeOff,
      status: (summary.faceMissingEvents || 0) === 0 ? "clean" : "flagged",
    },
    {
      label: "Copy Attempts",
      value: summary.copyAttempts || 0,
      icon: Copy,
      status: (summary.copyAttempts || 0) === 0 ? "clean" : "flagged",
    },
    {
      label: "Paste Attempts",
      value: summary.pasteAttempts || 0,
      icon: ClipboardCheck,
      status: (summary.pasteAttempts || 0) === 0 ? "clean" : "flagged",
    },
  ];

  const totalViolations = summary.totalViolations ?? metrics.reduce((acc, m) => acc + m.value, 0);

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#F1ECE6]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#1F2937]">{title}</h3>
            <p className="text-xs text-[#6B7280]">{subtitle}</p>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              totalViolations === 0
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : totalViolations <= 3
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {totalViolations === 0 ? "✓ Optimal Integrity" : `${totalViolations} Monitored Event${totalViolations > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          const isZero = item.value === 0;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all ${
                isZero
                  ? "bg-[#FAF8F5] border-[#EAE6DF]"
                  : "bg-amber-50/50 border-amber-200/80"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1.5">
                <span className="font-medium text-[#4B5563] truncate pr-2">{item.label}</span>
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isZero ? "text-slate-400" : "text-amber-600"}`} />
              </div>
              <p
                className={`text-lg font-bold ${
                  isZero ? "text-[#1F2937]" : "text-amber-700"
                }`}
              >
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-[#9CA3AF] text-center sm:text-left">
        Telemetry is collected via browser APIs for verification purposes and does not stream raw video/audio to server infrastructure.
      </p>
    </div>
  );
};
