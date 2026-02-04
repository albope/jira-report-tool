// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para la tabla de reportes
export interface DBReport {
  id: string;
  user_email: string;
  jira_code: string;
  title: string;
  form_data: Record<string, unknown>;
  hidden_fields: Record<string, unknown>;
  parsed_data: Record<string, unknown>;
  report_content: string;
  metadata: {
    testStatus: string;
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    tester: string;
  };
  jira_comment_id?: string;
  created_at: string;
  updated_at: string;
}

// Tipos para la tabla de feedback
export interface DBFeedback {
  id: string;
  name: string;
  description: string;
  done: boolean;
  created_at: string;
  updated_at: string;
}
