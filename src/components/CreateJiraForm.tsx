"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JiraPreview from "./JiraPreview";

/* ──────────────────── Tipos ──────────────────── */
type EnvHidden = {
  server: boolean;
  clientIP: boolean;
  browser: boolean;
  db: boolean;
  env: boolean;
};

type CustomField = { label: string; value: string };

/* ────────────────── Componente ────────────────── */
export default function CreateJiraForm() {
  const router = useRouter();

  /* 1. Estado principal */
  const [project, setProject] = useState("");
  const [tool, setTool] = useState("");
  const [errorDesc, setErrorDesc] = useState("");

  const [problem, setProblem] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [impact, setImpact] = useState("");

  /* Entorno genérico */
  const [env, setEnv] = useState({
    server: "",
    clientIP: "",
    browser: "",
    db: "",
    env: "",
  });
  const [hidden, setHidden] = useState<EnvHidden>({
    server: false,
    clientIP: false,
    browser: false,
    db: false,
    env: false,
  });

  /* Campos APP */
  const [isApp, setIsApp] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [os, setOs] = useState("");
  const [device, setDevice] = useState("");
  const [preconds, setPreconds] = useState("");
  const [lang, setLang] = useState("");

  /* Campos personalizados */
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  /* 2. Helpers */
  const toCamel = (s: string) =>
    s
      .replace(/[^a-zA-ZÀ-ÿ0-9 ]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w, i) =>
        i === 0
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
      .join("");

  const title = `${project.trim().toUpperCase()} - ${toCamel(
    tool.trim()
  )} - ${errorDesc.trim()}`;

  const copyToClipboard = (txt: string) => navigator.clipboard.writeText(txt);

  /* Genera el cuerpo con negritas */
  const buildContent = () => {
    const bold = (t: string) => `*${t}:*`;
    const sec = (t: string, c: string) => `${bold(t)}\n${c.trim() || "_"}`;

    /* Entorno */
    const envLines = [
      !hidden.server && env.server && `- Servidor: ${env.server}`,
      !hidden.clientIP && env.clientIP && `- IP Cliente: ${env.clientIP}`,
      !hidden.browser && env.browser && `- Navegador: ${env.browser}`,
      !hidden.db && env.db && `- BD: ${env.db}`,
      !hidden.env && env.env && `- Ambiente: ${env.env}`,
      ...customFields.map((f) => `- ${f.label}: ${f.value}`),
    ]
      .filter(Boolean)
      .join("\n");

    /* Detalles APP */
    const appLines =
      !isApp
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

    return [
      sec("Descripción", problem),
      sec("Pasos para reproducir", steps),
      sec("Resultado esperado", expected),
      sec("Resultado real", actual),
      sec("Impacto", impact),
      sec("Entorno", envLines || "_"),
      isApp ? sec("Detalles APP", appLines) : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const content = buildContent();

  /* 3. Render */
  return (
    <div className="max-w-3xl mx-auto space-y-8 bg-white p-6 rounded shadow">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Crear un nuevo JIRA</h2>

        {/* Botón volver a la landing (misma estética solicitada) */}
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          ← Volver a la página principal
        </button>
      </div>

      {/* ─────── Datos básicos + vista previa ─────── */}
      <section className="space-y-4">
        <div>
          <label className="block font-medium">Proyecto</label>
          <input
            className="border p-2 rounded w-full"
            value={project}
            onChange={(e) => setProject(e.target.value.toUpperCase())}
            placeholder="ATMV"
          />
        </div>
        <div>
          <label className="block font-medium">Herramienta</label>
          <input
            className="border p-2 rounded w-full"
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            placeholder="ImportadorPlanificación"
          />
        </div>
        <div>
          <label className="block font-medium">
            Descripción breve del error
          </label>
          <input
            className="border p-2 rounded w-full"
            value={errorDesc}
            onChange={(e) => setErrorDesc(e.target.value)}
            placeholder="Error al cargar datos..."
          />
        </div>

        {/* Vista previa título */}
        <JiraPreview title={title} />

        {/* Botones copiar (mismo estilo y alineados) */}
        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard(title)}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
          >
            Copiar título
          </button>

          <button
            onClick={() => copyToClipboard(content)}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
          >
            Copiar contenido completo
          </button>
        </div>
      </section>

      {/* ─────── Detalle problema ─────── */}
      <section className="space-y-4">
        <textarea
          className="border p-2 rounded w-full"
          rows={3}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Descripción detallada del problema"
        />
        <textarea
          className="border p-2 rounded w-full"
          rows={4}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="Pasos para reproducir"
        />
        <textarea
          className="border p-2 rounded w-full"
          rows={2}
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          placeholder="Resultado esperado"
        />
        <textarea
          className="border p-2 rounded w-full"
          rows={2}
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          placeholder="Resultado real"
        />
        <textarea
          className="border p-2 rounded w-full"
          rows={2}
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          placeholder="Impacto del error"
        />
      </section>

      {/* ─────── Entorno de pruebas ─────── */}
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
            <Field
              id="db"
              label="Base de datos"
              value={env.db}
              setValue={(v) => setEnv({ ...env, db: v })}
              onHide={() => setHidden({ ...hidden, db: true })}
            />
          )}
          {!hidden.env && (
            <Field
              id="env"
              label="Ambiente"
              value={env.env}
              setValue={(v) => setEnv({ ...env, env: v })}
              onHide={() => setHidden({ ...hidden, env: true })}
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
                env: false,
              })
            }
            className="text-sm text-gray-600 mt-3 underline"
          >
            Mostrar todos los campos
          </button>
        )}

        {/* ─────── Checkbox APP ─────── */}
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

        {/* ─────── Detalles APP ─────── */}
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
              label="Sistema Operativo / Versión"
              placeholder="Android 13, iOS 16.5, Windows 11"
              value={os}
              setValue={setOs}
            />
            <AppField
              id="device"
              label="Dispositivo de Pruebas"
              placeholder="Pixel 8, iPhone 14 Pro, PC..."
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

        {/* ─────── Campos personalizados ─────── */}
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
      </section>
    </div>
  );
}

/* ───────────── Sub-componentes ───────────── */
interface FieldProps {
  id: string;
  label: string;
  value: string;
  setValue: (v: string) => void;
  onHide: () => void;
}
function Field({ id, label, value, setValue, onHide }: FieldProps) {
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

/* Campos APP reutilizables */
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