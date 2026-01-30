// src/components/step-three/types.ts

export type PreviewFormat = "jira" | "word" | "html" | "pdf";

export interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  format: "clipboard" | "docx" | "pdf" | "html";
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  isDefault?: boolean;
}
