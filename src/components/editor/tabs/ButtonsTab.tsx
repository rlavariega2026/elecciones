import { actionButtonAppearance, modernButtonModels } from '../../../utils/profilePresentation';
import React from 'react';
import { PROFESSIONAL_FONTS } from '../../../data/fonts';
import { Project, InteractiveButton } from '../../../types';
import {
  MousePointerClick,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  FileText,
  ExternalLink,
  UserCheck,
} from 'lucide-react';

interface ButtonsTabProps {
  project: Project;
  onChange: (updated: Partial<Project>) => void;
}

export const ButtonsTab: React.FC<ButtonsTabProps> = ({ project, onChange }) => {
  const buttons = project.buttons || [];

  const handleButtonsChange = (updated: InteractiveButton[]) => {
    onChange({ buttons: updated });
  };

  const addButton = () => {
    const newBtn: InteractiveButton = {
      id: `btn-${Date.now()}`,
      label: 'Nuevo Botón de Acción',
      style: 'solid',
      actionType: 'whatsapp',
      actionValue: '7770000000',
      icon: 'MessageCircle',
      enabled: true,
      bgColor: project.palette.primary,
      color: '#FFFFFF',
    };
    handleButtonsChange([...buttons, newBtn]);
  };

  const removeButton = (id: string) => {
    handleButtonsChange(buttons.filter((b) => b.id !== id));
  };

  const updateButton = (id: string, updatedFields: Partial<InteractiveButton>) => {
    handleButtonsChange(
      buttons.map((b) => (b.id === id ? { ...b, ...updatedFields } : b))
    );
  };

  const getActionPlaceholder = (type: InteractiveButton['actionType']) => {
    switch (type) {
      case 'whatsapp':
        return 'Número con lada (ej. 527773128490)';
      case 'call':
        return 'Teléfono directo (ej. 7773128490)';
      case 'email':
        return 'correo@ejemplo.com';
      case 'map':
        return 'Enlace de Google Maps / Waze';
      case 'document':
        return 'URL del documento PDF o archivo';
      case 'citizen_form':
        return '#citizen-form (ancla interna al formulario)';
      case 'vcard':
        return 'download (descarga de tarjeta .vcf)';
      default:
        return 'https://...';
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-rose-600" />
              Biblioteca de Botones Interactivos & Call to Action
            </h4>
            <p className="text-slate-500 text-[11px] mt-1">
              Todos los botones son funcionales y enlazan a WhatsApp, llamadas directas, mapas, documentos o vCard.
            </p>
          </div>

          <button
            type="button"
            onClick={addButton}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Botón
          </button>
        </div>

        {/* Buttons List */}
        <div className="space-y-3">
          {buttons.map((btn) => (
            <div
              key={btn.id}
              className={`p-4 rounded-xl border transition-all ${
                btn.enabled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => updateButton(btn.id, { enabled: !btn.enabled })}
                    className={`p-1 rounded ${
                      btn.enabled ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {btn.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <input
                    type="text"
                    value={btn.label}
                    onChange={(e) => updateButton(btn.id, { label: e.target.value })}
                    placeholder="Texto del botón..."
                    className="font-bold text-slate-900 text-xs p-1 rounded border border-transparent hover:border-slate-200 focus:border-slate-900 flex-1"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeButton(btn.id)}
                  className="p-1 text-rose-400 hover:text-rose-600"
                  title="Eliminar botón"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                {/* Action Type */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Acción:</label>
                  <select
                    value={btn.actionType}
                    onChange={(e) =>
                      updateButton(btn.id, {
                        actionType: e.target.value as InteractiveButton['actionType'],
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium"
                  >
                    <option value="whatsapp">WhatsApp Directo</option>
                    <option value="call">Llamada Telefónica</option>
                    <option value="email">Enviar Correo</option>
                    <option value="citizen_form">Formulario con Folio</option>
                    <option value="vcard">Guardar Contacto (vCard)</option>
                    <option value="map">Ubicación / Mapa</option>
                    <option value="document">Descargar Documento</option>
                    <option value="external_url">Enlace Externo</option>
                  </select>
                </div>

                {/* Style */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estilo Visual:</label>
                  <select
                    value={btn.style}
                    onChange={(e) =>
                      updateButton(btn.id, {
                        style: e.target.value as InteractiveButton['style'],
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium"
                  >
                    <option value="solid">Sólido</option>
                    <option value="gradient">Degradado</option>
                    <option value="outline">Contorno (Outline)</option>
                    <option value="glass">Glassmorphism</option>
                    <option value="pill">Tipo Píldora</option>
                    <option value="minimal">Minimalista</option>
                    <option value="floating">Elevado</option>
                    <optgroup label="Modelos modernos">{modernButtonModels.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</optgroup>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">Color del texto
                    <input type="color" value={btn.color || '#ffffff'} onChange={e => updateButton(btn.id, { color: e.target.value })} />
                  </label>
                  <span className="profile-action" data-style={btn.style} style={{ '--action-color': btn.bgColor || project.palette.primary, '--action-text': btn.color || '#fff' } as React.CSSProperties}>
                    <MousePointerClick size={16} /> {btn.label}
                  </span>
                </div>

                <fieldset className="col-span-full grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-3">
                  <legend className="font-semibold text-slate-800">Modelos modernos</legend>
                  {modernButtonModels.map(([value, label]) => (
                    <button key={value} type="button" aria-pressed={btn.style === value} onClick={() => updateButton(btn.id, { style: value })}
                      className="profile-action" data-style={value} style={{ '--action-color': btn.bgColor || project.palette.primary, '--action-text': btn.color || '#fff' } as React.CSSProperties}>
                      <MousePointerClick size={16} aria-hidden="true" /><span>{label}</span>
                    </button>
                  ))}
                </fieldset>

                <fieldset className="col-span-full grid grid-cols-2 gap-3 rounded-xl border p-3 sm:grid-cols-3">
                  <legend className="font-semibold">Tipografía y acabados independientes</legend>
                  <label>Fuente<select className="block w-full border rounded p-2" value={btn.fontFamily||''} onChange={e=>updateButton(btn.id,{fontFamily:e.target.value})}>
                    <option value="">Predeterminada</option>{PROFESSIONAL_FONTS.map(font=><option key={font.id} value={font.name}>{font.name}</option>)}
                  </select></label>
                  <label>Tamaño (px)<input type="number" min="8" max="60" className="block w-full border rounded p-2" value={btn.fontSize??''} onChange={e=>updateButton(btn.id,{fontSize:e.target.value?Math.max(8,Math.min(60,Number(e.target.value))):undefined})}/></label>
                  <label>Alineación<select className="block w-full border rounded p-2" value={btn.textAlign||''} onChange={e=>updateButton(btn.id,{textAlign:e.target.value as typeof btn.textAlign})}>
                    <option value="">Predeterminada</option><option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option>
                  </select></label>
                  <label>Acabado<select className="block w-full border rounded p-2" value={btn.finish||'default'} onChange={e=>updateButton(btn.id,{finish:e.target.value as typeof btn.finish})}>
                    <option value="default">Estilo original</option><option value="silver">Metal plateado</option><option value="titanium">Titanio oscuro</option><option value="gold">Oro metálico</option><option value="premium-gradient">Degradado premium</option>
                  </select></label>
                  <label>Esquinas (px)<input type="number" min="0" max="60" className="block w-full border rounded p-2" value={btn.radius??''} onChange={e=>updateButton(btn.id,{radius:e.target.value?Math.max(0,Math.min(60,Number(e.target.value))):undefined})}/></label>
                  <div className="flex items-end"><span className="profile-action" data-style={btn.style} style={{'--action-color':btn.bgColor||project.palette.primary,'--action-text':btn.color||'#fff',...actionButtonAppearance(btn)} as React.CSSProperties}>{btn.label}</span></div>
                </fieldset>

                {/* Custom Color */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Color de Fondo:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={btn.bgColor || project.palette.primary}
                      onChange={(e) => updateButton(btn.id, { bgColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-200 p-0.5 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={btn.bgColor || project.palette.primary}
                      onChange={(e) => updateButton(btn.id, { bgColor: e.target.value })}
                      className="flex-1 p-2 rounded-lg border border-slate-200 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Value / Link / Phone Input */}
              <div className="mt-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  Destino / Valor de la Acción:
                </label>
                <input
                  type="text"
                  value={btn.actionValue}
                  onChange={(e) => updateButton(btn.id, { actionValue: e.target.value })}
                  placeholder={getActionPlaceholder(btn.actionType)}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
