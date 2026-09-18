import React from "react";

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a]/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variantClasses = {
  default: "bg-[#0f172a] text-white shadow-sm hover:bg-[#111827]",
  secondary: "bg-[#F1ECE6] text-[#0f172a] border border-[#E5E7EB] hover:bg-white",
  outline: "border border-[#E5E7EB] bg-white text-[#0f172a] hover:bg-[#F8F5F0]",
  ghost: "text-[#0f172a] hover:bg-[#F1ECE6]",
};

const sizeClasses = {
  sm: "h-9 px-3",
  md: "h-10 px-4 py-2",
  lg: "h-11 px-5",
};

export function Button({ className = "", variant = "default", size = "md", asChild = false, ...props }) {
  const Comp = asChild ? "span" : "button";

  return (
    <Comp className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${className}`} {...props} />
  );
}

export default Button;
