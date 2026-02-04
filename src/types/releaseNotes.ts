// Types for Release Notes System

export type ChangeType = "feat" | "impr" | "fix" | "style";

export interface ChangeItem {
  text: string;
  type: ChangeType;
}

export interface ReleaseVersion {
  version: string;
  date: string;
  changes: ChangeItem[];
  isMajor?: boolean;
  summary?: string;
}

export interface VersionStats {
  features: number;
  improvements: number;
  fixes: number;
  styles: number;
  total: number;
}

export interface ReleaseNotesSearchResult {
  version: ReleaseVersion;
  matchingChanges: ChangeItem[];
  matchCount: number;
}

export interface ChangeTypeStyle {
  label: string;
  icon: string;
  bg: string;
  text: string;
  darkBg: string;
}

export type ChangeTypeStyles = Record<ChangeType, ChangeTypeStyle>;
