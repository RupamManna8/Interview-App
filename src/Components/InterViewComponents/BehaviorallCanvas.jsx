import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CameraFeed } from "../../Pages/Interview/CamaraFeed.jsx";
import { UserContext } from "../../Context/UserContext.jsx";
import { CambClient } from "@camb-ai/sdk";

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const IDLE_MS = 60_000;
const SUBMIT_DELAY = 2800;

const GREETING =
  "Hello and welcome! I am your AI interviewer today. " +
  "This is a behavioral interview. I will ask you questions and you can answer out loud, " +
  "or use the text box below. " +
  "Let us begin — could you please briefly introduce yourself and share a bit about your background?";

/* ─────────────────────────────────────────────────────────
   INJECTED CSS  (keyframes + named classes Tailwind can't express)
───────────────────────────────────────────────────────── */
const STYLES = `
  @keyframes bar-bounce {
    0%, 100% { height: 4px;  }
    50%       { height: 26px; }
  }
  @keyframes ring-pulse {
    0%   { transform: scale(1);   opacity: .8; }
    100% { transform: scale(1.7); opacity: 0;  }
  }
  @keyframes avatar-float {
    0%, 100% { transform: translateY(0);    }
    50%      { transform: translateY(-7px); }
  }
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes shimmer-move {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes mic-pulse {
    0%, 100% { box-shadow: 0 0 0 0    rgba(239,68,68,.55); }
    50%      { box-shadow: 0 0 0 10px rgba(239,68,68,0);   }
  }
  @keyframes tw-spin { to { transform: rotate(360deg); } }
  @keyframes page-enter {
    from { opacity: 0; transform: translateY(22px) scale(.985); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  .bar-wave span {
    display: inline-block;
    width: 4px; height: 4px;
    border-radius: 2px;
    background: #818cf8;
  }
  .bar-wave.active span { animation: bar-bounce .65s ease-in-out infinite alternate; }
  .bar-wave span:nth-child(1) { animation-delay: 0s;   }
  .bar-wave span:nth-child(2) { animation-delay: .09s; }
  .bar-wave span:nth-child(3) { animation-delay: .18s; }
  .bar-wave span:nth-child(4) { animation-delay: .27s; }
  .bar-wave span:nth-child(5) { animation-delay: .36s; }
  .bar-wave span:nth-child(6) { animation-delay: .45s; }
  .bar-wave span:nth-child(7) { animation-delay: .54s; }
  .bar-wave span:nth-child(8) { animation-delay: .63s; }

  .avatar-float    { animation: avatar-float 3.5s ease-in-out infinite; }
  .ring-pulse      { animation: ring-pulse 1.4s ease-out infinite; }
  .mic-pulse-anim  { animation: mic-pulse 1.6s ease infinite; }
  .fade-in-up      { animation: fade-in-up .35s ease both; }
  .page-enter      { animation: page-enter .7s cubic-bezier(.22,1,.36,1) both; }
  .shimmer {
    background: linear-gradient(90deg,#1c1c33 25%,#2a2a4a 50%,#1c1c33 75%);
    background-size: 200% 100%;
    animation: shimmer-move 1.6s ease-in-out infinite;
  }
  .spinner {
    border: 2px solid rgba(250,204,21,.25);
    border-top-color: #facc15;
    border-radius: 50%;
    animation: tw-spin .75s linear infinite;
  }
  .transcript-scroll::-webkit-scrollbar { width: 4px; }
  .transcript-scroll::-webkit-scrollbar-track { background: transparent; }
  .transcript-scroll::-webkit-scrollbar-thumb {
    background: rgba(99,102,241,.35);
    border-radius: 4px;
  }
`;

/* ─────────────────────────────────────────────────────────
   SPEECH SYNTHESIS — robust, cross-browser
───────────────────────────────────────────────────────── */

/** Resolves with the voice list once the browser has loaded them. */
function waitForVoices() {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const v = synth.getVoices();
    if (v.length) { resolve(v); return; }

    const onChanged = () => {
      const voices = synth.getVoices();
      if (voices.length) {
        synth.removeEventListener("voiceschanged", onChanged);
        clearInterval(poll);
        clearTimeout(timeout);
        resolve(voices);
      }
    };
    synth.addEventListener("voiceschanged", onChanged);

    // Safari / Firefox fallback — event may never fire
    const poll = setInterval(() => {
      const voices = synth.getVoices();
      if (voices.length) {
        clearInterval(poll);
        synth.removeEventListener("voiceschanged", onChanged);
        clearTimeout(timeout);
        resolve(voices);
      }
    }, 80);

    // Safety: don't hang forever
    const timeout = setTimeout(() => {
      clearInterval(poll);
      synth.removeEventListener("voiceschanged", onChanged);
      resolve([]);
    }, 2200);
  });
}

/**
 * Uses Camb AI TTS when API key is available, otherwise falls back to the
 * browser's SpeechSynthesis API.
 */
const CAMB_TTS_CONFIG = {
  voice_id: 147320,
  language: 'en-us',
  speech_model: 'mars-flash',
  output_configuration: { format: 'wav' }
};

async function speakText(text, { onStart, onEnd, onError } = {}) {
  console.log("speakText called with text:", text.substring(0, 50) + "...");
  // Prefer Camb AI (remote TTS) when API key is available
  const cambApiKey = import.meta.env.VITE_CAMB_API_KEY;
  console.log("Camb API key present:", !!cambApiKey);
  if (cambApiKey && typeof CambClient !== "undefined") {
    console.log("Trying Camb AI TTS");
    try {
      const client = new CambClient({ apiKey: cambApiKey });
      const response = await client.textToSpeech.tts({
        text,
        ...CAMB_TTS_CONFIG
      });

      // Convert stream to blob with correct MIME type
      let audioBuffer;
      if (response instanceof ReadableStream) {
        const reader = response.getReader();
        const chunks = [];
        let done = false;
        while (!done) {
          const result = await reader.read();
          done = result.done;
          if (result.value) chunks.push(result.value);
        }
        audioBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          audioBuffer.set(chunk, offset);
          offset += chunk.length;
        }
      } else if (response instanceof ArrayBuffer) {
        audioBuffer = new Uint8Array(response);
      } else {
        audioBuffer = await response.arrayBuffer().then(ab => new Uint8Array(ab));
      }

      // Create blob with correct MIME type for WAV (since output_configuration.format is 'wav')
      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      console.log("Audio blob created, size:", blob.size, "type:", blob.type);

      onStart?.();

      const cleanup = () => {
        audio.removeEventListener("ended", cleanup);
        audio.removeEventListener("error", cleanup);
        URL.revokeObjectURL(audioUrl);
        onEnd?.();
      };

      audio.addEventListener("ended", cleanup);
      audio.addEventListener("error", (err) => {
        console.error("Audio play error:", err);
        cleanup();
        onError?.(err);
      });

      await audio.play().catch((err) => {
        console.error("Audio play failed:", err);
        cleanup();
        onError?.(err);
        // fall through to built-in TTS
      });

      return;
    } catch (err) {
      console.warn("Camb AI TTS failed:", err);
      onError?.(err);
      // fall through to built-in TTS
    }
  }

  console.log("Falling back to browser TTS");
  const synth = window.speechSynthesis;
  if (!synth) {
    console.warn("No speech synthesis available");
    // Fallback when speechSynthesis isn't available (prevents hang)
    onStart?.();
    onEnd?.();
    return;
  }

  synth.cancel();
  await new Promise((r) => setTimeout(r, 120)); // let cancel settle

  const voices = await waitForVoices();
  console.log("Voices loaded:", voices.length);

  const pick =
    voices.find((v) => /google.*en.*(us)/i.test(v.name))  ||
    voices.find((v) => /female|zira|samantha/i.test(v.name)) ||
    voices.find((v) => /en.*us/i.test(v.lang))             ||
    voices.find((v) => v.lang.startsWith("en"))            ||
    voices[0];

  console.log("Selected voice:", pick?.name || "none");

  const utter    = new SpeechSynthesisUtterance(text);
  if (pick) utter.voice = pick;
  utter.lang     = "en-US";
  utter.rate     = 0.9;
  utter.pitch    = 1.08;
  utter.volume   = 1;

  let started = false;

  const keepAlive = setInterval(() => {
    if (synth.speaking) synth.resume();
    else clearInterval(keepAlive);
  }, 10_000);

  utter.onstart = () => { console.log("TTS started"); started = true; onStart?.(); };

  utter.onend = () => {
    console.log("TTS ended");
    clearInterval(keepAlive);
    if (!started) onStart?.(); // Chrome sometimes skips onstart
    onEnd?.();
  };

  utter.onerror = (e) => {
    console.error("TTS error:", e.error);
    clearInterval(keepAlive);
    if (["interrupted", "canceled"].includes(e.error)) { onEnd?.(); return; }
    console.warn("TTS error:", e.error);
    onError?.(e.error);
    onEnd?.();
  };

  console.log("Speaking text...");
  synth.speak(utter);
  setTimeout(() => { if (synth.paused) synth.resume(); }, 250);
}




/* ─────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────── */

const WaveBars = ({ active }) => (
  <div className={`bar-wave flex items-end gap-[3px] h-8${active ? " active" : ""}`}>
    {Array.from({ length: 8 }).map((_, i) => <span key={i} />)}
  </div>
);

const PulseRing = ({ show }) =>
  show ? (
    <div className="ring-pulse absolute inset-[-8px] rounded-full border-2 border-indigo-400/70 pointer-events-none" />
  ) : null;

const ShimmerBar = ({ className = "" }) => (
  <div className={`shimmer rounded-md ${className}`} />
);

const Bubble = ({ text, role }) => (
  <div className={`fade-in-up flex ${role === "user" ? "justify-end" : "justify-start"}`}>
    <div
      className={[
        "max-w-[82%] px-4 py-2.5 text-sm leading-relaxed",
        role === "user"
          ? "bg-indigo-600 text-white rounded-[18px_18px_4px_18px]"
          : "bg-[#1a1a36] border border-indigo-900/40 text-slate-200 rounded-[18px_18px_18px_4px]",
      ].join(" ")}
    >
      {text}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
const BehavioralInterview = ({
  interviewData,
  setIsInterviewComplete,
  cameraStream,
  warningCount,
  setCameraWarningCount,
  setCameraWarningMessage,
  setShowCameraWarning,
  onEndInterview,
  onConfirmEndInterview,
}) => {
  const { apiRequest } = useContext(UserContext);

  /* ── state ──────────────────────────────────────────── */
  const [phase,           setPhase]           = useState("loading");    // Changed to "loading" initially
  const [isInitializing,  setIsInitializing]  = useState(true);         // Explicit init state
  const [pageReady,       setPageReady]       = useState(false);
  const [isAiSpeaking,    setIsAiSpeaking]    = useState(false);
  const [aiThinking,      setAiThinking]      = useState(false);
  const [isListening,     setIsListening]     = useState(false);
  const [micEnabled,      setMicEnabled]      = useState(true);
  const [showText,        setShowText]        = useState(false);
  const [showEndConfirm,  setShowEndConfirm]  = useState(false);
  const [textAnswer,      setTextAnswer]      = useState("");
  const [transcript,      setTranscript]      = useState([]);
  const [interimText,     setInterimText]     = useState("");
  const [currentQ,        setCurrentQ]        = useState(null);
  const [statusMsg,       setStatusMsg]       = useState("Initializing your interview…");
  const [error,           setError]           = useState(null);
  const [proctorState,    setProctorState]    = useState({
    loading: false,
    active: false,
    error: "",
    lastResult: null,
    lastValidData: null,
  });

  /* ── refs  ──────────────────────────────────────────────
     Using refs for values that need to be read inside
     callbacks / async functions WITHOUT causing re-renders
     or stale-closure bugs.
  ─────────────────────────────────────────────────────── */
  const recRef          = useRef(null);
  const idleTimerRef    = useRef(null);
  const speechBuf       = useRef("");
  const submitTimerRef  = useRef(null);

  // ONE-TIME flags
  const mountedRef      = useRef(false); // greeting fired?
  const fetchingRef     = useRef(false); // API call in flight?
  const submittingRef   = useRef(false); // <-- NEW: prevent duplicate submits

  // Mirror mutable state into refs so async/callback code never goes stale
  const phaseRef        = useRef(phase);
  const micEnabledRef   = useRef(micEnabled);
  const scrollEndRef    = useRef(null);

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
    global: 0,
  });

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Ref to the latest handleAnswer so speech-recognition can call it
  // without a stale closure
  const handleAnswerRef = useRef(null);

  useEffect(() => { phaseRef.current      = phase;      }, [phase]);
  useEffect(() => { micEnabledRef.current = micEnabled; }, [micEnabled]);

  // auto-scroll transcript
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, interimText]);

  /* ─────────────────────────────────────────────────────
     speak()
     Thin wrapper around speakText() that drives isAiSpeaking.
     Stable reference (no deps that change) → safe to use
     inside other useCallbacks without listing as dep.
  ───────────────────────────────────────────────────── */
  const speak = useCallback((text, onDone) => {
    setIsAiSpeaking(false);
    speakText(text, {
      onStart: () => setIsAiSpeaking(true),
      onEnd:   () => { setIsAiSpeaking(false); onDone?.(); },
      onError: () => { setIsAiSpeaking(false); onDone?.(); },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — speakText is a module-level pure fn

  /* ─────────────────────────────────────────────────────
     stopListening()
  ───────────────────────────────────────────────────── */
  const stopListening = useCallback(() => {
    if (recRef.current) {
      recRef.current._manualStop = true;
      try { recRef.current.stop(); } catch (_) {}
      recRef.current = null;
    }
    speechBuf.current = "";
    setIsListening(false);
    setInterimText("");
  }, []); // no deps — only touches refs

  /* ─────────────────────────────────────────────────────
     startListening()
     Uses native Web Speech API SpeechRecognition
  ───────────────────────────────────────────────────── */
  const startListening = useCallback(async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR)            { setShowText(true); return; }
    if (recRef.current) { return; }               // already running

    const rec          = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = "en-US";
    rec._manualStop    = false;

    const resetIdle = () => {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        stopListening();
        setMicEnabled(false);
        setStatusMsg("Mic paused — no activity for 1 min");
        speak("Your microphone has been paused due to inactivity. You can turn it back on anytime.");
      }, IDLE_MS);
    };

    rec.onresult = (e) => {
      resetIdle();
      let finalChunk  = "";
      let interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalChunk  += t;
        else                       interimChunk += t;
      }
      setInterimText(interimChunk);
      if (finalChunk) {
        speechBuf.current = (speechBuf.current + " " + finalChunk).trim();
        clearTimeout(submitTimerRef.current);
        submitTimerRef.current = setTimeout(() => {
          const ans = speechBuf.current.trim();
          if (ans && !submittingRef.current) {           // <-- guard
            speechBuf.current = "";
            setInterimText("");
            handleAnswerRef.current?.(ans, "voice");
          }
        }, SUBMIT_DELAY);
      }
    };

    rec.onerror = (e) => {
      if (["no-speech", "aborted"].includes(e.error)) return;
      setError(`Mic error: ${e.error} — try refreshing or switch to text mode.`);
    };

    rec.onend = () => {
      if (!rec._manualStop && micEnabledRef.current && recRef.current === rec) {
        try { rec.start(); }
        catch (_) { recRef.current = null; setIsListening(false); }
      }
    };

    recRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
      setStatusMsg("Listening…");
      resetIdle();
    } catch (_) {
      recRef.current = null;
      setShowText(true);
    }
  }, [speak, stopListening]); // speak & stopListening are stable

  /* ─────────────────────────────────────────────────────
     fetchNextQuestion()
     ⚠️  KEY FIX FOR INFINITE CALLS:
     - fetchingRef guards against concurrent invocations.
     - Does NOT appear in any useEffect dependency array.
     - speak / startListening / stopListening are all stable.
  ───────────────────────────────────────────────────── */
  const fetchNextQuestion = useCallback(async (userReply) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setAiThinking(true);
    setError(null);
    setStatusMsg("AI is thinking…");

    try {
      const result = await apiRequest("/service/interview", {
        method: "POST",
        body: JSON.stringify({
          interviewId: interviewData.sessionId,
          userReply,
        }),
        credentials: "include",
      });

      // apiRequest may return parsed JSON already OR a raw Response — handle both
      const data =
        result && typeof result.json === "function"
          ? await result.json()
          : result;

      if (!data) throw new Error("Empty response from server");

      const { isEnd } = data;

      // ── END of interview ──────────────────────────────
      if (isEnd) {
        const farewell =
          "That wraps up our interview — thank you so much for your thoughtful answers. " +
          "We will review everything and be in touch soon. Best of luck!";

        setPhase("ending");
        setTranscript((p) => [...p, { role: "ai", text: farewell }]);
        stopListening();
        setStatusMsg("AI is speaking…");

        // aiThinking must be false BEFORE speak so the UI shows correctly
        setAiThinking(false);

        speak(farewell, () => {
          fetchingRef.current = false;
          submittingRef.current = false;

          setPhase("done");
          setIsInterviewComplete(true);
          setStatusMsg("Interview complete");
        });

        return;
      }

      // ── Next question ─────────────────────────────────
      const ackText = (data.acknowledgement && data.acknowledgement !== "null") ? data.acknowledgement.toString().trim() : "";
      const qVal = data.question?.text ?? data.question;
      const fVal = data.follow_up;
      
      let mainQ = "";
      if (qVal && String(qVal).toLowerCase() !== "null") mainQ = qVal.toString().trim();
      else if (fVal && String(fVal).toLowerCase() !== "null") mainQ = fVal.toString().trim();

      const qText = [ackText, mainQ].filter(Boolean).join(" ");

      if (!qText) throw new Error("No question text in response");

      setCurrentQ(qText);
      setTranscript((p) => [...p, { role: "ai", text: qText }]);
      setStatusMsg("AI is speaking…");

      // aiThinking off BEFORE speak
      setAiThinking(false);

      speak(qText, () => {
        fetchingRef.current = false;
        submittingRef.current = false;            // <-- release lock after speech ends
        setStatusMsg("Your turn — speak or type below");
        if (micEnabledRef.current) startListening();
      });
    } catch (err) {
      console.error("fetchNextQuestion:", err);
      setError("Couldn't load the next question. Please check your connection.");
      setStatusMsg("Waiting for your answer…");
      setAiThinking(false);
      fetchingRef.current = false;
      submittingRef.current = false;              // <-- make sure we release lock
      if (micEnabledRef.current) startListening();
    }
  }, [apiRequest, interviewData, speak, startListening, stopListening, setIsInterviewComplete]);
  // ↑ These deps are all stable (speak/startListening/stopListening never change,
  //   apiRequest & interviewData come from props/context and are stable objects).

  /* ─────────────────────────────────────────────────────
     handleAnswer()
     Called by both voice (via ref) and text-box submit.
  ───────────────────────────────────────────────────── */
  const handleAnswer = useCallback(async (rawAnswer, source = "voice") => {
    const trimmed = rawAnswer.trim();
    if (!trimmed || submittingRef.current || phaseRef.current === "ending" || phaseRef.current === "done") return;

    submittingRef.current = true;                 // <-- lock immediately
    
    if (source === "voice") {
      stopRecordingAndUpload(trimmed);
    }
    
    stopListening();
    setTranscript((prev) => [...prev, { role: "user", text: trimmed }]);
    setTextAnswer("");
    speechBuf.current = "";

    fetchNextQuestion(trimmed);
  }, [stopListening, fetchNextQuestion]);

  // Always keep the ref current so the speech-recognition timeout can call
  // the latest version without capturing a stale closure
  handleAnswerRef.current = handleAnswer;

  /* ─────────────────────────────────────────────────────
     submitText()  — text-box submit button
  ───────────────────────────────────────────────────── */
  const submitText = useCallback(() => {
    const val = textAnswer.trim();
    if (val) handleAnswer(val, "text");
  }, [textAnswer, handleAnswer]);

  /* ─────────────────────────────────────────────────────
     INITIALIZATION — load voices, show loader, speak greeting,
     then start interview
  ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    (async () => {
      try {
        // Step 1: Show page & loader
        setPageReady(true);
        setIsInitializing(true);
        setStatusMsg("Loading your interview…");

        // Step 2: Load TTS engines + wait for voices/basic setup
        await waitForVoices();
        
        // Step 3: Add greeting to transcript (show bubble)
        setTranscript([{ role: "ai", text: GREETING }]);
        setStatusMsg("AI is speaking…");

        // Step 4: Speak the greeting
        await new Promise((resolve) => {
          speak(GREETING, resolve);
        });

        // Step 5: Init is complete, move to interview
        setIsInitializing(false);
        setPhase("interview");
        setStatusMsg("Your turn — speak or type below");
        
        // Step 6: Start listening
        startListening();
      } catch (err) {
        console.error("Initialization error:", err);
        setIsInitializing(false);
        setPhase("interview");
        setStatusMsg("Ready to start...");
      }
    })();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  /* ─────────────────────────────────────────────────────
     Mic toggle
  ───────────────────────────────────────────────────── */
  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListening();
      setMicEnabled(false);
      setStatusMsg("Microphone off");
    } else {
      setMicEnabled(true);
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  /* ─────────────────────────────────────────────────────
     Camera violation & WebSocket Proctoring
  ───────────────────────────────────────────────────── */
  const handleViolation = useCallback((msg) => {
    const now = Date.now();
    if (now - (violationCooldownRef.current.global || 0) < 4000) return;
    violationCooldownRef.current.global = now;
    
    setCameraWarningMessage(msg);
    setShowCameraWarning(true);
    setCameraWarningCount((count) => count + 1);
  }, [setCameraWarningCount, setCameraWarningMessage, setShowCameraWarning]);

  const handleProctorResult = useCallback((result) => {
    const data = result?.data || result || null;
    
    setProctorState((prev) => ({
      ...prev,
      loading: false,
      active: true,
      error: result?.ok ? "" : String(data?.error || ""),
      lastResult: result,
      lastValidData: result?.ok && data && typeof data?.status === "string" ? data : prev.lastValidData,
    }));

    if (!result?.ok || !data) return;

    const now = Date.now();
    const status = String(data.status || "").toLowerCase();
    const normalizedStatus = status.replace(/\s+/g, "_");
    const confidencePercent = data.confidence != null ? (data.confidence <= 1 ? data.confidence * 100 : data.confidence) : 100;
    const alerts = Array.isArray(data.alerts) ? data.alerts : [];

    const lookSignal = normalizedStatus.includes("looking") || normalizedStatus.includes("wrong_activity") || alerts.some(a => a.includes("looking"));
    if (lookSignal && confidencePercent >= 78) {
      detectionStreakRef.current.lookAway += 1;
    } else {
      detectionStreakRef.current.lookAway = Math.max(0, detectionStreakRef.current.lookAway - 1);
    }

    if (detectionStreakRef.current.lookAway >= 4 && now - violationCooldownRef.current.look > 9000) {
      violationCooldownRef.current.look = now;
      detectionStreakRef.current.lookAway = 0;
      handleViolation("Please look at the screen. Looking away is flagged.");
    }

    if ((data.phoneDetected || alerts.includes("phone_detected")) && now - violationCooldownRef.current.phone > 4000) {
      violationCooldownRef.current.phone = now;
      handleViolation("Phone detected. External devices are not allowed.");
    }

    const noFaceCandidate = (normalizedStatus.includes("no_face") || alerts.includes("no_face_detected")) && confidencePercent >= 80;
    if (noFaceCandidate) {
      detectionStreakRef.current.noFace += 1;
    } else {
      detectionStreakRef.current.noFace = Math.max(0, detectionStreakRef.current.noFace - 1);
    }

    if (detectionStreakRef.current.noFace >= 5 && now - violationCooldownRef.current.noFace > 12000) {
      violationCooldownRef.current.noFace = now;
      detectionStreakRef.current.noFace = 0;
      handleViolation("Face not detected. Keep your face visible in camera.");
    }
  }, [handleViolation]);

  /* ─────────────────────────────────────────────────────
     Cleanup on unmount
  ───────────────────────────────────────────────────── */
  useEffect(() => () => {
    window.speechSynthesis.cancel();
    stopListening();
  }, [stopListening]);

  /* ─────────────────────────────────────────────────────
     Derived
  ───────────────────────────────────────────────────── */
  const isDone       = phase === "done";
  const isEnding     = phase === "ending";
  const inputLocked  = isInitializing || isAiSpeaking || aiThinking || isDone || isEnding;
  const canSubmit    = textAnswer.trim().length > 0 && !inputLocked;
  const avatarEmoji  = isInitializing ? "⏳" : aiThinking ? "🤔" : isAiSpeaking ? "🗣️" : "🤖";

  const latestData = proctorState.lastResult?.data || null;
  const displayData = proctorState.lastValidData || latestData;
  const latestStatus = String(displayData?.status || "NORMAL").toUpperCase();
  const ceConfidence = displayData?.confidence_score != null ? displayData.confidence_score : "-";
  const ceNervousness = displayData?.nervousness != null ? displayData.nervousness : "-";
  const latestAlerts = Array.isArray(displayData?.alerts) ? displayData.alerts : [];

  /* ─────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────── */
  return (
    <div className="h-full flex flex-col items-center bg-[#F8F5F0] text-slate-800 font-sans relative">
      <style>{STYLES}</style>

      {/* ── COMPACT PROCTORING STATUS BAR ── */}
      <div className="absolute top-4 left-4 z-50 flex h-[36px] shrink-0 items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white px-4 text-xs font-medium text-slate-700 shadow-sm w-[auto] max-w-2xl">
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${latestStatus.includes("FOCUSED") ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></div>
          <span>Status: <span className="font-bold text-slate-900">{latestStatus}</span></span>
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

      {/* ── Camera PiP ── */}
      {cameraStream && (
        <div className="fixed top-4 right-4 z-50 w-44 h-28 rounded-xl overflow-hidden border border-[#E5E7EB] shadow-md bg-black">
          <CameraFeed
            stream={cameraStream}
            warningCount={warningCount}
            maxWarnings={5}
          />
        </div>
      )}

      {/* ── Loading veil ── */}
      {!pageReady || isInitializing ? (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-[#F8F5F0]">
          <div className="w-16 h-16 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-3xl shadow-sm">
            🤖
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-700 text-sm tracking-wide font-medium">{statusMsg}</p>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#0f172a] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Main content ── */}
      <div className={`w-full max-w-xl px-4 py-8 flex flex-col gap-5 ${pageReady && !isInitializing ? "page-enter" : "opacity-0 pointer-events-none"}`}>

        {/* Header */}
        <div className="text-center">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-1">
            AI Behavioral Interview
          </p>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Interview Session
          </h1>
        </div>

        {/* ── Avatar Card ── */}
        <div
          className={[
            "rounded-xl p-6 flex flex-col items-center gap-4",
            "bg-white",
            "border border-[#E5E7EB] transition-shadow duration-700",
            isAiSpeaking
              ? "shadow-md ring-1 ring-[#0f172a]/10"
              : "shadow-sm",
          ].join(" ")}
        >
          {/* Avatar */}
          <div className="relative flex items-center justify-center">
            <div
              className={[
                "w-24 h-24 rounded-full flex items-center justify-center text-5xl select-none",
                "bg-[#F1ECE6] border border-[#E5E7EB]",
                "shadow-sm",
                isAiSpeaking ? "" : "avatar-float",
              ].join(" ")}
            >
              {avatarEmoji}
            </div>
            <PulseRing show={isAiSpeaking} />
          </div>

          {/* Waveform */}
          <WaveBars active={isAiSpeaking} />

          {/* Status */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {aiThinking ? (
              <>
                <span className="spinner w-3 h-3 shrink-0" />
                <span>AI is thinking…</span>
              </>
            ) : isAiSpeaking ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#0f172a] animate-pulse shrink-0" />
                <span>AI is speaking</span>
              </>
            ) : isDone ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Interview complete</span>
              </>
            ) : (
              <>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isListening ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                <span>{statusMsg}</span>
              </>
            )}
          </div>

          {/* Shimmer while AI fetches */}
          {aiThinking && (
            <div className="w-full flex flex-col gap-2 pt-1">
              <ShimmerBar className="h-3 w-3/4" />
              <ShimmerBar className="h-3 w-1/2" />
            </div>
          )}

          {/* Current question */}
          {!aiThinking && currentQ && !isDone && !isEnding && (
            <p className="fade-in-up text-center text-[15px] leading-relaxed text-slate-700 px-2 font-medium">
              {currentQ}
            </p>
          )}

          {/* Done */}
          {isDone && (
            <div className="fade-in-up text-center space-y-1">
              <p className="text-emerald-600 font-semibold text-sm">✓ Interview Complete</p>
              <p className="text-slate-500 text-xs">Thank you — we'll be in touch soon.</p>
            </div>
          )}
        </div>

        {/* ── Transcript ── */}
        <div className="transcript-scroll rounded-xl border border-[#E5E7EB] bg-white p-3 flex flex-col gap-2.5 max-h-56 overflow-y-auto shadow-sm">
          {transcript.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-3">
              Conversation will appear here
            </p>
          ) : (
            transcript.map((m, i) => <Bubble key={i} text={m.text} role={m.role} />)
          )}
          {interimText && <Bubble text={interimText + " …"} role="user" />}
          <div ref={scrollEndRef} />
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="fade-in-up flex items-start gap-3 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200 shadow-sm">
            <span className="mt-0.5 shrink-0">⚠️</span>
            <span className="flex-1 leading-relaxed">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors text-base leading-none shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Controls ── */}
        {!isDone && !isEnding && (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center gap-3 flex-wrap">

              {/* Mic toggle */}
              <button
                onClick={toggleMic}
                disabled={inputLocked}
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold",
                  "border transition-all duration-200 shadow-sm",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  isListening
                    ? "bg-red-50 border-red-200 text-red-700 mic-pulse-anim"
                    : "bg-white border-[#E5E7EB] text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {isListening ? "🎙️ Mic On" : "🎤 Mic Off"}
              </button>

              {/* Text mode */}
              <button
                onClick={() => setShowText((p) => !p)}
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold",
                  "border transition-all duration-200 shadow-sm",
                  showText
                    ? "bg-[#0f172a] border-[#0f172a] text-white"
                    : "bg-white border-[#E5E7EB] text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                ⌨️ Text Mode
              </button>

              {isListening && !inputLocked && (
                <span className="ml-auto text-xs font-medium text-emerald-600 animate-pulse">
                  ● Listening
                </span>
              )}
            </div>

            {/* End Interview Button */}
            {onEndInterview && (
              <motion.button
                onClick={() => setShowEndConfirm(true)}
                title="End Interview"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 md:flex-none rounded-xl bg-red-500 hover:bg-red-600 px-6 py-2.5 font-semibold text-white shadow-[0_8px_20px_rgba(239,68,68,0.24)] transition-all"
              >
                ⏹ End Interview
              </motion.button>
            )}

            {/* Text box */}
            {showText && (
              <div className="fade-in-up flex flex-col gap-2 w-full">
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey && canSubmit) submitText();
                  }}
                  placeholder="Type your answer here… (Ctrl + Enter to submit)"
                  rows={4}
                  disabled={inputLocked}
                  className={[
                    "w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none",
                    "bg-white border border-[#E5E7EB] text-slate-800 shadow-sm",
                    "placeholder:text-slate-400",
                    "focus:outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]",
                    "disabled:opacity-50 transition-colors duration-150 caret-[#0f172a]",
                  ].join(" ")}
                />
                <button
                  onClick={submitText}
                  disabled={!canSubmit}
                  className={[
                    "self-end px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm",
                    canSubmit
                      ? "bg-[#0f172a] text-white hover:bg-slate-800"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border border-[#E5E7EB]",
                  ].join(" ")}
                >
                  {aiThinking ? "Submitting…" : "Submit Answer →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* End Interview Confirmation Modal */}
        {onEndInterview && (
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
                    Are you sure you want to end this interview? Your responses will be submitted.
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
        )}

        {/* ── Done CTA ── */}
        {isDone && (
          <button
            onClick={() => setIsInterviewComplete(true)}
            className="fade-in-up self-center px-9 py-3 rounded-xl font-bold text-sm text-white bg-[#0f172a] shadow-sm hover:bg-slate-800 transition-shadow"
          >
            View Results →
          </button>
        )}
      </div>
    </div>
  );
};

export default BehavioralInterview;