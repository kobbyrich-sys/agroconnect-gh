import { Helmet } from 'react-helmet-async'

type SeoHelmetProps = {
  title?: string
  description?: string
}

const SITE_NAME = 'AgroConnectGH'

export function SeoHelmet({ title, description }: SeoHelmetProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Ghana's Agricultural Marketplace`
  const pageDesc = description || 'Connect directly with Ghanaian farmers and food producers. Buy fresh produce, livestock, and farm equipment online.'
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
    </Helmet>
  )
}
