import { SectionConfig } from '../../../types';

const fieldLabels: Record<string, string> = {
  title: 'Título', description: 'Descripción', date: 'Fecha', time: 'Hora', location: 'Lugar',
  year: 'Año o periodo', institution: 'Institución', url: 'Enlace', fileUrl: 'Enlace al PDF',
  embedUrl: 'Enlace al video', question: 'Pregunta', answer: 'Respuesta',
  caption: 'Pie de foto', pillar: 'Tema', impact: 'Impacto',
};

export function SectionContentFields({ section, onChange }: {
  section: SectionConfig;
  onChange: (data: SectionConfig['data']) => void;
}) {
  const { type, data } = section;
  if (['hero', 'bio', 'contact', 'slate', 'custom_buttons'].includes(type)) return null;
  if (type === 'custom_html') {
    return <label className="block space-y-1 font-semibold">Contenido
      <textarea rows={5} value={data.text ?? data.html ?? ''} onChange={e => onChange({ ...data, text: e.target.value })}
        className="block w-full rounded-lg border border-slate-200 bg-white p-2 font-normal" />
    </label>;
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
      {items.map((item, index) => (
        <fieldset key={item.id || index} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2">
          {fields.map(field => (
            <label key={field} className="block space-y-1">
              <span className="font-semibold">{field === 'url' && type === 'gallery' ? 'URL de la foto' : fieldLabels[field]}</span>
              <input value={item[field] ?? ''} onChange={e => setItems(items.map((row, at) => at === index ? { ...row, [field]: e.target.value } : row))}
                className="block w-full rounded-lg border border-slate-200 p-2" />
            </label>
          ))}
          <button type="button" className="w-fit font-semibold text-rose-700" onClick={() => setItems(items.filter((_, at) => at !== index))}>Quitar elemento</button>
        </fieldset>
      ))}
      <button type="button" className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold"
        onClick={() => setItems([...items, { id: crypto.randomUUID() }])}>Agregar elemento</button>
    </div>
  );
}
