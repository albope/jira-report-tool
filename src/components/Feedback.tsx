"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lightbulb, X, CheckSquare, Square, Trash2, MessageSquarePlus } from 'lucide-react'; // Importar iconos
import { format, parseISO } from 'date-fns'; // Para formatear fechas
import { es } from 'date-fns/locale'; // Para formato en español

/**
 * Estructura de cada feedback guardado.
 */
interface FeedbackMessage {
  id: string; // Cambiado de timestamp a id para más flexibilidad
  name: string;
  description: string;
  timestamp: string; // Sigue siendo ISO string para almacenamiento
  done: boolean;
}

export default function Feedback() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [feedbackList, setFeedbackList] = useState<FeedbackMessage[]>([]);

  // Refs para manejar el foco
  const modalRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  /**
   * Al montar, cargamos la lista de feedback de localStorage.
   */
  useEffect(() => {
    try {
      const storedFeedback = localStorage.getItem("feedbackMessages");
      if (storedFeedback) {
        setFeedbackList(JSON.parse(storedFeedback));
      }
    } catch (error) {
      console.error("Error al cargar feedback de localStorage:", error);
      // Opcional: limpiar localStorage si está corrupto
      // localStorage.removeItem("feedbackMessages");
    }
  }, []);

  /**
   * Efecto para manejar el foco cuando el modal se abre/cierra.
   */
  useEffect(() => {
    if (isModalOpen) {
      nameInputRef.current?.focus(); // Foco en el primer campo
    } else {
      openButtonRef.current?.focus(); // Devolver foco al botón que abrió el modal
    }
  }, [isModalOpen]);


  const saveFeedbackToStorage = (messages: FeedbackMessage[]) => {
    try {
      localStorage.setItem("feedbackMessages", JSON.stringify(messages));
    } catch (error) {
      console.error("Error al guardar feedback en localStorage:", error);
      // Aquí podrías notificar al usuario que no se pudo guardar, etc.
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) {
      alert("Por favor, completa todos los campos obligatorios."); // Feedback más directo
      return;
    }

    const newFeedback: FeedbackMessage = {
      id: new Date().toISOString(), // Usar timestamp como ID simple y único
      name: name.trim(),
      description: description.trim(),
      timestamp: new Date().toISOString(),
      done: false,
    };

    // Actualización inmutable
    const updatedFeedback = [newFeedback, ...feedbackList]; // Añadir al principio para ver los más nuevos primero
    setFeedbackList(updatedFeedback);
    saveFeedbackToStorage(updatedFeedback);

    setName("");
    setDescription("");
    // Opcional: Cerrar el modal después de enviar
    // setIsModalOpen(false); 
    alert("¡Gracias por tu feedback!"); // O un toast más elegante
  };

  const handleToggleDone = (id: string) => {
    const updatedFeedback = feedbackList.map(fb =>
      fb.id === id ? { ...fb, done: !fb.done } : fb
    );
    setFeedbackList(updatedFeedback);
    saveFeedbackToStorage(updatedFeedback);
  };

  const handleDeleteFeedback = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este feedback?")) {
      const updatedFeedback = feedbackList.filter(fb => fb.id !== id);
      setFeedbackList(updatedFeedback);
      saveFeedbackToStorage(updatedFeedback);
    }
  };

  // Formatear fecha para mostrar
  const formatTimestamp = (isoString: string) => {
    try {
      return format(parseISO(isoString), "d MMM yyyy, HH:mm", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  return (
    <>
      <button
        ref={openButtonRef}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3.5 rounded-full shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 transition-transform hover:scale-105 z-50 flex items-center"
        aria-label="Enviar Feedback o Reportar Bug"
      >
        <MessageSquarePlus size={24} className="mr-0 sm:mr-2"/> {/* Icono Ajustado */}
        <span className="hidden sm:inline">Feedback + Bugs</span>
      </button>

      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[60] p-4" // z-index aumentado
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          <div
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" // Overlay con blur
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div 
            ref={modalRef}
            className="relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg z-[70] transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modalOpen" // Estilo y animación
            // Animación simple (requiere definir keyframes en CSS global)
            // @keyframes modalOpen { to { scale: 1; opacity: 1; } } .animate-modalOpen { animation: modalOpen 0.3s forwards; }
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Cerrar"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>

            <h2 id="feedback-modal-title" className="text-2xl font-semibold text-gray-800 mb-6">Enviar Feedback / Reportar Bug</h2>

            <div className="space-y-5"> {/* Aumentado space-y */}
              <div>
                <label htmlFor="feedback-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="feedback-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full border rounded-md p-2.5 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    name.trim() === "" && description.length > 0 ? "border-red-400" : "border-gray-300" // Valida solo si se interactuó
                  }`}
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label htmlFor="feedback-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full border rounded-md p-2.5 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    description.trim() === "" && name.length > 0 ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="Describe tu feedback o bug detalladamente..."
                  rows={5} // Aumentadas filas
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3"> {/* Botones alineados y con gap */}
              <button
                onClick={handleSubmit}
                disabled={name.trim() === "" || description.trim() === ""}
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enviar Feedback
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
            
            {feedbackList.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Feedback Registrado</h3>
                <ul className="max-h-60 overflow-y-auto space-y-4 pr-2"> {/* Scrollbar estilizado (necesitaría tailwind-scrollbar plugin o CSS custom) */}
                  {feedbackList.map((item) => (
                    <li key={item.id} className={`p-4 rounded-lg shadow transition-colors ${item.done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-semibold ${item.done ? 'text-green-700' : 'text-gray-800'}`}>
                          {item.name}
                        </p>
                        <span className={`text-xs ${item.done ? 'text-green-600' : 'text-gray-500'}`}>
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                      <p className={`text-sm ${item.done ? 'text-green-800 line-through' : 'text-gray-700'} mb-3 whitespace-pre-wrap`}>{item.description}</p>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleToggleDone(item.id)}
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
                            ${item.done 
                              ? 'border-gray-300 text-gray-600 hover:bg-gray-100 focus:ring-gray-400' 
                              : 'border-green-500 bg-green-500 text-white hover:bg-green-600 focus:ring-green-400'}`}
                        >
                          {item.done ? <Square size={14} className="mr-1.5" /> : <CheckSquare size={14} className="mr-1.5" />}
                          {item.done ? "Marcar Pendiente" : "Marcar Hecho"}
                        </button>
                        <button
                          onClick={() => handleDeleteFeedback(item.id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-red-300 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400 transition-colors"
                          title="Borrar feedback"
                        >
                          <Trash2 size={14} className="mr-1.5" />
                          Borrar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}