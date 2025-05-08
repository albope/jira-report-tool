// app/help/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import HeaderNav from "@/components/HeaderNav";

/* -------------------------------------------------------------------------- */
/*                                Página Help                                 */
/* -------------------------------------------------------------------------- */
export default function HelpPage() {
  return (
    <>
      <HeaderNav />

      <main className="pt-24 pb-20 px-6 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-14">

          {/* ---------- Hero + CTA rápidas -------------------------------- */}
          <section className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-gray-900">
              Guía de Inicio Rápido
            </h1>
            <p className="text-lg text-gray-700">
              Selecciona tu flujo y sigue los pasos detallados.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              <QuickStartCard
                title="Crear un JIRA"
                desc="Genera título + contenido con todos los campos requeridos."
                href="/create-jira"
                emoji="📝"
              />
              <QuickStartCard
                title="Reporte de pruebas"
                desc="Crea reportes de pruebas a partir del contenido de un JIRA."
                href="/generate-report"
                emoji="🔍"
              />
            </div>
          </section>

          {/* ---------- Tabla de contenidos -------------------------------- */}
          <nav aria-label="Tabla de contenidos" className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800">
              Índice detallado
            </h2>
            <ul className="list-disc list-inside text-blue-600 space-y-1">
              <li><Link href="#jira-guide">A. Guía: Plantilla para crear un JIRA</Link></li>
              <li><Link href="#report-guide">B. Guía: Plantilla para reportar pruebas</Link></li>
              <li><Link href="#faq">Preguntas Frecuentes</Link></li>
            </ul>
          </nav>

          {/* ================================================================= */}
          {/*                       A. CREAR UN JIRA                             */}
          {/* ================================================================= */}
          <HelpSection id="jira-guide" title="A. Crear un JIRA desde cero">
            <p className="text-gray-700">
              Usa este formulario cuando la incidencia aún no existe en JIRA y
              necesitas documentarla completamente.
            </p>

            {/* --- Paso 1 -------------------------------------------------- */}
            <SubStep number={1} title="Datos básicos">
              <FieldBullet name="Proyecto" note="Nombre del proyecto (i.e ATMV, MLO...)." />
              <FieldBullet name="Herramienta" note="Aplcativo o herramienta afectada." />
              <FieldBullet name="Descripción breve del error" note="Frase concisa describiendo el problema." />
              <ImageShow src="/help/jira-basic.png" alt="Paso 1 – Datos básicos" />

              <Tip>
                El título final se genera automáticamente combinando estos tres
                campos: <em>PROYECTO – Herramienta – Descripción</em>.
              </Tip>
            </SubStep>

            {/* --- Paso 2 -------------------------------------------------- */}
            <SubStep number={2} title="Detalle del problema">
              <FieldBullet name="Descripción del problema" note="Detallar el problema/ error identifcado de forma detallada" />
              <FieldBullet name="Pasos para reproducir" note="Describir los pasos llevados a cabo para reproducir el error" />
              <FieldBullet name="Resultado esperado" note="Describir lo que se esperaría si el comportamiento del aplicativo fuese correcto" />
              <FieldBullet name="Resultado real" note="Describir el comportamiento actual del aplicativo" />
              <FieldBullet name="Impacto del error" note="Selecciona Crítico / Alto / …" />
              <ImageShow src="/help/jira-problem.png" alt="Paso 2 – Detalle" />
            </SubStep>

            {/* --- Paso 3 -------------------------------------------------- */}
            <SubStep number={3} title="Entorno de pruebas">
              <FieldBullet name="Servidor de pruebas" note="Nombre del servidor donde se han realizado las pruebas" />
              <FieldBullet name="IP Cliente" note="IP del servidor donde se han realizado las pruebas" />
              <FieldBullet name="Navegador" note="Chrome, Edge, Mozilla..." />
              <FieldBullet name="Base de datos" note="Selecciona la BD sobre la que se han realizado las pruebas" />
              <FieldBullet name="Entorno" note="Desarrollo / UAT / PRE / PROD…" />
              <Tip>
                Haz clic en «✕» para ocultar un campo que no aplique.
              </Tip>
            </SubStep>

            {/* --- Paso 4 -------------------------------------------------- */}
            <SubStep number={4} title="Versiones y campos extra">
              <FieldBullet name="Versiones de aplicativos/componentes" note="Añade tantas como necesites." />
              <FieldBullet name="Campos personalizados" note="Introduce el campo y contenido que desees" />
            </SubStep>

            {/* --- Paso 5 -------------------------------------------------- */}
            <SubStep number={5} title="Finalizar">
              <p className="text-gray-700">
                Usa <strong>Copiar contenido del JIRA</strong> para enviar el
                texto a JIRA, o <strong>Reiniciar formulario</strong> si deseas
                empezar de nuevo.
              </p>
              <Tip>
                La sección <em>Evidencias</em> se añade automáticamente al
                final para que subas capturas, logs, etc.
              </Tip>
            </SubStep>
          </HelpSection>

          {/* ================================================================= */}
          {/*                  B. REPORTE DE PRUEBAS                             */}
          {/* ================================================================= */}
          <HelpSection id="report-guide" title="B. Reporte de pruebas (sobre un JIRA ya creado)">
            <p className="text-gray-700">
              Empléalo cuando el ticket ya existe en JIRA y quieres documentar
              las pruebas realizadas.
            </p>

            {/* Report – Paso 1 ------------------------------------------- */}
            <SubStep number={1} title="Pegar contenido del JIRA">
              <p className="text-gray-700">
                Copia todo el cuerpo del ticket y pégalo en el cuadro “Paso 1”.
              </p>
              <ImageShow src="/help/report-paste.png" alt="Reporte Paso 1" />
            </SubStep>

            {/* Report – Paso 2 ------------------------------------------- */}
            <SubStep number={2} title="Completar información de pruebas">
              <FieldBullet name="Fecha de prueba" />
              <FieldBullet name="Tester" />
              <FieldBullet name="Entorno" />
              <FieldBullet name="Versiones de aplicativos/componentes" />
              <FieldBullet name="Batería / Caso de prueba" />
              <Tip>
                Todos los campos son opcionales, pero mejoran la trazabilidad
                para auditorías y para que desarrollo pueda identificar los errores reportados de manera sencilla.
              </Tip>
            </SubStep>

            {/* Report – Paso 3 ------------------------------------------- */}
            <SubStep number={3} title="Generar y exportar">
              <p className="text-gray-700">
                Verifica el Markdown y usa:
              </p>
              <ul className="list-disc list-inside ml-4 text-gray-700">
                <li><strong>Copiar y Exportar a Word</strong> – Para generar tanto un documento word que pode adjuntar al JIRA como un comentario en formato markdown</li>
              </ul>
              <ImageShow src="/help/report-export.png" alt="Reporte Paso 3" />
            </SubStep>
          </HelpSection>

          {/* ================================================================= */}
          {/* FAQ ------------------------------------------------------------ */}
          <HelpSection id="faq" title="Preguntas frecuentes">
            <details className="mb-3">
              <summary className="font-medium cursor-pointer">
                ¿Cuándo debo usar Crear un JIRA y cuándo Generar un reporte?
              </summary>
              <p className="mt-2 text-sm text-gray-700">
                <strong>Crear un JIRA:</strong> Utiliza esta opción cuando la incidencia aún no existe en JIRA y necesitas documentarla desde cero, incluyendo todos los detalles técnicos, pasos para reproducir, impacto y entorno de pruebas.
                <br />
                <br />
                <strong>Generar un reporte:</strong> Usa esta opción cuando el JIRA ya está creado y necesitas añadir pruebas realizadas, validar funcionalidades nuevas o documentar la evolución de un error. Esta opción es ideal para crear trazabilidad y facilitar auditorías.
              </p>
            </details>

            <details>
              <summary className="font-medium cursor-pointer">
                ¿Cómo puedo asegurarme de que mi reporte sea claro y completo?
              </summary>
              <p className="mt-2 text-sm text-gray-700">
                - Incluye siempre <strong>pasos detallados</strong> para reproducir el error.
                <br />
                - Añade <strong>versiones exactas</strong> de los componentes para evitar ambigüedades.
                <br />
                - Describe tanto el <strong>resultado esperado</strong> como el <strong>resultado real</strong>.
                <br />
                - Usa <strong>capturas y logs</strong> en la sección de Evidencias para aportar contexto.
                <br />
                - Verifica que el impacto esté correctamente clasificado (<strong>Crítico</strong>, <strong>Alto</strong>, <strong>Medio</strong>, <strong>Bajo</strong>, <strong>Visual</strong>, <strong>Mejora</strong>).
              </p>
            </details>
          </HelpSection>


          {/* Footer contactos -------------------------------------------- */}
          <div className="text-center text-sm text-gray-500 pt-8 border-t">
            ¿Necesitas ayuda adicional? Usa el botón flotante “Feedback + Bugs”
            o escribe a&nbsp;
            <a href="mailto:abort.etraid@grupoetra.com" className="underline">
              abort.etraid@grupoetra.com
            </a>.
          </div>
        </div>
      </main>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* ---------------------------- Sub-componentes ----------------------------- */
/* -------------------------------------------------------------------------- */

function QuickStartCard({
  title,
  desc,
  href,
  emoji,
}: {
  title: string;
  desc: string;
  href: string;
  emoji: string;
}) {
  return (
    <Link
      href={href}
      className="
        flex flex-col justify-between
        bg-white hover:bg-blue-50
        border border-gray-200 hover:border-blue-300
        rounded-lg p-6 shadow
        transition
      "
    >
      <div className="text-4xl mb-2">{emoji}</div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 text-sm flex-1">{desc}</p>
      <span className="mt-4 inline-block self-start text-blue-600 font-medium">
        Abrir →
      </span>
    </Link>
  );
}

function HelpSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function SubStep({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-gray-800">
        Paso {number}. {title}
      </h3>
      {children}
    </div>
  );
}

function FieldBullet({ name, note }: { name: string; note?: string }) {
  return (
    <p className="flex items-start text-gray-700 text-sm">
      <span className="mt-0.5 mr-2 text-blue-600">•</span>
      <span>
        <strong>{name}</strong>
        {note && <> — {note}</>}
      </span>
    </p>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-100/60 border-l-4 border-blue-400 p-4 rounded">
      <p className="text-sm text-gray-800">{children}</p>
    </div>
  );
}

function ImageShow({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={900}
      height={480}
      className="rounded border"
    />
  );
}