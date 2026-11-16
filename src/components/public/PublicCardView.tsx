import { fieldStyle, profileSections, sectionSurface, modernButtonModels, typographyModels } from '../../utils/profilePresentation';
import React, { useState, useEffect } from 'react';
import { Project, SectionConfig, SlateMember } from '../../types';
import { DESIGN_FAMILIES } from '../../data/templates';
import { ContactLocation, ProfileGallery, AdditionalSection, SectionHeading } from './PublicSections';
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
  const [formSubmittedFolio, setFormSubmittedFolio] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [formError, setFormError] = useState('');
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
  const family = DESIGN_FAMILIES.find(item => item.id === project.designFamily) || DESIGN_FAMILIES[0];
  const variantIndex = Math.max(0, family.variants.findIndex(item => item.id === project.variantId));
  const sections = profileSections(project);
  const visibleSections = sections.filter(section => section.enabled);
  const contactVisible = visibleSections.some(section => section.type === 'citizen_form');
  const backdrop = project.backgroundAppearance;
  const editorial = project.visualPreset === 'cristal-editorial';
  const typographyPreset = project.typographyPreset ?? (editorial ? 'editorial' : 'custom');
  const typeModel = typographyPreset === 'custom' ? undefined : typographyModels[typographyPreset];
  const firstHero = visibleSections.find(section => section.type === 'hero');
  const logoPlacement = firstHero ? logos.partyLogoPlacement || 'header' : 'header';
  const logoInPortada = logos.partyLogoVisible && logos.partyLogoUrl && logoPlacement !== 'header' ? (
    <div className="profile-party-mark" data-align={logos.partyLogoAlignment || logos.alignment || 'left'}>
      <img src={logos.partyLogoUrl} alt="Partido" style={{ height: logos.partyLogoSize || 64 }} />
    </div>
  ) : null;
  const publicButtons = project.buttons.filter(button => button.enabled && (contactVisible || button.actionType !== 'citizen_form'));
  const rawWhatsApp = project.citizenWhatsApp?.trim() || project.buttons.find(button => button.actionType === 'whatsapp' && button.enabled)?.actionValue
    || visibleSections.find(section => section.type === 'contact')?.data?.whatsapp || '';
  const digits = rawWhatsApp.replace(/[^0-9]/g, '');
  const whatsAppNumber = digits.length === 10 ? '52' + digits : digits;
  const reportUrl = /^[1-9][0-9]{10,14}$/.test(whatsAppNumber) && submittedMessage
    ? `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(submittedMessage)}` : '';

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
    setFormError('');
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

      if (!res.success || !res.folio) throw new Error('No se pudo registrar la solicitud.');
      setFormSubmittedFolio(res.folio);
      setSubmittedMessage([
        `Reporte ciudadano · ${res.folio}`,
        `Perfil: ${candidate.fullName}`,
        `Nombre: ${citizenName}`,
        `Colonia: ${citizenColonia}`,
        `Tipo: ${inquiryType}`,
        'Texto completo de la solicitud:',
        message,
      ].join('\n'));
      setMessage('');
    } catch {
      setFormError('No se pudo registrar la solicitud. Revisa tu conexión y vuelve a intentarlo.');
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

  const renderSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'hero': {
        const textFormat = (field: string, defaults?: React.CSSProperties) => {
          const format = fieldStyle(section, field);
          const overrides = Object.fromEntries(Object.entries(format).filter(([, value]) => value !== undefined));
          return { style: { ...defaults, ...overrides }, 'data-format-color': format.color ? 'true' : undefined };
        };
        const photo = candidate.heroPhotoUrl || candidate.coverPhotoUrl;
        const immersive = section.data?.photoLayout === 'immersive' && Boolean(photo);
        const position = (key: string, fallback: number) => Math.min(100, Math.max(0, Number(section.data?.[key] ?? fallback)));
        return (
          <section data-module={section.type} data-framed={section.data?.appearance?.framed === false ? 'false' : undefined} data-photo-layout={immersive ? 'immersive' : undefined}
          data-custom-surface={(section.data?.appearance?.finish && section.data.appearance.finish !== 'default') || section.data?.appearance?.opacity !== undefined ? 'true' : undefined}
          className="profile-hero rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 p-6 sm:p-8"
          style={sectionSurface(section, palette.surface, editorial)}
        >
          {section.id === firstHero?.id && logoPlacement === 'above-photo' && logoInPortada}
          {immersive && <img className="profile-immersive-photo" src={photo} alt={candidate.fullName} style={{
            '--photo-mobile': `${position('photoMobileX', 50)}% ${position('photoMobileY', 35)}%`,
            '--photo-desktop': `${position('photoDesktopX', 50)}% ${position('photoDesktopY', 35)}%`,
          } as React.CSSProperties} />}
          <div className="profile-hero-layout">
            {/* Candidate Photo */}
            {!immersive && <div className="profile-portrait relative shrink-0">
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
                {(candidate.coverPhotoUrl || candidate.heroPhotoUrl) ? (
                  <img
                    src={(variantIndex === 2 || variantIndex === 3 ? candidate.coverPhotoUrl : candidate.heroPhotoUrl) || candidate.heroPhotoUrl || candidate.coverPhotoUrl}
                    alt={candidate.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-3xl">
                    {candidate.fullName.charAt(0) || 'C'}
                  </div>
                )}
              </div>

            </div>}

            {/* Candidate Info & Slogan */}
            <div className="profile-intro min-w-0 space-y-3">
              {section.id === firstHero?.id && logoPlacement === 'below-photo' && logoInPortada}
              <div className="space-y-1">
                {section.subtitle && <p className="profile-kicker" data-format-color={fieldStyle(section, 'subtitle').color ? 'true' : undefined} style={fieldStyle(section, 'subtitle')}>{section.subtitle}</p>}
                <span
                  className="text-xs font-bold uppercase tracking-widest block"
                  {...textFormat('role', { color: palette.primary })}
                >
                  {project.role}
                </span>
                <h1
                  className="text-2xl sm:text-4xl font-extrabold tracking-tight"
                  {...textFormat('name', {
                    fontFamily: typeModel ? `'${typeModel.heading}', sans-serif` : typography.headingFont ? `'${typography.headingFont}', sans-serif` : 'inherit',
                    color: palette.text,
                    letterSpacing: typeModel ? undefined : typography.letterSpacing === 'wide' ? '0.05em' : 'normal',
                  })}
                >
                  {candidate.fullName}
                </h1>
                {candidate.municipality && (
                  <p className="text-xs font-semibold text-slate-500" {...textFormat('location')}>
                    <MapPin className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom" aria-hidden="true" />
                    {candidate.district ? `${candidate.district} · ` : ''}
                    {candidate.municipality}, Morelos
                  </p>
                )}
              </div>

              {/* Slogan */}
              {candidate.slogan && (
                <div
                  className="p-3.5 rounded-xl border-l-4 text-sm font-semibold italic leading-relaxed"
                  {...textFormat('slogan', {
                    borderLeftColor: palette.primary,
                    backgroundColor: `${palette.primary}0D`,
                    color: palette.text,
                  })}
                >
                  "{candidate.slogan}"
                </div>
              )}

              {/* Tagline */}
              {candidate.tagline && (
                <p className="text-xs text-slate-600 leading-relaxed" {...textFormat('tagline')}>
                  {candidate.tagline}
                </p>
              )}

              {/* Quick Action Buttons Row */}
              <div className="profile-hero-actions pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                {publicButtons
                  .slice(0, 3)
                  .map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => handleButtonClick(btn)}
                      className="profile-action" data-style={btn.style} data-action={btn.actionType} data-modern={modernButtonModels.some(([value]) => value === btn.style) ? 'true' : undefined}
                      style={{
                        '--action-color': btn.bgColor || palette.primary,
                        '--action-text': btn.color || '#fff',
                      } as React.CSSProperties}
                    >
                      {btn.actionType === 'whatsapp' ? (
                        editorial ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg> : <MessageCircle className="w-4 h-4" />
                      ) : btn.actionType === 'call' ? (
                        <Phone className="w-4 h-4" />
                      ) : btn.actionType === 'citizen_form' ? (
                        <FileText className="w-4 h-4" />
                      ) : btn.actionType === 'vcard' ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )}
                      <span>{btn.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </section>
        );
      }
      case 'bio':
        return (
          <section data-module={section.type}
            className="rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-4"
            style={sectionSurface(section, palette.surface, editorial)}
          >
            <SectionHeading section={section} />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" style={fieldStyle(section, 'bioText')}>
              {section.data?.bioText ?? candidate.bio}
            </p>

            {candidate.quote && (
              <blockquote className="mt-4 p-4 rounded-xl bg-slate-50 border-l-4 border-slate-900 text-xs italic text-slate-800">
                "{candidate.quote}"
              </blockquote>
            )}
          </section>
        );
      case 'slate':
        return (
          <section data-module={section.type}
            id="slate-section"
            className="rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-6"
            style={sectionSurface(section, palette.surface, editorial)}
          >
            <SectionHeading section={section} />
            {/* Slate Header Photo */}
            {municipalSlate?.headerPhotoUrl && (
              <div className="w-full h-52 sm:h-64 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                <img
                  src={municipalSlate?.headerPhotoUrl}
                  alt="Planilla Completa"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Members Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {(municipalSlate?.members || []).map((member) => (
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
        );
      case 'proposals':
        return (
          <section data-module={section.type}
            className="rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-6"
            style={sectionSurface(section, palette.surface, editorial)}
          >
            <SectionHeading section={section} />


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(
                section.data?.items || []
              ).map((prop: any, idx: number) => (
                <div
                  key={prop.id || idx}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 hover:bg-white transition-colors"
                >
                  <div
                    className="w-full text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${palette.primary}1A`,
                      color: palette.primary,
                      ...fieldStyle(section, 'pillar', prop),
                    }}
                  >
                    {prop.pillar || 'Eje Prioritario'}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900" style={fieldStyle(section, 'title', prop)}>{prop.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed" style={fieldStyle(section, 'description', prop)}>
                    {prop.description}
                  </p>
                  {prop.impact && (
                    <p className="text-[11px] font-semibold text-emerald-700 pt-1" style={fieldStyle(section, 'impact', prop)}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Impacto: {prop.impact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      case 'gallery':
        return <section data-module="gallery" className="p-6 space-y-4" style={sectionSurface(section, palette.surface, editorial)}>
          <SectionHeading section={section} />
          <ProfileGallery section={section} />
        </section>;
      case 'contact':
        return <section data-module="contact" className="p-6 space-y-4" style={sectionSurface(section, palette.surface, editorial)}>
          <SectionHeading section={section} />
          <ContactLocation section={section} />
        </section>;
      case 'citizen_form':
        return (
          <section data-module={section.type}
          id={section.id === visibleSections.find(item => item.type === 'citizen_form')?.id ? 'citizen-form' : undefined}
          className="rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-6"
          style={sectionSurface(section, palette.surface, editorial)}
        >
            <SectionHeading section={section} />
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
              {reportUrl && (
                <a href={reportUrl} target="_blank" rel="noopener noreferrer"
                  className="block w-fit rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white">
                  Enviar reporte por WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => { setFormSubmittedFolio(null); setSubmittedMessage(''); }}
                className="mt-2 text-xs font-semibold text-emerald-800 underline cursor-pointer"
              >
                Enviar otra solicitud
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {formError && <p role="alert" className="text-sm text-rose-700">{formError}</p>}
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
        );
      case 'faq':
        return (
          <section data-module={section.type}
            className="rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-4"
            style={sectionSurface(section, palette.surface, editorial)}
          >
            <SectionHeading section={section} />


            <div className="space-y-3">
              {(
                section.data?.items || []
              ).map((faq: any, idx: number) => (
                <div key={faq.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h3 className="font-bold text-xs text-slate-900" style={fieldStyle(section, 'question', faq)}>{faq.question}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed" style={fieldStyle(section, 'answer', faq)}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        );
      default:
        return <AdditionalSection section={section} surface={palette.surface} editorial={editorial} buttons={publicButtons} onButton={handleButtonClick} />;
    }
  };

  return (
    <div
      onClick={enterFullscreen}
      data-typography={typeModel ? typographyPreset : undefined}
      data-visual-preset={editorial ? 'cristal-editorial' : undefined}
      data-family={family.id}
      data-layout={variantIndex}
      data-standalone={isStandalone}
      className="election-profile min-h-[100dvh] w-full transition-colors pb-16 selection:bg-rose-600 selection:text-white"
      style={{
        backgroundColor: palette.background || '#F8FAFC',
        '--profile-accent': palette.primary,
        '--profile-surface': palette.surface || '#fff',
        '--profile-heading': typography.headingFont ? `'${typography.headingFont}'` : 'system-ui',
        color: palette.text || '#0F172A',
        fontFamily: typeModel ? `'${typeModel.body}', sans-serif` : typography.bodyFont ? `'${typography.bodyFont}', sans-serif` : 'inherit',
      } as React.CSSProperties}
    >
      {project.backgroundImageUrl && <div className="profile-background" aria-hidden="true">
        <img src={project.backgroundImageUrl} alt="" style={{
          objectFit: backdrop?.fit || 'cover',
          objectPosition: `${backdrop?.x ?? 50}% ${backdrop?.y ?? 50}%`,
          transformOrigin: `${backdrop?.x ?? 50}% ${backdrop?.y ?? 50}%`,
          transform: `scale(${(backdrop?.zoom ?? 100) / 100})`,
          filter: backdrop?.blur ? `blur(${backdrop.blur}px)` : undefined,
          opacity: (backdrop?.opacity ?? 100) / 100,
        }} />
      </div>}
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
            {logoPlacement === 'header' && logos.partyLogoVisible && logos.partyLogoUrl && (
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
      <main className="profile-content mx-auto">
        {visibleSections.map(section => (
          <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
        ))}
      </main>

      {/* FLOATING ACTION BAR FOR MOBILE */}
      <div className="profile-mobile-actions fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-200 p-3 z-30" hidden={!isStandalone || publicButtons.length === 0}>
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          {publicButtons
            .slice(0, 3)
            .map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleButtonClick(btn)}
                className="profile-action flex-1 min-w-0" data-style={btn.style}
                style={{
                  '--action-color': btn.bgColor || palette.primary,
                        '--action-text': btn.color || '#fff',
                      } as React.CSSProperties}
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

      {/* SLATE MEMBER DETAIL MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-h-[85dvh] overflow-y-auto bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
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
