// src/app/api/reports/route.ts
// API para gestionar reportes en Supabase

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/reports - Listar reportes del usuario
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "Se requiere autenticación" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const search = searchParams.get("search") || "";
    const jiraCode = searchParams.get("jiraCode") || "";

    let query = supabase
      .from("reports")
      .select("*", { count: "exact" })
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrar por código JIRA si se proporciona
    if (jiraCode) {
      query = query.eq("jira_code", jiraCode);
    }

    // Búsqueda por texto
    if (search) {
      query = query.or(`title.ilike.%${search}%,jira_code.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching reports:", error);
      return NextResponse.json(
        { error: "Error al obtener reportes" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reports: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error("Error in GET /api/reports:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/reports - Crear nuevo reporte
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "Se requiere autenticación" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      jiraCode,
      title,
      formData,
      hiddenFields,
      parsedData,
      reportContent,
      metadata,
      jiraCommentId,
    } = body;

    // Validar campos requeridos
    if (!jiraCode || !title || !formData || !parsedData || !reportContent) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("reports")
      .insert({
        user_email: userEmail,
        jira_code: jiraCode,
        title,
        form_data: formData,
        hidden_fields: hiddenFields || {},
        parsed_data: parsedData,
        report_content: reportContent,
        metadata: metadata || {},
        jira_comment_id: jiraCommentId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating report:", error);
      return NextResponse.json(
        { error: "Error al crear reporte" },
        { status: 500 }
      );
    }

    return NextResponse.json({ report: data }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/reports:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
