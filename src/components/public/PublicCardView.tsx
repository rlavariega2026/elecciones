import React, { useState, useEffect } from 'react';
import { Project, SlateMember } from '../../types';
import { api } from '../../services/api';
import { downloadVCard } from '../../utils/vcard';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  FileText,
  UserCheck,
  ExternalLink,
  ChevronRight,
  X,
  CheckCircle2,
  Share2,
  Calendar,
  Award,
  Vote,
  Download,
  Users,
} from 'lucide-react';

interface PublicCardViewProps {
  project: Project;
  isStandalone?: boolean;
}

export const PublicCardView: React.FC<PublicCardViewProps> = ({
  project,
  isStandalone = false,
}) => {
  const [selectedMember, setSelectedMember] = useState<SlateMember | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [formSubmittedFolio, setFormSubmittedFolio] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const [fullscreenHint,setFullscreenHint]=useState(false);
  useEffect(()=>{
    if(!isStandalone)return;
    const viewport=document.querySelector('meta[name="viewport"]');
    if(viewport)viewport.setAttribute('content','width=device-width,initial-scale=1,viewport-fit=cover');
  },[isStandalone]);
  const enterFullscreen=async(e:React.MouseEvent<HTMLDivElement>)=>{
    if(!isStandalone || document.fullscreenElement)return;
    const target=e.target as HTMLElement;
    if(target.closest('button,a,input,textarea,select,label,[role="button"],[contenteditable="true"]'))return;
    if(!document.documentElement.requestFullscreen){setFullscreenHint(true);return;}
    try{await document.documentElement.requestFullscreen();setFullscreenHint(false);}
    catch{setFullscreenHint(true);}
  };
  // Form states
  const [citizenName, setCitizenName] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenColonia, setCitizenColonia] = useState('');
  const [inquiryType, setInquiryType] = useState<
    'solicitud' | 'propuesta' | 'reporte' | 'consulta' | 'mensaje'
  >('solicitud');
  const [message, setMessage] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(true);

  const { candidate, palette, typography, logos, municipalSlate } = project;

  const handleButtonClick = async (btn: any) => {
    // Record analytics event silently
    api.recordEvent(project.id, 'click', btn.id);

    if (btn.actionType === 'whatsapp') {
      const cleanNum = btn.actionValue.replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(`Hola ${candidate.fullName}, vi tu tarjeta digital de LAV Política Digital y deseo ponerme en contacto.`);
      window.open(`https://wa.me/${cleanNum}?text=${msg}`, '_blank');
    } else if (btn.actionType === 'call') {
      window.location.href = `tel:${btn.actionValue}`;
    } else if (btn.actionType === 'email') {
      window.location.href = `mailto:${btn.actionValue}`;
    } else if (btn.actionType === 'vcard') {
      downloadVCard(project);
    } else if (btn.actionType === 'map') {
      window.open(btn.actionValue, '_blank');
    } else if (btn.actionType === 'citizen_form') {
      document.getElementById('citizen-form')?.scrollIntoView({ behavior: 'smooth' });
    } else if (btn.actionType === 'document') {
      window.open(btn.actionValue, '_blank');
    } else if (btn.actionType === 'external_url') {
      window.open(btn.actionValue, '_blank');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName || !message || !privacyConsent) return;

    setSubmitting(true);
    try {
      const res = await api.submitCitizenInquiry({
        projectId: project.id,
        citizenName,
        citizenEmail,
        citizenPhone,
        citizenColonia,
        inquiryType,
        message,
        privacyAccepted: privacyConsent,
      });

      if (res.success) {
        setFormSubmittedFolio(res.folio);
        setMessage('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${candidate.fullName} — ${project.role}`,
        text: candidate.slogan,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={enterFullscreen}
      className="min-h-[100dvh] w-full transition-colors pb-16 selection:bg-rose-600 selection:text-white"
      style={{
        backgroundColor: palette.background || '#F8FAFC',
        color: palette.text || '#0F172A',
        fontFamily: typography.bodyFont ? `'${typography.bodyFont}', sans-serif` : 'inherit',
      }}
    >
      {isStandalone && Boolean((project.meta as any)?.demo) && (
        <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center overflow-hidden" aria-hidden="true">
          <div className="w-[min(75vw,360px)] -rotate-12 text-center opacity-25 select-none">
            <img src="/elecciones/logo-lav.svg" alt="" className="w-full" />
            <div className="text-[clamp(3rem,15vw,7rem)] font-black leading-none tracking-wider text-violet-600">DEMO</div>
            <div className="text-xs font-bold text-indigo-600">Versión de demostración · LAV Digital MKT</div>
          </div>
        </div>
      )}
      {isStandalone && fullscreenHint && <div className="fixed bottom-3 left-3 right-3 z-[100] mx-auto max-w-sm bg-slate-900 text-white text-xs p-3 rounded-xl shadow-lg flex gap-3 items-center"><span>Este navegador no permite pantalla completa desde esta página. Puedes instalarla en la pantalla de inicio para verla sin barras cuando sea compatible.</span><button onClick={e=>{e.stopPropagation();setFullscreenHint(false);}} aria-label="Cerrar aviso" className="shrink-0 underline">Cerrar</button></div>}
      {/* Top Banner / Emblems Strip */}
      <header className="w-full bg-white/80 backdrop-blur border-b border-slate-200/60 sticky top-0 z-30 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Political Logos */}
          <div
            className={`flex items-center gap-3 flex-wrap ${
              logos.alignment === 'center'
                ? 'justify-center mx-auto'
                : logos.alignment === 'right'
                ? 'justify-end ml-auto'
                : 'justify-start'
            }`}
          >
            {logos.partyLogoVisible && logos.partyLogoUrl && (
              <img
                src={logos.partyLogoUrl}
                alt="Partido"
                style={{ height: `${logos.partyLogoSize || 48}px` }}
                className="object-contain"
              />
            )}

            {logos.candidateLogoVisible && logos.candidateLogoUrl && (
              <img
                src={logos.candidateLogoUrl}
                alt="Candidato"
                style={{ height: `${logos.candidateLogoSize || 48}px` }}
                className="object-contain"
              />
            )}

            {logos.campaignLogoVisible && logos.campaignLogoUrl && (
              <img
                src={logos.campaignLogoUrl}
                alt="Campaña"
                style={{ height: `${logos.campaignLogoSize || 48}px` }}
                className="object-contain"
              />
            )}

            {/* Coalition logos */}
            {(logos.coalitionLogos || [])
              .filter((l) => l.visible !== false && l.url)
              .map((c) => (
                <img
                  key={c.id}
                  src={c.url}
                  alt={c.name}
                  style={{ height: `${c.size || 36}px` }}
                  className="object-contain"
                />
              ))}

            {/* If Ayudantía by Color badge */}
            {municipalSlate?.isAyudantia && municipalSlate.color && (
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-900 text-white">
                Planilla {municipalSlate.color}
              </span>
            )}
          </div>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
            title="Compartir tarjeta"
          >
            {shareCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* HERO SECTION */}
        <section
          className="rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 p-6 sm:p-8"
          style={{
            backgroundColor: palette.surface || '#FFFFFF',
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* Candidate Photo */}
            <div className="relative shrink-0">
              <div
                className={`overflow-hidden shadow-md border-2 ${
                  candidate.heroPhotoStyle === 'circle'
                    ? 'w-44 h-44 sm:w-56 sm:h-56 rounded-full'
                    : candidate.heroPhotoStyle === 'square'
                    ? 'w-44 h-44 sm:w-56 sm:h-56 rounded-none'
                    : 'w-44 h-56 sm:w-56 sm:h-72 rounded-2xl'
                }`}
                style={{ borderColor: palette.primary }}
              >
                {candidate.heroPhotoUrl ? (
                  <img
                    src={candidate.heroPhotoUrl}
                    alt={candidate.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-3xl">
                    {candidate.fullName.charAt(0) || 'C'}
                  </div>
                )}
              </div>

              {/* Stage Badge */}
              <div
                className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-md uppercase tracking-wider whitespace-nowrap"
                style={{ backgroundColor: palette.primary }}
              >
                {project.stage.replace('_', ' ')}
              </div>
            </div>

            {/* Candidate Info & Slogan */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="space-y-1">
                <span
                  className="text-xs font-bold uppercase tracking-widest block"
                  style={{ color: palette.primary }}
                >
                  {project.role}
                </span>
                <h1
                  className="text-2xl sm:text-4xl font-extrabold tracking-tight"
                  style={{
                    fontFamily: typography.headingFont ? `'${typography.headingFont}', sans-serif` : 'inherit',
                    color: palette.text,
                    letterSpacing: typography.letterSpacing === 'wide' ? '0.05em' : 'normal',
                  }}
                >
                  {candidate.fullName}
                </h1>
                {candidate.municipality && (
                  <p className="text-xs font-semibold text-slate-500 flex items-center justify-center md:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {candidate.district ? `${candidate.district} · ` : ''}
                    {candidate.municipality}, Morelos
                  </p>
                )}
              </div>

              {/* Slogan */}
              {candidate.slogan && (
                <div
                  className="p-3.5 rounded-xl border-l-4 text-sm font-semibold italic leading-relaxed"
                  style={{
                    borderLeftColor: palette.primary,
                    backgroundColor: `${palette.primary}0D`, // 5% opacity tint
                    color: palette.text,
                  }}
                >
                  "{candidate.slogan}"
                </div>
              )}

              {/* Tagline */}
              {candidate.tagline && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {candidate.tagline}
                </p>
              )}

              {/* Quick Action Buttons Row */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                {project.buttons
                  .filter((b) => b.enabled)
                  .slice(0, 3)
                  .map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => handleButtonClick(btn)}
                      className="px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      style={{
                        backgroundColor: btn.bgColor || palette.primary,
                        color: btn.color || '#FFFFFF',
                      }}
                    >
                      {btn.actionType === 'whatsapp' ? (
                        <MessageCircle className="w-4 h-4" />
                      ) : btn.actionType === 'call' ? (
                        <Phone className="w-4 h-4" />
                      ) : btn.actionType === 'citizen_form' ? (
                        <FileText className="w-4 h-4" />
                      ) : btn.actionType === 'vcard' ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )}
                      {btn.label}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* BIO & SEMBLANZA SECTION */}
        {candidate.bio && (
          <section
            className="rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-4"
            style={{ backgroundColor: palette.surface || '#FFFFFF' }}
          >
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Semblanza & Trayectoria
              </span>
              <h2
                className="text-xl font-bold"
                style={{
                  fontFamily: typography.headingFont ? `'${typography.headingFont}', sans-serif` : 'inherit',
                  color: palette.text,
                }}
              >
                Conoce a {candidate.shortName || candidate.fullName}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {candidate.bio}
            </p>

            {candidate.quote && (
              <blockquote className="mt-4 p-4 rounded-xl bg-slate-50 border-l-4 border-slate-900 text-xs italic text-slate-800">
                "{candidate.quote}"
              </blockquote>
            )}
          </section>
        )}

        {/* MUNICIPAL SLATE OR AYUDANTÍA TEAM ROSTER */}
        {municipalSlate && municipalSlate.members && municipalSlate.members.length > 0 && (
          <section
            id="slate-section"
            className="rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-6"
            style={{ backgroundColor: palette.surface || '#FFFFFF' }}
          >
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {municipalSlate.isAyudantia ? 'Equipo de Ayudantía' : 'Cuerpo Edilicio'}
                </span>
              </div>
              <h2
                className="text-xl font-bold"
                style={{
                  fontFamily: typography.headingFont ? `'${typography.headingFont}', sans-serif` : 'inherit',
                  color: palette.text,
                }}
              >
                {municipalSlate.slateName || 'Planilla Municipal'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Toca a cualquier integrante para ver su ficha biográfica completa, propuestas y datos de contacto.
              </p>
            </div>

            {/* Slate Header Photo */}
            {municipalSlate.headerPhotoUrl && (
              <div className="w-full h-52 sm:h-64 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                <img
                  src={municipalSlate.headerPhotoUrl}
                  alt="Planilla Completa"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Members Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {municipalSlate.members.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white shadow-sm mb-2 shrink-0 group-hover:scale-105 transition-transform">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center font-bold text-slate-400 text-sm">
                        {member.fullName.charAt(0) || 'M'}
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                    {member.fullName}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                    {member.roleTitle}
                  </p>
                  <span className="text-[9px] font-semibold text-rose-600 mt-1 flex items-center gap-0.5">
                    Ver ficha <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROPOSALS SECTION */}
        {project.sections.find((s) => s.type === 'proposals' && s.enabled) && (
          <section
            className="rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-6"
            style={{ backgroundColor: palette.surface || '#FFFFFF' }}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Soluciones para Morelos
              </span>
              <h2
                className="text-xl font-bold"
                style={{
                  fontFamily: typography.headingFont ? `'${typography.headingFont}', sans-serif` : 'inherit',
                  color: palette.text,
                }}
              >
                Propuestas y Compromisos de Campaña
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(
                project.sections.find((s) => s.type === 'proposals')?.data?.items || []
              ).map((prop: any, idx: number) => (
                <div
                  key={prop.id || idx}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 hover:bg-white transition-colors"
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${palette.primary}1A`,
                      color: palette.primary,
                    }}
                  >
                    {prop.pillar || 'Eje Prioritario'}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">{prop.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {prop.description}
                  </p>
                  {prop.impact && (
                    <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Impacto: {prop.impact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MULTIMEDIA GALLERY SECTION */}
        {project.sections.find((s) => s.type === 'gallery' && s.enabled) && (
          <section
            className="rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-6"
            style={{ backgroundColor: palette.surface || '#FFFFFF' }}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Recorridos en Territorio
              </span>
              <h2
                className="text-xl font-bold"
                style={{
                  fontFamily: typography.headingFont ? `'${typography.headingFont}', sans-serif` : 'inherit',
                  color: palette.text,
                }}
              >
                Galería Fotográfica Oficial
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(
                project.sections.find((s) => s.type === 'gallery')?.data?.images || []
              ).map((img: any) => (
                <div
                  key={img.id}
                  onClick={() => setLightboxImage(img.url)}
                  className="aspect-square rounded-xl overflow-hidden border border-slate-200 cursor-pointer group relative shadow-sm"
                >
                  <img
                    src={img.url}
                    alt={img.caption || 'Foto de campaña'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-white font-medium line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {img.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CITIZEN PARTICIPATION & TRACKING FOLIO FORM */}
        <section
          id="citizen-form"
          className="rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-6"
          style={{ backgroundColor: palette.surface || '#FFFFFF' }}
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
              Atención Ciudadana Directa
            </span>
            <h2
              className="text-xl font-bold"
              style={{
                fontFamily: typography.headingFont ? `'${typography.headingFont}', sans-serif` : 'inherit',
                color: palette.text,
              }}
            >
              Envía tu Solicitud, Propuesta o Reporte
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Al enviar tu mensaje se generará un número de folio oficial para dar seguimiento a tu petición vecinal.
            </p>
          </div>

          {formSubmittedFolio ? (
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-900">
                ¡Solicitud Registrada con Éxito!
              </h3>
              <p className="text-xs text-emerald-800">
                Guarda este número de folio para dar seguimiento a tu caso con el equipo de campaña:
              </p>
              <div className="inline-block p-3 bg-white rounded-lg border border-emerald-300 font-mono text-lg font-extrabold text-slate-900 shadow-sm">
                {formSubmittedFolio}
              </div>
              <p className="text-[11px] text-emerald-700">
                Nos pondremos en contacto contigo a la brevedad. ¡Gracias por participar!
              </p>
              <button
                type="button"
                onClick={() => setFormSubmittedFolio(null)}
                className="mt-2 text-xs font-semibold text-emerald-800 underline cursor-pointer"
              >
                Enviar otra solicitud
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tu Nombre Completo *:
                  </label>
                  <input
                    type="text"
                    required
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="Ej. Patricia Morales"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Colonia / Poblado de Morelos *:
                  </label>
                  <input
                    type="text"
                    required
                    value={citizenColonia}
                    onChange={(e) => setCitizenColonia(e.target.value)}
                    placeholder="Ej. Col. Satélite, Cuernavaca"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teléfono celular (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="777 000 0000"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipo de Petición:
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                  >
                    <option value="solicitud">Solicitud de Apoyo / Gestión</option>
                    <option value="propuesta">Propuesta Ciudadana</option>
                    <option value="reporte">Reporte de Falla o Servicio</option>
                    <option value="consulta">Consulta / Pregunta</option>
                    <option value="mensaje">Mensaje de Apoyo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descripción Detallada de tu Petición *:
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe aquí las necesidades de tu calle o colonia..."
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              {/* Privacy Notice & Consent */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>
                    He leído y acepto el <strong>Aviso de Privacidad</strong>. Mis datos personales serán tratados exclusivamente para la gestión y seguimiento de esta solicitud ciudadana conforme a la legislación aplicable, sin fines de comercialización ni perfiles electorales.
                  </span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                  style={{ backgroundColor: palette.primary }}
                >
                  {submitting ? 'Registrando Folio...' : 'Enviar Solicitud y Generar Folio'}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* FAQ ACCORDION SECTION */}
        {project.sections.find((s) => s.type === 'faq' && s.enabled) && (
          <section
            className="rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-4"
            style={{ backgroundColor: palette.surface || '#FFFFFF' }}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Transparencia & Dudas
              </span>
              <h2
                className="text-xl font-bold"
                style={{
                  fontFamily: typography.headingFont ? `'${typography.headingFont}', sans-serif` : 'inherit',
                  color: palette.text,
                }}
              >
                Preguntas Frecuentes Ciudadanas
              </h2>
            </div>

            <div className="space-y-3">
              {(
                project.sections.find((s) => s.type === 'faq')?.data?.items || []
              ).map((faq: any, idx: number) => (
                <div key={faq.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h3 className="font-bold text-xs text-slate-900">{faq.question}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* FLOATING ACTION BAR FOR MOBILE */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-200 p-3 z-30 sm:hidden">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          {project.buttons
            .filter((b) => b.enabled)
            .slice(0, 3)
            .map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleButtonClick(btn)}
                className="flex-1 py-2 px-2 rounded-lg text-xs font-bold text-center truncate shadow-sm flex items-center justify-center gap-1 active:scale-95"
                style={{
                  backgroundColor: btn.bgColor || palette.primary,
                  color: btn.color || '#FFFFFF',
                }}
              >
                {btn.actionType === 'whatsapp' ? (
                  <MessageCircle className="w-3.5 h-3.5" />
                ) : btn.actionType === 'call' ? (
                  <Phone className="w-3.5 h-3.5" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
                <span className="truncate">{btn.label}</span>
              </button>
            ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 text-center text-xs text-slate-400 max-w-4xl mx-auto px-4 space-y-1">
        <p>LAV Política Digital · Propiedad de LAV Digital MKT</p>
        <p className="italic">"Lo que no se ve, no existe"</p>
      </footer>

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Ampliación"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}

      {/* SLATE MEMBER DETAIL MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 shrink-0">
                  {selectedMember.photoUrl ? (
                    <img
                      src={selectedMember.photoUrl}
                      alt={selectedMember.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center font-bold text-slate-400">
                      {selectedMember.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedMember.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {selectedMember.roleTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedMember.bio && (
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {selectedMember.bio}
              </p>
            )}

            {selectedMember.proposals && selectedMember.proposals.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Propuestas del Integrante:
                </span>
                <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                  {selectedMember.proposals.map((pr, i) => (
                    <li key={i}>{pr}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              {selectedMember.phone && (
                <a
                  href={`tel:${selectedMember.phone}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Llamar
                </a>
              )}
              {selectedMember.whatsapp && (
                <a
                  href={`https://wa.me/${selectedMember.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              )}
              <button
                onClick={() => setSelectedMember(null)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
