import { SlidersHorizontal, X, AlertCircle } from 'lucide-react'
import { useCatalog } from '@/features/catalog/hooks/useCatalog'
import { useProductFilters } from '@/features/catalog/hooks/useProductFilters'
import ProductCard, { ProductCardSkeleton } from '@/components/shared/ProductCard'
import MobileFiltersDrawer from '@/components/shared/MobileFiltersDrawer'
import { useAppDispatch } from '@/app/hooks'
import { setMobileFiltersOpen } from '@/app/uiSlice'

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Les plus récents' },
  { value: 'priceTtc,asc',   label: 'Prix croissant' },
  { value: 'priceTtc,desc',  label: 'Prix décroissant' },
  { value: 'name,asc',       label: 'Nom A–Z' },
]

const INSTALL_OPTIONS = [
  { value: 'self_consumption', label: 'Autoconsommation' },
  { value: 'off_grid',         label: 'Site isolé' },
  { value: 'plug_and_play',    label: 'Plug & Play' },
  { value: 'mobility',         label: 'Mobilité' },
]

const PHASE_OPTIONS = [
  { value: 'single_phase', label: 'Monophasé' },
  { value: 'three_phase',  label: 'Triphasé' },
]

export default function CatalogPage() {
  const dispatch = useAppDispatch()
  const { filters, applyFilter, resetFilters, setPage, activeFilterCount } = useProductFilters()
  const { data, isLoading, isError } = useCatalog(filters)

  const products = data?.content ?? []
  const total = data?.totalElements ?? 0

  return (
    <div className="page-container py-8">
      <MobileFiltersDrawer
        filters={filters}
        applyFilter={applyFilter}
        resetFilters={resetFilters}
        activeFilterCount={activeFilterCount}
      />
      <div className="flex gap-8">

        {/* ── Filters sidebar (desktop) ──────────────────────── */}
        <aside className="hidden lg:block w-64 flex-shrink-0 self-start sticky top-20">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-sm">Filtres</span>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="btn-ghost text-xs px-2 py-1 flex items-center gap-1">
                  <X size={12} /> Réinitialiser
                </button>
              )}
            </div>

            {/* Type d'installation */}
            <FilterSection title="Type d'installation">
              {INSTALL_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm py-0.5 cursor-pointer">
                  <input
                    type="radio"
                    name="installationType"
                    value={opt.value}
                    checked={filters.installationType === opt.value}
                    onChange={() => applyFilter('installationType', opt.value as typeof filters.installationType)}
                    className="accent-primary-500"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  {opt.label}
                </label>
              ))}
              {filters.installationType && (
                <button onClick={() => applyFilter('installationType', undefined)}
                  className="text-xs mt-1" style={{ color: 'var(--color-primary)' }}>
                  Effacer
                </button>
              )}
            </FilterSection>

            {/* Phase */}
            <FilterSection title="Phase">
              {PHASE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm py-0.5 cursor-pointer">
                  <input
                    type="radio"
                    name="phaseType"
                    value={opt.value}
                    checked={filters.phaseType === opt.value}
                    onChange={() => applyFilter('phaseType', opt.value as typeof filters.phaseType)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  {opt.label}
                </label>
              ))}
              {filters.phaseType && (
                <button onClick={() => applyFilter('phaseType', undefined)}
                  className="text-xs mt-1" style={{ color: 'var(--color-primary)' }}>
                  Effacer
                </button>
              )}
            </FilterSection>

            {/* Batterie */}
            <FilterSection title="Stockage">
              <label className="flex items-center gap-2 text-sm py-0.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasBattery === true}
                  onChange={(e) => applyFilter('hasBattery', e.target.checked ? true : undefined)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                Avec batterie incluse
              </label>
            </FilterSection>
          </div>
        </aside>

        {/* ── Product grid ───────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(setMobileFiltersOpen(true))}
                className="btn-ghost lg:hidden flex items-center gap-2 text-sm"
              >
                <SlidersHorizontal size={15} />
                Filtres {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {isLoading ? '…' : `${total} produit${total !== 1 ? 's' : ''}`}
              </span>
            </div>

            <select
              className="input w-auto"
              style={{ height: '36px', minHeight: '36px' }}
              value={filters.sort}
              onChange={(e) => applyFilter('sort', e.target.value)}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Grid */}
          {isError ? (
            <div className="flex flex-col items-center py-24 text-center gap-3">
              <AlertCircle size={40} style={{ color: 'var(--color-error)' }} />
              <p className="text-lg font-semibold">Erreur de chargement</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Impossible de récupérer les produits. Vérifiez votre connexion.
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center">
              <p className="text-lg font-semibold mb-2">Aucun produit trouvé</p>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Modifiez vos filtres pour élargir la recherche.
              </p>
              <button onClick={resetFilters} className="btn-secondary">Réinitialiser les filtres</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                disabled={data.first}
                onClick={() => setPage((filters.page ?? 0) - 1)}
                className="btn-ghost disabled:opacity-40"
              >
                ← Précédent
              </button>
              <span className="flex items-center text-sm px-3" style={{ color: 'var(--color-text-muted)' }}>
                Page {(filters.page ?? 0) + 1} / {data.totalPages}
              </span>
              <button
                disabled={data.last}
                onClick={() => setPage((filters.page ?? 0) + 1)}
                className="btn-ghost disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-t" style={{ borderColor: 'var(--color-divider)' }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
        {title}
      </p>
      {children}
    </div>
  )
}
