// axionsystem by Bonzino

import { getThumbBuffer } from './thumb.js'

const AXION_TITLE = 'ㅤ  𝚫𝐗𝐈𝐎𝐍 • 𝐒𝐘𝐒𝐓𝐄𝐌'

export async function axionSystem(conn, chat, { text, thumb = 'default', mentions = [], quoted = null } = {}) {
  const thumbnail = await getThumbBuffer(thumb)

  return conn.sendMessage(chat, {
    text,
    mentions,
    contextInfo: {
      mentionedJid: mentions,
      externalAdReply: {
        title: AXION_TITLE,
        thumbnail,
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    }
  }, quoted ? { quoted } : {})
}

export function axionFooter(text) {
  return `${text}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
}