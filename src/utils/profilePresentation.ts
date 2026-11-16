import type { CSSProperties } from 'react';
import type { Project, SectionConfig } from '../types';

export const socialNetworks = [
  ['x', 'X', 'simple-icons/x'], ['facebook', 'Facebook', 'mdi/facebook'],
  ['instagram', 'Instagram', 'mdi/instagram'], ['tiktok', 'TikTok', 'simple-icons/tiktok'],
  ['youtube', 'YouTube', 'mdi/youtube'], ['linkedin', 'LinkedIn', 'mdi/linkedin'],
  ['website', 'Página web', 'mdi/web'],
] as const;

export function fieldStyle(section: SectionConfig, field: string, item?: { textStyles?: SectionConfig['data'] }): CSSProperties {
  const style = { ...section.data?.textStyles?.[field], ...item?.textStyles?.[field] };
  return {
    fontFamily: style.font ? `"${style.font}", sans-serif` : undefined,
    fontSize: style.size ? `${style.size}px` : undefined,
    color: style.color || undefined,
    textAlign: style.align || undefined,
  };
}

export function profileSections(project: Project): SectionConfig[] {
  const sections = [...(project.sections || [])].sort((a, b) => a.order - b.order);
  if (!project.meta?.sectionsManaged && project.municipalSlate?.members?.length && !sections.some(section => section.type === 'slate')) {
    sections.splice(2, 0, { id: 'legacy-slate', type: 'slate', title: project.municipalSlate.slateName || 'Planilla Municipal', order: 3, enabled: true, data: {} });
  }
  const contact = sections.find(section => section.type === 'contact');
  if (!project.meta?.citizenFormManaged && !sections.some(section => section.type === 'citizen_form')) {
    const entry: SectionConfig = { id: 'legacy-citizen-form', type: 'citizen_form', title: 'Solicitud Ciudadana', enabled: contact?.enabled ?? false, order: contact?.order ?? sections.length + 1, data: {} };
    if (contact) sections.splice(sections.indexOf(contact) + 1, 0, entry);
    else if (project.buttons.some(button => button.enabled && button.actionType === 'citizen_form')) sections.push({ ...entry, enabled: true });
  }
  return sections;
}

export function legacyNetwork(item: { title?: string; url?: string; link?: string }) {
  const name = item.title?.toLowerCase().trim();
  const url = (item.url || item.link || '').toLowerCase();
  return socialNetworks.find(([key, label]) => name === label.toLowerCase() ||
    (key !== 'website' && url.includes(key + '.com')) ||
    (key === 'x' && (name === 'twitter' || url.includes('twitter.com'))) ||
    (key === 'youtube' && url.includes('youtu.be')))?.[0];
}

export function sectionSurface(section: SectionConfig, fallback: string, editorial = false): CSSProperties {
  const appearance = section.data?.appearance;
  if (appearance?.framed === false) return { background: 'transparent', borderColor: 'transparent', borderWidth: 0, boxShadow: 'none' };
  const safeColor = (value: unknown, defaultValue: string) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : defaultValue;
  const selected = appearance?.finish;
  const finish = selected && selected !== 'default' ? selected
    : editorial ? ({ bio: 'glass', agenda: 'brushed', proposals: 'graphite' } as Record<string, string>)[section.type] : undefined;
  const primary = safeColor(appearance?.primary, finish === 'glass' ? '#f1f5f9' : finish === 'graphite' ? '#cbd5e1' : '#f8fafc');
  const secondary = safeColor(appearance?.secondary, '#94a3b8');
  const intensity = Math.min(100, Math.max(0, Number(appearance?.intensity ?? 55)));
  if (finish === 'glass') return {
    background: `linear-gradient(145deg, color-mix(in srgb, ${primary} ${65 + intensity * .28}%, transparent), color-mix(in srgb, ${secondary} ${40 + intensity * .35}%, transparent))`,
    backdropFilter: `blur(${4 + intensity * .17}px)`, borderColor: '#ffffff88',
    boxShadow: '0 1px 0 #ffffff80 inset, 0 18px 48px #0f172a20',
  };
  if (finish === 'graphite') return {
    background: `repeating-linear-gradient(135deg, #0f172a0a 0 1px, transparent 1px 5px), linear-gradient(145deg, ${primary}, color-mix(in srgb, ${secondary} ${intensity}%, #dbe2ec))`,
    borderColor: '#64748b70', boxShadow: '0 1px 0 #ffffff70 inset, 0 16px 36px #0f172a24',
  };
  if (finish === 'solid') return { background: primary };
  if (finish === 'gradient') return { background: `linear-gradient(135deg, ${primary}, ${secondary})` };
  if (finish === 'metallic') return {
    background: `linear-gradient(120deg, ${secondary} 0%, ${primary} 35%, color-mix(in srgb, ${primary} 82%, white) 48%, ${secondary} 65%, ${primary} 100%)`,
  };
  if (finish === 'brushed') return {
    background: `repeating-linear-gradient(105deg, #ffffff35 0 1px, transparent 1px 4px), linear-gradient(120deg, ${secondary}, ${primary} 35%, color-mix(in srgb, ${primary} ${100 - intensity * .5}%, white) 48%, ${secondary} 65%, ${primary})`,
  };
  return { backgroundColor: fallback || '#fff' };
}
