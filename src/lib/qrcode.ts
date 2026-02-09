/**
 * QR Code Utility — Generate QR code as Data URL
 */

import QRCode from 'qrcode'

/**
 * Generate QR code as base64 Data URL for embedding in <img> tags
 */
export async function generateQRCodeDataURL(text: string): Promise<string> {
    return QRCode.toDataURL(text, {
        width: 256,
        margin: 2,
        color: {
            dark: '#1a1c3d',  // royal-navy
            light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
    })
}
