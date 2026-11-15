import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { SEED_PROJECTS } from './src/data/seedProjects.ts';
import { Project, CitizenInquiry } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Setup server-side Gemini AI Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database Persistence Paths
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');
const BACKUPS_DIR = path.resolve(DATA_DIR, 'backups');

// In-memory cache + file sync
interface DatabaseStructure {
  projects: Project[];
  customTemplates: Array<{
    id: string;
    name: string;
    description: string;
    designFamily: string;
    variantId: string;
    palette: any;
    typography: any;
    createdAt: string;
  }>;
  citizenInquiries: CitizenInquiry[];
  analyticsEvents: Array<{
    id: string;
    projectId: string;
    eventType: 'view' | 'click' | 'qr_scan';
    buttonId?: string;
    device?: string;
    timestamp: string;
  }>;
}

let db: DatabaseStructure = {
  projects: [...SEED_PROJECTS],
  customTemplates: [],
  citizenInquiries: [
    {
      id: 'inq-seed-1',
      folio: 'LAV-2026-4819',
      projectId: 'proj-jorge-meade-01',
      projectSlug: 'jorge-meade',
      projectCandidateName: 'Jorge Meade González',
      citizenName: 'Patricia Morales Fuentes',
      citizenEmail: 'patricia.morales@gmail.com',
      citizenPhone: '777 412 9901',
      citizenColonia: 'Colonia Satélite, Cuernavaca',
      inquiryType: 'solicitud',
      message: 'Solicitamos apoyo para iluminar el parque de la 3ra sección de la colonia Satélite y podar ramas que tapan luminarias.',
      privacyAccepted: true,
      status: 'en_proceso',
      createdAt: '2026-05-28T14:20:00.000Z',
      notes: 'Turnado al equipo de enlace legislativo el 29 de mayo.',
    },
    {
      id: 'inq-seed-2',
      folio: 'LAV-2026-7290',
      projectId: 'proj-cuautla-02',
      projectSlug: 'planilla-cuautla',
      projectCandidateName: 'Dra. María Elena Ramos Salazar',
      citizenName: 'Roberto Mendoza Tapia',
      citizenEmail: 'roberto.mendoza@hotmail.com',
      citizenPhone: '735 981 2234',
      citizenColonia: 'Colonia Emiliano Zapata, Cuautla',
      inquiryType: 'propuesta',
      message: 'Propuesta de reordenamiento para el tianguis dominical con contenedores ecológicos de basura y baños portátiles limpios.',
      privacyAccepted: true,
      status: 'nuevo',
      createdAt: '2026-06-01T09:15:00.000Z',
    },
  ],
  analyticsEvents: [],
};

// Initialize DB and ensure directories exist
function initDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.projects)) {
        db = parsed;
        console.log(`[DB] Base de datos cargada: ${db.projects.length} proyectos.`);
        return;
      }
    }

    // Write initial seed if file didn't exist
    saveDatabase();
    console.log('[DB] Base de datos inicializada con proyectos semilla de Morelos.');
  } catch (err) {
    console.error('[DB] Error cargando base de datos:', err);
  }
}

// Atomic write to avoid corrupting file
function saveDatabase() {
  try {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('[DB] Error guardando base de datos:', err);
  }
}

// Create backup snapshot
function createBackupSnapshot() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.resolve(BACKUPS_DIR, `backup-${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`[Backup] Respaldo generado en ${backupPath}`);
  } catch (err) {
    console.error('[Backup] Error creando respaldo:', err);
  }
}

initDatabase();

// Reserved slugs that cannot be taken by political cards
const RESERVED_SLUGS = [
  'admin',
  'api',
  'elecciones',
  'assets',
  'dashboard',
  'public',
  'login',
  'register',
  'settings',
  'index',
  'favicon',
  'robots',
  'sitemap',
];

// Helper to sanitize slug
function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ==========================================
// API REST ENDPOINTS
// ==========================================

// 1. Projects List & Filtering
app.get('/api/projects', (req, res) => {
  const { status, category, search, partyId } = req.query;
  let filtered = [...db.projects];

  if (status && status !== 'todos') {
    filtered = filtered.filter((p) => p.status === status);
  }
  if (category && category !== 'todos') {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (partyId && partyId !== 'todos') {
    filtered = filtered.filter((p) => p.partyId === partyId);
  }
  if (search && typeof search === 'string') {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.internalName.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        p.candidate.fullName.toLowerCase().includes(query) ||
        p.role.toLowerCase().includes(query) ||
        (p.candidate.municipality && p.candidate.municipality.toLowerCase().includes(query))
    );
  }

  // Sort by updatedAt descending
  filtered.sort(
    (a, b) => new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime()
  );

  res.json({ success: true, count: filtered.length, projects: filtered });
});

// 2. Validate Slug
app.get('/api/projects/check-slug', (req, res) => {
  const rawSlug = req.query.slug as string;
  const currentId = req.query.currentId as string;

  if (!rawSlug) {
    return res.status(400).json({ valid: false, message: 'Dirección o slug requerido' });
  }

  const slug = sanitizeSlug(rawSlug);

  if (slug.length < 3) {
    return res.json({ valid: false, slug, message: 'El slug debe tener al menos 3 caracteres' });
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return res.json({
      valid: false,
      slug,
      message: `El término "${slug}" es una ruta reservada del sistema`,
    });
  }

  const duplicate = db.projects.find((p) => p.slug === slug && p.id !== currentId);
  if (duplicate) {
    return res.json({
      valid: false,
      slug,
      message: `La dirección "${slug}" ya está en uso por el proyecto: "${duplicate.internalName}"`,
    });
  }

  return res.json({
    valid: true,
    slug,
    url: `https://lavdigitalmkt.com/elecciones/${slug}/`,
    message: 'Dirección pública disponible',
  });
});

// 3. Single Project by ID
app.get('/api/projects/:id', (req, res) => {
  const project = db.projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
  }
  res.json({ success: true, project });
});

// 4. Create Project
app.post('/api/projects', (req, res) => {
  const data = req.body;
  if (!data.internalName || !data.candidate?.fullName) {
    return res.status(400).json({ success: false, message: 'Nombre interno y nombre del candidato requeridos' });
  }

  let baseSlug = sanitizeSlug(data.slug || data.candidate.shortName || data.internalName);
  if (!baseSlug || baseSlug.length < 3) {
    baseSlug = `proyecto-${Date.now().toString().slice(-4)}`;
  }

  // Ensure unique slug
  let uniqueSlug = baseSlug;
  let counter = 1;
  while (db.projects.some((p) => p.slug === uniqueSlug) || RESERVED_SLUGS.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const newProject: Project = {
    ...data,
    id: data.id || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    slug: uniqueSlug,
    previousSlugs: [],
    status: data.status || 'borrador',
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
      clicksCount: 0,
      qrScansCount: 0,
      inquiriesCount: 0,
      ...data.meta,
    },
  };

  db.projects.push(newProject);
  saveDatabase();

  res.status(201).json({ success: true, project: newProject });
});

// 5. Update Project (with slug warning & history)
app.put('/api/projects/:id', (req, res) => {
  const index = db.projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
  }

  const current = db.projects[index];
  const updateData = req.body;

  let newSlug = current.slug;
  const previousSlugs = [...(current.previousSlugs || [])];

  if (updateData.slug && updateData.slug !== current.slug) {
    const sanitized = sanitizeSlug(updateData.slug);
    // Duplicate check
    const exists = db.projects.some((p) => p.slug === sanitized && p.id !== current.id);
    if (exists || RESERVED_SLUGS.includes(sanitized)) {
      return res.status(400).json({
        success: false,
        message: `El slug "${sanitized}" no está disponible o es reservado.`,
      });
    }

    if (!previousSlugs.includes(current.slug)) {
      previousSlugs.push(current.slug);
    }
    newSlug = sanitized;
  }

  const updatedProject: Project = {
    ...current,
    ...updateData,
    id: current.id,
    slug: newSlug,
    previousSlugs,
    meta: {
      ...current.meta,
      ...updateData.meta,
      updatedAt: new Date().toISOString(),
    },
  };

  db.projects[index] = updatedProject;
  saveDatabase();

  res.json({ success: true, project: updatedProject });
});

// 6. Duplicate Project
app.post('/api/projects/:id/duplicate', (req, res) => {
  const original = db.projects.find((p) => p.id === req.params.id);
  if (!original) {
    return res.status(404).json({ success: false, message: 'Proyecto a duplicar no encontrado' });
  }

  const copyNumber = db.projects.filter((p) => p.internalName.startsWith(`Copia de ${original.internalName}`)).length + 1;
  const newName = `Copia de ${original.internalName} ${copyNumber > 1 ? `(${copyNumber})` : ''}`.trim();
  const baseSlug = `${original.slug}-copia-${Date.now().toString().slice(-4)}`;

  const duplicated: Project = {
    ...JSON.parse(JSON.stringify(original)),
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    internalName: newName,
    slug: baseSlug,
    previousSlugs: [],
    status: 'borrador',
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
      clicksCount: 0,
      qrScansCount: 0,
      inquiriesCount: 0,
    },
  };

  db.projects.unshift(duplicated);
  saveDatabase();

  res.status(201).json({ success: true, project: duplicated });
});

// 7. Delete Project
app.delete('/api/projects/:id', (req, res) => {
  const index = db.projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
  }

  const deleted = db.projects.splice(index, 1)[0];
  saveDatabase();

  res.json({ success: true, message: `Proyecto "${deleted.internalName}" eliminado correctamente` });
});

// 8. Publish / Unpublish
app.post('/api/projects/:id/publish', (req, res) => {
  const project = db.projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
  }

  const requestedSlug = req.body.slug ? sanitizeSlug(req.body.slug) : project.slug;

  // Check collision
  const collision = db.projects.find((p) => p.slug === requestedSlug && p.id !== project.id);
  if (collision) {
    return res.status(400).json({ success: false, message: `La dirección "${requestedSlug}" ya está asignada a otro proyecto.` });
  }

  project.slug = requestedSlug;
  project.status = 'publicado';
  project.meta.publishedAt = new Date().toISOString();
  project.meta.publishedUrl = `https://lavdigitalmkt.com/elecciones/${project.slug}/`;
  project.meta.updatedAt = new Date().toISOString();

  saveDatabase();
  res.json({ success: true, project });
});

app.post('/api/projects/:id/unpublish', (req, res) => {
  const project = db.projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
  }

  project.status = 'borrador';
  project.meta.updatedAt = new Date().toISOString();
  saveDatabase();
  res.json({ success: true, project });
});

// 9. Public View By Slug
app.get('/api/projects/by-slug/:slug', (req, res) => {
  const slug = sanitizeSlug(req.params.slug);
  const project = db.projects.find((p) => p.slug === slug || (p.previousSlugs && p.previousSlugs.includes(slug)));

  if (!project) {
    return res.status(404).json({ success: false, message: 'Publicación no encontrada o no vigente.' });
  }

  // Increment view counter silently
  project.meta.viewsCount = (project.meta.viewsCount || 0) + 1;
  saveDatabase();

  res.json({
    success: true,
    project,
    isRedirect: project.slug !== slug,
    currentSlug: project.slug,
  });
});

// 10. Record Anonymous Event (click or QR scan)
app.post('/api/analytics/event', (req, res) => {
  const { projectId, eventType, buttonId, device } = req.body;
  const project = db.projects.find((p) => p.id === projectId);

  if (project) {
    if (eventType === 'click') {
      project.meta.clicksCount = (project.meta.clicksCount || 0) + 1;
    } else if (eventType === 'qr_scan') {
      project.meta.qrScansCount = (project.meta.qrScansCount || 0) + 1;
    } else if (eventType === 'view') {
      project.meta.viewsCount = (project.meta.viewsCount || 0) + 1;
    }
    db.analyticsEvents.push({
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      eventType,
      buttonId,
      device: device || 'mobile',
      timestamp: new Date().toISOString(),
    });
    // Keep max 5000 events
    if (db.analyticsEvents.length > 5000) {
      db.analyticsEvents = db.analyticsEvents.slice(-5000);
    }
    saveDatabase();
  }

  res.json({ success: true });
});

// 11. Citizen Inquiries Submission (generates tracking folio)
app.post('/api/citizen-inquiries', (req, res) => {
  const {
    projectId,
    citizenName,
    citizenEmail,
    citizenPhone,
    citizenColonia,
    inquiryType,
    message,
    privacyAccepted,
  } = req.body;

  if (!citizenName || !message || !privacyAccepted) {
    return res.status(400).json({
      success: false,
      message: 'Nombre, mensaje y consentimiento del aviso de privacidad son requeridos.',
    });
  }

  const project = db.projects.find((p) => p.id === projectId);
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const folio = `LAV-2026-${randomCode}`;

  const inquiry: CitizenInquiry = {
    id: `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    folio,
    projectId: projectId || '',
    projectSlug: project ? project.slug : '',
    projectCandidateName: project ? project.candidate.fullName : 'Candidatura',
    citizenName,
    citizenEmail: citizenEmail || '',
    citizenPhone: citizenPhone || '',
    citizenColonia: citizenColonia || '',
    inquiryType: inquiryType || 'solicitud',
    message,
    privacyAccepted: true,
    status: 'nuevo',
    createdAt: new Date().toISOString(),
  };

  db.citizenInquiries.unshift(inquiry);
  if (project) {
    project.meta.inquiriesCount = (project.meta.inquiriesCount || 0) + 1;
  }
  saveDatabase();

  res.status(201).json({
    success: true,
    folio,
    message: 'Tu solicitud ha sido registrada con éxito. Guarda tu folio para seguimiento.',
    inquiry,
  });
});

// List inquiries for Admin
app.get('/api/citizen-inquiries', (req, res) => {
  const { projectId, status } = req.query;
  let items = [...db.citizenInquiries];

  if (projectId) {
    items = items.filter((i) => i.projectId === projectId);
  }
  if (status && status !== 'todos') {
    items = items.filter((i) => i.status === status);
  }

  res.json({ success: true, count: items.length, inquiries: items });
});

// Update inquiry status
app.patch('/api/citizen-inquiries/:id', (req, res) => {
  const inq = db.citizenInquiries.find((i) => i.id === req.params.id);
  if (!inq) {
    return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
  }

  const { status, notes } = req.body;
  if (status) inq.status = status;
  if (notes !== undefined) inq.notes = notes;

  saveDatabase();
  res.json({ success: true, inquiry: inq });
});

// 12. Templates Management
app.get('/api/templates', (_req, res) => {
  res.json({ success: true, templates: db.customTemplates });
});

app.post('/api/templates', (req, res) => {
  const { name, description, designFamily, variantId, palette, typography } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Nombre de la plantilla requerido' });
  }

  const template = {
    id: `tpl-${Date.now()}`,
    name,
    description: description || 'Plantilla personalizada guardada en LAV Estudio',
    designFamily: designFamily || 'campana_moderna',
    variantId: variantId || 'mod_glass_card',
    palette,
    typography,
    createdAt: new Date().toISOString(),
  };

  db.customTemplates.unshift(template);
  saveDatabase();

  res.status(201).json({ success: true, template });
});

// 13. Backups Export & Restore
app.get('/api/backup/export', (_req, res) => {
  createBackupSnapshot();
  res.setHeader('Content-Disposition', `attachment; filename="lav-politica-backup-${Date.now()}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(db, null, 2));
});

app.post('/api/backup/restore', (req, res) => {
  try {
    const uploadedData = req.body;
    if (!uploadedData || !Array.isArray(uploadedData.projects)) {
      return res.status(400).json({ success: false, message: 'Estructura de archivo de respaldo inválida' });
    }

    createBackupSnapshot(); // safety snapshot before overwriting
    db = {
      projects: uploadedData.projects,
      customTemplates: uploadedData.customTemplates || [],
      citizenInquiries: uploadedData.citizenInquiries || [],
      analyticsEvents: uploadedData.analyticsEvents || [],
    };
    saveDatabase();

    res.json({
      success: true,
      message: `Restauración exitosa: ${db.projects.length} proyectos recuperados.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error procesando el respaldo: ' + err.message });
  }
});

// 14. Aggregated Analytics Summary
app.get('/api/analytics', (_req, res) => {
  const totalProjects = db.projects.length;
  const publishedProjects = db.projects.filter((p) => p.status === 'publicado').length;
  const draftProjects = db.projects.filter((p) => p.status === 'borrador').length;

  const totalViews = db.projects.reduce((acc, p) => acc + (p.meta?.viewsCount || 0), 0);
  const totalClicks = db.projects.reduce((acc, p) => acc + (p.meta?.clicksCount || 0), 0);
  const totalQrScans = db.projects.reduce((acc, p) => acc + (p.meta?.qrScansCount || 0), 0);
  const totalInquiries = db.citizenInquiries.length;

  res.json({
    success: true,
    summary: {
      totalProjects,
      publishedProjects,
      draftProjects,
      totalViews,
      totalClicks,
      totalQrScans,
      totalInquiries,
      recentInquiries: db.citizenInquiries.slice(0, 10),
    },
  });
});

// 15. Server-side Gemini AI Writing Assistant
app.post('/api/gemini/assist', async (req, res) => {
  try {
    const { task, text, candidateName, role, municipality, party } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Texto a procesar requerido' });
    }

    let taskInstruction = '';
    switch (task) {
      case 'corregir':
        taskInstruction = `Corrige la ortografía, puntuación, sintaxis y estilo político del siguiente texto. Asegura un tono profesional, claro, empático y convincente. NO agregues ni inventes cargos ni datos biográficos.`;
        break;
      case 'semblanza':
        taskInstruction = `Mejora y organiza la siguiente semblanza curricular y trayectoria para el candidato ${candidateName || ''} (Cargo: ${role || ''}, Municipio: ${municipality || 'Morelos'}, Partido: ${party || ''}). Redáctala en párrafos elegantes, inspiradores y contundentes, destacando vocación de servicio y honestidad. NO inventes estudios, cargos ni logros que no aparezcan en la información provista.`;
        break;
      case 'propuestas':
        taskInstruction = `Estructura y sintetiza las siguientes propuestas electorales en compromisos claros con: 1) Pilar temático, 2) Título directo y 3) Breve descripción del impacto ciudadano positivo. Lenguaje firme y realizable. NO inventes obras inverosímiles.`;
        break;
      case 'faq':
        taskInstruction = `A partir del siguiente texto y contexto de campaña, formula 3 a 5 preguntas frecuentes (FAQ) ciudadanas con respuestas concisas, empáticas y transparentes que generen confianza en el votante.`;
        break;
      case 'sintesis':
        taskInstruction = `Sintetiza el siguiente texto en un eslogan y 3 puntos clave de máximo impacto para tarjetas digitales políticas, volanteo y redes sociales.`;
        break;
      default:
        taskInstruction = `Mejora la redacción del siguiente texto político haciéndolo más claro, memorable y persuasivo.`;
    }

    const systemPrompt = `Eres el Director de Estrategia y Comunicación Política de LAV Digital MKT (Morelos, México). Tu lema es "Lo que no se ve, no existe".
Tu misión es asistir a los administradores de campañas políticas a redactar contenidos de alto nivel, respetando estrictamente los datos verídicos que proporcione el usuario.
REGLA INQUEBRANTABLE: NO inventes estudios académicos, títulos profesionales, cargos públicos, distritos electorales, parentescos ni datos biográficos que no se mencionen en el texto de entrada. Tu labor es pulir, elevar la prosa y organizar.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `${taskInstruction}\n\n[TEXTO DE ENTRADA]:\n${text}`,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const result = response.text || '';

    res.json({
      success: true,
      task,
      result,
      originalText: text,
    });
  } catch (error: any) {
    console.error('[Gemini API] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar con el asistente de IA: ' + (error?.message || 'Error desconocido'),
    });
  }
});

// ==========================================
// STATIC ASSETS & VITE INTEGRATION
// ==========================================

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    // Vite Middlewares in Dev
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Static Files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    // Handle subpath /elecciones/ or root SPA routing
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LAV Política Digital] Servidor activo en http://localhost:${PORT}`);
  });
}

startServer();
