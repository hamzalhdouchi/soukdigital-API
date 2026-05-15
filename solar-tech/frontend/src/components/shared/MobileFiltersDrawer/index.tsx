import { X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setMobileFiltersOpen } from '@/app/uiSlice'
import type { ProductFilterRequest } from '@/types'

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

interface Props {
  filters: ProductFilterRequest
  applyFilter: <K extends keyof ProductFilterRequest>(key: K, value: ProductFilterRequest[K]) => void
  resetFilters: () => void
  activeFilterCount: number
}

export default function MobileFiltersDrawer({ filters, applyFilter, resetFilters, activeFilterCount }: Props) {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((s) => s.ui.mobileFiltersOpen)

  const close = () => dispatch(setMobileFiltersOpen(false))
  const handleReset = () => { resetFilters(); close() }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={close}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-full bg-white flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}>
          <span className="font-semibold">Filtres {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          <button onClick={close} className="btn-ghost p-1"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Installation type */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-text-muted)' }}>
              Type d'installation
            </p>
            <div className="space-y-2">
              {INSTALL_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="mob-installationType"
                    value={opt.value}
                    checked={filters.installationType === opt.value}
                    onChange={() => applyFilter('installationType', opt.value as typeof filters.installationType)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  {opt.label}
                </label>
              ))}
              {filters.installationType && (
                <button onClick={() => applyFilter('installationType', undefined)}
                  className="text-xs" style={{ color: 'var(--color-primary)' }}>
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Phase */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-text-muted)' }}>
              Phase
            </p>
            <div className="space-y-2">
              {PHASE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="mob-phaseType"
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
                  className="text-xs" style={{ color: 'var(--color-primary)' }}>
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Battery */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-text-muted)' }}>
              Stockage
            </p>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasBattery === true}
                onChange={(e) => applyFilter('hasBattery', e.target.checked ? true : undefined)}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              Avec batterie incluse
            </label>
          </div>
        </div>

        <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={handleReset} className="btn-ghost flex-1">Réinitialiser</button>
          <button onClick={close} className="btn-primary flex-1">Appliquer</button>
        </div>
      </div>
    </>
  )
}
