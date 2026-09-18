// CodingInterview.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CompetitiveEditor from "../../test.jsx";
import { CameraFeed } from "../../Pages/Interview/CamaraFeed.jsx";

const CodingInterview = ({
  question,
  interviewData,
  onSubmit,
  setIsInterviewComplete,
  cameraStream,
  warningCount,
  setCameraWarningCount,
  setCameraWarningMessage,
  setShowCameraWarning,
  onEndInterview,
  onConfirmEndInterview,
}) => {
  const resolvedQuestion = question || interviewData || {};
  const initialCode = resolvedQuestion.initialCode || resolvedQuestion.starterCode || "";
  const questionText =
    resolvedQuestion.text ||
    resolvedQuestion.question ||
    "Solve the coding task using the editor below.";
  const editorLanguage = resolvedQuestion.language || "javascript";

  const [submissions, setSubmissions] = useState([]);
  const [violationCount, setViolationCount] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const trackingVideoRef = useRef(null);
  const proctorSessionRef = useRef(null);
  const detectionStreakRef = useRef({
    lookAway: 0,
    noFace: 0,
    highRisk: 0,
  });
  const violationCooldownRef = useRef({
    look: 0,
    phone: 0,
    noFace: 0,
  });

  const [proctorState, setProctorState] = useState({
    loading: false,
    active: false,
    error: "",
    lastResult: null,
    lastValidData: null,
  });

  const handleViolation = useCallback(
    (msg) => {
      const normalizedMessage =
        typeof msg === "string"
          ? msg
          : msg?.message || "Suspicious activity detected";
      setViolationCount((prev) => prev + 1);
      setCameraWarningMessage(normalizedMessage);
      setShowCameraWarning(true);
      setCameraWarningCount((count) => count + 1);
    },
    [setCameraWarningCount, setCameraWarningMessage, setShowCameraWarning],
  );

  const handleProctorResult = useCallback(
    (result) => {
      const data = result?.data || result || null;
      console.log("[proctoring-response]", {
        timestamp: new Date().toISOString(),
        ok: Boolean(result?.ok),
        statusCode: result?.status,
        data,
      });
      setProctorState((prev) => ({
        ...prev,
        loading: false,
        active: true,
        error: result?.ok ? "" : String(data?.error || ""),
        lastResult: result,
        lastValidData:
          result?.ok && data && typeof data?.status === "string"
            ? data
            : prev.lastValidData,
      }));

      if (!result?.ok || !data) return;

      const now = Date.now();
      const status = String(data.status || "").toLowerCase();
      const normalizedStatus = status.replace(/\s+/g, "_");
      const confidencePercent =
        data.confidence != null
          ? data.confidence <= 1
            ? data.confidence * 100
            : data.confidence
          : 100;
      const alerts = Array.isArray(data.alerts) ? data.alerts : [];
      const cheatingScore = Number(data.cheating_score || 0);
      const usingFallback = alerts.includes("model_unavailable_fallback");

      // Gate look-away warnings to avoid false positives while user is focused.
      const lookSignal =
        normalizedStatus.includes("looking") ||
        normalizedStatus.includes("wrong_activity") ||
        alerts.includes("looking_side") ||
        alerts.includes("looking_down") ||
        alerts.includes("looking_up");
      const lookAwayCandidate =
        lookSignal &&
        confidencePercent >= (usingFallback ? 88 : 78) &&
        (cheatingScore >= 30 || !usingFallback);
      if (lookAwayCandidate) {
        detectionStreakRef.current.lookAway += 1;
      } else {
        detectionStreakRef.current.lookAway = Math.max(
          0,
          detectionStreakRef.current.lookAway - 1,
        );
      }

      if (
        detectionStreakRef.current.lookAway >= (usingFallback ? 7 : 4) &&
        now - violationCooldownRef.current.look > 9000
      ) {
        violationCooldownRef.current.look = now;
        detectionStreakRef.current.lookAway = 0;
        handleViolation("Please look at the screen. Looking away is flagged.");
      }

      if (
        (data.phoneDetected || alerts.includes("phone_detected")) &&
        now - violationCooldownRef.current.phone > 4000
      ) {
        violationCooldownRef.current.phone = now;
        handleViolation("Phone detected. External devices are not allowed.");
      }

      const noFaceCandidate =
        ((normalizedStatus.includes("no_face") || normalizedStatus.includes("no-face") || status.includes("no face")) ||
          alerts.includes("no_face_detected")) &&
        confidencePercent >= (usingFallback ? 92 : 80);

      if (noFaceCandidate) {
        detectionStreakRef.current.noFace += 1;
      } else {
        detectionStreakRef.current.noFace = Math.max(
          0,
          detectionStreakRef.current.noFace - 1,
        );
      }

      if (
        detectionStreakRef.current.noFace >= (usingFallback ? 10 : 5) &&
        now - violationCooldownRef.current.noFace > 12000
      ) {
        violationCooldownRef.current.noFace = now;
        detectionStreakRef.current.noFace = 0;
        handleViolation("Face not detected. Keep your face visible in camera.");
      }

      if (cheatingScore >= 75 && confidencePercent >= 70) {
        detectionStreakRef.current.highRisk += 1;
      } else {
        detectionStreakRef.current.highRisk = Math.max(
          0,
          detectionStreakRef.current.highRisk - 1,
        );
      }

      if (detectionStreakRef.current.highRisk >= 4 && now - violationCooldownRef.current.look > 10000) {
        violationCooldownRef.current.look = now;
        detectionStreakRef.current.highRisk = 0;
        handleViolation("Repeated suspicious behavior detected. Stay centered and maintain eye contact.");
      }
    },
    [handleViolation],
  );

  useEffect(() => {
    // Initial code handling removed since CompetitiveEditor handles its own state now
  }, [initialCode]);

  // Keyboard shortcut: Ctrl+E or Cmd+E to end interview
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        if (onEndInterview) {
          onEndInterview();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEndInterview]);

  const handleSubmit = async () => {
    try {
      const interviewId = resolvedQuestion.sessionId || interviewData?.sessionId || interviewData?._id;
      const company = interviewData?.company || "generic";
      
      const payload = {
        interviewId,
        company,
        submissions,
        overallScore: submissions.filter(s => s.status === "Passed").length * 10
      };

      const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
      const res = await fetch(`${serverUrl}/service/submit-coding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (res.ok) {
        if (typeof onSubmit === "function") {
          onSubmit(submissions);
        } else if (typeof setIsInterviewComplete === "function") {
          setIsInterviewComplete(true);
        }
      } else {
        alert("Failed to submit coding interview. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting coding interview");
    }
  };

  const latestData = proctorState.lastResult?.data || null;
  const displayData = proctorState.lastValidData || latestData;
  const latestStatus = String(displayData?.status || "NORMAL").toUpperCase();
  const latestConfidence =
    displayData?.confidence == null
      ? "-"
      : (displayData.confidence <= 1
          ? (displayData.confidence * 100).toFixed(1)
          : Number(displayData.confidence).toFixed(1));
  const latestScore =
    displayData?.cheating_score == null ? "-" : Number(displayData.cheating_score).toFixed(1);
  const latestPrediction =
    displayData?.prediction == null ? "-" : String(displayData.prediction);
  const latestAlerts = Array.isArray(displayData?.alerts) ? displayData.alerts : [];

  // Confidence Engine Metrics
  const ceConfidence = displayData?.confidence_score != null ? displayData.confidence_score : "-";
  const ceEyeContact = displayData?.eye_contact != null ? displayData.eye_contact : "-";
  const ceHeadStability = displayData?.head_stability != null ? displayData.head_stability : "-";
  const cePosture = displayData?.posture_score != null ? displayData.posture_score : "-";
  const ceEngagement = displayData?.engagement != null ? displayData.engagement : "-";
  const ceCalmness = displayData?.calmness != null ? displayData.calmness : "-";
  const ceNervousness = displayData?.nervousness != null ? displayData.nervousness : "-";
  const ceBlink = displayData?.blink_score != null ? displayData.blink_score : "-";
  const ceAttention = displayData?.attention != null ? displayData.attention : "-";

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8F5F0] p-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      {/* CAMERA OVERLAY ✅ */}
      {cameraStream && (
        <CameraFeed
          stream={cameraStream}
          warningCount={warningCount}
          maxWarnings={5}
        />
      )}

      {/* COMPACT PROCTORING STATUS BAR */}
      <div className="flex h-[36px] shrink-0 items-center gap-4 rounded border border-[#E5E7EB] bg-white px-4 text-xs font-medium text-slate-700 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${latestStatus.includes("FOCUSED") ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
          <span>Status: <span className="font-bold">{latestStatus}</span></span>
        </div>
        <div className="h-4 w-px bg-slate-200"></div>
        <div>
          Confidence: <span className="font-bold text-indigo-600">{ceConfidence}{ceConfidence !== "-" && "%"}</span>
        </div>
        <div className="h-4 w-px bg-slate-200"></div>
        <div>
          Nervousness: <span className="font-bold text-rose-600">{ceNervousness}{ceNervousness !== "-" && "%"}</span>
        </div>
        <div className="h-4 w-px bg-slate-200"></div>
        <div className="flex-1 truncate">
          Alerts: {latestAlerts.length ? <span className="font-bold text-red-600">{latestAlerts.join(", ")}</span> : <span className="text-slate-400">None</span>}
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded border border-[#E5E7EB] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
        <CompetitiveEditor
          company={interviewData?.company || "generic"}
          onChangeSubmissions={setSubmissions}
        />
      </div>

      <div className="flex gap-3 items-center">
        <button
          onClick={handleSubmit}
          title="Submit your code (Ctrl+S)"
          className="flex-1 md:flex-none rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-6 py-2.5 font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.24)] transition-opacity hover:opacity-95 active:scale-95 disabled:opacity-50"
        >
          ✓ Submit Code
        </button>
        
        {onEndInterview && (
          <>
            <motion.button
              onClick={() => setShowEndConfirm(true)}
              title="End Interview (Ctrl+E)"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 md:flex-none rounded-xl bg-red-500 hover:bg-red-600 px-6 py-2.5 font-semibold text-white shadow-[0_8px_20px_rgba(239,68,68,0.24)] transition-all"
            >
              ⏹ End Interview
            </motion.button>

            {/* End Interview Confirmation Modal */}
            <AnimatePresence>
              {showEndConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  onClick={() => setShowEndConfirm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-2">End Interview?</h2>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to end this interview? Your current progress will be saved, but any unsaved code will be lost.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowEndConfirm(false)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowEndConfirm(false);
                          if (onConfirmEndInterview) onConfirmEndInterview();
                        }}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                      >
                        End Interview
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        
        <div className="ml-auto text-xs text-gray-500 hidden sm:block">
          💡 Tip: Press <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+E</kbd> to end interview
        </div>
      </div>
    </div>
  );
};

export default CodingInterview;
