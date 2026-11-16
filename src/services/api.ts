import { Project, CitizenInquiry, AnalyticsSummary } from '../types';

const BASE_API = '/elecciones/api';
let csrfToken = '';
export type AuthUser = {id:string;username:string;role:'superadmin'|'editor'};
export const auth = {
 async me(){const r=await fetch(BASE_API+'/auth/me');if(!r.ok)return null;const d=await r.json();csrfToken=d.csrf;return d.user as AuthUser;},
 async login(username:string,password:string){const r=await fetch(BASE_API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});const d=await r.json();if(!r.ok)throw new Error(d.message);csrfToken=d.csrf;return d.user as AuthUser;},
 async logout(){await fetch(BASE_API+'/auth/logout',{method:'POST',headers:{'X-CSRF-Token':csrfToken}});csrfToken='';},
 async users(){const r=await fetch(BASE_API+'/users');if(!r.ok)throw new Error('Acceso denegado');return (await r.json()).users as Array<AuthUser&{active:boolean}>;},
 async create(username:string,password:string){const r=await fetch(BASE_API+'/users',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrfToken},body:JSON.stringify({username,password})});if(!r.ok)throw new Error((await r.json()).message);},
 async update(id:string,changes:{active?:boolean;password?:string}){const r=await fetch(BASE_API+'/users/'+id,{method:'PATCH',headers:{'Content-Type':'application/json','X-CSRF-Token':csrfToken},body:JSON.stringify(changes)});if(!r.ok)throw new Error((await r.json()).message);},
 async remove(id:string){const r=await fetch(BASE_API+'/users/'+id,{method:'DELETE',headers:{'X-CSRF-Token':csrfToken}});if(!r.ok)throw new Error((await r.json()).message);}
};
const protectedFetch: typeof fetch = (input, init) => fetch(input,{...init,headers:{...((init?.headers as Record<string,string>)||{}),...(init?.method && !['GET','HEAD'].includes(init.method.toUpperCase())?{'X-CSRF-Token':csrfToken}:{})}});



/** Transfer original image bytes in small chunks; no recompression or fixed app-side photo count. */
export async function persistProjectImages<T>(value: T): Promise<T> {
  const cache = new Map<string,string>();
  const request = async (path: string, payload: object) => {
    const response = await protectedFetch(BASE_API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) throw new Error(result?.message || `Hostinger respondió HTTP ${response.status}`);
    return result;
  };
  const transfer = async (dataUrl: string): Promise<string> => {
    if (cache.has(dataUrl)) return cache.get(dataUrl)!;
    const match = /^data:(image\/(?:jpeg|png|webp|gif|avif));base64,(.*)$/s.exec(dataUrl);
    if (!match) return dataUrl;
    const mime = match[1];
    const originalBase64 = match[2];
    const id = 'lav' + Date.now().toString(36) + Math.random().toString(36).slice(2,16);
    const chunkSize = 320000; // Base64 boundary: 240 kB of original bytes.
    for (let i=0,offset=0;offset<originalBase64.length;i++,offset+=chunkSize) {
      const part = originalBase64.slice(offset,offset+chunkSize);
      try {
        await request('/media/chunk', { uploadId: id, index: i, data: part });
      } catch (error) {
        throw new Error(`Fotografía, bloque ${i + 1}: ${error instanceof Error ? error.message : 'falló la conexión'}`);
      }
    }
    const result = await request('/media/finish', { uploadId: id, mime });
    if (typeof result.url !== 'string' || !result.url) throw new Error('Hostinger no devolvió la URL de la fotografía.');
    cache.set(dataUrl,result.url);
    return result.url;
  };
  const visit = async (item: any): Promise<any> => {
    if (typeof item === 'string' && item.startsWith('data:image/')) return transfer(item);
    if (Array.isArray(item)) {
      const output = [];
      for (const entry of item) output.push(await visit(entry));
      return output;
    }
    if (item && typeof item === 'object') {
      const output: Record<string,any> = {};
      for (const [key,entry] of Object.entries(item)) output[key] = await visit(entry);
      return output;
    }
    return item;
  };
  return visit(value);
}

export const api = {
  // Projects
  async getProjects(filters?: {
    status?: string;
    category?: string;
    search?: string;
    partyId?: string;
  }): Promise<{ success: boolean; projects: Project[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.partyId) params.append('partyId', filters.partyId);

    const res = await protectedFetch(`${BASE_API}/projects?${params.toString()}`);
    if (!res.ok) throw new Error('Error al obtener proyectos');
    return res.json();
  },

  async getProject(id: string): Promise<{ success: boolean; project: Project }> {
    const res = await protectedFetch(`${BASE_API}/projects/${id}`);
    if (!res.ok) throw new Error('Proyecto no encontrado');
    return res.json();
  },

  async getProjectBySlug(slug: string): Promise<{
    success: boolean;
    project: Project;
    isRedirect?: boolean;
    currentSlug?: string;
  }> {
    const res = await protectedFetch(`${BASE_API}/projects/by-slug/${slug}`);
    if (!res.ok) throw new Error('Tarjeta política no encontrada');
    return res.json();
  },

  async checkSlug(
    slug: string,
    currentId?: string
  ): Promise<{ valid: boolean; slug: string; url?: string; message: string }> {
    const params = new URLSearchParams({ slug });
    if (currentId) params.append('currentId', currentId);
    const res = await protectedFetch(`${BASE_API}/projects/check-slug?${params.toString()}`);
    return res.json();
  },

  async createProject(project: Partial<Project>): Promise<{ success: boolean; project: Project }> {
    const res = await protectedFetch(`${BASE_API}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al crear proyecto');
    }
    return res.json();
  },

  async updateProject(id: string, project: Partial<Project>): Promise<{ success: boolean; project: Project }> {
    const res = await protectedFetch(`${BASE_API}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al actualizar proyecto');
    }
    return res.json();
  },

  async duplicateProject(id: string): Promise<{ success: boolean; project: Project }> {
    const res = await protectedFetch(`${BASE_API}/projects/${id}/duplicate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Error al duplicar proyecto');
    return res.json();
  },

  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    const res = await protectedFetch(`${BASE_API}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar proyecto');
    return res.json();
  },

  async publishProject(id: string, slug?: string, demo = false): Promise<{ success: boolean; project: Project }> {
    const res = await protectedFetch(`${BASE_API}/projects/${id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, demo }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al publicar proyecto');
    }
    return res.json();
  },

  async unpublishProject(id: string): Promise<{ success: boolean; project: Project }> {
    const res = await protectedFetch(`${BASE_API}/projects/${id}/unpublish`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Error al despublicar');
    return res.json();
  },

  // Events & Analytics
  async recordEvent(
    projectId: string,
    eventType: 'view' | 'click' | 'qr_scan',
    buttonId?: string
  ): Promise<void> {
    try {
      await protectedFetch(`${BASE_API}/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          eventType,
          buttonId,
          device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        }),
      });
    } catch (e) {
      // Non-blocking telemetry
    }
  },

  async getAnalytics(): Promise<{ success: boolean; summary: AnalyticsSummary }> {
    const res = await protectedFetch(`${BASE_API}/analytics`);
    if (!res.ok) throw new Error('Error al obtener analíticas');
    return res.json();
  },

  // Citizen Inquiries
  async submitCitizenInquiry(data: {
    projectId: string;
    citizenName: string;
    citizenEmail?: string;
    citizenPhone?: string;
    citizenColonia?: string;
    inquiryType: 'solicitud' | 'propuesta' | 'reporte' | 'consulta' | 'mensaje';
    message: string;
    privacyAccepted: boolean;
  }): Promise<{ success: boolean; folio: string; message: string; inquiry: CitizenInquiry }> {
    const res = await protectedFetch(`${BASE_API}/citizen-inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al enviar solicitud');
    }
    return res.json();
  },

  async getCitizenInquiries(filters?: {
    projectId?: string;
    status?: string;
  }): Promise<{ success: boolean; count: number; inquiries: CitizenInquiry[] }> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);

    const res = await protectedFetch(`${BASE_API}/citizen-inquiries?${params.toString()}`);
    if (!res.ok) throw new Error('Error al obtener solicitudes ciudadanas');
    return res.json();
  },

  async updateCitizenInquiry(
    id: string,
    data: { status?: 'nuevo' | 'en_proceso' | 'atendido'; notes?: string }
  ): Promise<{ success: boolean; inquiry: CitizenInquiry }> {
    const res = await protectedFetch(`${BASE_API}/citizen-inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar solicitud');
    return res.json();
  },

  // Templates
  async saveTemplate(template: {
    name: string;
    description?: string;
    designFamily: string;
    variantId: string;
    palette: any;
    typography: any;
  }): Promise<{ success: boolean; template: any }> {
    const res = await protectedFetch(`${BASE_API}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    if (!res.ok) throw new Error('Error al guardar plantilla');
    return res.json();
  },

  async getTemplates(): Promise<{ success: boolean; templates: any[] }> {
    const res = await protectedFetch(`${BASE_API}/templates`);
    if (!res.ok) throw new Error('Error al obtener plantillas');
    return res.json();
  },

  // Gemini AI Assistant
  async askAiAssistant(params: {
    task: 'corregir' | 'semblanza' | 'propuestas' | 'faq' | 'sintesis' | 'custom';
    text: string;
    candidateName?: string;
    role?: string;
    municipality?: string;
    party?: string;
  }): Promise<{ success: boolean; task: string; result: string; originalText: string }> {
    const res = await protectedFetch(`${BASE_API}/gemini/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error con el asistente de IA');
    }
    return res.json();
  },

  // Backups
  async restoreBackup(backupData: any): Promise<{ success: boolean; message: string }> {
    const res = await protectedFetch(`${BASE_API}/backup/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al restaurar respaldo');
    }
    return res.json();
  },
};
