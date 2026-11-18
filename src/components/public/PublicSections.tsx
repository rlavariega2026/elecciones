import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Play, X } from 'lucide-react';
import { fieldStyle, legacyNetwork, socialNetworks, sectionSurface } from '../../utils/profilePresentation';
import { InteractiveButton, SectionConfig } from '../../types';

export function SectionHeading({ section }: { section: SectionConfig }) {
  return (
    <header className="profile-section-heading">
      {section.subtitle && <p className="profile-kicker" style={fieldStyle(section, 'subtitle')}>{section.subtitle}</p>}
      <h2 style={fieldStyle(section, 'heading')}>{section.title}</h2>
    </header>
  );
}

export function webLink(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value, window.location.origin);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function AdditionalSection({ section, surface, buttons, onButton, editorial = false }: {
  section: SectionConfig;
  surface: string;
  editorial?: boolean;
  buttons: InteractiveButton[];
  onButton: (button: InteractiveButton) => void;
}) {
  const items = Array.isArray(section.data?.items) ? section.data.items : [];
  return (
    <section data-module={section.type} className={section.type === "custom_html" && section.data?.immersivePhoto ? "overflow-hidden space-y-4" : "rounded-2xl border border-slate-200/60 p-6 sm:p-8 space-y-4"}
      style={sectionSurface(section, surface, editorial)}>
      {section.type === 'custom_html' && section.data?.immersivePhoto ? (
        <div className="relative isolate overflow-hidden rounded-xl bg-slate-950 text-white"
          style={{minHeight:section.data.immersiveHeight==='half'?'50svh':section.data.immersiveHeight==='auto'?'min(70svh, 650px)':'100svh',display:'flex',alignItems:section.data.immersiveTextPosition==='top'?'flex-start':section.data.immersiveTextPosition==='center'?'center':'flex-end'}}>
          <img src={section.data.immersivePhoto} alt={section.data.immersiveTitle || section.title || 'Fotografía'}
            className="absolute inset-0 h-full w-full"
            style={{objectFit:section.data.immersiveFit==='contain'?'contain':'cover',objectPosition:`${Math.min(100,Math.max(0,Number(section.data.immersiveX??50)))}% ${Math.min(100,Math.max(0,Number(section.data.immersiveY??50)))}%`}} />
          <div className="absolute inset-0" style={{background:`linear-gradient(to top,rgba(0,0,0,${Math.min(.85,Math.max(0,Number(section.data.immersiveShade??45)/100))}),rgba(0,0,0,${Math.min(.65,Math.max(0,Number(section.data.immersiveShade??45)/200))}))`}}/>
          <div className="relative z-10 w-full p-6 sm:p-12 space-y-4 break-words">
            <h2 className="text-3xl sm:text-5xl font-bold leading-tight" style={{color:'#fff',...fieldStyle(section,'immersiveTitle')}}>{section.data.immersiveTitle || section.title}</h2>
            {section.data.immersiveCaption && <p className="text-base sm:text-xl whitespace-pre-wrap" style={{color:'#fff',...fieldStyle(section,'immersiveCaption')}}>{section.data.immersiveCaption}</p>}
          </div>
        </div>
      ) : <SectionHeading section={section} />}
      {(section.data?.text || section.data?.html) && (
        <p className="whitespace-pre-line leading-relaxed" style={fieldStyle(section, 'text')}>{section.data.text || section.data.html}</p>
      )}
      {section.type === 'custom_buttons' && (
        <div className="flex flex-wrap gap-2">
          {buttons.map(button => <button key={button.id} type="button" onClick={() => onButton(button)}
            className="profile-action" data-style={button.style} style={{ '--action-text': button.color, '--action-color': button.bgColor } as import('react').CSSProperties}>{button.label}</button>)}
        </div>
      )}
      {section.type === 'social' && (
        <div className="flex flex-wrap gap-2">
          {socialNetworks.map(([key, label, icon]) => {
            const saved = items.find(item => legacyNetwork(item) === key);
            const link = webLink(section.data?.socialLinks?.[key] ?? saved?.url ?? saved?.link);
            return link && <a key={key} href={link} target="_blank" rel="noopener noreferrer" className="profile-social">
              <img src={`https://api.iconify.design/${icon}.svg`} alt="" width="23" height="23" />{label}
            </a>;
          })}
          {items.filter(item => !legacyNetwork(item)).map((item, index) => {
            const link = webLink(item.url || item.link);
            return link && <a key={item.id || index} href={link} target="_blank" rel="noopener noreferrer" className="profile-social">
              <img src="https://api.iconify.design/mdi/web.svg" alt="" width="23" height="23" />{item.title || 'Página web'}
            </a>;
          })}
        </div>
      )}
      {!!items.length && section.type !== 'social' && (
        <ul className="profile-entry-list">
          {items.map((item, index) => {
            const link = webLink(item.fileUrl || item.embedUrl || item.url || item.link);
            const map = section.type === 'agenda'
              ? link || (item.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}` : undefined)
              : undefined;
            const thumbnail = section.type === 'videos' && link ? youtubeThumbnail(link) : undefined;
            return (
              <li key={item.id || index}>
                {section.type === 'videos' && link && <a href={link} target="_blank" rel="noopener noreferrer" className="profile-video" aria-label={`Reproducir ${item.title || 'video'}`}>
                  {thumbnail && <img src={thumbnail} alt="" loading="lazy" /> }
                  <span><Play fill="currentColor" size={24} /></span>
                </a>}
                {['year','date','time','institution','location'].map(field => item[field] && <p key={field} className="profile-kicker" style={fieldStyle(section, field, item)}>{item[field]}</p>)}
                {item.title && <h3 className="font-bold" style={fieldStyle(section, 'title', item)}>{item.title}</h3>}
                {item.description && <p className="mt-1 whitespace-pre-line leading-relaxed" style={fieldStyle(section, 'description', item)}>{item.description}</p>}
                {map && <a href={map} target="_blank" rel="noopener noreferrer" className="profile-action mt-2" data-style="outline">
                  <MapPin size={18} /> Ubicación
                </a>}
                {link && section.type !== 'videos' && section.type !== 'agenda' && <a href={link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold underline">
                  {section.type === 'documents' ? 'Abrir documento' : 'Abrir enlace'}
                </a>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function youtubeThumbnail(link: string) {
  const url = new URL(link);
  const host = url.hostname.replace(/^www\./, '');
  const id = host === 'youtu.be' ? url.pathname.split('/')[1]
    : ['youtube.com', 'm.youtube.com'].includes(host)
      ? url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1] : '';
  return id && /^[\w-]{11}$/.test(id) ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined;
}

export function ProfileGallery({ section }: { section: SectionConfig }) {
  const images: { id?: string; url: string; caption?: string }[] = (section.data?.images || []).filter((image: { url?: string }) => image.url);
  const rail = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const photo = images[index];
  const step = (direction: number) => setIndex(current => (current + direction + images.length) % images.length);
  const scroll = (direction: number) => rail.current?.scrollBy({ left: direction * (rail.current.clientWidth * .8), behavior: 'smooth' });
  return <>
    <div ref={rail} className="profile-gallery" aria-label="Fotografías">
      {images.map((image, position) => (
        <button key={image.id || position} type="button" onClick={() => { setIndex(position); dialog.current?.showModal(); }}
          className="profile-gallery-tile" aria-label={image.caption || `Ampliar foto ${position + 1}`}>
          <img src={image.url} alt={image.caption || ''} loading="lazy" />
          {image.caption && <span style={fieldStyle(section, 'caption', image as { textStyles?: Record<string, any> })}>{image.caption}</span>}
        </button>
      ))}
    </div>
    {images.length > 1 && <div className="flex justify-end gap-2">
      <button type="button" className="profile-icon-button" onClick={() => scroll(-1)} aria-label="Deslizar a la izquierda"><ChevronLeft /></button>
      <button type="button" className="profile-icon-button" onClick={() => scroll(1)} aria-label="Deslizar a la derecha"><ChevronRight /></button>
    </div>}
    <dialog ref={dialog} className="profile-photo-dialog" aria-label="Fotografía ampliada" onKeyDown={event => {
      if (images.length > 1 && ['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1); }
    }}>
      <div className="profile-photo-controls">
        {images.length > 1 && <button type="button" className="profile-icon-button" onClick={() => step(-1)} aria-label="Foto anterior"><ChevronLeft /></button>}
        {images.length > 1 && <button type="button" className="profile-icon-button" onClick={() => step(1)} aria-label="Siguiente foto"><ChevronRight /></button>}
        <button type="button" className="profile-icon-button" onClick={() => dialog.current?.close()} aria-label="Cerrar foto"><X /></button>
      </div>
      {photo && <figure><img src={photo.url} alt={photo.caption || `Foto ${index + 1}`} />
        {photo.caption && <figcaption style={fieldStyle(section, 'caption', photo as { textStyles?: Record<string, any> })}>{photo.caption}</figcaption>}
      </figure>}
    </dialog>
  </>;
}

export function ContactLocation({ section }: { section: SectionConfig }) {
  const address = section.data?.address?.trim();
  const map = webLink(section.data?.mapUrl) || (address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '');
  return <div className="space-y-3">
    {address && <p style={fieldStyle(section, 'address')}>{address}</p>}
    {map && <a className="profile-action" data-style="outline" href={map} target="_blank" rel="noopener noreferrer"><MapPin size={18} /> Abrir mapa</a>}
  </div>;
}
