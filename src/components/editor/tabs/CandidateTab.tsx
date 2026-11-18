import React, { useRef } from 'react';
import { Project, CandidateInfo } from '../../../types';
import { User, Upload } from 'lucide-react';
import { PROFESSIONAL_FONTS } from '../../../data/fonts';
import { ButtonsTab } from './ButtonsTab';

interface CandidateTabProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const CandidateTab: React.FC<CandidateTabProps> = ({ project, onChange }) => {
  const candidate = project.candidate;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCandidateChange = (key: keyof CandidateInfo, val: any) => {
    onChange({
      candidate: {
        ...project.candidate,
        [key]: val,
      },
    });
  };

  const updateTextStyle = (type: string, field: string, property: string, value: string | number | undefined) => {
    onChange({ sections: (project.sections || []).map(section => section.type !== type ? section : ({
      ...section, data: { ...section.data, textStyles: { ...section.data?.textStyles,
        [field]: { ...section.data?.textStyles?.[field], [property]: value } } }
    })) });
  };
  const format = (type: string, field: string, label: string) => {
    const section = (project.sections || []).find(section => section.type === type);
    const style = section?.data?.textStyles?.[field] || {};
    return <details className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
      <summary className="cursor-pointer font-semibold text-slate-700">Formato de {label}</summary>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label>Fuente<select className="block w-full border rounded p-1" value={style.font || ''} onChange={e=>updateTextStyle(type,field,'font',e.target.value||undefined)}>
          <option value="">Predeterminada</option>{PROFESSIONAL_FONTS.map(font=><option key={font.id} value={font.name}>{font.name}</option>)}
        </select></label>
        <label>Tamaño (px)<input type="number" min="8" max="160" className="block w-full border rounded p-1" value={style.size??''} onChange={e=>updateTextStyle(type,field,'size',e.target.value?Math.max(8,Math.min(160,Number(e.target.value))):undefined)}/></label>
        <label>Color<input type="color" className="block w-full" value={style.color||'#0f172a'} onChange={e=>updateTextStyle(type,field,'color',e.target.value)}/></label>
        <label>Alineación<select className="block w-full border rounded p-1" value={style.align||''} onChange={e=>updateTextStyle(type,field,'align',e.target.value||undefined)}>
          <option value="">Predeterminada</option><option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option><option value="justify">Justificada</option>
        </select></label>
      </div>
    </details>;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleCandidateChange('heroPhotoUrl', dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 text-xs">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-rose-600" />
            Perfil del Candidato / Titular de la Campaña
          </h4>
          <p className="text-slate-500 text-[11px] mt-1">
            Información biográfica, fotografía principal de gran formato, lema oficial y semblanza.
          </p>
        </div>

        {/* Name & Short Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre Completo Oficial:
            </label>
            <input
              type="text"
              value={candidate.fullName}
              onChange={(e) => handleCandidateChange('fullName', e.target.value)}
              placeholder="Ej. Jorge Meade González"
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 font-bold focus:ring-2 focus:ring-slate-900"
            />
            {format('hero','name','nombre')}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre Corto / Marca Política:
            </label>
            <input
              type="text"
              value={candidate.shortName}
              onChange={(e) => handleCandidateChange('shortName', e.target.value)}
              placeholder="Ej. Jorge Meade"
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 font-bold focus:ring-2 focus:ring-slate-900"
            />
            {format('hero','name','nombre corto')}
          </div>
        </div>

        {/* Slogan & Tagline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Eslogan Principal de Campaña:
            </label>
            <input
              type="text"
              value={candidate.slogan}
              onChange={(e) => handleCandidateChange('slogan', e.target.value)}
              placeholder="Ej. Experiencia, Firmeza y Resultados para Morelos"
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-slate-900"
            />
            {format('hero','slogan','eslogan')}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lema Secundario o Subtítulo Institucional:
            </label>
            <input
              type="text"
              value={candidate.tagline}
              onChange={(e) => handleCandidateChange('tagline', e.target.value)}
              placeholder="Ej. Candidato a Diputado Local por el Primer Distrito"
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-slate-900"
            />
            {format('hero','tagline','lema secundario')}
          </div>
        </div>

        {/* Hero Photo & Style */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <label className="block font-semibold text-slate-700">
            Fotografía Principal de Gran Formato:
          </label>

          <div className="flex items-start gap-4">
            <div className="w-24 h-28 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm">
              {candidate.heroPhotoUrl ? (
                <img
                  src={candidate.heroPhotoUrl}
                  alt={candidate.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                  Foto
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={candidate.heroPhotoUrl}
                  onChange={(e) => handleCandidateChange('heroPhotoUrl', e.target.value)}
                  placeholder="URL de la fotografía o sube una imagen..."
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir Foto
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Estilo de Enmarcado de la Fotografía:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'rounded', label: 'Bordes Redondeados' },
                    { id: 'circle', label: 'Retrato Circular' },
                    { id: 'square', label: 'Cuadrado Clásico' },
                    { id: 'gradient_cut', label: 'Corte con Degradado' },
                    { id: 'full_bleed', label: 'A Sangre (Full Bleed)' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleCandidateChange('heroPhotoStyle', st.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        candidate.heroPhotoStyle === st.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Quote */}
        <div className="pt-3 border-t border-slate-100 space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Biografía Resumida / Mensaje Inicial:
            </label>
            <textarea
              rows={4}
              value={candidate.bio}
              onChange={(e) => handleCandidateChange('bio', e.target.value)}
              placeholder="Escribe la trayectoria y vocación de servicio del candidato..."
              className="w-full p-3 rounded-lg border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-slate-900"
            />
            {format('bio','bioText','biografía')}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cita o Frase Célebre del Candidato:
            </label>
            <input
              type="text"
              value={candidate.quote || ''}
              onChange={(e) => handleCandidateChange('quote', e.target.value)}
              placeholder="Ej. Morelos necesita leyes con sentido humano y presupuestos que realmente lleguen a las colonias."
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 italic focus:ring-2 focus:ring-slate-900"
            />
            {format('bio','quote','cita')}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-violet-200 p-3 bg-violet-50/30">
        <h4 className="font-bold text-sm mb-2">Textos de portada: cargo y ubicación</h4>
        <label className="block mb-2">Cargo / título
          <input className="block w-full border rounded-lg p-2" value={project.role || ''} onChange={e=>onChange({role:e.target.value})}/>
        </label>
        {format('hero','role','cargo')}
        <label className="block mt-3 mb-2">Ubicación
          <input className="block w-full border rounded-lg p-2" value={candidate.municipality || ''} onChange={e=>handleCandidateChange('municipality',e.target.value)}/>
        </label>
        {format('hero','location','ubicación')}
      </div>
      <div className="rounded-xl border border-violet-200 p-3 bg-violet-50/30">
        <h4 className="font-bold text-sm mb-2">Botones de la portada: texto, color y acabados</h4>
        <ButtonsTab project={project} onChange={onChange}/>
      </div>
    </div>
  );
};
