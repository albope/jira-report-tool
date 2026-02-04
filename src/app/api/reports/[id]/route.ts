// src/app/api/reports/[id]/route.ts
// API para operaciones sobre un reporte específico

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/reports/[id] - Obtener un reporte específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userEmail = request.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "Se requiere autenticación" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .eq("user_email", userEmail)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Reporte no encontrado" },
          { status: 404 }
        );
      }
      console.error("Error fetching report:", error);
      return NextResponse.json(
        { error: "Error al obtener reporte" },
        { status: 500 }
      );
    }

    return NextResponse.json({ report: data });
  } catch (error) {
    console.error("Error in GET /api/reports/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/reports/[id] - Actualizar un reporte
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userEmail = request.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "Se requiere autenticación" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from("reports")
      .update({
        jira_code: body.jiraCode,
        title: body.title,
        form_data: body.formData,
        hidden_fields: body.hiddenFields,
        parsed_data: body.parsedData,
        report_content: body.reportContent,
        metadata: body.metadata,
        jira_comment_id: body.jiraCommentId,
      })
      .eq("id", id)
      .eq("user_email", userEmail)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Reporte no encontrado" },
          { status: 404 }
        );
      }
      console.error("Error updating report:", error);
      return NextResponse.json(
        { error: "Error al actualizar reporte" },
        { status: 500 }
      );
    }

    return NextResponse.json({ report: data });
  } catch (error) {
    console.error("Error in PUT /api/reports/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id] - Eliminar un reporte
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userEmail = request.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "Se requiere autenticación" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", id)
      .eq("user_email", userEmail);

    if (error) {
      console.error("Error deleting report:", error);
      return NextResponse.json(
        { error: "Error al eliminar reporte" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/reports/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
