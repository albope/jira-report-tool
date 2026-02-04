// src/app/api/jira-search/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint para buscar issues en JIRA usando JQL.
 *
 * Query params:
 * - q: Texto de búsqueda (requerido)
 * - project: Filtrar por proyecto (opcional)
 * - maxResults: Máximo de resultados (default: 10, max: 50)
 * - startAt: Offset para paginación (default: 0)
 *
 * Headers (prioridad) o env vars:
 * - X-Jira-Domain / JIRA_DOMAIN
 * - X-Jira-Email / JIRA_EMAIL
 * - X-Jira-Token / JIRA_TOKEN
 */
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  const project = req.nextUrl.searchParams.get("project");
  const maxResults = Math.min(
    parseInt(req.nextUrl.searchParams.get("maxResults") || "10", 10),
    50
  );
  const startAt = parseInt(req.nextUrl.searchParams.get("startAt") || "0", 10);

  if (!query || query.trim().length < 2) {
    return NextResponse.json({
      error: "La búsqueda debe tener al menos 2 caracteres"
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
    // Construir JQL - simplificado para evitar errores 410
    const escapedQuery = query.replace(/"/g, '\\"').trim();
    const upperQuery = escapedQuery.toUpperCase();
    let jql = "";

    // Si parece un código JIRA completo (XXX-123), buscar directamente por key
    if (/^[A-Z]+-\d+$/i.test(escapedQuery)) {
      jql = `key = "${upperQuery}"`;
    }
    // Si parece inicio de key con número (PROJ-12), buscar en texto
    else if (/^[A-Z]+-\d+/i.test(escapedQuery)) {
      // Buscar el texto en cualquier campo (key, summary, etc.)
      jql = `text ~ "${escapedQuery}*"`;
    }
    // Para cualquier otro caso, usar búsqueda de texto general
    else {
      // text ~ busca en key, summary, description, comments, etc.
      jql = `text ~ "${escapedQuery}*"`;
    }

    // Añadir filtro de proyecto si se especifica externamente
    if (project) {
      jql = `project = "${project}" AND (${jql})`;
    }

    // Ordenar por última actualización
    jql += " ORDER BY updated DESC";

    const searchUrl = new URL(`https://${domain}/rest/api/3/search/jql`);
    searchUrl.searchParams.set("jql", jql);
    searchUrl.searchParams.set("maxResults", maxResults.toString());
    searchUrl.searchParams.set("startAt", startAt.toString());
    searchUrl.searchParams.set("fields", "key,summary,status,assignee,issuetype,priority,updated");

    // Timeout de 15 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(searchUrl.toString(), {
      headers: {
        "Authorization": `Basic ${authString}`,
        "Accept": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Obtener detalles del error de JIRA
      let errorDetail = "";
      try {
        const errorBody = await response.json();
        errorDetail = errorBody.errorMessages?.[0] || errorBody.message || JSON.stringify(errorBody);
        console.error("JIRA API error:", { status: response.status, body: errorBody, jql });
      } catch {
        errorDetail = `HTTP ${response.status}`;
      }

      if (response.status === 401) {
        return NextResponse.json({ error: "Credenciales JIRA inválidas" }, { status: 401 });
      }
      if (response.status === 403) {
        return NextResponse.json({ error: "Sin permisos para buscar en JIRA" }, { status: 403 });
      }
      if (response.status === 410) {
        // 410 Gone - proyecto no existe o JQL rechazado, intentar solo summary
        console.log("410 Gone - intentando búsqueda simple. JQL original:", jql);
        const simpleJql = `text ~ "${escapedQuery}*" ORDER BY updated DESC`;
        const simpleUrl = new URL(`https://${domain}/rest/api/3/search/jql`);
        simpleUrl.searchParams.set("jql", simpleJql);
        simpleUrl.searchParams.set("maxResults", maxResults.toString());
        simpleUrl.searchParams.set("fields", "key,summary,status,assignee,issuetype,priority,updated");

        const simpleResponse = await fetch(simpleUrl.toString(), {
          headers: {
            "Authorization": `Basic ${authString}`,
            "Accept": "application/json",
          },
          cache: "no-store",
        });

        if (simpleResponse.ok) {
          const simpleData = await simpleResponse.json();
          return formatSearchResponse(simpleData, startAt, maxResults);
        }
        // Si también falla, devolver error original
        return NextResponse.json({ error: `Proyecto no encontrado o sin permisos: ${errorDetail}` }, { status: 410 });
      }
      if (response.status === 400) {
        // JQL inválido - intentar búsqueda más simple
        console.log("JQL inválido, intentando fallback. JQL original:", jql);
        const fallbackJql = `summary ~ "${escapedQuery}*" ORDER BY updated DESC`;
        const fallbackUrl = new URL(`https://${domain}/rest/api/3/search/jql`);
        fallbackUrl.searchParams.set("jql", fallbackJql);
        fallbackUrl.searchParams.set("maxResults", maxResults.toString());
        fallbackUrl.searchParams.set("fields", "key,summary,status,assignee,issuetype,priority,updated");

        const fallbackResponse = await fetch(fallbackUrl.toString(), {
          headers: {
            "Authorization": `Basic ${authString}`,
            "Accept": "application/json",
          },
          cache: "no-store",
        });

        if (!fallbackResponse.ok) {
          const fallbackError = await fallbackResponse.json().catch(() => ({}));
          console.error("Fallback también falló:", fallbackError);
          return NextResponse.json({ error: `Error en búsqueda: ${fallbackError.errorMessages?.[0] || "JQL inválido"}` }, { status: fallbackResponse.status });
        }

        const fallbackData = await fallbackResponse.json();
        return formatSearchResponse(fallbackData, startAt, maxResults);
      }
      return NextResponse.json({ error: `Error de JIRA (${response.status}): ${errorDetail}` }, { status: response.status });
    }

    const data = await response.json();
    return formatSearchResponse(data, startAt, maxResults);
  } catch (error) {
    console.error("Error en búsqueda JIRA:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Timeout: La búsqueda tardó demasiado" }, { status: 504 });
    }

    const errorMessage = error instanceof Error ? error.message : "Error interno en la búsqueda";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

interface JiraSearchResponse {
  issues: Array<{
    key: string;
    fields: {
      summary: string;
      status?: { name: string; statusCategory?: { key: string } };
      assignee?: { displayName: string; avatarUrls?: { "24x24": string } };
      issuetype?: { name: string; iconUrl?: string };
      priority?: { name: string };
      updated?: string;
    };
  }>;
  total: number;
  startAt: number;
  maxResults: number;
}

function formatSearchResponse(data: JiraSearchResponse, startAt: number, maxResults: number) {
  return NextResponse.json({
    issues: data.issues.map(issue => ({
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status?.name || "Unknown",
      statusCategory: issue.fields.status?.statusCategory?.key || "undefined",
      assignee: issue.fields.assignee?.displayName,
      assigneeAvatar: issue.fields.assignee?.avatarUrls?.["24x24"],
      issueType: issue.fields.issuetype?.name,
      issueTypeIcon: issue.fields.issuetype?.iconUrl,
      priority: issue.fields.priority?.name,
      updated: issue.fields.updated,
    })),
    total: data.total,
    startAt: startAt,
    maxResults: maxResults,
  });
}
