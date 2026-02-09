import { NextRequest, NextResponse } from 'next/server'
import { s3Client, BUCKET } from '@/lib/minio'
import { GetObjectCommand } from '@aws-sdk/client-s3'

/**
 * API Route: Proxy images from MinIO
 * Path: /api/images/[...key]
 *
 * This proxies MinIO objects through Next.js to avoid CORS
 * and exposing internal MinIO endpoints
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ key: string[] }> }
) {
    const { key: keyParts } = await params
    const objectKey = keyParts.join('/')

    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: objectKey,
        })

        const response = await s3Client.send(command)

        if (!response.Body) {
            return new NextResponse('Not found', { status: 404 })
        }

        // Convert stream to buffer
        const chunks: Uint8Array[] = []
        const reader = response.Body.transformToWebStream().getReader()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            if (value) chunks.push(value)
        }

        const buffer = Buffer.concat(chunks)

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': response.ContentType || 'image/jpeg',
                'Content-Length': String(buffer.length),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        console.error('Image proxy error:', error)
        return new NextResponse('Image not found', { status: 404 })
    }
}
