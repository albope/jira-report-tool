"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, CheckSquare, Square, Trash2, MessageSquarePlus, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase, DBFeedback } from '@/lib/supabase';

export default function Feedback() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [feedbackList, setFeedbackList] = useState<DBFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Cargar feedbacks desde Supabase
  const loadFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbackList(data || []);
    } catch (error) {
      console.error("Error al cargar feedback:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      loadFeedback();
      nameInputRef.current?.focus();
    } else {
      openButtonRef.current?.focus();
    }
  }, [isModalOpen, loadFeedback]);

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          name: name.trim(),
          description: description.trim(),
          done: false,
        })
        .select()
        .single();

      if (error) throw error;

      setFeedbackList(prev => [data, ...prev]);
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Error al enviar feedback:", error);
      alert("Error al enviar feedback. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleDone = async (id: string, currentDone: boolean) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ done: !currentDone })
        .eq('id', id);

      if (error) throw error;

      setFeedbackList(prev =>
        prev.map(fb => fb.id === id ? { ...fb, done: !currentDone } : fb)
      );
    } catch (error) {
      console.error("Error al actualizar feedback:", error);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este feedback?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFeedbackList(prev => prev.filter(fb => fb.id !== id));
    } catch (error) {
      console.error("Error al eliminar feedback:", error);
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      return format(parseISO(isoString), "d MMM yyyy, HH:mm", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <>
      {/* Botón flotante con estilo premium */}
      <button
        ref={openButtonRef}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[var(--primary)] text-white font-medium shadow-theme-lg hover:bg-[var(--primary-hover)] hover:shadow-theme-xl hover:scale-105 transition-all duration-200"
        aria-label="Enviar Feedback o Reportar Bug"
      >
        <MessageSquarePlus size={20} />
        <span className="hidden sm:inline text-sm font-medium">Feedback + Bugs</span>
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[60] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          {/* Overlay con glass effect */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal con estilos premium */}
          <div
            ref={modalRef}
            className="relative card-premium-elevated p-6 sm:p-8 w-full max-w-lg z-[70] animate-modalOpen"
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              title="Cerrar"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>

            {/* Título */}
            <h2 id="feedback-modal-title" className="text-xl font-semibold text-[var(--foreground)] mb-6">
              Enviar Feedback / Reportar Bug
            </h2>

            {/* Formulario */}
            <div className="space-y-5">
              <div>
                <label htmlFor="feedback-name" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                  Nombre <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="feedback-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`input-premium ${
                    name.trim() === "" && description.length > 0 ? "border-[var(--error)] focus:border-[var(--error)]" : ""
                  }`}
                  placeholder="Tu nombre"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="feedback-description" className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                  Descripción <span className="text-[var(--error)]">*</span>
                </label>
                <textarea
                  id="feedback-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`input-premium resize-none ${
                    description.trim() === "" && name.length > 0 ? "border-[var(--error)] focus:border-[var(--error)]" : ""
                  }`}
                  placeholder="Describe tu feedback o bug detalladamente..."
                  rows={5}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <button
                onClick={handleSubmit}
                disabled={name.trim() === "" || description.trim() === "" || isSubmitting}
                className="btn-primary w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Feedback"
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            </div>

            {/* Lista de feedback registrado */}
            {(feedbackList.length > 0 || isLoading) && (
              <div className="mt-8 pt-6 border-t border-[var(--surface-border)]">
                <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">Feedback Registrado</h3>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
                  </div>
                ) : (
                  <ul className="max-h-60 overflow-y-auto space-y-3 pr-1">
                    {feedbackList.map((item) => (
                      <li
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          item.done
                            ? 'bg-[var(--success-soft)] border-[var(--success)]/20'
                            : 'bg-[var(--surface-hover)] border-[var(--surface-border)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className={`font-medium text-sm ${
                            item.done ? 'text-[var(--success)]' : 'text-[var(--foreground)]'
                          }`}>
                            {item.name}
                          </p>
                          <span className="text-xs text-[var(--foreground-tertiary)]">
                            {formatTimestamp(item.created_at)}
                          </span>
                        </div>
                        <p className={`text-sm mb-3 whitespace-pre-wrap ${
                          item.done
                            ? 'text-[var(--foreground-tertiary)] line-through'
                            : 'text-[var(--foreground-secondary)]'
                        }`}>
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleDone(item.id, item.done)}
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                              item.done
                                ? 'bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)]'
                                : 'bg-[var(--success)] text-white hover:bg-[var(--success-hover)]'
                            }`}
                          >
                            {item.done ? <Square size={14} className="mr-1.5" /> : <CheckSquare size={14} className="mr-1.5" />}
                            {item.done ? "Pendiente" : "Marcar Hecho"}
                          </button>
                          <button
                            onClick={() => handleDeleteFeedback(item.id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--error-soft)] text-[var(--error)] hover:bg-[var(--error)]/20 transition-all duration-200"
                            title="Borrar feedback"
                          >
                            <Trash2 size={14} className="mr-1.5" />
                            Borrar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
