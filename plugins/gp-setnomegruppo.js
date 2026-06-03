//plugin setnomegruppo by Bonzino

let handler = async (m, { conn, text, isBotAdmin, isAdmin }) => {

  if (!m.isGroup) {
    return m.reply('*❌ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐚 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢.*')
  }

  if (!isBotAdmin) {
    return m.reply('*❌ 𝐈𝐥 𝐛𝐨𝐭 𝐝𝐞𝐯𝐞 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐦𝐦𝐢𝐧 𝐩𝐞𝐫 𝐜𝐚𝐦𝐛𝐢𝐚𝐫𝐞 𝐢𝐥 𝐧𝐨𝐦𝐞.*')
  }

  if (!isAdmin) {
    return m.reply('*❌ 𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐦𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*')
  }

  if (!text) {
    return conn.reply(
      m.chat,
      `╭━━━━━━━✏️━━━━━━━╮
*✦ 𝐍𝐎𝐌𝐄 𝐆𝐑𝐔𝐏𝐏𝐎 ✦*
╰━━━━━━━✏️━━━━━━━╯

*📌 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐧𝐮𝐨𝐯𝐨 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*

*📍 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*.setname Nome Gruppo*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  try {

    await conn.groupUpdateSubject(m.chat, text)

    await conn.reply(
      m.chat,
      `*📌 𝐈𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 è 𝐬𝐭𝐚𝐭𝐨 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐨.*

*📝 𝐍𝐨𝐦𝐞 𝐠𝐫𝐮𝐩𝐩𝐨:*  
*${text}*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )

  } catch (e) {

    console.error('Errore setname:', e)

    return m.reply('*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐢𝐥 𝐜𝐚𝐦𝐛𝐢𝐨 𝐝𝐞𝐥 𝐧𝐨𝐦𝐞.*')
  }
}

handler.help = ['setname <nome gruppo>']
handler.tags = ['group']
handler.command = /^setname$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler