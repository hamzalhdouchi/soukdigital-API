import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

const schema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string().min(1, 'Confirmez le mot de passe'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: registerUser, isRegistering, registerError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const passwordValue = watch('password', '')

  const onSubmit = (data: FormData) => {
    registerUser({ firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password })
  }

  const strength = getPasswordStrength(passwordValue)

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">

        {/* Background image */}
        <img
          src="https://images.pexels.com/photos/33757669/pexels-photo-33757669.jpeg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(15,42,74,0.82) 50%, rgba(15,118,110,0.75) 100%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F59E0B' }}>
            <SunIcon />
          </div>
          <span className="text-white text-xl font-bold tracking-tight" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            SolarTech
          </span>
        </div>

        {/* Centre content */}
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Clash Display, sans-serif' }}>
              Rejoignez la communauté solaire
            </h2>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Créez votre compte et accédez à votre tableau de bord, suivez vos commandes et gérez vos installations.
            </p>
          </div>

          {/* Benefits list */}
          <div className="flex flex-col gap-4">
            {BENEFITS.map(b => (
              <div key={b.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: b.bg, boxShadow: b.glow }}>
                  <b.Icon />
                </div>
                <div className="pt-0.5">
                  <div className="text-sm font-semibold text-white">{b.title}</div>
                  <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          © 2026 SolarTech — Énergie propre, avenir brillant
        </p>
      </div>

      {/* ── Right panel : form ──────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 overflow-y-auto"
        style={{ background: '#F8FAFC' }}>

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F59E0B' }}>
            <SunIcon />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: '#0A1628', fontFamily: 'Clash Display, sans-serif' }}>
            SolarTech
          </span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0A1628', fontFamily: 'Clash Display, sans-serif' }}>
              Créer un compte
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>
              Gratuit et sans engagement — rejoignez SolarTech
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prénom" error={errors.firstName?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><UserIcon /></span>
                  <input
                    {...register('firstName')}
                    placeholder="Jean"
                    autoComplete="given-name"
                    className="w-full rounded-xl border pl-10 pr-3 py-3 text-sm outline-none transition-all"
                    style={inputStyle(!!errors.firstName)}
                    onFocus={e => applyFocus(e, !!errors.firstName)}
                    onBlur={e => removeFocus(e, !!errors.firstName)}
                  />
                </div>
              </Field>
              <Field label="Nom" error={errors.lastName?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><UserIcon /></span>
                  <input
                    {...register('lastName')}
                    placeholder="Dupont"
                    autoComplete="family-name"
                    className="w-full rounded-xl border pl-10 pr-3 py-3 text-sm outline-none transition-all"
                    style={inputStyle(!!errors.lastName)}
                    onFocus={e => applyFocus(e, !!errors.lastName)}
                    onBlur={e => removeFocus(e, !!errors.lastName)}
                  />
                </div>
              </Field>
            </div>

            {/* Email */}
            <Field label="Adresse email" error={errors.email?.message}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><MailIcon /></span>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="vous@exemple.fr"
                  autoComplete="email"
                  className="w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={inputStyle(!!errors.email)}
                  onFocus={e => applyFocus(e, !!errors.email)}
                  onBlur={e => removeFocus(e, !!errors.email)}
                />
              </div>
            </Field>

            {/* Password */}
            <Field label="Mot de passe" error={errors.password?.message}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><LockIcon /></span>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères"
                  autoComplete="new-password"
                  className="w-full rounded-xl border pl-10 pr-11 py-3 text-sm outline-none transition-all"
                  style={inputStyle(!!errors.password)}
                  onFocus={e => applyFocus(e, !!errors.password)}
                  onBlur={e => removeFocus(e, !!errors.password)}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
                  style={{ color: '#94A3B8' }}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {/* Strength bar */}
              {passwordValue.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i < strength.score ? strength.color : '#E2E8F0' }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </Field>

            {/* Confirm password */}
            <Field label="Confirmer le mot de passe" error={errors.confirmPassword?.message}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><LockIcon /></span>
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-xl border pl-10 pr-11 py-3 text-sm outline-none transition-all"
                  style={inputStyle(!!errors.confirmPassword)}
                  onFocus={e => applyFocus(e, !!errors.confirmPassword)}
                  onBlur={e => removeFocus(e, !!errors.confirmPassword)}
                />
                <button type="button" onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
                  style={{ color: '#94A3B8' }}>
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </Field>

            {/* API error */}
            {registerError && (
              <div className="flex items-start gap-2 rounded-xl px-4 py-3"
                style={{ background: '#FFF1F2', border: '1px solid #FECDD3' }}>
                <span className="mt-0.5 flex-shrink-0" style={{ color: '#EF4444' }}><ErrorDot /></span>
                <p className="text-sm" style={{ color: '#B91C1C' }}>
                  Une erreur est survenue. Cet email est peut-être déjà utilisé.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isRegistering}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 mt-1"
              style={{
                background: isRegistering ? '#5eaca6' : 'linear-gradient(135deg, #0F766E, #0d9488)',
                boxShadow: isRegistering ? 'none' : '0 4px 14px rgba(15,118,110,0.35)',
                cursor: isRegistering ? 'not-allowed' : 'pointer',
              }}>
              {isRegistering ? <><SpinnerIcon /> Création en cours…</> : 'Créer mon compte'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
              <span className="text-xs" style={{ color: '#94A3B8' }}>ou</span>
              <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
            </div>

            {/* Login link */}
            <p className="text-center text-sm" style={{ color: '#64748B' }}>
              Déjà un compte ?{' '}
              <Link to="/connexion"
                className="font-semibold transition-colors"
                style={{ color: '#0F766E' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F59E0B')}
                onMouseLeave={e => (e.currentTarget.style.color = '#0F766E')}>
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ── Benefit items ────────────────────────────────────────────────── */

const BENEFITS = [
  {
    title: 'Suivi en temps réel',
    desc: 'Production, économies et performance de votre installation',
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.1))',
    glow: '0 0 16px rgba(245,158,11,0.2)',
    Icon: IconChart,
  },
  {
    title: 'Gestion des commandes',
    desc: 'Historique, factures et suivi de livraison',
    bg: 'linear-gradient(135deg, rgba(15,118,110,0.4), rgba(15,118,110,0.15))',
    glow: '0 0 16px rgba(15,118,110,0.25)',
    Icon: IconBox,
  },
  {
    title: 'Support dédié',
    desc: 'Accès prioritaire à notre équipe technique',
    bg: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(99,102,241,0.1))',
    glow: '0 0 16px rgba(99,102,241,0.2)',
    Icon: IconShield,
  },
]

function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function IconBox() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5edfca" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    borderColor: hasError ? '#EF4444' : '#E2E8F0',
    background: 'white',
    color: '#0A1628',
    boxShadow: hasError ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
  }
}

function applyFocus(e: React.FocusEvent<HTMLInputElement>, hasError: boolean) {
  if (!hasError) {
    e.target.style.borderColor = '#0F766E'
    e.target.style.boxShadow = '0 0 0 3px rgba(15,118,110,0.1)'
  }
}

function removeFocus(e: React.FocusEvent<HTMLInputElement>, hasError: boolean) {
  e.target.style.borderColor = hasError ? '#EF4444' : '#E2E8F0'
  e.target.style.boxShadow = hasError ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none'
}

function getPasswordStrength(pwd: string) {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const map = [
    { score: 1, color: '#EF4444', label: 'Très faible' },
    { score: 2, color: '#F59E0B', label: 'Faible' },
    { score: 3, color: '#3B82F6', label: 'Bon' },
    { score: 4, color: '#10B981', label: 'Excellent' },
  ]
  return map[Math.max(0, score - 1)] ?? map[0]
}

/* ── Field wrapper ────────────────────────────────────────────────── */

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: '#374151' }}>{label}</label>
      {children}
      {error && (
        <p className="text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
          <ErrorDot /> {error}
        </p>
      )}
    </div>
  )
}

/* ── Icons ────────────────────────────────────────────────────────── */

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

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
