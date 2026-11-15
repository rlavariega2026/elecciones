import React, { useState } from 'react';
import {
  ExternalLink,
  Edit3,
  Copy,
  Trash2,
  QrCode,
  Globe,
  Archive,
  Eye,
  MousePointerClick,
  FileText,
  UserCheck,
  MoreVertical,
  Check,
  BookmarkPlus,
  Send,
} from 'lucide-react';
import { Project } from '../../types';
import { downloadVCard } from '../../utils/vcard';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDuplicate: (project: Project) => void;
  onDelete: (project: Project) => void;
  onPublishToggle: (project: Project) => void;
  onShowQr: (project: Project) => void;
  onSaveAsTemplate: (project: Project) => void;
  onViewPublic: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDuplicate,
  onDelete,
  onPublishToggle,
  onShowQr,
  onSaveAsTemplate,
  onViewPublic,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl = `https://lavdigitalmkt.com/elecciones/${project.slug}/`;

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (project.status) {
      case 'publicado':
        return (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-600" />
            Publicado
          </span>
        );
      case 'archivado':
        return (
          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Archive className="w-3 h-3 text-slate-500" />
            Archivado
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
            Borrador
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden relative group">
      {/* Top Color Accent Strip based on project palette */}
      <div
        className="h-2 w-full"
        style={{
          background: project.palette?.gradient || project.palette?.primary || '#0F172A',
        }}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge()}
              <span className="text-[11px] text-slate-500 font-medium">
                {project.category.toUpperCase()}
              </span>
              {project.candidate.municipality && (
                <span className="text-[11px] text-slate-500">
                  · {project.candidate.municipality}
                </span>
              )}
            </div>

            {/* Menu Options Button */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                title="Más acciones"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 text-xs">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(project);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      Editar tarjeta
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onViewPublic(project);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      Ver pública
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDuplicate(project);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      Duplicar proyecto
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onShowQr(project);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <QrCode className="w-3.5 h-3.5 text-slate-500" />
                      Descargar QR
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        downloadVCard(project);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      Descargar vCard
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onSaveAsTemplate(project);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5 text-slate-500" />
                      Guardar como plantilla
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onPublishToggle(project);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-500" />
                      {project.status === 'publicado' ? 'Despublicar' : 'Publicar'}
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(project);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Candidate & Project Title */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
              {project.candidate.heroPhotoUrl ? (
                <img
                  src={project.candidate.heroPhotoUrl}
                  alt={project.candidate.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                  {project.candidate.fullName.charAt(0) || 'P'}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm truncate" title={project.internalName}>
                {project.internalName}
              </h3>
              <p className="text-xs font-semibold text-slate-700 truncate">
                {project.candidate.fullName}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{project.role}</p>
            </div>
          </div>

          {/* Slogan snippet */}
          {project.candidate.slogan && (
            <p className="text-xs text-slate-600 italic line-clamp-1 mb-3">
              "{project.candidate.slogan}"
            </p>
          )}

          {/* Public Slug URL Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-between gap-1 mb-4">
            <span className="text-[11px] font-mono text-slate-600 truncate">
              /{project.slug}/
            </span>
            <button
              onClick={copyUrl}
              className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors shrink-0"
              title="Copiar enlace de publicación"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Aggregated Stats Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1" title="Visitas totales">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700 tabular-nums">
              {project.meta.viewsCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1" title="Clics en botones">
            <MousePointerClick className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700 tabular-nums">
              {project.meta.clicksCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1" title="Escaneos de QR">
            <QrCode className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700 tabular-nums">
              {project.meta.qrScansCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1" title="Consultas ciudadanas con folio">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700 tabular-nums">
              {project.meta.inquiriesCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onEdit(project)}
            className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar
          </button>
          <button
            onClick={() => onViewPublic(project)}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver Pública
          </button>
        </div>
      </div>
    </div>
  );
};
