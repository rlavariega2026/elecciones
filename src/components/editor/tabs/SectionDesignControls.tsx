import type { SectionConfig } from '../../../types';
import { sectionSurface } from '../../../utils/profilePresentation';

interface SectionDesignProps {
  section: SectionConfig;
  onChange: (data: SectionConfig['data']) => void;
}

export function SectionBackgroundControls({ section, onChange }: SectionDesignProps) {
  const { data } = section;
  const appearance = data.appearance || {};
  const setAppearance = (changes: Record<string, string>) => onChange({ ...data, appearance: { ...appearance, ...changes } });
  return (
    <fieldset className="col-span-full space-y-2 rounded-lg border border-slate-200 p-3">
      <legend className="font-semibold">Fondo de este recuadro</legend>
      <label>Acabado <select value={appearance.finish || 'default'} onChange={event => setAppearance({ finish: event.target.value })}>
        <option value="default">De la plantilla</option><option value="solid">Sólido</option>
        <option value="gradient">Degradado</option><option value="metallic">Metálico</option>
      </select></label>
      {appearance.finish && appearance.finish !== 'default' && <div className="flex flex-wrap items-center gap-3">
        <label>Color principal <input type="color" value={appearance.primary || '#f8fafc'} onChange={event => setAppearance({ primary: event.target.value })} /></label>
        {appearance.finish !== 'solid' && <label>Color secundario <input type="color" value={appearance.secondary || '#94a3b8'} onChange={event => setAppearance({ secondary: event.target.value })} /></label>}
        <span className="inline-block h-8 w-20 rounded-md border border-slate-300" style={sectionSurface(section, '#ffffff')} aria-label="Muestra de fondo" />
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
