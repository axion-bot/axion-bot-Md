// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import { sticker } from '../lib/sticker.js'

const S = v => String(v || '')

let handler = async (m, { conn, text }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!/image|video|webp/.test(mime)) {
      return await conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧’𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞, 𝐯𝐢𝐝𝐞𝐨 𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*'
      }, { quoted: m })
    }

    const nomeUtente = await conn.getName(m.sender)

    let packname = nomeUtente
    let author = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

    if (S(text).trim()) {
      if (text.includes('|')) {
        let [customPack, ...customAuthor] = text.split('|')

        packname = S(customPack).trim() || nomeUtente
        author = S(customAuthor.join('|')).trim()

      } else {
        packname = S(text).trim()
        author = ''
      }
    }

    let media = await q.download()

    let stiker = await sticker(
      media,
      false,
      packname,
      author
    )

    await conn.sendFile(
      m.chat,
      stiker,
      'sticker.webp',
      '',
      m,
      true
    )

  } catch (e) {
    console.error('Errore sticker.js:', e)

    await conn.sendMessage(m.chat, {
      text: '*⚠️ 𝐒𝐢 è 𝐯𝐞𝐫𝐢𝐟𝐢𝐜𝐚𝐭𝐨 𝐮𝐧 𝐞𝐫𝐫𝐨𝐫𝐞.*'
    }, { quoted: m })
  }
}

handler.help = [
  's',
  's <nome>',
  's <pack|autore>',
  'sticker',
  'stiker'
]

handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler