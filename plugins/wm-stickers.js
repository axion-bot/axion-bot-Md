import { addExif } from '../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!m.quoted) return m.reply(`『 ◈ 』 - \`𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥𝐥𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐜𝐡𝐞 𝐯𝐮𝐨𝐢 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐥𝐢𝐳𝐳𝐚𝐫𝐞\``)

  let stiker = false
  try {
    if (!text) {
      let name = conn.getName(m.sender)
      text = `${name}|𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`
    }

    let [packname, ...author] = text.split('|')
    author = (author || []).join('|')
    let mime = m.quoted.mimetype || ''
    if (!/webp/.test(mime)) return m.reply(`『 ◈ 』- \`𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫\``)

    let img = await m.quoted.download()
    if (!img) return m.reply(`${global.errore}`)
    stiker = await addExif(img, packname || '', author || '')

  } catch (e) {
    console.error('Errore in sticker-wm:', e)
    if (Buffer.isBuffer(e)) stiker = e
  } finally {
    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'wm.webp', '', m)
    } else {
      m.reply(`${global.errore}`)
    }
  }
}

handler.help = ['wm']
handler.tags = ['sticker', 'strumenti']
handler.command = ['take', 'wm']

export default handler
