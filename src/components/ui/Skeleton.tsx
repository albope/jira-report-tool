// src/components/ui/Skeleton.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "text",
  width,
  height,
  animation = "wave",
}) => {
  const baseClasses = "bg-gray-200 overflow-hidden relative";

  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "",
    rounded: "rounded-lg",
  };

  const style: React.CSSProperties = {
    width: width || (variant === "circular" ? height : "100%"),
    height: height || (variant === "text" ? undefined : 100),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {animation === "wave" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      {animation === "pulse" && (
        <motion.div
          className="absolute inset-0 bg-gray-300"
          animate={{
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
};

// Form Section Skeleton
export const FormSectionSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg space-y-5">
    <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6">
      <Skeleton variant="circular" width={28} height={28} />
      <Skeleton variant="text" width="40%" height={24} />
    </div>
    <div className="space-y-4">
      <div>
        <Skeleton variant="text" width="30%" height={14} className="mb-2" />
        <Skeleton variant="rounded" height={42} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton variant="text" width="40%" height={14} className="mb-2" />
          <Skeleton variant="rounded" height={42} />
        </div>
        <div>
          <Skeleton variant="text" width="35%" height={14} className="mb-2" />
          <Skeleton variant="rounded" height={42} />
        </div>
      </div>
    </div>
  </div>
);

// Battery Test Card Skeleton
export const BatteryTestCardSkeleton: React.FC = () => (
  <div className="p-5 rounded-xl border-2 border-gray-200 bg-gray-50 space-y-4">
    <div className="flex justify-between items-center pb-2 mb-3 border-b border-gray-200">
      <Skeleton variant="rounded" width={120} height={24} />
      <div className="flex gap-2">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Skeleton variant="rounded" height={42} />
      <Skeleton variant="rounded" height={42} />
    </div>
    <Skeleton variant="rounded" height={60} />
    <Skeleton variant="rounded" height={80} />
    <div className="grid grid-cols-2 gap-4">
      <Skeleton variant="rounded" height={60} />
      <Skeleton variant="rounded" height={60} />
    </div>
  </div>
);

// Full Page Loading Skeleton
export const PageLoadingSkeleton: React.FC = () => (
  <div className="space-y-10 max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
    {/* Header */}
    <div className="flex items-center justify-between pb-5 border-b border-gray-300">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div>
          <Skeleton variant="text" width={280} height={28} className="mb-2" />
          <Skeleton variant="text" width={200} height={14} />
        </div>
      </div>
      <Skeleton variant="rounded" width={140} height={36} />
    </div>

    {/* Sections */}
    <FormSectionSkeleton />
    <FormSectionSkeleton />
    <div className="space-y-6">
      <BatteryTestCardSkeleton />
    </div>
  </div>
);
