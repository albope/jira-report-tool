// src/app/api/jira-summary/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const jiraKey = req.nextUrl.searchParams.get("key");
  if (!jiraKey) {
    return NextResponse.json({ error: "No se ha proporcionado el código del JIRA" }, { status: 400 });
  }

  const JIRA_TOKEN = process.env.JIRA_TOKEN; // Añade esto en tu .env.local
  const JIRA_EMAIL = "abort.etraid@grupoetra.com"; // <-- TU EMAIL
  const JIRA_DOMAIN = "etraid.atlassian.net";

  if (!JIRA_TOKEN) {
    return NextResponse.json({ error: "API token no configurado" }, { status: 500 });
  }

  const authString = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString("base64");

  try {
    const jiraResponse = await fetch(`https://${JIRA_DOMAIN}/rest/api/2/issue/${jiraKey}`, {
      headers: {
        "Authorization": `Basic ${authString}`,
        "Accept": "application/json",
      },
      // Next.js 13+ edge runtime requiere modo 'no-store'
      cache: "no-store",
    });

    if (!jiraResponse.ok) {
      return NextResponse.json({ error: "No se pudo obtener el título automáticamente." }, { status: jiraResponse.status });
    }

    const data = await jiraResponse.json();
    return NextResponse.json({ summary: data.fields.summary });
  } catch (error) {
    return NextResponse.json({ error: "No se pudo obtener el título automáticamente." }, { status: 400 });
  }
}