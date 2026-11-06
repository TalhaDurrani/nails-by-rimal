/** @type {import('next').NextConfig} */

const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
];

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    remotePatterns.push({
      protocol: 'https',
      hostname: new URL(supabaseUrl).hostname,
    });
  }
} catch {
  // Environment validation in the application reports an invalid URL clearly.
}

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'" },
      ],
    }];
  },
  images: {
    remotePatterns,
    dangerouslyAllowSVG: false,
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
