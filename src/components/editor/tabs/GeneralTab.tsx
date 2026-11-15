import React, { useState, useEffect } from 'react';
import { Project, PoliticalCategory, PoliticalStage } from '../../../types';
import { POLITICAL_ROLES, POLITICAL_STAGES, MORELOS_MUNICIPALITIES } from '../../../data/categories';
import { api } from '../../../services/api';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface GeneralTabProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ project, onChange }) => {
  const [slugStatus, setSlugStatus] = useState<{
    valid: boolean;
    message: string;
    loading: boolean;
  }>({
    valid: true,
    message: '',
    loading: false,
  });

  const [slugWarning, setSlugWarning] = useState<string | null>(null);

  // Debounced slug check
  useEffect(() => {
    if (!project.slug) return;
    const timer = setTimeout(async () => {
      setSlugStatus((prev) => ({ ...prev, loading: true }));
      try {
        const res = await api.checkSlug(project.slug, project.id);
        setSlugStatus({
          valid: res.valid,
          message: res.message,
          loading: false,
        });

        // Warning if changing an already published slug
        if (
          project.status === 'publicado' &&
          project.previousSlugs &&
          !project.previousSlugs.includes(project.slug)
        ) {
          setSlugWarning(
            'Atención: Modificar el slug de un proyecto publicado cambiará la URL pública oficial. La dirección anterior quedará guardada en el historial de redirección.'
          );
        } else {
          setSlugWarning(null);
        }
      } catch (e) {
        setSlugStatus({ valid: false, message: 'Error validando slug', loading: false });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [project.slug, project.id, project.status, project.previousSlugs]);

  const handleSlugInput = (val: string) => {
    const sanitized = val
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
    onChange({ slug: sanitized });
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Internal Name */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">Identificación Interna del Proyecto</h4>
        <p className="text-slate-500 text-[11px]">
          Nombre de control interno para el administrador de LAV Digital MKT (no visible en la URL).
        </p>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Nombre Interno del Proyecto:
          </label>
          <input
            type="text"
            value={project.internalName}
            onChange={(e) => onChange({ internalName: e.target.value })}
            placeholder="Ej. Jorge Meade — Diputado Local Cuernavaca"
            className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
          />
        </div>

        {/* Public Slug URL */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block font-semibold text-slate-700 mb-1">
            Dirección Pública o Slug (URL Oficial):
          </label>
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-500 bg-slate-100 px-3 py-2.5 rounded-lg border border-slate-200 select-none shrink-0 text-[11px]">
              https://lavdigitalmkt.com/elecciones/
            </span>
            <input
              type="text"
              value={project.slug}
              onChange={(e) => handleSlugInput(e.target.value)}
              placeholder="jorge-meade"
              className="flex-1 p-2.5 rounded-lg border border-slate-200 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold"
            />
          </div>

          {/* Validation Feedback */}
          <div className="mt-2 flex items-center gap-1.5">
            {slugStatus.loading ? (
              <span className="text-[11px] text-slate-400">Verificando disponibilidad...</span>
            ) : slugStatus.valid ? (
              <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {slugStatus.message || 'Dirección disponible para publicación'}
              </span>
            ) : (
              <span className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {slugStatus.message}
              </span>
            )}
          </div>

          {/* Warning on slug change */}
          {slugWarning && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{slugWarning}</span>
            </div>
          )}
        </div>
      </div>

      {/* Political Category & Stage */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">Categoría, Nivel y Etapa Electoral</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nivel / Categoría de Cargo:
            </label>
            <select
              value={project.category}
              onChange={(e) => onChange({ category: e.target.value as PoliticalCategory })}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white font-medium"
            >
              <option value="federal">Federal (Presidencia, Senado, Dip. Federal)</option>
              <option value="estatal">Estatal (Gubernatura, Dip. Local Morelos)</option>
              <option value="municipal">Municipal (Alcaldía, Sindicatura, Regidurías)</option>
              <option value="cdmx">Ciudad de México (Alcaldía, Concejalía)</option>
              <option value="auxiliar">Autoridades Auxiliares (Ayudantía Municipal, Poblado)</option>
              <option value="judicial">Poder Judicial (Ministratura, Magistratura, Jueces)</option>
              <option value="otra">Otra Modalidad (Institucional, Social, Comunitario)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cargo Específico Postulado:
            </label>
            <input
              type="text"
              list="roles-list"
              value={project.role}
              onChange={(e) => onChange({ role: e.target.value })}
              placeholder="Ej. Diputación Local Distrito I"
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
            />
            <datalist id="roles-list">
              {POLITICAL_ROLES.map((r) => (
                <option key={r.id} value={r.name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Etapa Política:
            </label>
            <select
              value={project.stage}
              onChange={(e) => onChange({ stage: e.target.value as PoliticalStage })}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white font-medium"
            >
              {POLITICAL_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Municipio de Morelos:
            </label>
            <select
              value={project.candidate.municipality || 'Cuernavaca'}
              onChange={(e) =>
                onChange({
                  candidate: { ...project.candidate, municipality: e.target.value },
                })
              }
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white font-medium"
            >
              {MORELOS_MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Distrito / Poblado:
            </label>
            <input
              type="text"
              value={project.candidate.district || ''}
              onChange={(e) =>
                onChange({
                  candidate: { ...project.candidate, district: e.target.value },
                })
              }
              placeholder="Ej. Distrito I o Poblado de Ocotepec"
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
            />
          </div>
        </div>

        {/* Project Status */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="font-semibold text-slate-700 block">Estado de Publicación:</span>
            <span className="text-[11px] text-slate-500">
              Solo los proyectos en "Publicado" son accesibles por la ciudadanía en la URL pública.
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(['borrador', 'publicado', 'archivado'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onChange({ status: st })}
                className={`px-3 py-1.5 rounded-lg font-semibold uppercase text-[10px] transition-colors ${
                  project.status === st
                    ? st === 'publicado'
                      ? 'bg-emerald-600 text-white'
                      : st === 'archivado'
                      ? 'bg-slate-700 text-white'
                      : 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
