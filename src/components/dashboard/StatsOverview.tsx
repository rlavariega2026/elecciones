import React from 'react';
import { Project, CitizenInquiry } from '../../types';
import {
  Layers,
  Globe,
  Eye,
  MousePointerClick,
  QrCode,
  Inbox,
} from 'lucide-react';

interface StatsOverviewProps {
  projects: Project[];
  inquiries: CitizenInquiry[];
  onOpenInbox: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  projects,
  inquiries,
  onOpenInbox,
}) => {
  const publishedCount = projects.filter((p) => p.status === 'publicado').length;
  const totalViews = projects.reduce((acc, p) => acc + (p.meta?.viewsCount || 0), 0);
  const totalClicks = projects.reduce((acc, p) => acc + (p.meta?.clicksCount || 0), 0);
  const totalQrScans = projects.reduce((acc, p) => acc + (p.meta?.qrScansCount || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Proyectos */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold">Tarjetas Totales</span>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
          {projects.length}
        </div>
        <span className="text-[10px] text-slate-400 block">En la plataforma</span>
      </div>

      {/* 2. Publicadas */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold">Publicadas</span>
          <Globe className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-extrabold text-emerald-700 tabular-nums">
          {publishedCount}
        </div>
        <span className="text-[10px] text-emerald-600 font-medium block">
          Visibles al ciudadano
        </span>
      </div>

      {/* 3. Vistas */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold">Visitas Globales</span>
          <Eye className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
          {totalViews.toLocaleString()}
        </div>
        <span className="text-[10px] text-slate-400 block">Lecturas de tarjeta</span>
      </div>

      {/* 4. Clics */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold">Clics en Botones</span>
          <MousePointerClick className="w-4 h-4 text-purple-500" />
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
          {totalClicks.toLocaleString()}
        </div>
        <span className="text-[10px] text-slate-400 block">WhatsApp y llamadas</span>
      </div>

      {/* 5. Escaneos QR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold">Escaneos QR</span>
          <QrCode className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
          {totalQrScans.toLocaleString()}
        </div>
        <span className="text-[10px] text-slate-400 block">Desde material impreso</span>
      </div>

      {/* 6. Consultas con Folio */}
      <div
        onClick={onOpenInbox}
        className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs space-y-1 cursor-pointer hover:bg-rose-50/50 transition-colors group"
      >
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold text-rose-700">Folios Recibidos</span>
          <Inbox className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-2xl font-extrabold text-rose-700 tabular-nums">
          {inquiries.length}
        </div>
        <span className="text-[10px] text-rose-600 font-semibold block">
          Abrir Buzón Ciudadano →
        </span>
      </div>
    </div>
  );
};
