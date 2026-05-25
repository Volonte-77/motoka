import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className, size = 32, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 group", className)}>
      <div 
        className="relative flex items-center justify-center bg-primary rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
          style={{ width: size * 0.6, height: size * 0.6 }}
        >
          <path
            d="M4 18V7L12 14L20 7V18"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14L12 21"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-50"
          />
        </svg>
      </div>
      {showText && (
        <span className="font-black tracking-tighter text-zinc-900 dark:text-white" style={{ fontSize: size * 0.6 }}>
          MO<span className="text-primary">TO</span>KA
        </span>
      )}
    </div>
  );
}
