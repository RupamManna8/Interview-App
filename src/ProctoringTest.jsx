import React, { useEffect, useRef, useState } from "react";
import {
  ProctoringManager,
  ProctoringStatusBadge,
  IntegritySummaryCard,
} from "./features/proctoring/index.js";

function ProctoringTest() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isProctoring, setIsProctoring] = useState(false);
  const [eventsLog, setEventsLog] = useState([]);
  const [summary, setSummary] = useState({});
  const [liveState, setLiveState] = useState({});

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const managerRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraOn(true);
    } catch (err) {
      alert("Failed to start camera: " + err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const startProctoring = async () => {
    if (!managerRef.current) {
      managerRef.current = new ProctoringManager({
        interviewId: "test-interview-123",
        sessionId: "test-session-123",
        apiRequest: async (path, opts) => {
          console.log("Mock API dispatch:", path, JSON.parse(opts.body));
        },
      });

      managerRef.current.subscribe(({ state, summary: currentSummary }) => {
        setLiveState(state);
        setSummary(currentSummary);
      });
    }

    await managerRef.current.start({
      videoElement: videoRef.current,
      stream: streamRef.current,
    });
    setIsProctoring(true);
  };

  const stopProctoring = () => {
    if (managerRef.current) {
      managerRef.current.stop();
    }
    setIsProctoring(false);
  };

  useEffect(() => {
    return () => {
      stopProctoring();
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">Lightweight Proctoring Test Harness</h1>
            <p className="text-xs text-slate-400">
              Browser-based MediaPipe Face Detection + Fullscreen + Tab Visibility Monitoring
            </p>
          </div>

          <ProctoringStatusBadge manager={managerRef.current} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-xl border border-slate-800 overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
              {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                  Camera inactive
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {!isCameraOn ? (
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white"
                >
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Stop Camera
                </button>
              )}

              <button
                onClick={startProctoring}
                disabled={!isCameraOn || isProctoring}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-xs font-semibold text-white"
              >
                Start Monitoring
              </button>

              <button
                onClick={stopProctoring}
                disabled={!isProctoring}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-xs font-semibold text-white"
              >
                Stop Monitoring
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
              <p className="font-semibold text-slate-200">Live Status Signals</p>
              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <div>Status: <span className="text-white font-medium">{liveState.status || "idle"}</span></div>
                <div>Face count: <span className="text-white font-medium">{liveState.faceCount ?? 1}</span></div>
                <div>Fullscreen: <span className="text-white font-medium">{liveState.isFullscreen ? "Yes" : "No"}</span></div>
                <div>Tab visible: <span className="text-white font-medium">{liveState.isVisible ? "Yes" : "No"}</span></div>
                <div>Active flags: <span className="text-amber-400 font-medium">{liveState.warningCount || 0}</span></div>
              </div>
            </div>

            <IntegritySummaryCard summary={summary} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProctoringTest;
