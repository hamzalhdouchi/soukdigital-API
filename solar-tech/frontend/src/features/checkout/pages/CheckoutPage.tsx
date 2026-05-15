import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { clearCart } from '@/features/cart/cartSlice'
import { formatPrice } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { orderService } from '../services/orderService'
import type { OrderResponse } from '../services/orderService'

const schema = z.object({
  firstName:  z.string().min(1, 'Requis'),
  lastName:   z.string().min(1, 'Requis'),
  email:      z.string().email('Email invalide'),
  phone:      z.string().optional(),
  address:    z.string().min(5, 'Adresse complète requise'),
  city:       z.string().min(1, 'Requis'),
  postalCode: z.string().min(4, 'Requis'),
  country:    z.string().default('FR'),
  notes:      z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const STEPS = ['Livraison', 'Récapitulatif', 'Confirmation']

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const items    = useAppSelector((s) => s.cart.items)
  const user     = useAppSelector((s) => s.auth.user)
  const [step, setStep] = useState(0)
  const [order, setOrder] = useState<OrderResponse | null>(null)

  const subtotalHt  = items.reduce((s, i) => s + i.unitPriceHt  * i.quantity, 0)
  const subtotalTtc = items.reduce((s, i) => s + i.unitPriceTtc * i.quantity, 0)

  const { mutate, isPending, isError } = useMutation({
    mutationFn: orderService.create,
    onSuccess: (data) => {
      setOrder(data.data)
      dispatch(clearCart())
      setStep(2)
    },
  })

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName:  user?.firstName ?? '',
      lastName:   user?.lastName  ?? '',
      email:      user?.email     ?? '',
      phone:      user?.phone     ?? '',
      country: 'FR',
    },
  })

  if (items.length === 0 && !order) return <Navigate to="/panier" replace />

  const onConfirm = () => {
    const v = getValues()
    mutate({
      ...v,
      items: items.map((i) => ({
        variantId:    i.variantId,
        productName:  i.productName,
        variantLabel: i.variantLabel,
        quantity:     i.quantity,
        unitPriceHt:  i.unitPriceHt,
        unitPriceTtc: i.unitPriceTtc,
      })),
    })
  }

  return (
    <div className="page-container py-8 max-w-3xl">
      {/* Stepper */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 transition-colors"
                style={{ background: i <= step ? 'var(--color-primary)' : 'var(--color-border)' }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs mt-1 font-medium hidden sm:block"
                style={{ color: i === step ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-2 transition-colors"
                style={{ background: i < step ? 'var(--color-primary)' : 'var(--color-border)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — Delivery address */}
      {step === 0 && (
        <form onSubmit={handleSubmit(() => setStep(1))} className="space-y-5">
          <h2 className="text-lg font-display font-bold mb-4">Adresse de livraison</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Prénom *</label>
              <input {...register('firstName')} className="input" />
              {errors.firstName && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Nom *</label>
              <input {...register('lastName')} className="input" />
              {errors.lastName && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Email *</label>
              <input {...register('email')} type="email" className="input" />
              {errors.email && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Téléphone</label>
              <input {...register('phone')} type="tel" className="input" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Adresse *</label>
            <input {...register('address')} className="input" placeholder="15 rue de la Paix" />
            {errors.address && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Code postal *</label>
              <input {...register('postalCode')} className="input" />
              {errors.postalCode && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.postalCode.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Ville *</label>
              <input {...register('city')} className="input" />
              {errors.city && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.city.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Pays</label>
              <select {...register('country')} className="input">
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="LU">Luxembourg</option>
                <option value="MA">Maroc</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Notes de commande</label>
            <textarea {...register('notes')} className="input h-auto py-2" rows={2}
              placeholder="Instructions particulières pour la livraison…" />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary px-8 py-3">
              Continuer → Récapitulatif
            </button>
          </div>
        </form>
      )}

      {/* Step 1 — Summary */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-lg font-display font-bold">Récapitulatif</h2>

          {isError && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
              Une erreur est survenue. Veuillez réessayer.
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--color-surface-alt)' }}>
                <tr>
                  {['Produit', 'Qté', 'Prix HT', 'Prix TTC'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.variantId} style={{ background: i % 2 === 0 ? 'white' : 'var(--color-bg)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.variantLabel}</p>
                    </td>
                    <td className="px-4 py-3 font-mono">{item.quantity}</td>
                    <td className="px-4 py-3 font-mono">{formatPrice(item.unitPriceHt * item.quantity)}</td>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {formatPrice(item.unitPriceTtc * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Sous-total HT</span>
              <span>{formatPrice(subtotalHt)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>TVA (20%)</span>
              <span>{formatPrice(subtotalTtc - subtotalHt)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t"
              style={{ borderColor: 'var(--color-divider)' }}>
              <span>Total TTC</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatPrice(subtotalTtc)}</span>
            </div>
          </div>

          <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
            Paiement sécurisé à la livraison ou par virement bancaire. Nos équipes vous contacteront pour confirmer votre commande.
          </p>

          <div className="flex gap-3 justify-between">
            <button onClick={() => setStep(0)} className="btn-ghost px-6">← Modifier</button>
            <button onClick={onConfirm} disabled={isPending} className="btn-primary px-8 py-3 disabled:opacity-60">
              {isPending ? 'Envoi en cours…' : 'Confirmer la commande'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Confirmation */}
      {step === 2 && order && (
        <div className="text-center py-12">
          <CheckCircle size={60} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-2xl font-display font-bold mb-2">Commande confirmée !</h2>
          <p className="mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Référence : <span className="font-mono font-semibold">{order.reference}</span>
          </p>
          <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Total : <span className="font-semibold">{formatPrice(order.totalTtc)}</span> TTC
          </p>
          <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Un email de confirmation vous a été envoyé. Notre équipe vous contactera sous 24h pour organiser la livraison.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/" className="btn-primary">Retour à l'accueil</Link>
            <Link to="/compte" className="btn-secondary">Mes commandes</Link>
          </div>
        </div>
      )}
    </div>
  )
}
