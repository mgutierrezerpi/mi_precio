// Generates the PWA icon set from the brand favicon.
//
// Run with: node scripts/generate-pwa-icons.mjs
// Source: public/miprecio-favicon.png (transparent, non-square)
// Outputs (public/): pwa-192x192.png, pwa-512x512.png,
//                    pwa-maskable-512x512.png, apple-touch-icon.png
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'public', 'miprecio-favicon.png')
const out = (name) => join(root, 'public', name)

// Brand background used for the maskable + apple-touch icons (white reads well
// against both light and dark launchers and matches the public catalog page).
const BG = { r: 255, g: 255, b: 255, alpha: 1 }

// Fit the (non-square) source into a transparent square canvas of `size`,
// leaving `pad` fraction of empty space around it (safe zone for maskable).
async function square(size, pad, background) {
  const inner = Math.round(size * (1 - pad))
  const logo = await sharp(src)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
}

const transparent = { r: 0, g: 0, b: 0, alpha: 0 }

await (await square(192, 0.08, transparent)).toFile(out('pwa-192x192.png'))
await (await square(512, 0.08, transparent)).toFile(out('pwa-512x512.png'))
// Maskable: larger padding so the logo survives the launcher's circular crop.
await (await square(512, 0.2, BG)).toFile(out('pwa-maskable-512x512.png'))
await (await square(180, 0.12, BG)).toFile(out('apple-touch-icon.png'))

console.log('PWA icons generated in public/')
