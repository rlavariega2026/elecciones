import QRCode from 'qrcode';

export async function generateQrDataUrl(
  url: string,
  options?: { colorDark?: string; colorLight?: string; width?: number }
): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: options?.width || 512,
      margin: 2,
      color: {
        dark: options?.colorDark || '#0F172A',
        light: options?.colorLight || '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

export function downloadQrCode(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${filename}-qr.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
