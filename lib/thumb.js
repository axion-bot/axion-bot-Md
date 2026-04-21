/* Converte automaticamente le immagini in buffer ottimizzati tramite sharp per usarle come thumb

Dev by Bonzino */

import fs from 'fs'
import sharp from 'sharp'

const thumbs = {
  promote: './media/thumb-promote.png',
  demote: './media/thumb-demote.png',

  antilink: './media/funzioni/antilink.png',
  antiinsta: './media/funzioni/antiinsta.png',
  antitelegram: './media/funzioni/antitelegram.png',
  antitiktok: './media/funzioni/antitiktok.png',
  antitag: './media/funzioni/antitag.png',
  antigore: './media/funzioni/antigore.png',
  antiporno: './media/funzioni/antiporno.png',
  antiporn: './media/funzioni/antiporno.png',
  antimedia: './media/funzioni/antimedia.png',
  modoadmin: './media/funzioni/modoadmin.png',
  soloadmin: './media/funzioni/modoadmin.png',
  benvenuto: './media/funzioni/benvenuto.png',
  addio: './media/funzioni/addio.png',
  antiprivato: './media/funzioni/antiprivato.png',
  antibot: './media/funzioni/antibot.png',
  antispam: './media/funzioni/antispam.png',
  antitrava: './media/funzioni/antitrava.png',

  default: './media/default.png'
}

global.thumbCache = global.thumbCache || new Map()

export async function getThumbBuffer(feature) {
  try {
    const file = thumbs[feature] || thumbs.default

    if (!file) return null

    const cacheKey = `${feature}:${file}`

    if (global.thumbCache.has(cacheKey)) {
      return global.thumbCache.get(cacheKey)
    }

    const input = fs.readFileSync(file)

    const buffer = await sharp(input)
      .resize(800, 450, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer()

    global.thumbCache.set(cacheKey, buffer)

    return buffer
  } catch {
    try {
      const fallback = thumbs.default

      if (!fallback) return null

      const cacheKey = `default:${fallback}`

      if (global.thumbCache.has(cacheKey)) {
        return global.thumbCache.get(cacheKey)
      }

      const input = fs.readFileSync(fallback)

      const buffer = await sharp(input)
        .resize(800, 450, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer()

      global.thumbCache.set(cacheKey, buffer)

      return buffer
    } catch {
      return null
    }
  }
}