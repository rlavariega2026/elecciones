import React from 'react';
import {
  Vote,
  Plus,
  LayoutGrid,
  Palette,
  Inbox,
  BarChart3,
  Server,
  Download,
  Upload,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'dashboard' | 'editor' | 'templates' | 'analytics' | 'deploy';
  onNavigate: (view: 'dashboard' | 'editor' | 'templates' | 'analytics' | 'deploy') => void;
  onNewProject: () => void;
  onOpenInbox: () => void;
  unreadInquiriesCount?: number;
  onExportBackup?: () => void;
  onImportBackup?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onNewProject,
  onOpenInbox,
  unreadInquiriesCount = 0,
  onExportBackup,
  onImportBackup,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div
          className="flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Vote className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight whitespace-nowrap">
                LAV Política Digital
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                LAV Digital MKT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Lo que no se ve, no existe
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentView === 'dashboard'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Mis Proyectos
          </button>

          <button
            onClick={() => onNavigate('templates')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentView === 'templates'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Palette className="w-4 h-4" />
            Estudio de Diseño
          </button>

          <button
            onClick={onOpenInbox}
            className="px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 hover:text-slate-900 hover:bg-slate-50 relative whitespace-nowrap"
          >
            <Inbox className="w-4 h-4" />
            Buzón Ciudadano
            {unreadInquiriesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-600 text-white">
                {unreadInquiriesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentView === 'analytics'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Métricas
          </button>

          <button
            onClick={() => onNavigate('deploy')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentView === 'deploy'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Server className="w-4 h-4" />
            Despliegue Hostinger
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onExportBackup && (
            <button
              onClick={onExportBackup}
              title="Descargar copia de seguridad completa (JSON)"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden sm:flex items-center gap-1 text-xs font-medium"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xl:inline">Respaldar</span>
            </button>
          )}

          {onImportBackup && (
            <button
              onClick={onImportBackup}
              title="Restaurar copia de seguridad"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden sm:flex items-center gap-1 text-xs font-medium"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden xl:inline">Restaurar</span>
            </button>
          )}

          <button
            onClick={onNewProject}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </button>
        </div>
      </div>
    </header>
  );
};
