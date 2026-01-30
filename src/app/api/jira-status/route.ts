// src/app/api/jira-status/route.ts
import { NextResponse } from "next/server";

/**
 * Endpoint para verificar si la API de JIRA está configurada.
 * No expone las credenciales, solo indica si están presentes.
 */
export async function GET() {
  const JIRA_TOKEN = process.env.JIRA_TOKEN;
  const JIRA_EMAIL = process.env.JIRA_EMAIL;
  const JIRA_DOMAIN = process.env.JIRA_DOMAIN;

  const isConfigured = Boolean(JIRA_TOKEN && JIRA_EMAIL && JIRA_DOMAIN);

  return NextResponse.json({
    configured: isConfigured,
    domain: isConfigured ? process.env.JIRA_DOMAIN : null,
  });
}
