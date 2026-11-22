/**
 * Static export: upload the contents of ./out to Hostinger public_html (or any static host: Vercel, Netlify, GitHub Pages).
 * PREVIEW=1 makes asset paths relative (for hosting under a sub-path, e.g. an artifact preview).
 */
const config = { output: 'export', images: { unoptimized: true }, reactStrictMode: true, trailingSlash: true };
if (process.env.PREVIEW === '1') config.assetPrefix = './';
export default config;
