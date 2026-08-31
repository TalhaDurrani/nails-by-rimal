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
  images: {
    remotePatterns,
    dangerouslyAllowSVG: false,
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
