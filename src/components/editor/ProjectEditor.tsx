import React, { useState } from 'react';
import { Project } from '../../types';
import { api, persistProjectImages } from '../../services/api';
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
  const [showPublishPanel, setShowPublishPanel] = useState(false);
  const [clientFolder, setClientFolder] = useState(() => (initialProject.meta as any)?.clientFolder || '');
  const [publicationFolder, setPublicationFolder] = useState(() => {
    const prefix = clientFolder ? clientFolder + '-' : '';
    return prefix && initialProject.slug.startsWith(prefix) ? initialProject.slug.slice(prefix.length) : initialProject.slug;
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const normalized = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  const fullSlug = [normalized(clientFolder), normalized(publicationFolder)].filter(Boolean).join('-');
  const publishUrl = `https://lavdigitalagency.com/elecciones/${fullSlug}/`;


  const handleUpdate = (fields: Partial<Project>) => {
    setProject((prev) => ({
      ...prev,
      ...fields,
      meta: {
        ...prev.meta,
        ...fields.meta,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ready = await persistProjectImages(project);
      const res = await api.updateProject(project.id, ready);
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

  const handleSaveAs = async () => {
    const name = window.prompt('Nombre del nuevo proyecto (Guardar como):', project.internalName + ' - copia');
    if (!name?.trim()) return;
    setSaving(true);
    try {
      const ready = await persistProjectImages(project);
      const res = await api.createProject({
        ...ready,
        id: undefined,
        internalName: name.trim(),
        slug: normalized(name) + '-' + Date.now().toString(36),
        status: 'borrador',
        previousSlugs: [],
        meta: {
          sectionsManaged: ready.meta.sectionsManaged,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewsCount: 0, clicksCount: 0, qrScansCount: 0, inquiriesCount: 0,
        },
      } as any);
      if (!res.success) throw new Error('No se pudo crear la copia');
      alert('Copia independiente guardada: ' + name.trim());
      onSaveComplete?.(res.project);
    } catch (err: any) { alert(err.message || 'Error en Guardar como'); }
    finally { setSaving(false); }
  };

  const handlePublishVersion = async (demo: boolean) => {
    if (!fullSlug || fullSlug.length < 3) { alert('Escribe una carpeta de publicación válida'); return; }
    if (demo && project.status === 'publicado' && !(project.meta as any)?.demo &&
        !window.confirm('¿Sustituir la versión definitiva por una DEMO en la misma URL?')) return;
    setSaving(true);
    try {
      const ready = await persistProjectImages(project);
      const saved = await api.updateProject(project.id, {
        ...ready,
        meta: { ...project.meta, clientFolder: normalized(clientFolder) } as any,
      });
      if (!saved.success) throw new Error('No se guardaron los cambios');
      const result = await api.publishProject(project.id, fullSlug, demo);
      if (!result.success) throw new Error('Error al publicar');
      setProject(result.project);
      setPublicationFolder(normalized(publicationFolder));
      onSaveComplete?.(result.project);
      alert((demo ? 'DEMO' : 'Publicación definitiva') + ' actualizada: ' + publishUrl);
    } catch (err: any) { alert(err.message || 'Error de publicación'); }
    finally { setSaving(false); }
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
        <div className="flex flex-wrap items-center gap-2">
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

          <button onClick={() => setShowPublishPanel(v => !v)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-700 hover:bg-violet-800 text-white">
            <Send className="w-3.5 h-3.5 inline mr-1" /> Publicar
          </button>
          <button onClick={handleSaveAs} disabled={saving}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800">
            Guardar como
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

      {showPublishPanel && (
        <section className="bg-white border-b border-violet-200 px-4 py-4 space-y-3 shadow-sm">
          <h3 className="font-semibold text-sm">Publicación en Hostinger</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-medium">Carpeta del cliente (opcional)
              <input value={clientFolder} onChange={e => setClientFolder(e.target.value)}
                placeholder="cliente" className="block w-full mt-1 border border-slate-300 rounded-lg p-2" />
            </label>
            <label className="text-xs font-medium">Nombre de la publicación
              <input value={publicationFolder} onChange={e => setPublicationFolder(e.target.value)}
                placeholder="nombre-publicacion" className="block w-full mt-1 border border-slate-300 rounded-lg p-2" />
            </label>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs font-mono break-all">{publishUrl}</span>
            <button className="text-xs underline" onClick={async () => { await navigator.clipboard.writeText(publishUrl); setCopiedLink(true); }}> {copiedLink ? 'Copiado' : 'Copiar enlace'}</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button disabled={saving} onClick={() => handlePublishVersion(true)} className="bg-violet-700 text-white rounded-lg px-4 py-2 text-xs font-semibold">Publicar DEMO en Hostinger</button>
            <button disabled={saving} onClick={() => handlePublishVersion(false)} className="bg-slate-900 text-white rounded-lg px-4 py-2 text-xs font-semibold">Publicar definitiva en Hostinger</button>
          </div>
        </section>
      )}
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
