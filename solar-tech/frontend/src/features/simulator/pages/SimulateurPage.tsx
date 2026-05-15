import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun, Home, Compass, Plug, MapPin, Zap, TrendingUp,
  ChevronRight, ChevronLeft, CheckCircle2, ArrowRight, Leaf,
  BarChart3, Clock, Star, Phone, Sparkles,
  ShieldCheck, Headset, Award,
  User, Users, Building2, Castle, Factory,
  Navigation, ArrowUpRight, ArrowLeftRight,
  BatteryFull, BatteryLow, HelpCircle, RotateCcw,
  Download, FileText,
} from 'lucide-react'
import jsPDF from 'jspdf'

/* ─── Types ─────────────────────────────────────────────────── */

type InstallType = 'self_consumption' | 'off_grid' | 'plug_play'
type Phase       = 'mono' | 'tri'
type Orientation = 'south' | 'south_east' | 'east_west'
type BatteryOpt  = 'yes' | 'no' | 'maybe'

interface SimData {
  installType:  InstallType | null
  consumption:  number
  region:       string
  surface:      number
  orientation:  Orientation
  phase:        Phase
  battery:      BatteryOpt
}

/* ─── Solar data ─────────────────────────────────────────────── */

const REGIONS: { label: string; irr: number }[] = [
  { label: 'Nord — Hauts-de-France',         irr: 870  },
  { label: 'Normandie',                       irr: 950  },
  { label: 'Bretagne',                        irr: 960  },
  { label: 'Île-de-France',                   irr: 990  },
  { label: 'Grand Est — Alsace',              irr: 1010 },
  { label: 'Pays de la Loire',                irr: 1060 },
  { label: 'Bourgogne — Centre',              irr: 1070 },
  { label: 'Nouvelle-Aquitaine',              irr: 1160 },
  { label: 'Auvergne — Rhône-Alpes',          irr: 1120 },
  { label: 'Occitanie',                       irr: 1270 },
  { label: 'PACA — Côte d\'Azur',             irr: 1380 },
  { label: 'Corse',                           irr: 1430 },
  { label: 'Maroc — Nord (Tanger / Rabat)',   irr: 1550 },
  { label: 'Maroc — Centre (Casablanca)',     irr: 1680 },
  { label: 'Maroc — Sud (Marrakech / Agadir)',irr: 1820 },
]

const ORIENT_FACTOR: Record<Orientation, number> = {
  south:      1.00,
  south_east: 0.95,
  east_west:  0.85,
}

const CONSUMPTION_PRESETS: { label: string; value: number; icon: React.ReactNode; color: string }[] = [
  { label: 'Studio / 1 pers.',      value: 1800,  icon: <User size={18} />,      color: '#0369A1' },
  { label: 'Appartement 2–3 pers.', value: 3200,  icon: <Users size={18} />,     color: '#0F766E' },
  { label: 'Maison 4 pers.',         value: 5000,  icon: <Home size={18} />,      color: '#D97706' },
  { label: 'Grande maison',          value: 8000,  icon: <Castle size={18} />,    color: '#7C3AED' },
  { label: 'Professionnel',          value: 15000, icon: <Building2 size={18} />, color: '#E11D48' },
]

/* ─── Calculation engine ─────────────────────────────────────── */

function calculate(data: SimData) {
  const region     = REGIONS.find(r => r.label === data.region) ?? REGIONS[3]
  const irr        = region.irr * ORIENT_FACTOR[data.orientation]
  const efficiency = data.installType === 'off_grid' ? 0.6 : 0.8

  // kWc needed
  const kwcNeeded   = Math.max(1, data.consumption * efficiency / irr)
  // Round to sensible kit size
  const kwcRounded  = Math.ceil(kwcNeeded * 2) / 2

  const panelCount     = Math.ceil(kwcRounded / 0.45)
  const annualProd     = Math.round(kwcRounded * irr)
  const selfConsumed   = data.installType === 'off_grid'
    ? annualProd * 0.95
    : Math.min(annualProd * 0.7, data.consumption)
  const elecPrice      = 1.30 // MAD/kWh (tarif ONEE Maroc)
  const annualSavings  = Math.round(selfConsumed * elecPrice)
  const co2Avoided     = Math.round(annualProd * 0.053) // kg CO2
  const kitCostApprox  = Math.round(kwcRounded * 12000) // MAD/kWc
  const payback        = Math.round((kitCostApprox / annualSavings) * 10) / 10
  const lifeGain       = Math.round(annualSavings * 25 - kitCostApprox)

  return { kwcRounded, panelCount, annualProd, annualSavings, co2Avoided, kitCostApprox, payback, lifeGain, irr: Math.round(irr) }
}

/* ─── PDF-safe helpers (ASCII only — no U+00A0, no diacritics) ─ */

const pdfN   = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
const pdfMAD = (n: number) => `${pdfN(n)} MAD`
const pdfDate = () => {
  const d = new Date()
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}
// Strip diacritics so jsPDF Helvetica renders cleanly
const safe = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[—–]/g, '-')

/* ─── PDF generator ──────────────────────────────────────────── */

const INSTALL_LABELS: Record<string, string> = {
  self_consumption: 'Autoconsommation',
  off_grid:         'Site isolé (off-grid)',
  plug_play:        'Plug & Play',
}
const ORIENT_LABELS: Record<string, string> = {
  south: 'Plein sud', south_east: 'Sud-Est / Ouest', east_west: 'Est / Ouest',
}
const BATTERY_LABELS: Record<string, string> = {
  yes: 'Oui', no: 'Non', maybe: 'À étudier',
}

function generatePDF(data: SimData, result: ReturnType<typeof calculate>) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const teal   = [15, 118, 110] as [number, number, number]
  const gold   = [245, 158, 11] as [number, number, number]
  const dark   = [10, 22, 40]  as [number, number, number]
  const muted  = [71, 85, 105] as [number, number, number]
  const light  = [241, 245, 249] as [number, number, number]
  const white  = [255, 255, 255] as [number, number, number]

  /* ── Header banner ── */
  doc.setFillColor(...teal)
  doc.rect(0, 0, W, 42, 'F')

  // Decorative circle top-right
  doc.setFillColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.06 }))
  doc.circle(W - 10, -10, 45, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...white)
  doc.text('RAPPORT DE SIMULATION SOLAIRE', 14, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(204, 251, 241)
  doc.text('SolarTech Maroc - Simulation personnalisee', 14, 26)
  doc.text(`Genere le ${pdfDate()}`, 14, 33)

  // Gold accent bar
  doc.setFillColor(...gold)
  doc.rect(0, 42, W, 3, 'F')

  /* ── Section: Paramètres ── */
  let y = 56
  const sectionHeader = (title: string, yPos: number) => {
    doc.setFillColor(...light)
    doc.roundedRect(14, yPos - 5, W - 28, 9, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...teal)
    doc.text(title.toUpperCase(), 18, yPos + 1)
    return yPos + 10
  }

  const row = (label: string, value: string, yPos: number, highlight = false) => {
    if (highlight) {
      doc.setFillColor(204, 251, 241)
      doc.rect(14, yPos - 4, W - 28, 8, 'F')
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...muted)
    doc.text(label, 18, yPos)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...dark)
    doc.text(value, W - 14, yPos, { align: 'right' })
    return yPos + 8
  }

  y = sectionHeader('Vos parametres', y)
  y = row("Type d'installation", safe(INSTALL_LABELS[data.installType ?? ''] ?? '-'), y)
  y = row('Consommation annuelle', `${pdfN(data.consumption)} kWh/an`, y)
  y = row('Region / Zone', safe(data.region), y)
  y = row('Irradiation locale', `${result.irr} kWh/kWc/an`, y)
  y = row('Orientation du toit', safe(ORIENT_LABELS[data.orientation]), y)
  y = row('Type de reseau', data.phase === 'mono' ? 'Monophase' : 'Triphase', y)
  y = row('Batterie de stockage', safe(BATTERY_LABELS[data.battery]), y)

  y += 8
  /* ── Section: Résultats ── */
  y = sectionHeader('Resultats de la simulation', y)

  // Big kit size highlight box
  doc.setFillColor(...teal)
  doc.roundedRect(14, y, W - 28, 22, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...white)
  doc.text('Kit recommande :', 20, y + 8)
  doc.setFontSize(18)
  doc.text(`${result.kwcRounded.toFixed(1)} kWc`, 20, y + 18)
  doc.setFontSize(10)
  doc.text(`${result.panelCount} panneaux × 450 Wc`, W - 20, y + 14, { align: 'right' })
  y += 28

  y = row('Production annuelle estimee', `${pdfN(result.annualProd)} kWh`, y, true)
  y = row('Economies annuelles (1,30 MAD/kWh)', pdfMAD(result.annualSavings), y)
  y = row("Cout d'installation approximatif", pdfMAD(result.kitCostApprox), y, true)
  y = row('Retour sur investissement', `${result.payback.toFixed(1)} ans`, y)
  y = row('CO2 evite par an', `${pdfN(result.co2Avoided)} kg`, y, true)
  y = row('Gain net sur 25 ans', pdfMAD(Math.max(0, result.lifeGain)), y)

  y += 8
  /* ── Section: Production mensuelle ── */
  y = sectionHeader('Production mensuelle estimee', y)
  const months  = ['Jan','Feb','Mar','Avr','Mai','Jun','Jul','Aou','Sep','Oct','Nov','Dec']
  const factors = [0.45,0.55,0.75,0.90,1.05,1.10,1.15,1.10,0.95,0.75,0.50,0.40]
  const total   = factors.reduce((a, b) => a + b, 0)
  const values  = factors.map(f => Math.round((result.annualProd * f) / total))
  const maxVal  = Math.max(...values)
  const barW    = (W - 28 - 11) / 12
  const barMaxH = 28

  values.forEach((v, i) => {
    const bh = (v / maxVal) * barMaxH
    const bx = 14 + i * (barW + 1)
    const by = y + barMaxH - bh

    const isSummer = i >= 4 && i <= 8
    if (isSummer) doc.setFillColor(...gold)
    else          doc.setFillColor(...teal)
    doc.roundedRect(bx, by, barW, bh, 1, 1, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(...muted)
    doc.text(months[i], bx + barW / 2, y + barMaxH + 5, { align: 'center' })
  })
  y += barMaxH + 12

  /* ── Footer ── */
  doc.setFillColor(...dark)
  doc.rect(0, 282, W, 15, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text('SolarTech Maroc - Estimation indicative. Les resultats reels dependent de l\'ensoleillement et de l\'installation.', W / 2, 290, { align: 'center' })
  doc.text('www.solartech.ma  ·  contact@solartech.ma  ·  +212 5XX XXX XXX', W / 2, 294, { align: 'center' })

  doc.save(`simulation-solaire-${new Date().toISOString().slice(0, 10)}.pdf`)
}

/* ─── Animated counter ───────────────────────────────────────── */

function Counter({ to, duration = 1400, prefix = '', suffix = '', decimals = 0 }: {
  to: number; duration?: number; prefix?: string; suffix?: string; decimals?: number
}) {
  const [val, setVal] = useState(0)
  const start = useRef(Date.now())

  useEffect(() => {
    start.current = Date.now()
    let raf: number
    const tick = () => {
      const elapsed = Date.now() - start.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(to * eased * Math.pow(10, decimals)) / Math.pow(10, decimals))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration, decimals])

  const fmt = decimals > 0 ? val.toFixed(decimals) : val.toLocaleString('fr-FR')
  return <>{prefix}{fmt}{suffix}</>
}

/* ─── Progress bar ───────────────────────────────────────────── */

const STEPS = ['Usage', 'Consommation', 'Localisation', 'Configuration', 'Résultats']

function StepBar({ current }: { current: number }) {
  return (
    <div className="relative flex items-center justify-between mb-10">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5" style={{ background: 'var(--color-divider)' }} />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-700 ease-out"
        style={{ background: 'var(--color-primary)', width: `${(current / (STEPS.length - 1)) * 100}%` }}
      />
      {STEPS.map((label, i) => {
        const done    = i < current
        const active  = i === current
        return (
          <div key={label} className="relative flex flex-col items-center gap-2">
            <div
              className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold border-2 transition-all duration-500"
              style={{
                background:   done || active ? 'var(--color-primary)' : 'var(--color-surface)',
                borderColor:  done || active ? 'var(--color-primary)' : 'var(--color-border)',
                color:        done || active ? '#fff' : 'var(--color-text-faint)',
                boxShadow:    active ? 'var(--shadow-teal)' : 'none',
                transform:    active ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              {done ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            <span className="hidden sm:block text-xs font-medium" style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-faint)' }}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Step card wrapper ──────────────────────────────────────── */

function StepCard({ children, visible }: { children: React.ReactNode; visible: boolean }) {
  return (
    <div
      className="transition-all duration-500"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      {children}
    </div>
  )
}

/* ─── Select card ────────────────────────────────────────────── */

function SelectCard({
  icon, title, subtitle, selected, onClick, color = 'var(--color-primary)',
}: {
  icon: React.ReactNode; title: string; subtitle: string
  selected: boolean; onClick: () => void; color?: string
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 group hover:scale-[1.02]"
      style={{
        borderColor: selected ? color : 'var(--color-border)',
        background:  selected ? `${color}10` : 'var(--color-surface)',
        boxShadow:   selected ? `0 0 0 3px ${color}30` : 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ background: selected ? color : 'var(--color-surface-alt)', color: selected ? '#fff' : color }}
        >
          {icon}
        </div>
        <div>
          <div className="font-bold text-base leading-tight mb-0.5" style={{ color: 'var(--color-text)' }}>{title}</div>
          <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</div>
        </div>
        <div className="ml-auto flex-shrink-0">
          <div
            className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
            style={{ borderColor: selected ? color : 'var(--color-border)', background: selected ? color : 'transparent' }}
          >
            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </div>
      </div>
    </button>
  )
}

/* ─── Result metric card ─────────────────────────────────────── */

function MetricCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; color: string
}) {
  return (
    <div
      className="rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02]"
      style={{ background: `${color}08`, borderColor: `${color}25`, boxShadow: `0 4px 16px ${color}15` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20`, color }}>
          {icon}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      </div>
      <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)', fontFamily: "'Clash Display', sans-serif" }}>
        {value}
      </div>
      {sub && <div className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{sub}</div>}
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────── */

export default function SimulateurPage() {
  const [step, setStep]       = useState(0)
  const [visible, setVisible] = useState(true)
  const [data, setData]       = useState<SimData>({
    installType:  null,
    consumption:  5000,
    region:       'Île-de-France',
    surface:      30,
    orientation:  'south',
    phase:        'mono',
    battery:      'maybe',
  })
  const [result, setResult] = useState<ReturnType<typeof calculate> | null>(null)

  const transition = (newStep: number) => {
    setVisible(false)
    setTimeout(() => {
      setStep(newStep)
      setVisible(true)
      if (newStep === 4) setResult(calculate(data))
    }, 320)
  }

  const next = () => transition(step + 1)
  const prev = () => transition(step - 1)

  const set = <K extends keyof SimData>(k: K, v: SimData[K]) =>
    setData(d => ({ ...d, [k]: v }))

  const canNext = [
    !!data.installType,
    data.consumption > 0,
    !!data.region,
    true,
  ]

  return (
    <div style={{ background: 'var(--color-bg)' }}>

      {/* ── Hero ──────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0F2A4A 60%, #0F766E22 100%)' }}
      >
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full glow-pulse"
          style={{ background: 'radial-gradient(circle, rgba(15,118,110,0.35) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-20 right-0 w-80 h-80 rounded-full glow-pulse"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)', animationDelay: '2.5s' }} />
        <div className="dot-pattern pointer-events-none absolute inset-0 opacity-40" />

        <div className="page-container relative z-10 text-center">
          <div className="hero-item-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{ background: 'rgba(15,118,110,0.25)', color: '#5EEAD4', border: '1px solid rgba(15,118,110,0.4)' }}>
            <Sparkles size={12} />
            Simulateur solaire gratuit
          </div>
          <h1 className="hero-item-2 text-4xl md:text-6xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Calculez votre<br />
            <span style={{ color: '#F59E0B' }}>installation solaire</span>
          </h1>
          <p className="hero-item-3 text-base md:text-lg max-w-xl mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
            En 4 étapes, estimez la puissance idéale, la production annuelle et vos économies sur 25 ans.
          </p>
          <div className="hero-item-4 flex items-center justify-center gap-6 mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} style={{ color: '#5EEAD4' }} /> Gratuit & sans engagement</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} style={{ color: '#5EEAD4' }} /> Résultat instantané</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} style={{ color: '#5EEAD4' }} /> Devis personnalisé offert</span>
          </div>
        </div>
      </section>

      {/* ── Wizard ────────────────────────────────────── */}
      <section className="page-container py-12 md:py-16">
        <div className="max-w-2xl mx-auto">

          {/* Progress */}
          <StepBar current={step} />

          {/* Step panels */}
          <StepCard visible={visible}>

            {/* ── Step 0 : Usage ── */}
            {step === 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Quel est votre projet ?
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                  Choisissez le type d'installation qui correspond à votre situation.
                </p>
                <div className="flex flex-col gap-3">
                  <SelectCard
                    icon={<Home size={22} />}
                    title="Autoconsommation"
                    subtitle="Restez raccordé au réseau et réduisez votre facture. Avec ou sans batterie."
                    selected={data.installType === 'self_consumption'}
                    onClick={() => set('installType', 'self_consumption')}
                    color="#0F766E"
                  />
                  <SelectCard
                    icon={<Compass size={22} />}
                    title="Site isolé (off-grid)"
                    subtitle="Aucune connexion réseau. Chalet, terrain, dépendance — autonomie totale."
                    selected={data.installType === 'off_grid'}
                    onClick={() => set('installType', 'off_grid')}
                    color="#D97706"
                  />
                  <SelectCard
                    icon={<Plug size={22} />}
                    title="Plug & Play"
                    subtitle="Branchez sur une prise dédiée, sans travaux. Parfait pour débuter."
                    selected={data.installType === 'plug_play'}
                    onClick={() => set('installType', 'plug_play')}
                    color="#0369A1"
                  />
                </div>
              </div>
            )}

            {/* ── Step 1 : Consumption ── */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Votre consommation annuelle
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                  Retrouvez cette information sur votre facture EDF / Enedis (en kWh/an).
                </p>

                {/* Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
                  {CONSUMPTION_PRESETS.map(p => {
                    const sel = data.consumption === p.value
                    return (
                      <button
                        key={p.value}
                        onClick={() => set('consumption', p.value)}
                        className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 text-xs font-medium transition-all duration-200 hover:scale-105"
                        style={{
                          borderColor: sel ? p.color : 'var(--color-border)',
                          background:  sel ? `${p.color}12` : 'var(--color-surface)',
                          boxShadow:   sel ? `0 4px 16px ${p.color}30` : 'var(--shadow-sm)',
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                          style={{
                            background: sel ? p.color : `${p.color}15`,
                            color:      sel ? '#fff' : p.color,
                          }}
                        >
                          {p.icon}
                        </div>
                        <span className="text-center leading-tight" style={{ color: sel ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                          {p.label}
                        </span>
                        <span className="font-bold text-xs" style={{ color: sel ? p.color : 'var(--color-text-faint)' }}>
                          {p.value.toLocaleString('fr-FR')} kWh
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Slider */}
                <div className="rounded-2xl p-5 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Consommation</span>
                    <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: "'Clash Display', sans-serif" }}>
                      {data.consumption.toLocaleString('fr-FR')}
                      <span className="text-base font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>kWh/an</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={500} max={20000} step={100}
                    value={data.consumption}
                    onChange={e => set('consumption', Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      accentColor: 'var(--color-primary)',
                      background: `linear-gradient(to right, var(--color-primary) ${(data.consumption - 500) / 195}%, var(--color-surface-offset) ${(data.consumption - 500) / 195}%)`,
                    }}
                  />
                  <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--color-text-faint)' }}>
                    <span>500 kWh</span>
                    <span>20 000 kWh</span>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 text-xs p-3 rounded-lg" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-active)' }}>
                  <Zap size={13} className="flex-shrink-0 mt-0.5" />
                  <span>En France, une maison de 4 personnes consomme en moyenne <strong>4 500 – 6 000 kWh/an</strong>.</span>
                </div>
              </div>
            )}

            {/* ── Step 2 : Region ── */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Votre localisation
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                  L'ensoleillement varie selon la région — c'est le facteur clé du dimensionnement.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REGIONS.map(r => {
                    const selected = data.region === r.label
                    return (
                      <button
                        key={r.label}
                        onClick={() => set('region', r.label)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all duration-150 hover:scale-[1.02]"
                        style={{
                          borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                          background:  selected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                          color:       selected ? 'var(--color-primary-active)' : 'var(--color-text)',
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin size={14} style={{ color: selected ? 'var(--color-primary)' : 'var(--color-text-faint)' }} />
                          {r.label}
                        </span>
                        <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: selected ? 'var(--color-primary)' : 'var(--color-text-faint)' }}>
                          {r.irr} kWh/kWc
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Step 3 : Config ── */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Configuration de l'installation
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                  Quelques détails pour affiner le calcul.
                </p>

                {/* Surface */}
                <div className="rounded-2xl p-5 border mb-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Surface disponible</span>
                    <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: "'Clash Display', sans-serif" }}>
                      {data.surface} <span className="text-base font-normal" style={{ color: 'var(--color-text-muted)' }}>m²</span>
                    </span>
                  </div>
                  <input
                    type="range" min={4} max={200} step={2}
                    value={data.surface}
                    onChange={e => set('surface', Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--color-text-faint)' }}>
                    <span>4 m²</span>
                    <span>200 m²</span>
                  </div>
                  <p className="mt-2 text-xs" style={{ color: 'var(--color-text-faint)' }}>
                    ≈ {Math.floor(data.surface / 2)} panneaux 450 Wc possible (2 m²/panneau)
                  </p>
                </div>

                {/* Orientation */}
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Orientation du toit</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      ['south',      <Navigation size={18} />,      'Plein sud',     '100 % rendement', '#0F766E'],
                      ['south_east', <ArrowUpRight size={18} />,    'Sud-Est/Ouest', '−5 %',            '#0369A1'],
                      ['east_west',  <ArrowLeftRight size={18} />,  'Est / Ouest',   '−15 %',           '#7C3AED'],
                    ] as const).map(([val, icon, label, note, color]) => {
                      const sel = data.orientation === val
                      return (
                        <button
                          key={val}
                          onClick={() => set('orientation', val as Orientation)}
                          className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 text-xs text-center transition-all duration-200 hover:scale-105"
                          style={{
                            borderColor: sel ? color : 'var(--color-border)',
                            background:  sel ? `${color}12` : 'var(--color-surface)',
                            boxShadow:   sel ? `0 4px 16px ${color}30` : 'var(--shadow-sm)',
                          }}
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                            style={{ background: sel ? color : `${color}15`, color: sel ? '#fff' : color }}
                          >
                            {icon}
                          </div>
                          <div className="font-semibold" style={{ color: sel ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{label}</div>
                          <div style={{ color: 'var(--color-text-faint)' }}>{note}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Phase */}
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Type de réseau</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ['mono', <Zap size={18} />,          'Monophasé',  'Standard résidentiel', '#0F766E'],
                      ['tri',  <Factory size={18} />,       'Triphasé',   'Industrie / grande maison', '#7C3AED'],
                    ] as const).map(([val, icon, label, note, color]) => {
                      const sel = data.phase === val
                      return (
                        <button
                          key={val}
                          onClick={() => set('phase', val as Phase)}
                          className="flex items-center gap-3 py-4 px-4 rounded-xl border-2 text-sm text-left transition-all duration-200 hover:scale-[1.02]"
                          style={{
                            borderColor: sel ? color : 'var(--color-border)',
                            background:  sel ? `${color}12` : 'var(--color-surface)',
                            boxShadow:   sel ? `0 4px 16px ${color}30` : 'var(--shadow-sm)',
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                            style={{ background: sel ? color : `${color}15`, color: sel ? '#fff' : color }}
                          >
                            {icon}
                          </div>
                          <div>
                            <div className="font-semibold" style={{ color: sel ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{label}</div>
                            <div className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{note}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Battery */}
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Batterie de stockage ?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      ['yes',   <BatteryFull size={18} />,  'Oui',       'Autonomie max',     '#16A34A', '#DCFCE7'],
                      ['no',    <BatteryLow size={18} />,   'Non',       'Sans stockage',     '#64748B', '#F1F5F9'],
                      ['maybe', <HelpCircle size={18} />,   'À étudier', 'Je veux un conseil','#D97706', '#FEF3C7'],
                    ] as const).map(([val, icon, label, note, color, bg]) => {
                      const sel = data.battery === val
                      return (
                        <button
                          key={val}
                          onClick={() => set('battery', val as BatteryOpt)}
                          className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 text-xs text-center transition-all duration-200 hover:scale-105"
                          style={{
                            borderColor: sel ? color : 'var(--color-border)',
                            background:  sel ? bg : 'var(--color-surface)',
                            boxShadow:   sel ? `0 4px 16px ${color}30` : 'var(--shadow-sm)',
                          }}
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                            style={{ background: sel ? color : `${color}18`, color: sel ? '#fff' : color }}
                          >
                            {icon}
                          </div>
                          <div className="font-semibold" style={{ color: sel ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{label}</div>
                          <div style={{ color: 'var(--color-text-faint)' }}>{note}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4 : Results ── */}
            {step === 4 && result && (
              <div>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-active)' }}>
                    <Sun size={13} /> Estimation calculée
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    Votre kit idéal : <span style={{ color: 'var(--color-primary)' }}>
                      <Counter to={result.kwcRounded} decimals={1} suffix=" kWc" />
                    </span>
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Basé sur {data.consumption.toLocaleString('fr-FR')} kWh/an · {data.region} · {result.irr} kWh/kWc
                  </p>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <MetricCard
                    icon={<Sun size={16} />}
                    label="Production annuelle"
                    value={<Counter to={result.annualProd} suffix=" kWh" />}
                    sub={`${result.panelCount} panneaux 450 Wc`}
                    color="#F59E0B"
                  />
                  <MetricCard
                    icon={<span className="text-xs font-black">DH</span>}
                    label="Économies / an"
                    value={<><Counter to={result.annualSavings} /> MAD</>}
                    sub="à 1,30 MAD/kWh (ONEE)"
                    color="#0F766E"
                  />
                  <MetricCard
                    icon={<Clock size={16} />}
                    label="Retour sur investissement"
                    value={<Counter to={result.payback} decimals={1} suffix=" ans" />}
                    sub={`Kit ≈ ${result.kitCostApprox.toLocaleString('fr-FR')} MAD`}
                    color="#0369A1"
                  />
                  <MetricCard
                    icon={<Leaf size={16} />}
                    label="CO₂ évité / an"
                    value={<Counter to={result.co2Avoided} suffix=" kg" />}
                    sub="≈ 0,053 kg/kWh"
                    color="#16A34A"
                  />
                </div>

                {/* 25-year gain banner */}
                <div className="rounded-2xl p-5 mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F766E, #115E59)' }}>
                  <div className="absolute right-0 top-0 w-32 h-32 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={22} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-0.5">Gain total sur 25 ans</p>
                      <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                        <Counter to={Math.max(0, result.lifeGain)} suffix=" MAD" />
                      </p>
                    </div>
                    <div className="ml-auto text-right hidden sm:block">
                      <p className="text-xs text-white/60">Après amortissement</p>
                      <p className="text-sm font-semibold text-white">durée de garantie panneaux</p>
                    </div>
                  </div>
                </div>

                {/* Solar production bar chart */}
                <div className="rounded-2xl p-5 border mb-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={16} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Production mensuelle estimée</span>
                  </div>
                  <MonthlyChart kwcRounded={result.kwcRounded} region={data.region} />
                </div>

                {/* PDF download button */}
                <button
                  onClick={() => generatePDF(data, result)}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 hover:scale-[1.02] mb-4 group"
                  style={{
                    borderColor: 'var(--color-primary)',
                    background:  'var(--color-primary-light)',
                    color:       'var(--color-primary-active)',
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                    style={{ background: 'var(--color-primary)', color: '#fff' }}>
                    <FileText size={16} />
                  </div>
                  <div className="text-left">
                    <div style={{ color: 'var(--color-primary-active)' }}>Télécharger le rapport PDF</div>
                    <div className="text-xs font-normal" style={{ color: 'var(--color-primary)' }}>Récapitulatif complet · production · économies MAD · graphique mensuel</div>
                  </div>
                  <Download size={16} className="ml-auto" style={{ color: 'var(--color-primary)' }} />
                </button>

                {/* CTA */}
                <div className="rounded-2xl border p-5 flex flex-col sm:flex-row gap-4 items-center"
                  style={{ background: 'var(--color-surface-alt)', borderColor: 'var(--color-border)' }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Star size={14} style={{ color: 'var(--color-gold)' }} fill="currentColor" />
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>Étape suivante recommandée</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                      Obtenez un devis précis, gratuit et sans engagement de notre équipe technique.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <Link to="/fr/devis" className="btn-primary whitespace-nowrap">
                      Devis gratuit <ArrowRight size={14} />
                    </Link>
                    <Link to="/fr/kits-solaires" className="btn-secondary whitespace-nowrap">
                      Voir les kits
                    </Link>
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-center mt-4" style={{ color: 'var(--color-text-faint)' }}>
                  Estimation indicative. Les résultats réels dépendent de l'ensoleillement local, de l'installation et de l'usage.
                  Un devis personnalisé est la seule base fiable pour investir.
                </p>
              </div>
            )}
          </StepCard>

          {/* ── Navigation ── */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-divider)' }}>
              <button
                onClick={prev}
                disabled={step === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                <ChevronLeft size={16} /> Précédent
              </button>
              <button
                onClick={next}
                disabled={!canNext[step]}
                className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {step === 3 ? (
                  <><Sparkles size={15} /> Calculer </>
                ) : (
                  <>Suivant <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => { setStep(0); setVisible(true); setResult(null); setData({ installType: null, consumption: 5000, region: 'Île-de-France', surface: 30, orientation: 'south', phase: 'mono', battery: 'maybe' }) }}
                className="btn-ghost text-sm flex items-center gap-2"
              >
                <RotateCcw size={14} /> Recommencer la simulation
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Trust section ─────────────────────────────── */}
      <section style={{ background: 'var(--color-surface)', borderColor: 'var(--color-divider)' }} className="py-14 border-t">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {([
              {
                icon: <ShieldCheck size={24} />,
                gradient: 'linear-gradient(135deg, #0F766E, #0D9488)',
                glow: 'rgba(15,118,110,0.25)',
                ring: 'rgba(15,118,110,0.15)',
                title: 'Données confidentielles',
                desc: 'Votre simulation reste chez vous — aucune donnée n\'est partagée sans votre accord.',
              },
              {
                icon: <Headset size={24} />,
                gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                glow: 'rgba(245,158,11,0.25)',
                ring: 'rgba(245,158,11,0.15)',
                title: 'Expert disponible',
                desc: 'Nos conseillers techniques répondent dans les 24h pour valider votre projet.',
              },
              {
                icon: <Award size={24} />,
                gradient: 'linear-gradient(135deg, #0369A1, #0EA5E9)',
                glow: 'rgba(3,105,161,0.25)',
                ring: 'rgba(3,105,161,0.15)',
                title: '+2 500 installations',
                desc: 'Depuis 2015, nous accompagnons particuliers et professionnels partout en France et au Maroc.',
              },
            ] as const).map(({ icon, gradient, glow, ring, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-3 group">
                {/* Icon wrapper with animated ring */}
                <div className="relative mb-1">
                  <div
                    className="absolute inset-0 rounded-2xl scale-110 opacity-0 group-hover:opacity-100 transition-all duration-400"
                    style={{ background: ring }}
                  />
                  <div
                    className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: gradient,
                      boxShadow: `0 8px 24px ${glow}`,
                    }}
                  >
                    {icon}
                  </div>
                  {/* Subtle dot accent */}
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                    style={{ background: gradient }}
                  />
                </div>
                <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact CTA ───────────────────────────────── */}
      <section className="py-12" style={{ background: 'var(--color-bg)' }}>
        <div className="page-container">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Vous préférez en discuter directement ?</p>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>Notre équipe est là pour vous</h3>
            <a href="tel:+33123456789" className="btn-primary inline-flex mx-auto">
              <Phone size={15} /> Appeler un expert solaire
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}

/* ─── Monthly production mini-chart ─────────────────────────── */

const MONTH_FACTORS = [0.45, 0.55, 0.75, 0.90, 1.05, 1.10, 1.15, 1.10, 0.95, 0.75, 0.50, 0.40]
const MONTH_LABELS  = ['J','F','M','A','M','J','J','A','S','O','N','D']

function MonthlyChart({ kwcRounded, region }: { kwcRounded: number; region: string }) {
  const irr    = REGIONS.find(r => r.label === region)?.irr ?? 990
  const annual = kwcRounded * irr
  const total  = MONTH_FACTORS.reduce((a, b) => a + b, 0)
  const values = MONTH_FACTORS.map(f => Math.round((annual * f) / total))
  const max    = Math.max(...values)

  return (
    <div className="flex items-end gap-1 h-24">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all duration-700"
            style={{
              height:     `${(v / max) * 80}px`,
              background: i >= 4 && i <= 8
                ? 'linear-gradient(180deg, #F59E0B, #FCD34D)'
                : 'linear-gradient(180deg, var(--color-primary), #5EEAD4)',
              animationDelay: `${i * 60}ms`,
            }}
          />
          <span className="text-xs" style={{ color: 'var(--color-text-faint)', fontSize: '10px' }}>{MONTH_LABELS[i]}</span>
        </div>
      ))}
    </div>
  )
}
