import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { useAdminQuotes, useUpdateQuoteStatus } from '../hooks/useAdminQuotes'
import { useToast } from '@/lib/toast'
import type { AdminQuote } from '../services/adminQuoteService'

const STATUSES = [
  { value: '', label: 'Tous' },
  { value: 'new', label: 'Nouveau' },
  { value: 'in_review', label: 'En cours' },
  { value: 'sent', label: 'Envoyé' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'rejected', label: 'Refusé' },
  { value: 'converted', label: 'Converti' },
]

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new:       { bg: 'var(--color-info-light)',    text: 'var(--color-info)' },
  in_review: { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
  sent:      { bg: 'var(--color-primary-light)', text: 'var(--color-primary)' },
  accepted:  { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  rejected:  { bg: 'var(--color-error-light)',   text: 'var(--color-error)' },
  converted: { bg: 'var(--color-gold-light)',    text: 'var(--color-gold)' },
}

export default function AdminQuotesPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<AdminQuote | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const { toast } = useToast()
  const { data, isLoading, isError } = useAdminQuotes({ status: statusFilter || undefined, page, size: 20 })
  const { mutate: updateStatus, isPending } = useUpdateQuoteStatus()

  const quotes = data?.content ?? []
  const total = data?.totalElements ?? 0

  const openDetail = (q: AdminQuote) => {
    setSelected(q)
    setNewStatus(q.status)
    setAdminNotes(q.adminNotes ?? '')
  }

  const handleSave = () => {
    if (!selected) return
    updateStatus({ id: selected.id, status: newStatus, adminNotes }, {
      onSuccess: () => { setSelected(null); toast('Devis mis à jour', 'success') },
      onError: () => toast('Erreur lors de la mise à jour du devis', 'error'),
    })
  }

  const statusStyle = (s: string) => STATUS_COLORS[s] ?? { bg: 'var(--color-surface-alt)', text: 'var(--color-text-muted)' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold">Devis ({total})</h1>
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatusFilter(s.value); setPage(0) }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={statusFilter === s.value
                ? { background: 'var(--color-primary)', color: 'white' }
                : { background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="flex items-center gap-2 p-4 mb-4 rounded-lg text-sm"
          style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
          <AlertCircle size={16} />
          Impossible de charger les devis. Vérifiez votre connexion et réessayez.
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--color-surface-alt)' }}>
            <tr>
              {['Référence', 'Client', 'Email', 'Installation', 'Statut', 'Date', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
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
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                  Aucun devis
                </td>
              </tr>
            ) : quotes.map((q, i) => {
              const { bg, text } = statusStyle(q.status)
              return (
                <tr key={q.id} style={{ background: i % 2 === 0 ? 'white' : 'var(--color-bg)' }}>
                  <td className="px-4 py-3 font-mono text-xs">{q.reference}</td>
                  <td className="px-4 py-3 font-medium">{q.firstName} {q.lastName}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-muted)' }}>{q.email}</td>
                  <td className="px-4 py-3 text-xs">{q.installationType ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: bg, color: text }}>
                      {STATUSES.find((s) => s.value === q.status)?.label ?? q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(q.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openDetail(q)} className="btn-ghost text-xs px-2 py-1">
                      Détails
                    </button>
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
          <button disabled={page + 1 >= (data.totalPages ?? 1)} onClick={() => setPage(page + 1)} className="btn-ghost disabled:opacity-40">Suiv. →</button>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-end" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="h-full w-full max-w-md bg-white overflow-y-auto shadow-xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">{selected.reference}</h2>
              <button onClick={() => setSelected(null)} className="btn-ghost p-1"><X size={18} /></button>
            </div>

            <div className="text-sm space-y-1">
              <p><span className="font-medium">Client :</span> {selected.firstName} {selected.lastName}</p>
              <p><span className="font-medium">Email :</span> {selected.email}</p>
              {selected.phone && <p><span className="font-medium">Tél :</span> {selected.phone}</p>}
              {selected.company && <p><span className="font-medium">Société :</span> {selected.company}</p>}
              {selected.installationType && <p><span className="font-medium">Installation :</span> {selected.installationType}</p>}
            </div>

            <div className="text-sm p-3 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
              <p className="font-medium mb-1">Message</p>
              <p style={{ color: 'var(--color-text-muted)' }}>{selected.message}</p>
            </div>

            {selected.items.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Produits demandés</p>
                <ul className="space-y-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {selected.items.map((item) => (
                    <li key={item.id}>• {item.productName} {item.variantLabel && `— ${item.variantLabel}`} × {item.quantity}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t pt-4 space-y-3" style={{ borderColor: 'var(--color-divider)' }}>
              <div>
                <label className="text-xs font-medium mb-1 block">Statut</label>
                <select
                  className="input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {STATUSES.filter((s) => s.value).map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Notes internes</label>
                <textarea
                  className="input h-auto py-2"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes visibles uniquement par l'équipe…"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="btn-primary w-full disabled:opacity-60"
              >
                {isPending ? 'Enregistrement…' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
