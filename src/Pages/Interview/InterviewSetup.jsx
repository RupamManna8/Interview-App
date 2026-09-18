import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
  useContext,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../../Context/UserContext";

// ─── API ABSTRACTION LAYER ──────────────────────────────────────────────────
const api = {
  async getRecentInterview() {
    try {
      const saved = localStorage.getItem("recentInterview");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },
  async getRecentInterviewForm() {
    try {
      const saved = localStorage.getItem("recentInterviewForm");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },
  async getSavedDraft() {
    try {
      const saved = localStorage.getItem("interviewSetupDraft");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },
  async saveDraft(data) {
    try {
      localStorage.setItem("interviewSetupDraft", JSON.stringify(data));
    } catch {}
  },
  async parseResume(file) {
    await new Promise((r) => setTimeout(r, 1800));
    return {
      name: file.name.replace(/\.[^.]+$/, ""),
      roles: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "SDE",
      ],
      yearsExperience: Math.floor(Math.random() * 8) + 1,
    };
  },
};

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TECH_ROLES = [
  { id: "frontend", label: "Frontend Developer", icon: "⬡" },
  { id: "backend", label: "Backend Developer", icon: "◈" },
  { id: "fullstack", label: "Full Stack Developer", icon: "◎" },
  { id: "sde", label: "SDE", icon: "⬢" },
];

const ALLOWED_ROLE_LABELS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "SDE",
];

const matchAllowedRole = (rawRole) => {
  if (!rawRole || typeof rawRole !== "string") return null;
  const lower = rawRole.toLowerCase().trim();

  // Full stack matches
  if (
    lower.includes("full stack") ||
    lower.includes("fullstack") ||
    lower.includes("full-stack") ||
    lower.includes("mern") ||
    lower.includes("mean")
  ) {
    return "Full Stack Developer";
  }
  // Frontend matches
  if (
    lower.includes("frontend") ||
    lower.includes("front end") ||
    lower.includes("front-end") ||
    lower.includes("react") ||
    lower.includes("angular") ||
    lower.includes("vue") ||
    lower.includes("ui developer") ||
    lower.includes("web developer")
  ) {
    return "Frontend Developer";
  }
  // Backend matches
  if (
    lower.includes("backend") ||
    lower.includes("back end") ||
    lower.includes("back-end") ||
    lower.includes("node") ||
    lower.includes("django") ||
    lower.includes("spring") ||
    lower.includes("java developer") ||
    lower.includes("python developer")
  ) {
    return "Backend Developer";
  }
  // SDE / Software Engineer matches
  if (
    lower.includes("sde") ||
    lower.includes("software development engineer") ||
    lower.includes("software engineer") ||
    lower.includes("software developer")
  ) {
    return "SDE";
  }
  return null;
};

const TECH_INTERVIEW_TYPES = [
  {
    id: "technical",
    label: "Technical",
    desc: "CS fundamentals & concepts",
    icon: "⬡",
  },
  { id: "coding", label: "Coding", desc: "Live problem solving", icon: "◎" },
  {
    id: "behavioral",
    label: "Behavioral",
    desc: "Soft skills & leadership",
    icon: "◆",
  },
];

const GOALS = [
  { id: "placement", label: "Job Placement", sub: "Land a new role" },
  { id: "practice", label: "Practice", sub: "Sharpen skills" },
  { id: "promotion", label: "Promotion", sub: "Level up internally" },
  { id: "mock", label: "Mock Run", sub: "Simulate real interview" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy", color: "#22c55e" },
  { id: "medium", label: "Medium", color: "#f59e0b" },
  { id: "hard", label: "Hard", color: "#ef4444" },
  { id: "adaptive", label: "Adaptive", color: "#8b5cf6" },
];

const STYLES = [
  {
    id: "friendly",
    label: "Friendly",
    icon: "◎",
    desc: "Supportive & encouraging",
  },
  { id: "strict", label: "Strict", icon: "◆", desc: "No hand-holding" },
  {
    id: "realistic",
    label: "Realistic",
    icon: "◈",
    desc: "Just like the real thing",
  },
];

const EXPERIENCE_LEVELS = [
  { id: "entry", label: "Entry", range: "0–2 yrs" },
  { id: "mid", label: "Mid", range: "3–5 yrs" },
  { id: "senior", label: "Senior", range: "6–9 yrs" },
  { id: "lead", label: "Lead", range: "10+ yrs" },
];

const STEPS = ["Role", "Configure", "Launch"];

const DEFAULT_FORM = {
  background: "tech",
  role: "",
  customRole: "",
  goal: "practice",
  mode: "generic",
  company: "",
  difficulty: "medium",
  interviewerStyle: "realistic",
  experienceLevel: "mid",
  interviewType: "",
  duration: 30,
  resumeRoles: [],
};

// ─── ANIMATION VARIANTS ──────────────────────────────────────────────────────
const slide = {
  initial: { opacity: 0, x: 24 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const item = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────
const Chip = memo(({ selected, onClick, children, accent }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 tracking-wide"
    style={
      selected
        ? {
            background: accent || "#0f172a",
            color: "#fff",
            borderColor: accent || "#0f172a",
          }
        : {
            background: "transparent",
            color: "#64748b",
            borderColor: "#e2e8f0",
          }
    }
  >
    {children}
  </motion.button>
));

const OptionCard = memo(({ selected, onClick, icon, title, sub, accent }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="relative p-4 rounded-2xl border text-left transition-all duration-200 w-full"
    style={
      selected
        ? {
            borderColor: accent || "#0f172a",
            background: "#f8faff",
            boxShadow: `0 0 0 2px ${accent || "#0f172a"}15`,
          }
        : { borderColor: "#e2e8f0", background: "#fff" }
    }
  >
    {selected && (
      <motion.div
        layoutId="selected-dot"
        className="absolute top-3 right-3 w-2 h-2 rounded-full"
        style={{ background: accent || "#0f172a" }}
      />
    )}
    <div
      className="text-lg mb-1 opacity-60"
      style={{ fontFamily: "monospace" }}
    >
      {icon}
    </div>
    <div className="font-semibold text-sm text-slate-800">{title}</div>
    {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
  </motion.button>
));

const SectionLabel = ({ children }) => (
  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">
    {children}
  </div>
);

const ErrorMsg = ({ msg }) =>
  msg ? (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs text-rose-500 mt-1.5 flex items-center gap-1"
    >
      <span>◆</span> {msg}
    </motion.p>
  ) : null;

// ─── RECENT INTERVIEW BANNER ─────────────────────────────────────────────────
const RecentInterviewBanner = ({ interview, onContinue, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-5 relative overflow-hidden"
  >
    <div className="absolute right-0 top-0 bottom-0 w-32 opacity-5 flex items-center justify-center text-6xl font-black text-slate-900 select-none">
      ⟳
    </div>
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          Resume Where You Left Off
        </div>
        <div className="font-bold text-slate-800 text-base">
          {interview.role}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500">{interview.company}</span>
          <span className="text-slate-300">·</span>
          <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 font-medium">
            {interview.type}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-slate-400">{interview.date}</span>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-300 hover:text-slate-500 transition-colors text-lg leading-none mt-0.5"
      >
        ×
      </button>
    </div>
    <div className="flex gap-2 mt-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="flex-1 py-2 rounded-xl text-xs font-bold text-white tracking-wide"
        style={{ background: "#0f172a" }}
      >
        Continue Interview →
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onDismiss}
        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
      >
        Start New
      </motion.button>
    </div>
  </motion.div>
);

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
const ProgressBar = ({ step, total, labels }) => {
  const pct = Math.round(((step - 1) / (total - 1)) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        {labels.map((l, i) => (
          <div key={l} className="flex flex-col items-center gap-1">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
              style={
                i + 1 < step
                  ? { background: "#0f172a", color: "#fff" }
                  : i + 1 === step
                    ? {
                        background: "#fff",
                        color: "#0f172a",
                        border: "2px solid #0f172a",
                      }
                    : {
                        background: "#f1f5f9",
                        color: "#94a3b8",
                        border: "1px solid #e2e8f0",
                      }
              }
            >
              {i + 1 < step ? "✓" : i + 1}
            </div>
            <span
              className="text-[9px] uppercase tracking-wider font-semibold hidden sm:block"
              style={{ color: i + 1 <= step ? "#0f172a" : "#94a3b8" }}
            >
              {l}
            </span>
          </div>
        ))}
      </div>
      <div className="h-0.5 bg-slate-100 rounded-full overflow-hidden mt-1">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "#0f172a" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      <div className="text-right mt-1">
        <span className="text-[10px] text-slate-400 font-semibold">
          {pct}% complete
        </span>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const InterviewSetup = ({ onStart }) => {
  const { serverUrl, apiRequest, uploadedResumes, setUploadedResumes } = useContext(UserContext);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [recentInterview, setRecentInterview] = useState(null);
  const [showRecent, setShowRecent] = useState(false);
  const [roleSelectionMode, setRoleSelectionMode] = useState("manual");
  const [selectedResumeIndex, setSelectedResumeIndex] = useState(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);

  const draftTimerRef = useRef(null);
  const roles = TECH_ROLES;
  const interviewTypes = TECH_INTERVIEW_TYPES;

  // ── Real initiateInterview (from original) ─────────────────────────────────
  const initiateInterview = useCallback(
    async (payload) => {
      const requestBody = {
        role: payload.role,
        company: payload.company,
        type: payload.type,
        experienceLevel: payload.experienceLevel,
      };

      const response = await fetch(`${serverUrl}/service/initiate-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initiate interview");
      }

      return response.json();
    },
    [serverUrl],
  );

  const set = useCallback((key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  }, []);

  const getResumePossibleRoles = useCallback((resume) => {
    const possibleRoles =
      resume?.PossibleRoles ||
      resume?.resumeData?.PossibleRoles ||
      resume?.data?.PossibleRoles ||
      [];
    return Array.isArray(possibleRoles) ? possibleRoles : [];
  }, []);

  const getResumeDisplayName = useCallback((resume, idx) => {
    return (
      resume?.Name ||
      resume?.name ||
      resume?.resumeData?.Name ||
      resume?.data?.Name ||
      `Resume ${idx + 1}`
    );
  }, []);

  const selectedResume =
    selectedResumeIndex !== null && uploadedResumes?.[selectedResumeIndex]
      ? uploadedResumes[selectedResumeIndex]
      : null;

  const rawResumeRoles = selectedResume
    ? getResumePossibleRoles(selectedResume)
    : [];

  const selectedResumeRoles = Array.from(
    new Set(
      rawResumeRoles
        .map(matchAllowedRole)
        .filter(Boolean)
    )
  );

  const fetchUploadedResumes = useCallback(async () => {
    try {
      const response = await apiRequest('/service/resume', {
        method: 'GET',
      });

      if (response?.success) {
        const sorted = [...(response.resumes || [])].sort((a, b) => {
          const aDate = new Date(a?.createdAt || 0).getTime();
          const bDate = new Date(b?.createdAt || 0).getTime();
          return bDate - aDate;
        });
        setUploadedResumes(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch uploaded resumes:', error);
    }
  }, [apiRequest, setUploadedResumes]);

  // Load recent interview & draft on mount
  useEffect(() => {
    (async () => {
      const [recent, draft] = await Promise.all([
        api.getRecentInterview(),
        api.getSavedDraft(),
      ]);
      if (recent) {
        setRecentInterview(recent);
        setShowRecent(true);
      }
      if (draft) setFormData((prev) => ({ ...prev, ...draft }));
    })();
  }, []);

  useEffect(() => {
    if (!uploadedResumes || uploadedResumes.length === 0) {
      fetchUploadedResumes();
    }
  }, [uploadedResumes, fetchUploadedResumes]);

  useEffect(() => {
    if (
      roleSelectionMode === "resume" &&
      selectedResumeIndex === null &&
      uploadedResumes &&
      uploadedResumes.length > 0
    ) {
      setSelectedResumeIndex(0);
    }
  }, [roleSelectionMode, selectedResumeIndex, uploadedResumes]);

  // Auto-save draft (debounced 600ms)
  useEffect(() => {
    clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => api.saveDraft(formData), 600);
    return () => clearTimeout(draftTimerRef.current);
  }, [formData]);

  // Handle pending step after form data is updated
  useEffect(() => {
    if (pendingStep !== null && (formData.role || formData.customRole)) {
      setStep(pendingStep);
      setPendingStep(null);
    }
  }, [formData, pendingStep]);

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!formData.role && !formData.customRole) {
        if (
          roleSelectionMode === "resume" &&
          selectedResume &&
          selectedResumeRoles.length === 0
        ) {
          e.role = "Unable to take interview for this resume and role";
        } else {
          e.role = "Pick a role to continue";
        }
      }
      if (!formData.interviewType) e.interviewType = "Select an interview type";
      if (formData.interviewType === "technical" && selectedResumeIndex === null) {
        e.interviewType = "A resume is required for technical interviews. Please select one.";
      }
    }
    if (step === 2) {
      if (formData.mode === "company-specific" && !formData.company.trim())
        e.company = "Enter company name";
    }
    if (step === 3) {
      if (!formData.role && !formData.customRole) e.role = "Role is required";
      if (!formData.interviewType)
        e.interviewType = "Interview type is required";
      if (formData.interviewType === "technical" && selectedResumeIndex === null) {
        e.interviewType = "A resume is required for technical interviews. Please select one.";
      }
      if (!formData.difficulty) e.difficulty = "Difficulty is required";
      if (!formData.experienceLevel)
        e.experienceLevel = "Experience level is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }

    // Step 3 → Launch
    setIsLaunching(true);
    try {
      const selectedRole = roles.find((r) => r.id === formData.role);
      const selectedType = interviewTypes.find(
        (t) => t.id === formData.interviewType,
      );

      const payload = {
        role: selectedRole?.label || formData.customRole,
        company:
          formData.mode === "company-specific" ? formData.company : "Generic",
        type: selectedType?.id || formData.interviewType,
        experienceLevel: formData.experienceLevel,
        resumeId: selectedResume?._id || undefined,
      };

      const data = await initiateInterview(payload);

      // Persist for "Recent Interview" banner next visit
      localStorage.setItem(
        "recentInterview",
        JSON.stringify({
          interviewId: data.interviewId,
          role: payload.role,
          company: payload.company,
          type: selectedType?.label || payload.type,
          date: new Date().toLocaleDateString(),
        }),
      );
      // Store complete form data for resuming from step 3
      localStorage.setItem("recentInterviewForm", JSON.stringify(formData));
      localStorage.removeItem("interviewSetupDraft");

      onStart?.({
        ...formData,
        sessionId: data.interviewId,
        interviewData: data,
      });

      // Request fullscreen
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.log("Fullscreen request failed:", err);
      }
    } catch (error) {
      console.error("Failed to initiate interview:", error);
      setErrors((prev) => ({
        ...prev,
        api: error.message || "Failed to start interview. Please try again.",
      }));
    } finally {
      setIsLaunching(false);
    }
  };

  const accent = "#2563eb";

  return (
    <motion.div
      className="min-h-screen flex items-start justify-center p-4 "
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input[type=range] { -webkit-appearance: none; height: 2px; background: #e2e8f0; border-radius: 2px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #0f172a; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[850px]"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1">
              Interview Prep Suite
            </div>
            <h1
              className="text-2xl font-bold text-slate-900"
              style={{ letterSpacing: "-0.03em" }}
            >
              Setup Interview
            </h1>
          </div>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
            style={{
              background: "#0f172a",
              color: "#fff",
              fontFamily: "DM Mono, monospace",
            }}
          >
            ◈
          </div>
        </div>

        {/* Recent Interview */}
        <AnimatePresence>
          {showRecent && recentInterview && (
            <RecentInterviewBanner
              interview={recentInterview}
              onContinue={async () => {
                const savedForm = await api.getRecentInterviewForm();
                if (savedForm) {
                  // Merge with defaults to ensure all fields are present
                  setFormData((prev) => ({ ...DEFAULT_FORM, ...savedForm }));
                  // Set pending step to be applied after form data updates
                  setPendingStep(3);
                } else {
                  setStep(3);
                }
              }}
              onDismiss={() => setShowRecent(false)}
            />
          )}
        </AnimatePresence>

        {/* Card */}
        <div
          className="bg-white rounded-3xl border border-slate-200 overflow-hidden"
          style={{
            boxShadow:
              "0 4px 40px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)",
          }}
        >
          <div className="p-8">
            <ProgressBar step={step} total={3} labels={STEPS} />

            <AnimatePresence mode="wait">
              {/* ── STEP 1: ROLE & INTERVIEW TYPE ───────────────────────── */}
              {step === 1 && (
                <motion.div
                  key="s1"
                  variants={slide}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <motion.div
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                  >
                    {/* Role mode header */}
                    <motion.div variants={item}>
                      <SectionLabel>Your role</SectionLabel>
                      <h2
                        className="text-xl font-bold text-slate-900 mb-4"
                        style={{ letterSpacing: "-0.02em" }}
                      >
                        What position are you applying for?
                      </h2>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <button
                          type="button"
                          onClick={() => {
                            setRoleSelectionMode("resume");
                            if (uploadedResumes && uploadedResumes.length > 0) {
                              setSelectedResumeIndex(0);
                            }
                            set("role", "");
                            set("customRole", "");
                          }}
                          className="p-3 rounded-xl border text-left transition-all duration-200"
                          style={
                            roleSelectionMode === "resume"
                              ? {
                                  borderColor: accent,
                                  background: `${accent}0a`,
                                  boxShadow: `0 0 0 2px ${accent}20`,
                                }
                              : {
                                  borderColor: "#e2e8f0",
                                  background: "#fafafa",
                                }
                          }
                        >
                          <div className="text-xs font-semibold text-slate-800">Resume based role selection</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Select an uploaded resume and choose suggested roles</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRoleSelectionMode("manual");
                            setSelectedResumeIndex(null);
                            set("role", "");
                            set("customRole", "");
                          }}
                          className="p-3 rounded-xl border text-left transition-all duration-200"
                          style={
                            roleSelectionMode === "manual"
                              ? {
                                  borderColor: accent,
                                  background: `${accent}0a`,
                                  boxShadow: `0 0 0 2px ${accent}20`,
                                }
                              : {
                                  borderColor: "#e2e8f0",
                                  background: "#fafafa",
                                }
                          }
                        >
                          <div className="text-xs font-semibold text-slate-800">Manual role selection</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Choose from available tech roles</div>
                        </button>
                      </div>
                    </motion.div>

                    {roleSelectionMode === "manual" ? (
                      /* Manual role grid */
                      <motion.div variants={item} className="mb-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                          {roles.map((r) => (
                            <motion.button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                set("role", r.id);
                                set("customRole", r.label);
                              }}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.96 }}
                              className="p-3 rounded-xl border text-center transition-all duration-200"
                              style={
                                formData.role === r.id
                                  ? {
                                      borderColor: accent,
                                      background: `${accent}0a`,
                                      boxShadow: `0 0 0 2px ${accent}20`,
                                    }
                                  : {
                                      borderColor: "#e2e8f0",
                                      background: "#fafafa",
                                    }
                              }
                            >
                              <div
                                className="text-base mb-1 opacity-40"
                                style={{ fontFamily: "monospace", color: accent }}
                              >
                                {r.icon}
                              </div>
                              <div className="text-[11px] font-semibold text-slate-700 leading-tight">
                                {r.label}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      /* Resume role selection */
                      <motion.div variants={item} className="mb-5 space-y-3">
                        <div className="border border-slate-200 rounded-2xl p-4" style={{ background: "#fafafa" }}>
                          <div className="text-xs font-semibold text-slate-600 mb-2">Uploaded resumes</div>
                          {uploadedResumes?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                              {uploadedResumes.map((resume, idx) => (
                                <button
                                  key={resume?._id || idx}
                                  type="button"
                                  onClick={() => {
                                    setSelectedResumeIndex(idx);
                                    set("role", "");
                                    set("customRole", "");
                                  }}
                                  className="p-2 rounded-lg border text-left transition-all duration-200"
                                  style={
                                    selectedResumeIndex === idx
                                      ? {
                                          borderColor: accent,
                                          background: `${accent}0a`,
                                        }
                                      : {
                                          borderColor: "#e2e8f0",
                                          background: "#fff",
                                        }
                                  }
                                >
                                  <div className="text-xs font-semibold text-slate-800 truncate">
                                    {getResumeDisplayName(resume, idx)}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                    {resume?.createdAt
                                      ? new Date(resume.createdAt).toLocaleDateString()
                                      : "Uploaded Resume"}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">No uploaded resumes available.</p>
                          )}
                        </div>

                        {selectedResume && (
                          <div className="border border-slate-200 rounded-2xl p-4" style={{ background: "#fafafa" }}>
                            <div className="text-xs font-semibold text-slate-600 mb-2">Suggested eligible roles</div>
                            {selectedResumeRoles.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {selectedResumeRoles.map((r, idx) => {
                                  const matchingTechRole = TECH_ROLES.find(
                                    (roleItem) => roleItem.label.toLowerCase() === r.toLowerCase()
                                  );
                                  return (
                                    <Chip
                                      key={`${r}-${idx}`}
                                      selected={formData.customRole === r || formData.role === matchingTechRole?.id}
                                      onClick={() => {
                                        set("customRole", r);
                                        set("role", matchingTechRole ? matchingTechRole.id : "");
                                      }}
                                      accent={accent}
                                    >
                                      {r}
                                    </Chip>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 font-medium">
                                Unable to take interview for this resume and role
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}

                    <ErrorMsg msg={errors.role} />

                    {/* Interview type */}
                    <motion.div variants={item} className="mt-4">
                      <SectionLabel>Interview type</SectionLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {interviewTypes.map((t) => (
                          <OptionCard
                            key={t.id}
                            selected={formData.interviewType === t.id}
                            onClick={() => set("interviewType", t.id)}
                            icon={t.icon}
                            title={t.label}
                            sub={t.desc}
                            accent={accent}
                          />
                        ))}
                      </div>
                      <ErrorMsg msg={errors.interviewType} />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* ── STEP 2: CONFIGURE ─────────────────────────────────── */}
              {step === 2 && (
                <motion.div
                  key="s2"
                  variants={slide}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <motion.div
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                    className="space-y-6"
                  >
                    {/* Company mode */}
                    <motion.div variants={item}>
                      <SectionLabel>Company targeting</SectionLabel>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {[
                          {
                            id: "generic",
                            label: "Generic",
                            sub: "Industry standard questions",
                          },
                          {
                            id: "company-specific",
                            label: "Company-Specific",
                            sub: "Tailored to a company",
                          },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => set("mode", m.id)}
                            className="p-3 rounded-xl border text-left transition-all duration-200"
                            style={
                              formData.mode === m.id
                                ? {
                                    borderColor: "#0f172a",
                                    background: "#f8faff",
                                    boxShadow: "0 0 0 2px #0f172a15",
                                  }
                                : {
                                    borderColor: "#e2e8f0",
                                    background: "#fafafa",
                                  }
                            }
                          >
                            <div className="font-semibold text-sm text-slate-800">
                              {m.label}
                            </div>
                            <div className="text-xs text-slate-400">
                              {m.sub}
                            </div>
                          </button>
                        ))}
                      </div>
                      <AnimatePresence>
                        {formData.mode === "company-specific" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <select
                              value={formData.company}
                              onChange={(e) => set("company", e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                              style={{
                                borderColor: errors.company
                                  ? "#f43f5e"
                                  : formData.company
                                    ? "#0f172a"
                                    : "#e2e8f0",
                                background: "#fafafa",
                              }}
                            >
                              <option value="" disabled>Select a company</option>
                              <option value="cognizant">Cognizant</option>
                              <option value="infosys">Infosys</option>
                              <option value="oracle">Oracle</option>
                              <option value="tcs">TCS</option>
                              <option value="wipro">Wipro</option>
                            </select>
                            <ErrorMsg msg={errors.company} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Difficulty */}
                    <motion.div variants={item}>
                      <SectionLabel>Difficulty level</SectionLabel>
                      <div className="flex gap-2">
                        {DIFFICULTIES.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => set("difficulty", d.id)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all duration-200"
                            style={
                              formData.difficulty === d.id
                                ? {
                                    borderColor: d.color,
                                    background: `${d.color}15`,
                                    color: d.color,
                                  }
                                : {
                                    borderColor: "#e2e8f0",
                                    background: "#fafafa",
                                    color: "#94a3b8",
                                  }
                            }
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Experience */}
                    <motion.div variants={item}>
                      <SectionLabel>Experience level</SectionLabel>
                      <div className="flex gap-2">
                        {EXPERIENCE_LEVELS.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => set("experienceLevel", l.id)}
                            className="flex-1 py-2.5 rounded-xl text-center border transition-all duration-200"
                            style={
                              formData.experienceLevel === l.id
                                ? {
                                    borderColor: "#0f172a",
                                    background: "#f8faff",
                                    boxShadow: "0 0 0 2px #0f172a15",
                                  }
                                : {
                                    borderColor: "#e2e8f0",
                                    background: "#fafafa",
                                  }
                            }
                          >
                            <div className="text-xs font-bold text-slate-800">
                              {l.label}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {l.range}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Duration */}
                    <motion.div variants={item}>
                      <div className="flex justify-between items-center mb-2">
                        <SectionLabel>Duration</SectionLabel>
                        <span
                          className="text-xs font-bold text-slate-700"
                          style={{ fontFamily: "DM Mono, monospace" }}
                        >
                          {formData.duration} min
                        </span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="60"
                        step="15"
                        value={formData.duration}
                        onChange={(e) => set("duration", +e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        {[15, 30, 45, 60].map((v) => (
                          <span key={v}>{v}m</span>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* ── STEP 3: LAUNCH ────────────────────────────────────── */}
              {step === 3 && (
                <motion.div
                  key="s3"
                  variants={slide}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <motion.div
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                    className="space-y-4"
                  >
                    <motion.div variants={item}>
                      <SectionLabel>Ready to begin</SectionLabel>
                      <h2
                        className="text-xl font-bold text-slate-900 mb-1"
                        style={{ letterSpacing: "-0.02em" }}
                      >
                        Review & Launch
                      </h2>
                      <p className="text-sm text-slate-400 mb-5">
                        Double-check your setup before we begin.
                      </p>
                    </motion.div>

                    {/* Summary card */}
                    <motion.div
                      variants={item}
                      className="rounded-2xl border border-slate-200 overflow-hidden"
                    >
                      {[
                        [
                          "Role",
                          roles.find((r) => r.id === formData.role)?.label ||
                            formData.customRole ||
                            "—",
                        ],
                        [
                          "Type",
                          interviewTypes.find(
                            (t) => t.id === formData.interviewType,
                          )?.label || "—",
                        ],
                        [
                          "Company",
                          formData.mode === "company-specific"
                            ? formData.company
                            : "Generic",
                        ],
                        ["Difficulty", formData.difficulty],
                        [
                          "Experience",
                          EXPERIENCE_LEVELS.find(
                            (l) => l.id === formData.experienceLevel,
                          )?.label || "—",
                        ],
                        ["Duration", `${formData.duration} minutes`],
                      ].map(([k, v], i) => (
                        <div
                          key={k}
                          className="flex justify-between items-center px-4 py-3 text-sm"
                          style={{
                            borderBottom: i < 5 ? "1px solid #f1f5f9" : "none",
                            background: i % 2 === 0 ? "#fafafa" : "#fff",
                          }}
                        >
                          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                            {k}
                          </span>
                          <span
                            className="font-semibold text-slate-800"
                            style={{
                              fontFamily: "DM Mono, monospace",
                              fontSize: "12px",
                            }}
                          >
                            {v}
                          </span>
                        </div>
                      ))}
                    </motion.div>

                    {/* Tips */}
                    <motion.div
                      variants={item}
                      className="rounded-xl p-4 text-xs text-slate-500 space-y-1.5"
                      style={{
                        background: "#f8faff",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {[
                        "Camera and microphone permissions will be verified during environment check.",
                        "Find a quiet, well-lit space for the interview session.",
                        "Stay in fullscreen — tab-switching is flagged by proctoring.",
                        "Answer thoroughly; the AI tracks depth, problem solving, and clarity.",
                      ].map((t) => (
                        <div key={t} className="flex items-start gap-2">
                          <span className="text-slate-300 mt-0.5">◆</span>
                          {t}
                        </div>
                      ))}
                    </motion.div>

                    {errors.api && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-4 py-3 rounded-xl text-xs text-rose-600 font-medium"
                        style={{
                          background: "#fff1f2",
                          border: "1px solid #fecdd3",
                        }}
                      >
                        ◆ {errors.api}
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div
            className="px-8 py-5 border-t border-slate-100 flex items-center justify-between"
            style={{ background: "#fafafa" }}
          >
            {step > 1 ? (
              <motion.button
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep((s) => s - 1)}
                disabled={isLaunching}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 disabled:opacity-40"
              >
                ← Back
              </motion.button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {step < 3 && (
                <button
                  onClick={() => api.saveDraft(formData)}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
                >
                  Save draft
                </button>
              )}
              <motion.button
                whileHover={{ scale: isLaunching ? 1 : 1.02 }}
                whileTap={{ scale: isLaunching ? 1 : 0.98 }}
                onClick={handleNext}
                disabled={isLaunching}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all"
                style={{
                  background: isLaunching ? "#64748b" : "#0f172a",
                  boxShadow: isLaunching
                    ? "none"
                    : "0 2px 12px rgba(15,23,42,0.2)",
                }}
              >
                {isLaunching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Launching…
                  </>
                ) : step === 3 ? (
                  <>Launch Interview →</>
                ) : (
                  <>Continue →</>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-4 tracking-wide">
          ◆ Draft auto-saved · All data stays on your device
        </p>
      </motion.div>
    </motion.div>
  );
};

export default InterviewSetup;
