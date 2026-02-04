"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Bug, Palette } from "lucide-react";
import { ChangeItem as ChangeItemType, ChangeType } from "@/types/releaseNotes";
import { changeTypeStyles } from "@/utils/releaseNotesData";

interface ChangeItemProps {
  change: ChangeItemType;
  index?: number;
  highlightedText?: string;
}

const iconMap = {
  feat: Sparkles,
  impr: TrendingUp,
  fix: Bug,
  style: Palette,
};

export function ChangeItem({ change, index = 0, highlightedText }: ChangeItemProps) {
  const style = changeTypeStyles[change.type];
  const Icon = iconMap[change.type];

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="
        flex items-start gap-3 p-3 rounded-xl
        hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.03]
        transition-colors group
      "
    >
      {/* Badge with icon */}
      <span
        className={`
          mt-0.5 px-2.5 py-1 text-xs font-semibold rounded-full
          flex items-center gap-1.5 shrink-0
          ${style.bg} ${style.darkBg} ${style.text}
          group-hover:scale-105 transition-transform
        `}
      >
        <Icon size={12} />
        {style.label}
      </span>

      {/* Text content */}
      <span
        className="text-sm text-[var(--foreground-secondary)] leading-relaxed flex-1"
        dangerouslySetInnerHTML={{
          __html: highlightedText || change.text,
        }}
      />
    </motion.li>
  );
}
