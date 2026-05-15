import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'

const schema = z.object({
  newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    if (!token) {
      setApiError('Lien invalide. Veuillez refaire une demande de réinitialisation.')
      return
    }
    setLoading(true)
    setApiError(null)
    try {
      await authService.resetPassword(token, data.newPassword)
      navigate('/connexion?reset=ok')
    } catch {
      setApiError('Lien invalide ou expiré. Veuillez refaire une demande.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <img
          src="https://images.pexels.com/photos/9893729/pexels-photo-9893729.jpeg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(15,42,74,0.82) 50%, rgba(15,118,110,0.75) 100%)' }} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F59E0B' }}>
            <SunIcon />
          </div>
          <span className="text-white text-xl font-bold tracking-tight" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            SolarTech
          </span>
        </div>
        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            Nouveau mot de passe
          </h2>
          <p className="text-base leading-relaxed max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Choisissez un mot de passe fort d'au moins 8 caractères pour sécuriser votre compte.
          </p>
        </div>
        <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          © 2026 SolarTech — Énergie propre, avenir brillant
        </p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24"
        style={{ background: '#F8FAFC' }}>

        <div className="flex lg:hidden items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F59E0B' }}>
            <SunIcon />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: '#0A1628', fontFamily: 'Clash Display, sans-serif' }}>
            SolarTech
          </span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          {!token ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(239,68,68,0.1)' }}>
                <AlertIcon />
              </div>
              <h1 className="text-2xl font-bold mb-3" style={{ color: '#0A1628', fontFamily: 'Clash Display, sans-serif' }}>
                Lien invalide
              </h1>
              <p className="text-sm mb-8" style={{ color: '#64748B' }}>
                Ce lien de réinitialisation est invalide ou a expiré.
              </p>
              <Link to="/mot-de-passe-oublie"
                className="text-sm font-medium transition-colors"
                style={{ color: '#0F766E' }}>
                Refaire une demande
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A1628', fontFamily: 'Clash Display, sans-serif' }}>
                  Nouveau mot de passe
                </h1>
                <p className="text-sm" style={{ color: '#64748B' }}>
                  Choisissez un nouveau mot de passe pour votre compte.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                {/* New password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: '#374151' }}>
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <LockIcon />
                    </span>
                    <input
                      {...register('newPassword')}
                      type={showNew ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full rounded-xl border pl-10 pr-11 py-3 text-sm outline-none transition-all"
                      style={{
                        borderColor: errors.newPassword ? '#EF4444' : '#E2E8F0',
                        background: 'white',
                        color: '#0A1628',
                      }}
                      onFocus={e => { if (!errors.newPassword) e.target.style.borderColor = '#0F766E'; e.target.style.boxShadow = '0 0 0 3px rgba(15,118,110,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = errors.newPassword ? '#EF4444' : '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                    />
                    <button type="button" onClick={() => setShowNew(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded"
                      style={{ color: '#94A3B8' }}>
                      {showNew ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs" style={{ color: '#EF4444' }}>{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: '#374151' }}>
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <LockIcon />
                    </span>
                    <input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full rounded-xl border pl-10 pr-11 py-3 text-sm outline-none transition-all"
                      style={{
                        borderColor: errors.confirmPassword ? '#EF4444' : '#E2E8F0',
                        background: 'white',
                        color: '#0A1628',
                      }}
                      onFocus={e => { if (!errors.confirmPassword) e.target.style.borderColor = '#0F766E'; e.target.style.boxShadow = '0 0 0 3px rgba(15,118,110,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = errors.confirmPassword ? '#EF4444' : '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded"
                      style={{ color: '#94A3B8' }}>
                      {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs" style={{ color: '#EF4444' }}>{errors.confirmPassword.message}</p>
                  )}
                </div>

                {apiError && (
                  <div className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: '#FFF1F2', border: '1px solid #FECDD3', color: '#B91C1C' }}>
                    {apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    background: loading ? '#5eaca6' : 'linear-gradient(135deg, #0F766E, #0d9488)',
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(15,118,110,0.35)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}>
                  {loading ? <><SpinnerIcon /> Enregistrement…</> : 'Enregistrer le mot de passe'}
                </button>

                <p className="text-center text-sm" style={{ color: '#64748B' }}>
                  <Link to="/connexion"
                    className="inline-flex items-center gap-1.5 font-medium transition-colors"
                    style={{ color: '#0F766E' }}>
                    <ArrowLeftIcon />
                    Retour à la connexion
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
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
function AlertIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
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
