import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, Zap, ArrowRight } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { removeItem, updateQuantity, clearCart } from '@/features/cart/cartSlice'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.cart.items)
  const priceMode = useAppSelector((s) => s.ui.priceMode)

  const subtotalHt  = items.reduce((sum, i) => sum + i.unitPriceHt  * i.quantity, 0)
  const subtotalTtc = items.reduce((sum, i) => sum + i.unitPriceTtc * i.quantity, 0)
  const tax = subtotalTtc - subtotalHt

  if (items.length === 0) {
    return (
      <div className="page-container py-24 text-center">
        <ShoppingBag size={56} className="mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
        <p className="text-lg font-semibold mb-2">Votre panier est vide</p>
        <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Parcourez notre catalogue pour trouver votre kit solaire.
        </p>
        <Link to="/fr/kits-solaires" className="btn-primary">Voir le catalogue</Link>
      </div>
    )
  }

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Mon panier</h1>
        <button onClick={() => dispatch(clearCart())}
          className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1"
          style={{ color: 'var(--color-error)' }}>
          <Trash2 size={13} /> Vider le panier
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items list */}
        <div className="flex-1 flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.variantId} className="card p-4 flex gap-4">
              {/* Image */}
              <div className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ background: 'var(--color-surface-alt)' }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <Zap size={28} style={{ color: 'var(--color-border)' }} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/fr/produit/${item.productSlug}`}
                  className="font-semibold text-sm hover:underline line-clamp-2 block">
                  {item.productName}
                </Link>
                <p className="text-xs mt-0.5 mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  {item.variantLabel}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  {/* Quantity controls */}
                  <div className="flex items-center gap-1 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                      onClick={() => dispatch(updateQuantity({ variantId: item.variantId, quantity: item.quantity - 1 }))}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-surface-alt)] transition-colors rounded-l-lg disabled:opacity-40">
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ variantId: item.variantId, quantity: item.quantity + 1 }))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-surface-alt)] transition-colors rounded-r-lg">
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                        {formatPrice((priceMode === 'ttc' ? item.unitPriceTtc : item.unitPriceHt) * item.quantity)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {formatPrice(priceMode === 'ttc' ? item.unitPriceTtc : item.unitPriceHt)} / unité · {priceMode.toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => dispatch(removeItem(item.variantId))}
                      className="btn-ghost p-1.5"
                      style={{ color: 'var(--color-error)' }}
                      title="Supprimer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="font-semibold mb-4">Récapitulatif</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-muted)' }}>Sous-total HT</span>
                <span>{formatPrice(subtotalHt)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-muted)' }}>TVA (20%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t"
                style={{ borderColor: 'var(--color-divider)' }}>
                <span>Total TTC</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatPrice(subtotalTtc)}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              Passer commande <ArrowRight size={16} />
            </Link>

            <Link to="/fr/devis"
              className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5 mt-2 text-sm">
              Demander un devis
            </Link>

            <p className="text-xs text-center mt-3" style={{ color: 'var(--color-text-muted)' }}>
              Livraison calculée à l'étape suivante
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
