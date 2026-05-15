import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: number; message: string; type: ToastType }

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => remove(id), 4000)
  }, [remove])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: 360 }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast: t, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = t.type === 'success' ? CheckCircle : t.type === 'error' ? XCircle : Info
  const color =
    t.type === 'success' ? 'var(--color-success)' :
    t.type === 'error'   ? 'var(--color-error)' :
                           'var(--color-info)'

  return (
    <div
      className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg"
      style={{ background: 'white', border: `1px solid ${color}22` }}
    >
      <Icon size={18} style={{ color, flexShrink: 0, marginTop: 1 }} />
      <p className="flex-1 text-sm font-medium" style={{ color: 'var(--color-text)' }}>{t.message}</p>
      <button onClick={onClose} className="btn-ghost p-0.5" style={{ color: 'var(--color-text-muted)' }}>
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
