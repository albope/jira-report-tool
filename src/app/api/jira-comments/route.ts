// src/app/api/jira-comments/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint para obtener los comentarios de un issue de JIRA.
 *
 * Query params:
 * - issueKey: Clave del issue (requerido)
 * - maxResults: Máximo de comentarios (default: 50)
 * - startAt: Offset para paginación (default: 0)
 *
 * Headers:
 * - X-Jira-Domain
 * - X-Jira-Email
 * - X-Jira-Token
 */
export async function GET(req: NextRequest) {
  const issueKey = req.nextUrl.searchParams.get("issueKey");
  const maxResults = parseInt(req.nextUrl.searchParams.get("maxResults") || "50", 10);
  const startAt = parseInt(req.nextUrl.searchParams.get("startAt") || "0", 10);

  if (!issueKey) {
    return NextResponse.json({
      error: "Se requiere el código del issue (issueKey)"
    }, { status: 400 });
  }

  // Obtener credenciales
  const headerDomain = req.headers.get("X-Jira-Domain");
  const headerEmail = req.headers.get("X-Jira-Email");
  const headerToken = req.headers.get("X-Jira-Token");

  const domain = headerDomain || process.env.JIRA_DOMAIN;
  const email = headerEmail || process.env.JIRA_EMAIL;
  const token = headerToken || process.env.JIRA_TOKEN;

  if (!domain || !email || !token) {
    return NextResponse.json({
      error: "Configuración JIRA incompleta"
    }, { status: 500 });
  }

  const authString = Buffer.from(`${email}:${token}`).toString("base64");

  try {
    const url = new URL(`https://${domain}/rest/api/3/issue/${issueKey}/comment`);
    url.searchParams.set("maxResults", maxResults.toString());
    url.searchParams.set("startAt", startAt.toString());
    url.searchParams.set("orderBy", "-created"); // Más recientes primero

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": `Basic ${authString}`,
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Credenciales JIRA inválidas" }, { status: 401 });
      }
      if (response.status === 404) {
        return NextResponse.json({ error: `Issue ${issueKey} no encontrado` }, { status: 404 });
      }
      return NextResponse.json({ error: `Error de JIRA: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();

    // Marcador para identificar reportes de prueba
    const REPORT_MARKERS = [
      "REPORTE DE PRUEBAS",
      "h1. Información General",
      "h2. Batería de Pruebas",
      "📌 Información General",
      "|| ID || Descripción ||",
    ];

    // Procesar comentarios
    const comments = data.comments.map((comment: {
      id: string;
      body: string;
      created: string;
      updated: string;
      author?: {
        displayName?: string;
        emailAddress?: string;
        avatarUrls?: { "24x24"?: string };
      };
    }) => {
      // Detectar si es un reporte de pruebas
      const isTestReport = REPORT_MARKERS.some(marker =>
        comment.body.includes(marker)
      );

      return {
        id: comment.id,
        body: comment.body,
        created: comment.created,
        updated: comment.updated,
        author: {
          displayName: comment.author?.displayName || "Unknown",
          emailAddress: comment.author?.emailAddress,
          avatarUrl: comment.author?.avatarUrls?.["24x24"],
        },
        isTestReport,
      };
    });

    return NextResponse.json({
      comments,
      total: data.total,
      startAt: data.startAt,
      maxResults: data.maxResults,
      // Filtrar solo reportes de prueba para acceso rápido
      testReports: comments.filter((c: { isTestReport: boolean }) => c.isTestReport),
    });
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return NextResponse.json({
      error: "Error interno al obtener comentarios"
    }, { status: 500 });
  }
}
