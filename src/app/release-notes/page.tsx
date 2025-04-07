// app/release-notes/page.tsx
"use client";

import HeaderNav from "@/components/HeaderNav";

export default function ReleaseNotesPage() {
  return (
    <>
      <HeaderNav />
      <main className="pt-20 p-8 min-h-screen bg-gray-50">
        <div
          className="
            max-w-3xl mx-auto
            bg-gradient-to-br from-white via-blue-50 to-white
            shadow-lg
            rounded-lg
            p-8
            space-y-6
            relative
            z-10
          "
        >
          <h1 className="text-3xl font-bold text-gray-800">
            Generador de Reportes JIRA — Release Notes
          </h1>

          {/* NUEVA SECCIÓN: VERSIÓN 1.2.0 */}
          <section className="space-y-3">
            <p className="text-gray-500">Última actualización: 4 Abril 2025</p>
            <h2 className="text-2xl font-semibold text-gray-800">
              Versión 1.2.0
            </h2>
            <ul className="list-disc list-inside text-gray-600 leading-relaxed">
<<<<<<< HEAD
              <li>🆕 Se añade la nueva sección <strong>Datos de Prueba</strong> tras la Batería de Pruebas, donde se describen parámetros, datos de entrada y configuración de pruebas.</li>
              <li>📋 La sección Datos de Prueba se incluye automáticamente tanto en el reporte generado en formato Markdown como en la exportación a Word.</li>
              <li>⚠️ Validación lógica: el número de <strong>Pruebas Exitosas</strong> y <strong>Pruebas Fallidas</strong> no puede superar el <strong>Total de Pruebas</strong>. Se muestra una alerta si se incumple.</li>
              <li>🛠️ Se refactoriza el componente de paso 2 para incluir validación inteligente del resumen de resultados y mayor control sobre cambios de estado.</li>
=======
              <li>
                Se añade la funcionalidad de <strong>importar Fichero Excel </strong> para añadir casos de prueba ya creados en un fichero Excel.
              </li>
              <li>
                Se incluye la columna <strong>Descripción</strong> en la Batería
                de Pruebas, reflejada en el reporte Markdown y en la
                exportación a Word.
              </li>
              <li>
                Ajustes menores de validación y supresión de advertencias sobre
                referencias en React.
              </li>
>>>>>>> nuevas-funcionalidades
            </ul>
          </section>

          {/* VERSIÓN 1.1.0 */}
          <section className="space-y-3">
            <p className="text-gray-500">Última actualización: 27 Marzo 2025</p>
            <h2 className="text-2xl font-semibold text-gray-800">
              Versión 1.1.0
            </h2>
            <ul className="list-disc list-inside text-gray-600 leading-relaxed">
              <li>
                Se añade la nueva sección <strong>Datos de Prueba</strong> tras
                la Batería de Pruebas, donde se describen parámetros, datos de
                entrada y configuración de pruebas.
              </li>
              <li>
                La sección "Datos de Prueba" se incluye automáticamente tanto en
                el reporte generado en formato Markdown como en la exportación a
                Word.
              </li>
              <li>
                Validación lógica: el número de{" "}
                <strong>Pruebas Exitosas</strong> y{" "}
                <strong>Pruebas Fallidas</strong> no puede superar el{" "}
                <strong>Total de Pruebas</strong>. Se muestra una alerta si se
                incumple.
              </li>
              <li>
                Se refactoriza el componente de paso 2 para incluir validación
                inteligente del resumen de resultados y mayor control sobre
                cambios de estado.
              </li>
            </ul>
          </section>

          {/* VERSIÓN 1.0.0 */}
          <section className="space-y-3">
            <p className="text-gray-500">Última actualización: 13 Marzo 2025</p>
            <h2 className="text-2xl font-semibold text-gray-800">
              Versión 1.0.0
            </h2>
            <ul className="list-disc list-inside text-gray-600 leading-relaxed">
              <li>
                Primera versión inicial del Generador de Reportes JIRA.
              </li>
              <li>
                Se añade el formulario de pasos (Paso 1, Paso 2 y Paso 3) con la
                capacidad de generar reportes en formato Markdown y exportar a
                Word.
              </li>
              <li>
                Botón flotante de <strong>Feedback + Bugs</strong> para que los
                usuarios reporten incidencias y sugerencias.
              </li>
              <li>
                Se incluye la sección de Ayuda con instrucciones detalladas y
                esta página de Release Notes.
              </li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}