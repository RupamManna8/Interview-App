import React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const AnalyticsRadarChart = ({ metrics = {} }) => {
  const data = Object.entries(metrics || {}).map(([key, value]) => ({
    skill: key,
    value,
  }));

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
        <h3 className="text-base font-semibold text-[#1F2937] mb-2">Skill Radar</h3>
        <p className="text-sm text-[#6B7280]">No metrics available for this interview type yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6"
    >
      <h3 className="text-base font-semibold text-[#1F2937] mb-4">Skill Radar</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart outerRadius="72%" data={data}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: "#6B7280", fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.22}
              strokeWidth={2}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default AnalyticsRadarChart;
