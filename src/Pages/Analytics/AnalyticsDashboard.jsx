import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  RefreshCcw,
  ShieldAlert,
  Wand2,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { UserContext } from "../../Context/UserContext";
import { ROUTE_PATHS } from "../../Routes/paths";
import { Badge } from "../../Components/ui/badge";
import { Button } from "../../Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Components/ui/card";
import { Progress } from "../../Components/ui/progress";
import { Skeleton } from "../../Components/ui/skeleton";

const cardMotion = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const containerMotion = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const COMPARISON_COLORS = ["#0f172a", "#94A3B8", "#CBD5E1"];
const TYPE_COLORS = ["#0f172a", "#334155", "#475569", "#64748B"];
const DEFAULT_BEHAVIOR = {
  eyeGaze: 70,
  headPose: 68,
  speakingConfidence: 72,
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));

const formatTypeLabel = (type) =>
  String(type || "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getStatusMeta = (score) => {
  if (score >= 75) {
    return { label: "Strong", tone: "success", note: "You are interview-ready with good consistency." };
  }

  if (score >= 55) {
    return { label: "Average", tone: "warning", note: "You are close, but key skills still fluctuate." };
  }

  return { label: "Needs Improvement", tone: "danger", note: "You need focused practice before the next round." };
};

const getChartTooltipStyle = () => ({
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
  color: "#0f172a",
});

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div style={getChartTooltipStyle()} className="px-3 py-2 text-xs">
      <p className="font-medium text-[#0f172a]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-[#475569]">
          {entry.name || entry.dataKey}: {Math.round(entry.value)}%
        </p>
      ))}
    </div>
  );
};

const useCountUp = (target, duration = 900) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const finalValue = Number(target || 0);
    const start = performance.now();
    let animationFrame;

    const step = (currentTime) => {
      const progress = Math.min((currentTime - start) / duration, 1);
      setValue(Math.round(finalValue * progress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    setValue(0);
    animationFrame = requestAnimationFrame(step);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration]);

  return value;
};

const deriveComparisonData = (analytics, score) => {
  const interviews = analytics?.interviews || [];
  const average = interviews.length
    ? interviews.reduce((acc, item) => acc + Number(item?.score || 0), 0) / interviews.length
    : score;
  const top = interviews.length
    ? Math.max(...interviews.map((item) => Number(item?.score || 0)))
    : score;

  return [
    { name: "User Score", value: clamp(score) },
    { name: "Your Average", value: clamp(average) },
    { name: "Your Best", value: clamp(top) },
  ];
};

const deriveInterviewRoleBars = (interviews = []) => {
  const grouped = interviews.reduce((acc, item) => {
    const roleLabel = String(item?.role || "").trim();
    const key = roleLabel || formatTypeLabel(item?.type || "Unspecified");
    if (!acc[key]) {
      acc[key] = { role: key, total: 0, count: 0 };
    }
    acc[key].total += Number(item?.score || 0);
    acc[key].count += 1;
    return acc;
  }, {});

  return Object.values(grouped).map((item) => ({
    role: item.role,
    score: Number((item.total / Math.max(item.count, 1)).toFixed(1)),
  }));
};

const deriveRadarData = (analytics) => {
  const technicalMetrics = analytics?.sections?.technical?.metrics || {};
  const nonTechnicalMetrics = analytics?.sections?.nonTechnical?.metrics || {};

  return [
    {
      skill: "Communication",
      value: clamp((Number(nonTechnicalMetrics?.clarity || 0) + Number(nonTechnicalMetrics?.storytelling || 0)) / 2),
    },
    {
      skill: "Technical",
      value: clamp(technicalMetrics?.technical || technicalMetrics?.depth || 0),
    },
    {
      skill: "Clarity",
      value: clamp(Math.max(Number(nonTechnicalMetrics?.clarity || 0), Number(technicalMetrics?.clarity || 0))),
    },
    {
      skill: "Confidence",
      value: clamp(nonTechnicalMetrics?.confidence || 0),
    },
    {
      skill: "Problem Solving",
      value: clamp(
        (Number(technicalMetrics?.problemSolving || 0) + Number(nonTechnicalMetrics?.problemSolving || 0)) / 2
      ),
    },
  ];
};

const buildSectionLists = (section, title) => {
  if (!section) {
    return {
      title,
      strengths: [],
      weaknesses: [],
      improvements: [],
    };
  }

  const strengths = section?.strengths || [];
  const weaknesses = section?.weaknesses || [];
  const improvements = section?.improvements || [];

  return {
    title,
    strengths,
    weaknesses,
    improvements,
  };
};

const deriveSummary = (analytics, radarData) => {
  const latest = analytics?.latest || {};
  const score = clamp(latest?.overall?.readinessScore || analytics?.summary?.avgScore || 0);
  const status = getStatusMeta(score);

  const fallbackStrengths = radarData
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map((item) => `${item.skill} is strong at ${Math.round(item.value)}%.`);

  const fallbackWeaknesses = radarData
    .filter((item) => item.value > 0)
    .sort((a, b) => a.value - b.value)
    .slice(0, 2)
    .map((item) => `${item.skill} needs improvement at ${Math.round(item.value)}%.`);

  const strengths = latest?.overall?.strengths?.length
    ? latest.overall.strengths
    : latest?.evaluation?.strengths?.length
    ? latest.evaluation.strengths
    : fallbackStrengths;

  const weaknesses = latest?.overall?.weaknesses?.length
    ? latest.overall.weaknesses
    : latest?.evaluation?.weaknesses?.length
    ? latest.evaluation.weaknesses
    : fallbackWeaknesses;

  const interpretation =
    score >= 75
      ? "Strong interview signal with clear readiness for advanced rounds."
      : score >= 55
      ? "Solid baseline, but consistency gaps are limiting your final score."
      : "Current readiness is below target and needs focused correction in weak areas.";

  return { score, status, strengths: strengths.slice(0, 2), weaknesses: weaknesses.slice(0, 2), interpretation };
};

const deriveBehaviorMetrics = (analytics, score) => {
  const technicalMetrics = analytics?.sections?.technical?.metrics || {};
  const nonTechnicalMetrics = analytics?.sections?.nonTechnical?.metrics || {};

  return [
    {
      label: "Eye gaze",
      value: clamp(nonTechnicalMetrics?.confidence || DEFAULT_BEHAVIOR.eyeGaze),
      hint: "Stable focus across answers",
    },
    {
      label: "Head pose stability",
      value: clamp(
        (Number(nonTechnicalMetrics?.clarity || 0) + Number(technicalMetrics?.clarity || 0)) / 2 ||
          DEFAULT_BEHAVIOR.headPose
      ),
      hint: "Controlled movement",
    },
    {
      label: "Speaking confidence",
      value: clamp((Number(nonTechnicalMetrics?.confidence || 0) + Number(score || 0)) / 2 || DEFAULT_BEHAVIOR.speakingConfidence),
      hint: "Measured through delivery confidence",
    },
  ];
};

const deriveExplainability = (analytics, radarData) => {
  const latest = analytics?.latest || {};
  const answered = Number(latest?.meta?.answeredQuestions || 0);
  const dontKnowCount = Number(latest?.flags?.dontKnowCount || 0);
  const shortAnswers = Number(latest?.flags?.shortAnswers || 0);
  const avgAnswerLength = Number(latest?.meta?.avgAnswerLength || 0);
  const weakest = [...radarData]
    .filter((item) => item.value > 0)
    .sort((a, b) => a.value - b.value)[0];

  return [
    {
      key: "hesitation",
      label: "Hesitation detected",
      value: answered ? clamp((dontKnowCount / answered) * 100) : 0,
      text: `${dontKnowCount} uncertain responses were detected from ${answered} answered questions.`,
    },
    {
      key: "keywords",
      label: "Weak keyword usage",
      value: avgAnswerLength > 0 ? clamp(avgAnswerLength < 45 ? 28 : 14) : 0,
      text: avgAnswerLength > 0 ? `Average answer length is ${avgAnswerLength.toFixed(1)} words.` : "No answer-length data available.",
    },
    {
      key: "structure",
      label: "Lack of structured responses",
      value: shortAnswers ? clamp(shortAnswers * 8) : 0,
      text: weakest
        ? `${weakest.skill} is the weakest signal at ${Math.round(weakest.value)}%.`
        : "Insufficient skill metrics to compute weakest signal.",
    },
  ];
};

const ScoreRing = ({ value }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamp(value) / 100) * circumference;

  return (
    <div className="relative h-44 w-44">
      <svg className="h-44 w-44 -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="12" />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#0f172a"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold text-[#0f172a]">{Math.round(value)}%</span>
        <span className="mt-1 text-xs uppercase tracking-[0.24em] text-[#6B7280]">Readiness</span>
      </div>
    </div>
  );
};

const SummaryCard = ({ summary, animatedScore }) => {
  return (
    <motion.section variants={cardMotion} className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-center">
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-2">
            <Badge tone={summary.status.tone}>{summary.status.label}</Badge>
          </div>
          <ScoreRing value={animatedScore} />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-[#6B7280]">Overall performance snapshot</p>
            <h2 className="mt-2 text-xl font-semibold text-[#0f172a]">{summary.interpretation}</h2>
            <p className="mt-2 text-sm text-[#6B7280]">{summary.status.note}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F5F0] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#0f172a]">
                <CheckCircle2 className="h-4 w-4" /> Key strengths
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[#475569]">
                {summary.strengths.length ? (
                  summary.strengths.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[#6B7280]">No strength signals available yet.</li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F5F0] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#0f172a]">
                <ShieldAlert className="h-4 w-4" /> Key weaknesses
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[#475569]">
                {summary.weaknesses.length ? (
                  summary.weaknesses.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[#6B7280]">No weakness signals available yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const ComparisonChart = ({ data }) => (
  <Card className="h-full rounded-2xl">
    <CardHeader>
      <CardTitle>Comparison Bar Chart</CardTitle>
      <CardDescription>User score against industry averages and top candidates.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[290px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F8F5F0" }} />
            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COMPARISON_COLORS[index % COMPARISON_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

const RadarChartSection = ({ data }) => (
  <Card className="h-full rounded-2xl">
    <CardHeader>
      <CardTitle>Skill Radar Chart</CardTitle>
      <CardDescription>Communication, technical depth, clarity, confidence, and problem solving.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="relative h-[290px] min-w-0">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[230px] w-[230px] rounded-full border border-rose-200/70 bg-rose-50/30" />
          <div className="absolute h-[175px] w-[175px] rounded-full border border-amber-200/80 bg-amber-50/25" />
          <div className="absolute h-[120px] w-[120px] rounded-full border border-emerald-200/80 bg-emerald-50/30" />
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={data} outerRadius="68%">
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: "#475569", fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Radar dataKey="value" stroke="#0f172a" fill="#0f172a" fillOpacity={0.18} strokeWidth={2} />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#6B7280]">
        <Badge tone="danger">Low zone</Badge>
        <Badge tone="warning">Average zone</Badge>
        <Badge tone="success">Strong zone</Badge>
      </div>
    </CardContent>
  </Card>
);

const RoleAxisTick = ({ x, y, payload }) => {
  const words = String(payload?.value || "").split(" ");
  const firstLine = words.slice(0, 2).join(" ");
  const secondLine = words.slice(2).join(" ");

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="#6B7280" fontSize={12}>
        <tspan x={0}>{firstLine}</tspan>
        {secondLine ? <tspan x={0} dy={14}>{secondLine}</tspan> : null}
      </text>
    </g>
  );
};

const InterviewRoleChart = ({ data }) => (
  <Card className="h-full rounded-2xl">
    <CardHeader>
      <CardTitle>Interview Role Distribution</CardTitle>
      <CardDescription>Average score across interview roles.</CardDescription>
    </CardHeader>
    <CardContent>
      {data.length ? (
        <div className="h-[290px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 12, bottom: 18, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="role" tick={<RoleAxisTick />} interval={0} height={56} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F8F5F0" }} />
              <Bar dataKey="score" radius={[10, 10, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={entry.role} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-[#6B7280]">No interview-role analytics available yet.</p>
      )}
    </CardContent>
  </Card>
);

const SectionSWI = ({ section }) => {
  const columns = [
    { key: "strengths", label: "Strengths", color: "bg-emerald-500" },
    { key: "weaknesses", label: "Weaknesses", color: "bg-amber-500" },
    { key: "improvements", label: "Improvements", color: "bg-[#0f172a]" },
  ];

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
        <CardDescription>
          {section?.score ? `Latest ${section.title.toLowerCase()} score: ${Math.round(section.score)}%` : "No recent interview data for this section."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((column) => {
            const items = section[column.key] || [];
            return (
              <div key={column.key} className="rounded-2xl border border-[#E5E7EB] bg-[#F8F5F0] p-4">
                <h4 className="text-sm font-semibold text-[#0f172a]">{column.label}</h4>
                <ul className="mt-3 space-y-2 text-sm text-[#475569]">
                  {items.length ? (
                    items.map((item, index) => (
                      <li key={`${column.key}-${index}-${item}`} className="flex gap-2">
                        <span className={`mt-2 h-1.5 w-1.5 rounded-full ${column.color}`} />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-[#6B7280]">No {column.label.toLowerCase()} data available.</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const ConfidenceMetrics = ({ metrics }) => (
  <Card className="rounded-2xl">
    <CardHeader>
      <CardTitle>Confidence & Behavior Analysis</CardTitle>
      <CardDescription>Behavioral confidence indicators from interview sessions.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-[#E5E7EB] bg-[#F8F5F0] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#0f172a]">{metric.label}</p>
                <p className="text-xs text-[#6B7280]">{metric.hint}</p>
              </div>
              <span className="text-sm font-semibold text-[#0f172a]">{metric.value}%</span>
            </div>
            <Progress className="mt-3" value={metric.value} />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ExplainabilityPanel = ({ items, uncertainItems, showUncertain, onToggleUncertain }) => {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Explainability</CardTitle>
        <CardDescription>Why the score was assigned.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.key} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">{item.label}</p>
                  <p className="mt-1 text-sm text-[#6B7280]">{item.text}</p>
                </div>
                <Badge tone={item.value >= 35 ? "warning" : item.value >= 20 ? "muted" : "success"}>{Math.round(item.value)}%</Badge>
              </div>
              <Progress className="mt-3" value={item.value} />

              {item.key === "hesitation" ? (
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={onToggleUncertain}>
                    {showUncertain ? "Hide Questions" : "Show Questions"}
                  </Button>

                  {showUncertain ? (
                    <div className="mt-3 space-y-3">
                      {uncertainItems.length ? (
                        uncertainItems.map((entry, index) => (
                          <div key={`${index}-${entry?.question || "q"}`} className="rounded-xl border border-[#E5E7EB] bg-[#F8F5F0] p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">Question</p>
                            <p className="mt-1 text-sm text-[#0f172a]">{entry?.question || "Unavailable"}</p>
                            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[#6B7280]">Uncertain Answer</p>
                            <p className="mt-1 text-sm text-[#475569]">{entry?.answer || "Unavailable"}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[#6B7280]">No uncertain question/answer pairs found.</p>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const CTASection = ({ onStartNext, onImproveWeakAreas, onDownload }) => (
  <Card className="rounded-2xl bg-[#0f172a] text-white">
    <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xl font-semibold">Ready for the next round?</p>
        <p className="mt-1 text-sm text-white/70">Focus weak areas, then run another interview.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="bg-white text-[#0f172a] hover:bg-slate-100" onClick={onStartNext}>
          Start Next Interview
          <ArrowUpRight className="h-4 w-4" />
        </Button>
        <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={onImproveWeakAreas}>
          Improve Weak Areas
          <Wand2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={onDownload}>
          Download Report
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Card className="rounded-2xl">
      <CardContent className="grid gap-6 p-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-44 w-44 rounded-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="grid gap-6 xl:grid-cols-3">
      <Skeleton className="h-[360px] rounded-2xl" />
      <Skeleton className="h-[360px] rounded-2xl" />
      <Skeleton className="h-[360px] rounded-2xl" />
    </div>
    <Skeleton className="h-[260px] rounded-2xl" />
    <Skeleton className="h-[220px] rounded-2xl" />
    <Skeleton className="h-[230px] rounded-2xl" />
  </div>
);

const AnalyticsDashboard = () => {
  const { apiRequest } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [showUncertain, setShowUncertain] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/service/api/analytics", { method: "GET" });
      setAnalytics(response || null);
    } catch (err) {
      setError(err?.message || "Failed to load analytics.");
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const hasLiveData = Boolean(analytics?.latest);

  const radarData = useMemo(() => deriveRadarData(analytics || {}), [analytics]);
  const summary = useMemo(() => deriveSummary(analytics || {}, radarData), [analytics, radarData]);
  const animatedScore = useCountUp(summary.score);
  const comparisonData = useMemo(() => deriveComparisonData(analytics || {}, summary.score), [analytics, summary.score]);
  const roleBars = useMemo(() => deriveInterviewRoleBars(analytics?.interviews || []), [analytics]);
  const technicalSection = useMemo(
    () => ({ ...buildSectionLists(analytics?.sections?.technical || null, "Technical Section"), score: analytics?.sections?.technical?.score || 0 }),
    [analytics]
  );
  const nonTechnicalSection = useMemo(
    () => ({ ...buildSectionLists(analytics?.sections?.nonTechnical || null, "Behavioral Section"), score: analytics?.sections?.nonTechnical?.score || 0 }),
    [analytics]
  );
  const behavior = useMemo(() => deriveBehaviorMetrics(analytics || {}, summary.score), [analytics, summary.score]);
  const explainability = useMemo(() => deriveExplainability(analytics || {}, radarData), [analytics, radarData]);
  const uncertainItems = analytics?.latest?.uncertainItems || [];

  const handleDownload = () => {
    if (!hasLiveData) {
      return;
    }

    const payload = {
      summary,
      sections: {
        technical: technicalSection,
        nonTechnical: nonTechnicalSection,
      },
      explainability,
      uncertainItems,
      raw: analytics,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "interview-analytics-report.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!hasLiveData) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Analytics Unavailable</CardTitle>
              <CardDescription>{error || "Complete at least one interview to generate analytics."}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchAnalytics} variant="outline">
                <RefreshCcw className="h-4 w-4" /> Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="min-h-screen bg-[#F8F5F0]">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        {/* <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge tone={summary.status.tone}>{summary.status.label}</Badge>
            <h1 className="mt-3 text-2xl font-semibold text-[#0f172a]">Interview Analytics Dashboard</h1>
            <p className="mt-2 text-sm text-[#6B7280]">Decision-focused analytics from your completed interviews.</p>
          </div>
          <Button variant="outline" onClick={fetchAnalytics} className="self-start">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div> */}

        <motion.div variants={containerMotion} initial="hidden" animate="show" className="space-y-6">
           <div className="mb-3 flex gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mt-3 text-2xl font-semibold text-[#0f172a]">Interview Analytics Dashboard</h1>
            <p className="mt-2 text-sm text-[#6B7280]">Decision-focused analytics from your completed interviews.</p>
          </div>
          <Button variant="outline" onClick={fetchAnalytics} className="self-start mt-4">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>
          <SummaryCard summary={summary} animatedScore={animatedScore} />

          <section className="rounded-2xl border border-[#E5E7EB] bg-[#F1ECE6] p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#0f172a]">Performance Breakdown</h2>
              <p className="text-sm text-[#6B7280]">Comparison and radar view for readiness benchmarking.</p>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <ComparisonChart data={comparisonData} />
              <RadarChartSection data={radarData} />
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5E7EB] bg-[#F1ECE6] p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#0f172a]">Interview Role Distribution</h2>
              <p className="text-sm text-[#6B7280]">Role-wise average performance in a dedicated section.</p>
            </div>
            <InterviewRoleChart data={roleBars} />
          </section>

          <SectionSWI section={technicalSection} />
          <SectionSWI section={nonTechnicalSection} />

          <ConfidenceMetrics metrics={behavior} />

          <ExplainabilityPanel
            items={explainability}
            uncertainItems={uncertainItems}
            showUncertain={showUncertain}
            onToggleUncertain={() => setShowUncertain((prev) => !prev)}
          />

          <CTASection
            onStartNext={() => navigate(ROUTE_PATHS.USER_START_INTERVIEW)}
            onImproveWeakAreas={() => navigate(ROUTE_PATHS.USER_SESSION_HISTORY)}
            onDownload={handleDownload}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
