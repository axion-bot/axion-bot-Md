// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

let handler = async (m, { conn }) => {
  const getToday = () => {
    const d = new Date()
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
  }

  const today = getToday()

  if (!global.db.data.toptimeDaily) global.db.data.toptimeDaily = { days: {} }
  if (!global.db.data.toptimeDaily.days[today]) global.db.data.toptimeDaily.days[today] = { chats: {} }
  if (!global.db.data.toptimeDaily.days[today].chats[m.chat]) global.db.data.toptimeDaily.days[today].chats[m.chat] = {}

  const chatData = global.db.data.toptimeDaily.days[today].chats[m.chat]
  const user = chatData[m.sender] || { time: 0 }

  const timeMs = user.time || 0
  const h = Math.floor(timeMs / 3600000)
  const m_ = Math.floor((timeMs % 3600000) / 60000)
  const s = Math.floor((timeMs % 60000) / 1000)

  const tag = `@${m.sender.split('@')[0]}`

  const text = `*╭━━━━━━━🕒━━━━━━━╮*
*✦ 𝐓𝐄𝐌𝐏𝐎 𝐎𝐍𝐋𝐈𝐍𝐄 ✦*
*╰━━━━━━━🕒━━━━━━━╯*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}
*⏱️ 𝐎𝐠𝐠𝐢:* ${h}𝐡 ${m_}𝐦 ${s}𝐬`

  await conn.sendMessage(m.chat, {
    text,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.command = /^(tempo)$/i

export default handler