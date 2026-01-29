// src/app/api/jira-summary/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const jiraKey = req.nextUrl.searchParams.get("key");
  if (!jiraKey) {
    return NextResponse.json({ error: "No se ha proporcionado el código del JIRA" }, { status: 400 });
  }

  const JIRA_TOKEN = process.env.JIRA_TOKEN;
  const JIRA_EMAIL = process.env.JIRA_EMAIL;
  const JIRA_DOMAIN = process.env.JIRA_DOMAIN;

  if (!JIRA_TOKEN || !JIRA_EMAIL || !JIRA_DOMAIN) {
    return NextResponse.json({
      error: "Configuración JIRA incompleta. Verifica las variables de entorno JIRA_TOKEN, JIRA_EMAIL y JIRA_DOMAIN."
    }, { status: 500 });
  }

  const authString = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString("base64");

  try {
    const jiraResponse = await fetch(`https://${JIRA_DOMAIN}/rest/api/2/issue/${jiraKey}`, {
      headers: {
        "Authorization": `Basic ${authString}`,
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!jiraResponse.ok) {
      // Puedes opcionalmente leer el cuerpo del error de JIRA si es útil
      // const errorData = await jiraResponse.json();
      // console.error("JIRA API Error:", errorData);
      return NextResponse.json({ error: "No se pudo obtener el título automáticamente desde JIRA." }, { status: jiraResponse.status });
    }

    const data = await jiraResponse.json();
    return NextResponse.json({ summary: data.fields.summary });
  } catch (error) { // Variable 'error' ahora se usa
    console.error("Error al contactar la API de JIRA:", error); // Log del error
    return NextResponse.json({ error: "Error interno al intentar obtener el título del JIRA." }, { status: 500 }); // Status 500 para error interno
  }
}