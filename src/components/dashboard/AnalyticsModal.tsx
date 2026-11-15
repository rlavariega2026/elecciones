import React from 'react';
import { Project, CitizenInquiry } from '../../types';
import { X, BarChart3, ShieldCheck, Eye, MousePointerClick, QrCode, FileText } from 'lucide-react';

interface AnalyticsModalProps {
  projects: Project[];
  inquiries: CitizenInquiry[];
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  projects,
  inquiries,
  onClose,
}) => {
  const totalViews = projects.reduce((acc, p) => acc + (p.meta?.viewsCount || 0), 0);
  const totalClicks = projects.reduce((acc, p) => acc + (p.meta?.clicksCount || 0), 0);
  const totalQrScans = projects.reduce((acc, p) => acc + (p.meta?.qrScansCount || 0), 0);

  // Sort projects by views
  const topProjects = [...projects]
    .sort((a, b) => (b.meta?.viewsCount || 0) - (a.meta?.viewsCount || 0))
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Panel de Métricas y Analíticas Agregadas
              </h3>
              <p className="text-xs text-slate-500">
                Medición cuantitativa respetando la privacidad ciudadana sin rastreo individual de preferencias políticas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Key Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-600">Vistas Totales</span>
                <Eye className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {totalViews.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-600">Clics en Botones</span>
                <MousePointerClick className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {totalClicks.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-600">Escaneos QR</span>
                <QrCode className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {totalQrScans.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-600">Folios Ciudadanos</span>
                <FileText className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-extrabold text-rose-700 tabular-nums">
                {inquiries.length}
              </div>
            </div>
          </div>

          {/* Top Visited Projects */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">
              Tarjetas con Mayor Alcance y Consultas
            </h4>
            <div className="divide-y divide-slate-100">
              {topProjects.map((proj, idx) => {
                const pct = totalViews > 0 ? ((proj.meta?.viewsCount || 0) / totalViews) * 100 : 0;
                return (
                  <div key={proj.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-bold text-slate-400 text-xs w-4">#{idx + 1}</span>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 text-xs block truncate">
                          {proj.internalName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {proj.role} · /{proj.slug}/
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900 text-xs block tabular-nums">
                        {(proj.meta?.viewsCount || 0).toLocaleString()} vistas
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {pct.toFixed(1)}% del tráfico
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy & Anti-Profiling Policy */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3 text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Compromiso Ético y de Privacidad Electoral</span>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                La plataforma LAV Política Digital no implementa perfiles de persuasión política, segmentación por opiniones ni seguimiento individual de preferencias ciudadanas. Todas las métricas presentadas son agregadas y anónimas.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
