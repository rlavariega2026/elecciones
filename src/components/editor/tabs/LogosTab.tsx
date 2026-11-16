import React, { useRef } from 'react';
import { Project, LogosConfig, LogoItem } from '../../../types';
import { Image, Eye, EyeOff, Trash2, Plus, Upload, Sliders } from 'lucide-react';

interface LogosTabProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const LogosTab: React.FC<LogosTabProps> = ({ project, onChange }) => {
  const logos = project.logos;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSlotRef = useRef<string | null>(null);

  const handleLogoChange = (key: keyof LogosConfig, val: any) => {
    onChange({
      logos: {
        ...project.logos,
        [key]: val,
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const slot = currentSlotRef.current;
    if (!file || !slot) return;

    // Read as Base64 Data URL (PNG, JPG, WebP, SVG)
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;

      if (slot === 'party') {
        handleLogoChange('partyLogoUrl', dataUrl);
      } else if (slot === 'candidate') {
        handleLogoChange('candidateLogoUrl', dataUrl);
      } else if (slot === 'campaign') {
        handleLogoChange('campaignLogoUrl', dataUrl);
      } else if (slot === 'slate') {
        handleLogoChange('slateLogoUrl', dataUrl);
      } else if (slot.startsWith('coalition-')) {
        const coalId = slot.replace('coalition-', '');
        const updated = (logos.coalitionLogos || []).map((l) =>
          l.id === coalId ? { ...l, url: dataUrl } : l
        );
        handleLogoChange('coalitionLogos', updated);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerUpload = (slot: string) => {
    currentSlotRef.current = slot;
    fileInputRef.current?.click();
  };

  const addCoalitionLogo = () => {
    const newLogo: LogoItem = {
      id: `coal-${Date.now()}`,
      name: 'Nuevo Partido Aliado',
      url: '',
      size: 48,
      visible: true,
    };
    handleLogoChange('coalitionLogos', [...(logos.coalitionLogos || []), newLogo]);
  };

  const removeCoalitionLogo = (id: string) => {
    handleLogoChange(
      'coalitionLogos',
      (logos.coalitionLogos || []).filter((l) => l.id !== id)
    );
  };

  return (
    <div className="space-y-6 text-xs">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
      />

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Image className="w-4 h-4 text-rose-600" />
            Gestión Independiente de Emblemas y Logotipos
          </h4>
          <p className="text-slate-500 text-[11px] mt-1">
            Sube o pega la dirección URL de cada logotipo (PNG, JPG, WebP o SVG). Cada emblema se controla de manera independiente sin alterar su contenido original.
          </p>
        </div>

        {/* Global Alignment */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="font-semibold text-slate-700">Alineación de Logotipos en Cabecera:</span>
          <div className="flex items-center gap-1">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => handleLogoChange('alignment', align)}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs capitalize transition-colors ${
                  logos.alignment === align
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {align === 'left' ? 'Izquierda' : align === 'center' ? 'Centrado' : 'Derecha'}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Logotipo del Partido Político */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs">1. Logotipo del Partido Político</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLogoChange('partyLogoVisible', !logos.partyLogoVisible)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                title={logos.partyLogoVisible ? 'Ocultar' : 'Mostrar'}
              >
                {logos.partyLogoVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              </button>
              {logos.partyLogoUrl && (
                <button
                  type="button"
                  onClick={() => handleLogoChange('partyLogoUrl', '')}
                  className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
              {logos.partyLogoUrl ? (
                <img src={logos.partyLogoUrl} alt="Logo Partido" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-[10px] text-slate-400 text-center">Sin Logo</span>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={logos.partyLogoUrl || ''}
                  onChange={(e) => handleLogoChange('partyLogoUrl', e.target.value)}
                  placeholder="Pega URL del logo o sube archivo..."
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-slate-900 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => triggerUpload('party')}
                  className="px-3 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center gap-1 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-600 font-medium">Tamaño: {logos.partyLogoSize || 64}px</span>
                <input
                  type="range"
                  min="32"
                  max={logos.partyLogoPlacement && logos.partyLogoPlacement !== 'header' ? 220 : 140}
                  value={logos.partyLogoSize || 64}
                  onChange={(e) => handleLogoChange('partyLogoSize', parseInt(e.target.value, 10))}
                  className="flex-1 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <label className="block font-semibold">Ubicación del logo del partido
            <select className="mt-1 block w-full rounded-lg border border-slate-200 p-2"
              value={logos.partyLogoPlacement || 'header'}
              onChange={event => handleLogoChange('partyLogoPlacement', event.target.value as typeof logos.partyLogoPlacement)}>
              <option value="header">Cabecera</option><option value="above-photo">Encima de la foto</option>
              <option value="below-photo">En la portada, junto a los datos</option>
            </select>
          </label>
          {logos.partyLogoPlacement && logos.partyLogoPlacement !== 'header' && (
            <label className="block font-semibold">Alineación del logo
              <select className="mt-1 block w-full rounded-lg border border-slate-200 p-2"
                value={logos.partyLogoAlignment || logos.alignment || 'left'}
                onChange={event => handleLogoChange('partyLogoAlignment', event.target.value as typeof logos.partyLogoAlignment)}>
                <option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option>
              </select>
            </label>
          )}
        </div>

        {/* 2. Logotipo Personal del Candidato */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs">2. Logotipo Personal del Candidato</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLogoChange('candidateLogoVisible', !logos.candidateLogoVisible)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200"
              >
                {logos.candidateLogoVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              </button>
              {logos.candidateLogoUrl && (
                <button
                  type="button"
                  onClick={() => handleLogoChange('candidateLogoUrl', '')}
                  className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
              {logos.candidateLogoUrl ? (
                <img src={logos.candidateLogoUrl} alt="Logo Candidato" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-[10px] text-slate-400 text-center">Sin Logo</span>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={logos.candidateLogoUrl || ''}
                  onChange={(e) => handleLogoChange('candidateLogoUrl', e.target.value)}
                  placeholder="URL del emblema personal del candidato..."
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-slate-900 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => triggerUpload('candidate')}
                  className="px-3 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center gap-1 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-600 font-medium">Tamaño: {logos.candidateLogoSize || 64}px</span>
                <input
                  type="range"
                  min="32"
                  max="140"
                  value={logos.candidateLogoSize || 64}
                  onChange={(e) => handleLogoChange('candidateLogoSize', parseInt(e.target.value, 10))}
                  className="flex-1 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Logotipo de Campaña / Eslogan */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs">3. Logotipo de Campaña Oficial</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLogoChange('campaignLogoVisible', !logos.campaignLogoVisible)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200"
              >
                {logos.campaignLogoVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              </button>
              {logos.campaignLogoUrl && (
                <button
                  type="button"
                  onClick={() => handleLogoChange('campaignLogoUrl', '')}
                  className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
              {logos.campaignLogoUrl ? (
                <img src={logos.campaignLogoUrl} alt="Logo Campaña" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-[10px] text-slate-400 text-center">Sin Logo</span>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={logos.campaignLogoUrl || ''}
                  onChange={(e) => handleLogoChange('campaignLogoUrl', e.target.value)}
                  placeholder="URL o subida de logo de campaña..."
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-slate-900 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => triggerUpload('campaign')}
                  className="px-3 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center gap-1 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-600 font-medium">Tamaño: {logos.campaignLogoSize || 64}px</span>
                <input
                  type="range"
                  min="32"
                  max="140"
                  value={logos.campaignLogoSize || 64}
                  onChange={(e) => handleLogoChange('campaignLogoSize', parseInt(e.target.value, 10))}
                  className="flex-1 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Logotipos de Coalición (Múltiples) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 text-xs block">4. Emblemas de Coalición Electoral</span>
              <span className="text-[11px] text-slate-500">Múltiples logotipos alineados en franja</span>
            </div>
            <button
              type="button"
              onClick={addCoalitionLogo}
              className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar Emblema
            </button>
          </div>

          <div className="space-y-2">
            {(logos.coalitionLogos || []).map((coal) => (
              <div key={coal.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                  {coal.url ? (
                    <img src={coal.url} alt={coal.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[9px] text-slate-400">Logo</span>
                  )}
                </div>

                <input
                  type="text"
                  value={coal.name}
                  onChange={(e) => {
                    const updated = (logos.coalitionLogos || []).map((l) =>
                      l.id === coal.id ? { ...l, name: e.target.value } : l
                    );
                    handleLogoChange('coalitionLogos', updated);
                  }}
                  placeholder="Nombre del partido"
                  className="w-32 p-1.5 rounded border border-slate-200 text-xs font-semibold"
                />

                <input
                  type="text"
                  value={coal.url}
                  onChange={(e) => {
                    const updated = (logos.coalitionLogos || []).map((l) =>
                      l.id === coal.id ? { ...l, url: e.target.value } : l
                    );
                    handleLogoChange('coalitionLogos', updated);
                  }}
                  placeholder="URL del emblema..."
                  className="flex-1 p-1.5 rounded border border-slate-200 text-xs font-mono"
                />

                <button
                  type="button"
                  onClick={() => triggerUpload(`coalition-${coal.id}`)}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs flex items-center gap-1 shrink-0"
                >
                  <Upload className="w-3 h-3" />
                  Subir
                </button>

                <button
                  type="button"
                  onClick={() => removeCoalitionLogo(coal.id)}
                  className="p-1 text-rose-500 hover:text-rose-700"
                  title="Eliminar de la coalición"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
