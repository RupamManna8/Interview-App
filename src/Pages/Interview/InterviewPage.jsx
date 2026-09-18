import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { UserContext } from "../../Context/UserContext";
import InterviewSetup from "./InterviewSetup";
import BehavioralInterview from "../../Components/InterViewComponents/BehaviorallCanvas.jsx";
import TechnicalInterview from "../../Components/InterViewComponents/TechnicalCanvas.jsx";
import CodingInterview from "../../Components/InterViewComponents/CodingCanvas.jsx";

import {
  ProctoringManager,
  ProctoringStatusBadge,
  EnvironmentCheckModal,
  IntegritySummaryCard,
} from "../../features/proctoring/index.js";

import { getInterviewSessionPath, ROUTE_PATHS } from "../../Routes/paths";

const REDIRECT_SECONDS = 5;
const DISQUALIFY_THRESHOLD = 5;
const DISQUALIFICATION_ENABLED = import.meta.env.VITE_ENABLE_DISQUALIFICATION === "true";

const InterviewSession = () => {
  const { setIsInterViewStarted, apiRequest } = useContext(UserContext);
  const { interviewId, interviewType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isInterviewRoute = Boolean(interviewId && interviewType);

  const containerRef = useRef(null);
  const proctoringManagerRef = useRef(null);

  const [setupData, setSetupData] = useState(null);
  const [isInterViewCompleted, setIsInterViewCompleted] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [disqualificationReason, setDisqualificationReason] = useState("");
  const [postInterviewState, setPostInterviewState] = useState(null);
  const [redirectSeconds, setRedirectSeconds] = useState(REDIRECT_SECONDS);
  const [isInterviewStatusChecked, setIsInterviewStatusChecked] = useState(false);
  const [isInterviewUnavailable, setIsInterviewUnavailable] = useState(false);
  const [phase, setPhase] = useState("check"); // check | running
  const [showEndWarningModal, setShowEndWarningModal] = useState(false);
  const [isEndingInterview, setIsEndingInterview] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [proctoringSummary, setProctoringSummary] = useState(null);

  // Initialize Proctoring Manager
  useEffect(() => {
    const activeInterviewId = setupData?.sessionId || interviewId;
    if (!activeInterviewId) return;

    if (!proctoringManagerRef.current) {
      proctoringManagerRef.current = new ProctoringManager({
        interviewId: activeInterviewId,
        sessionId: activeInterviewId,
        apiRequest,
      });
    }

    return () => {
      if (proctoringManagerRef.current) {
        proctoringManagerRef.current.dispose();
        proctoringManagerRef.current = null;
      }
    };
  }, [setupData?.sessionId, interviewId, apiRequest]);

  const stopAllSpeechAndMedia = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    if (proctoringManagerRef.current) {
      proctoringManagerRef.current.stop();
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [cameraStream]);

  const goToDashboard = useCallback(() => {
    navigate(ROUTE_PATHS.USER_DASHBOARD, { replace: true });
  }, [navigate]);

  const openPostInterviewScreen = useCallback((type) => {
    if (proctoringManagerRef.current) {
      setProctoringSummary(proctoringManagerRef.current.summary);
    }
    stopAllSpeechAndMedia();
    setIsInterViewStarted(false);
    setShowEndWarningModal(false);
    setPostInterviewState(type);
    setRedirectSeconds(REDIRECT_SECONDS);
  }, [setIsInterViewStarted, stopAllSpeechAndMedia]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSpeechAndMedia();
    };
  }, [stopAllSpeechAndMedia]);

  const handleStart = async (data) => {
    const targetInterviewId = data?.sessionId || data?.interviewData?.interviewId;
    const targetInterviewType = data?.interviewType;

    if (!targetInterviewId || !targetInterviewType) {
      return;
    }

    navigate(getInterviewSessionPath(targetInterviewId, targetInterviewType), {
      replace: true,
      state: { setupData: data },
    });
  };

  useEffect(() => {
    if (!isInterviewRoute || setupData) return;

    const stateSetupData = location.state?.setupData;
    if (stateSetupData) {
      setSetupData(stateSetupData);
      return;
    }

    try {
      const recentForm = JSON.parse(localStorage.getItem("recentInterviewForm") || "null");
      if (recentForm) {
        setSetupData({
          ...recentForm,
          sessionId: interviewId,
          interviewType,
        });
      }
    } catch {
      setSetupData(null);
    }
  }, [isInterviewRoute, setupData, location.state, interviewId, interviewType]);

  useEffect(() => {
    if (!isInterviewRoute || !interviewId) return;

    let cancelled = false;

    const checkInterviewAccess = async () => {
      try {
        await apiRequest(`/service/interview/${interviewId}/status`, {
          method: "GET",
          credentials: "include",
        });

        if (!cancelled) {
          setIsInterviewUnavailable(false);
          setIsInterviewStatusChecked(true);
        }
      } catch {
        if (!cancelled) {
          setIsInterviewUnavailable(true);
          setIsInterviewStatusChecked(true);
        }
      }
    };

    checkInterviewAccess();

    return () => {
      cancelled = true;
    };
  }, [isInterviewRoute, interviewId, apiRequest]);

  const enterRunningPhase = useCallback(async ({ stream, fullscreen }) => {
    if (stream) {
      setCameraStream(stream);
    }

    if (fullscreen && containerRef.current && document.fullscreenEnabled && !document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
      } catch {}
    }

    if (proctoringManagerRef.current) {
      await proctoringManagerRef.current.start({
        stream,
        containerElement: containerRef.current,
      });
    }

    setIsInterViewStarted(true);
    setPhase("running");
  }, [setIsInterViewStarted]);

  const handleDisqualification = (reason) => {
    setDisqualificationReason(reason);
    setIsDisqualified(true);
    openPostInterviewScreen("disqualified");
  };

  const resetSession = () => {
    stopAllSpeechAndMedia();

    setSetupData(null);
    setIsDisqualified(false);
    setDisqualificationReason("");
    setIsInterViewStarted(false);
    setIsInterViewCompleted(false);
    setPostInterviewState(null);
    setCameraStream(null);

    navigate(ROUTE_PATHS.USER_START_INTERVIEW, { replace: true });
  };

  const handleEndInterviewClick = () => {
    setShowEndWarningModal(true);
  };

  const markInterviewNotCompleted = useCallback(async () => {
    const activeId = setupData?.sessionId || interviewId;
    if (!activeId) return;

    await apiRequest("/service/not-complete-interview", {
      method: "POST",
      body: JSON.stringify({ interviewId: activeId }),
      credentials: "include",
    });
  }, [apiRequest, setupData?.sessionId, interviewId]);

  const markInterviewCompleted = useCallback(async () => {
    const activeId = setupData?.sessionId || interviewId;
    if (!activeId) return;

    await apiRequest("/service/complete-interview", {
      method: "POST",
      body: JSON.stringify({ interviewId: activeId }),
      credentials: "include",
    });
  }, [apiRequest, setupData?.sessionId, interviewId]);

  const confirmEndInterviewWithPenalty = async () => {
    try {
      stopAllSpeechAndMedia();
      setIsEndingInterview(true);
      await markInterviewNotCompleted();
    } catch (err) {
      console.error("Failed to mark interview as not completed:", err?.message || err);
    } finally {
      setIsEndingInterview(false);
      openPostInterviewScreen("ended");
    }
  };

  const handleQuickEndInterview = async () => {
    try {
      stopAllSpeechAndMedia();
      setIsEndingInterview(true);
      await markInterviewNotCompleted();
    } catch (err) {
      console.error("Failed to end interview:", err?.message || err);
    } finally {
      setIsEndingInterview(false);
      openPostInterviewScreen("ended");
    }
  };

  useEffect(() => {
    if (!isInterViewCompleted || postInterviewState) return;

    let cancelled = false;

    const completeInterview = async () => {
      try {
        await markInterviewCompleted();
      } catch (err) {
        console.error("Failed to mark interview as completed:", err?.message || err);
      } finally {
        if (!cancelled) {
          openPostInterviewScreen("completed");
        }
      }
    };

    completeInterview();

    return () => {
      cancelled = true;
    };
  }, [isInterViewCompleted, postInterviewState, markInterviewCompleted, openPostInterviewScreen]);

  useEffect(() => {
    if (!postInterviewState) return;

    if (redirectSeconds <= 0) {
      goToDashboard();
      return;
    }

    const timerId = setTimeout(() => {
      setRedirectSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [postInterviewState, redirectSeconds, goToDashboard]);

  const renderInterview = () => {
    const currentInterviewData = {
      ...(setupData || {}),
      sessionId: setupData?.sessionId || interviewId,
      interviewType: setupData?.interviewType || interviewType,
    };

    const commonProps = {
      interviewData: currentInterviewData,
      resetSession,
      setIsInterviewComplete: setIsInterViewCompleted,
      cameraStream,
      proctoringManager: proctoringManagerRef.current,
      onEndInterview: handleEndInterviewClick,
      onConfirmEndInterview: handleQuickEndInterview,
    };

    switch (currentInterviewData.interviewType) {
      case "behavioral":
        return <BehavioralInterview {...commonProps} />;
      case "technical":
        return <TechnicalInterview {...commonProps} />;
      case "coding":
        return <CodingInterview {...commonProps} />;
      default:
        return <div>Unsupported Interview Type</div>;
    }
  };

  if (!isInterviewRoute) return <InterviewSetup onStart={handleStart} />;

  if (isInterviewStatusChecked && isInterviewUnavailable) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">404</h1>
          <p className="mt-2 text-lg font-semibold text-gray-800">Interview Not Found</p>
          <p className="mt-2 text-sm text-gray-600">
            This interview link is no longer available.
          </p>
          <button
            onClick={goToDashboard}
            className="mt-6 w-full rounded-lg bg-[#4F46E5] px-4 py-2 text-white"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!setupData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-sm text-gray-600 mb-4">Preparing interview session...</p>
        <button
          onClick={() => navigate(ROUTE_PATHS.USER_START_INTERVIEW, { replace: true })}
          className="px-4 py-2 rounded bg-[#4F46E5] text-white"
        >
          Back to Start Interview
        </button>
      </div>
    );
  }

  if (postInterviewState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              {postInterviewState === "completed"
                ? "Interview Completed"
                : postInterviewState === "disqualified"
                  ? "Interview Disqualified"
                  : "Interview Ended"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {postInterviewState === "completed" && "Your interview was submitted and evaluated successfully."}
              {postInterviewState === "ended" && "This interview was ended early and marked as not completed."}
              {postInterviewState === "disqualified" && "The session ended because integrity policy rules were triggered."}
            </p>
            {postInterviewState === "disqualified" && (
              <p className="mt-2 text-xs text-rose-600 font-medium">
                {disqualificationReason || "Multiple policy violations detected."}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">Redirecting to dashboard in {redirectSeconds}s</p>
            <button
              onClick={goToDashboard}
              className="mt-5 w-full rounded-xl bg-[#4F46E5] hover:bg-indigo-700 px-4 py-2.5 text-white font-semibold transition-colors"
            >
              Go to Dashboard
            </button>
          </div>

          {proctoringSummary && (
            <IntegritySummaryCard summary={proctoringSummary} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-gray-50 relative">
      {/* Pre-Interview Environment Check Modal */}
      {phase === "check" && (
        <EnvironmentCheckModal
          onComplete={enterRunningPhase}
          onCancel={() => navigate(ROUTE_PATHS.USER_DASHBOARD)}
        />
      )}

      {/* Running Interview Phase */}
      {phase === "running" && (
        <main className="flex-1 flex flex-col">
          {/* Subtle Proctoring Header Bar */}
          <header className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-40">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {setupData?.role || "Interview"} • {setupData?.company || "Assessment"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ProctoringStatusBadge
                manager={proctoringManagerRef.current}
                onRequestFullscreen={() => {
                  if (containerRef.current && document.fullscreenEnabled) {
                    containerRef.current.requestFullscreen().catch(() => {});
                  }
                }}
              />

              <button
                onClick={handleEndInterviewClick}
                className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 transition-colors"
              >
                End Session
              </button>
            </div>
          </header>

          <div className="flex-1 p-4 sm:p-6">
            {renderInterview()}
          </div>
        </main>
      )}

      {/* End Interview Warning Modal */}
      {showEndWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-900">End Interview Early?</h2>
            <p className="mt-3 text-sm text-gray-600">
              If you end the interview now, it will be marked as not completed.
            </p>
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-700">Early Termination Notice</p>
              <p className="text-xs text-red-600 mt-0.5">
                A 5-point penalty will be applied to your profile score for ending prematurely.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEndWarningModal(false)}
                disabled={isEndingInterview}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continue Interview
              </button>
              <button
                onClick={confirmEndInterviewWithPenalty}
                disabled={isEndingInterview}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {isEndingInterview ? "Ending..." : "End with Penalty"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSession;