// src/app/api/jira-status/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint para verificar si la API de JIRA está configurada.
 *
 * Dos modos de uso:
 * 1. Sin headers: Verifica si hay credenciales en env vars (legacy)
 * 2. Con headers: Verifica las credenciales del usuario contra la API de JIRA
 *
 * Headers soportados:
 * - X-Jira-Domain: Dominio de JIRA
 * - X-Jira-Email: Email de Atlassian
 * - X-Jira-Token: API Token
 */
export async function GET(req: NextRequest) {
  // Obtener credenciales de headers (prioridad) o env vars
  const headerDomain = req.headers.get("X-Jira-Domain");
  const headerEmail = req.headers.get("X-Jira-Email");
  const headerToken = req.headers.get("X-Jira-Token");

  const envDomain = process.env.JIRA_DOMAIN;
  const envEmail = process.env.JIRA_EMAIL;
  const envToken = process.env.JIRA_TOKEN;

  // Si hay headers, verificar las credenciales contra JIRA
  if (headerDomain && headerEmail && headerToken) {
    return verifyCredentials(headerDomain, headerEmail, headerToken);
  }

  // Si no hay headers, solo reportar estado de env vars
  const isConfigured = Boolean(envToken && envEmail && envDomain);

  return NextResponse.json({
    configured: isConfigured,
    domain: isConfigured ? envDomain : null,
    source: "env",
  });
}

/**
 * Verifica las credenciales contra la API de JIRA
 */
async function verifyCredentials(domain: string, email: string, token: string) {
  const authString = Buffer.from(`${email}:${token}`).toString("base64");

  try {
    // Llamar al endpoint /myself para verificar autenticación
    const response = await fetch(`https://${domain}/rest/api/3/myself`, {
      headers: {
        "Authorization": `Basic ${authString}`,
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({
          error: "Credenciales inválidas. Verifica tu email y API token.",
          configured: false,
        }, { status: 401 });
      }
      if (response.status === 403) {
        return NextResponse.json({
          error: "Acceso denegado. Tu token puede no tener los permisos necesarios.",
          configured: false,
        }, { status: 403 });
      }
      if (response.status === 404) {
        return NextResponse.json({
          error: "Dominio JIRA no encontrado. Verifica que el dominio sea correcto.",
          configured: false,
        }, { status: 404 });
      }
      return NextResponse.json({
        error: `Error de JIRA: ${response.status}`,
        configured: false,
      }, { status: response.status });
    }

    const userData = await response.json();

    return NextResponse.json({
      configured: true,
      domain: domain,
      user: {
        displayName: userData.displayName,
        emailAddress: userData.emailAddress,
      },
      source: "user",
    });
  } catch (error) {
    // Error de red o dominio inválido
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";

    if (errorMessage.includes("ENOTFOUND") || errorMessage.includes("getaddrinfo")) {
      return NextResponse.json({
        error: "No se pudo conectar al dominio JIRA. Verifica que el dominio sea correcto.",
        configured: false,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: "Error al conectar con JIRA: " + errorMessage,
      configured: false,
    }, { status: 500 });
  }
}
