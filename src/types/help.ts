// Types for Help System

export interface HelpContentItem {
  id: string;
  section: "jira-guide" | "report-guide" | "faq";
  title: string;
  keywords: string[];
  stepNumber?: number;
  estimatedTime?: number; // minutos
}

export interface HelpProgress {
  [itemId: string]: {
    completed: boolean;
    lastVisited: number;
  };
}

export interface TourStep {
  id: string;
  target: string; // CSS selector o ID
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  spotlightPadding?: number;
}

export interface SearchResult {
  item: HelpContentItem;
  matches: string[];
}

export type TipType = "info" | "warning" | "success" | "danger";

export interface FAQItemData {
  id: string;
  question: string;
  keywords: string[];
}
