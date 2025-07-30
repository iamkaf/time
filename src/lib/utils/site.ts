/**
 * Get the site URL for the current environment
 * Uses NEXT_PUBLIC_SITE_URL if set, otherwise falls back to production URL
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://time.iamkaf.com'
}

/**
 * Get the production site URL (used for SEO/meta tags)
 */
export function getProductionUrl(): string {
  return 'https://time.iamkaf.com'
}