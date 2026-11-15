import React, { useState } from 'react';
import { Project } from '../../../types';
import { api } from '../../../services/api';
import { Sparkles, Check, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface AiAssistantTabProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const AiAssistantTab: React.FC<AiAssistantTabProps> = ({ project, onChange }) => {
  const [task, setTask] = useState<
    'corregir' | 'semblanza' | 'propuestas' | 'faq' | 'sintesis'
  >('semblanza');

  const [inputText, setInputText] = useState(project.candidate.bio || '');
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [appliedMsg, setAppliedMsg] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Por favor escribe o pega el texto que deseas procesar.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setAppliedMsg(false);

    try {
      const response = await api.askAiAssistant({
        task,
        text: inputText,
        candidateName: project.candidate.fullName,
        role: project.role,
        municipality: project.candidate.municipality || 'Morelos',
        party: project.partyId,
      });

      if (response.success) {
        setResultText(response.result);
      } else {
        setErrorMsg('Error al generar la propuesta.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el asistente.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToProject = () => {
    if (!resultText) return;

    if (task === 'semblanza' || task === 'corregir') {
      onChange({
        candidate: {
          ...project.candidate,
          bio: resultText,
        },
      });
    } else if (task === 'sintesis') {
      onChange({
        candidate: {
          ...project.candidate,
          slogan: resultText.split('\n')[0]?.replace(/["*]/g, '') || project.candidate.slogan,
        },
      });
    }

    setAppliedMsg(true);
    setTimeout(() => setAppliedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            Asistente de Redacción Política & Estrategia LAV
          </h4>
          <p className="text-slate-500 text-[11px] mt-1">
            Optimiza la redacción, el tono y la claridad sin inventar datos biográficos ni cargos falsos. Tú siempre apruebas el resultado antes de publicarlo.
          </p>
        </div>

        {/* Task Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 'semblanza', label: 'Mejorar Semblanza' },
            { id: 'corregir', label: 'Corregir Ortografía' },
            { id: 'propuestas', label: 'Estructurar Propuestas' },
            { id: 'faq', label: 'Generar Preguntas FAQ' },
            { id: 'sintesis', label: 'Sintetizar Eslogan' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTask(t.id as any);
                if (t.id === 'semblanza' && project.candidate.bio) {
                  setInputText(project.candidate.bio);
                }
              }}
              className={`p-2.5 rounded-lg border font-semibold text-xs text-center transition-colors cursor-pointer ${
                task === t.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Input Text Area */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-700">
            Texto o Datos Base del Candidato:
          </label>
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Pega aquí borradores de discursos, notas curriculares o propuestas..."
            className="w-full p-3 rounded-lg border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                Optimizando con IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-rose-400" />
                Procesar con Asistente
              </>
            )}
          </button>
        </div>

        {/* Result Area */}
        {resultText && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 text-xs uppercase tracking-wider">
                Propuesta Generada (Sujeta a Aprobación):
              </label>

              <button
                type="button"
                onClick={handleApplyToProject}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {appliedMsg ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    ¡Aplicado al Proyecto!
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-3.5 h-3.5" />
                    Aplicar al Proyecto
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed whitespace-pre-line text-xs font-medium">
              {resultText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
