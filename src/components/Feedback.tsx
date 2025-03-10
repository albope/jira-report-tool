"use client";

import React, { useState, useEffect } from "react";

/**
 * Estructura de cada feedback guardado.
 */
interface FeedbackMessage {
  name: string;
  description: string;
  timestamp: string;
  done: boolean;
}

export default function Feedback() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Campos del formulario
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Lista de feedbacks (cargada desde localStorage)
  const [feedbackList, setFeedbackList] = useState<FeedbackMessage[]>([]);

  /**
   * Al montar, cargamos la lista de feedback de localStorage (si existe).
   */
  useEffect(() => {
    const storedFeedback = localStorage.getItem("feedbackMessages");
    if (storedFeedback) {
      setFeedbackList(JSON.parse(storedFeedback));
    }
  }, []);

  /**
   * Función para persistir la lista de feedback en localStorage.
   */
  const saveFeedbackToStorage = (messages: FeedbackMessage[]) => {
    localStorage.setItem("feedbackMessages", JSON.stringify(messages));
  };

  /**
   * Manejar el envío de un nuevo feedback.
   */
  const handleSubmit = () => {
    // Validar campos obligatorios
    if (!name.trim() || !description.trim()) return;

    const newFeedback: FeedbackMessage = {
      name: name.trim(),
      description: description.trim(),
      timestamp: new Date().toISOString(),
      done: false,
    };

    const updatedFeedback = [...feedbackList, newFeedback];
    setFeedbackList(updatedFeedback);
    saveFeedbackToStorage(updatedFeedback);

    // Limpiar campos
    setName("");
    setDescription("");
  };

  /**
   * Marcar/desmarcar como realizado.
   */
  const handleToggleDone = (index: number) => {
    const updatedFeedback = [...feedbackList];
    updatedFeedback[index].done = !updatedFeedback[index].done;
    setFeedbackList(updatedFeedback);
    saveFeedbackToStorage(updatedFeedback);
  };

  /**
   * Eliminar un feedback.
   */
  const handleDeleteFeedback = (index: number) => {
    const updatedFeedback = [...feedbackList];
    updatedFeedback.splice(index, 1);
    setFeedbackList(updatedFeedback);
    saveFeedbackToStorage(updatedFeedback);
  };

  return (
    <>
      {/* Botón flotante (siempre visible) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-500 transition z-50"
      >
        💡 Feedback + Bugs
      </button>

      {/* Modal emergente */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay semitransparente para cerrar */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Contenedor del modal */}
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md z-10">
            {/* Botón aspa (X) en esquina superior derecha */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              title="Cerrar"
            >
              {/* Ícono de aspa */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-4">Enviar Feedback / Reportar Bug</h2>

            {/* Campo Nombre */}
            <div className="mb-4">
              <label htmlFor="feedback-name" className="block font-medium mb-1">
                Nombre *
              </label>
              <input
                id="feedback-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full border rounded p-2 ${
                  name.trim() === "" ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Tu nombre"
              />
            </div>

            {/* Campo Descripción */}
            <div className="mb-4">
              <label htmlFor="feedback-description" className="block font-medium mb-1">
                Descripción *
              </label>
              <textarea
                id="feedback-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full border rounded p-2 ${
                  description.trim() === "" ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe tu feedback o bug"
                rows={4}
              />
            </div>

            {/* Botón Enviar */}
            <button
              onClick={handleSubmit}
              disabled={name.trim() === "" || description.trim() === ""}
              className={`w-full bg-blue-600 text-white py-2 rounded mb-4 ${
                name.trim() === "" || description.trim() === ""
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600"
              }`}
            >
              Enviar
            </button>

            {/* Lista de feedbacks */}
            {feedbackList.length > 0 && (
              <div className="mt-2">
                <h3 className="text-lg font-bold mb-2">Feedback Enviado</h3>
                <ul className="max-h-48 overflow-y-auto space-y-2">
                  {feedbackList.map((item, index) => (
                    <li key={index} className="border-b py-2">
                      {/* Encabezado con nombre y timestamp */}
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">
                          {item.name} - {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>

                      {/* Descripción */}
                      <p className="text-sm mb-2">{item.description}</p>

                      {/* Acciones: marcar como realizado y borrar */}
                      <div className="flex items-center space-x-3">
                        {/* Botón para marcar/desmarcar como realizado */}
                        <button
                          onClick={() => handleToggleDone(index)}
                          className="inline-flex items-center px-2 py-1 text-sm rounded border border-gray-300 hover:border-gray-400"
                        >
                          {item.done ? (
                            <>
                              {/* Ícono check en verde */}
                              <svg
                                className="w-4 h-4 text-green-600 mr-1"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-green-700 font-semibold">Hecho</span>
                            </>
                          ) : (
                            <>
                              {/* Ícono check en gris/azul */}
                              <svg
                                className="w-4 h-4 text-gray-500 mr-1"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-700">Marcar</span>
                            </>
                          )}
                        </button>

                        {/* Botón para borrar */}
                        <button
                          onClick={() => handleDeleteFeedback(index)}
                          className="inline-flex items-center px-2 py-1 text-sm rounded border border-red-300 hover:border-red-400"
                          title="Borrar feedback"
                        >
                          {/* Ícono de papelera */}
                          <svg
                            className="w-4 h-4 text-red-600 mr-1"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.136 21H7.864a2 2 0 01-1.997-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m1 0h6" />
                          </svg>
                          <span className="text-red-700">Borrar</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botón cerrar (extra, por si no se quiere usar la X) */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-300 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}