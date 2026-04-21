/* Converte automaticamente le immagini in buffer ottimizzati tramite sharp per usarle come thumb

Dev by Bonzino */

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const thumbs = {
  promote: path.resolve('./media/promuovi.png'),
  demote: path.resolve('./media/retrocedi.png'),
  antilink: path.resolve('./media/funzioni/antilink.png'),
  antiinsta: path.resolve('./media/funzioni/antiinsta.png'),
  antitelegram: path.resolve('./media/funzioni/antitelegram.png'),
  antitiktok: path.resolve('./media/funzioni/antitiktok.png'),
  antitag: path.resolve('./media/funzioni/antitag.png'),
  antigore: path.resolve('./media/funzioni/antigore.png'),
  antiporno: path.resolve('./media/funzioni/antiporno.png'),
  antiporn: path.resolve('./media/funzioni/antiporno.png'),
  antimedia: path.resolve('./media/funzioni/antimedia.png'),
  modoadmin: path.resolve('./media/funzioni/modoadmin.png'),
  soloadmin: path.resolve('./media/funzioni/modoadmin.png'),
  benvenuto: path.resolve('./media/funzioni/benvenuto.png'),
  addio: path.resolve('./media/funzioni/addio.png'),
  antiprivato: path.resolve('./media/funzioni/antiprivato.png'),
  antibot: path.resolve('./media/funzioni/antibot.png'),
  antispam: path.resolve('./media/funzioni/antispam.png'),
  antitrava: path.resolve('./media/funzioni/antitrava.png'),
  default: path.resolve('./media/default-avatar.png')
}

global.thumbCache = global.thumbCache || new Map()

export async function getThumbBuffer(feature) {
  try {
    const file = thumbs[feature] || thumbs.default
    if (!file || !fs.existsSync(file)) return null
console.log('THUMB FEATURE ->', feature)
    console.log('THUMB FILE ->', file)
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
  } catch (e) {
    console.error('Errore getThumbBuffer:', feature, e)
    return null
  }
}