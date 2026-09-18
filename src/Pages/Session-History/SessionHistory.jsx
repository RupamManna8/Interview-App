import React, { useContext, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Briefcase, Building2, MessageSquareText, Star, AlertCircle } from "lucide-react";
import { UserContext } from "../../Context/UserContext";

const statusStyles = {
  completed: "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]",
  ongoing: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]",
  default: "bg-[#F1ECE6] text-[#6B7280] border-[#E5E7EB]",
};

const SessionHistory = () => {
  const { apiRequest, user } = useContext(UserContext);

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sortedInterviews = useMemo(() => {
    return [...interviews].sort((a, b) => {
      const aTime = new Date(a?.startedAt || 0).getTime();
      const bTime = new Date(b?.startedAt || 0).getTime();
      return bTime - aTime;
    });
  }, [interviews]);

  const fetchInterviewHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest(`/service/interview-history`, {
        method: "GET",
      });

      setInterviews(Array.isArray(response?.interviews) ? response.interviews : []);
    } catch (err) {
      setError(err?.message || "Failed to load interview history");
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviewHistory();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#1F2937]">Session History</h1>
          <p className="text-sm text-[#6B7280] mt-2">Review your recent interviews, status, score, and feedback highlights.</p>
        </div>

        {loading && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-8 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#6B7280] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#1F2937]">Could not fetch interview history</p>
              <p className="text-sm text-[#6B7280] mt-1">{error}</p>
              <button
                onClick={fetchInterviewHistory}
                className="mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && sortedInterviews.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-10 text-center">
            <p className="text-base font-medium text-[#1F2937]">No interviews yet</p>
            <p className="text-sm text-[#6B7280] mt-2">Your completed and ongoing sessions will appear here.</p>
          </div>
        )}

        {!loading && !error && sortedInterviews.length > 0 && (
          <div className="space-y-4">
            {sortedInterviews.map((interview, index) => {
              const startedDate = interview?.startedAt
                ? new Date(interview.startedAt).toLocaleString()
                : "Not available";

              const score =
                typeof interview?.evaluation?.score === "number"
                  ? interview.evaluation.score
                  : null;

              const statusClass =
                statusStyles[interview?.status?.toLowerCase()] || statusStyles.default;

              return (
                <motion.div
                  key={interview?._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.03 }}
                  className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 md:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-semibold text-[#1F2937]">
                          {interview?._id || "Unknown Interview"}
                        </h2>
                        <h2 className="text-lg font-semibold text-[#1F2937]">
                          {interview?.role || "Unknown Role"}
                        </h2>
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${statusClass}`}>
                          {interview?.status || "unknown"}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#6B7280]">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{interview?.company || "Unknown Company"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>{interview?.type || "Unknown Type"}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>{startedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F1ECE6] rounded-xl px-4 py-3 min-w-[130px] text-center border border-[#E5E7EB]">
                      <div className="flex items-center justify-center gap-1 text-[#4F46E5]">
                        <Star className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Score</span>
                      </div>
                      <p className="text-xl font-semibold text-[#1F2937] mt-1">
                        {score !== null ? `${score}/10` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8F5F0] p-3">
                      <p className="text-xs font-semibold text-[#1F2937] uppercase tracking-wide">Strengths</p>
                      <p className="text-sm text-[#6B7280] mt-1">
                        {interview?.evaluation?.strengths?.length || 0} items
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8F5F0] p-3">
                      <p className="text-xs font-semibold text-[#1F2937] uppercase tracking-wide">Weaknesses</p>
                      <p className="text-sm text-[#6B7280] mt-1">
                        {interview?.evaluation?.weaknesses?.length || 0} items
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8F5F0] p-3">
                      <p className="text-xs font-semibold text-[#1F2937] uppercase tracking-wide">Messages</p>
                      <p className="text-sm text-[#6B7280] mt-1 flex items-center gap-1">
                        <MessageSquareText className="w-4 h-4" />
                        {interview?.messages?.length || 0}
                      </p>
                    </div>
                  </div>

                  {interview?.proctoringSummary && (
                    <div className="mt-4 pt-4 border-t border-[#F1ECE6]">
                      <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
                        <span className="font-semibold text-[#1F2937]">Integrity Telemetry</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EAE6DF]">
                          {interview.proctoringSummary.totalViolations || 0} Total Event{interview.proctoringSummary.totalViolations === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#6B7280]">
                        <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF]">
                          <span>Fullscreen exits: </span>
                          <strong className="text-[#1F2937]">{interview.proctoringSummary.fullscreenExits || 0}</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF]">
                          <span>Tab switches: </span>
                          <strong className="text-[#1F2937]">{interview.proctoringSummary.tabSwitches || 0}</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF]">
                          <span>Multiple faces: </span>
                          <strong className="text-[#1F2937]">{interview.proctoringSummary.multipleFaceEvents || 0}</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF]">
                          <span>Face missing: </span>
                          <strong className="text-[#1F2937]">{interview.proctoringSummary.faceMissingEvents || 0}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionHistory;
