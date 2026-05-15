import { useState, useRef, useEffect } from 'react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Sun, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'
import { cn } from '@/lib/utils'
import CompareBar from '@/components/shared/CompareBar'

const NAV_LINKS = [
  { to: '/fr/kits-solaires', label: 'Catalogue' },
  { to: '/fr/simulateur',    label: 'Simulateur' },
  { to: '/fr/devis',         label: 'Devis gratuit' },
]

export default function MainLayout() {
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled]       = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const dispatch   = useAppDispatch()
  const navigate   = useNavigate()
  const user       = useAppSelector((s) => s.auth.user)
  const cartCount  = useAppSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0))
  const isAdmin    = user?.roles?.some((r) => r === 'ROLE_ADMIN' || r === 'ROLE_SUPER_ADMIN')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>

      {/* ── Promo bar ─────────────────────────────────── */}
      <div className="text-center text-xs py-2 hidden sm:block"
        style={{ background: 'var(--color-dark)', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em' }}>
        <span style={{ color: 'var(--color-primary)' }}>✦</span>
        {' '}Livraison express 48h · Support technique expert · Garantie 25 ans panneaux{' '}
        <span style={{ color: 'var(--color-primary)' }}>✦</span>
      </div>

      {/* ── Header ────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 bg-white border-b transition-shadow duration-300"
        style={{
          borderColor: 'var(--color-border)',
          boxShadow: scrolled ? '0 4px 20px rgba(15,23,42,0.08)' : 'none',
        }}
      >
        <div className="page-container flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0"
            style={{ textDecoration: 'none' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}>
              <Sun size={18} color="white" strokeWidth={2.2} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight"
              style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
              Solar<span style={{ color: 'var(--color-primary)' }}>Tech</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => cn(
                  'relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                  isActive
                    ? 'text-primary-DEFAULT'
                    : 'hover:bg-surface-alt'
                )}
                style={({ isActive }) => ({
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  background: isActive ? 'var(--color-primary-light)' : undefined,
                })}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 ml-auto">

            {/* Cart */}
            <Link
              to="/panier"
              className="relative btn-ghost p-2.5 flex items-center justify-center rounded-lg"
              aria-label="Panier"
            >
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white font-bold flex items-center justify-center"
                  style={{ background: 'var(--color-primary)', fontSize: '9px' }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 btn-ghost px-3 py-2 text-sm font-medium rounded-lg"
                >
                  <User size={16} />
                  <span className="hidden sm:block">{user.firstName}</span>
                  <ChevronDown size={13} className={cn('transition-transform duration-200', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-xl py-1.5 z-50"
                    style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-lg)' }}
                  >
                    <Link to="/compte" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--color-surface-alt)] rounded-lg mx-1">
                      <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                      Mon compte
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--color-surface-alt)] rounded-lg mx-1">
                        <LayoutDashboard size={14} style={{ color: 'var(--color-text-muted)' }} />
                        Administration
                      </Link>
                    )}
                    <hr className="my-1.5" style={{ borderColor: 'var(--color-divider)' }} />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--color-surface-alt)] text-left rounded-lg mx-1"
                      style={{ color: 'var(--color-error)', width: 'calc(100% - 8px)' }}
                    >
                      <LogOut size={14} /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/connexion" className="btn-primary py-2 px-4 text-sm hidden sm:flex items-center gap-1.5 rounded-lg">
                <User size={14} /> Connexion
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-ghost p-2.5 md:hidden rounded-lg"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t px-4 py-3 flex flex-col gap-0.5"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 text-sm font-medium rounded-lg transition-colors hover:bg-[var(--color-surface-alt)]"
                style={{ color: 'var(--color-text)' }}>
                {l.label}
              </Link>
            ))}
            <div className="my-1 border-t" style={{ borderColor: 'var(--color-divider)' }} />
            {!user ? (
              <Link to="/connexion" onClick={() => setMobileOpen(false)}
                className="btn-primary w-full text-center mt-1">
                Connexion
              </Link>
            ) : (
              <>
                <Link to="/compte" onClick={() => setMobileOpen(false)}
                  className="py-2.5 px-3 text-sm font-medium flex items-center gap-2 rounded-lg transition-colors hover:bg-[var(--color-surface-alt)]"
                  style={{ color: 'var(--color-text)' }}>
                  <User size={15} /> Mon compte
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}
                    className="py-2.5 px-3 text-sm font-medium flex items-center gap-2 rounded-lg transition-colors hover:bg-[var(--color-surface-alt)]"
                    style={{ color: 'var(--color-text)' }}>
                    <LayoutDashboard size={15} /> Administration
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="py-2.5 px-3 text-sm font-medium flex items-center gap-2 text-left w-full rounded-lg transition-colors hover:bg-[var(--color-surface-alt)]"
                  style={{ color: 'var(--color-error)' }}>
                  <LogOut size={15} /> Déconnexion
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* ── Page content ─────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      <CompareBar />

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t" style={{ borderColor: 'var(--color-border)' }}>

        {/* Top band */}
        <div style={{ background: 'var(--color-dark)' }}>
          <div className="page-container py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center"
                    style={{ background: 'var(--color-primary)' }}>
                    <Sun size={15} color="white" />
                  </div>
                  <span className="font-display font-bold text-lg text-white tracking-tight"
                    style={{ letterSpacing: '-0.025em' }}>
                    Solar<span style={{ color: 'var(--color-primary)' }}>Tech</span>
                  </span>
                </div>
                <p className="text-sm max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Votre spécialiste kits solaires — autoconsommation, site isolé, plug &amp; play.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/fr/devis"
                  className="btn-primary py-2.5 px-5 text-sm"
                  style={{ boxShadow: '0 0 20px rgba(15,118,110,0.35)' }}>
                  Demander un devis
                </Link>
                <Link to="/fr/kits-solaires" className="btn-hero-ghost py-2.5 px-5 text-sm">
                  Voir le catalogue
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div style={{ background: 'var(--color-surface)' }}>
          <div className="page-container py-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-4"
                  style={{ color: 'var(--color-primary)', letterSpacing: '0.1em' }}>Catalogue</p>
                <ul className="space-y-2.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <li><Link to="/fr/kits-solaires" className="hover:text-[var(--color-text)] transition-colors">Kits solaires</Link></li>
                  <li><Link to="/fr/batteries"     className="hover:text-[var(--color-text)] transition-colors">Batteries</Link></li>
                  <li><Link to="/fr/onduleurs"      className="hover:text-[var(--color-text)] transition-colors">Onduleurs</Link></li>
                  <li><Link to="/fr/accessoires"    className="hover:text-[var(--color-text)] transition-colors">Accessoires</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-4"
                  style={{ color: 'var(--color-primary)', letterSpacing: '0.1em' }}>Solutions</p>
                <ul className="space-y-2.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <li><Link to="/fr/kits-solaires" className="hover:text-[var(--color-text)] transition-colors">Autoconsommation</Link></li>
                  <li><Link to="/fr/site-isole"    className="hover:text-[var(--color-text)] transition-colors">Site isolé</Link></li>
                  <li><Link to="/fr/plug-and-play" className="hover:text-[var(--color-text)] transition-colors">Plug &amp; Play</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-4"
                  style={{ color: 'var(--color-primary)', letterSpacing: '0.1em' }}>Services</p>
                <ul className="space-y-2.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <li><Link to="/fr/devis"      className="hover:text-[var(--color-text)] transition-colors">Devis gratuit</Link></li>
                  <li><Link to="/fr/simulateur" className="hover:text-[var(--color-text)] transition-colors">Simulateur</Link></li>
                  <li><Link to="/compte"        className="hover:text-[var(--color-text)] transition-colors">Mon compte</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-4"
                  style={{ color: 'var(--color-primary)', letterSpacing: '0.1em' }}>Contact</p>
                <ul className="space-y-2.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <li>contact@solartech.fr</li>
                  <li>+33 1 23 45 67 89</li>
                  <li>Lun–Ven 9h–18h</li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
              style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text-faint)' }}>
              <span>© {new Date().getFullYear()} SolarTech — Tous droits réservés</span>
              <span>TVA française · Livraison France, Belgique, Luxembourg, Maroc</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
