import React from "react";

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-[#E5E7EB] ${className}`} />;
}

export default Skeleton;
