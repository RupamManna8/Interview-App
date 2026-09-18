import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ label, value, accent = "#0891B2" }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4"
    >
      <p className="text-xs uppercase tracking-wide text-[#6B7280]">{label}</p>
      <p className="text-2xl font-semibold text-[#1F2937] mt-2" style={{ color: accent }}>
        {value}
      </p>
    </motion.div>
  );
};

export default StatCard;
