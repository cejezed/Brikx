export type NieuwsCategory = 'markt' | 'regelgeving' | 'project' | 'bedrijf'

export interface NieuwsImage {
  url: string
  alt: string
}

export interface NieuwsSeo {
  title?: string
  description?: string
  ogImage?: string
}

export interface NieuwsItem {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  category: NieuwsCategory
  contentHtml: string
  featuredImage: NieuwsImage
  seo?: NieuwsSeo
}