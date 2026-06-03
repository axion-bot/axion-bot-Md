//by Bonzino

let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return m.reply('*⚠️ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐥𝐚 𝐧𝐮𝐨𝐯𝐚 𝐝𝐞𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*')
    }

    await conn.groupUpdateDescription(m.chat, text)

    await conn.sendMessage(
      m.chat,
      {
        text: `*✅ 𝐃𝐞𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐚!*\n\n*📌 𝐍𝐮𝐨𝐯𝐚 𝐛𝐢𝐨:*\n${text}`
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('setbio error:', e)
    throw new Error(`❌ 𝐄𝐫𝐫𝐨𝐫𝐞\n\n${e.message || e}`)
  }
}

handler.help = ['setbio <testo>']
handler.tags = ['gruppo']
handler.command = ['setbio,setdescrizione,descrizione']
handler.admin = true
handler.group = true

export default handler