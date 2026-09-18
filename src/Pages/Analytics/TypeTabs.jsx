import React from "react";
import { motion } from "framer-motion";

const formatTypeLabel = (type) =>
  String(type || "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const TypeTabs = ({ types = [], selectedType, onSelect }) => {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-2 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {types.map((type) => {
          const active = type === selectedType;

          return (
            <motion.button
              key={type}
              onClick={() => onSelect(type)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]"
                  : "bg-[#F8F5F0] text-[#6B7280] border border-[#E5E7EB] hover:text-[#1F2937]"
              }`}
            >
              {formatTypeLabel(type)}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default TypeTabs;
