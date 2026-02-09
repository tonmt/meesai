import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'minio'
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000', 10)
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'meesai_minio'
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'meesai_minio_secret_2026'
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'meesai-images'

/**
 * S3 Client configured for MinIO
 * Internal container connection: http://minio:9000
 */
export const s3Client = new S3Client({
    endpoint: `http://${MINIO_ENDPOINT}:${MINIO_PORT}`,
    region: 'us-east-1',
    credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
})

export const BUCKET = MINIO_BUCKET

/**
 * Upload a file buffer to MinIO
 * Returns the object key (path)
 */
export async function uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string
): Promise<string> {
    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        })
    )
    return key
}

/**
 * Generate a presigned URL for reading an object (expires in 1 hour)
 */
export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
    })
    return getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Generate a public URL for the object
 * Uses the external MinIO endpoint for browser access
 */
export function getPublicUrl(key: string): string {
    // For production, proxy through Next.js API route
    return `/api/images/${encodeURIComponent(key)}`
}

/**
 * Delete an object from MinIO
 */
export async function deleteFile(key: string): Promise<void> {
    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key,
        })
    )
}

/**
 * Generate a unique object key for product images
 * Format: products/{productId}/{timestamp}-{filename}
 */
export function generateProductImageKey(productId: string, filename: string): string {
    const timestamp = Date.now()
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    return `products/${productId}/${timestamp}-${sanitized}`
}

/**
 * Generate a unique object key for evidence photos
 * Format: evidence/{bookingId}/{timestamp}-{filename}
 */
export function generateEvidenceKey(bookingId: string, filename: string): string {
    const timestamp = Date.now()
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    return `evidence/${bookingId}/${timestamp}-${sanitized}`
}
