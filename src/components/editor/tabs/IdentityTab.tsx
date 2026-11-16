import React from 'react';
import { Project, ColorPalette } from '../../../types';
import { MORELOS_PARTIES } from '../../../data/parties';
import { Palette, Check } from 'lucide-react';

interface IdentityTabProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const IdentityTab: React.FC<IdentityTabProps> = ({ project, onChange }) => {
  const currentParty = MORELOS_PARTIES.find((p) => p.id === project.partyId) || MORELOS_PARTIES[0];

  const handlePartySelect = (partyId: string) => {
    const selected = MORELOS_PARTIES.find((p) => p.id === partyId);
    if (!selected) return;

    onChange({
      partyId,
      palette: { ...selected.defaultPalette },
    });
  };

  const handlePaletteColorChange = (key: keyof ColorPalette, val: string) => {
    onChange({
      palette: {
        ...project.palette,
        [key]: val,
      },
    });
  };

  const toggleCoalitionParty = (partyId: string) => {
    const current = project.coalitionParties || [];
    if (current.includes(partyId)) {
      onChange({ coalitionParties: current.filter((id) => id !== partyId) });
    } else {
      onChange({ coalitionParties: [...current, partyId] });
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <legend className="font-bold text-sm">Imagen de fondo</legend>
        <label className="block space-y-1">
          <span>Subir imagen original</span>
          <input className="block w-full" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={event => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => onChange({ backgroundImageUrl: String(reader.result) });
              reader.onerror = () => window.alert('No se pudo leer la imagen de fondo.');
              reader.readAsDataURL(file);
            }} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">Ajuste
            <select value={project.backgroundAppearance?.fit || 'cover'} onChange={event => onChange({ backgroundAppearance: { ...project.backgroundAppearance, fit: event.target.value === 'contain' ? 'contain' : 'cover' } })}>
              <option value="cover">Cubrir</option><option value="contain">Mostrar completa</option>
            </select>
          </label>
          {([
            ['opacity', 'Opacidad', 0, 100, 100], ['blur', 'Desenfoque', 0, 24, 0],
            ['zoom', 'Tamaño (%)', 100, 200, 100], ['x', 'Posición horizontal', 0, 100, 50],
            ['y', 'Posición vertical', 0, 100, 50],
          ] as const).map(([key, label, min, max, fallback]) => (
            <label key={key} className="grid gap-1">{label} · {project.backgroundAppearance?.[key] ?? fallback}
              <input type="range" min={min} max={max} value={project.backgroundAppearance?.[key] ?? fallback}
                onChange={event => onChange({ backgroundAppearance: { ...project.backgroundAppearance, [key]: Number(event.target.value) } })} />
            </label>
          ))}
        </div>
        {project.backgroundImageUrl && <>
          <img src={project.backgroundImageUrl} alt="Vista previa del fondo" className="h-28 w-full rounded-lg object-cover" />
          <button type="button" onClick={() => onChange({ backgroundImageUrl: '' })} className="font-semibold text-rose-700">Quitar imagen</button>
        </>}
      </fieldset>
      <label className="block rounded-xl border border-slate-200 bg-white p-5 space-y-2">
        <span className="block font-bold text-sm">WhatsApp para reportes ciudadanos</span>
        <input type="tel" value={project.citizenWhatsApp || ''} placeholder="+52 777 000 0000"
          onChange={event => onChange({ citizenWhatsApp: event.target.value })}
          className="w-full rounded-lg border border-slate-300 p-2" />
        <span className="block text-slate-600">Si lo dejas vacío, se usa el número del botón de WhatsApp del perfil.</span>
      </label>
      {/* Political Party Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Palette className="w-4 h-4 text-rose-600" />
            Catálogo Oficial de Partidos e Identidad (Morelos)
          </h4>
          <p className="text-slate-500 text-[11px] mt-1">
            Selecciona el registro político inicial. Las paletas son referencias de diseño completamente editables.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {MORELOS_PARTIES.map((party) => {
            const isSelected = project.partyId === party.id;
            return (
              <button
                key={party.id}
                type="button"
                onClick={() => handlePartySelect(party.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="font-bold text-xs truncate">{party.shortName}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                </div>

                {/* Party Color Swatches */}
                <div className="flex items-center gap-1 my-1.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: party.defaultPalette.primary }}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: party.defaultPalette.secondary }}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: party.defaultPalette.accent }}
                  />
                </div>

                <span
                  className={`text-[10px] line-clamp-1 ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {party.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coalitions & Multi-party Alliances */}
      {(project.partyId === 'COALICION' ||
        project.partyId === 'CANDIDATURA_COMUN' ||
        (project.coalitionParties && project.coalitionParties.length > 0)) && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-900 text-sm">Partidos Integrantes de la Coalición</h4>
          <p className="text-slate-500 text-[11px]">
            Marca los partidos que conforman la alianza electoral para desplegar sus emblemas en conjunto.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {MORELOS_PARTIES.filter(
              (p) => !['COALICION', 'CANDIDATURA_COMUN', 'SIN_PARTIDO', 'JUDICIAL_NEUTRAL'].includes(p.id)
            ).map((p) => {
              const active = project.coalitionParties?.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleCoalitionParty(p.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.defaultPalette.primary }}
                  />
                  {p.shortName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Palette Customizer */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Paleta Cromática Personalizada ({project.palette.name})
            </h4>
            <p className="text-slate-500 text-[11px]">
              Modifica los códigos HEX, degradados y tonos para cada elemento de la tarjeta.
            </p>
          </div>
        </div>

        {/* Live Color Bar */}
        <div
          className="h-10 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center font-bold text-white text-xs"
          style={{
            background:
              project.palette.gradient ||
              `linear-gradient(135deg, ${project.palette.primary} 0%, ${project.palette.secondary} 100%)`,
          }}
        >
          {project.candidate.fullName} · {project.role}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {/* Primary */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Color Primario (Dominante):</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={project.palette.primary}
                onChange={(e) => handlePaletteColorChange('primary', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={project.palette.primary}
                onChange={(e) => handlePaletteColorChange('primary', e.target.value)}
                className="flex-1 p-2 rounded-lg border border-slate-200 font-mono text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Secondary */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Color Secundario:</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={project.palette.secondary}
                onChange={(e) => handlePaletteColorChange('secondary', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={project.palette.secondary}
                onChange={(e) => handlePaletteColorChange('secondary', e.target.value)}
                className="flex-1 p-2 rounded-lg border border-slate-200 font-mono text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Accent */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Color de Acento (Botones):</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={project.palette.accent}
                onChange={(e) => handlePaletteColorChange('accent', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={project.palette.accent}
                onChange={(e) => handlePaletteColorChange('accent', e.target.value)}
                className="flex-1 p-2 rounded-lg border border-slate-200 font-mono text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Fondo General de la Tarjeta:</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={project.palette.background}
                onChange={(e) => handlePaletteColorChange('background', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={project.palette.background}
                onChange={(e) => handlePaletteColorChange('background', e.target.value)}
                className="flex-1 p-2 rounded-lg border border-slate-200 font-mono text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Surface */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Superficie de Tarjetas:</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={project.palette.surface}
                onChange={(e) => handlePaletteColorChange('surface', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={project.palette.surface}
                onChange={(e) => handlePaletteColorChange('surface', e.target.value)}
                className="flex-1 p-2 rounded-lg border border-slate-200 font-mono text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Color de Texto Principal:</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={project.palette.text}
                onChange={(e) => handlePaletteColorChange('text', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={project.palette.text}
                onChange={(e) => handlePaletteColorChange('text', e.target.value)}
                className="flex-1 p-2 rounded-lg border border-slate-200 font-mono text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Gradient Generator Field */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block font-semibold text-slate-700 mb-1">
            Degradado CSS Personalizado:
          </label>
          <input
            type="text"
            value={
              project.palette.gradient ||
              `linear-gradient(135deg, ${project.palette.primary} 0%, ${project.palette.secondary} 100%)`
            }
            onChange={(e) => handlePaletteColorChange('gradient', e.target.value)}
            placeholder="linear-gradient(135deg, #003DA5 0%, #005EB8 100%)"
            className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-900 font-medium"
          />
        </div>
      </div>
    </div>
  );
};
