"use client";

import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav";

export default function Landing() {
  return (
    <>
      <HeaderNav />

      <main className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8">Herramienta de Reportes JIRA</h1>

        <div className="grid gap-6 w-full max-w-md">
          <Link
            href="/create-jira"
            className="block bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-lg shadow transition"
          >
            ➕ Crear un nuevo JIRA
          </Link>

          <Link
            href="/generate-report"
            className="block bg-green-600 hover:bg-green-700 text-white text-center py-4 rounded-lg shadow transition"
          >
            📝 Generar reporte de pruebas
          </Link>
        </div>
      </main>

      <FooterNav />
    </>
  );
}