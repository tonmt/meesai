'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Search, Package, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { createProduct, updateProduct, deleteProduct } from '@/actions/product-crud'
import ImageUpload from '@/components/shared/ImageUpload'
import { useTranslations } from 'next-intl'

type Category = {
    id: string
    nameLo: string
    nameEn: string
}

type Product = {
    id: string
    titleLo: string
    titleEn: string | null
    description: string | null
    images: string[]
    rentalPrice: number
    buyPrice: number | null
    size: string
    color: string | null
    brand: string | null
    createdAt: Date
    category: Category
    _count: { assets: number }
}

type Props = {
    products: Product[]
    categories: Category[]
    total: number
    locale: string
}

export default function ProductManager({ products: initialProducts, categories, total, locale }: Props) {
    const t = useTranslations('admin')
    const tc = useTranslations('common')
    const [products, setProducts] = useState(initialProducts)
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [showImageModal, setShowImageModal] = useState<Product | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isPending, startTransition] = useTransition()

    const fmt = (n: number) => new Intl.NumberFormat('lo-LA').format(n)

    function openCreate() {
        setEditingProduct(null)
        setError(null)
        setShowModal(true)
    }

    function openEdit(product: Product) {
        setEditingProduct(product)
        setError(null)
        setShowModal(true)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            try {
                const result = editingProduct
                    ? await updateProduct(formData)
                    : await createProduct(formData)

                if (result.error) {
                    setError(result.error)
                } else {
                    setShowModal(false)
                    window.location.reload()
                }
            } catch {
                setError('Operation failed')
            }
        })
    }

    async function handleDelete() {
        if (!deleteTarget) return
        setError(null)

        startTransition(async () => {
            try {
                const result = await deleteProduct(deleteTarget.id)
                if (result.error) {
                    setError(result.error)
                    setDeleteTarget(null)
                } else {
                    setDeleteTarget(null)
                    window.location.reload()
                }
            } catch {
                setError('Delete failed')
                setDeleteTarget(null)
            }
        })
    }

    const filteredProducts = searchQuery
        ? products.filter(p =>
            p.titleLo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.titleEn || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
        : products

    return (
        <div className="space-y-4">
            {/* Header Bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={locale === 'lo' ? 'ຄົ້ນຫາສິນຄ້າ...' : 'Search products...'}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy placeholder:text-gray-400 focus:outline-none focus:border-champagne-gold"
                    />
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-champagne-gold text-royal-navy text-sm font-bold rounded-xl hover:bg-champagne-gold/90 transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    {locale === 'lo' ? 'ເພີ່ມສິນຄ້າ' : 'Add Product'}
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Products Table */}
            <div className="glass rounded-2xl border border-white/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-royal-navy/5 text-royal-navy text-xs">
                                <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ຮູບ' : 'Image'}</th>
                                <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ຊື່ສິນຄ້າ' : 'Name'}</th>
                                <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ໝວດ' : 'Cat.'}</th>
                                <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ໄຊ' : 'Size'}</th>
                                <th className="text-right px-4 py-3 font-medium">{locale === 'lo' ? 'ລາຄາ' : 'Price'}</th>
                                <th className="text-center px-4 py-3 font-medium">Assets</th>
                                <th className="text-center px-4 py-3 font-medium">{locale === 'lo' ? 'ຈັດການ' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400">
                                        <Package className="w-10 h-10 mx-auto mb-2" />
                                        {locale === 'lo' ? 'ບໍ່ມີສິນຄ້າ' : 'No products'}
                                    </td>
                                </tr>
                            ) : filteredProducts.map(product => (
                                <tr key={product.id} className="border-t border-gray-100 hover:bg-royal-navy/[0.02] transition-colors">
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setShowImageModal(product)}
                                            className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 hover:border-champagne-gold transition-colors"
                                        >
                                            {product.images.length > 0 ? (
                                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5 text-gray-300" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-royal-navy">
                                            {locale === 'lo' ? product.titleLo : (product.titleEn || product.titleLo)}
                                        </div>
                                        {product.brand && (
                                            <span className="text-xs text-gray-400">{product.brand}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-navy-600">
                                        {locale === 'lo' ? product.category.nameLo : product.category.nameEn}
                                    </td>
                                    <td className="px-4 py-3 text-xs">{product.size}</td>
                                    <td className="px-4 py-3 text-right font-medium text-danger">
                                        {fmt(product.rentalPrice)}₭
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="px-2 py-0.5 bg-royal-navy/5 text-royal-navy text-xs font-bold rounded-full">
                                            {product._count.assets}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => setShowImageModal(product)}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Images"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openEdit(product)}
                                                className="p-1.5 text-champagne-gold hover:bg-champagne-gold/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(product)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-xs text-gray-400 text-center">
                {locale === 'lo' ? `ທັງໝົດ ${total} ສິນຄ້າ` : `Total ${total} products`}
            </div>

            {/* ═══ Create/Edit Modal ═══ */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-royal-navy">
                                    {editingProduct
                                        ? (locale === 'lo' ? 'ແກ້ໄຂສິນຄ້າ' : 'Edit Product')
                                        : (locale === 'lo' ? 'ເພີ່ມສິນຄ້າໃໝ່' : 'New Product')
                                    }
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {editingProduct && <input type="hidden" name="id" value={editingProduct.id} />}

                                {/* Title Lo */}
                                <div>
                                    <label className="block text-xs font-medium text-navy-600 mb-1">
                                        {locale === 'lo' ? 'ຊື່ (ลาว) *' : 'Title (Lao) *'}
                                    </label>
                                    <input
                                        name="titleLo"
                                        defaultValue={editingProduct?.titleLo || ''}
                                        required
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold"
                                    />
                                </div>

                                {/* Title En */}
                                <div>
                                    <label className="block text-xs font-medium text-navy-600 mb-1">
                                        Title (English)
                                    </label>
                                    <input
                                        name="titleEn"
                                        defaultValue={editingProduct?.titleEn || ''}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold"
                                    />
                                </div>

                                {/* Category + Size */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-navy-600 mb-1">
                                            {locale === 'lo' ? 'ໝວດໝູ່ *' : 'Category *'}
                                        </label>
                                        <select
                                            name="categoryId"
                                            defaultValue={editingProduct?.category.id || ''}
                                            required
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold"
                                        >
                                            <option value="">{locale === 'lo' ? 'ເລືອກ...' : 'Select...'}</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {locale === 'lo' ? cat.nameLo : cat.nameEn}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-navy-600 mb-1">
                                            {locale === 'lo' ? 'ໄຊສ໌ *' : 'Size *'}
                                        </label>
                                        <select
                                            name="size"
                                            defaultValue={editingProduct?.size || ''}
                                            required
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold"
                                        >
                                            <option value="">-</option>
                                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Price + Color + Brand */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-navy-600 mb-1">
                                            {locale === 'lo' ? 'ຄ່າເຊົ່າ (₭) *' : 'Rental (₭) *'}
                                        </label>
                                        <input
                                            name="rentalPrice"
                                            type="number"
                                            defaultValue={editingProduct?.rentalPrice || ''}
                                            required
                                            min={1000}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-navy-600 mb-1">
                                            {locale === 'lo' ? 'ສີ' : 'Color'}
                                        </label>
                                        <input
                                            name="color"
                                            defaultValue={editingProduct?.color || ''}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-navy-600 mb-1">
                                            {locale === 'lo' ? 'ແບຣນ' : 'Brand'}
                                        </label>
                                        <input
                                            name="brand"
                                            defaultValue={editingProduct?.brand || ''}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-medium text-navy-600 mb-1">
                                        {locale === 'lo' ? 'ຄຳອະທິບາຍ' : 'Description'}
                                    </label>
                                    <textarea
                                        name="description"
                                        defaultValue={editingProduct?.description || ''}
                                        rows={3}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold resize-none"
                                    />
                                </div>

                                {/* Buy Price (optional) */}
                                <div>
                                    <label className="block text-xs font-medium text-navy-600 mb-1">
                                        {locale === 'lo' ? 'ລາຄາຊື້ (₭) — ສຳລັບປະເມີນ' : 'Buy Price (₭) — for valuation'}
                                    </label>
                                    <input
                                        name="buyPrice"
                                        type="number"
                                        defaultValue={editingProduct?.buyPrice || ''}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold"
                                    />
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="text-xs text-red-500 text-center">{error}</div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full py-3 bg-champagne-gold text-royal-navy font-bold rounded-xl hover:bg-champagne-gold/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingProduct
                                        ? (locale === 'lo' ? 'ບັນທຶກ' : 'Save')
                                        : (locale === 'lo' ? 'ສ້າງສິນຄ້າ' : 'Create Product')
                                    }
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Image Upload Modal ═══ */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowImageModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-royal-navy">
                                    {locale === 'lo' ? 'ຮູບສິນຄ້າ' : 'Product Images'}
                                </h3>
                                <button onClick={() => setShowImageModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mb-4">
                                {locale === 'lo' ? showImageModal.titleLo : (showImageModal.titleEn || showImageModal.titleLo)}
                            </p>
                            <ImageUpload
                                productId={showImageModal.id}
                                images={showImageModal.images}
                                locale={locale}
                                onUpdate={() => window.location.reload()}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Delete Confirmation ═══ */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-royal-navy mb-2">
                                {locale === 'lo' ? 'ຢືນຢັນລຶບ?' : 'Confirm Delete?'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {locale === 'lo' ? deleteTarget.titleLo : (deleteTarget.titleEn || deleteTarget.titleLo)}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    {tc('cancel')}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isPending}
                                    className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {tc('delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
