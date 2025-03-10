// app/help/page.tsx
"use client";

import HeaderNav from "@/components/HeaderNav";

export default function HelpPage() {
  return (
    <>
      <HeaderNav />
      {/* Mantener padding top para no solapar con el Header fijo */}
      <main className="pt-20 p-8 min-h-screen bg-gray-50">
        {/* Caja con degradado */}
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
          <h1 className="text-3xl font-bold text-gray-800">Ayuda y Guía de Uso</h1>

          <p className="text-gray-600 leading-relaxed">
            ¡Bienvenido a la sección de ayuda! Aquí encontrarás información detallada
            sobre cómo utilizar el Generador de Reportes JIRA de manera óptima.
          </p>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-800">1. Ingresar contenido de JIRA</h2>
            <p className="text-gray-600">
              Copia el contenido relevante de tu ticket o incidencia JIRA y pégalo en la
              sección "Paso 1". Asegúrate de incluir los campos más importantes: título,
              descripción, notas, etc.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-800">2. Completar Datos Adicionales</h2>
            <p className="text-gray-600">
              En "Paso 2", podrás configurar detalles como fecha de prueba,
              versiones del sistema, entorno, batería de pruebas y mucho más.
              <br />
              - <strong>Fecha de Prueba:</strong> Selecciona la fecha en la que
              realizaste las pruebas.<br />
              - <strong>Tester:</strong> Ingresa tu nombre o iniciales.<br />
              - <strong>Entorno:</strong> Indica si estás en un ambiente de
              Transferencia, PRE, PROD, etc.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-800">3. Generar Reporte</h2>
            <p className="text-gray-600">
              Una vez completados los campos, haz clic en "Generar Reporte".
              Serás dirigido a "Paso 3", donde podrás ver y revisar el reporte
              final en formato Markdown.
            </p>
            <p className="text-gray-600">
              - <strong>Copiar al Portapapeles:</strong> Te permite copiar el reporte
              en texto plano para pegarlo donde desees (por ejemplo, en Confluence).
              <br />
              - <strong>Exportar:</strong> Opción para generar un archivo Word (.docx)
              con tablas nativas.
              <br />
              - <strong>Reiniciar:</strong> Limpia todos los campos y te lleva
              nuevamente al Paso 1.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-800">¿Dudas adicionales?</h2>
            <p className="text-gray-600">
              Si necesitas más detalles o tienes problemas al usar la herramienta,
              utiliza el botón flotante de “Feedback + Bugs” para enviar tus
              comentarios. ¡Gracias por utilizar nuestro Generador de Reportes!
            </p>
          </section>
        </div>
      </main>
    </>
  );
}