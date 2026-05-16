let handler = async (m, { conn }) => {
  try {
    if (!m.quoted) {
      return m.reply('*⚠️ 𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌: 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐜𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐯𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚𝐛𝐢𝐥𝐞 𝐮𝐧𝐚 𝐬𝐨𝐥𝐚 𝐯𝐨𝐥𝐭𝐚.*')
    }

    if (!m.quoted?.viewOnce) {
      return m.reply('*⚠️ 𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌: 𝐐𝐮𝐞𝐬𝐭𝐨 𝐧𝐨𝐧 𝐞̀ 𝐮𝐧 𝐜𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐯𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚𝐛𝐢𝐥𝐞 𝐮𝐧𝐚 𝐬𝐨𝐥𝐚 𝐯𝐨𝐥𝐭𝐚.*')
    }

    const mtype = m.quoted.mtype
    if (!/videoMessage|imageMessage|audioMessage/.test(mtype)) {
      return m.reply('*❌ 𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌: 𝐅𝐨𝐫𝐦𝐚𝐭𝐨 𝐧𝐨𝐧 𝐬𝐮𝐩𝐩𝐨𝐫𝐭𝐚𝐭𝐨.*')
    }

    let buffer = await m.quoted.download().catch(() => null)

    if (!buffer || !buffer.length) {
      return m.reply('*❌ 𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌: 𝐈𝐦𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞 𝐬𝐜𝐚𝐫𝐢𝐜𝐚𝐫𝐞 𝐢𝐥 𝐜𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 (𝐌𝐞𝐝𝐢𝐚 𝐊𝐞𝐲 𝐬𝐜𝐚𝐝𝐮𝐭𝐚).*')
    }

    const caption = m.quoted?.caption || ''

    if (/videoMessage/.test(mtype)) {
      await conn.sendFile(m.chat, buffer, 'video.mp4', caption, m)
    } else if (/imageMessage/.test(mtype)) {
      await conn.sendFile(m.chat, buffer, 'image.jpg', caption, m)
    } else if (/audioMessage/.test(mtype)) {
      await conn.sendFile(m.chat, buffer, 'audio.mp3', '', m, false, {
        mimetype: 'audio/mp4',
        ptt: m.quoted.ptt || false
      })
    }

  } catch (e) {
    console.error(e)
    return m.reply('*❌ 𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌: Errore durante il recupero dei dati.*')
  }
}

handler.help = ['rivela']
handler.tags = ['group']
handler.command = ['readviewonce', 'rivela', 'viewonce']
handler.group = true
handler.admin = true

export default handler
