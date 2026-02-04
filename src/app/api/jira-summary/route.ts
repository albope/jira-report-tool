// src/app/api/jira-summary/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint para obtener el resumen/título de un issue de JIRA.
 *
 * Soporta dos modos de autenticación:
 * 1. Headers de usuario (X-Jira-Domain, X-Jira-Email, X-Jira-Token)
 * 2. Variables de entorno (JIRA_DOMAIN, JIRA_EMAIL, JIRA_TOKEN)
 *
 * Los headers tienen prioridad sobre las variables de entorno.
 */
export async function GET(req: NextRequest) {
  const jiraKey = req.nextUrl.searchParams.get("key");
  if (!jiraKey) {
    return NextResponse.json({ error: "No se ha proporcionado el código del JIRA" }, { status: 400 });
  }

  // Obtener credenciales de headers (prioridad) o env vars
  const headerDomain = req.headers.get("X-Jira-Domain");
  const headerEmail = req.headers.get("X-Jira-Email");
  const headerToken = req.headers.get("X-Jira-Token");

  const domain = headerDomain || process.env.JIRA_DOMAIN;
  const email = headerEmail || process.env.JIRA_EMAIL;
  const token = headerToken || process.env.JIRA_TOKEN;

  if (!domain || !email || !token) {
    return NextResponse.json({
      error: "Configuración JIRA incompleta. Configura tus credenciales o verifica las variables de entorno."
    }, { status: 500 });
  }

  const authString = Buffer.from(`${email}:${token}`).toString("base64");

  try {
    // Timeout de 15 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const jiraResponse = await fetch(`https://${domain}/rest/api/3/issue/${jiraKey}`, {
      headers: {
        "Authorization": `Basic ${authString}`,
        "Accept": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!jiraResponse.ok) {
      if (jiraResponse.status === 401) {
        return NextResponse.json({ error: "Credenciales JIRA inválidas." }, { status: 401 });
      }
      if (jiraResponse.status === 404) {
        return NextResponse.json({ error: `Issue ${jiraKey} no encontrado.` }, { status: 404 });
      }
      return NextResponse.json({ error: "No se pudo obtener el issue desde JIRA." }, { status: jiraResponse.status });
    }

    const data = await jiraResponse.json();

    // Extraer información adicional útil
    return NextResponse.json({
      key: data.key,
      summary: data.fields.summary,
      status: data.fields.status?.name,
      statusCategory: data.fields.status?.statusCategory?.key,
      assignee: data.fields.assignee?.displayName,
      issueType: data.fields.issuetype?.name,
      priority: data.fields.priority?.name,
      description: data.fields.description,
    });
  } catch (error) {
    console.error("Error al contactar la API de JIRA:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Timeout: La conexión con JIRA tardó demasiado." }, { status: 504 });
    }

    return NextResponse.json({ error: "Error interno al intentar obtener el issue de JIRA." }, { status: 500 });
  }
}