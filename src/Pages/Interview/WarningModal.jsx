// WarningModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const WarningModal = ({ 
  message, 
  onContinue, 
  warningCount, 
  maxWarnings 
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-6 py-4 rounded-lg shadow-xl z-50 max-w-md w-full"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium mb-2">{message}</p>
            <div className="w-full bg-yellow-600 rounded-full h-2 mb-3">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(warningCount / maxWarnings) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">
                Warning {warningCount} of {maxWarnings}
              </span>
              <button
                onClick={onContinue}
                className="px-4 py-1 bg-white text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WarningModal;