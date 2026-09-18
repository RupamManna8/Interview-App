import { createPortal } from "react-dom";
import { useState, useEffect } from "react";

export const FullscreenPortal = ({ children }) => {
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    const updateMountNode = () => {
      // Industry trick: always mount to the current fullscreen element
      // or fallback to body if not in fullscreen
      setMountNode(document.fullscreenElement || document.body);
    };

    document.addEventListener("fullscreenchange", updateMountNode);
    updateMountNode(); // Initial check

    return () => document.removeEventListener("fullscreenchange", updateMountNode);
  }, []);

  if (!mountNode) return null;

  return createPortal(children, mountNode);
};