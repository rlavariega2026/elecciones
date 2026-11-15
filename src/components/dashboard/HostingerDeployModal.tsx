import React, { useState } from 'react';
import { X, Server, Copy, Check, ShieldCheck, Terminal, FolderCheck } from 'lucide-react';

interface HostingerDeployModalProps {
  onClose: () => void;
}

export const HostingerDeployModal: React.FC<HostingerDeployModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'github' | 'htaccess' | 'ftp'>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const htaccessCode = `# LAV Política Digital — Hostinger Apache / LiteSpeed Configuration
# Ubicación: lavdigitalagency.com/public_html/elecciones/.htaccess
# Base URL: https://lavdigitalagency.com/elecciones/

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /elecciones/

  # Forzar HTTPS y evitar duplicados de diagonal
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}/elecciones/$1 [R=301,L]

  # Proteger archivos sensibles
  <FilesMatch "(database\.json|\.env|\.git|backups)">
    Order Allow,Deny
    Deny from all
  </FilesMatch>

  # Redireccionar todas las rutas públicas (/jorge-meade/, /planilla-cuautla/, etc.) al index.html de la SPA
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>

# Compresión Gzip y Caché para máxima velocidad en móviles
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json image/svg+xml
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/webp "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
</IfModule>`;

  const githubWorkflowCode = `name: Despliegue LAV Política Digital a Hostinger

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Descargar Código
        uses: actions/checkout@v4

      - name: Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar Dependencias
        run: npm ci

      - name: Compilar para Producción (/elecciones/)
        run: npm run build
        env:
          BASE_URL: /elecciones/
          NODE_ENV: production

      - name: Desplegar por FTP a Hostinger
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: \${{ secrets.FTP_SERVER }}
          username: \${{ secrets.FTP_USERNAME }}
          password: \${{ secrets.FTP_PASSWORD }}
          protocol: ftp
          port: 21
          local-dir: ./dist/
          server-dir: /public_html/elecciones/
          dangerous-clean-slate: false
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Server className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Centro de Despliegue — LAV Digital MKT en Hostinger
              </h3>
              <p className="text-xs text-slate-500">
                Configuración y automatización para <span className="font-mono text-slate-700">lavdigitalagency.com/elecciones/</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Guía de Instalación
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'github'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            GitHub Actions (.yml)
          </button>
          <button
            onClick={() => setActiveTab('htaccess')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'htaccess'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Reglas .htaccess
          </button>
          <button
            onClick={() => setActiveTab('ftp')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'ftp'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Secretos FTP & Seguridad
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FolderCheck className="w-4 h-4 text-emerald-600" />
                  Estructura Exacta del Servidor en Hostinger
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Para que la aplicación funcione en armonía con su sitio web principal (<strong>lavdigitalagency.com</strong>) sin modificar otras aplicaciones ni carpetas del dominio, el propietario solo debe verificar que exista la carpeta:
                </p>
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono rounded-lg">
                  /public_html/elecciones/
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Ruta Pública Base:</span>
                    <span className="font-mono text-slate-600">https://lavdigitalagency.com/elecciones/</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Ejemplo de Publicación:</span>
                    <span className="font-mono text-slate-600">https://lavdigitalagency.com/elecciones/jorge-meade/</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-700" />
                  Pasos de Instalación en 3 Minutos
                </h4>
                <ol className="space-y-3 list-decimal list-inside text-slate-700 leading-relaxed">
                  <li>
                    <strong>Crear la carpeta en Hostinger:</strong> Entra al Administrador de Archivos de hPanel en Hostinger, navega a <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">public_html</code> y crea la carpeta llamada <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">elecciones</code>.
                  </li>
                  <li>
                    <strong>Subir archivo .htaccess:</strong> Copia el contenido de la pestaña <em>Reglas .htaccess</em> y colócalo dentro de <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">public_html/elecciones/.htaccess</code>. Esto gestiona las rutas directas de los candidatos sin que dé error 404.
                  </li>
                  <li>
                    <strong>Despliegue Automático con GitHub Actions:</strong> Configura los 3 secretos FTP en tu repositorio de GitHub (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Settings &gt; Secrets and variables &gt; Actions</code>) y cada vez que hagas push a <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">main</code>, el sistema compilará y subirá los archivos automáticamente.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Flujo de Integración Continua (GitHub Actions)
                  </h4>
                  <p className="text-slate-500">
                    Guarda este archivo en tu repositorio en:{' '}
                    <span className="font-mono text-slate-700">.github/workflows/deploy.yml</span>
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(githubWorkflowCode, 'workflow')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg flex items-center gap-1.5 font-semibold hover:bg-slate-800 transition-colors"
                >
                  {copiedSection === 'workflow' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'workflow' ? 'Copiado' : 'Copiar Archivo'}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                {githubWorkflowCode}
              </pre>
            </div>
          )}

          {activeTab === 'htaccess' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Configuración Apache/LiteSpeed (.htaccess)
                  </h4>
                  <p className="text-slate-500">
                    Colocar en:{' '}
                    <span className="font-mono text-slate-700">lavdigitalagency.com/public_html/elecciones/.htaccess</span>
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(htaccessCode, 'htaccess')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg flex items-center gap-1.5 font-semibold hover:bg-slate-800 transition-colors"
                >
                  {copiedSection === 'htaccess' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'htaccess' ? 'Copiado' : 'Copiar .htaccess'}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                {htaccessCode}
              </pre>
            </div>
          )}

          {activeTab === 'ftp' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Secretos de GitHub Actions para Hostinger
                </h4>
                <p className="text-slate-600">
                  En el repositorio de GitHub de <strong>LAV Digital MKT</strong>, navega a:
                  <br />
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                    Settings → Secrets and variables → Actions → New repository secret
                  </span>
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-slate-900 block">FTP_SERVER</span>
                    <span className="text-slate-600 text-[11px]">
                      La dirección IP o nombre de host FTP que proporciona Hostinger en hPanel (ej. <code className="font-mono">ftp.lavdigitalagency.com</code> o IP del servidor).
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-slate-900 block">FTP_USERNAME</span>
                    <span className="text-slate-600 text-[11px]">
                      Usuario FTP con acceso restringido a <code className="font-mono">public_html/elecciones/</code>.
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-slate-900 block">FTP_PASSWORD</span>
                    <span className="text-slate-600 text-[11px]">
                      Contraseña segura generada para la cuenta FTP.
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <span className="font-bold block">Seguridad Inviolable:</span>
                <p className="text-[11px] leading-relaxed">
                  Nunca agregues contraseñas ni claves de API en el código fuente de Git. Todos los accesos se gestionan mediante GitHub Secrets.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            LAV Digital MKT · "Lo que no se ve, no existe"
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
