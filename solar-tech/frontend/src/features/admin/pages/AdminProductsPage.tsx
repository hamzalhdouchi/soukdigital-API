import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, X, Search, Pencil, AlertCircle, Upload, ImageOff } from 'lucide-react'
import { useAdminProducts, useCreateProduct, useDeleteProduct, useUpdateProduct, useUploadProductImage, useDeleteProductImage } from '../hooks/useAdminProducts'
import { useToast } from '@/lib/toast'
import { formatPrice } from '@/lib/utils'
import type { ProductDetailResponse } from '@/types'

const schema = z.object({
  sku: z.string().min(1, 'SKU requis'),
  name: z.string().min(1, 'Nom requis'),
  shortDescription: z.string().optional(),
  productType: z.string().min(1, 'Type requis'),
  installationType: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(false),
  variantLabel: z.string().min(1, 'Label variant requis'),
  variantReference: z.string().min(1, 'Référence variant requise'),
  variantPriceHt: z.preprocess(Number, z.number().positive('Prix HT requis')),
  variantPriceTtc: z.preprocess(Number, z.number().positive('Prix TTC requis')),
})
type FormValues = z.infer<typeof schema>

const editSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  shortDescription: z.string().optional(),
  productType: z.string().min(1, 'Type requis'),
  installationType: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(false),
})
type EditFormValues = z.infer<typeof editSchema>

const TYPE_OPTIONS = [
  { value: 'solar_kit', label: 'Kit solaire' },
  { value: 'lithium_battery', label: 'Batterie lithium' },
  { value: 'inverter', label: 'Onduleur' },
  { value: 'accessory', label: 'Accessoire' },
]

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<ProductDetailResponse | null>(null)
  const { toast } = useToast()

  const { data, isLoading, isError } = useAdminProducts({ page, size: 20, search: search || undefined })
  const { mutate: create, isPending: creating } = useCreateProduct()
  const { mutate: del } = useDeleteProduct()
  const { mutate: update, isPending: updating } = useUpdateProduct()
  const { mutate: uploadImage, isPending: uploading } = useUploadProductImage()
  const { mutate: deleteImage } = useDeleteProductImage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const products = data?.content ?? []
  const total = data?.totalElements ?? 0

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isFeatured: false, isActive: false },
  })

  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    formState: { errors: editErrors },
    reset: editReset,
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) })

  const openCreate = () => { reset(); setShowModal(true) }

  const openEdit = (p: ProductDetailResponse) => {
    setEditProduct(p)
    editReset({
      name: p.name,
      shortDescription: p.shortDescription ?? '',
      productType: p.productType,
      installationType: p.installationType ?? '',
      isFeatured: p.isFeatured,
      isActive: p.isActive,
    })
  }

  const onEditSubmit = (values: EditFormValues) => {
    if (!editProduct) return
    update({ id: editProduct.id, payload: {
      name: values.name,
      shortDescription: values.shortDescription || undefined,
      productType: values.productType,
      installationType: values.installationType || undefined,
      isFeatured: values.isFeatured,
      isActive: values.isActive,
    }}, {
      onSuccess: () => { setEditProduct(null); toast('Produit mis à jour', 'success') },
      onError: () => toast('Erreur lors de la mise à jour', 'error'),
    })
  }

  const onSubmit = (values: FormValues) => {
    create({
      sku: values.sku,
      name: values.name,
      shortDescription: values.shortDescription,
      productType: values.productType,
      installationType: values.installationType || undefined,
      isFeatured: values.isFeatured,
      isActive: values.isActive,
      variants: [{
        reference: values.variantReference,
        label: values.variantLabel,
        priceHt: values.variantPriceHt,
        priceTtc: values.variantPriceTtc,
        currency: 'EUR',
        isDefault: true,
        isActive: true,
      }],
    }, {
      onSuccess: () => { setShowModal(false); reset(); toast('Produit créé avec succès', 'success') },
      onError: () => toast('Erreur lors de la création', 'error'),
    })
  }

  const handleDelete = (id: number) => {
    if (confirm('Supprimer ce produit ?')) {
      del(id, {
        onSuccess: () => toast('Produit supprimé', 'success'),
        onError: () => toast('Erreur lors de la suppression', 'error'),
      })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold">Produits ({total})</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Ajouter un produit
        </button>
      </div>

      {isError && (
        <div className="flex items-center gap-2 p-4 mb-4 rounded-lg text-sm"
          style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
          <AlertCircle size={16} />
          Impossible de charger les produits. Vérifiez votre connexion et réessayez.
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
        <input
          className="input pl-9"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--color-surface-alt)' }}>
            <tr>
              {['', 'SKU', 'Nom', 'Type', 'Prix TTC', 'Actif', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                  Aucun produit
                </td>
              </tr>
            ) : products.map((p, i) => {
              const defaultVariant = p.variants.find((v) => v.isDefault) ?? p.variants[0]
              return (
                <tr key={p.id} style={{ background: i % 2 === 0 ? 'white' : 'var(--color-bg)' }}>
                  <td className="px-2 py-2 w-10">
                    {p.images.length > 0 ? (
                      <img
                        src={p.images.find(img => img.isPrimary)?.url ?? p.images[0].url}
                        alt={p.name}
                        className="w-9 h-9 rounded object-cover flex-shrink-0"
                        style={{ border: '1px solid var(--color-border)' }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded flex items-center justify-center"
                        style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                        <ImageOff size={14} style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{p.name}</td>
                  <td className="px-4 py-3">{p.productType}</td>
                  <td className="px-4 py-3 font-mono">
                    {defaultVariant ? formatPrice(defaultVariant.priceTtc) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.isFeatured ? 'badge-primary' : ''} text-xs`}
                      style={!p.isFeatured ? { background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' } : {}}>
                      {p.isFeatured ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="btn-ghost p-1.5 text-xs"
                        title="Modifier"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn-ghost p-1.5 text-xs"
                        title="Supprimer"
                        style={{ color: 'var(--color-error)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 0} onClick={() => setPage(page - 1)} className="btn-ghost disabled:opacity-40">← Préc.</button>
          <span className="flex items-center text-sm px-3" style={{ color: 'var(--color-text-muted)' }}>
            Page {page + 1} / {data.totalPages}
          </span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)} className="btn-ghost disabled:opacity-40">Suiv. →</button>
        </div>
      )}

      {/* Edit modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Modifier le produit</h2>
              <button onClick={() => setEditProduct(null)} className="btn-ghost p-1"><X size={18} /></button>
            </div>

            <p className="text-xs font-mono mb-4 px-2 py-1 rounded" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
              SKU : {editProduct.sku}
            </p>

            <form onSubmit={editHandleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Nom *</label>
                <input {...editRegister('name')} className="input" />
                {editErrors.name && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{editErrors.name.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Description courte</label>
                <textarea {...editRegister('shortDescription')} className="input h-auto py-2" rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Type *</label>
                  <select {...editRegister('productType')} className="input">
                    {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {editErrors.productType && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{editErrors.productType.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Type d'installation</label>
                  <select {...editRegister('installationType')} className="input">
                    <option value="">Aucun</option>
                    <option value="self_consumption">Autoconsommation</option>
                    <option value="off_grid">Site isolé</option>
                    <option value="plug_and_play">Plug & Play</option>
                    <option value="mobility">Mobilité</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...editRegister('isActive')} style={{ accentColor: 'var(--color-primary)' }} />
                  Actif
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...editRegister('isFeatured')} style={{ accentColor: 'var(--color-primary)' }} />
                  Coup de cœur
                </label>
              </div>

              {/* Image management */}
              <div>
                <label className="text-xs font-medium mb-2 block">Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editProduct.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt={img.altText ?? ''}
                        className="w-16 h-16 rounded object-cover"
                        style={{ border: img.isPrimary ? '2px solid var(--color-primary)' : '1px solid var(--color-border)' }}
                      />
                      {img.isPrimary && (
                        <span className="absolute top-0 left-0 text-[9px] font-bold px-1 rounded-br"
                          style={{ background: 'var(--color-primary)', color: 'white' }}>
                          ★
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteImage(
                          { productId: editProduct.id, imageId: img.id },
                          {
                            onSuccess: (updated) => setEditProduct(updated),
                            onError: () => toast('Erreur lors de la suppression', 'error'),
                          }
                        )}
                        className="absolute top-0 right-0 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: '#EF4444', color: 'white' }}
                        title="Supprimer l'image"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-16 h-16 rounded flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50"
                    style={{ border: '2px dashed var(--color-border)', color: 'var(--color-text-muted)' }}
                    title="Ajouter une image"
                  >
                    {uploading ? (
                      <span className="text-[9px]">…</span>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span className="text-[9px]">Ajouter</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file || !editProduct) return
                    uploadImage(
                      { productId: editProduct.id, file },
                      {
                        onSuccess: (updated) => { setEditProduct(updated); toast('Image ajoutée', 'success') },
                        onError: () => toast('Erreur lors de l\'upload', 'error'),
                      }
                    )
                    e.target.value = ''
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  L'image avec ★ est l'image principale. Formats : JPG, PNG, WebP (max 10 Mo).
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={updating} className="btn-primary flex-1 disabled:opacity-60">
                  {updating ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button type="button" onClick={() => setEditProduct(null)} className="btn-ghost px-4">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Nouveau produit</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">SKU *</label>
                  <input {...register('sku')} className="input" placeholder="SOL-001" />
                  {errors.sku && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.sku.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Type *</label>
                  <select {...register('productType')} className="input">
                    <option value="">Choisir…</option>
                    {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {errors.productType && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.productType.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Nom *</label>
                <input {...register('name')} className="input" placeholder="Kit solaire 3kWc" />
                {errors.name && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Description courte</label>
                <textarea {...register('shortDescription')} className="input h-auto py-2" rows={2} />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Type d'installation</label>
                <select {...register('installationType')} className="input">
                  <option value="">Aucun</option>
                  <option value="self_consumption">Autoconsommation</option>
                  <option value="off_grid">Site isolé</option>
                  <option value="plug_and_play">Plug & Play</option>
                  <option value="mobility">Mobilité</option>
                </select>
              </div>

              <fieldset className="border rounded-lg p-3" style={{ borderColor: 'var(--color-border)' }}>
                <legend className="text-xs font-semibold px-1">Variant par défaut</legend>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Référence *</label>
                    <input {...register('variantReference')} className="input" placeholder="REF-001" />
                    {errors.variantReference && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.variantReference.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Label *</label>
                    <input {...register('variantLabel')} className="input" placeholder="Standard" />
                    {errors.variantLabel && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.variantLabel.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Prix HT (€) *</label>
                    <input {...register('variantPriceHt')} className="input" type="number" step="0.01" min="0" />
                    {errors.variantPriceHt && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.variantPriceHt.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Prix TTC (€) *</label>
                    <input {...register('variantPriceTtc')} className="input" type="number" step="0.01" min="0" />
                    {errors.variantPriceTtc && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.variantPriceTtc.message}</p>}
                  </div>
                </div>
              </fieldset>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...register('isActive')} style={{ accentColor: 'var(--color-primary)' }} />
                  Actif
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...register('isFeatured')} style={{ accentColor: 'var(--color-primary)' }} />
                  Coup de cœur
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating} className="btn-primary flex-1 disabled:opacity-60">
                  {creating ? 'Création…' : 'Créer le produit'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost px-4">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
