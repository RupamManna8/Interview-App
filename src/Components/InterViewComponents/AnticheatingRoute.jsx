// AntiCheatingRoute.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import DisqualifiedModal from "../../Pages/Interview/DisqualifiedModal.jsx";
import { useInterviewSecurity } from "./InterviewSecurity.jsx";
import WarningModal from "./WarningModal.jsx";
import CameraWarning from "./CameraWarning.jsx";
import { Loader2 } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import * as faceDetection from "@tensorflow-models/face-detection";
import "@tensorflow/tfjs-backend-webgl";

const DISQUALIFICATION_ENABLED = import.meta.env.VITE_ENABLE_DISQUALIFICATION === "true";

const AntiCheatingRoute = ({
  children,
  setupData,
  onDisqualify,
  onEndInterview,
  containerRef,
  cameraStream,
  cameraWarningCount,
  cameraWarningMessage,
  setCameraWarningMessage,
  showCameraWarning,
  setShowCameraWarning
}) => {
  const [showFullScreenPrompt, setShowFullScreenPrompt] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [pendingWarning, setPendingWarning] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(null);
  const detectorRef = useRef(null);

  const handleSecurityDisqualify = useCallback(
    (reason) => {
      console.log("Disqualification triggered:", reason);
      onDisqualify(reason);
    },
    [onDisqualify],
  );

  const { warningCount, isFullScreen, requestFullScreen, lastViolation } =
    useInterviewSecurity({
      enabled: true,
      fullscreenRequired: setupData?.fullscreen || false,
      maxWarnings: DISQUALIFICATION_ENABLED ? 5 : Number.MAX_SAFE_INTEGER,
      onDisqualify: handleSecurityDisqualify,
      cameraWarningCount,
      cameraWarningMessage,
      setCameraWarningMessage
    });

  useEffect(() => {
    if (!(setupData?.cameraEnabled ?? true)) {
      setModelLoading(false);
      setModelLoaded(true);
      setModelError(null);
      return;
    }

    let cancelled = false;

    const initFaceModel = async () => {
      setModelLoading(true);
      setModelLoaded(false);
      setModelError(null);

      try {
        await tf.setBackend("webgl");
        await tf.ready();

        if (!detectorRef.current) {
          detectorRef.current = await faceDetection.createDetector(
            faceDetection.SupportedModels.MediaPipeFaceDetector,
            {
              runtime: "tfjs",
              modelType: "short",
            },
          );
        }

        if (!cancelled) {
          setModelLoaded(true);
          setModelLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setModelError(error?.message || "Failed to load face tracking model");
          setModelLoading(false);
          setModelLoaded(false);
        }
      }
    };

    initFaceModel();

    return () => {
      cancelled = true;
      if (detectorRef.current) {
        detectorRef.current.dispose();
        detectorRef.current = null;
      }
    };
  }, [setupData?.cameraEnabled]);

  const shouldShowFaceTrackingLoader =
    (setupData?.cameraEnabled ?? true) &&
    (!cameraStream || modelLoading || (!modelLoaded && !modelError));

  // Show warning when violation occurs
  useEffect(() => {
    if (lastViolation) {
      setWarningMessage(lastViolation);
      setShowWarning(true);
      setPendingWarning(lastViolation);
    }
  }, [lastViolation]);

  // Check fullscreen status periodically
  useEffect(() => {
    if (setupData?.fullscreen && !isFullScreen) {
      setShowFullScreenPrompt(true);
    } else {
      setShowFullScreenPrompt(false);
    }
  }, [isFullScreen, setupData?.fullscreen, warningCount]);

  // Handle manual fullscreen request
  // AntiCheatingRoute.jsx

  const handleEnterFullScreen = async () => {
    // Target the containerRef specifically
    if (containerRef && containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
        setShowFullScreenPrompt(false);
      } catch (err) {
        console.error("Fullscreen failed", err);
      }
    } else {
      // Fallback to document level if ref isn't ready
      const success = await requestFullScreen();
      if (success) setShowFullScreenPrompt(false);
    }
  };

  // Handle continue after warning
  const handleContinue = () => {
    setShowWarning(false);
    setPendingWarning(null);
    if (setupData?.fullscreen && !isFullScreen) {
      handleEnterFullScreen();
    }
  };

  // Handle end interview
  const handleEndInterview = () => {
    setShowWarning(false);
    if (typeof onEndInterview === "function") {
      onEndInterview();
    }
  };

  // If disqualified, show modal (disabled in testing unless VITE_ENABLE_DISQUALIFICATION=true)
  if (DISQUALIFICATION_ENABLED && warningCount >= 5) {
    return (
      <DisqualifiedModal
        reason="Too many policy violations detected during the interview"
        onReturn={() => {
          onDisqualify("disqualified");
        }}
      />
    );
  }

  return (
    <div className="anti-cheating-route relative min-h-screen">
      {/* Fullscreen Required Prompt */}
      {showFullScreenPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[999]">
          <div className="bg-white p-8 rounded-xl text-center shadow-xl max-w-md">
            <div className="text-6xl mb-4">🖥️</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Fullscreen Mode Required
            </h2>
            <p className="text-gray-600 mb-4">
              This interview requires fullscreen mode to maintain integrity.
              {warningCount > 0 && (
                <span className="block mt-2 text-yellow-600 font-medium">
                  Warning {warningCount} of 5
                </span>
              )}
            </p>
            <button
              onClick={handleEnterFullScreen}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
            >
              Enter Fullscreen Mode
            </button>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarning && (
        <WarningModal
          message={cameraWarningMessage != "" ? cameraWarningMessage : warningMessage}
          onContinue={handleContinue}
          onEndInterview={handleEndInterview}
          warningCount={warningCount}
          maxWarnings={5}
        />
      )}
      {/* Camera Warning */}
      {showCameraWarning && (
        <CameraWarning
          message={cameraWarningMessage}
          visible={showCameraWarning}
          onClose={() => setShowCameraWarning(false)}
        />
      )}
      

      {/* Warning Counter Badge */}
      {warningCount > 0 && warningCount < 5 && !showWarning && (
        <div className="fixed top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium z-50">
          ⚠️ Warnings: {warningCount}/5
        </div>
      )}

      {/* Fullscreen Active Indicator */}
      {isFullScreen && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium z-50">
          🔒 Fullscreen Active
        </div>
      )}

      {/* Children */}
      {children}

      {shouldShowFaceTrackingLoader && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#F8F5F0]/95 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F46E5]">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Preparing Interview Security</h3>
            <p className="mt-2 text-sm text-slate-600">
              Initializing camera and face-tracking model. This takes a few seconds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AntiCheatingRoute;
