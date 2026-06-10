import { useEffect } from 'react'

export default function SEO({ title, description, image, url }) {
  const siteName = 'Prestige Mart'
  const defaultDesc = 'Nigeria\'s premier luxury fashion and lifestyle destination. Shop premium clothing, shoes, watches, bags, perfumes, electronics and accessories.'
  const defaultImage = '/og-image.jpg'

  useEffect(() => {
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Premium Luxury Fashion & Lifestyle Store`
    const desc = description || defaultDesc

    document.title = fullTitle
    setMeta('description', desc)
    setMeta('og:title', fullTitle)
    setMeta('og:description', desc)
    setMeta('og:image', image || defaultImage)
    setMeta('og:type', 'website')
    if (url) setMeta('og:url', url)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', desc)
    setMeta('twitter:image', image || defaultImage)

    return () => {
      document.title = siteName
    }
  }, [title, description, image, url])

  return null
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      el.setAttribute('property', name)
    } else {
      el.setAttribute('name', name)
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
