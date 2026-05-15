export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Chargement…</span>
      </div>
    </div>
  )
}
