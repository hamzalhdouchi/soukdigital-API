import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, FileText, Users, ArrowRight, Clock, AlertCircle } from 'lucide-react'
import api from '@/lib/axios'
import { useAdminQuotes } from '../hooks/useAdminQuotes'
import { useAdminProducts } from '../hooks/useAdminProducts'

interface DashStats {
  totalOrders: number
  pendingOrders: number
  newQuotes: number
  totalProducts: number
  totalUsers: number
}

function useDashStats() {
  return useQuery({
    queryKey: ['admin-dash-stats'],
    queryFn: () =>
      api.get<{ success: boolean; data: DashStats }>('/admin/dashboard/stats').then((r) => r.data.data),
    refetchInterval: 60_000,
  })
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashStats()
  const { data: quotesData } = useAdminQuotes({ status: 'new', size: 5 })
  const { data: productsData } = useAdminProducts({ size: 5 })

  const recentQuotes   = quotesData?.content  ?? []
  const recentProducts = productsData?.content ?? []

  return (
    <div>
      <h1 className="text-xl font-display font-bold mb-6">Tableau de bord</h1>

      {statsError && (
        <div className="flex items-center gap-2 p-4 mb-4 rounded-lg text-sm"
          style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
          <AlertCircle size={16} />
          Impossible de charger les statistiques.
        </div>
      )}

      {/* ── KPI cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={ShoppingBag}
          label="Commandes"
          value={statsLoading ? '…' : String(stats?.totalOrders ?? 0)}
          sub={`${stats?.pendingOrders ?? 0} en attente`}
          color="var(--color-primary)"
        />
        <StatCard
          icon={FileText}
          label="Devis (nouveaux)"
          value={statsLoading ? '…' : String(stats?.newQuotes ?? 0)}
          sub="à traiter"
          color="var(--color-gold)"
        />
        <StatCard
          icon={Package}
          label="Produits"
          value={statsLoading ? '…' : String(stats?.totalProducts ?? 0)}
          sub="dans le catalogue"
          color="var(--color-info)"
        />
        <StatCard
          icon={Users}
          label="Clients"
          value={statsLoading ? '…' : String(stats?.totalUsers ?? 0)}
          sub="comptes créés"
          color="var(--color-success)"
        />
      </div>

      {/* ── Panels ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New quotes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Devis récents</h2>
            <Link to="/admin/devis" className="text-xs flex items-center gap-1"
              style={{ color: 'var(--color-primary)' }}>
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          {recentQuotes.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Aucun devis en attente</p>
          ) : (
            <ul className="space-y-2">
              {recentQuotes.map((q) => (
                <li key={q.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                  style={{ borderColor: 'var(--color-divider)' }}>
                  <div>
                    <p className="font-medium">{q.firstName} {q.lastName}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{q.reference}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <Clock size={11} />
                    {new Date(q.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Products */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Derniers produits</h2>
            <Link to="/admin/produits" className="text-xs flex items-center gap-1"
              style={{ color: 'var(--color-primary)' }}>
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          {recentProducts.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Aucun produit</p>
          ) : (
            <ul className="space-y-2">
              {recentProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                  style={{ borderColor: 'var(--color-divider)' }}>
                  <div>
                    <p className="font-medium line-clamp-1">{p.name}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{p.sku}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
                    {p.productType}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub: string
  color: string
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-display font-bold mb-0.5">{value}</p>
      <p className="text-xs font-semibold">{label}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>
    </div>
  )
}
