import React, { useState } from 'react';
import { Project } from '../../types';
import { api } from '../../services/api';
import { GeneralTab } from './tabs/GeneralTab';
import { IdentityTab } from './tabs/IdentityTab';
import { TypographyTab } from './tabs/TypographyTab';
import { LogosTab } from './tabs/LogosTab';
import { CandidateTab } from './tabs/CandidateTab';
import { TemplatesTab } from './tabs/TemplatesTab';
import { SlateTab } from './tabs/SlateTab';
import { SectionsTab } from './tabs/SectionsTab';
import { ButtonsTab } from './tabs/ButtonsTab';
import { AiAssistantTab } from './tabs/AiAssistantTab';
import { PublicCardView } from '../public/PublicCardView';
import { QrModal } from '../common/QrModal';
import {
  ArrowLeft,
  Save,
  Globe,
  QrCode,
  Smartphone,
  Tablet,
  Monitor,
  Check,
  Send,
  ExternalLink,
} from 'lucide-react';

interface ProjectEditorProps {
  project: Project;
  onBack: () => void;
  onSaveComplete?: (updated: Project) => void;
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project: initialProject,
  onBack,
  onSaveComplete,
}) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [activeTab, setActiveTab] = useState<
    | 'general'
    | 'identity'
    | 'typography'
    | 'logos'
    | 'candidate'
    | 'templates'
    | 'slate'
    | 'sections'
    | 'buttons'
    | 'ai'
  >('general');

  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const handleUpdate = (fields: Partial<Project>) => {
    setProject((prev) => ({
      ...prev,
      ...fields,
      meta: {
        ...prev.meta,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateProject(project.id, project);
      if (res.success) {
        setProject(res.project);
        setSavedSuccess(true);
        if (onSaveComplete) onSaveComplete(res.project);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    setSaving(true);
    try {
      if (project.status === 'publicado') {
        const res = await api.unpublishProject(project.id);
        if (res.success) setProject(res.project);
      } else {
        const res = await api.publishProject(project.id, project.slug);
        if (res.success) setProject(res.project);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado de publicación');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top Editor Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Volver al panel principal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
                {project.internalName}
              </h2>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  project.status === 'publicado'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {project.status}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 truncate block">
              /{project.slug}/
            </span>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`p-1.5 rounded-md transition-colors ${
              deviceMode === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Vista Móvil (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`p-1.5 rounded-md transition-colors ${
              deviceMode === 'tablet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Vista Tableta (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`p-1.5 rounded-md transition-colors ${
              deviceMode === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Vista Escritorio Completa"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowQrModal(true)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
            title="Ver código QR"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <a
            href={`#/p/${project.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
            title="Abrir página pública"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={handlePublishToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              project.status === 'publicado'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            {project.status === 'publicado' ? 'Publicado' : 'Publicar'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Guardado
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Guardando...' : 'Guardar'}
              </>
            )}
          </button>
        </div>
      </header>

      {/* Editor Body: Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Control Drawer: Tabs & Config */}
        <div className="w-full lg:w-1/2 xl:w-5/12 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-57px)]">
          {/* Tabs Scroller */}
          <div className="flex items-center gap-1 overflow-x-auto p-2 border-b border-slate-200 bg-slate-50 shrink-0 text-xs font-semibold no-scrollbar">
            {[
              { id: 'general', label: '1. General & URL' },
              { id: 'identity', label: '2. Partidos & Color' },
              { id: 'typography', label: '3. Fuentes' },
              { id: 'logos', label: '4. Logotipos' },
              { id: 'candidate', label: '5. Candidato' },
              { id: 'templates', label: '6. Plantillas' },
              { id: 'slate', label: '7. Planilla' },
              { id: 'sections', label: '8. Secciones' },
              { id: 'buttons', label: '9. Botones' },
              { id: 'ai', label: '10. Asistente IA' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Component Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activeTab === 'general' && <GeneralTab project={project} onChange={handleUpdate} />}
            {activeTab === 'identity' && <IdentityTab project={project} onChange={handleUpdate} />}
            {activeTab === 'typography' && <TypographyTab project={project} onChange={handleUpdate} />}
            {activeTab === 'logos' && <LogosTab project={project} onChange={handleUpdate} />}
            {activeTab === 'candidate' && <CandidateTab project={project} onChange={handleUpdate} />}
            {activeTab === 'templates' && <TemplatesTab project={project} onChange={handleUpdate} />}
            {activeTab === 'slate' && <SlateTab project={project} onChange={handleUpdate} />}
            {activeTab === 'sections' && <SectionsTab project={project} onChange={handleUpdate} />}
            {activeTab === 'buttons' && <ButtonsTab project={project} onChange={handleUpdate} />}
            {activeTab === 'ai' && <AiAssistantTab project={project} onChange={handleUpdate} />}
          </div>
        </div>

        {/* Right Preview Canvas */}
        <div className="hidden lg:flex flex-1 bg-slate-200/70 p-6 items-center justify-center overflow-y-auto">
          <div
            className={`transition-all duration-300 shadow-2xl overflow-y-auto bg-white rounded-3xl border-8 border-slate-900 h-[86vh] ${
              deviceMode === 'mobile'
                ? 'w-[375px]'
                : deviceMode === 'tablet'
                ? 'w-[768px]'
                : 'w-full max-w-5xl rounded-xl border-4'
            }`}
          >
            {/* Real-time Public Card Renderer */}
            <PublicCardView project={project} />
          </div>
        </div>
      </div>

      {showQrModal && <QrModal project={project} onClose={() => setShowQrModal(false)} />}
    </div>
  );
};
