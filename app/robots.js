export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/admin' }],
    sitemap: 'https://bennettsdavis.site/sitemap.xml',
  };
}
