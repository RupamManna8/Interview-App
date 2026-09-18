import React from "react";

export default function CalibrationApp({ onCalibrated }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Environment Ready</h2>
      <p className="text-xs text-slate-500">
        Browser proctoring is enabled and ready.
      </p>
      <button
        onClick={() => onCalibrated && onCalibrated()}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
      >
        Proceed to Interview
      </button>
    </div>
  );
}