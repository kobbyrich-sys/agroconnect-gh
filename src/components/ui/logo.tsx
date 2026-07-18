import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  linkTo?: string
  compact?: boolean
  showTagline?: boolean
  decorative?: boolean
}

export function Logo({ className = 'h-8 w-auto', linkTo, compact, showTagline = true, decorative = false }: LogoProps) {
  const img = (
    <img
      src={compact || !showTagline ? '/icon.svg' : '/logo.svg'}
      alt={decorative ? '' : 'AgroConnect GH'}
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative}
    />
  )

  if (linkTo) {
    return <Link to={linkTo}>{img}</Link>
  }

  return img
}
