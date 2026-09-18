import React, { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, Maximize, UserX, Users, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ProctoringStatusBadge = ({
  manager,
  onRequestFullscreen,
}) => {
  const [proctorState, setProctorState] = useState({
    status: "active",
    activeWarning: null,
    faceCount: 1,
    isFullscreen: true,
    warningCount: 0,
  });

  useEffect(() => {
    if (!manager) return;
    const unsubscribe = manager.subscribe(({ state }) => {
      setProctorState(state);
    });
    return unsubscribe;
  }, [manager]);

  const { status, activeWarning, isFullscreen, faceCount, warningCount } = proctorState;

  return (
    <>
      {/* Sleek, Non-Intrusive Status Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs text-slate-200 shadow-sm transition-all select-none">
        <span className="relative flex h-2 w-2">
          {status === "warning" ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          )}
        </span>

        <span className="font-medium flex items-center gap-1.5 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          {status === "warning"
            ? "Integrity Check"
            : "Monitoring Active"}
        </span>

        {!isFullscreen && onRequestFullscreen && (
          <button
            onClick={onRequestFullscreen}
            className="ml-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-[10px] font-semibold text-white flex items-center gap-1 transition-colors"
          >
            <Maximize className="w-3 h-3" />
            Enter Fullscreen
          </button>
        )}

        {warningCount > 0 && (
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {warningCount} flag{warningCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Non-Intrusive Floating Warning Banner (Top-Right / Top-Center) */}
      <AnimatePresence>
        {activeWarning && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4"
          >
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/95 border border-amber-500/40 text-amber-200 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  {faceCount === 0 ? (
                    <UserX className="w-4 h-4" />
                  ) : faceCount > 1 ? (
                    <Users className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-300">Integrity Notice</p>
                  <p className="text-xs text-slate-300 mt-0.5">{activeWarning}</p>
                </div>
              </div>

              <button
                onClick={() => manager?.clearActiveWarning()}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
