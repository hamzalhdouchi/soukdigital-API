import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/admin',          label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/admin/produits', label: 'Produits',     icon: Package },
  { to: '/admin/commandes',label: 'Commandes',    icon: ShoppingCart },
  { to: '/admin/devis',    label: 'Devis',        icon: FileText },
]

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 flex-shrink-0 border-r flex flex-col"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="h-16 flex items-center px-6 border-b font-display font-bold text-lg"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
          SolarTech Admin
        </div>
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'text-white'
                  : 'hover:bg-surface-alt'
              )}
              style={({ isActive }) => isActive ? { background: 'var(--color-primary)' } : { color: 'var(--color-text-muted)' }}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b flex items-center px-6"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Back-office administrateur
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--color-bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
