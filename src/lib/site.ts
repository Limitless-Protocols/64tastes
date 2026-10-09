export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
export const SITE_HOST = new URL(SITE_URL).host;