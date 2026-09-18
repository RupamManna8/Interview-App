import React from "react";
import { motion } from "framer-motion";

const RecommendationCard = ({ text, onClick }) => {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full text-left rounded-xl border border-[#4F46E5]/40 bg-white p-4 shadow-sm hover:border-[#4F46E5] transition-colors"
    >
      <p className="text-sm font-medium text-[#1F2937]">{text}</p>
    </motion.button>
  );
};

export default RecommendationCard;
