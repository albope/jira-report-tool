"use client";

import HeaderNav from "@/components/HeaderNav";

export default function ReleaseNotesPage() {
  return (
    <>
      <HeaderNav />
      <main className="pt-20 p-8 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded shadow p-6 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Generador de Reportes JIRA — Release Notes
          </h1>
          <p className="text-gray-500">Última actualización: Marzo 2025</p>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-800">Versión 1.0.0</h2>
            <ul className="list-disc list-inside text-gray-600 leading-relaxed">
              <li>Primera versión inicial del Generador de Reportes JIRA.</li>
              <li>
                Se añade el formulario de pasos (Paso 1, Paso 2 y Paso 3) con la 
                capacidad de generar reportes en formato Markdown y exportar a Word.
              </li>
              <li>
                Botón flotante de <strong>Feedback + Bugs</strong> para 
                que los usuarios reporten incidencias y sugerencias.
              </li>
              <li>
                Se incluye la sección de Ayuda con instrucciones detalladas 
                y esta página de Release Notes.
              </li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}