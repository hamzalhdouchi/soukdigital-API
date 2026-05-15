import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle } from 'lucide-react'
import { useSubmitQuote } from '../hooks/useQuote'
import { useAppSelector } from '@/app/hooks'

const schema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  company: z.string().optional(),
  installationType: z.string().optional(),
  consumptionKwh: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().positive().optional()
  ),
  location: z.string().optional(),
  budget: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().positive().optional()
  ),
  message: z.string().min(10, 'Message trop court (10 caractères minimum)'),
})

type FormValues = z.infer<typeof schema>

export default function QuotePage() {
  const { mutate, isPending, isSuccess, data: result, isError } = useSubmitQuote()
  const cartItems = useAppSelector((s) => s.cart.items)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = (values: FormValues) => {
    const items = cartItems.map((item) => ({
      productId: undefined,
      variantId: item.variantId,
      productName: item.productName,
      variantLabel: item.variantLabel,
      quantity: item.quantity,
      unitPriceHt: item.unitPriceHt,
    }))
    mutate({ ...values, installationType: values.installationType as import('@/types').InstallationType | undefined, items: items.length > 0 ? items : undefined })
  }

  if (isSuccess) {
    return (
      <div className="page-container py-24 max-w-lg text-center">
        <CheckCircle size={56} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
        <h1 className="text-2xl font-display font-bold mb-2">Demande envoyée !</h1>
        <p className="mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Votre référence : <span className="font-mono font-semibold">{result.data.reference}</span>
        </p>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Notre équipe vous contactera sous 24h à l'adresse <strong>{result.data.email}</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="page-container py-12 max-w-2xl">
      <h1 className="text-2xl font-display font-bold mb-2">Demande de devis</h1>
      <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
        Décrivez votre projet. Notre équipe vous répond sous 24h.
      </p>

      {isError && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
          Une erreur est survenue. Veuillez réessayer.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 flex flex-col gap-5" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prénom *</label>
            <input {...register('firstName')} className="input" placeholder="Jean" />
            {errors.firstName && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input {...register('lastName')} className="input" placeholder="Dupont" />
            {errors.lastName && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input {...register('email')} className="input" type="email" placeholder="jean@exemple.fr" />
          {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input {...register('phone')} className="input" type="tel" placeholder="+33 6 00 00 00 00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Société</label>
            <input {...register('company')} className="input" placeholder="Mon entreprise" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type d'installation</label>
            <select {...register('installationType')} className="input">
              <option value="">Sélectionner…</option>
              <option value="self_consumption">Autoconsommation</option>
              <option value="off_grid">Site isolé</option>
              <option value="plug_and_play">Plug and play</option>
              <option value="mobility">Mobilité</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Consommation (kWh/an)</label>
            <input {...register('consumptionKwh')} className="input" type="number" min="0" placeholder="3500" />
            {errors.consumptionKwh && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.consumptionKwh.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Localisation</label>
            <input {...register('location')} className="input" placeholder="Paris, France" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Budget indicatif (€ HT)</label>
            <input {...register('budget')} className="input" type="number" min="0" placeholder="10000" />
            {errors.budget && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.budget.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message *</label>
          <textarea {...register('message')} className="input h-auto py-3" rows={4}
            placeholder="Décrivez votre projet, consommation, localisation…" />
          {errors.message && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.message.message}</p>}
        </div>

        {cartItems.length > 0 && (
          <div className="text-sm p-3 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
            <p className="font-medium mb-1">Produits du panier inclus ({cartItems.length})</p>
            <ul className="space-y-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {cartItems.map((item) => (
                <li key={item.variantId}>• {item.productName} — {item.variantLabel} × {item.quantity}</li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" disabled={isPending} className="btn-primary self-start px-8 disabled:opacity-60">
          {isPending ? 'Envoi en cours…' : 'Envoyer ma demande'}
        </button>
      </form>
    </div>
  )
}
