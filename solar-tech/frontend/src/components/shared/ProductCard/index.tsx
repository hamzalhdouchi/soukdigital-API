import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, GitCompare, Zap } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { addToCompare, removeFromCompare } from '@/features/catalog/compareSlice'
import { addItem } from '@/features/cart/cartSlice'
import type { ProductSummary } from '@/types'

interface Props {
  product: ProductSummary
}

const INSTALL_LABELS: Record<string, string> = {
  self_consumption: 'Autoconsommation',
  off_grid:         'Site isolé',
  plug_and_play:    'Plug & play',
  mobility:         'Mobilité',
}


function ProductCard({ product }: Props) {
  const dispatch = useAppDispatch()
  const priceMode = useAppSelector((s) => s.ui.priceMode)
  const compareIds = useAppSelector((s) => s.compare.productIds)
  const isCompared = compareIds.includes(product.id)
  const canCompare = compareIds.length < 4

  const price = priceMode === 'ttc'
    ? product.defaultVariant?.priceTtc
    : product.defaultVariant?.priceHt

  const inStock = (product.defaultVariant?.stockQuantity ?? 0) > 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!product.defaultVariant || !inStock) return
    dispatch(addItem({
      id: product.defaultVariant.priceHt as unknown as number,
      variantId: product.defaultVariant.priceHt as unknown as number,
      productSlug: product.slug,
      productName: product.name,
      variantLabel: 'Standard',
      imageUrl: product.primaryImage,
      quantity: 1,
      unitPriceHt: product.defaultVariant.priceHt,
      unitPriceTtc: product.defaultVariant.priceTtc,
    }))
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isCompared) {
      dispatch(removeFromCompare(product.id))
    } else if (canCompare) {
      dispatch(addToCompare(product.id))
    }
  }

  return (
    <Link
      to={`/fr/produit/${product.slug}`}
      className="card group block overflow-hidden"
      style={{ borderRadius: '0.75rem' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-surface-alt" style={{ aspectRatio: '4/3' }}>
        {product.primaryImage ? (
          <img
            src={product.primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Zap size={40} style={{ color: 'var(--color-border)' }} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.installationType && (
            <span className="badge badge-primary text-xs">
              {INSTALL_LABELS[product.installationType] ?? product.installationType}
            </span>
          )}
          {product.isFeatured && (
            <span className="badge badge-gold text-xs">Coup de cœur</span>
          )}
        </div>

        {/* Compare toggle */}
        <button
          onClick={handleCompare}
          title={isCompared ? 'Retirer de la comparaison' : 'Comparer'}
          className={cn(
            'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150',
            isCompared
              ? 'text-white'
              : 'bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100'
          )}
          style={isCompared ? { background: 'var(--color-primary)' } : { color: 'var(--color-text-muted)' }}
        >
          <GitCompare size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Brand */}
        {product.brand?.name && (
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-faint)' }}>
            {product.brand.name}
          </p>
        )}

        {/* Name */}
        <h3 className="text-sm font-semibold leading-snug mb-1 line-clamp-2" style={{ color: 'var(--color-text)' }}>
          {product.name}
        </h3>

        {/* Power badge */}
        {product.basePowerKwc && (
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {product.basePowerKwc} kWc
          </p>
        )}

        {/* Price */}
        {price != null ? (
          <p className="text-lg font-bold mb-3" style={{ color: 'var(--color-primary)' }}>
            {formatPrice(price)}
            <span className="text-xs font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
              {priceMode.toUpperCase()}
            </span>
          </p>
        ) : (
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>Prix sur demande</p>
        )}

        {/* Stock + CTA */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-xs font-medium', inStock ? 'text-success' : '')}
            style={!inStock ? { color: 'var(--color-text-faint)' } : {}}>
            {inStock ? '● En stock' : '○ Sur commande'}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="btn-primary py-1.5 px-3 text-xs gap-1.5 disabled:opacity-40"
          >
            <ShoppingCart size={13} />
            Ajouter
          </button>
        </div>
      </div>
    </Link>
  )
}

export default memo(ProductCard)

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden" style={{ borderRadius: '0.75rem' }}>
      <div className="skeleton skeleton-image" style={{ aspectRatio: '4/3' }} />
      <div className="p-4">
        <div className="skeleton skeleton-text mb-2" style={{ width: '40%' }} />
        <div className="skeleton skeleton-text mb-1" style={{ width: '90%' }} />
        <div className="skeleton skeleton-text mb-3" style={{ width: '60%' }} />
        <div className="skeleton skeleton-text mb-3" style={{ width: '35%', height: '1.5rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '50%' }} />
      </div>
    </div>
  )
}
