// app/help/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react"; // Import useState y useEffect
import HeaderNav from "@/components/HeaderNav";
// Asumiendo que tienes Lucide Icons instalado y configurado para iconos
import { Search, AlertTriangle, CheckCircle, Info, ArrowUpCircle, ExternalLink } from 'lucide-react';


/* -------------------------------------------------------------------------- */
/* Página Help                                 */
/* -------------------------------------------------------------------------- */
export default function HelpPage() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <HeaderNav />

      <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-16"> {/* Aumentado space-y */}

          {/* ---------- Hero + CTA rápidas -------------------------------- */}
          <section className="text-center space-y-8"> {/* Aumentado space-y */}
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight"> {/* Aumentado tamaño */}
              Centro de Ayuda
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto"> {/* Aumentado tamaño y limitado ancho */}
              Encuentra guías, respuestas y consejos para sacar el máximo provecho a nuestra herramienta.
            </p>

            <div className="grid gap-8 sm:grid-cols-2"> {/* Aumentado gap */}
              <QuickStartCard
                title="Crear un JIRA"
                desc="Aprende a generar tickets JIRA estructurados y completos desde cero."
                href="/create-jira"
                icon={<Info size={28} className="text-blue-500" />} // Icono en lugar de emoji
              />
              <QuickStartCard
                title="Generar Reporte de Pruebas"
                desc="Descubre cómo crear reportes detallados a partir del contenido de un JIRA existente."
                href="/generate-report"
                icon={<CheckCircle size={28} className="text-green-500" />} // Icono en lugar de emoji
              />
            </div>
          </section>

          {/* ---------- Tabla de contenidos -------------------------------- */}
          <nav aria-label="Tabla de contenidos" className="p-6 bg-white rounded-xl shadow-lg"> {/* Estilo de card */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Search size={24} className="mr-3 text-blue-600"/> {/* Icono para el título */}
              Índice Detallado
            </h2>
            <ul className="space-y-2">
              {[
                { href: "#jira-guide", label: "A. Guía: Plantilla para crear un JIRA" },
                { href: "#report-guide", label: "B. Guía: Plantilla para reportar pruebas" },
                { href: "#faq", label: "C. Preguntas Frecuentes (FAQ)" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-blue-600 hover:text-blue-800 hover:underline text-lg py-1 flex items-center transition-colors">
                     <ExternalLink size={18} className="mr-2 opacity-70"/>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ================================================================= */}
          {/* A. CREAR UN JIRA                             */}
          {/* ================================================================= */}
          <HelpSection id="jira-guide" title="A. Crear un JIRA desde cero">
            <p className="text-gray-700 text-lg"> {/* Texto más grande */}
              Usa este formulario cuando la incidencia aún no existe en JIRA y
              necesitas documentarla completamente.
            </p>

            <SubStep number={1} title="Datos básicos">
              <FieldBullet name="Proyecto" note="Nombre del proyecto (i.e ATMV, MLO...)." />
              <FieldBullet name="Herramienta" note="Aplicativo o herramienta afectada." />
              <FieldBullet name="Descripción breve del error" note="Frase concisa describiendo el problema." />
              <ImageShow src="/help/jira-basic.png" alt="Paso 1 – Datos básicos" onImageClick={setLightboxImage} />
              <Tip type="info">
                El título final se genera automáticamente combinando estos tres
                campos: <em>PROYECTO – Herramienta – Descripción</em>.
              </Tip>
            </SubStep>

            <SubStep number={2} title="Detalle del problema">
              <FieldBullet name="Descripción del problema" note="Detallar el problema/error identificado de forma detallada." />
              <FieldBullet name="Pasos para reproducir" note="Describir los pasos llevados a cabo para reproducir el error." />
              <FieldBullet name="Resultado esperado" note="Describir lo que se esperaría si el comportamiento del aplicativo fuese correcto." />
              <FieldBullet name="Resultado real" note="Describir el comportamiento actual del aplicativo." />
              <FieldBullet name="Impacto del error" note="Selecciona Crítico / Alto / …" />
              <ImageShow src="/help/jira-problem.png" alt="Paso 2 – Detalle" onImageClick={setLightboxImage} />
            </SubStep>

            <SubStep number={3} title="Entorno de pruebas">
              <FieldBullet name="Servidor de pruebas" note="Nombre del servidor donde se han realizado las pruebas." />
              <FieldBullet name="IP Cliente" note="IP del servidor donde se han realizado las pruebas." />
              <FieldBullet name="Navegador" note="Chrome, Edge, Mozilla..." />
              <FieldBullet name="Base de datos" note="Selecciona la BD sobre la que se han realizado las pruebas." />
              <FieldBullet name="Entorno" note="Desarrollo / UAT / PRE / PROD…" />
              <Tip type="warning">
                Haz clic en «✕» en el formulario de creación para ocultar un campo de entorno que no aplique a tu caso.
              </Tip>
            </SubStep>

            <SubStep number={4} title="Versiones y campos extra">
              <FieldBullet name="Versiones de aplicativos/componentes" note="Añade tantas como necesites." />
              <FieldBullet name="Campos personalizados" note="Introduce el campo y contenido que desees para el entorno." />
            </SubStep>

            <SubStep number={5} title="Finalizar">
              <p className="text-gray-700">
                Usa <strong>Copiar contenido del JIRA</strong> para enviar el
                texto a JIRA, o <strong>Reiniciar formulario</strong> si deseas
                empezar de nuevo.
              </p>
              <Tip type="success">
                La sección <em>Evidencias</em> se añade automáticamente al
                final del contenido copiado para que puedas adjuntar capturas, logs, etc., directamente en JIRA.
              </Tip>
            </SubStep>
          </HelpSection>

          {/* ================================================================= */}
          {/* B. REPORTE DE PRUEBAS                             */}
          {/* ================================================================= */}
          <HelpSection id="report-guide" title="B. Reporte de pruebas (JIRA existente)">
            <p className="text-gray-700 text-lg">
              Empléalo cuando el ticket ya existe en JIRA y quieres documentar
              las pruebas realizadas.
            </p>

            <SubStep number={1} title="Pegar contenido del JIRA">
              <p className="text-gray-700">
                Copia todo el cuerpo del ticket y pégalo en el cuadro “Paso 1”. También puedes introducir el código del JIRA para obtener el título automáticamente.
              </p>
              <ImageShow src="/help/report-paste.png" alt="Reporte Paso 1" onImageClick={setLightboxImage} />
            </SubStep>

            <SubStep number={2} title="Completar información de pruebas">
              <FieldBullet name="Fecha de prueba" />
              <FieldBullet name="Tester" />
              <FieldBullet name="Entorno de pruebas completo" />
              <FieldBullet name="Versiones de aplicativos/componentes" />
              <FieldBullet name="Batería / Casos de prueba detallados" />
              <Tip type="info">
                Todos los campos son opcionales, pero completarlos mejora la trazabilidad
                para auditorías y facilita a desarrollo la identificación de errores.
              </Tip>
            </SubStep>

            <SubStep number={3} title="Generar y exportar">
              <p className="text-gray-700">
                Verifica el Markdown y usa el botón <strong>Copiar y Exportar a Word</strong>. Esto te proporcionará:
              </p>
              <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                <li>El contenido en formato Markdown copiado a tu portapapeles, listo para pegar como comentario en JIRA.</li>
                <li>Un archivo `.docx` (Word) descargado, que puedes adjuntar al ticket de JIRA como evidencia formal.</li>
              </ul>
              <ImageShow src="/help/report-export.png" alt="Reporte Paso 3" onImageClick={setLightboxImage} />
            </SubStep>
          </HelpSection>

          {/* ================================================================= */}
          {/* FAQ ------------------------------------------------------------ */}
          <HelpSection id="faq" title="C. Preguntas Frecuentes (FAQ)">
            <FAQItem question="¿Cuándo debo usar Crear un JIRA y cuándo Generar un reporte?">
              <p>
                <strong>Crear un JIRA:</strong> Utiliza esta opción cuando la incidencia aún no existe en JIRA y necesitas documentarla desde cero, incluyendo todos los detalles técnicos, pasos para reproducir, impacto y entorno de pruebas. Es ideal para reportar nuevos bugs o proponer nuevas tareas.
              </p>
              <p className="mt-2">
                <strong>Generar un reporte:</strong> Usa esta opción cuando el JIRA ya está creado (por ti o por otra persona) y necesitas añadir un comentario formal sobre las pruebas realizadas, validar funcionalidades, documentar la evolución de un error, o adjuntar un informe de pruebas completo. Esta opción es clave para la trazabilidad y auditorías.
              </p>
            </FAQItem>

            <FAQItem question="¿Cómo puedo asegurarme de que mi reporte sea claro y completo?">
              <ul className="list-disc list-inside space-y-1">
                <li>Incluye siempre <strong>pasos detallados</strong> para reproducir el error.</li>
                <li>Añade <strong>versiones exactas</strong> de los componentes para evitar ambigüedades.</li>
                <li>Describe tanto el <strong>resultado esperado</strong> como el <strong>resultado real</strong> de forma concisa.</li>
                <li>Usa <strong>capturas y logs</strong> en la sección de Evidencias para aportar contexto visual y técnico.</li>
                <li>Verifica que el impacto esté correctamente clasificado (<strong>Crítico</strong>, <strong>Alto</strong>, <strong>Medio</strong>, <strong>Bajo</strong>, <strong>Visual</strong>, <strong>Mejora</strong>).</li>
                <li>Si generas un reporte sobre un JIRA existente, asegúrate de que tu reporte añade valor y actualiza el estado de las pruebas.</li>
              </ul>
            </FAQItem>
             <FAQItem question="¿Puedo personalizar los campos del entorno en los reportes?">
              <p>
                ¡Sí! Tanto en la creación de un nuevo JIRA como en la generación de reportes sobre JIRAs existentes, puedes añadir "Campos Personalizados del Entorno". Esto te permite incluir cualquier información específica de tu entorno que no esté cubierta por los campos estándar (ej. "Versión del Driver X", "Configuración Específica Y"). Estos campos aparecerán en la sección "Entorno de Pruebas" de tu reporte.
              </p>
            </FAQItem>
            <FAQItem question="¿Qué hago si la obtención automática del título del JIRA falla?">
                <p>
                    Si al introducir el código del JIRA en el "Paso 1" del generador de reportes la herramienta no puede obtener el título automáticamente (por ejemplo, debido a problemas de conexión, permisos, o si el JIRA no existe), no te preocupes.
                </p>
                <p className="mt-2">
                    La aplicación te mostrará un mensaje de error y habilitará un área de texto para que puedas pegar manualmente el contenido completo de tu JIRA. Aunque el título no se cargue, podrás continuar con el proceso de generación del reporte introduciendo los datos manualmente.
                </p>
            </FAQItem>
          </HelpSection>


          {/* Footer contactos -------------------------------------------- */}
          <div className="text-center text-sm text-gray-500 pt-12 border-t border-gray-200"> {/* Aumentado padding y separación */}
            ¿Necesitas ayuda adicional o tienes alguna sugerencia? Usa el botón flotante “Feedback + Bugs”
            o escribe a&nbsp;
            <a href="mailto:abort.etraid@grupoetra.com" className="text-blue-600 hover:underline">
              abort.etraid@grupoetra.com
            </a>.
          </div>
        </div>
      </main>

      {/* Lightbox Modal para Imágenes */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4"
          onClick={() => setLightboxImage(null)}
        >
          <Image
            src={lightboxImage}
            alt="Vista ampliada"
            width={1200} // Ajusta según necesidad
            height={800} // Ajusta según necesidad
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Evita que el clic en la imagen cierre el modal
          />
        </div>
      )}
      
      {/* Botón Volver Arriba */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-opacity duration-300 z-50"
          title="Volver arriba"
        >
          <ArrowUpCircle size={24} />
        </button>
      )}
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
  icon, // Cambiado de emoji a icon
}: {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode; // Tipo para el icono
}) {
  return (
    <Link
      href={href}
      className="
        flex flex-col items-center text-center
        bg-white hover:bg-blue-50
        border border-gray-200 hover:border-blue-300
        rounded-xl p-8 shadow-md hover:shadow-lg 
        transition-all duration-300 transform hover:-translate-y-1
      "
    >
      <div className="mb-4 p-3 bg-blue-100 rounded-full">{icon}</div> {/* Estilo para el contenedor del icono */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h3> {/* Aumentado tamaño */}
      <p className="text-gray-600 text-base flex-1 mb-4">{desc}</p> {/* Aumentado tamaño */}
      <span className="mt-auto inline-flex items-center text-blue-600 font-semibold group">
        Abrir Guía
        <ExternalLink size={18} className="ml-2 group-hover:translate-x-1 transition-transform"/>
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
    <section id={id} className="space-y-8 p-6 bg-white rounded-xl shadow-lg"> {/* Estilo card y aumentado space-y */}
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-4 mb-6"> {/* Aumentado tamaño y separador */}
        {title}
      </h2>
      <div className="space-y-6"> {/* Contenedor para los children con espacio */}
        {children}
      </div>
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
    <div className="space-y-4 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg"> {/* Estilo más marcado */}
      <h3 className="text-2xl font-semibold text-blue-700"> {/* Color y tamaño */}
        Paso {number}. {title}
      </h3>
      <div className="prose prose-sm sm:prose max-w-none text-gray-700"> {/* Mejoras para el contenido */}
         {children}
      </div>
    </div>
  );
}

function FieldBullet({ name, note }: { name: string; note?: string }) {
  return (
    <p className="flex items-start text-gray-700 text-base my-2"> {/* Aumentado tamaño y margen */}
      <span className="mt-1 mr-3 text-blue-600">
        <CheckCircle size={18}/> {/* Icono en lugar de bullet */}
      </span>
      <span>
        <strong className="font-semibold text-gray-800">{name}</strong>
        {note && <span className="text-gray-600"> — {note}</span>}
      </span>
    </p>
  );
}

// Tip Componente Mejorado
type TipType = "info" | "warning" | "success" | "danger";

const tipStyles: Record<TipType, { icon: React.ReactNode; border: string; bg: string; text: string }> = {
  info: { icon: <Info size={20} />, border: "border-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  warning: { icon: <AlertTriangle size={20} />, border: "border-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700" },
  success: { icon: <CheckCircle size={20} />, border: "border-green-500", bg: "bg-green-50", text: "text-green-700" },
  danger: { icon: <AlertTriangle size={20} />, border: "border-red-500", bg: "bg-red-50", text: "text-red-700" },
};

function Tip({ children, type = "info" }: { children: React.ReactNode; type?: TipType }) {
  const style = tipStyles[type];
  return (
    <div className={`border-l-4 ${style.border} ${style.bg} p-4 rounded-md my-4 shadow-sm flex items-start`}>
      <div className={`mr-3 flex-shrink-0 ${style.text}`}>{style.icon}</div>
      <div className={`text-sm ${style.text}`}>
        {children}
      </div>
    </div>
  );
}

// Componente para mostrar imágenes con funcionalidad de clic para lightbox
function ImageShow({ src, alt, onImageClick }: { src: string; alt: string; onImageClick: (src: string) => void; }) {
  return (
    <div className="my-6 text-center"> {/* Margen y centrado */}
      <Image
        src={src}
        alt={alt}
        width={800} 
        height={450}
        className="rounded-lg border-2 border-gray-200 shadow-md hover:shadow-xl transition-shadow cursor-pointer mx-auto"
        onClick={() => onImageClick(src)}
      />
      <p className="text-xs text-gray-500 mt-2 italic">{alt} (Haz clic para ampliar)</p>
    </div>
  );
}

// Componente para items de FAQ
function FAQItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <summary className="font-semibold text-lg text-gray-800 cursor-pointer list-none flex justify-between items-center group-hover:text-blue-600">
        {question}
        <span className="text-blue-500 transform transition-transform duration-300 group-open:rotate-180">
          <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
      </summary>
      <div className="mt-3 pt-3 border-t border-gray-200 text-gray-700 text-base space-y-2">
        {children}
      </div>
    </details>
  );
}