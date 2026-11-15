import { PoliticalCategory, PoliticalStage } from '../types';

export interface PoliticalRoleItem {
  id: string;
  category: PoliticalCategory;
  name: string;
  level: string;
  isJudicial?: boolean;
  isAuxiliary?: boolean;
  defaultSlateCapable?: boolean;
}

export const POLITICAL_ROLES: PoliticalRoleItem[] = [
  // Federal
  { id: 'presidencia_republica', category: 'federal', name: 'Presidencia de la República', level: 'Federal' },
  { id: 'senaduria', category: 'federal', name: 'Senaduría de la República', level: 'Federal' },
  { id: 'diputacion_federal', category: 'federal', name: 'Diputación Federal', level: 'Federal' },

  // Estatal
  { id: 'gubernatura', category: 'estatal', name: 'Gubernatura del Estado', level: 'Estatal' },
  { id: 'diputacion_local', category: 'estatal', name: 'Diputación Local (Congreso Morelos)', level: 'Estatal' },

  // Municipal
  { id: 'presidencia_municipal', category: 'municipal', name: 'Presidencia Municipal (Ayuntamiento)', level: 'Municipal', defaultSlateCapable: true },
  { id: 'sindicatura', category: 'municipal', name: 'Sindicatura Municipal', level: 'Municipal' },
  { id: 'regiduria', category: 'municipal', name: 'Regiduría Municipal', level: 'Municipal' },

  // Ciudad de México
  { id: 'jefatura_gobierno', category: 'cdmx', name: 'Jefatura de Gobierno CDMX', level: 'CDMX' },
  { id: 'alcaldia', category: 'cdmx', name: 'Alcaldía CDMX', level: 'CDMX', defaultSlateCapable: true },
  { id: 'concejalia', category: 'cdmx', name: 'Concejalía CDMX', level: 'CDMX' },

  // Autoridades auxiliares
  { id: 'ayudantia_municipal', category: 'auxiliar', name: 'Ayudantía Municipal (Poblado / Colonia)', level: 'Auxiliar', isAuxiliary: true, defaultSlateCapable: true },
  { id: 'presidencia_comunidad', category: 'auxiliar', name: 'Presidencia de Comunidad', level: 'Auxiliar', isAuxiliary: true },
  { id: 'junta_municipal', category: 'auxiliar', name: 'Junta Municipal / Delegación', level: 'Auxiliar', isAuxiliary: true },

  // Poder Judicial
  { id: 'ministratura_scjn', category: 'judicial', name: 'Ministratura de la Suprema Corte (SCJN)', level: 'Judicial Federal', isJudicial: true },
  { id: 'magistratura_federal', category: 'judicial', name: 'Magistratura Federal de Circuito', level: 'Judicial Federal', isJudicial: true },
  { id: 'magistratura_local', category: 'judicial', name: 'Magistratura del Tribunal Superior Local', level: 'Judicial Estatal', isJudicial: true },
  { id: 'juzgado_federal', category: 'judicial', name: 'Persona Juzgadora Federal de Distrito', level: 'Judicial Federal', isJudicial: true },
  { id: 'juzgado_local', category: 'judicial', name: 'Persona Juzgadora Local', level: 'Judicial Local', isJudicial: true },

  // Otras modalidades
  { id: 'perfil_institucional', category: 'otra', name: 'Perfil Institucional / Organismo', level: 'Institucional' },
  { id: 'liderazgo_social', category: 'otra', name: 'Liderazgo Social y Comunitario', level: 'Cívico' },
  { id: 'representacion_comunitaria', category: 'otra', name: 'Representación Comunitaria y Vecinal', level: 'Cívico' },
  { id: 'planilla_completa', category: 'municipal', name: 'Planilla Municipal Completa', level: 'Municipal', defaultSlateCapable: true },
  { id: 'planilla_ayudantia', category: 'auxiliar', name: 'Planilla de Ayudantía por Color', level: 'Auxiliar', isAuxiliary: true, defaultSlateCapable: true },
];

export const POLITICAL_STAGES: Array<{ id: PoliticalStage; label: string; description: string }> = [
  { id: 'aspirante', label: 'Aspirante', description: 'Registro interno o proceso de selección inicial' },
  { id: 'precandidatura', label: 'Precandidatura', description: 'Periodo de precampaña electoral' },
  { id: 'candidatura', label: 'Candidatura', description: 'Campaña constitucional activa' },
  { id: 'candidatura_electa', label: 'Candidatura Electa', description: 'Triunfo electoral acreditado con constancia' },
  { id: 'cargo_en_funciones', label: 'Cargo en Funciones', description: 'Servidor público o representante en funciones' },
  { id: 'exfuncionario', label: 'Exfuncionario / Trayectoria', description: 'Historial y memoria de gestión pública' },
  { id: 'institucional', label: 'Perfil Institucional', description: 'Representación pública no electoral' },
];

export const MORELOS_MUNICIPALITIES = [
  'Amacuzac',
  'Atlatlahucan',
  'Axochiapan',
  'Ayala',
  'Coatetelco (Indígena)',
  'Coatlán del Río',
  'Cuautla',
  'Cuernavaca',
  'Emiliano Zapata',
  'Hueyapan (Indígena)',
  'Huitzilac',
  'Jantetelco',
  'Jiutepec',
  'Jojutla',
  'Jonacatepec',
  'Mazatepec',
  'Miacatlán',
  'Ocuituco',
  'Puente de Ixtla',
  'Temixco',
  'Temoac',
  'Tepalcingo',
  'Tepoztlán',
  'Tetecala',
  'Tetela del Volcán',
  'Tlalnepantla',
  'Tlaltizapán de Zapata',
  'Tlaquiltenango',
  'Tlayacapan',
  'Totolapan',
  'Xochitepec',
  'Xoxocotla (Indígena)',
  'Yautepec',
  'Yecapixtla',
  'Zacatepec',
  'Zacualpan de Amilpas',
];
