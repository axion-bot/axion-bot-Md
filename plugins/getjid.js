let handler = async (m, { conn }) => {
  const q = m.quoted || m

  const candidates = {
    q_message: q?.message || null,
    q_msg: q?.msg || null,
    q_contextInfo_1: q?.message?.extendedTextMessage?.contextInfo || null,
    q_contextInfo_2: q?.msg?.contextInfo || null,
    q_contextInfo_3: q?.message?.imageMessage?.contextInfo || null,
    q_contextInfo_4: q?.message?.videoMessage?.contextInfo || null,
    q_contextInfo_5: q?.message?.documentMessage?.contextInfo || null,
    q_contextInfo_6: q?.message?.conversation?.contextInfo || null,
    m_message: m?.message || null,
    m_msg: m?.msg || null
  }

  let text = '*𝐃𝐄𝐁𝐔𝐆 𝐂𝐀𝐍𝐀𝐋𝐄*\n\n'

  for (const [key, val] of Object.entries(candidates)) {
    if (!val) continue
    const str = JSON.stringify(val, null, 2)
    if (str.includes('newsletter') || str.includes('forwardedNewsletterMessageInfo')) {
      text += `*${key}:*\n\`\`\`${str.slice(0, 3000)}\`\`\`\n\n`
    }
  }

  if (text === '*𝐃𝐄𝐁𝐔𝐆 𝐂𝐀𝐍𝐀𝐋𝐄*\n\n') {
    text += '𝐍𝐞𝐬𝐬𝐮𝐧 𝐝𝐚𝐭𝐨 𝐜𝐚𝐧𝐚𝐥𝐞 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.\n\n𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐢𝐧𝐨𝐥𝐭𝐫𝐚𝐭𝐨 𝐝𝐚𝐥 𝐜𝐚𝐧𝐚𝐥𝐞.'
  }

  await conn.sendMessage(m.chat, { text }, { quoted: m })
}

handler.help = ['getjid']
handler.tags = ['test']
handler.command = /^(getjid)$/i

export default handler