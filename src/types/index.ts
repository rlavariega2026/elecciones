export type ProjectStatus = 'borrador' | 'publicado' | 'archivado';

export type PoliticalCategory =
  | 'federal'
  | 'estatal'
  | 'municipal'
  | 'cdmx'
  | 'auxiliar'
  | 'judicial'
  | 'otra';

export type PoliticalStage =
  | 'aspirante'
  | 'precandidatura'
  | 'candidatura'
  | 'candidatura_electa'
  | 'cargo_en_funciones'
  | 'exfuncionario'
  | 'institucional';

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  gradient?: string;
}

export interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  headingWeight: '400' | '600' | '700' | '800' | '900';
  bodyWeight: '400' | '500' | '600';
  letterSpacing: 'normal' | 'wide' | 'wider' | 'tight';
  lineHeight: 'tight' | 'normal' | 'relaxed';
  textTransform: 'none' | 'uppercase' | 'capitalize';
  textShadow?: boolean;
}

export interface LogoItem {
  id: string;
  name: string;
  url: string;
  size?: number; // 40 - 160 px
  visible?: boolean;
}

export interface LogosConfig {
  partyLogoUrl?: string;
  partyLogoSize?: number;
  partyLogoPlacement?: 'header' | 'above-photo' | 'below-photo';
  partyLogoAlignment?: 'left' | 'center' | 'right';
  partyLogoVisible?: boolean;
  candidateLogoUrl?: string;
  candidateLogoSize?: number;
  candidateLogoVisible?: boolean;
  campaignLogoUrl?: string;
  campaignLogoSize?: number;
  campaignLogoVisible?: boolean;
  coalitionLogos?: LogoItem[];
  slateLogoUrl?: string;
  slateLogoSize?: number;
  slateLogoVisible?: boolean;
  additionalEmblems?: LogoItem[];
  alignment: 'left' | 'center' | 'right';
}

export interface CandidateInfo {
  fullName: string;
  shortName: string;
  slogan: string;
  tagline: string;
  heroPhotoUrl: string;
  heroPhotoStyle: 'rounded' | 'circle' | 'square' | 'gradient_cut' | 'full_bleed';
  coverPhotoUrl?: string;
  bio: string;
  quote?: string;
  location?: string;
  district?: string;
  state: string;
  municipality?: string;
}

export type SectionType =
  | 'hero'
  | 'bio'
  | 'trajectory'
  | 'education'
  | 'experience'
  | 'proposals'
  | 'commitments'
  | 'results'
  | 'agenda'
  | 'gallery'
  | 'videos'
  | 'press'
  | 'social'
  | 'contact'
  | 'citizen_form'
  | 'faq'
  | 'documents'
  | 'slate'
  | 'custom_buttons'
  | 'custom_html';

export interface SectionProposalItem {
  id: string;
  pillar: string;
  title: string;
  description: string;
  impact?: string;
  iconName?: string;
}

export interface SectionTrajectoryItem {
  id: string;
  year: string;
  title: string;
  institution: string;
  description?: string;
}

export interface SectionGalleryItem {
  id: string;
  url: string;
  caption: string;
  category?: string;
}

export interface SectionVideoItem {
  id: string;
  title: string;
  embedUrl: string; // YouTube / Vimeo or MP4
  description?: string;
}

export interface SectionFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SectionDocumentItem {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileSize?: string;
  pages?: number;
}

export interface SectionConfig {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  enabled: boolean;
  order: number;
  layoutVariant?: string;
  data: Record<string, any>;
}

export interface SlateMember {
  id: string;
  fullName: string;
  roleTitle: string;
  type:
    | 'presidencia'
    | 'suplente_presidencia'
    | 'sindicatura'
    | 'suplente_sindicatura'
    | 'regiduria'
    | 'suplente_regiduria'
    | 'ayudante'
    | 'suplente_ayudante'
    | 'equipo'
    | 'otro';
  order: number;
  photoUrl: string;
  party?: string;
  personalLogoUrl?: string;
  bio?: string;
  proposals?: string[];
  phone?: string;
  email?: string;
  whatsapp?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
  };
}

export interface MunicipalSlate {
  municipality: string;
  headerPhotoUrl?: string;
  slateName?: string;
  color?: string; // used for Ayudantía color: 'blanca' | 'roja' | 'azul' | 'verde' | 'amarilla' | 'morada' | 'personalizada'
  isAyudantia?: boolean;
  pobladoColonia?: string;
  communityProposals?: string[];
  members: SlateMember[];
}

export interface InteractiveButton {
  id: string;
  label: string;
  style: 'solid' | 'gradient' | 'outline' | 'glass' | 'floating' | 'pill' | 'minimal' | 'capsule' | 'tile' | 'glass-edge' | 'split-icon' | 'spotlight' | 'neon-line';
  actionType:
    | 'whatsapp'
    | 'call'
    | 'email'
    | 'map'
    | 'document'
    | 'citizen_form'
    | 'external_url'
    | 'vcard';
  actionValue: string;
  icon: string;
  enabled: boolean;
  color?: string;
  bgColor?: string;
}

export interface ProjectMetadata {
  sectionsManaged?: boolean;
  citizenFormManaged?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  publishedUrl?: string;
  viewsCount: number;
  clicksCount: number;
  qrScansCount: number;
  inquiriesCount: number;
}

export interface Project {
  typographyPreset?: 'editorial' | 'geometric' | 'compact' | 'custom';
  visualPreset?: 'classic' | 'cristal-editorial';
  id: string;
  internalName: string;
  slug: string;
  previousSlugs: string[];
  status: ProjectStatus;
  category: PoliticalCategory;
  role: string;
  stage: PoliticalStage;
  partyId: string;
  coalitionParties: string[];
  designFamily: string;
  variantId: string;
  palette: ColorPalette;
  backgroundImageUrl?: string;
  backgroundAppearance?: { fit?: 'cover' | 'contain'; x?: number; y?: number; zoom?: number; blur?: number; opacity?: number };
  citizenWhatsApp?: string;
  typography: TypographySettings;
  logos: LogosConfig;
  candidate: CandidateInfo;
  sections: SectionConfig[];
  municipalSlate?: MunicipalSlate;
  buttons: InteractiveButton[];
  meta: ProjectMetadata;
}

export interface DesignVariant {
  id: string;
  name: string;
  description: string;
  previewHeroStyle: string;
}

export interface DesignFamily {
  id: string;
  name: string;
  description: string;
  recommendedRoles: string[];
  variants: DesignVariant[];
}

export interface CitizenInquiry {
  id: string;
  folio: string; // e.g., "LAV-2026-9842"
  projectId: string;
  projectSlug: string;
  projectCandidateName: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone: string;
  citizenColonia: string;
  inquiryType: 'solicitud' | 'propuesta' | 'reporte' | 'consulta' | 'mensaje';
  message: string;
  privacyAccepted: boolean;
  status: 'nuevo' | 'en_proceso' | 'atendido';
  createdAt: string;
  notes?: string;
}

export interface AnalyticsSummary {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalViews: number;
  totalClicks: number;
  totalQrScans: number;
  totalInquiries: number;
  recentInquiries: CitizenInquiry[];
}
