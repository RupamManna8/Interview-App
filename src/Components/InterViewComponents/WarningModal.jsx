// WarningModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const WarningModal = ({ 
  message, 
  onContinue, 
  onEndInterview,
  warningCount, 
  maxWarnings 
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Warning Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Policy Violation Detected</h3>
            </div>
          </div>

          {/* Warning Body */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-700 mb-2">{message}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm font-medium text-gray-600">Warning:</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(warningCount / maxWarnings) * 100}%` }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-red-500"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {warningCount}/{maxWarnings}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onContinue}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                Continue Interview
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEndInterview}
                className="flex-1 px-4 py-3 border-2 border-red-500 text-red-500 font-medium rounded-lg hover:bg-red-50 transition-all"
              >
                End Interview
              </motion.button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              ⚠️ Further violations may result in automatic disqualification
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WarningModal;