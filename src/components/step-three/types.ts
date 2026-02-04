// src/components/step-three/types.ts

export type PreviewFormat = "jira" | "word";

export interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  format: "docx";
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  isDefault?: boolean;
}
