import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="page-container py-24 text-center">
      <p className="text-6xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>404</p>
      <h1 className="text-2xl font-semibold mb-3">Page introuvable</h1>
      <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/" className="btn-primary">Retour à l'accueil</Link>
    </div>
  )
}
