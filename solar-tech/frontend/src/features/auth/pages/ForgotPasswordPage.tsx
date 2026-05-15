import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'

const schema = z.object({
  email: z.string().email('Email invalide'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setApiError(null)
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
    } catch {
      setApiError('Une erreur est survenue. Veuillez réessayer.')
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
            Réinitialisation sécurisée
          </h2>
          <p className="text-base leading-relaxed max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Vous recevrez un lien valable 1 heure pour choisir un nouveau mot de passe.
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
          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(15,118,110,0.1)' }}>
                <CheckIcon />
              </div>
              <h1 className="text-2xl font-bold mb-3" style={{ color: '#0A1628', fontFamily: 'Clash Display, sans-serif' }}>
                Email envoyé !
              </h1>
              <p className="text-sm leading-relaxed mb-2" style={{ color: '#64748B' }}>
                Si un compte est associé à{' '}
                <span className="font-medium" style={{ color: '#0A1628' }}>{getValues('email')}</span>,
                vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="text-xs mb-8" style={{ color: '#94A3B8' }}>
                Vérifiez aussi votre dossier spam.
              </p>
              <Link to="/connexion"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: '#0F766E' }}>
                <ArrowLeftIcon />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A1628', fontFamily: 'Clash Display, sans-serif' }}>
                  Mot de passe oublié
                </h1>
                <p className="text-sm" style={{ color: '#64748B' }}>
                  Entrez votre email pour recevoir un lien de réinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
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
                      }}
                      onFocus={e => { if (!errors.email) e.target.style.borderColor = '#0F766E'; e.target.style.boxShadow = '0 0 0 3px rgba(15,118,110,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = errors.email ? '#EF4444' : '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs" style={{ color: '#EF4444' }}>{errors.email.message}</p>
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
                  {loading ? <><SpinnerIcon /> Envoi en cours…</> : 'Envoyer le lien'}
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
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
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
