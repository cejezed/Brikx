import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.brikxai.nl'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/'], // Adjusted based on typical needs, can be customized
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
