'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadProductImage, removeProductImage } from '@/actions/upload'
import { useTranslations } from 'next-intl'

type Props = {
    productId: string
    images: string[]
    locale: string
    onUpdate?: () => void
}

export default function ImageUpload({ productId, images, locale, onUpdate }: Props) {
    const t = useTranslations('common')
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentImages, setCurrentImages] = useState(images)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = useCallback(async (file: File) => {
        setUploading(true)
        setError(null)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('productId', productId)

        try {
            const result = await uploadProductImage(formData)
            if (result.error) {
                setError(result.error)
            } else if (result.url) {
                setCurrentImages(prev => [...prev, result.url!])
                onUpdate?.()
            }
        } catch {
            setError('Upload failed')
        } finally {
            setUploading(false)
        }
    }, [productId, onUpdate])

    const handleRemove = useCallback(async (imageUrl: string) => {
        try {
            const result = await removeProductImage(productId, imageUrl)
            if (result.error) {
                setError(result.error)
            } else {
                setCurrentImages(prev => prev.filter(img => img !== imageUrl))
                onUpdate?.()
            }
        } catch {
            setError('Remove failed')
        }
    }, [productId, onUpdate])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            handleUpload(file)
        }
    }, [handleUpload])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleUpload(file)
        }
        // Reset input to allow re-selecting same file
        e.target.value = ''
    }, [handleUpload])

    return (
        <div className="space-y-3">
            {/* Current Images */}
            {currentImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {currentImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                            <img
                                src={img}
                                alt={`Product image ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => handleRemove(img)}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                            {idx === 0 && (
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-champagne-gold text-[10px] font-bold text-royal-navy rounded">
                                    Cover
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver
                        ? 'border-champagne-gold bg-champagne-gold/5'
                        : 'border-gray-200 hover:border-champagne-gold/50'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-champagne-gold animate-spin" />
                        <span className="text-sm text-navy-600">{t('loading')}</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-navy-600">
                            {locale === 'lo' ? 'ລາກໄຟລ໌ ຫຼື ກົດເລືອກ' : 'Drag file or click to select'}
                        </span>
                        <span className="text-xs text-gray-400">
                            JPEG, PNG, WebP (max 5MB)
                        </span>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="text-xs text-red-500 text-center">{error}</div>
            )}
        </div>
    )
}
