import type { SectionConfig } from '../../../types';
import { sectionSurface } from '../../../utils/profilePresentation';

interface SectionDesignProps {
  section: SectionConfig;
  onChange: (data: SectionConfig['data']) => void;
}

export function SectionBackgroundControls({ section, onChange }: SectionDesignProps) {
  const { data } = section;
  const appearance = data.appearance || {};
  const setAppearance = (changes: Record<string, string | number | boolean>) => onChange({ ...data, appearance: { ...appearance, ...changes } });
  return (
    <fieldset className="col-span-full space-y-2 rounded-lg border border-slate-200 p-3">
      <legend className="font-semibold">Fondo de este recuadro</legend>
      <label className="block"><input type="checkbox" checked={appearance.framed !== false} onChange={event => setAppearance({ framed: event.target.checked })} /> Mostrar recuadro</label>
      <label>Acabado <select disabled={appearance.framed === false} value={appearance.finish || 'default'} onChange={event => setAppearance({ finish: event.target.value })}>
        <option value="default">De la plantilla</option><option value="solid">Sólido</option>
        <option value="gradient">Degradado</option><option value="metallic">Metálico</option><option value="brushed">Metal cepillado</option><option value="glass">Cristal</option><option value="graphite">Grafito</option>
        <optgroup label="Materiales modernos"><option value="frosted">Cristal esmerilado</option><option value="smoked">Cristal ahumado</option><option value="prism">Prisma iridiscente</option><option value="mesh">Malla tecnológica</option></optgroup>
      </select></label>
      {appearance.framed !== false && <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">Transparencia · {100 - (appearance.opacity ?? 100)}%
          <input className="block w-full" type="range" min="0" max="100" value={100 - (appearance.opacity ?? 100)}
            onChange={event => setAppearance({ opacity: 100 - Number(event.target.value) })} />
        </label>
        {['glass','frosted','smoked','prism','mesh'].includes(appearance.finish) && <label className="block">Desenfoque
          <input className="block w-full" type="range" min="0" max="32" value={appearance.blur ?? 14}
            onChange={event => setAppearance({ blur: Number(event.target.value) })} />
        </label>}
      </div>}
      {appearance.framed !== false && appearance.finish && appearance.finish !== 'default' && <div className="flex flex-wrap items-center gap-3">
        <label>Color principal <input type="color" value={appearance.primary || '#f8fafc'} onChange={event => setAppearance({ primary: event.target.value })} /></label>
        {appearance.finish !== 'solid' && <label>Color secundario <input type="color" value={appearance.secondary || '#94a3b8'} onChange={event => setAppearance({ secondary: event.target.value })} /></label>}
        {["glass", "brushed", "graphite"].includes(appearance.finish) && <label>Intensidad <input type="range" min="0" max="100" value={appearance.intensity ?? 55} onChange={event => setAppearance({ intensity: Number(event.target.value) })} /></label>}
        <div className="profile-material-preview w-full"><span className="block rounded-lg border px-4 py-3 font-semibold text-slate-900" style={sectionSurface(section, '#ffffff')}>Vista previa del recuadro</span></div>
      </div>}
    </fieldset>
  );
}

export function HeroPhotoControls({ section, onChange }: SectionDesignProps) {
  const { data } = section;
  return <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3">
    <legend className="font-semibold">Foto de portada</legend>
    <label className="block">Presentación de foto principal
      <select className="block w-full rounded-lg border bg-white p-2" value={data.photoLayout || 'portrait'} onChange={event => onChange({ ...data, photoLayout: event.target.value })}>
        <option value="portrait">Presentación de la plantilla</option><option value="immersive">Foto inmersiva</option>
      </select>
    </label>
    {data.photoLayout === 'immersive' && ([
      ['photoMobileX', 'Horizontal en celular', 50], ['photoMobileY', 'Vertical en celular', 35],
      ['photoDesktopX', 'Horizontal en escritorio', 50], ['photoDesktopY', 'Vertical en escritorio', 35],
    ] as const).map(([key, label, fallback]) => <label key={key} className="block">{label} · {data[key] ?? fallback}%
      <input className="block w-full" type="range" min="0" max="100" value={data[key] ?? fallback}
        onChange={event => onChange({ ...data, [key]: Number(event.target.value) })} />
    </label>)}
  </fieldset>;
}
