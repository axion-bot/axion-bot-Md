import { addExif } from '../lib/sticker.js'

let handler = async (m, { conn, text }) => {

  if (!m.quoted) {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⚠️',
        key: m.key
      }
    })

    return conn.reply(
      m.chat,
      '*𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐝 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐩𝐞𝐫 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐥𝐢𝐳𝐳𝐚𝐫𝐥𝐨.*\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*',
      m
    )
  }

  let sticker = false

  try {

    await conn.sendMessage(m.chat, {
      react: {
        text: '🛠️',
        key: m.key
      }
    })

    if (!text) {
      const name = await conn.getName(m.sender)
      text = `${name}|𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`
    }

    let [packname, ...author] = text.split('|')
    author = (author || []).join('|')

    const mime = m.quoted.mimetype || ''

    if (!/webp/.test(mime)) {

      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      })

      return conn.reply(
        m.chat,
        '*𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐝 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*',
        m
      )
    }

    const img = await m.quoted.download()

    if (!img) {
      throw new Error('Sticker download failed')
    }

    sticker = await addExif(
      img,
      packname || '',
      author || ''
    )

  } catch (e) {

    console.error('sticker-wm error:', e)

    await conn.sendMessage(m.chat, {
      react: {
        text: '❌',
        key: m.key
      }
    })

    return conn.reply(
      m.chat,
      '*𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐥𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥𝐥𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*',
      m
    )

  } finally {

    if (sticker) {

      await conn.sendMessage(m.chat, {
        react: {
          text: '✅',
          key: m.key
        }
      })

      await conn.sendFile(
        m.chat,
        sticker,
        'axion.webp',
        '',
        m
      )
    }
  }
}

handler.help = ['take']
handler.tags = ['sticker']
handler.command = /^(take|wm)$/i

export default handler