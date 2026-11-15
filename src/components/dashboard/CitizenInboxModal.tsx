import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, MessageSquare, Phone, Mail, MapPin } from 'lucide-react';
import { CitizenInquiry } from '../../types';

interface CitizenInboxModalProps {
  inquiries: CitizenInquiry[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'nuevo' | 'en_proceso' | 'atendido', notes?: string) => Promise<void>;
}

export const CitizenInboxModal: React.FC<CitizenInboxModalProps> = ({
  inquiries,
  onClose,
  onUpdateStatus,
}) => {
  const [selectedInquiry, setSelectedInquiry] = useState<CitizenInquiry | null>(
    inquiries[0] || null
  );
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNotes, setAdminNotes] = useState(selectedInquiry?.notes || '');
  const [updating, setUpdating] = useState(false);

  const filtered = inquiries.filter((inq) => {
    if (filterStatus !== 'todos' && inq.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inq.folio.toLowerCase().includes(q) ||
        inq.citizenName.toLowerCase().includes(q) ||
        inq.message.toLowerCase().includes(q) ||
        inq.projectCandidateName.toLowerCase().includes(q) ||
        inq.citizenColonia.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = async (newStatus: 'nuevo' | 'en_proceso' | 'atendido') => {
    if (!selectedInquiry) return;
    setUpdating(true);
    await onUpdateStatus(selectedInquiry.id, newStatus, adminNotes);
    setSelectedInquiry({ ...selectedInquiry, status: newStatus, notes: adminNotes });
    setUpdating(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setUpdating(true);
    await onUpdateStatus(selectedInquiry.id, selectedInquiry.status, adminNotes);
    setSelectedInquiry({ ...selectedInquiry, notes: adminNotes });
    setUpdating(false);
  };

  const selectInquiry = (inq: CitizenInquiry) => {
    setSelectedInquiry(inq);
    setAdminNotes(inq.notes || '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-600" />
              Buzón de Participación Ciudadana y Folios
            </h3>
            <p className="text-xs text-slate-500">
              Gestión de peticiones, propuestas y reportes vecinales recibidos con folio único de seguimiento
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Row */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por folio (ej. LAV-2026), nombre, colonia o mensaje..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {['todos', 'nuevo', 'en_proceso', 'atendido'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors capitalize ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'todos' ? 'Todos' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Split view */}
        <div className="flex-1 flex overflow-hidden">
          {/* List Sidebar */}
          <div className="w-2/5 border-r border-slate-200 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No hay solicitudes que coincidan con los filtros.
              </div>
            ) : (
              filtered.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => selectInquiry(inq)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedInquiry?.id === inq.id
                      ? 'bg-slate-50 border-l-4 border-slate-900'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {inq.folio}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        inq.status === 'atendido'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inq.status === 'en_proceso'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {inq.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-xs truncate">
                    {inq.citizenName}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {inq.projectCandidateName} · {inq.citizenColonia || 'Morelos'}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {inq.message}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-2">
                    {new Date(inq.createdAt).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail View */}
          <div className="w-3/5 overflow-y-auto p-6 bg-slate-50/40">
            {selectedInquiry ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono font-bold bg-slate-900 text-white px-2.5 py-1 rounded-md">
                        {selectedInquiry.folio}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {selectedInquiry.inquiryType}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {selectedInquiry.citizenName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Para la candidatura de: <span className="font-semibold text-slate-700">{selectedInquiry.projectCandidateName}</span>
                    </p>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={updating}
                      onClick={() => handleStatusChange('nuevo')}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                        selectedInquiry.status === 'nuevo'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Nuevo
                    </button>
                    <button
                      disabled={updating}
                      onClick={() => handleStatusChange('en_proceso')}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 ${
                        selectedInquiry.status === 'en_proceso'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      En Proceso
                    </button>
                    <button
                      disabled={updating}
                      onClick={() => handleStatusChange('atendido')}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 ${
                        selectedInquiry.status === 'atendido'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Atendido
                    </button>
                  </div>
                </div>

                {/* Citizen Contacts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 bg-slate-50 rounded-lg p-3 text-xs border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedInquiry.citizenPhone || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedInquiry.citizenEmail || 'Sin email'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedInquiry.citizenColonia || 'Morelos'}</span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Mensaje o Petición Ciudadana:
                  </label>
                  <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-line border border-slate-200">
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Admin Internal Notes */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Notas Internas del Equipo de Campaña:
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Registra acciones realizadas, funcionario al que se turnó, fecha de llamada de seguimiento..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      disabled={updating}
                      onClick={handleSaveNotes}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors"
                    >
                      {updating ? 'Guardando...' : 'Guardar Notas'}
                    </button>
                  </div>
                </div>

                {/* Privacy Consent Stamp */}
                <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span>Aviso de privacidad y consentimiento expreso aceptado por el ciudadano.</span>
                  <span>Registrado: {new Date(selectedInquiry.createdAt).toLocaleString('es-MX')}</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Selecciona una solicitud para revisar detalles y registrar seguimiento.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
