import React from 'react';
import { Project, TypographySettings } from '../../../types';
import { PROFESSIONAL_FONTS } from '../../../data/fonts';
import { Type, Sparkles } from 'lucide-react';

interface TypographyTabProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const TypographyTab: React.FC<TypographyTabProps> = ({ project, onChange }) => {
  const typo = project.typography;

  const handleTypoChange = (key: keyof TypographySettings, val: any) => {
    onChange({
      typography: {
        ...project.typography,
        [key]: val,
      },
    });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Type className="w-4 h-4 text-rose-600" />
            Catálogo Tipográfico Profesional (22 Fuentes Libres)
          </h4>
          <p className="text-slate-500 text-[11px] mt-1">
            Tipografías web optimizadas para alto rendimiento en celulares y pantallas retina de escritorio.
          </p>
        </div>

        {/* Live Typographic Preview Box */}
        <div className="p-5 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
            Vista Previa Tipográfica en Vivo
          </span>
          <h2
            className={`text-2xl font-bold ${
              PROFESSIONAL_FONTS.find((f) => f.name === typo.headingFont)?.cssClass || 'font-montserrat'
            }`}
            style={{
              fontWeight: typo.headingWeight,
              letterSpacing:
                typo.letterSpacing === 'wide'
                  ? '0.05em'
                  : typo.letterSpacing === 'wider'
                  ? '0.1em'
                  : typo.letterSpacing === 'tight'
                  ? '-0.03em'
                  : 'normal',
              textTransform: typo.textTransform,
            }}
          >
            {project.candidate.fullName || 'Jorge Meade González'}
          </h2>
          <p
            className={`text-sm text-slate-300 ${
              PROFESSIONAL_FONTS.find((f) => f.name === typo.bodyFont)?.cssClass || 'font-plusjakartasans'
            }`}
            style={{ fontWeight: typo.bodyWeight }}
          >
            {project.candidate.slogan ||
              'Experiencia, Firmeza y Resultados para las familias de Morelos.'}
          </p>
        </div>

        {/* Heading Font Picker */}
        <div className="space-y-2">
          <label className="block font-semibold text-slate-700">
            Tipografía para Titulares y Eslogans ({typo.headingFont}):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
            {PROFESSIONAL_FONTS.map((font) => {
              const isSelected = typo.headingFont === font.name;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => handleTypoChange('headingFont', font.name)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-white shadow-sm ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`block text-sm font-bold text-slate-900 truncate mb-1 ${font.cssClass}`}
                  >
                    {font.name}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1 block">
                    {font.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body Font Picker */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block font-semibold text-slate-700">
            Tipografía para Textos y Propuestas ({typo.bodyFont}):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-52 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
            {PROFESSIONAL_FONTS.map((font) => {
              const isSelected = typo.bodyFont === font.name;
              return (
                <button
                  key={`body-${font.id}`}
                  type="button"
                  onClick={() => handleTypoChange('bodyFont', font.name)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-white shadow-sm ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className={`block text-xs font-semibold text-slate-900 truncate ${font.cssClass}`}>
                    {font.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Micro-typographic Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Grosor del Titular:
            </label>
            <select
              value={typo.headingWeight}
              onChange={(e) => handleTypoChange('headingWeight', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium"
            >
              <option value="400">Regular (400)</option>
              <option value="600">Semibold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extrabold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Espaciado entre Letras (Tracking):
            </label>
            <select
              value={typo.letterSpacing}
              onChange={(e) => handleTypoChange('letterSpacing', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium"
            >
              <option value="tight">Ajustado (-0.03em)</option>
              <option value="normal">Normal (0)</option>
              <option value="wide">Amplio (+0.05em)</option>
              <option value="wider">Muy Amplio (+0.1em)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Transformación del Texto:
            </label>
            <select
              value={typo.textTransform}
              onChange={(e) => handleTypoChange('textTransform', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium"
            >
              <option value="none">Normal (Como se escribe)</option>
              <option value="uppercase">MAYÚSCULAS</option>
              <option value="capitalize">Tipo Título</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
