// src/app/api/jira-comment/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint para crear o actualizar comentarios en JIRA.
 *
 * POST - Crear un nuevo comentario
 * PUT - Actualizar un comentario existente
 *
 * Body:
 * - issueKey: Clave del issue (requerido)
 * - comment: Contenido del comentario (requerido)
 * - commentId: ID del comentario a actualizar (solo para PUT)
 *
 * Headers:
 * - X-Jira-Domain
 * - X-Jira-Email
 * - X-Jira-Token
 */

interface CommentRequestBody {
  issueKey: string;
  comment: string;
  commentId?: string;
}

export async function POST(req: NextRequest) {
  return handleComment(req, "POST");
}

export async function PUT(req: NextRequest) {
  return handleComment(req, "PUT");
}

async function handleComment(req: NextRequest, method: "POST" | "PUT") {
  // Obtener credenciales
  const headerDomain = req.headers.get("X-Jira-Domain");
  const headerEmail = req.headers.get("X-Jira-Email");
  const headerToken = req.headers.get("X-Jira-Token");

  const domain = headerDomain || process.env.JIRA_DOMAIN;
  const email = headerEmail || process.env.JIRA_EMAIL;
  const token = headerToken || process.env.JIRA_TOKEN;

  if (!domain || !email || !token) {
    return NextResponse.json({
      success: false,
      error: "Configuración JIRA incompleta"
    }, { status: 500 });
  }

  // Parsear body
  let body: CommentRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({
      success: false,
      error: "Body inválido"
    }, { status: 400 });
  }

  const { issueKey, comment, commentId } = body;

  if (!issueKey) {
    return NextResponse.json({
      success: false,
      error: "Se requiere el código del issue (issueKey)"
    }, { status: 400 });
  }

  if (!comment) {
    return NextResponse.json({
      success: false,
      error: "Se requiere el contenido del comentario"
    }, { status: 400 });
  }

  if (method === "PUT" && !commentId) {
    return NextResponse.json({
      success: false,
      error: "Se requiere commentId para actualizar"
    }, { status: 400 });
  }

  const authString = Buffer.from(`${email}:${token}`).toString("base64");

  try {
    let url: string;
    let httpMethod: string;

    if (method === "PUT" && commentId) {
      // Actualizar comentario existente
      url = `https://${domain}/rest/api/3/issue/${issueKey}/comment/${commentId}`;
      httpMethod = "PUT";
    } else {
      // Crear nuevo comentario
      url = `https://${domain}/rest/api/3/issue/${issueKey}/comment`;
      httpMethod = "POST";
    }

    const response = await fetch(url, {
      method: httpMethod,
      headers: {
        "Authorization": `Basic ${authString}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: comment,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({
          success: false,
          error: "Credenciales JIRA inválidas"
        }, { status: 401 });
      }
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: method === "PUT"
            ? `Comentario o issue no encontrado: ${issueKey}`
            : `Issue no encontrado: ${issueKey}`
        }, { status: 404 });
      }
      if (response.status === 403) {
        return NextResponse.json({
          success: false,
          error: "No tienes permisos para comentar en este issue"
        }, { status: 403 });
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        error: errorData.errorMessages?.[0] || `Error de JIRA: ${response.status}`
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      commentId: data.id,
      created: data.created,
      updated: data.updated,
      author: {
        displayName: data.author?.displayName,
        emailAddress: data.author?.emailAddress,
      },
    });
  } catch (error) {
    console.error("Error al crear/actualizar comentario:", error);
    return NextResponse.json({
      success: false,
      error: "Error interno al procesar el comentario"
    }, { status: 500 });
  }
}
