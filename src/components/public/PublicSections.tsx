import { InteractiveButton, SectionConfig } from '../../types';

export function SectionHeading({ section }: { section: SectionConfig }) {
  return (
    <header className="profile-section-heading">
      {section.subtitle && <p className="profile-kicker">{section.subtitle}</p>}
      <h2>{section.title}</h2>
    </header>
  );
}

function webLink(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value, window.location.origin);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function AdditionalSection({ section, surface, buttons, onButton }: {
  section: SectionConfig;
  surface: string;
  buttons: InteractiveButton[];
  onButton: (button: InteractiveButton) => void;
}) {
  const items = Array.isArray(section.data?.items) ? section.data.items : [];
  return (
    <section data-module={section.type} className="rounded-2xl border border-slate-200/60 p-6 sm:p-8 space-y-4"
      style={{ backgroundColor: surface || '#fff' }}>
      <SectionHeading section={section} />
      {(section.data?.text || section.data?.html) && (
        <p className="whitespace-pre-line leading-relaxed">{section.data.text || section.data.html}</p>
      )}
      {section.type === 'custom_buttons' && (
        <div className="flex flex-wrap gap-2">
          {buttons.map(button => <button key={button.id} type="button" onClick={() => onButton(button)}
            className="rounded-xl border px-4 py-2 font-semibold">{button.label}</button>)}
        </div>
      )}
      {!!items.length && (
        <ul className="profile-entry-list">
          {items.map((item, index) => {
            const link = webLink(item.fileUrl || item.embedUrl || item.url || item.link);
            const detail = [item.date || item.year, item.time, item.location || item.institution].filter(Boolean).join(' · ');
            return (
              <li key={item.id || index}>
                {detail && <p className="profile-kicker">{detail}</p>}
                {item.title && <h3 className="font-bold">{item.title}</h3>}
                {item.description && <p className="mt-1 whitespace-pre-line leading-relaxed">{item.description}</p>}
                {link && <a href={link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold underline">
                  {section.type === 'documents' ? 'Abrir documento' : section.type === 'videos' ? 'Ver video' : 'Abrir enlace'}
                </a>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
