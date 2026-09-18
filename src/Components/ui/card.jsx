import React from "react";

export function Card({ className = "", ...props }) {
  return <div className={`rounded-2xl border border-[#E5E7EB] bg-white shadow-sm ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }) {
  return <div className={`flex flex-col gap-1.5 p-6 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }) {
  return <h3 className={`text-xl font-semibold text-[#0f172a] ${className}`} {...props} />;
}

export function CardDescription({ className = "", ...props }) {
  return <p className={`text-sm text-[#6B7280] ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }) {
  return <div className={`flex items-center p-6 pt-0 ${className}`} {...props} />;
}

export default Card;
