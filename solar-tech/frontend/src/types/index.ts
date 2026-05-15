/* ─── Pagination ─────────────────────────────────────────── */
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

/* ─── Auth ───────────────────────────────────────────────── */
export type UserRole = 'ROLE_CLIENT' | 'ROLE_COMMERCIAL' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  roles: UserRole[]
  isActive: boolean
  emailVerified: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

/* ─── Category ───────────────────────────────────────────── */
export interface Category {
  id: number
  slug: string
  name: string
  description?: string
  imageUrl?: string
  parentId?: number
  children?: Category[]
  position: number
  isActive: boolean
}

/* ─── Brand ──────────────────────────────────────────────── */
export interface Brand {
  id: number
  slug: string
  name: string
  logoUrl?: string
}

/* ─── Product ────────────────────────────────────────────── */
export type ProductType = 'solar_kit' | 'lithium_battery' | 'inverter' | 'accessory'
export type InstallationType = 'self_consumption' | 'off_grid' | 'plug_and_play' | 'mobility'
export type PhaseType = 'single_phase' | 'three_phase'
export type InjectionType = 'full_injection' | 'partial_injection' | 'no_injection'

export interface ProductImage {
  id: number
  url: string
  altText?: string
  position: number
  isPrimary: boolean
}

export interface ProductVariant {
  id: number
  reference: string
  label: string
  priceHt: number
  priceTtc: number
  currency: string
  stockQuantity: number
  isDefault: boolean
  isActive: boolean
}

export interface AttributeValue {
  attributeCode: string
  attributeName: string
  value: string
  unit?: string
}

export interface ProductDetailResponse {
  id: number
  sku: string
  slug: string
  name: string
  shortDescription?: string
  longDescription?: string
  productType: ProductType
  installationType?: InstallationType
  phaseType?: PhaseType
  injectionType?: InjectionType
  basePowerKwc?: number
  inverterPowerVa?: number
  batteryCapacityKwh?: number
  voltageOutput?: string
  panelCount?: number
  warrantyYears?: number
  weight?: number
  dimensions?: string
  isFeatured: boolean
  isActive: boolean
  metaTitle?: string
  metaDescription?: string
  category?: { id: number; slug: string; name: string }
  brand?: { id: number; slug: string; name: string; logoUrl?: string }
  images: { id: number; url: string; altText?: string; isPrimary: boolean }[]
  variants: { id: number; reference: string; label: string; priceHt: number; priceTtc: number; currency: string; isDefault: boolean; isActive: boolean }[]
}

export interface Product {
  id: number
  sku: string
  slug: string
  name: string
  shortDescription?: string
  longDescription?: string
  category: Pick<Category, 'id' | 'slug' | 'name'>
  brand?: Pick<Brand, 'id' | 'slug' | 'name' | 'logoUrl'>
  productType: ProductType
  installationType?: InstallationType
  phaseType?: PhaseType
  basePowerKwc?: number
  inverterPowerVa?: number
  batteryCapacityKwh?: number
  voltageOutput?: string
  injectionType?: InjectionType
  panelCount?: number
  warrantyYears?: number
  images: ProductImage[]
  variants: ProductVariant[]
  attributes: AttributeValue[]
  isFeatured: boolean
  isActive: boolean
}

export interface ProductSummary {
  id: number
  slug: string
  name: string
  shortDescription?: string
  primaryImage?: string
  defaultVariant: Pick<ProductVariant, 'priceHt' | 'priceTtc' | 'currency' | 'stockQuantity'>
  productType: ProductType
  installationType?: InstallationType
  brand?: Pick<Brand, 'name' | 'logoUrl'>
  isFeatured: boolean
  basePowerKwc?: number
}

/* ─── Catalog Filters ────────────────────────────────────── */
export interface ProductFilterRequest {
  categoryId?: number
  brandIds?: number[]
  productType?: ProductType
  installationType?: InstallationType
  phaseType?: PhaseType
  injectionType?: InjectionType
  hasBattery?: boolean
  minPrice?: number
  maxPrice?: number
  minPowerKwc?: number
  maxPowerKwc?: number
  search?: string
  page?: number
  size?: number
  sort?: string
}

/* ─── Cart ───────────────────────────────────────────────── */
export interface CartItem {
  id: number
  variantId: number
  productSlug: string
  productName: string
  variantLabel: string
  imageUrl?: string
  quantity: number
  unitPriceHt: number
  unitPriceTtc: number
}

/* ─── Order ──────────────────────────────────────────────── */
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export interface Order {
  id: number
  reference: string
  status: OrderStatus
  subtotalHt: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  totalTtc: number
  currency: string
  createdAt: string
  updatedAt: string
}

/* ─── Quote ──────────────────────────────────────────────── */
export type QuoteStatus = 'new' | 'in_review' | 'sent' | 'accepted' | 'rejected' | 'converted'

export interface QuoteRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  installationType?: InstallationType
  consumptionKwh?: number
  location?: string
  budget?: number
  message: string
  productIds?: number[]
  items?: {
    productId?: number
    variantId?: number
    productName: string
    variantLabel?: string
    quantity: number
    unitPriceHt?: number
  }[]
}
