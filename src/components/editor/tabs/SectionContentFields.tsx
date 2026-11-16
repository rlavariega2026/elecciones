import { useRef, useState } from 'react';
import { PROFESSIONAL_FONTS } from '../../../data/fonts';
import { legacyNetwork, socialNetworks } from '../../../utils/profilePresentation';
import { SectionConfig } from '../../../types';

const fieldLabels: Record<string, string> = {
  title: 'Título', description: 'Descripción', date: 'Fecha', time: 'Hora', location: 'Lugar',
  year: 'Año o periodo', institution: 'Institución', url: 'Enlace', fileUrl: 'Enlace al PDF',
  embedUrl: 'Enlace al video', question: 'Pregunta', answer: 'Respuesta',
  caption: 'Pie de foto', pillar: 'Tema', impact: 'Impacto',
};

function TextControls({ value = {}, onChange }: { value?: Record<string, any>; onChange: (style: Record<string, any>) => void }) {
  return <details className="rounded-lg border border-slate-200 p-2">
    <summary className="cursor-pointer font-semibold">Formato de texto</summary>
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      <label>Fuente<select className="block w-full" value={value.font || ''} onChange={e => onChange({ ...value, font: e.target.value })}>
        <option value="">Heredada</option>{PROFESSIONAL_FONTS.map(font => <option key={font.id}>{font.name}</option>)}
      </select></label>
      <label>Tamaño (px)<input className="block w-full" type="number" min="8" max="120" value={value.size ?? ''} onChange={e => onChange({ ...value, size: e.target.value ? Math.min(120, Math.max(1, Number(e.target.value))) : undefined })} /></label>
      <label>Color <input type="color" value={value.color || '#0f172a'} onChange={e => onChange({ ...value, color: e.target.value })} /></label>
      <label>Alineación<select className="block w-full" value={value.align || ''} onChange={e => onChange({ ...value, align: e.target.value })}>
        <option value="">Heredada</option><option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option><option value="justify">Justificada</option>
      </select></label>
      <button type="button" className="text-left underline" onClick={() => onChange({})}>Restablecer formato</button>
    </div>
  </details>;
}

function readPhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function SectionContentFields({ section, onChange }: {
  section: SectionConfig;
  onChange: (data: SectionConfig['data']) => void;
}) {
  const { type, data } = section;
  const latest = useRef({ data, onChange });
  latest.current = { data, onChange };
  const [photoError, setPhotoError] = useState('');
  const [reading, setReading] = useState(false);
  const fieldFormat = (field: string) => <TextControls value={data.textStyles?.[field]}
    onChange={style => onChange({ ...data, textStyles: { ...data.textStyles, [field]: style } })} />;
  const heading = <div className="grid gap-2 sm:grid-cols-2">
    <div>Título visible{fieldFormat('heading')}</div>
    <div>Subtítulo o kicker{fieldFormat('subtitle')}</div>
  </div>;
  if (type === 'hero') return <div className="space-y-3">{heading}
    <label className="block">Rótulo de etapa
      <input className="block w-full rounded-lg border bg-white p-2" value={data.stageLabel ?? ''}
        placeholder="Etapa predeterminada" onChange={e => onChange({ ...data, stageLabel: e.target.value })} />
    </label>
    <label><input type="checkbox" checked={data.hideStage === true} onChange={e => onChange({ ...data, hideStage: e.target.checked })} /> Ocultar rótulo</label>
    {fieldFormat('stage')}
  </div>;
  if (type === 'contact') return <div className="space-y-3">{heading}
    {([['address','Dirección'],['mapUrl','Enlace de Google Maps']] as const).map(([key,label]) => <label key={key} className="block">{label}
      <input className="block w-full rounded-lg border bg-white p-2" value={data[key] || ''} onChange={e => onChange({ ...data, [key]: e.target.value })} />
    </label>)}
    <div>Dirección{fieldFormat('address')}</div>
  </div>;
  if (type === 'social') return <div className="space-y-3">{heading}
    {socialNetworks.map(([key,label]) => <label key={key} className="block">{label}
      <input type="url" className="block w-full rounded-lg border bg-white p-2" value={data.socialLinks?.[key] ?? (data.items || []).find((item: Parameters<typeof legacyNetwork>[0]) => legacyNetwork(item) === key)?.url ?? (data.items || []).find((item: Parameters<typeof legacyNetwork>[0]) => legacyNetwork(item) === key)?.link ?? ''}
        placeholder="https://" onChange={e => onChange({ ...data, socialLinks: { ...data.socialLinks, [key]: e.target.value } })} />
    </label>)}
  </div>;
  if (['bio', 'citizen_form', 'slate', 'custom_buttons'].includes(type)) return heading;
  if (type === 'custom_html') {
    return <>{heading}<label className="block space-y-1 font-semibold">Contenido
      <textarea rows={5} value={data.text ?? data.html ?? ''} onChange={e => onChange({ ...data, text: e.target.value })}
        className="block w-full rounded-lg border border-slate-200 bg-white p-2 font-normal" />
    </label>{fieldFormat('text')}</>;
  }
  const fields = type === 'agenda' ? ['title', 'date', 'time', 'location', 'description', 'url']
    : ['education', 'trajectory', 'experience'].includes(type) ? ['title', 'year', 'institution', 'description']
    : type === 'gallery' ? ['url', 'caption']
    : type === 'faq' ? ['question', 'answer']
    : type === 'proposals' ? ['pillar', 'title', 'description', 'impact']
    : ['title', 'description', type === 'documents' ? 'fileUrl' : type === 'videos' ? 'embedUrl' : 'url'];
  const key = type === 'gallery' ? 'images' : 'items';
  const items = Array.isArray(data[key]) ? data[key] : [];
  const setItems = (value: typeof items) => onChange({ ...data, [key]: value });
  return (
    <div className="space-y-3">
      {heading}
      {type === 'gallery' && <label className="block font-semibold">Subir una o varias fotos
        <input className="block w-full" type="file" multiple disabled={reading} accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={async event => {
            const files = Array.from(event.currentTarget.files || []);
            event.currentTarget.value = '';
            if (!files.length) return;
            setReading(true);
            setPhotoError('');
            try {
              const photos = [];
              for (const file of files) photos.push({ id: crypto.randomUUID(), url: await readPhoto(file), caption: '' });
              const current = latest.current;
              current.onChange({ ...current.data, images: [...(current.data.images || []), ...photos] });
            } catch {
              setPhotoError('No se pudieron leer las fotos seleccionadas.');
            } finally {
              setReading(false);
            }
          }} />
        {reading && <span role="status">Leyendo fotos…</span>}
        {photoError && <span role="alert">{photoError}</span>}
      </label>}
      {items.map((item, index) => (
        <fieldset key={item.id || index} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2">
          {fields.map(field => (
            <div key={field} className="space-y-1"><label className="block space-y-1">
              <span className="font-semibold">{field === 'url' && type === 'gallery' ? 'URL de la foto' : fieldLabels[field]}</span>
              <input value={item[field] ?? ''} onChange={e => setItems(items.map((row, at) => at === index ? { ...row, [field]: e.target.value } : row))}
                className="block w-full rounded-lg border border-slate-200 p-2" />
            </label>
            {!['url', 'fileUrl', 'embedUrl'].includes(field) && <TextControls value={item.textStyles?.[field]} onChange={style =>
              setItems(items.map((row, at) => at === index ? { ...row, textStyles: { ...row.textStyles, [field]: style } } : row))
            } />}
            </div>
          ))}
          <button type="button" className="w-fit font-semibold text-rose-700" onClick={() => setItems(items.filter((_, at) => at !== index))}>Quitar elemento</button>
        </fieldset>
      ))}
      <button type="button" className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold"
        onClick={() => setItems([...items, { id: crypto.randomUUID() }])}>Agregar elemento</button>
    </div>
  );
}
