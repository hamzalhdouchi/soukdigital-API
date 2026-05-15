import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    supportedLngs: ['fr'],
    debug: import.meta.env.DEV,
    interpolation: { escapeValue: false },
    resources: {
      fr: {
        translation: {
          nav: {
            catalog: 'Catalogue',
            simulator: 'Simulateur',
            blog: 'Blog',
            quote: 'Devis',
            cart: 'Panier',
            account: 'Mon compte',
            login: 'Connexion',
          },
          common: {
            loading: 'Chargement…',
            error: 'Une erreur est survenue',
            retry: 'Réessayer',
            viewAll: 'Voir tout',
            addToCart: 'Ajouter au panier',
            requestQuote: 'Demander un devis',
            priceHT: 'HT',
            priceTTC: 'TTC',
          },
          product: {
            inStock: 'En stock',
            outOfStock: 'Rupture de stock',
            lowStock: 'Stock limité',
          },
        },
      },
    },
  })

export default i18n
