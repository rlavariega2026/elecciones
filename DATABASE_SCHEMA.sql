-- =========================================================================
-- LAV POLÍTICA DIGITAL — ESTRUCTURA DE BASE DE DATOS RELACIONAL ENTERPRISE
-- Marca: LAV Digital MKT
-- Lema: "Lo que no se ve, no existe"
-- Dominio: https://lavdigitalagency.com/elecciones/
-- =========================================================================

-- 1. TABLA DE USUARIOS / ADMINISTRADORES DE CAMPAÑA
CREATE TABLE IF NOT EXISTS lav_users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'campaign_manager', -- 'superadmin', 'agency_admin', 'campaign_editor', 'viewer'
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE PARTIDOS Y COALICIONES ELECTORALES
CREATE TABLE IF NOT EXISTS lav_political_parties (
    id VARCHAR(50) PRIMARY KEY, -- 'PAN', 'PRI', 'MORENA', 'PT', 'PVEM', 'MC', 'PAZ', 'SOMOS', etc.
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    party_type VARCHAR(50) NOT NULL, -- 'nacional', 'local', 'independiente', 'coalicion', 'judicial'
    primary_color VARCHAR(10) NOT NULL,
    secondary_color VARCHAR(10) NOT NULL,
    accent_color VARCHAR(10) NOT NULL,
    default_gradient VARCHAR(255),
    logo_url TEXT,
    suggested_typography VARCHAR(100) DEFAULT 'Montserrat',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA MAESTRA DE PROYECTOS / TARJETAS DIGITALES POLÍTICAS
CREATE TABLE IF NOT EXISTS lav_projects (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES lav_users(id) ON DELETE SET NULL,
    internal_name VARCHAR(255) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'borrador', -- 'borrador', 'publicado', 'archivado'
    category VARCHAR(50) NOT NULL, -- 'federal', 'estatal', 'municipal', 'cdmx', 'auxiliar', 'judicial', 'otra'
    role_title VARCHAR(255) NOT NULL,
    stage VARCHAR(50) DEFAULT 'candidatura', -- 'aspirante', 'precandidatura', 'candidatura', 'candidatura_electa', 'cargo_en_funciones', 'exfuncionario', 'institucional'
    party_id VARCHAR(50) REFERENCES lav_political_parties(id),
    coalition_parties JSONB DEFAULT '[]'::jsonb,
    municipality VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(50) DEFAULT 'Morelos',

    -- Configuración de diseño y variantes
    design_family VARCHAR(50) DEFAULT 'campana_moderna', -- 10 familias
    variant_id VARCHAR(50) DEFAULT 'mod_glass_card', -- 5 variantes por familia (50 totales)

    -- Paleta de colores personalizada
    palette_primary VARCHAR(10) NOT NULL,
    palette_secondary VARCHAR(10) NOT NULL,
    palette_accent VARCHAR(10) NOT NULL,
    palette_background VARCHAR(10) DEFAULT '#F8FAFC',
    palette_surface VARCHAR(10) DEFAULT '#FFFFFF',
    palette_text VARCHAR(10) DEFAULT '#0F172A',
    palette_text_muted VARCHAR(10) DEFAULT '#64748B',
    palette_gradient TEXT,

    -- Tipografía personalizada
    typography_heading_font VARCHAR(100) DEFAULT 'Montserrat',
    typography_body_font VARCHAR(100) DEFAULT 'Plus Jakarta Sans',
    typography_heading_weight VARCHAR(10) DEFAULT '700',
    typography_body_weight VARCHAR(10) DEFAULT '400',
    typography_letter_spacing VARCHAR(20) DEFAULT 'normal',
    typography_text_transform VARCHAR(20) DEFAULT 'none',

    -- Emblemas y logotipos
    party_logo_url TEXT,
    party_logo_size INT DEFAULT 64,
    party_logo_visible BOOLEAN DEFAULT TRUE,
    candidate_logo_url TEXT,
    candidate_logo_size INT DEFAULT 72,
    candidate_logo_visible BOOLEAN DEFAULT TRUE,
    campaign_logo_url TEXT,
    campaign_logo_size INT DEFAULT 64,
    campaign_logo_visible BOOLEAN DEFAULT TRUE,
    coalition_logos JSONB DEFAULT '[]'::jsonb,
    slate_logo_url TEXT,
    logos_alignment VARCHAR(20) DEFAULT 'center',

    -- Datos del Candidato
    candidate_full_name VARCHAR(255) NOT NULL,
    candidate_short_name VARCHAR(150),
    candidate_slogan TEXT,
    candidate_tagline TEXT,
    candidate_hero_photo_url TEXT,
    candidate_hero_photo_style VARCHAR(30) DEFAULT 'rounded',
    candidate_cover_photo_url TEXT,
    candidate_bio TEXT,
    candidate_quote TEXT,

    -- Métricas de rendimiento
    views_count BIGINT DEFAULT 0,
    clicks_count BIGINT DEFAULT 0,
    qr_scans_count BIGINT DEFAULT 0,
    inquiries_count BIGINT DEFAULT 0,

    -- Control de publicación y auditoría
    published_at TIMESTAMP WITH TIME ZONE,
    published_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lav_projects_slug ON lav_projects(slug);
CREATE INDEX idx_lav_projects_status ON lav_projects(status);
CREATE INDEX idx_lav_projects_party ON lav_projects(party_id);
CREATE INDEX idx_lav_projects_category ON lav_projects(category);

-- 4. TABLA DE HISTORIAL DE SLUGS Y REDIRECCIONES
CREATE TABLE IF NOT EXISTS lav_slug_history (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES lav_projects(id) ON DELETE CASCADE,
    previous_slug VARCHAR(120) NOT NULL,
    target_slug VARCHAR(120) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lav_slug_history_previous ON lav_slug_history(previous_slug);

-- 5. TABLA DE PLANILLAS MUNICIPALES Y AYUDANTÍAS
CREATE TABLE IF NOT EXISTS lav_municipal_slates (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES lav_projects(id) ON DELETE CASCADE,
    municipality VARCHAR(100) NOT NULL,
    slate_name VARCHAR(255) NOT NULL,
    is_ayudantia BOOLEAN DEFAULT FALSE,
    ayudantia_color VARCHAR(30), -- 'blanca', 'roja', 'azul', 'verde', 'amarilla', 'morada', 'personalizada'
    poblado_colonia VARCHAR(255),
    header_photo_url TEXT,
    community_proposals JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA DE INTEGRANTES DE PLANILLA (Presidencia, Sindicatura, Regidurías sin límite)
CREATE TABLE IF NOT EXISTS lav_slate_members (
    id VARCHAR(36) PRIMARY KEY,
    slate_id VARCHAR(36) NOT NULL REFERENCES lav_municipal_slates(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    member_type VARCHAR(50) NOT NULL, -- 'presidencia', 'suplente_presidencia', 'sindicatura', 'suplente_sindicatura', 'regiduria', 'suplente_regiduria', 'ayudante', 'suplente_ayudante', 'equipo'
    display_order INT NOT NULL DEFAULT 1,
    photo_url TEXT,
    party VARCHAR(50),
    personal_logo_url TEXT,
    bio TEXT,
    proposals JSONB DEFAULT '[]'::jsonb,
    phone VARCHAR(30),
    email VARCHAR(150),
    whatsapp VARCHAR(30),
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lav_slate_members_slate ON lav_slate_members(slate_id);

-- 7. TABLA DE SECCIONES MODULARES CONFIGURABLES
CREATE TABLE IF NOT EXISTS lav_project_sections (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES lav_projects(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL, -- 'hero', 'bio', 'trajectory', 'proposals', 'gallery', 'videos', 'faq', 'documents', 'contact'
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    is_enabled BOOLEAN DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 1,
    layout_variant VARCHAR(50),
    section_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lav_sections_project ON lav_project_sections(project_id);

-- 8. TABLA DE BOTONES INTERACTIVOS (WhatsApp, Llamadas, Mapas, vCard)
CREATE TABLE IF NOT EXISTS lav_interactive_buttons (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES lav_projects(id) ON DELETE CASCADE,
    label VARCHAR(150) NOT NULL,
    button_style VARCHAR(30) DEFAULT 'solid', -- 'solid', 'gradient', 'outline', 'glass', 'pill', 'minimal'
    action_type VARCHAR(50) NOT NULL, -- 'whatsapp', 'call', 'email', 'map', 'document', 'citizen_form', 'external_url', 'vcard'
    action_value TEXT NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'MessageCircle',
    bg_color VARCHAR(10),
    text_color VARCHAR(10),
    is_enabled BOOLEAN DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 1
);

-- 9. TABLA DE PARTICIPACIÓN CIUDADANA Y FOLIOS DE SEGUIMIENTO
CREATE TABLE IF NOT EXISTS lav_citizen_inquiries (
    id VARCHAR(36) PRIMARY KEY,
    folio VARCHAR(30) UNIQUE NOT NULL, -- Formato: 'LAV-2026-XXXX'
    project_id VARCHAR(36) REFERENCES lav_projects(id) ON DELETE CASCADE,
    citizen_name VARCHAR(255) NOT NULL,
    citizen_email VARCHAR(255),
    citizen_phone VARCHAR(50),
    citizen_colonia VARCHAR(255) NOT NULL,
    inquiry_type VARCHAR(50) NOT NULL, -- 'solicitud', 'propuesta', 'reporte', 'consulta', 'mensaje'
    message TEXT NOT NULL,
    privacy_accepted BOOLEAN DEFAULT TRUE,
    status VARCHAR(30) DEFAULT 'nuevo', -- 'nuevo', 'en_proceso', 'atendido'
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lav_inquiries_folio ON lav_citizen_inquiries(folio);
CREATE INDEX idx_lav_inquiries_project ON lav_citizen_inquiries(project_id);

-- 10. TABLA DE PLANTILLAS PERSONALIZADAS DEL ESTUDIO LAV
CREATE TABLE IF NOT EXISTS lav_custom_templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    design_family VARCHAR(50) NOT NULL,
    variant_id VARCHAR(50) NOT NULL,
    palette JSONB NOT NULL,
    typography JSONB NOT NULL,
    created_by VARCHAR(36) REFERENCES lav_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. TABLA DE EVENTOS DE ANALÍTICA ANÓNIMA
CREATE TABLE IF NOT EXISTS lav_analytics_events (
    id BIGSERIAL PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES lav_projects(id) ON DELETE CASCADE,
    event_type VARCHAR(30) NOT NULL, -- 'view', 'click', 'qr_scan'
    button_id VARCHAR(36),
    device_type VARCHAR(20), -- 'mobile', 'tablet', 'desktop'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lav_analytics_project ON lav_analytics_events(project_id, event_type);
