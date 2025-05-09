"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import JiraPreview from "./JiraPreview";
import { Home } from "lucide-react";

/* ─────────────────── Tipos ─────────────────── */
type EnvHidden = {
  server: boolean;
  clientIP: boolean;
  browser: boolean;
  db: boolean;
  entorno: boolean;
};
type CustomField = { label: string; value: string };
type Version = { appName: string; appVersion: string };

/* ────────────────── Componente ────────────────── */
export default function CreateJiraForm() {
  const router = useRouter();

  /* ---------- 1. Estado principal ---------- */
  const [project, setProject] = useState("");
  const [tool, setTool] = useState("");
  const [errorDesc, setErrorDesc] = useState("");

  const [problem, setProblem] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [impact, setImpact] = useState("");

  /* Entorno genérico */
  const [env, setEnv] = useState({
    server: "",
    clientIP: "",
    browser: "",
    db: "",
    entorno: "",
  });
  const [hidden, setHidden] = useState<EnvHidden>({
    server: false,
    clientIP: false,
    browser: false,
    db: false,
    entorno: false,
  });

  /* Versiones */
  const [versions, setVersions] = useState<Version[]>([]);

  /* Campos APP */
  const [isApp, setIsApp] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [os, setOs] = useState("");
  const [device, setDevice] = useState("");
  const [preconds, setPreconds] = useState("");
  const [lang, setLang] = useState("");

  /* Campos personalizados */
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  /* Toast “copiado” */
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  /* ---------- 2. Helpers ---------- */
  const toCamel = (s: string) =>
    s
      .replace(/[^a-zA-ZÀ-ÿ0-9 ]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w, i) =>
        i === 0
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
      )
      .join("");

  const title = `${project.trim().toUpperCase()} - ${toCamel(
    tool.trim(),
  )} - ${errorDesc.trim()}`;

  const handleCopy = (
    txt: string,
    what: "Título copiado" | "Contenido copiado",
  ) => {
    navigator.clipboard.writeText(txt).then(() => showToast(what));
  };

  /* ---------- Pasos helpers ---------- */
  const addStep = () => setSteps([...steps, ""]);
  const changeStep = (idx: number, val: string) => {
    const next = [...steps];
    next[idx] = val;
    setSteps(next);
  };
  const removeStep = (idx: number) =>
    setSteps(steps.filter((_, i) => i !== idx));
  const reorder = (list: string[], start: number, end: number) => {
    const res = Array.from(list);
    const [moved] = res.splice(start, 1);
    res.splice(end, 0, moved);
    return res;
  };
  const onDragEnd = (r: DropResult) => {
    if (!r.destination) return;
    setSteps(reorder(steps, r.source.index, r.destination.index));
  };

  /* ---------- Versiones helpers ---------- */
  const handleVersionChange = (
    idx: number,
    field: keyof Version,
    val: string,
  ) => {
    const next = versions.map((v, i) =>
      i === idx ? { ...v, [field]: val } : v,
    );
    setVersions(next);
  };
  const addVersion = () =>
    setVersions([...versions, { appName: "", appVersion: "" }]);
  const removeVersion = (idx: number) =>
    setVersions(versions.filter((_, i) => i !== idx));

  /* ---------- Reinicio completo ---------- */
  const resetForm = () => {
    setProject("");
    setTool("");
    setErrorDesc("");

    setProblem("");
    setSteps([""]);
    setExpected("");
    setActual("");
    setImpact("");

    setEnv({ server: "", clientIP: "", browser: "", db: "", entorno: "" });
    setHidden({
      server: false,
      clientIP: false,
      browser: false,
      db: false,
      entorno: false,
    });

    setVersions([]);

    setIsApp(false);
    setEndpoint("");
    setOs("");
    setDevice("");
    setPreconds("");
    setLang("");

    setCustomFields([]);
  };

  /* ---------- Contenido JIRA ---------- */
  const buildContent = () => {
    const bold = (t: string) => `**${t}:**`;
    const sec = (t: string, c: string) => `${bold(t)}\n${c.trim() || "_"}`;

    const envLines = [
      !hidden.server && env.server && `- **Servidor de pruebas**: ${env.server}`,
      !hidden.clientIP && env.clientIP && `- **IP Cliente**: ${env.clientIP}`,
      !hidden.browser && env.browser && `- **Navegador**: ${env.browser}`,
      !hidden.db && env.db && `- **Base de datos**: ${env.db}`,
      !hidden.entorno && env.entorno && `- **Entorno**: ${env.entorno}`,
      ...customFields.map((f) => `- **${f.label}**: ${f.value}`),
    ]
      .filter(Boolean)
      .join("\n");

    const versionsLines = versions
      .filter((v) => v.appName.trim() || v.appVersion.trim())
      .map((v) => `- ${v.appName || "?"}: ${v.appVersion || "?"}`)
      .join("\n");

    const appLines = !isApp
      ? ""
      : [
        endpoint && `- Endpoint: ${endpoint}`,
        os && `- SO / Versión: ${os}`,
        device && `- Dispositivo: ${device}`,
        preconds && `- Precondiciones: ${preconds}`,
        lang && `- Idioma: ${lang}`,
      ]
        .filter(Boolean)
        .join("\n") || "_";

    const stepsBlock = steps
      .filter((s) => s.trim())
      .map((s, i) => `${i + 1}. ${s.trim()}`)
      .join("\n");

    const evidencesSection =
      "**Evidencias:**\nAñade aquí tus evidencias correspondientes, como capturas de pantalla, logs relevantes, vídeos o cualquier otro dato que facilite la comprensión del error reportado:";

    return [
      sec("Descripción", problem),
      sec("Pasos para reproducir", stepsBlock),
      sec("Resultado esperado", expected),
      sec("Resultado real", actual),
      sec("Impacto", impact),
      sec("Entorno", envLines || "_"),
      versionsLines && sec("Versiones de aplicativos/componentes", versionsLines),
      isApp ? sec("Detalles APP", appLines) : "",
      evidencesSection,
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const content = buildContent();

  /* ---------- 3. Render ---------- */
  return (
    <>
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded shadow animate-fadeIn z-50">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-8 bg-white p-6 rounded shadow">

        <>
          {/* Cabecera */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Crear un nuevo JIRA</h2>
              <p className="text-gray-600 text-sm mt-2">
                Completa los campos para crear un JIRA detallado, desde la descripción del problema hasta las versiones del sistema.
              </p>
            </div>

            {/* envuelve tu header en `relative` y añade: */}
            <button
              onClick={() => router.push("/")}
              title="Volver al inicio"
              className="
    inline-flex items-center justify-center
    px-2.5 py-1.5
    rounded-full
    border border-gray-300
    text-gray-600
    hover:bg-blue-600 hover:text-white
    transition-colors duration-150
    relative
    -mt-20
  "
            >
              <Home className="h-5 w-5" />
            </button>
          </div>
        </>
        {/* Datos básicos */}
        {/* ---------- Sección Título del JIRA ---------- */}
        <section className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Configura el título del JIRA
          </h3>
          <p className="text-sm text-gray-600">
            Introduce los datos clave para generar automáticamente el título del ticket.
          </p>

          <Input
            label="Proyecto"
            value={project}
            setValue={(v) => setProject(v.toUpperCase())}
            placeholder="ATMV"
          />
          <Input
            label="Herramienta"
            value={tool}
            setValue={setTool}
            placeholder="ImportadorPlanificación"
          />
          <Input
            label="Descripción breve del error"
            value={errorDesc}
            setValue={setErrorDesc}
            placeholder="Error al cargar datos…"
          />

          <JiraPreview title={title} />

          <button
            onClick={() => handleCopy(title, "Título copiado")}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm mt-2"
          >
            Copiar título
          </button>
        </section>

{/* ---------- Sección Detalles del Problema y Entorno ---------- */}
<section className="space-y-3 mb-8">
  <h3 className="text-xl font-semibold text-gray-900">
    Configura el contenido del JIRA
  </h3>
  <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
    Describe el problema de forma clara y precisa, incluyendo los pasos para reproducirlo, el resultado esperado y el entorno en el que ocurrió para facilitar su diagnóstico.
  </p>
</section>
        {/* Detalle problema */}
        <section className="space-y-4">
          <TextArea
            label="Descripción del problema"
            rows={3}
            value={problem}
            setValue={setProblem}
            placeholder="Descripción detallada del problema"
          />

          {/* Pasos */}
          <div>
            <label className="block font-medium mb-1">Pasos para reproducir</label>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="steps">
                {(provided) => (
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    {steps.map((s, i) => (
                      <Draggable key={i} draggableId={`step-${i}`} index={i}>
                        {(p) => (
                          <li
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                            className="flex items-start gap-2"
                          >
                            <span className="w-6 text-right font-semibold select-none">
                              {i + 1}.
                            </span>
                            <textarea
                              rows={2}
                              className="flex-1 border p-2 rounded text-sm"
                              placeholder={`Paso ${i + 1}`}
                              value={s}
                              onChange={(e) => changeStep(i, e.target.value)}
                            />
                            <button
                              onClick={() => removeStep(i)}
                              className="text-red-600 font-bold px-2"
                              title="Eliminar paso"
                            >
                              ✕
                            </button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>

            <button
              onClick={addStep}
              className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              + Añadir Paso
            </button>
          </div>

          <TextArea
            label="Resultado esperado"
            rows={2}
            value={expected}
            setValue={setExpected}
            placeholder="Resultado esperado"
          />
          <TextArea
            label="Resultado real"
            rows={2}
            value={actual}
            setValue={setActual}
            placeholder="Resultado real"
          />

          {/* Impacto */}
          <div>
            <label htmlFor="impact" className="block font-medium">
              Impacto del error
            </label>
            <select
              id="impact"
              className="border p-2 rounded w-full bg-white"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
            >
              <option value="" disabled>
                Selecciona el impacto del error…
              </option>
              <option value="Crítico">
                Crítico – Bloquea completamente el uso del sistema
              </option>
              <option value="Alto">
                Alto – Impacto significativo con alternativas
              </option>
              <option value="Medio">Medio – Afecta algunas funciones</option>
              <option value="Bajo">
                Bajo – Problema menor sin impacto principal
              </option>
              <option value="Visual">Visual – Solo apariencia/estilo</option>
              <option value="Mejora">Mejora – Oportunidad de mejora</option>
            </select>
          </div>
        </section>

        {/* Entorno de pruebas */}
        <section>
          <h3 className="font-semibold mb-2">Entorno de pruebas</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {!hidden.server && (
              <Field
                id="server"
                label="Servidor de pruebas"
                value={env.server}
                setValue={(v) => setEnv({ ...env, server: v })}
                onHide={() => setHidden({ ...hidden, server: true })}
              />
            )}
            {!hidden.clientIP && (
              <Field
                id="clientIP"
                label="IP Cliente"
                value={env.clientIP}
                setValue={(v) => setEnv({ ...env, clientIP: v })}
                onHide={() => setHidden({ ...hidden, clientIP: true })}
              />
            )}
            {!hidden.browser && (
              <Field
                id="browser"
                label="Navegador"
                value={env.browser}
                setValue={(v) => setEnv({ ...env, browser: v })}
                onHide={() => setHidden({ ...hidden, browser: true })}
              />
            )}
            {!hidden.db && (
              <DbSelect
                value={env.db}
                setValue={(v) => setEnv({ ...env, db: v })}
                onHide={() => setHidden({ ...hidden, db: true })}
              />
            )}
            {!hidden.entorno && (
              <EnvSelect
                value={env.entorno}
                setValue={(v) => setEnv({ ...env, entorno: v })}
                onHide={() => setHidden({ ...hidden, entorno: true })}
              />
            )}
          </div>

          {Object.values(hidden).some(Boolean) && (
            <button
              onClick={() =>
                setHidden({
                  server: false,
                  clientIP: false,
                  browser: false,
                  db: false,
                  entorno: false,
                })
              }
              className="text-sm text-gray-600 mt-3 underline"
            >
              Mostrar todos los campos
            </button>
          )}

          {/* Checkbox APP */}
          <div className="mt-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                checked={isApp}
                onChange={(e) => setIsApp(e.target.checked)}
              />
              <span className="ml-2 text-gray-700">
                ¿Es validación de una APP Móvil/Escritorio?
              </span>
            </label>
          </div>

          {/* Detalles APP */}
          {isApp && (
            <div className="mt-4 border p-3 rounded space-y-3 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-800">Detalles de la APP</h4>

              <AppField
                id="endpoint"
                label="Endpoint (si aplica)"
                placeholder="https://api.ejemplo.com"
                value={endpoint}
                setValue={setEndpoint}
              />
              <AppField
                id="os"
                label="SO / Versión"
                placeholder="Android 13, iOS 16.5, Windows 11"
                value={os}
                setValue={setOs}
              />
              <AppField
                id="device"
                label="Dispositivo de Pruebas"
                placeholder="Pixel 8, iPhone 14 Pro, PC…"
                value={device}
                setValue={setDevice}
              />
              <AppTextArea
                id="preconds"
                label="Precondiciones Específicas APP"
                value={preconds}
                setValue={setPreconds}
              />
              <AppField
                id="lang"
                label="Idioma Configurado"
                placeholder="es-ES, en-US"
                value={lang}
                setValue={setLang}
              />
            </div>
          )}

          {/* Campos personalizados */}
          <div className="mt-6 space-y-2">
            <h4 className="font-medium">Campos personalizados</h4>
            {customFields.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="border p-2 rounded w-1/2 text-sm"
                  placeholder="Nombre"
                  value={f.label}
                  onChange={(e) => {
                    const n = [...customFields];
                    n[i].label = e.target.value;
                    setCustomFields(n);
                  }}
                />
                <input
                  className="border p-2 rounded w-1/2 text-sm"
                  placeholder="Valor"
                  value={f.value}
                  onChange={(e) => {
                    const n = [...customFields];
                    n[i].value = e.target.value;
                    setCustomFields(n);
                  }}
                />
                <button
                  className="text-red-600 font-bold"
                  onClick={() =>
                    setCustomFields(customFields.filter((_, j) => j !== i))
                  }
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setCustomFields([...customFields, { label: "", value: "" }])
              }
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              + Añadir campo
            </button>
          </div>

          {/* Versiones de aplicativos/componentes */}
          <div className="mt-6 mb-8 space-y-3">
            <label className="block font-medium text-gray-700">
              Versiones de Aplicativos/Componentes
            </label>
            {versions.map((v, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="text"
                  aria-label={`Nombre aplicativo ${i + 1}`}
                  className="border p-2 rounded flex-grow"
                  placeholder="Nombre aplicativo"
                  value={v.appName}
                  onChange={(e) =>
                    handleVersionChange(i, "appName", e.target.value)
                  }
                />
                <input
                  type="text"
                  aria-label={`Versión aplicativo ${i + 1}`}
                  className="border p-2 rounded flex-grow"
                  placeholder="Versión"
                  value={v.appVersion}
                  onChange={(e) =>
                    handleVersionChange(i, "appVersion", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => removeVersion(i)}
                  className="text-red-600 hover:text-red-800 font-bold px-2 py-1"
                  title="Eliminar esta versión"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addVersion}
              className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              + Añadir versión
            </button>
          </div>

          {/* Botones finales */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => handleCopy(content, "Contenido copiado")}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
            >
              Copiar contenido del JIRA
            </button>

            <button
              onClick={resetForm}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Reiniciar formulario
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

/* ─────────── Sub-componentes reutilizables ─────────── */
function Field({
  id,
  label,
  value,
  setValue,
  onHide,
}: {
  id: string;
  label: string;
  value: string;
  setValue: (v: string) => void;
  onHide: () => void;
}) {
  return (
    <div className="relative group">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className="border p-2 rounded w-full text-sm pr-8"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        onClick={onHide}
        title="Ocultar campo"
        className="absolute top-7 right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600"
      >
        ✕
      </button>
    </div>
  );
}

/* Selector de Base de Datos */
function DbSelect({
  value,
  setValue,
  onHide,
}: {
  value: string;
  setValue: (v: string) => void;
  onHide: () => void;
}) {
  const PRESETS = [
    "SQL Server",
    "Oracle",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "N/A",
  ];

  return (
    <div className="relative group">
      <label htmlFor="db" className="block font-medium text-sm">
        Base de datos (si aplica)
      </label>

      <select
        id="db"
        className="border p-2 rounded w-full pr-8 text-sm bg-white appearance-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        <option value="">Seleccione…</option>
        {PRESETS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onHide}
        className="absolute top-6 right-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Ocultar este campo del reporte"
      >
        ✕
      </button>
    </div>
  );
}

/* Selector de Entorno */
function EnvSelect({
  value,
  setValue,
  onHide,
}: {
  value: string;
  setValue: (v: string) => void;
  onHide: () => void;
}) {
  const OPTIONS = [
    "Desarrollo",
    "Integración",
    "UAT",
    "Transferencia",
    "PRE",
    "PROD",
  ];

  return (
    <div className="relative group">
      <label htmlFor="entorno" className="block font-medium text-sm">
        Entorno
      </label>

      <select
        id="entorno"
        className="border p-2 rounded w-full pr-8 text-sm bg-white appearance-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        <option value="">Seleccione…</option>
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onHide}
        className="absolute top-6 right-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Ocultar este campo del reporte"
      >
        ✕
      </button>
    </div>
  );
}

/* Input genérico */
function Input({
  label,
  value,
  setValue,
  placeholder,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-medium">{label}</label>
      <input
        className="border p-2 rounded w-full"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function TextArea({
  label,
  rows,
  value,
  setValue,
  placeholder,
}: {
  label: string;
  rows: number;
  value: string;
  setValue: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-medium">{label}</label>
      <textarea
        className="border p-2 rounded w-full"
        rows={rows}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

/* Campos APP -------------------------------------------------------------- */
function AppField({
  id,
  label,
  value,
  setValue,
  placeholder = "",
}: {
  id: string;
  label: string;
  value: string;
  setValue: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-medium text-sm">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="border p-2 rounded w-full text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

function AppTextArea({
  id,
  label,
  value,
  setValue,
}: {
  id: string;
  label: string;
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-medium text-sm">
        {label}
      </label>
      <textarea
        id={id}
        rows={2}
        className="w-full border p-2 rounded text-sm"
        placeholder="Escribe aquí…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}