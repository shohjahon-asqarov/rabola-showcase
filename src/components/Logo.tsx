import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  iconOnly?: boolean;
}

export default function Logo({ className = "", size = 40, iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Premium Geometric 3D-effect SVG Icon */}
      <div
        className="relative flex items-center justify-center rounded-2xl overflow-hidden ring-1 ring-primary/15 bg-gradient-to-br from-primary/10 to-cyan-500/10 transition-all duration-300 group-hover:scale-[1.06] group-hover:ring-primary/30"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 transform group-hover:rotate-6 transition-transform duration-500"
        >
          <defs>
            {/* Elegant multi-stop gradients for a high-tech modern finish */}
            <linearGradient id="logoGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="logoGradSecondary" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="logoGradAccent" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background subtle mesh grid */}
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="3 3" />

          {/* Main Stylized Futuristic 'R' Geometry */}
          {/* Loop part of the 'R' with primary gradient and glow */}
          <path
            d="M28 25 C28 25, 45 15, 62 25 C75 32, 75 48, 62 55 C48 62, 28 55, 28 55 L28 25 Z"
            fill="url(#logoGradPrimary)"
            filter="url(#logoGlow)"
            className="opacity-95"
          />

          {/* Elegant geometric intersecting ribbon overlay representing code brackets & network nodes */}
          <path
            d="M48 50 L72 80 H54 L35 55 L48 50 Z"
            fill="url(#logoGradSecondary)"
            className="opacity-90"
          />

          {/* Vertical sleek backbone spine of the 'R' */}
          <rect
            x="24"
            y="20"
            width="10"
            height="60"
            rx="4"
            fill="url(#logoGradPrimary)"
          />

          {/* Central energetic glowing core node symbolizing a connected platform/portfolios */}
          <circle
            cx="48"
            cy="40"
            r="8"
            fill="url(#logoGradAccent)"
            className="animate-pulse"
            style={{ transformOrigin: "48px 40px", animationDuration: "3s" }}
          />
        </svg>
      </div>

      {/* Modern, high-impact typography with a subtle letter-spacing tweak */}
      {!iconOnly && (
        <span className="font-extrabold tracking-[-0.03em] text-foreground text-lg sm:text-xl transition-colors duration-300 group-hover:text-primary">
          RABOLA
        </span>
      )}
    </div>
  );
}
