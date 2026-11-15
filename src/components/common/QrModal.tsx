import React, { useEffect, useState } from 'react';
import { X, Download, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { Project } from '../../types';
import { generateQrDataUrl, downloadQrCode } from '../../utils/qr';

interface QrModalProps {
  project: Project | null;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ project, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const publicUrl = `https://lavdigitalmkt.com/elecciones/${project.slug}/`;

  useEffect(() => {
    generateQrDataUrl(publicUrl, {
      width: 512,
      colorDark: project.palette.primary || '#0F172A',
      colorLight: '#FFFFFF',
    }).then(setQrDataUrl);
  }, [project, publicUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (qrDataUrl) {
      downloadQrCode(qrDataUrl, project.slug);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-slate-800" />
            <h3 className="font-semibold text-slate-900">Código QR Oficial</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm mb-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Código QR ${project.internalName}`}
                className="w-56 h-56 object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                Generando código...
              </div>
            )}
          </div>

          <h4 className="font-bold text-slate-900 text-base">{project.candidate.fullName}</h4>
          <p className="text-xs text-slate-500 mb-4">{project.role}</p>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-2 mb-6">
            <span className="text-xs font-mono text-slate-700 truncate text-left">
              {publicUrl}
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={handleDownload}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Descargar PNG (Alta Res)
            </button>
            <a
              href={`#/p/${project.slug}`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir Tarjeta
            </a>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
          Ideal para lonas, volantes, gorras, calcomanías y material impreso de campaña.
        </div>
      </div>
    </div>
  );
};
