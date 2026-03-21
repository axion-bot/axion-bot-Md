import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn }) => {
  try {
    // reazione non bloccante
    conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    }).catch(() => null)

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!/image|video|webp/.test(mime)) {
      conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      }).catch(() => null)

      return await conn.sendMessage(m.chat, {
        text: '*『 ⚠️ 』- 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧’𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞 𝐨 𝐚 𝐮𝐧 𝐯𝐢𝐝𝐞𝐨.*'
      }, { quoted: m })
    }

    let media = await q.download()
    let stiker = await sticker(media, false, '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓', '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓')

    conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    }).catch(() => null)

    await conn.sendFile(m.chat, stiker, 'sticker.webp', null, m, true)

  } catch (e) {
    conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    }).catch(() => null)

    await conn.sendMessage(m.chat, {
      text: '*『 ⚠️ 』- 𝐒𝐢 è 𝐯𝐞𝐫𝐢𝐟𝐢𝐜𝐚𝐭𝐨 𝐮𝐧 𝐞𝐫𝐫𝐨𝐫𝐞.*'
    }, { quoted: m })
  }
}

handler.help = ['s2']
handler.tags = ['sticker']
handler.command = ['s2']

export default handler