import React, { useState } from 'react';
import { Project } from '../../../types';
import { DESIGN_FAMILIES } from '../../../data/templates';
import { LayoutTemplate, BookmarkPlus, Check, Sparkles } from 'lucide-react';
import { api } from '../../../services/api';

interface TemplatesTabProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({ project, onChange }) => {
  const [templateSavedMsg, setTemplateSavedMsg] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const selectedFamily =
    DESIGN_FAMILIES.find((f) => f.id === project.designFamily) || DESIGN_FAMILIES[0];

  const handleSelectFamily = (familyId: string) => {
    const fam = DESIGN_FAMILIES.find((f) => f.id === familyId);
    if (!fam) return;

    onChange({
      designFamily: familyId,
      variantId: fam.variants[0]?.id || '',
    });
  };

  const handleSelectVariant = (variantId: string) => {
    onChange({ variantId });
  };

  const handleSaveAsCustomTemplate = async () => {
    setSavingTemplate(true);
    try {
      await api.saveTemplate({
        name: `Plantilla ${selectedFamily.name} — ${project.candidate.shortName || project.internalName}`,
        description: `Variante: ${project.variantId} con paleta de ${project.partyId}`,
        designFamily: project.designFamily,
        variantId: project.variantId,
        palette: project.palette,
        typography: project.typography,
      });
      setTemplateSavedMsg(true);
      setTimeout(() => setTemplateSavedMsg(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-rose-600" />
              10 Familias de Diseño & 50 Variantes Estructurales Reales
            </h4>
            <p className="text-slate-500 text-[11px] mt-1">
              Las variantes modifican la composición: portada, fotografías, distribución de columnas, tarjetas y ritmo visual.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAsCustomTemplate}
            disabled={savingTemplate}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            {templateSavedMsg ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Guardada en Estudio
              </>
            ) : (
              <>
                <BookmarkPlus className="w-3.5 h-3.5" />
                Guardar como Nueva Plantilla
              </>
            )}
          </button>
        </div>

        {/* 10 Design Families Selector */}
        <div className="space-y-2">
          <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            1. Selecciona la Familia de Diseño:
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {DESIGN_FAMILIES.map((fam) => {
              const active = project.designFamily === fam.id;
              return (
                <button
                  key={fam.id}
                  type="button"
                  onClick={() => handleSelectFamily(fam.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <span className="font-bold text-xs block mb-1 truncate">{fam.name}</span>
                  <span
                    className={`text-[10px] line-clamp-2 leading-tight ${
                      active ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {fam.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5 Real Layout Variants for Selected Family */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              2. Elige una de las 5 Variantes de Composición para "{selectedFamily.name}":
            </label>
            <span className="text-[11px] text-slate-400">5 variantes únicas por familia</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {selectedFamily.variants.map((v) => {
              const isSelected = project.variantId === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectVariant(v.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-bold text-xs text-slate-900">{v.name}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-rose-400" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{v.description}</p>
                  </div>

                  {/* Wireframe Mock Silhouette */}
                  <div className="mt-3 p-2 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-300 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 w-3/4 bg-slate-300 rounded" />
                      <div className="h-1.5 w-1/2 bg-slate-200 rounded" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
          <span>
            Cualquier cargo o planilla puede combinarse libremente con cualquiera de las 10 familias de diseño y sus 5 variantes.
          </span>
        </div>
      </div>
    </div>
  );
};
