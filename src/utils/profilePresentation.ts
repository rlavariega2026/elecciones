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
