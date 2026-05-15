import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, FileText, ChevronRight, Zap } from 'lucide-react'
import { useProduct } from '@/features/catalog/hooks/useCatalog'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { addItem } from '@/features/cart/cartSlice'
import { togglePriceMode } from '@/app/uiSlice'
import { formatPrice } from '@/lib/utils'
import type { ProductDetailResponse } from '@/types'

type VariantInfo = ProductDetailResponse['variants'][number]


export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError } = useProduct(slug!)
  const dispatch = useAppDispatch()
  const priceMode = useAppSelector((s) => s.ui.priceMode)
  const [selectedVariant, setSelectedVariant] = useState<VariantInfo | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  if (isLoading) return <ProductPageSkeleton />
  if (isError || !product) return (
    <div className="page-container py-24 text-center">
      <p className="text-lg font-semibold mb-4">Produit introuvable</p>
      <Link to="/fr/kits-solaires" className="btn-secondary">Retour au catalogue</Link>
    </div>
  )

  const variant = selectedVariant ?? product.variants.find((v) => v.isDefault) ?? product.variants[0]
  const price = variant ? (priceMode === 'ttc' ? variant.priceTtc : variant.priceHt) : null
  const images = product.images.length > 0 ? product.images : [{ id: 0, url: '', altText: product.name, isPrimary: true }]

  const handleAddToCart = () => {
    if (!variant) return
    dispatch(addItem({
      id: variant.id,
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      variantLabel: variant.label,
      imageUrl: images[0]?.url,
      quantity: 1,
      unitPriceHt: variant.priceHt,
      unitPriceTtc: variant.priceTtc,
    }))
  }

  return (
    <div className="page-container py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        <Link to="/">Accueil</Link>
        <ChevronRight size={14} />
        {product.category && (
          <>
            <Link to={`/fr/${product.category.slug}`}>{product.category.name}</Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="truncate max-w-xs" style={{ color: 'var(--color-text)' }}>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── Gallery ──────────────────────────────────────── */}
        <div>
          <div className="card overflow-hidden mb-3" style={{ aspectRatio: '1/1', borderRadius: '0.875rem' }}>
            {images[activeImage]?.url ? (
              <img
                src={images[activeImage].url}
                alt={images[activeImage].altText ?? product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--color-surface-alt)' }}>
                <Zap size={64} style={{ color: 'var(--color-border)' }} />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setActiveImage(i)}
                  className="w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-colors"
                  style={{ borderColor: i === activeImage ? 'var(--color-primary)' : 'var(--color-border)' }}>
                  {img.url && <img src={img.url} alt="" className="w-full h-full object-cover" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ─────────────────────────────────────────── */}
        <div>
          {product.brand && (
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-faint)' }}>
              {product.brand.name}
            </p>
          )}
          <h1 className="text-2xl font-display font-bold mb-3">{product.name}</h1>

          {product.shortDescription && (
            <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {product.shortDescription}
            </p>
          )}

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="mb-5">
              <p className="text-sm font-medium mb-2">Configuration</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.filter((v) => v.isActive).map((v) => (
                  <button key={v.id} onClick={() => setSelectedVariant(v)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={{
                      borderColor: variant?.id === v.id ? 'var(--color-primary)' : 'var(--color-border)',
                      color: variant?.id === v.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      background: variant?.id === v.id ? 'var(--color-primary-light)' : 'white',
                    }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          {price != null && (
            <div className="mb-6">
              <p className="text-3xl font-display font-bold" style={{ color: 'var(--color-primary)' }}>
                {formatPrice(price)}
              </p>
              <button onClick={() => dispatch(togglePriceMode())}
                className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Afficher en {priceMode === 'ttc' ? 'HT' : 'TTC'} →
              </button>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Prix {priceMode.toUpperCase()} · TVA 20% comprise
              </p>
            </div>
          )}

          {/* CTAs */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} className="btn-primary flex-1 py-3">
              <ShoppingCart size={18} />
              Ajouter au panier
            </button>
            <Link to="/fr/devis" className="btn-secondary py-3 flex items-center gap-2">
              <FileText size={18} />
              Devis
            </Link>
          </div>

          {/* Key specs */}
          <div className="card p-4 flex flex-wrap gap-4" style={{ borderRadius: '0.875rem' }}>
            {product.basePowerKwc && <Spec label="Puissance crête" value={`${product.basePowerKwc} kWc`} />}
            {product.panelCount && <Spec label="Panneaux" value={`${product.panelCount} panneaux`} />}
            {product.phaseType && <Spec label="Phase" value={product.phaseType === 'single_phase' ? 'Monophasé' : 'Triphasé'} />}
            {product.warrantyYears && <Spec label="Garantie" value={`${product.warrantyYears} ans`} />}
            {product.batteryCapacityKwh && <Spec label="Batterie" value={`${product.batteryCapacityKwh} kWh`} />}
          </div>
        </div>
      </div>

      {/* Long description */}
      {product.longDescription && (
        <section className="mt-12">
          <h2 className="text-xl font-display font-bold mb-4">Description</h2>
          <div className="prose max-w-none text-sm leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
            dangerouslySetInnerHTML={{ __html: product.longDescription }} />
        </section>
      )}

      {/* Specs table */}
      <section className="mt-10">
        <h2 className="text-xl font-display font-bold mb-4">Caractéristiques techniques</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {(
                [
                  ['SKU', product.sku],
                  ['Type', product.productType],
                  product.installationType ? ["Type d'installation", product.installationType] : null,
                  product.basePowerKwc ? ['Puissance crête', `${product.basePowerKwc} kWc`] : null,
                  product.inverterPowerVa ? ['Puissance onduleur', `${product.inverterPowerVa} VA`] : null,
                  product.batteryCapacityKwh ? ['Capacité batterie', `${product.batteryCapacityKwh} kWh`] : null,
                  product.phaseType ? ['Phase', product.phaseType === 'single_phase' ? 'Monophasé' : 'Triphasé'] : null,
                  product.injectionType ? ['Type injection', product.injectionType] : null,
                  product.panelCount ? ['Nombre de panneaux', String(product.panelCount)] : null,
                  product.warrantyYears ? ['Garantie', `${product.warrantyYears} ans`] : null,
                ] as ([string, string] | null)[]
              ).filter((row): row is [string, string] => row !== null).map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : 'var(--color-bg)' }}>
                  <td className="px-4 py-3 font-medium w-52" style={{ color: 'var(--color-text)' }}>{row[0]}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-text-muted)' }}>{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{label}</span>
      <span className="text-sm font-semibold font-mono">{value}</span>
    </div>
  )
}

function ProductPageSkeleton() {
  return (
    <div className="page-container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="skeleton skeleton-image" style={{ aspectRatio: '1/1', borderRadius: '0.875rem' }} />
        <div>
          <div className="skeleton skeleton-text mb-2" style={{ width: '30%' }} />
          <div className="skeleton skeleton-text mb-4" style={{ width: '85%', height: '2rem' }} />
          <div className="skeleton skeleton-text mb-2" />
          <div className="skeleton skeleton-text mb-6" style={{ width: '70%' }} />
          <div className="skeleton skeleton-text mb-6" style={{ width: '45%', height: '2.5rem' }} />
          <div className="flex gap-3">
            <div className="skeleton skeleton-text flex-1" style={{ height: '2.75rem' }} />
            <div className="skeleton skeleton-text w-28" style={{ height: '2.75rem' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
