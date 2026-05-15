import { Link } from 'react-router-dom'
import { GitCompare, X } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { removeFromCompare, clearCompare } from '@/features/catalog/compareSlice'
import { useCatalog } from '@/features/catalog/hooks/useCatalog'

export default function CompareBar() {
  const dispatch = useAppDispatch()
  const ids = useAppSelector((s) => s.compare.productIds)

  if (ids.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 shadow-lg border-t"
      style={{ background: 'white', borderColor: 'var(--color-border)' }}>
      <div className="page-container py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-semibold flex-shrink-0">
          <GitCompare size={16} style={{ color: 'var(--color-primary)' }} />
          Comparer ({ids.length}/4)
        </div>

        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {ids.map((id) => (
            <CompareChip key={id} productId={id} onRemove={() => dispatch(removeFromCompare(id))} />
          ))}
          {Array.from({ length: 4 - ids.length }).map((_, i) => (
            <div key={i}
              className="h-9 w-32 rounded-lg border-2 border-dashed flex items-center justify-center text-xs"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              + Ajouter
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {ids.length >= 2 && (
            <Link
              to={`/fr/comparer?ids=${ids.join(',')}`}
              className="btn-primary py-1.5 px-4 text-sm"
            >
              Comparer
            </Link>
          )}
          <button onClick={() => dispatch(clearCompare())} className="btn-ghost py-1.5 px-3 text-sm">
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

function CompareChip({ productId, onRemove }: { productId: number; onRemove: () => void }) {
  const { data } = useCatalog({ page: 0, size: 100 } as any)
  const product = data?.content.find((p) => p.id === productId)

  return (
    <div className="h-9 flex items-center gap-1.5 px-3 rounded-lg border text-xs font-medium"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-alt)' }}>
      <span className="max-w-28 truncate">{product?.name ?? `#${productId}`}</span>
      <button onClick={onRemove} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={12} />
      </button>
    </div>
  )
}
