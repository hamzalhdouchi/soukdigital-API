import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, AlertCircle } from 'lucide-react'
import { adminOrderService, type AdminOrder } from '../services/adminOrderService'
import { useToast } from '@/lib/toast'
import { formatPrice } from '@/lib/utils'

const STATUSES = [
  { value: '',           label: 'Tous' },
  { value: 'pending',    label: 'En attente' },
  { value: 'confirmed',  label: 'Confirmé' },
  { value: 'processing', label: 'En cours' },
  { value: 'shipped',    label: 'Expédié' },
  { value: 'delivered',  label: 'Livré' },
  { value: 'cancelled',  label: 'Annulé' },
]

const NEXT_STATUSES: Record<string, { value: string; label: string }[]> = {
  pending:    [{ value: 'confirmed', label: 'Confirmer' }, { value: 'cancelled', label: 'Annuler' }],
  confirmed:  [{ value: 'processing', label: 'En traitement' }, { value: 'cancelled', label: 'Annuler' }],
  processing: [{ value: 'shipped', label: 'Expédier' }, { value: 'cancelled', label: 'Annuler' }],
  shipped:    [{ value: 'delivered', label: 'Marquer livré' }],
  delivered:  [],
  cancelled:  [],
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:    { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
  confirmed:  { bg: 'var(--color-info-light)',    text: 'var(--color-info)' },
  processing: { bg: 'var(--color-primary-light)', text: 'var(--color-primary)' },
  shipped:    { bg: 'var(--color-gold-light)',    text: 'var(--color-gold)' },
  delivered:  { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  cancelled:  { bg: 'var(--color-error-light)',   text: 'var(--color-error)' },
}

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () => adminOrderService.getOrders({ status: statusFilter || undefined, page, size: 20 }),
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminOrderService.updateStatus(id, status),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      toast(`Statut mis à jour : ${STATUSES.find((s) => s.value === status)?.label ?? status}`, 'success')
      setOpenMenu(null)
    },
    onError: () => toast('Impossible de mettre à jour le statut', 'error'),
  })

  const orders = data?.content ?? []
  const total  = data?.totalElements ?? 0

  const statusStyle = (s: string) =>
    STATUS_COLORS[s] ?? { bg: 'var(--color-surface-alt)', text: 'var(--color-text-muted)' }

  return (
    <div onClick={() => setOpenMenu(null)}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-display font-bold">Commandes ({total})</h1>
        <div className="flex flex-wrap gap-1">
          {STATUSES.map((s) => (
            <button key={s.value}
              onClick={() => { setStatusFilter(s.value); setPage(0) }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={statusFilter === s.value
                ? { background: 'var(--color-primary)', color: 'white' }
                : { background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }
              }>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="flex items-center gap-2 p-4 mb-4 rounded-lg text-sm"
          style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
          <AlertCircle size={16} />
          Impossible de charger les commandes. Vérifiez votre connexion et réessayez.
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--color-surface-alt)' }}>
            <tr>
              {['Référence', 'Client', 'Ville', 'Total TTC', 'Statut', 'Actions', 'Date'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium"
                  style={{ color: 'var(--color-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Aucune commande
                </td>
              </tr>
            ) : orders.map((o: AdminOrder, i) => {
              const { bg, text } = statusStyle(o.status)
              const nextOptions = NEXT_STATUSES[o.status] ?? []
              return (
                <tr key={o.id} style={{ background: i % 2 === 0 ? 'white' : 'var(--color-bg)' }}>
                  <td className="px-4 py-3 font-mono text-xs">{o.reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.shippingFirstName} {o.shippingLastName}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{o.shippingEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{o.shippingCity}, {o.shippingCountry}</td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {formatPrice(o.totalTtc)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: bg, color: text }}>
                      {STATUSES.find((s) => s.value === o.status)?.label ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {nextOptions.length > 0 ? (
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenMenu(openMenu === o.id ? null : o.id)}
                          className="btn-ghost px-2 py-1 text-xs flex items-center gap-1"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          Changer <ChevronDown size={12} />
                        </button>
                        {openMenu === o.id && (
                          <div className="absolute left-0 top-full mt-1 z-10 rounded-lg shadow-lg overflow-hidden"
                            style={{ background: 'white', border: '1px solid var(--color-border)', minWidth: 140 }}>
                            {nextOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => updateStatus({ id: o.id, status: opt.value })}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}
            className="btn-ghost disabled:opacity-40">← Préc.</button>
          <span className="flex items-center text-sm px-3" style={{ color: 'var(--color-text-muted)' }}>
            Page {page + 1} / {data.totalPages}
          </span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}
            className="btn-ghost disabled:opacity-40">Suiv. →</button>
        </div>
      )}
    </div>
  )
}
