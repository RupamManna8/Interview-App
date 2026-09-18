import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export const CameraFeed = ({
  stream,
  warningCount = 0,
  maxWarnings = 5,
}) => {
  const videoRef = useRef(null);

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // ===============================
  // ATTACH VIDEO
  // ===============================
  useEffect(() => {
    if (!videoRef.current || !stream) return;

    if (videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }

    let cancelled = false;
    videoRef.current
      .play()
      .then(() => {
        if (!cancelled) setIsVideoPlaying(true);
      })
      .catch((e) => {
        if (e?.name !== "AbortError") {
          console.error("Play failed:", e);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [stream]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-2xl border-2 border-indigo-600 bg-black z-50"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      {!isVideoPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* WARNINGS */}
      {warningCount > 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
          {warningCount}/{maxWarnings}
        </div>
      )}
      {/* LIVE */}
      <div className="absolute bottom-2 left-2 text-white text-xs flex items-center gap-1">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
        LIVE
      </div>
    </motion.div>
  );
};