import { Project } from '../types';

export function generateVCardString(project: Project): string {
  const { candidate, role, slug } = project;
  const publicUrl = `https://lavdigitalmkt.com/elecciones/${slug}/`;

  // Find whatsapp and phone from buttons or contact section
  const contactSec = project.sections.find((s) => s.type === 'contact')?.data || {};
  const phoneBtn = project.buttons.find((b) => b.actionType === 'call')?.actionValue;
  const waBtn = project.buttons.find((b) => b.actionType === 'whatsapp')?.actionValue;

  const phone = contactSec.phone || phoneBtn || '';
  const wa = contactSec.whatsapp || waBtn || '';
  const email = contactSec.email || '';
  const address = contactSec.address || `${candidate.municipality || 'Cuernavaca'}, Morelos, México`;

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${candidate.fullName}`,
    `N:${candidate.fullName};;;;`,
    `TITLE:${role}`,
    `ORG:LAV Política Digital;${project.internalName}`,
    `NOTE:${candidate.slogan || 'Campaña Electoral Morelos'}`,
    phone ? `TEL;TYPE=CELL,VOICE:${phone}` : '',
    wa && wa !== phone ? `TEL;TYPE=WORK,MSG:+${wa}` : '',
    email ? `EMAIL;TYPE=INTERNET,PREF:${email}` : '',
    `URL:${publicUrl}`,
    `ADR;TYPE=WORK:;;${address};Morelos;;Mexico`,
    'END:VCARD',
  ].filter(Boolean);

  return lines.join('\r\n');
}

export function downloadVCard(project: Project): void {
  const vcardText = generateVCardString(project);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.slug}-contacto.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
