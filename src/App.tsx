import React, { useState, useEffect } from 'react';
import { Project, CitizenInquiry } from './types';
import { api } from './services/api';
import { Header } from './components/common/Header';
import { StatsOverview } from './components/dashboard/StatsOverview';
import { ProjectCard } from './components/dashboard/ProjectCard';
import { ProjectEditor } from './components/editor/ProjectEditor';
import { PublicCardView } from './components/public/PublicCardView';
import { QrModal } from './components/common/QrModal';
import { CitizenInboxModal } from './components/dashboard/CitizenInboxModal';
import { HostingerDeployModal } from './components/dashboard/HostingerDeployModal';
import { TemplateCatalogModal } from './components/dashboard/TemplateCatalogModal';
import { AnalyticsModal } from './components/dashboard/AnalyticsModal';
import { MORELOS_PARTIES } from './data/parties';
import { DESIGN_FAMILIES } from './data/templates';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  FolderOpen,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'editor' | 'templates' | 'analytics' | 'deploy'
  >('dashboard');
  const [publicSlug, setPublicSlug] = useState<string | null>(null);

  // Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<CitizenInquiry[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [filterParty, setFilterParty] = useState<string>('todos');

  // Modals State
  const [activeQrProject, setActiveQrProject] = useState<Project | null>(null);
  const [showInbox, setShowInbox] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Project | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New Project Form State
  const [newName, setNewName] = useState('');
  const [newCandidate, setNewCandidate] = useState('');
  const [newRole, setNewRole] = useState('Presidencia Municipal (Ayuntamiento)');
  const [newPartyId, setNewPartyId] = useState('MORENA');
  const [newCategory, setNewCategory] = useState<'federal' | 'estatal' | 'municipal' | 'cdmx' | 'auxiliar' | 'judicial' | 'otra'>('municipal');
  const [newMunicipality, setNewMunicipality] = useState('Cuernavaca');

  // 1. Initial Load & Route Listener (Public View vs Admin)
  useEffect(() => {
    const checkHashRoute = () => {
      const pathSlug = window.location.pathname.match(/^\/elecciones\/([^/]+)\/?$/)?.[1];
      if (pathSlug && pathSlug !== 'api') { setPublicSlug(decodeURIComponent(pathSlug)); return; }
      const hash = window.location.hash;
      if (hash.startsWith('#/p/')) {
        const slug = hash.replace('#/p/', '').replace(/\/$/, '');
        if (slug) setPublicSlug(slug);
      } else {
        setPublicSlug(null);
      }
    };

    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);
    window.addEventListener('popstate', checkHashRoute);
    return () => { window.removeEventListener('hashchange', checkHashRoute); window.removeEventListener('popstate', checkHashRoute); };
  }, []);

  // Fetch Projects and Inquiries from Server
  const loadData = async () => {
    setLoading(true);
    try {
      const [projRes, inqRes] = await Promise.all([
        api.getProjects(),
        api.getCitizenInquiries(),
      ]);
      if (projRes.success) setProjects(projRes.projects);
      if (inqRes.success) setInquiries(inqRes.inquiries);
    } catch (err) {
      console.error('[App] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Standalone Public View Route Rendering
  if (publicSlug) {
    const matched = projects.find(
      (p) => p.slug === publicSlug || (p.previousSlugs && p.previousSlugs.includes(publicSlug))
    );

    if (matched) {
      return <PublicCardView project={matched} isStandalone={true} />;
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200 space-y-4">
          <span className="text-4xl">🗳️</span>
          <h2 className="text-xl font-bold text-slate-900">Tarjeta No Encontrada</h2>
          <p className="text-xs text-slate-500">
            La dirección <span className="font-mono text-slate-700">/{publicSlug}/</span> no corresponde a una publicación vigente o fue modificada por el administrador.
          </p>
          <button
            onClick={() => {
              window.location.hash = '';
              setPublicSlug(null);
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Ir al Administrador LAV
          </button>
        </div>
      </div>
    );
  }

  // 3. Editor View
  if (currentView === 'editor' && editingProject) {
    return (
      <ProjectEditor
        project={editingProject}
        onBack={() => {
          setEditingProject(null);
          setCurrentView('dashboard');
          loadData();
        }}
        onSaveComplete={(updated) => {
          setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }}
      />
    );
  }

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (filterStatus !== 'todos' && p.status !== filterStatus) return false;
    if (filterCategory !== 'todos' && p.category !== filterCategory) return false;
    if (filterParty !== 'todos' && p.partyId !== filterParty) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.internalName.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.candidate.fullName.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        (p.candidate.municipality && p.candidate.municipality.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Project Actions
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setCurrentView('editor');
  };

  const handleDuplicate = async (project: Project) => {
    try {
      const res = await api.duplicateProject(project.id);
      if (res.success) {
        setProjects([res.project, ...projects]);
      }
    } catch (e: any) {
      alert(e.message || 'Error duplicando');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      const res = await api.deleteProject(deleteCandidate.id);
      if (res.success) {
        setProjects(projects.filter((p) => p.id !== deleteCandidate.id));
        setDeleteCandidate(null);
      }
    } catch (e: any) {
      alert(e.message || 'Error eliminando');
    }
  };

  const handlePublishDemo = async (project: Project) => {
    if (project.status === 'publicado' && !(project.meta as any)?.demo && !window.confirm('¿Reemplazar la versión definitiva por una DEMO en la misma URL?')) return;
    try {
      const res = await api.publishProject(project.id, project.slug, true);
      if (res.success) setProjects(prev => prev.map(p => p.id === project.id ? res.project : p));
    } catch (e: any) { alert(e.message || 'Error publicando DEMO'); }
  };

  const handlePublishToggle = async (project: Project) => {
    try {
      if (project.status === 'publicado' && !(project.meta as any)?.demo) {
        const res = await api.unpublishProject(project.id);
        if (res.success) {
          setProjects(projects.map((p) => (p.id === project.id ? res.project : p)));
        }
      } else {
        const res = await api.publishProject(project.id, project.slug);
        if (res.success) {
          setProjects(projects.map((p) => (p.id === project.id ? res.project : p)));
        }
      }
    } catch (e: any) {
      alert(e.message || 'Error en publicación');
    }
  };

  const handleCreateNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCandidate) return;

    const party = MORELOS_PARTIES.find((p) => p.id === newPartyId) || MORELOS_PARTIES[0];
    const defaultFamily = DESIGN_FAMILIES[1]; // Campaña Moderna

    try {
      const res = await api.createProject({
        internalName: newName,
        category: newCategory,
        role: newRole,
        stage: 'candidatura',
        partyId: newPartyId,
        coalitionParties: [],
        designFamily: defaultFamily.id,
        variantId: defaultFamily.variants[0].id,
        palette: { ...party.defaultPalette },
        typography: {
          headingFont: party.suggestedTypography || 'Montserrat',
          bodyFont: 'Plus Jakarta Sans',
          headingWeight: '700',
          bodyWeight: '400',
          letterSpacing: 'normal',
          lineHeight: 'normal',
          textTransform: 'none',
        },
        logos: {
          partyLogoVisible: true,
          candidateLogoVisible: true,
          campaignLogoVisible: true,
          alignment: 'center',
        },
        candidate: {
          fullName: newCandidate,
          shortName: newCandidate.split(' ')[0] || newCandidate,
          slogan: 'Compromiso y Resultados para Morelos',
          tagline: `Candidatura a ${newRole}`,
          heroPhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
          heroPhotoStyle: 'rounded',
          bio: 'Vocación de servicio y trabajo cercano a las familias.',
          state: 'Morelos',
          municipality: newMunicipality,
        },
        sections: [
          { id: 'sec-hero', type: 'hero', title: 'Portada Principal', enabled: true, order: 1, data: {} },
          { id: 'sec-bio', type: 'bio', title: 'Semblanza', enabled: true, order: 2, data: {} },
          { id: 'sec-proposals', type: 'proposals', title: 'Propuestas de Campaña', enabled: true, order: 3, data: { items: [] } },
          { id: 'sec-contact', type: 'contact', title: 'Contacto Ciudadano', enabled: true, order: 4, data: {} },
        ],
        buttons: [
          {
            id: 'btn-wa',
            label: 'Escribir por WhatsApp',
            style: 'solid',
            actionType: 'whatsapp',
            actionValue: '527773128490',
            icon: 'MessageCircle',
            enabled: true,
            bgColor: '#25D366',
            color: '#FFFFFF',
          },
          {
            id: 'btn-vcard',
            label: 'Guardar Tarjeta Digital',
            style: 'outline',
            actionType: 'vcard',
            actionValue: 'download',
            icon: 'UserCheck',
            enabled: true,
          },
        ],
      });

      if (res.success) {
        setProjects([res.project, ...projects]);
        setShowNewModal(false);
        setEditingProject(res.project);
        setCurrentView('editor');
      }
    } catch (err: any) {
      alert(err.message || 'Error creando proyecto');
    }
  };

  const handleCreateFromTemplate = (familyId: string, variantId: string, partyId: string) => {
    const party = MORELOS_PARTIES.find((p) => p.id === partyId) || MORELOS_PARTIES[0];
    const fam = DESIGN_FAMILIES.find((f) => f.id === familyId) || DESIGN_FAMILIES[0];

    api
      .createProject({
        internalName: `Proyecto ${fam.name} — ${party.shortName}`,
        category: 'municipal',
        role: 'Presidencia Municipal (Ayuntamiento)',
        stage: 'candidatura',
        partyId,
        coalitionParties: [],
        designFamily: familyId,
        variantId,
        palette: { ...party.defaultPalette },
        typography: {
          headingFont: party.suggestedTypography || 'Montserrat',
          bodyFont: 'Plus Jakarta Sans',
          headingWeight: '700',
          bodyWeight: '400',
          letterSpacing: 'normal',
          lineHeight: 'normal',
          textTransform: 'none',
        },
        logos: {
          partyLogoVisible: true,
          candidateLogoVisible: true,
          campaignLogoVisible: true,
          alignment: 'center',
        },
        candidate: {
          fullName: 'Nombre del Candidato',
          shortName: 'Candidato',
          slogan: 'Liderazgo y Transformación',
          tagline: 'Candidatura Oficial',
          heroPhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
          heroPhotoStyle: 'rounded',
          bio: 'Semblanza y trayectoria en Morelos.',
          state: 'Morelos',
          municipality: 'Cuernavaca',
        },
        sections: [
          { id: 'sec-hero', type: 'hero', title: 'Portada', enabled: true, order: 1, data: {} },
          { id: 'sec-bio', type: 'bio', title: 'Semblanza', enabled: true, order: 2, data: {} },
          { id: 'sec-contact', type: 'contact', title: 'Contacto', enabled: true, order: 3, data: {} },
        ],
        buttons: [
          {
            id: 'btn-wa',
            label: 'WhatsApp de Campaña',
            style: 'solid',
            actionType: 'whatsapp',
            actionValue: '527773128490',
            icon: 'MessageCircle',
            enabled: true,
            bgColor: '#25D366',
            color: '#FFFFFF',
          },
        ],
      })
      .then((res) => {
        if (res.success) {
          setProjects([res.project, ...projects]);
          setEditingProject(res.project);
          setCurrentView('editor');
        }
      });
  };

  const handleExportBackup = () => {
    window.open('/elecciones/api/backup/export', '_blank');
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const json = JSON.parse(text);
        const res = await api.restoreBackup(json);
        if (res.success) {
          alert('Copia de seguridad restaurada exitosamente.');
          loadData();
        }
      } catch (err: any) {
        alert('Archivo de respaldo no válido: ' + err.message);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Bar Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'templates') setShowTemplatesModal(true);
          else if (view === 'deploy') setShowDeploy(true);
          else if (view === 'analytics') setShowAnalyticsModal(true);
          else setCurrentView(view);
        }}
        onNewProject={() => setShowNewModal(true)}
        onOpenInbox={() => setShowInbox(true)}
        unreadInquiriesCount={inquiries.filter((i) => i.status === 'nuevo').length}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Aggregated Stats Strip */}
        <StatsOverview
          projects={projects}
          inquiries={inquiries}
          onOpenInbox={() => setShowInbox(true)}
        />

        {/* Dashboard Title & Search / Filter Controls */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg tracking-tight">
                Mis Proyectos Electorales ({filteredProjects.length})
              </h2>
              <p className="text-xs text-slate-500">
                Tarjetas digitales políticas, perfiles de candidatos y planillas municipales de Morelos
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por candidato, cargo, municipio o slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Status Segmented Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'publicado', label: 'Publicados' },
                { id: 'borrador', label: 'Borradores' },
                { id: 'archivado', label: 'Archivados' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setFilterStatus(st.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    filterStatus === st.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Category & Party Dropdowns */}
            <div className="flex items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium cursor-pointer"
              >
                <option value="todos">Todas las Categorías</option>
                <option value="federal">Federal</option>
                <option value="estatal">Estatal</option>
                <option value="municipal">Municipal</option>
                <option value="cdmx">Ciudad de México</option>
                <option value="auxiliar">Autoridades Auxiliares (Ayudantía)</option>
                <option value="judicial">Poder Judicial</option>
                <option value="otra">Otras Modalidades</option>
              </select>

              <select
                value={filterParty}
                onChange={(e) => setFilterParty(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium cursor-pointer"
              >
                <option value="todos">Todos los Partidos</option>
                {MORELOS_PARTIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.shortName}
                  </option>
                ))}
              </select>

              <button
                onClick={loadData}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200"
                title="Recargar datos"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Project Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">No se encontraron proyectos</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No hay tarjetas que coincidan con los filtros seleccionados o la búsqueda ingresada.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('todos');
                setFilterCategory('todos');
                setFilterParty('todos');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={(p) => setDeleteCandidate(p)}
                onPublishToggle={handlePublishToggle}
                  onPublishDemo={handlePublishDemo}
                onShowQr={(p) => setActiveQrProject(p)}
                onSaveAsTemplate={async () => {
                  const name = window.prompt('Nombre para guardar esta plantilla:', `Plantilla ${project.candidate.shortName}`);
                  if (!name?.trim()) return;
                  try {
                    const result = await api.saveTemplate({
                      name: name.trim(),
                      designFamily: project.designFamily,
                      variantId: project.variantId,
                      palette: project.palette,
                      typography: project.typography,
                    });
                    if (!result.success) throw new Error('No se pudo guardar la plantilla');
                    alert('Plantilla guardada: ' + name.trim());
                  } catch (e: any) { alert(e.message || 'Error al guardar la plantilla'); }
                }}
                onViewPublic={(p) => {
                  window.open(`/elecciones/${p.slug}/`, '_blank', 'noopener,noreferrer');
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-bold text-slate-700">LAV Política Digital · Propiedad de LAV Digital MKT</p>
        <p className="italic">"Lo que no se ve, no existe"</p>
        <p className="text-[11px] text-slate-400">
          Despliegue configurado para <span className="font-mono">https://lavdigitalmkt.com/elecciones/</span>
        </p>
      </footer>

      {/* MODALS */}
      {/* 1. QR Modal */}
      {activeQrProject && (
        <QrModal
          project={activeQrProject}
          onClose={() => setActiveQrProject(null)}
        />
      )}

      {/* 2. Citizen Inbox Modal */}
      {showInbox && (
        <CitizenInboxModal
          inquiries={inquiries}
          onClose={() => setShowInbox(false)}
          onUpdateStatus={async (id, status, notes) => {
            await api.updateCitizenInquiry(id, { status, notes });
            setInquiries((prev) =>
              prev.map((i) => (i.id === id ? { ...i, status, notes } : i))
            );
          }}
        />
      )}

      {/* 3. Hostinger Deploy Modal */}
      {showDeploy && <HostingerDeployModal onClose={() => setShowDeploy(false)} />}

      {/* 4. Template Catalog Modal */}
      {showTemplatesModal && (
        <TemplateCatalogModal
          onClose={() => setShowTemplatesModal(false)}
          onCreateFromTemplate={handleCreateFromTemplate}
        />
      )}

      {/* 5. Analytics Modal */}
      {showAnalyticsModal && (
        <AnalyticsModal
          projects={projects}
          inquiries={inquiries}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">¿Eliminar Proyecto?</h3>
              <p className="text-xs text-slate-500 mt-1">
                ¿Estás seguro de que deseas eliminar permanentemente "{deleteCandidate.internalName}"? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. New Project Wizard Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">Crear Nueva Tarjeta Política</h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Interno del Proyecto:
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Jorge Meade — Diputado Local"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo del Candidato / Titular:
                </label>
                <input
                  type="text"
                  required
                  value={newCandidate}
                  onChange={(e) => setNewCandidate(e.target.value)}
                  placeholder="Ej. Lic. Jorge Meade González"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nivel / Categoría:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="municipal">Municipal</option>
                    <option value="estatal">Estatal (Morelos)</option>
                    <option value="federal">Federal</option>
                    <option value="cdmx">Ciudad de México</option>
                    <option value="auxiliar">Ayudantía Municipal</option>
                    <option value="judicial">Poder Judicial</option>
                    <option value="otra">Otra Modalidad</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Partido Político Inicial:
                  </label>
                  <select
                    value={newPartyId}
                    onChange={(e) => setNewPartyId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {MORELOS_PARTIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.shortName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cargo Postulado:
                </label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Ej. Presidencia Municipal de Cuautla"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Crear y Abrir Editor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
