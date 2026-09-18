import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CameraWarning = ({ message, visible, onClose }) => {
  const normalizedMessage =
    typeof message === "string"
      ? message
      : message?.message || "Suspicious activity detected";

  // Auto close after 3s (optional)
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999]"
        >
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[280px]">
            
            {/* ICON */}
            <div className="text-xl">⚠️</div>

            {/* MESSAGE */}
            <div className="flex-1 text-sm font-medium">
              {normalizedMessage}
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CameraWarning;