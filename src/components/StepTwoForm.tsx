"use client";

import React, { useEffect } from "react";
import { ParsedData } from "@/utils/parseJiraContent";

interface BatteryTest {
  id: string;
  description: string;
  steps: string;
  expectedResult: string;
  obtainedResult: string;
  testStatus: string;
}

interface Incidence {
  id: string;
  description: string;
  impact: string;
  status: string;
}

interface Summary {
  totalTests: string;
  successfulTests: string;
  failedTests: string;
  observations: string;
}

export interface FormData {
  date: string;
  tester: string;
  testStatus: string;
  versions: Array<{ appName: string; appVersion: string }>;
  serverPruebas: string;
  ipMaquina: string;
  usuario: string;
  contrasena: string;
  navegador: string;
  baseDatos: string;
  maquetaUtilizada: string;
  ambiente: string;
  batteryTests: BatteryTest[];
  summary: Summary;
  incidences: Incidence[];
  hasIncidences: boolean;
  conclusion: string;
}

interface StepTwoFormProps {
  parsedData: ParsedData;
  formData: FormData;
  setFormData: (val: FormData) => void;
  onGenerate: () => void;
  onReset: () => void;
  report: string;
  onGoBackToStep1: () => void; // Botón para volver a la pantalla 1
}

const EXAMPLE_CONCLUSION = `Ejemplo de conclusión:
❌ Rechazado → El fallo bloquea la validación de la funcionalidad`;

export default function StepTwoForm({
  parsedData,
  formData,
  setFormData,
  onGenerate,
  onReset,
  report,
  onGoBackToStep1,
}: StepTwoFormProps) {
  /**
   * 1) Forzar la fecha actual en el estado si está vacía.
   *    Se hace una sola vez al montar el componente (useEffect con dependencia vacía).
   */
  useEffect(() => {
    if (!formData.date) {
      setFormData({
        ...formData,
        date: new Date().toISOString().split("T")[0],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <--- sin dependencias para que sólo se ejecute al montar

  /**
   * Manejo genérico de campos del FormData
   */
  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | Summary
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  /**
   * Ajuste de la batería de pruebas por defecto al montar
   */
  useEffect(() => {
    const newTests = [...formData.batteryTests];
    newTests.forEach((test) => {
      if (
        test.id === "PR-001" &&
        !test.obtainedResult.includes("El sistema no procesó correctamente")
      ) {
        test.obtainedResult =
          "❌ El sistema no procesó correctamente la eliminación del servicio con retirada, generando un error inesperado.";
      }
    });
    setFormData({ ...formData, batteryTests: newTests });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Añadir nuevo caso de prueba
   */
  const addBatteryTest = () => {
    const newTest: BatteryTest = {
      id: "PR-001",
      description: "",
      steps: "Paso 1: Acceder a la acción de regulación de eliminar servicio...",
      expectedResult:
        "El servicio se elimina correctamente añadiendo su viaje de retirada correspondiente.",
      obtainedResult:
        "❌ El sistema no procesó correctamente la eliminación del servicio con retirada, generando un error inesperado.",
      testStatus: "FALLIDO",
    };

    const newTests = [...formData.batteryTests, newTest];
    // Actualizamos el total de pruebas
    const updatedSummary = {
      ...formData.summary,
      totalTests: String(newTests.length),
    };

    setFormData({
      ...formData,
      batteryTests: newTests,
      summary: updatedSummary,
    });
  };

  /**
   * Eliminar caso de prueba
   */
  const removeBatteryTest = (index: number) => {
    const newTests = [...formData.batteryTests];
    newTests.splice(index, 1);

    // Ajustamos el total de pruebas
    const updatedSummary = {
      ...formData.summary,
      totalTests: String(newTests.length),
    };

    setFormData({
      ...formData,
      batteryTests: newTests,
      summary: updatedSummary,
    });
  };

  /**
   * Actualizar propiedades de un caso de prueba
   */
  const handleBatteryTestChange = (
    index: number,
    field: keyof BatteryTest,
    value: string
  ) => {
    const newTests = [...formData.batteryTests];
    newTests[index][field] = value;
    setFormData({ ...formData, batteryTests: newTests });
  };

  /**
   * Incidencias
   */
  const addIncidence = () => {
    if (formData.incidences.length === 0) {
      setFormData({
        ...formData,
        incidences: [
          {
            id: "PR-001",
            description: "Descripción de la incidencia (ejemplo editable)",
            impact: "Error LEVE (ejemplo editable)",
            status: "Reabierto (ejemplo editable)",
          },
        ],
      });
    }
  };

  const removeIncidence = (index: number) => {
    const newInc = [...formData.incidences];
    newInc.splice(index, 1);
    setFormData({ ...formData, incidences: newInc });
  };

  const handleIncidenceChange = (
    index: number,
    field: keyof Incidence,
    value: string
  ) => {
    const newIncidences = [...formData.incidences];
    newIncidences[index][field] = value;
    setFormData({ ...formData, incidences: newIncidences });
  };

  /**
   * Manejar activación de incidencias
   */
  useEffect(() => {
    if (formData.hasIncidences) {
      // Si no hay incidencias, añadimos la de ejemplo
      if (formData.incidences.length === 0) {
        addIncidence();
      }
      // Si hay más de 1, nos quedamos sólo con la primera
      else if (formData.incidences.length > 1) {
        const firstInc = formData.incidences[0];
        setFormData({ ...formData, incidences: [firstInc] });
      }
    } else {
      // Si hasIncidences es false, vaciamos el array de incidences
      setFormData({ ...formData, incidences: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.hasIncidences]);

  /**
   * Manejo de versiones
   */
  const handleVersionChange = (
    index: number,
    field: "appName" | "appVersion",
    value: string
  ) => {
    const newVersions = [...formData.versions];
    newVersions[index][field] = value;
    setFormData({ ...formData, versions: newVersions });
  };

  const addVersion = () => {
    setFormData({
      ...formData,
      versions: [...formData.versions, { appName: "", appVersion: "" }],
    });
  };

  const isExampleConclusion = formData.conclusion === EXAMPLE_CONCLUSION;

  return (
    <div className="space-y-6 max-w-3xl mx-auto relative z-20">
      {/* Encabezado con botón a la derecha */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Paso 2: Datos adicionales</h2>
        <button
          onClick={onGoBackToStep1}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          ← Volver a la introducción del JIRA
        </button>
      </div>

      {/* Datos básicos */}
      <div className="space-y-2">
        <div>
          <label className="block font-medium">Título</label>
          <p className="p-2 bg-gray-100 rounded">{parsedData.title}</p>
        </div>
        <div>
          <label className="block font-medium">Fecha de Prueba</label>
          <input
            type="date"
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.date || new Date().toISOString().split("T")[0]}
            onChange={(e) => handleInputChange("date", e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium">Tester</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400"
            value={formData.tester}
            onChange={(e) => handleInputChange("tester", e.target.value)}
            placeholder="ABP"
          />
        </div>
        <div>
          <label className="block font-medium">Estado de la Prueba</label>
          <select
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.testStatus}
            onChange={(e) => handleInputChange("testStatus", e.target.value)}
          >
            <option value="">Seleccione...</option>
            <option value="Exitosa">Exitosa</option>
            <option value="Fallida">Fallida</option>
          </select>
        </div>
      </div>

      {/* Versiones */}
      <div className="space-y-2">
        <label className="block font-medium">Versiones</label>
        {formData.versions.map((version, idx) => (
          <div key={idx} className="flex space-x-2">
            <input
              type="text"
              className="border border-gray-300 rounded p-2 flex-1 placeholder:text-gray-400"
              placeholder="Nombre aplicativo (ej. Rail-server)"
              value={version.appName}
              onChange={(e) =>
                handleVersionChange(idx, "appName", e.target.value)
              }
            />
            <input
              type="text"
              className="border border-gray-300 rounded p-2 flex-1 placeholder:text-gray-400"
              placeholder="Versión (ej. 1.25.02.1)"
              value={version.appVersion}
              onChange={(e) =>
                handleVersionChange(idx, "appVersion", e.target.value)
              }
            />
          </div>
        ))}
        <button
          onClick={addVersion}
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
        >
          + Añadir versión
        </button>
      </div>

      {/* Entorno de Pruebas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Servidor de Pruebas</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400"
            value={formData.serverPruebas}
            onChange={(e) => handleInputChange("serverPruebas", e.target.value)}
            placeholder="MLOApps"
          />
        </div>
        <div>
          <label className="block font-medium">IP Máquina</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400"
            value={formData.ipMaquina}
            onChange={(e) => handleInputChange("ipMaquina", e.target.value)}
            placeholder="172.25.2.62"
          />
        </div>
        <div>
          <label className="block font-medium">Usuario</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400"
            value={formData.usuario}
            onChange={(e) => handleInputChange("usuario", e.target.value)}
            placeholder="admin"
          />
        </div>
        <div>
          <label className="block font-medium">Contraseña</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400"
            value={formData.contrasena}
            onChange={(e) => handleInputChange("contrasena", e.target.value)}
            placeholder="admin"
          />
        </div>
        <div>
          <label className="block font-medium">Navegador Utilizado</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400"
            value={formData.navegador}
            onChange={(e) => handleInputChange("navegador", e.target.value)}
            placeholder="Chrome"
          />
        </div>
        <div>
          <label className="block font-medium">Base de Datos</label>
          <select
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.baseDatos}
            onChange={(e) => handleInputChange("baseDatos", e.target.value)}
          >
            <option value="">Seleccione...</option>
            <option value="SQL Server">SQL Server</option>
            <option value="Oracle">Oracle</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Maqueta Utilizada</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400"
            value={formData.maquetaUtilizada}
            onChange={(e) =>
              handleInputChange("maquetaUtilizada", e.target.value)
            }
            placeholder="Maqueta MLO - 172.31.27.16"
          />
        </div>
        <div>
          <label className="block font-medium">Ambiente</label>
          <select
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.ambiente}
            onChange={(e) => handleInputChange("ambiente", e.target.value)}
          >
            <option value="">Seleccione...</option>
            <option value="Transferencia">Transferencia</option>
            <option value="PRE">PRE</option>
            <option value="PROD">PROD</option>
            <option value="Desarrollo">Desarrollo</option>
          </select>
        </div>
      </div>

      {/* Batería de Pruebas */}
      <div className="space-y-2">
        <h3 className="font-semibold">Batería de Pruebas</h3>
        <p className="text-sm text-gray-500">
          (En esta sección se definen los casos de prueba realizados y sus resultados.)
        </p>
        {formData.batteryTests.map((test, idx) => {
          const isExample = test.id === "PR-001";
          return (
            <div
              key={idx}
              className="relative border border-gray-300 rounded p-2 space-y-2"
            >
              {/* Botón para eliminar el caso de prueba */}
              <button
                onClick={() => removeBatteryTest(idx)}
                className="absolute top-2 right-2 text-red-600 font-bold"
                title="Eliminar este caso de prueba"
              >
                X
              </button>

              {/* ID Prueba */}
              <div>
                <label className="block font-medium">ID Prueba</label>
                <input
                  type="text"
                  className={`border border-gray-300 rounded p-2 w-full ${
                    isExample ? "text-gray-400 italic" : ""
                  }`}
                  placeholder="Ejemplo: PR-001"
                  value={test.id}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "id", e.target.value)
                  }
                />
              </div>

              {/* Pasos */}
              <div>
                <label className="block font-medium">Pasos</label>
                <textarea
                  className={`w-full border border-gray-300 rounded p-2 ${
                    isExample ? "text-gray-400 italic" : ""
                  }`}
                  placeholder="Ejemplo: 1. Acceder a la acción de regulación..."
                  value={test.steps}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "steps", e.target.value)
                  }
                />
              </div>

              {/* Resultado Esperado */}
              <div>
                <label className="block font-medium">Resultado Esperado</label>
                <textarea
                  className={`w-full border border-gray-300 rounded p-2 ${
                    isExample ? "text-gray-400 italic" : ""
                  }`}
                  placeholder="Ejemplo: El servicio se elimina correctamente..."
                  value={test.expectedResult}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "expectedResult", e.target.value)
                  }
                />
              </div>

              {/* Resultado Obtenido */}
              <div>
                <label className="block font-medium">Resultado Obtenido</label>
                <textarea
                  className={`w-full border border-gray-300 rounded p-2 ${
                    isExample ? "text-gray-400 italic" : ""
                  }`}
                  placeholder="Ejemplo: ❌ El sistema no procesó correctamente..."
                  value={test.obtainedResult}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "obtainedResult", e.target.value)
                  }
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block font-medium">Estado</label>
                <input
                  type="text"
                  className={`border border-gray-300 rounded p-2 w-full ${
                    isExample ? "text-gray-400 italic" : ""
                  }`}
                  placeholder="Ejemplo: FALLIDO"
                  value={test.testStatus}
                  onChange={(e) =>
                    handleBatteryTestChange(idx, "testStatus", e.target.value)
                  }
                />
              </div>
            </div>
          );
        })}
        <button
          onClick={addBatteryTest}
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
        >
          + Añadir caso de prueba
        </button>
      </div>

      {/* Resumen de Resultados */}
      <div className="space-y-2">
        <h3 className="font-semibold">Resumen de Resultados</h3>
        <p className="text-sm text-gray-500">
          (En esta sección se registran los resultados de las pruebas ejecutadas, incluyendo el número total de pruebas, las exitosas y las fallidas, junto con observaciones adicionales sobre la ejecución.)
        </p>

        {/* Total de Pruebas -> ahora number */}
        <div>
          <label className="block font-medium">Total de Pruebas</label>
          <input
            type="number"
            min="0"
            step="1"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400"
            placeholder=""
            value={formData.summary.totalTests}
            onChange={(e) =>
              handleInputChange("summary", {
                ...formData.summary,
                totalTests: e.target.value,
              } as Summary)
            }
          />
        </div>

        {/* Pruebas Exitosas -> ahora number */}
        <div>
          <label className="block font-medium">Pruebas Exitosas</label>
          <input
            type="number"
            min="0"
            step="1"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400"
            placeholder=""
            value={formData.summary.successfulTests}
            onChange={(e) =>
              handleInputChange("summary", {
                ...formData.summary,
                successfulTests: e.target.value,
              } as Summary)
            }
          />
        </div>

        {/* Pruebas Fallidas -> ahora number */}
        <div>
          <label className="block font-medium">Pruebas Fallidas</label>
          <input
            type="number"
            min="0"
            step="1"
            className="border border-gray-300 rounded p-2 w-full placeholder:text-gray-400"
            placeholder=""
            value={formData.summary.failedTests}
            onChange={(e) =>
              handleInputChange("summary", {
                ...formData.summary,
                failedTests: e.target.value,
              } as Summary)
            }
          />
        </div>

        <div>
          <label className="block font-medium">Observaciones</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2 placeholder:text-gray-400"
            placeholder=""
            value={formData.summary.observations}
            onChange={(e) =>
              handleInputChange("summary", {
                ...formData.summary,
                observations: e.target.value,
              } as Summary)
            }
          />
        </div>
      </div>

      {/* Incidencias Detectadas */}
      <div className="space-y-2">
        <h3 className="font-semibold">Incidencias Detectadas</h3>
        <p className="text-sm text-gray-500">
          (En esta sección se registran las incidencias encontradas durante la ejecución de las pruebas.)
        </p>
        <div>
          <label className="block font-medium">¿Se detectaron incidencias?</label>
          <select
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.hasIncidences ? "Sí" : "No"}
            onChange={(e) =>
              handleInputChange("hasIncidences", e.target.value === "Sí")
            }
          >
            <option value="No">No</option>
            <option value="Sí">Sí</option>
          </select>
        </div>
        {formData.hasIncidences &&
          formData.incidences.map((inc, idx) => {
            const isExample = inc.id === "PR-001";
            return (
              <div
                key={idx}
                className="relative border border-gray-300 rounded p-2 space-y-2"
              >
                <button
                  onClick={() => removeIncidence(idx)}
                  className="absolute top-2 right-2 text-red-600 font-bold"
                  title="Eliminar esta incidencia"
                >
                  X
                </button>
                <div>
                  <label className="block font-medium">ID Prueba</label>
                  <input
                    type="text"
                    className={`border border-gray-300 rounded p-2 w-full ${
                      isExample ? "text-gray-400 italic" : ""
                    }`}
                    placeholder="Ejemplo: PR-001"
                    value={inc.id}
                    onChange={(e) => {
                      const newInc = [...formData.incidences];
                      newInc[idx].id = e.target.value;
                      setFormData({ ...formData, incidences: newInc });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium">
                    Descripción de la Incidencia
                  </label>
                  <textarea
                    className={`w-full border border-gray-300 rounded p-2 ${
                      isExample ? "text-gray-400 italic" : ""
                    }`}
                    placeholder="Ejemplo: Descripción de la incidencia"
                    value={inc.description}
                    onChange={(e) => {
                      const newInc = [...formData.incidences];
                      newInc[idx].description = e.target.value;
                      setFormData({ ...formData, incidences: newInc });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium">Impacto</label>
                  <input
                    type="text"
                    className={`border border-gray-300 rounded p-2 w-full ${
                      isExample ? "text-gray-400 italic" : ""
                    }`}
                    placeholder="Ejemplo: Error LEVE"
                    value={inc.impact}
                    onChange={(e) => {
                      const newInc = [...formData.incidences];
                      newInc[idx].impact = e.target.value;
                      setFormData({ ...formData, incidences: newInc });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium">Estado</label>
                  <input
                    type="text"
                    className={`border border-gray-300 rounded p-2 w-full ${
                      isExample ? "text-gray-400 italic" : ""
                    }`}
                    placeholder="Ejemplo: Reabierto"
                    value={inc.status}
                    onChange={(e) => {
                      const newInc = [...formData.incidences];
                      newInc[idx].status = e.target.value;
                      setFormData({ ...formData, incidences: newInc });
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {/* Conclusiones */}
      <div className="space-y-2">
        <h3 className="font-semibold">Conclusiones</h3>
        <textarea
          className={`w-full border border-gray-300 rounded p-2 placeholder:text-gray-400 ${
            isExampleConclusion ? "text-gray-400 italic" : ""
          }`}
          placeholder={EXAMPLE_CONCLUSION}
          value={formData.conclusion}
          onChange={(e) => handleInputChange("conclusion", e.target.value)}
        />
      </div>

      {/* Botones */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={onGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
        >
          Generar Reporte
        </button>
        <button
          onClick={onReset}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}