// StudentDashboard.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { UserContext } from "../../Context/UserContext";

const toLabelDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const getInterviewScore = (interview) => {
  const computedScore = Number(interview?.computed?.overall?.readinessScore);
  if (Number.isFinite(computedScore)) {
    return Math.max(0, Math.min(100, computedScore));
  }

  const evaluationScore = Number(interview?.evaluation?.score);
  if (Number.isFinite(evaluationScore)) {
    return Math.max(0, Math.min(100, evaluationScore));
  }

  return 0;
};

const getInterviewRoleLabel = (interview) => {
  const role = String(interview?.role || "").trim();
  if (role) {
    return role;
  }

  const type = String(interview?.type || "");
  if (!type) {
    return "Unknown";
  }

  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const StudentDashboard = () => {
  const statsRef = React.useRef(null);
  const [statsInView, setStatsInView] = useState(false);
  const { user, apiRequest } = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [liveScore, setLiveScore] = useState(100);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setStatsInView(entry.isIntersecting), {
      threshold: 0.1,
    });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const [currentUser, analyticsResponse, historyResponse] = await Promise.all([
          apiRequest("/auth/current", { method: "GET" }),
          apiRequest("/service/api/analytics", { method: "GET" }),
          apiRequest("/service/interview-history", { method: "GET" }),
        ]);

        setLiveScore(Number(currentUser?.user?.score ?? user?.score ?? 100));
        setAnalytics(analyticsResponse || null);
        setInterviews(Array.isArray(historyResponse?.interviews) ? historyResponse.interviews : []);
      } catch (err) {
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [apiRequest, user?.score]);

  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter((item) => item?.status === "completed").length;
  const notCompletedInterviews = interviews.filter((item) => item?.status === "not completed").length;
  const avgScore = Number(analytics?.summary?.avgScore || 0);
  const readinessScore = Number(analytics?.latest?.overall?.readinessScore || 0);

  const strongestSkill = analytics?.latest?.overall?.strengths?.[0] || "-";
  const weakestSkill = analytics?.latest?.overall?.weaknesses?.[0] || "-";

  const trendData = useMemo(
    () =>
      (analytics?.trend || []).map((item) => ({
        label: toLabelDate(item?.date),
        score: Number(item?.score || 0),
      })),
    [analytics?.trend]
  );

  const improvement = useMemo(() => {
    if (!trendData.length) return 0;
    const first = Number(trendData[0]?.score || 0);
    const last = Number(trendData[trendData.length - 1]?.score || 0);
    return Number((last - first).toFixed(1));
  }, [trendData]);

  const lastFiveInterviews = useMemo(
    () =>
      interviews.slice(0, 5).map((item) => ({
        id: item?._id || `${item?.startedAt || "no-date"}-${item?.type || "unknown"}`,
        role: getInterviewRoleLabel(item),
        score: getInterviewScore(item),
        status: String(item?.status || "-")
          .replace("not completed", "not completed")
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        dateLabel: toLabelDate(item?.startedAt),
      })),
    [interviews]
  );

  const InterviewData = [
    {
      label: "Your Score",
      value: `${Math.max(0, Math.round(liveScore))}`,
      change: notCompletedInterviews > 0 ? `${notCompletedInterviews} early-end penalties` : "No penalties",
      icon: "🏆",
      color: "bg-[#F1ECE6] text-[#0f172a]",
    },
    {
      label: "Total Interviews",
      value: `${totalInterviews}`,
      change: `${completedInterviews} completed`,
      icon: "🎙️",
      color: "bg-[#F1ECE6] text-[#0f172a]",
    },
    {
      label: "Average Readiness",
      value: `${avgScore.toFixed(1)}%`,
      change: `${readinessScore.toFixed(1)}% latest`,
      icon: "📊",
      color: "bg-[#F1ECE6] text-[#0f172a]",
    },
    {
      label: "Weakest Focus Area",
      value: weakestSkill,
      change: strongestSkill !== "-" ? `Strongest: ${strongestSkill}` : "Build consistency",
      icon: "🎯",
      color: "bg-[#F1ECE6] text-[#0f172a]",
    },
  ];

  return (
    <div className="bg-[#F8F5F0] rounded-xl p-4 md:p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-8 mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1F2937] mb-2">
              Welcome back, {user?.name || "User"}👋
            </h1>
            <p className="text-[#6B7280] text-lg">
              You're making great progress. Keep it up!
            </p>
          </div>

          {/* Readiness Score Progress Ring */}
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="4"
              />
              {/* Progress circle */}
              <motion.circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: readinessScore / 100 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  strokeDasharray: "264 264",
                  strokeDashoffset: "0",
                }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-bold text-[#1F2937]">
                {readinessScore.toFixed(0)}%
              </span>
              <span className="text-[10px] text-[#6B7280]">Readiness</span>
            </div>
          </div>
        </div>
      </motion.div>

      {loading && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 mb-8 flex justify-center">
          <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 mb-8">
          <p className="text-sm font-medium text-[#1F2937]">Could not load dashboard stats</p>
          <p className="text-sm text-[#6B7280] mt-1">{error}</p>
        </div>
      )}

      {/* Section 2: Stats Grid */}
      <div
        ref={statsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {InterviewData.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{
              y: -4,
              boxShadow:
                "0 12px 24px -8px rgba(15, 23, 42, 0.12), 0 4px 8px -4px rgba(15, 23, 42, 0.06)",
            }}
            className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity border border-[#E5E7EB]`}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[#0f172a]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Section 3: Performance Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="bg-[#F1ECE6] rounded-xl border border-[#E5E7EB] shadow-sm p-4"
      >
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1F2937]">
                Performance Trend
              </h2>
              <p className="text-sm text-[#6B7280]">
                Your interview scores over time
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0f172a]"></span>
                <span className="text-xs text-[#6B7280]">Your Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E5E7EB]"></span>
                <span className="text-xs text-[#6B7280]">Average</span>
              </div>
            </div>
          </div>

          <div className="h-64">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 12, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <ReferenceLine y={avgScore} stroke="#E5E7EB" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#0f172a"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#0f172a" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#6B7280]">
                No trend data yet. Complete interviews to build performance trend.
              </div>
            )}
          </div>

          {/* Insights */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${improvement >= 0 ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-[#DC2626]/10 text-[#DC2626]"}`}>
                {improvement >= 0 ? `+${improvement}%` : `${improvement}%`}
              </span>
              <span className="text-[#4B5563]">Improvement across recorded interviews</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.7 }}
        className="mt-8 bg-[#F1ECE6] rounded-xl border border-[#E5E7EB] shadow-sm p-4"
      >
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-[#0f172a]">Last 5 Interviews & Score</h2>
              <p className="text-sm text-[#6B7280]">Most recent interview attempts with role and readiness score.</p>
            </div>
          </div>

          {lastFiveInterviews.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-left text-[#6B7280]">
                    <th className="py-3 pr-4 font-medium">Role</th>
                    <th className="py-3 pr-4 font-medium">Date</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 font-medium text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {lastFiveInterviews.map((interview) => (
                    <tr key={interview.id} className="border-b border-[#F1ECE6] last:border-0">
                      <td className="py-3 pr-4 text-[#0f172a] font-medium">{interview.role}</td>
                      <td className="py-3 pr-4 text-[#6B7280]">{interview.dateLabel}</td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-[#F1ECE6] text-[#0f172a] border border-[#E5E7EB]">
                          {interview.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-semibold text-[#0f172a]">{interview.score.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-sm text-[#6B7280]">
              No interviews found yet. Complete interviews to populate this section.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
