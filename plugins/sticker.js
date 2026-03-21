import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'

const isUrl = (text = '') => {
  return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|webp)/gi.test(text)
}

let handler = async (m, { conn, args }) => {
  let stiker = false

  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime) && (q.msg || q).seconds > 10) {
        return await conn.sendMessage(m.chat, {
          text: '*『 ⏰ 』- 𝐈𝐥 𝐯𝐢𝐝𝐞𝐨 𝐝𝐞𝐯𝐞 𝐝𝐮𝐫𝐚𝐫𝐞 𝐦𝐞𝐧𝐨 𝐝𝐢 𝟏𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢 𝐩𝐞𝐫 𝐜𝐫𝐞𝐚𝐫𝐞 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*',
          ...global.rcanal
        }, { quoted: m })
      }

      const img = await q.download?.()
      if (!img) {
        return await conn.sendMessage(m.chat, {
          text: '*『 📸 』- 𝐏𝐞𝐫 𝐟𝐚𝐯𝐨𝐫𝐞 𝐢𝐧𝐯𝐢𝐚 𝐮𝐧’𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞, 𝐮𝐧 𝐯𝐢𝐝𝐞𝐨 𝐨 𝐮𝐧𝐚 𝐆𝐈𝐅 𝐩𝐞𝐫 𝐜𝐫𝐞𝐚𝐫𝐞 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*',
          ...global.rcanal
        }, { quoted: m })
      }

      try {
        const packName = global.authsticker || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
        const authorName = global.nomepack || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

        if (!global.support) {
          global.support = {
            ffmpeg: true,
            ffprobe: true,
            ffmpegWebp: true,
            convert: true,
            magick: false,
            gm: false,
            find: false
          }
        }

        stiker = await sticker(img, false, packName, authorName)
      } catch (e) {
        console.error('Errore creazione sticker diretta:', e)

        try {
          let out
          if (/image/g.test(mime)) out = await uploadImage(img)
          else if (/video/g.test(mime)) out = await uploadFile(img)
          else out = await uploadImage(img)

          if (typeof out === 'string') {
            const packName = global.authsticker || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
            const authorName = global.nomepack || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
            stiker = await sticker(false, out, packName, authorName)
          }
        } catch (uploadError) {
          console.error('Errore caricamento e creazione sticker:', uploadError)
          stiker = false
        }
      }
    } else if (args[0]) {
      if (isUrl(args[0])) {
        const packName = global.authsticker || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
        const authorName = global.nomepack || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

        if (!global.support) {
          global.support = {
            ffmpeg: true,
            ffprobe: true,
            ffmpegWebp: true,
            convert: true,
            magick: false,
            gm: false,
            find: false
          }
        }

        stiker = await sticker(false, args[0], packName, authorName)
      } else {
        return await conn.sendMessage(m.chat, {
          text: '*『 🔗 』- 𝐋’𝐔𝐑𝐋 𝐟𝐨𝐫𝐧𝐢𝐭𝐨 𝐧𝐨𝐧 è 𝐯𝐚𝐥𝐢𝐝𝐨. 𝐀𝐬𝐬𝐢𝐜𝐮𝐫𝐚𝐭𝐢 𝐜𝐡𝐞 𝐬𝐢𝐚 𝐮𝐧 𝐥𝐢𝐧𝐤 𝐝𝐢𝐫𝐞𝐭𝐭𝐨 𝐚 𝐮𝐧’𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞.*',
          ...global.rcanal
        }, { quoted: m })
      }
    }
  } catch (e) {
    console.error('Errore nel gestore sticker:', e)
    stiker = false
  }

  if (stiker && stiker !== true) {
    await conn.sendFile(
      m.chat,
      stiker,
      'sticker.webp',
      null,
      m,
      true
    )
  } else {
    return await conn.sendMessage(m.chat, {
      text: '*『 ⚠️ 』- 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧’𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞, 𝐚 𝐮𝐧 𝐯𝐢𝐝𝐞𝐨 𝐨 𝐚 𝐮𝐧𝐚 𝐆𝐈𝐅 𝐩𝐞𝐫 𝐜𝐫𝐞𝐚𝐫𝐞 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫, 𝐨𝐩𝐩𝐮𝐫𝐞 𝐢𝐧𝐯𝐢𝐚 𝐮𝐧 𝐔𝐑𝐋 𝐝𝐢 𝐮𝐧’𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞.*',
      ...global.rcanal
    }, { quoted: m })
  }
}

handler.help = ['s', 'sticker', 'stiker']
handler.tags = ['sticker', 'strumenti']
handler.command = ['s', 'sticker', 'stiker','porcamadonna']
handler.register = true

export default handler