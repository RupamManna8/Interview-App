import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Mic,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

export const EnvironmentCheckModal = ({
  onComplete,
  onCancel,
}) => {
  const videoPreviewRef = useRef(null);
  const streamRef = useRef(null);

  const [checks, setChecks] = useState({
    camera: { status: "pending", label: "Camera Access" },
    mic: { status: "pending", label: "Microphone Access" },
    fullscreen: { status: "pending", label: "Fullscreen Support" },
    browser: { status: "pending", label: "Browser Compatibility" },
  });

  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const runDiagnostics = async () => {
    setIsChecking(true);

    const updated = {
      browser: { status: "success", label: "Browser Compatibility" },
      fullscreen: {
        status: document.fullscreenEnabled ? "success" : "warning",
        label: "Fullscreen Support",
      },
      camera: { status: "pending", label: "Camera Access" },
      mic: { status: "pending", label: "Microphone Access" },
    };

    // Check media devices API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      updated.browser = {
        status: "error",
        label: "Browser lacks media support",
      };
      setChecks(updated);
      setIsChecking(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      updated.camera = videoTracks.length > 0 && videoTracks[0].enabled
        ? { status: "success", label: "Camera Connected & Ready" }
        : { status: "error", label: "No Camera Track" };

      updated.mic = audioTracks.length > 0 && audioTracks[0].enabled
        ? { status: "success", label: "Microphone Connected & Ready" }
        : { status: "error", label: "No Microphone Track" };

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Media access diagnostic issue:", err);
      // Try audio only or video only to distinguish
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = videoStream;
        updated.camera = { status: "success", label: "Camera Connected" };
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = videoStream;
          videoPreviewRef.current.play().catch(() => {});
        }
      } catch {
        updated.camera = { status: "error", label: "Camera Permission Denied" };
      }

      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        updated.mic = { status: "success", label: "Microphone Connected" };
      } catch {
        updated.mic = { status: "error", label: "Microphone Permission Denied" };
      }
    }

    setChecks(updated);
    setIsChecking(false);
  };

  useEffect(() => {
    runDiagnostics();

    const handleFsChange = () => {
      setIsFullscreenActive(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFsChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      if (streamRef.current) {
        // Keep stream for interview or stop if cancelled
      }
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreenActive(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreenActive(false);
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
    }
  };

  const allRequiredPassed =
    checks.camera.status === "success" &&
    checks.mic.status === "success" &&
    checks.browser.status === "success";

  const handleStart = () => {
    onComplete({
      stream: streamRef.current,
      fullscreen: isFullscreenActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Interview Environment Check
              </h2>
              <p className="text-xs text-slate-500">
                Verify your devices and integrity settings before launching
              </p>
            </div>
          </div>

          <button
            onClick={runDiagnostics}
            disabled={isChecking}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
            Re-check
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Camera Preview */}
            <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
              {checks.camera.status !== "success" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-4 text-center">
                  <Camera className="w-8 h-8 text-slate-500 mb-2" />
                  <p className="text-xs text-slate-400 font-medium">
                    Camera preview will appear here
                  </p>
                </div>
              )}
              {checks.camera.status === "success" && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-500/80 backdrop-blur-sm text-[10px] font-bold text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Preview Active
                </span>
              )}
            </div>

            {/* Diagnostics List */}
            <div className="space-y-2.5">
              {Object.entries(checks).map(([key, item]) => {
                const isSuccess = item.status === "success";
                const isPending = item.status === "pending";

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {key === "camera" && <Camera className="w-4 h-4 text-slate-500" />}
                      {key === "mic" && <Mic className="w-4 h-4 text-slate-500" />}
                      {key === "fullscreen" && <Maximize2 className="w-4 h-4 text-slate-500" />}
                      {key === "browser" && <Shield className="w-4 h-4 text-slate-500" />}
                      <span className="font-medium text-slate-700">{item.label}</span>
                    </div>

                    <div>
                      {isSuccess ? (
                        <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Ready
                        </span>
                      ) : isPending ? (
                        <span className="text-slate-400">Checking…</span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-4 h-4" /> Action needed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Fullscreen Option */}
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isFullscreenActive
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                {isFullscreenActive ? "✓ Fullscreen Enabled" : "Enter Fullscreen Mode"}
              </button>
            </div>
          </div>

          {/* Guidelines */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100/80 text-xs text-indigo-950 space-y-2">
            <p className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              Interview Guidelines & Integrity Monitoring
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-indigo-800 text-[11px] list-disc list-inside">
              <li>Keep only yourself visible on camera</li>
              <li>Remain on the interview tab</li>
              <li>Stay in fullscreen mode during questions</li>
              <li>External paste/copy actions are logged</li>
            </ul>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-600 font-medium select-none">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              I understand the interview monitoring guidelines and confirm my environment is ready.
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {onCancel ? (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleStart}
            disabled={!allRequiredPassed || !hasAgreed}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Start Interview
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
