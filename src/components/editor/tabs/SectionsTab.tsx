import { SectionContentFields } from './SectionContentFields';
import React, { useState } from 'react';
import { Project, SectionConfig, SectionType } from '../../../types';
import {
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SectionsTabProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

const AVAILABLE_SECTION_TYPES: Array<{ type: SectionType; title: string; defaultSubtitle: string }> = [
  { type: 'hero', title: 'Portada', defaultSubtitle: '' },
  { type: 'slate', title: 'Planilla Municipal', defaultSubtitle: '' },
  { type: 'custom_buttons', title: 'Botones', defaultSubtitle: '' },
  { type: 'bio', title: 'Biografía & Semblanza', defaultSubtitle: 'Historia de servicio y compromiso con Morelos' },
  { type: 'trajectory', title: 'Trayectoria Política', defaultSubtitle: 'Años de servicio público y resultados' },
  { type: 'education', title: 'Formación Académica', defaultSubtitle: 'Estudios profesionales y certificaciones' },
  { type: 'experience', title: 'Experiencia y Cargos', defaultSubtitle: 'Gestión pública y liderazgo acreditado' },
  { type: 'proposals', title: 'Propuestas de Campaña', defaultSubtitle: 'Compromisos firmes y soluciones para la gente' },
  { type: 'commitments', title: 'Decálogo de Compromisos', defaultSubtitle: 'Palabra de honor empeñada con el pueblo' },
  { type: 'results', title: 'Resultados y Logros', defaultSubtitle: 'Hechos verificables, no promesas vacías' },
  { type: 'agenda', title: 'Agenda y Recorridos', defaultSubtitle: 'Próximas visitas a colonias y asambleas' },
  { type: 'gallery', title: 'Galería Fotográfica', defaultSubtitle: 'Momentos en territorio y cercanía ciudadana' },
  { type: 'videos', title: 'Videos y Mensajes', defaultSubtitle: 'Spots de campaña y entrevistas oficiales' },
  { type: 'press', title: 'Sala de Prensa', defaultSubtitle: 'Comunicados y posicionamientos en medios' },
  { type: 'social', title: 'Redes Sociales Oficiales', defaultSubtitle: 'Sigue nuestras transmisiones y actividades' },
  { type: 'contact', title: 'Contacto & Casa de Gestión', defaultSubtitle: 'Atención directa y personalizada' },
  { type: 'faq', title: 'Preguntas Frecuentes', defaultSubtitle: 'Respuestas directas y transparentes' },
  { type: 'documents', title: 'Documentos PDF Descargables', defaultSubtitle: 'Plan de gobierno, CV y manifiestos oficiales' },
  { type: 'custom_html', title: 'Módulo Personalizado', defaultSubtitle: 'Contenido adicional específico' },
];

export const SectionsTab: React.FC<SectionsTabProps> = ({ project, onChange }) => {
  const sections = [...(project.sections || [])].sort((a, b) => a.order - b.order);
  if (!project.meta?.sectionsManaged && project.municipalSlate?.members?.length && !sections.some(section => section.type === 'slate')) {
    sections.splice(2, 0, { id: 'legacy-slate', type: 'slate', title: project.municipalSlate.slateName || 'Planilla Municipal', order: 3, enabled: true, data: {} });
  }
  const [expandedSecId, setExpandedSecId] = useState<string | null>(null);

  const handleSectionsChange = (updated: SectionConfig[]) => {
    onChange({ sections: updated.map((section, index) => ({ ...section, order: index + 1 })), meta: { ...project.meta, sectionsManaged: true } });
  };

  const toggleSection = (id: string) => {
    handleSectionsChange(
      sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const copy = [...sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Reassign order
    const reordered = copy.map((s, i) => ({ ...s, order: i + 1 }));
    handleSectionsChange(reordered);
  };

  const duplicateSection = (sec: SectionConfig) => {
    const copy: SectionConfig = {
      ...JSON.parse(JSON.stringify(sec)),
      id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `${sec.title} (Copia)`,
      order: sections.length + 1,
    };
    handleSectionsChange([...sections, copy]);
  };

  const removeSection = (id: string) => {
    handleSectionsChange(sections.filter((s) => s.id !== id));
    if (expandedSecId === id) setExpandedSecId(null);
  };

  const addNewSection = (secType: SectionType) => {
    const def = AVAILABLE_SECTION_TYPES.find((t) => t.type === secType) || {
      type: secType,
      title: 'Nueva Sección',
      defaultSubtitle: '',
    };

    const newSec: SectionConfig = {
      id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: secType,
      title: def.title,
      subtitle: def.defaultSubtitle,
      enabled: true,
      order: sections.length + 1,
      data: {
        items: [],
      },
    };

    handleSectionsChange([...sections, newSec]);
    setExpandedSecId(newSec.id);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-600" />
              Gestor Modular de Secciones
            </h4>
            <p className="text-slate-500 text-[11px] mt-1">
              Todas las secciones son opcionales, reordenables, renombrables y personalizables.
            </p>
          </div>
        </div>

        {/* Add New Section Dropdown */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
          <span className="font-semibold text-slate-700 whitespace-nowrap">
            Agregar Sección:
          </span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addNewSection(e.target.value as SectionType);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="flex-1 p-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-medium cursor-pointer"
          >
            <option value="" disabled>
              Selecciona el tipo de sección a añadir...
            </option>
            {AVAILABLE_SECTION_TYPES.map((t) => (
              <option key={t.type} value={t.type}>
                + {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Sections List */}
        <div className="space-y-2.5">
          {sections.map((sec, index) => {
            const isExpanded = expandedSecId === sec.id;
            return (
              <div
                key={sec.id}
                className={`rounded-xl border transition-all ${
                  sec.enabled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[11px] shrink-0">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSection(sec.id)}
                      className={`p-1 rounded transition-colors ${
                        sec.enabled
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-slate-400 hover:bg-slate-200'
                      }`}
                      title={sec.enabled ? 'Sección Activa (clic para ocultar)' : 'Sección Inactiva (clic para activar)'}
                    >
                      {sec.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <div className="truncate">
                      <span className="font-bold text-slate-900 text-xs block truncate">
                        {sec.title}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        Tipo: {sec.type}
                      </span>
                    </div>
                  </div>

                  {/* Order & Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveSection(index, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Subir"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === sections.length - 1}
                      onClick={() => moveSection(index, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Bajar"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateSection(sec)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="Duplicar sección"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(sec.id)}
                      className="p-1 text-rose-400 hover:text-rose-600"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedSecId(isExpanded ? null : sec.id)}
                      className="p-1 text-slate-500 hover:text-slate-800"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Section Settings */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Título Visible de la Sección:
                        </label>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleSectionsChange(
                              sections.map((s) => (s.id === sec.id ? { ...s, title: val } : s))
                            );
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Subtítulo o Frase Kicker:
                        </label>
                        <input
                          type="text"
                          value={sec.subtitle || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleSectionsChange(
                              sections.map((s) => (s.id === sec.id ? { ...s, subtitle: val } : s))
                            );
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                    <SectionContentFields section={sec} onChange={data =>
                      handleSectionsChange(sections.map(section => section.id === sec.id ? { ...section, data } : section))
                    } />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
