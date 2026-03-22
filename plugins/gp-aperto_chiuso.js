let handler = async (m, { conn, command }) => {
  let isOpen = command === 'aperto'

  await conn.groupSettingUpdate(
    m.chat,
    isOpen ? 'not_announcement' : 'announcement'
  )

  await conn.sendMessage(m.chat, {
    text: isOpen
      ? '𝐆𝐫𝐮𝐩𝐩𝐨 𝐚𝐩𝐞𝐫𝐭𝐨, 𝐨𝐫𝐚 𝐭𝐮𝐭𝐭𝐢 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞'
      : '𝐆𝐫𝐮𝐩𝐩𝐨 𝐜𝐡𝐢𝐮𝐬𝐨, 𝐬𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞',
    contextInfo: {
      forwardingScore: 99,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '',
        serverMessageId: '',
        newsletterName: global.db.data.nomedelbot || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
      }
    }
  })
}

handler.help = ['aperto', 'chiuso']
handler.tags = ['group']
handler.command = /^(aperto|chiuso)$/i
handler.admin = true
handler.botAdmin = true

export default handler