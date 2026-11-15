import React, { useState } from 'react';
import { Project, SlateMember, MunicipalSlate } from '../../../types';
import { AYUDANTIA_COLORS } from '../../../data/parties';
import { MORELOS_MUNICIPALITIES } from '../../../data/categories';
import {
  Users,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface SlateTabProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const SlateTab: React.FC<SlateTabProps> = ({ project, onChange }) => {
  const slate: MunicipalSlate = project.municipalSlate || {
    municipality: project.candidate.municipality || 'Cuernavaca',
    slateName: 'Planilla Municipal',
    isAyudantia: project.category === 'auxiliar',
    color: 'morada',
    members: [],
  };

  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  const handleSlateUpdate = (updated: Partial<MunicipalSlate>) => {
    onChange({
      municipalSlate: {
        ...slate,
        ...updated,
      },
    });
  };

  const addMember = (type: SlateMember['type'] = 'regiduria') => {
    const defaultTitle =
      type === 'presidencia'
        ? 'Presidente(a) Municipal Propietario(a)'
        : type === 'suplente_presidencia'
        ? 'Suplente de Presidencia Municipal'
        : type === 'sindicatura'
        ? 'Síndico(a) Municipal Propietario(a)'
        : type === 'suplente_sindicatura'
        ? 'Suplente de Sindicatura Municipal'
        : type === 'ayudante'
        ? 'Ayudante Municipal Propietario'
        : type === 'suplente_ayudante'
        ? 'Suplente de Ayudante Municipal'
        : type === 'equipo'
        ? 'Integrante del Comité Vecinal'
        : `Regiduría Municipal (${slate.members.filter((m) => m.type === 'regiduria').length + 1})`;

    const newMember: SlateMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: '',
      roleTitle: defaultTitle,
      type,
      order: slate.members.length + 1,
      photoUrl: '',
      bio: '',
      proposals: [],
    };

    handleSlateUpdate({
      members: [...slate.members, newMember],
    });
    setExpandedMemberId(newMember.id);
  };

  const duplicateMember = (member: SlateMember) => {
    const copy: SlateMember = {
      ...JSON.parse(JSON.stringify(member)),
      id: `member-${Date.now()}`,
      fullName: `${member.fullName} (Copia)`,
      order: slate.members.length + 1,
    };
    handleSlateUpdate({ members: [...slate.members, copy] });
  };

  const removeMember = (id: string) => {
    handleSlateUpdate({
      members: slate.members.filter((m) => m.id !== id),
    });
    if (expandedMemberId === id) setExpandedMemberId(null);
  };

  const updateMember = (id: string, updatedFields: Partial<SlateMember>) => {
    handleSlateUpdate({
      members: slate.members.map((m) => (m.id === id ? { ...m, ...updatedFields } : m)),
    });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-600" />
              Módulo de Planilla Electoral & Ayudantías de Morelos
            </h4>
            <p className="text-slate-500 text-[11px] mt-1">
              Diseña planillas de ayuntamientos completos (Presidencia, Sindicatura, Regidurías sin límite) o planillas de ayudantías por color.
            </p>
          </div>

          {/* Toggle Ayudantía vs Municipal */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => handleSlateUpdate({ isAyudantia: false })}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                !slate.isAyudantia ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ayuntamiento Municipal
            </button>
            <button
              type="button"
              onClick={() => handleSlateUpdate({ isAyudantia: true })}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                slate.isAyudantia ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ayudantía por Color
            </button>
          </div>
        </div>

        {/* General Slate Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nombre de la Planilla:</label>
            <input
              type="text"
              value={slate.slateName || ''}
              onChange={(e) => handleSlateUpdate({ slateName: e.target.value })}
              placeholder={slate.isAyudantia ? 'Ej. Planilla Morada de Ocotepec' : 'Ej. Planilla de Unidad por Cuautla'}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Municipio de Morelos:</label>
            <select
              value={slate.municipality}
              onChange={(e) => handleSlateUpdate({ municipality: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 bg-white font-medium"
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
              {slate.isAyudantia ? 'Poblado / Colonia / Comunidad:' : 'Cabecera Municipal / Distrito:'}
            </label>
            <input
              type="text"
              value={slate.pobladoColonia || ''}
              onChange={(e) => handleSlateUpdate({ pobladoColonia: e.target.value })}
              placeholder="Ej. Poblado Originario de Ocotepec"
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium"
            />
          </div>
        </div>

        {/* If Ayudantía: Color Selector */}
        {slate.isAyudantia && (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <label className="block font-bold text-slate-800 text-xs">
              Color Distintivo Registrado para la Ayudantía:
            </label>
            <div className="flex flex-wrap gap-2">
              {AYUDANTIA_COLORS.map((c) => {
                const active = slate.color === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSlateUpdate({ color: c.id })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                      active ? 'ring-2 ring-slate-900 shadow-sm' : 'opacity-80 hover:opacity-100'
                    } ${c.badgeBg}`}
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: c.colorHex }}
                    />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Slate Photo Header */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Fotografía General del Equipo / Planilla Completa:
          </label>
          <input
            type="text"
            value={slate.headerPhotoUrl || ''}
            onChange={(e) => handleSlateUpdate({ headerPhotoUrl: e.target.value })}
            placeholder="URL de la fotografía grupal de la planilla..."
            className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 font-mono text-[11px]"
          />
        </div>

        {/* Members Roster */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-sm block">
                Integrantes de la Planilla ({slate.members.length})
              </span>
              <span className="text-slate-500 text-[11px]">
                Sin límite de regidores. Al tocar un integrante en la tarjeta pública se despliega su ficha completa.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => addMember(slate.isAyudantia ? 'equipo' : 'regiduria')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {slate.isAyudantia ? 'Agregar Equipo' : 'Agregar Regiduría'}
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            {slate.members.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-500 mb-2">No has agregado integrantes a esta planilla.</p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => addMember('presidencia')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                  >
                    + Presidencia
                  </button>
                  <button
                    type="button"
                    onClick={() => addMember('sindicatura')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                  >
                    + Sindicatura
                  </button>
                  <button
                    type="button"
                    onClick={() => addMember('regiduria')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                  >
                    + Regiduría
                  </button>
                </div>
              </div>
            ) : (
              slate.members.map((member, index) => {
                const isExpanded = expandedMemberId === member.id;
                return (
                  <div
                    key={member.id}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                  >
                    <div
                      onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                      className="p-3 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {index + 1}
                        </span>
                        <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                              Foto
                            </div>
                          )}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">
                            {member.fullName || 'Nombre del integrante pendiente'}
                          </h5>
                          <p className="text-[11px] text-slate-500">{member.roleTitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateMember(member);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title="Duplicar integrante"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMember(member.id);
                          }}
                          className="p-1 text-rose-400 hover:text-rose-600"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </div>
                    </div>

                    {/* Expanded Edit Form */}
                    {isExpanded && (
                      <div className="p-4 space-y-3 border-t border-slate-200 bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Nombre Completo:</label>
                            <input
                              type="text"
                              value={member.fullName}
                              onChange={(e) => updateMember(member.id, { fullName: e.target.value })}
                              placeholder="Ej. Ing. Lorena Méndez"
                              className="w-full p-2 rounded-lg border border-slate-200 font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Título del Cargo:</label>
                            <input
                              type="text"
                              value={member.roleTitle}
                              onChange={(e) => updateMember(member.id, { roleTitle: e.target.value })}
                              placeholder="Ej. Primera Regiduría — Obras"
                              className="w-full p-2 rounded-lg border border-slate-200"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">URL Fotografía:</label>
                            <input
                              type="text"
                              value={member.photoUrl}
                              onChange={(e) => updateMember(member.id, { photoUrl: e.target.value })}
                              placeholder="https://..."
                              className="w-full p-2 rounded-lg border border-slate-200 font-mono text-[10px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Teléfono / WhatsApp:</label>
                            <input
                              type="text"
                              value={member.phone || ''}
                              onChange={(e) => updateMember(member.id, { phone: e.target.value, whatsapp: e.target.value })}
                              placeholder="777 000 0000"
                              className="w-full p-2 rounded-lg border border-slate-200"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico:</label>
                            <input
                              type="email"
                              value={member.email || ''}
                              onChange={(e) => updateMember(member.id, { email: e.target.value })}
                              placeholder="correo@ejemplo.com"
                              className="w-full p-2 rounded-lg border border-slate-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Semblanza del Integrante:</label>
                          <textarea
                            rows={2}
                            value={member.bio || ''}
                            onChange={(e) => updateMember(member.id, { bio: e.target.value })}
                            placeholder="Breve trayectoria, profesión o trabajo comunitario..."
                            className="w-full p-2 rounded-lg border border-slate-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
