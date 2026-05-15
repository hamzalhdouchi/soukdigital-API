import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun, ShieldCheck, Truck, Headphones, ArrowRight, Star,
  ChevronDown, Home, Compass, Plug, Wrench,
  Phone, Zap, Battery, TrendingUp,
} from 'lucide-react'
import { useCatalog } from '@/features/catalog/hooks/useCatalog'
import ProductCard, { ProductCardSkeleton } from '@/components/shared/ProductCard'
import type { ProductSummary } from '@/types'

/* ─── Mock products ────────────────────────────────────────────────── */

const MOCK_PRODUCTS: ProductSummary[] = [
  {
    id: 1,
    slug: 'kit-solaire-autoconsommation-564-kwc-aiko',
    name: 'Kit Solaire Autoconsommation 5,64 kWc – AIKO +',
    shortDescription: '12 panneaux monocristallins · Onduleur hybride 6kVA · Option batterie',
    primaryImage: '/images/product-1.jpg',
    productType: 'solar_kit',
    installationType: 'self_consumption',
    brand: { name: 'AIKO', logoUrl: undefined },
    isFeatured: true,
    basePowerKwc: 5.64,
    defaultVariant: { priceHt: 2540.78, priceTtc: 3048.94, currency: 'EUR', stockQuantity: 8 },
  },
  {
    id: 2,
    slug: 'kit-solaire-autoconsommation-135-kwc-tri',
    name: 'Kit Solaire Autoconsommation 13,5 kWc – Tri 10kW',
    shortDescription: '30 panneaux · Onduleur hybride triphasé 10kW · Batterie 16 kWh',
    primaryImage: '/images/product-2.jpg',
    productType: 'solar_kit',
    installationType: 'self_consumption',
    brand: { name: 'Deye', logoUrl: undefined },
    isFeatured: true,
    basePowerKwc: 13.5,
    defaultVariant: { priceHt: 7589.99, priceTtc: 9107.99, currency: 'EUR', stockQuantity: 3 },
  },
  {
    id: 3,
    slug: 'pack-retrofit-tri-8kw-batterie-16kwh-deye',
    name: 'Pack Rétrofit Tri 8 kW – Batterie 16 kWh – Deye',
    shortDescription: 'Onduleur hybride triphasé 8kW · Batterie LFP 16 kWh · Option fixation',
    primaryImage: '/images/product-3.jpg',
    productType: 'lithium_battery',
    installationType: 'self_consumption',
    brand: { name: 'Deye', logoUrl: undefined },
    isFeatured: true,
    basePowerKwc: undefined,
    defaultVariant: { priceHt: 4518.30, priceTtc: 5421.96, currency: 'EUR', stockQuantity: 5 },
  },
  {
    id: 4,
    slug: 'kit-solaire-autoconsommation-36-kwc-mono-36',
    name: 'Kit Solaire Autoconsommation 3,6 kWc – Mono 3,6kW',
    shortDescription: '8 panneaux · Batterie 5,12 kWh · Hybride 3,6kW monophasé',
    primaryImage: '/images/product-4.jpg',
    productType: 'solar_kit',
    installationType: 'self_consumption',
    brand: { name: 'SOFAR', logoUrl: undefined },
    isFeatured: true,
    basePowerKwc: 3.6,
    defaultVariant: { priceHt: 3040.73, priceTtc: 3648.87, currency: 'EUR', stockQuantity: 12 },
  },
  {
    id: 5,
    slug: 'kit-solaire-camping-car-m-12v-batterie-256',
    name: 'Kit Solaire Camping-Car M – 12V · Batterie 2,56 kWh',
    shortDescription: 'Panneau flexible 200 Wc · Batterie LFP 12V 200Ah · Régulateur MPPT',
    primaryImage: '/images/product-5.jpg',
    productType: 'solar_kit',
    installationType: 'mobility',
    brand: { name: 'Victron Energy', logoUrl: undefined },
    isFeatured: true,
    basePowerKwc: 0.2,
    defaultVariant: { priceHt: 368.73, priceTtc: 442.47, currency: 'EUR', stockQuantity: 20 },
  },
  {
    id: 6,
    slug: 'kit-solaire-autoconsommation-27-kwc-mono-65',
    name: 'Kit Solaire Autoconsommation 2,7 kWc – Mono 6,5kW',
    shortDescription: '6 panneaux · Batterie 4,8 kWh · Hybride 6,5kW monophasé',
    primaryImage: '/images/product-6.jpg',
    productType: 'solar_kit',
    installationType: 'self_consumption',
    brand: { name: 'GoodWe', logoUrl: undefined },
    isFeatured: false,
    basePowerKwc: 2.7,
    defaultVariant: { priceHt: 2404.88, priceTtc: 2885.86, currency: 'EUR', stockQuantity: 0 },
  },
]

/* ─── Static data ──────────────────────────────────────────────────── */

const STATS = [
  { value: '154',  unit: ' kits', label: 'disponibles' },
  { value: '4,5',  unit: '/5',    label: '2 549 avis vérifiés' },
  { value: '25',   unit: ' ans',  label: 'garantie panneaux' },
  { value: '48h',  unit: '',      label: 'livraison moyenne' },
]

const TRUST_BADGES = [
  { icon: ShieldCheck, title: 'Garantie jusqu\'à 25 ans',     desc: 'Panneaux, onduleurs et batteries sélectionnés' },
  { icon: Truck,        title: 'Livraison France / BE / LUX',  desc: 'Expédition rapide, suivi en temps réel' },
  { icon: Headphones,   title: 'Support technique expert',     desc: 'Dimensionnement, installation, SAV dédié' },
  { icon: Wrench,       title: 'Composants compatibles',       desc: 'Kits testés, zéro erreur de compatibilité' },
]

const FAMILIES = [
  {
    icon: Home,
    slug: 'kits-solaires',
    image: '/images/family-autoconsom.jpg',
    title: 'Autoconsommation',
    subtitle: 'Connecté au réseau',
    color: '#0F766E',
    bg: '#CCFBF1',
    description:
      'Restez raccordé au réseau et consommez en priorité ce que vos panneaux produisent. Idéal pour réduire votre facture — avec ou sans réinjection.',
    tags: ['Maison raccordée', 'Réduction facture', 'Micro-onduleur ou hybride'],
  },
  {
    icon: Compass,
    slug: 'site-isole',
    image: '/images/family-isole.jpg',
    title: 'Site Isolé',
    subtitle: 'Off-grid & autonome',
    color: '#D97706',
    bg: '#FEF3C7',
    description:
      'Aucune connexion réseau — votre kit gère tout, de la production au stockage. Chalet, dépendance, terrain isolé ou mobile home.',
    tags: ['Chalet / Terrain', 'Batterie indispensable', 'Onduleur hybride'],
  },
  {
    icon: Plug,
    slug: 'plug-and-play',
    image: '/images/family-plug.jpg',
    title: 'Plug & Play',
    subtitle: 'Sans travaux',
    color: '#0369A1',
    bg: '#E0F2FE',
    description:
      'Branchez le micro-onduleur sur une prise dédiée, orientez vos panneaux côté sud — et c\'est parti. Parfait pour tester l\'autoconsommation sans installation lourde.',
    tags: ['Balcon / Terrasse', 'Sans électricien', 'Prêt à brancher'],
  },
]

const KIT_STEPS = [
  { num: '01', label: 'Usage',      icon: Home,        desc: 'Autoconsommation, autonomie (site isolé) ou kit prêt à brancher' },
  { num: '02', label: 'Puissance',  icon: TrendingUp,  desc: 'Selon votre consommation annuelle et la surface disponible' },
  { num: '03', label: 'Conversion', icon: Zap,         desc: 'Micro-onduleur (simplicité) ou onduleur hybride (évolutif + batterie)' },
  { num: '04', label: 'Stockage',   icon: Battery,     desc: 'Batterie lithium pour augmenter l\'autonomie et réduire l\'achat réseau' },
]

const DIMENSIONING = [
  {
    label: 'Puissance panneaux (Wc ou kWc)',
    body: 'Plus vous avez de Wc installés, plus vous produisez. En France, 1 kWc bien orienté plein sud génère entre 900 et 1 100 kWh/an.',
  },
  {
    label: 'Puissance conversion (kVA)',
    body: 'Le "moteur" de votre installation. Il doit être cohérent avec la puissance PV et vos pics de consommation (pompe, outillage, climatisation…).',
  },
  {
    label: 'Capacité batterie (kWh)',
    body: 'Elle permet de décaler l\'énergie produite le jour vers le soir, ou d\'assurer une autonomie sur site isolé. Combien d\'heures (ou de jours) sans soleil voulez-vous couvrir ?',
  },
]

const FAQ_ITEMS = [
  {
    q: 'À quoi sert un kit solaire : autoconsommation ou autonomie ?',
    a: 'Un kit autoconsommation vous maintient raccordé au réseau tout en réduisant votre facture. Un kit autonomie (site isolé) vous affranchit totalement du réseau — idéal pour les chalets, dépendances ou terrains sans raccordement.',
  },
  {
    q: 'Quelle solution de conversion choisir : micro-onduleur ou onduleur hybride ?',
    a: 'Le micro-onduleur (un par panneau) est idéal en cas d\'ombrage partiel ou de toiture multiples orientations. L\'onduleur hybride gère production PV, injection réseau et charge/décharge batterie en un seul boîtier central — parfait si vous envisagez un stockage.',
  },
  {
    q: 'Peut-on ajouter une batterie à un kit solaire ?',
    a: 'Oui. En autoconsommation, vous pouvez démarrer sans batterie et l\'ajouter plus tard si vous partez sur une architecture hybride. Sur site isolé, la batterie est indispensable dès le départ.',
  },
  {
    q: 'Comment choisir la puissance d\'un kit solaire ?',
    a: 'Trois paramètres clés : votre consommation annuelle (kWh/an), la surface et l\'orientation de votre toiture, et vos pics de puissance instantanée. Notre simulateur solaire calcule votre estimation en quelques clics.',
  },
  {
    q: 'Pour quels projets les kits solaires sont-ils adaptés ?',
    a: 'Maison principale (autoconsommation), résidence secondaire ou chalet (site isolé), camping-car ou bateau (nomade), abri de jardin ou éclairage autonome — il existe un kit pour chaque usage et chaque budget.',
  },
]

const CHECKLIST = [
  'Votre surface disponible (toiture, sol, carport) et son orientation',
  'Votre objectif : réduire la facture, zéro injection, autonomie totale ou partielle',
  'Votre type de réseau : monophasé (grande majorité) ou triphasé',
  'Vos pics de puissance : PAC, four, chargeur EV simultanés',
  'Si batterie : technologie lithium LFP et capacité kWh cohérente avec vos nuits',
]

/* ─── Sub-components ───────────────────────────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'var(--color-divider)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
          {q}
        </span>
        <ChevronDown
          size={15}
          className="flex-shrink-0 mt-0.5 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'none', color: 'var(--color-primary)' }}
        />
      </button>
      {open && (
        <div className="pb-5 pr-8 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {a}
        </div>
      )}
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function HomePage() {
  const { data, isLoading } = useCatalog({ isFeatured: true, size: 6, sort: 'createdAt,desc' } as any)
  const featured = (data?.content?.length ?? 0) > 0 ? data!.content : MOCK_PRODUCTS

  return (
    <div>

      {/* ══════════════════════════════════════════════════════
          HERO — full background image with dark overlay
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: '620px' }}>

        {/* Background image */}
        <img
          src="https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg"
          alt="Installation solaire"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 60%' }}
        />

        {/* Dark gradient overlay — keeps text readable */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(105deg, rgba(10,22,40,0.75) 0%, rgba(10,22,40,0.45) 50%, rgba(10,22,40,0.25) 100%)',
        }} />

        {/* Dot grid on top of image */}
        <div className="absolute inset-0 dot-pattern pointer-events-none" style={{ opacity: 0.4 }} />

        {/* Teal glow accent */}
        <div
          className="absolute pointer-events-none glow-pulse"
          style={{
            top: '-80px', right: '-80px',
            width: '560px', height: '560px',
            background: 'radial-gradient(circle at center, rgba(15,118,110,0.18) 0%, transparent 65%)',
          }}
        />

        <div className="page-container relative z-10 pt-20 pb-16 md:pt-28 md:pb-24">

          {/* Trust pill */}
          <div
            className="hero-item-1 inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full text-xs font-semibold border"
            style={{
              borderColor: 'rgba(15,118,110,0.45)',
              background: 'rgba(15,118,110,0.14)',
              color: 'rgba(204,251,241,0.95)',
            }}
          >
            <Sun size={12} />
            Spécialiste solaire — installations clé en main depuis 2015
          </div>

          {/* H1 */}
          <h1
            className="hero-item-2 font-display font-bold text-white leading-none mb-6"
            style={{
              fontSize: 'clamp(2.8rem, 6.5vw, 5rem)',
              letterSpacing: '-0.03em',
              maxWidth: '820px',
            }}
          >
            L'énergie solaire,<br />
            <span style={{ color: '#0f766e' }}>sans compromis</span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-item-3 text-lg leading-relaxed mb-10"
            style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '520px' }}
          >
            Kits solaires complets avec conversion, protections, câbles et batterie si besoin.
            Autoconsommation, site isolé ou Plug&amp;Play — chaque composant est testé et compatible.
          </p>

          {/* CTAs */}
          <div className="hero-item-4 flex flex-wrap gap-3 mb-14">
            <Link
              to="/fr/kits-solaires"
              className="btn-primary py-3.5 px-7 text-base flex items-center gap-2"
              style={{ boxShadow: '0 0 28px #0f766e73' }}
            >
              Voir les kits solaires <ArrowRight size={16} />
            </Link>
            <Link to="/fr/devis" className="btn-hero-ghost py-3.5 px-7 text-base">
              Étude gratuite
            </Link>
          </div>

          {/* Stats row */}
          <div className="hero-item-5 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mb-10">
            {STATS.map(({ value, unit, label }) => (
              <div
                key={label}
                className="rounded-xl p-4 border"
                style={{
                  borderColor: 'rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="font-display font-bold leading-none mb-1.5">
                  <span style={{ fontSize: '1.75rem', color: 'var(--color-primary)' }}>{value}</span>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)' }}>{unit}</span>
                </div>
                <div className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Reviews strip */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} fill={i < 4 ? 'var(--color-gold)' : 'none'} stroke="var(--color-gold)" />
              ))}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>
              <strong style={{ color: 'rgba(255,255,255,0.75)' }}>4,5/5</strong>
              {' '}· 2 549 avis vérifiés
            </span>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          QUICK NAV
      ══════════════════════════════════════════════════════ */}
      <div className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="page-container">
          <div className="flex gap-1.5 overflow-x-auto py-3 scrollbar-hide">
            {[
              { label: 'Autoconsommation', slug: 'kits-solaires' },
              { label: 'Site isolé',        slug: 'site-isole' },
              { label: 'Plug & Play',       slug: 'plug-and-play' },
              { label: 'Batteries',         slug: 'batteries' },
              { label: 'Onduleurs',         slug: 'onduleurs' },
              { label: 'Régulateurs',       slug: 'regulateurs' },
            ].map(({ label, slug }) => (
              <Link
                key={slug}
                to={`/fr/${slug}`}
                className="flex-shrink-0 text-xs font-medium px-4 py-2 rounded-full border transition-all hover:shadow-sm whitespace-nowrap"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'white' }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════
          TRUST BADGES
      ══════════════════════════════════════════════════════ */}
      <section className="py-10 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'var(--color-primary-light)' }}
                >
                  <Icon size={17} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight mb-0.5">{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          KIT SELECTOR — editorial 2-col, not a boring 4-grid
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://media.istockphoto.com/id/1226088001/es/foto/paneles-solares-azules.webp?b=1&s=170667a&w=0&k=20&c=oOaVa8JhdeEn3rJN3j5U6jaF9vnvKpKes2dVlB8zduI="
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        {/* Light overlay to keep text readable */}
        <div className="absolute inset-0" style={{ background: 'rgba(241,245,249,0.92)' }} />
        <div className="page-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-start">

            {/* Left editorial */}
            <div className="lg:sticky lg:top-28">
              <span className="section-label">Guide d'achat</span>
              <h2
                className="font-display font-bold leading-tight mb-5"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}
              >
                Choisissez votre kit<br />en 4 étapes
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
                Quatre critères suffisent pour identifier la configuration idéale.
                Notre simulateur les calcule pour vous en quelques clics.
              </p>
              <Link to="/fr/simulateur" className="btn-primary inline-flex items-center gap-2">
                Utiliser le simulateur solaire <ArrowRight size={15} />
              </Link>
            </div>

            {/* Right: vertical numbered steps with connector line */}
            <div className="relative">
              {KIT_STEPS.map(({ num, label, icon: Icon, desc }, i) => (
                <div key={num} className="flex gap-5">
                  {/* Number + connector */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-sm"
                      style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                    >
                      {num}
                    </div>
                    {i < KIT_STEPS.length - 1 && (
                      <div className="w-px flex-1 my-2" style={{ background: 'var(--color-divider)', minHeight: '28px' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={i < KIT_STEPS.length - 1 ? 'pb-6' : ''}>
                    <div className="flex items-center gap-2 mt-2 mb-1.5">
                      <Icon size={14} style={{ color: 'var(--color-primary)' }} />
                      <p className="font-semibold text-sm">{label}</p>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          3 FAMILIES — asymmetric layout: 1 large + 2 stacked
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="page-container">
          <div className="mb-10">
            <span className="section-label">Familles de kits</span>
            <h2
              className="font-display font-bold leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', maxWidth: '520px' }}
            >
              Les 3 grandes familles<br />de kits solaires
            </h2>
          </div>

          {/* 3-col desktop: cols 1-3 large card, cols 4-5 two stacked */}
          <div className="grid md:grid-cols-5 gap-4">

            {/* Featured large card */}
            {(() => {
              const { slug, image, title, subtitle, color, bg, description, tags } = FAMILIES[0]
              return (
                <Link
                  to={`/fr/${slug}`}
                  className="md:col-span-3 card group flex flex-col overflow-hidden"
                  style={{ borderRadius: 'var(--radius-xl)', minHeight: '380px' }}
                >
                  <div className="relative overflow-hidden flex-1">
                    <img
                      src={image} alt={title} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ minHeight: '220px' }}
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
                    <span
                      className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: bg, color }}
                    >
                      {subtitle}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col gap-3">
                    <p className="font-display font-bold text-xl" style={{ letterSpacing: '-0.02em' }}>{title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(tag => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full border"
                          style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text-muted)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1.5 text-sm font-semibold mt-1" style={{ color }}>
                      Voir les kits <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              )
            })()}

            {/* Two stacked smaller cards */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {FAMILIES.slice(1).map(({ slug, image, title, subtitle, color, bg, description, tags }) => (
                <Link
                  key={slug}
                  to={`/fr/${slug}`}
                  className="card group flex overflow-hidden flex-1"
                  style={{ borderRadius: 'var(--radius-xl)', minHeight: '170px' }}
                >
                  <div className="relative overflow-hidden flex-shrink-0" style={{ width: '130px' }}>
                    <img
                      src={image} alt={title} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-1.5 flex-1 min-w-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full self-start"
                      style={{ background: bg, color }}>
                      {subtitle}
                    </span>
                    <p className="font-display font-bold text-base leading-snug" style={{ letterSpacing: '-0.02em' }}>{title}</p>
                    <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--color-text-muted)' }}>
                      {description.split('.')[0]}.
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full border"
                          style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text-faint)', fontSize: '0.7rem' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold mt-auto pt-1" style={{ color }}>
                      Voir <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-alt)' }}>
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="section-label">Sélection</span>
              <h2
                className="font-display font-bold leading-tight"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}
              >
                Coups de cœur
              </h2>
            </div>
            <Link to="/fr/kits-solaires" className="btn-ghost text-sm hidden sm:flex items-center gap-1">
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link to="/fr/kits-solaires" className="btn-secondary">Voir tout le catalogue</Link>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          DIMENSIONING GUIDE — dark section for visual rhythm
      ══════════════════════════════════════════════════════ */}
      <section className="py-16" style={{ background: 'var(--color-dark)' }}>
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-14 items-start">

            <div>
              <span className="section-label">Dimensionnement</span>
              <h2
                className="font-display font-bold text-white leading-tight mb-5"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', letterSpacing: '-0.03em' }}
              >
                Comment dimensionner<br />son kit sans se tromper ?
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '400px' }}>
                Le dimensionnement repose sur 3 chiffres clés. Prenez le temps de les estimer avant de
                commander — un kit sous-dimensionné ne couvre pas vos besoins, un kit surdimensionné
                est de l'argent gaspillé.
              </p>
              <Link to="/fr/simulateur" className="btn-primary inline-flex items-center gap-2">
                Simulateur de production <ArrowRight size={15} />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {DIMENSIONING.map(({ label, body }, i) => (
                <div
                  key={label}
                  className="rounded-xl p-5 flex gap-4 border"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-display font-bold text-sm"
                    style={{ background: 'rgba(15,118,110,0.22)', color: 'var(--color-primary)' }}
                  >
                    0{i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1.5 text-white">{label}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          PRE-ORDER CHECKLIST
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="page-container">
          <div className="max-w-2xl mx-auto">
            <span className="section-label text-center block">Avant de commander</span>
            <h2
              className="font-display font-bold mb-2 text-center"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
            >
              Ce qu'il faut vérifier avant de passer commande
            </h2>
            <p className="text-sm text-center mb-10" style={{ color: 'var(--color-text-muted)' }}>
              Cinq points à valider pour partir sur de bonnes bases.
            </p>

            <div className="flex flex-col">
              {CHECKLIST.map((text, i) => (
                <div key={text} className="flex items-start gap-4 py-4 border-b last:border-b-0"
                  style={{ borderColor: 'var(--color-divider)' }}>
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-display font-bold text-xs mt-0.5"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed pt-1">{text}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-sm mt-10" style={{ color: 'var(--color-text-muted)' }}>
              Vous hésitez encore sur le bon kit ?{' '}
              <Link to="/fr/devis" className="font-semibold underline underline-offset-2"
                style={{ color: 'var(--color-primary)' }}>
                Notre équipe technique propose une étude personnalisée
              </Link>
            </p>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-alt)' }}>
        <div className="page-container">
          <div className="max-w-2xl mx-auto">
            <span className="section-label text-center block">FAQ</span>
            <h2
              className="font-display font-bold mb-2 text-center"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
            >
              Questions fréquentes sur les kits solaires
            </h2>
            <p className="text-sm text-center mb-10" style={{ color: 'var(--color-text-muted)' }}>
              Les essentiels avant de choisir votre installation photovoltaïque.
            </p>

            <div
              className="bg-white rounded-2xl border px-6"
              style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
            >
              {FAQ_ITEMS.map(({ q, a }) => (
                <FaqItem key={q} q={q} a={a} />
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: 'var(--color-dark)' }}>
        <div className="page-container">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0d6e67 0%, #0a4f4a 100%)' }}
          >
            {/* Dot pattern overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }} />

            <div className="relative z-10 px-8 py-16 md:py-20 text-center">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border"
                style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
              >
                <Phone size={11} /> Étude solaire personnalisée
              </span>

              <h2
                className="font-display font-bold text-white mb-4 leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
              >
                Votre projet sur mesure
              </h2>

              <p className="text-sm mb-10 max-w-md mx-auto leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}>
                Décrivez votre installation et recevez une offre personnalisée sous 24h, sans engagement.
                Notre équipe technique cadre votre projet de A à Z.
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to="/fr/devis"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-95 hover:shadow-xl"
                  style={{ background: 'white', color: 'var(--color-primary)' }}
                >
                  Demander un devis gratuit <ArrowRight size={16} />
                </Link>
                <Link
                  to="/fr/kits-solaires"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm border text-white transition-all hover:bg-white/10"
                  style={{ borderColor: 'rgba(255,255,255,0.22)' }}
                >
                  Voir le catalogue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
