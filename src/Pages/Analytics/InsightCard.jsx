import React from "react";
import { motion } from "framer-motion";

const getInsightStyle = (text = "") => {
  const normalized = text.toLowerCase();

  if (normalized.includes("brief") || normalized.includes("skip") || normalized.includes("give up")) {
    return "border-l-4 border-l-[#DC2626] bg-[#FEF2F2]";
  }

  return "border-l-4 border-l-[#D97706] bg-[#FFFBEB]";
};

const InsightCard = ({ text }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-xl border border-[#E5E7EB] p-4 shadow-sm ${getInsightStyle(text)}`}
    >
      <p className="text-sm text-[#1F2937]">{text}</p>
    </motion.div>
  );
};

export default InsightCard;
