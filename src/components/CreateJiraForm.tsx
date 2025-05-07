"use client";

import { useState } from "react";
import Link from "next/link";
import JiraPreview from "./JiraPreview";

/* ───────────── Tipos auxiliares ───────────── */
type EnvHidden = {
  server: boolean;
  clientIP: boolean;
  browser: boolean;
  db: boolean;
  env: boolean;
};

type CustomField = { label: string; value: string };

/* ───────────── Componente principal ───────────── */
export default function CreateJiraForm() {
  /* -------- 1. Estado principal -------- */
  const [project, setProject] = useState("");
  const [tool, setTool] = useState("");
  const [errorDesc, setErrorDesc] = useState("");

  const [problem, setProblem] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [impact, setImpact] = useState("");

  const [env, setEnv] = useState({
    server: "",
    clientIP: "",
    browser: "",
    db: "",
    env: "",
  });

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [hidden, setHidden] = useState<EnvHidden>({
    server: false,
    clientIP: false,
    browser: false,
    db: false,
    env: false,
  });

  /* -------- 2. Helpers -------- */
  /** Convierte la herramienta a camelCase respetando diacríticos. */
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

  /** Construye el cuerpo del JIRA con subtítulos en negrita */
  const buildContent = () => {
    const bold = (t: string) => `*${t}:*`;
    const section = (t: string, c: string) =>
      `${bold(t)}\n${c.trim() || "_"}`;

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

    return [
      section("Descripción", problem),
      section("Pasos para reproducir", steps),
      section("Resultado esperado", expected),
      section("Resultado real", actual),
      section("Impacto", impact),
      section("Entorno", envLines || "_"),
    ].join("\n\n");
  };

  const content = buildContent();

  /* -------- 3. Render -------- */
  return (
    <div className="max-w-3xl mx-auto space-y-8 bg-white p-6 rounded shadow">
      {/* Cabecera + volver */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Crear un nuevo JIRA</h2>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
        >
          ← Volver a la landing
        </Link>
      </div>

      {/* ---------- Datos básicos ---------- */}
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

        {/* Vista previa del título */}
        <JiraPreview title={title} />

        {/* Botón copiar título */}
        <button
          onClick={() => copyToClipboard(title)}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
        >
          Copiar título
        </button>
      </section>

      {/* ---------- Detalle del problema ---------- */}
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

      {/* ---------- Entorno de pruebas ---------- */}
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

        {/* ---------- Campos personalizados ---------- */}
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

      {/* ---------- Copiar contenido ---------- */}
      <div className="text-right mt-8">
        <button
          onClick={() => copyToClipboard(content)} // ← solo cuerpo
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Copiar contenido completo
        </button>
      </div>
    </div>
  );
}

/* ───────────── Campo reutilizable ───────────── */
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