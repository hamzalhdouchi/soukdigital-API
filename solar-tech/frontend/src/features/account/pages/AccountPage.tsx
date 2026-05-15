import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Package, AlertCircle } from 'lucide-react'
import { useMe, useUpdateProfile, useMyOrders } from '../hooks/useUser'
import { useToast } from '@/lib/toast'
import { formatPrice } from '@/lib/utils'

const schema = z.object({
  firstName: z.string().min(1, 'Requis'),
  lastName:  z.string().min(1, 'Requis'),
  phone:     z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending:    'En attente',
  confirmed:  'Confirmé',
  processing: 'En cours',
  shipped:    'Expédié',
  delivered:  'Livré',
  cancelled:  'Annulé',
}

export default function AccountPage() {
  const { data: user, isLoading, isError: profileError } = useMe()
  const { mutate: updateProfile, isPending, isSuccess } = useUpdateProfile()
  const { data: ordersData, isError: ordersError } = useMyOrders()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' },
  })

  const onSubmit = (values: FormValues) => {
    updateProfile(values, {
      onSuccess: () => { setEditing(false); toast('Profil mis à jour', 'success') },
      onError: () => toast('Erreur lors de la mise à jour du profil', 'error'),
    })
  }

  const orders = ordersData?.content ?? []

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-display font-bold mb-6">Mon espace client</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Profile ───────────────────────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Profil</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-ghost text-xs px-3 py-1">
                Modifier
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <div className="skeleton skeleton-text w-48" />
              <div className="skeleton skeleton-text w-64" />
            </div>
          ) : profileError ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-error)' }}>
              <AlertCircle size={15} /> Impossible de charger le profil.
            </div>
          ) : editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Prénom</label>
                <input {...register('firstName')} className="input" />
                {errors.firstName && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Nom</label>
                <input {...register('lastName')} className="input" />
                {errors.lastName && <p className="text-xs mt-0.5" style={{ color: 'var(--color-error)' }}>{errors.lastName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Téléphone</label>
                <input {...register('phone')} className="input" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={isPending}
                  className="btn-primary text-sm py-1.5 px-4 disabled:opacity-60">
                  {isPending ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button type="button" onClick={() => { setEditing(false); reset() }}
                  className="btn-ghost text-sm py-1.5 px-4">
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-1.5">
                {isSuccess && <CheckCircle size={13} style={{ color: 'var(--color-primary)' }} />}
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              <p style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
              {user?.phone && <p style={{ color: 'var(--color-text-muted)' }}>{user.phone}</p>}
              <div className="flex flex-wrap gap-1 pt-1">
                {user?.roles?.map((role) => (
                  <span key={role} className="badge badge-primary text-xs">
                    {role.replace('ROLE_', '')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Orders ────────────────────────────────────────── */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-sm mb-4">Mes commandes</h2>
          {ordersError ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-error)' }}>
              <AlertCircle size={15} /> Impossible de charger vos commandes.
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Package size={36} className="mb-2" style={{ color: 'var(--color-border)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Aucune commande pour l'instant.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <div>
                    <p className="font-mono font-semibold text-xs">{order.reference}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {formatPrice(order.totalTtc)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {ORDER_STATUS_LABEL[order.status] ?? order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
