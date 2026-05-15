import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth()
  const [searchParams] = useSearchParams()
  const passwordReset = searchParams.get('reset') === 'ok'
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel : visual / branding ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">

        {/* Background image */}
        <img
          src="https://images.pexels.com/photos/9893729/pexels-photo-9893729.jpeg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(15,42,74,0.82) 50%, rgba(15,118,110,0.75) 100%)' }} />

        {/* Logo / brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#F59E0B' }}>
            <SunIcon />
          </div>
          <span className="text-white text-xl font-bold tracking-tight" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            SolarTech
          </span>
        </div>

        {/* Centre content */}
        <div className="relative z-10 flex flex-col items-center text-center gap-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Clash Display, sans-serif' }}>
              Passez à l'énergie solaire
            </h2>
            <p className="text-base leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Gérez vos installations, suivez votre production et économisez sur votre facture d'électricité.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-8">
            {[
              { value: '10 000+', label: 'Clients' },
              { value: '98%', label: 'Satisfaction' },
              { value: '50 MW', label: 'Installés' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          © 2026 SolarTech — Énergie propre, avenir brillant
        </p>
      </div>

      {/* ── Right panel : form ──────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24"
        style={{ background: '#F8FAFC' }}>

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F59E0B' }}>
            <SunIcon />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: '#0A1628', fontFamily: 'Clash Display, sans-serif' }}>
            SolarTech
          </span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          {/* Password-reset success banner */}
          {passwordReset && (
            <div className="mb-6 flex items-start gap-2 rounded-xl px-4 py-3"
              style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <span style={{ color: '#16A34A', flexShrink: 0, marginTop: 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <p className="text-sm" style={{ color: '#15803D' }}>
                Mot de passe réinitialisé avec succès. Connectez-vous.
              </p>
            </div>
          )}

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A1628', fontFamily: 'Clash Display, sans-serif' }}>
              Bon retour
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>
              Connectez-vous à votre espace client
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit((data) => login(data))} noValidate className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: '#374151' }}>
                Adresse email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <MailIcon />
                </span>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="vous@exemple.fr"
                  autoComplete="email"
                  className="w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={{
                    borderColor: errors.email ? '#EF4444' : '#E2E8F0',
                    background: 'white',
                    color: '#0A1628',
                    boxShadow: errors.email ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
                  }}
                  onFocus={e => { if (!errors.email) e.target.style.borderColor = '#0F766E'; e.target.style.boxShadow = '0 0 0 3px rgba(15,118,110,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = errors.email ? '#EF4444' : '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              {errors.email && (
                <p className="text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                  <ErrorDot /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: '#374151' }}>
                  Mot de passe
                </label>
                <Link to="/mot-de-passe-oublie" className="text-xs font-medium transition-colors"
                  style={{ color: '#0F766E' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#0d6561')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#0F766E')}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <LockIcon />
                </span>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border pl-10 pr-11 py-3 text-sm outline-none transition-all"
                  style={{
                    borderColor: errors.password ? '#EF4444' : '#E2E8F0',
                    background: 'white',
                    color: '#0A1628',
                    boxShadow: errors.password ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
                  }}
                  onFocus={e => { if (!errors.password) e.target.style.borderColor = '#0F766E'; e.target.style.boxShadow = '0 0 0 3px rgba(15,118,110,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = errors.password ? '#EF4444' : '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
                  style={{ color: '#94A3B8' }}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                  <ErrorDot /> {errors.password.message}
                </p>
              )}
            </div>

            {/* API error */}
            {loginError && (
              <div className="flex items-start gap-2 rounded-xl px-4 py-3"
                style={{ background: '#FFF1F2', border: '1px solid #FECDD3' }}>
                <span className="mt-0.5 flex-shrink-0" style={{ color: '#EF4444' }}><ErrorDot /></span>
                <p className="text-sm" style={{ color: '#B91C1C' }}>
                  Email ou mot de passe incorrect. Veuillez réessayer.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 mt-1"
              style={{
                background: isLoggingIn ? '#5eaca6' : 'linear-gradient(135deg, #0F766E, #0d9488)',
                boxShadow: isLoggingIn ? 'none' : '0 4px 14px rgba(15,118,110,0.35)',
                cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              }}>
              {isLoggingIn
                ? <><SpinnerIcon /> Connexion en cours…</>
                : 'Se connecter'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
              <span className="text-xs" style={{ color: '#94A3B8' }}>ou</span>
              <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
            </div>

            {/* Register link */}
            <p className="text-center text-sm" style={{ color: '#64748B' }}>
              Pas encore de compte ?{' '}
              <Link to="/inscription"
                className="font-semibold transition-colors"
                style={{ color: '#0F766E' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F59E0B')}
                onMouseLeave={e => (e.currentTarget.style.color = '#0F766E')}>
                Créer un compte gratuitement
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ── Inline SVG icons ─────────────────────────────────────────────── */

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function ErrorDot() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="12" opacity="0.15" />
      <circle cx="12" cy="12" r="5" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  )
}
