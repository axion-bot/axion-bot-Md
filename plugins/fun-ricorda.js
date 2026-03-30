// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

const S = v => String(v || '')

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(`*╭━━━━━━━⏰━━━━━━━╮*
*✦ 𝐏𝐑𝐎𝐌𝐄𝐌𝐎𝐑𝐈𝐀 ✦*
*╰━━━━━━━⏰━━━━━━━╯*

*𝐔𝐬𝐨:*  
.ricorda 16:23 messaggio`)
  }

  const args = S(text).trim().split(/\s+/)
  const time = args.shift()
  const message = args.join(' ')

  if (!time || !message) {
    return m.reply(`*𝐅𝐨𝐫𝐦𝐚𝐭𝐨 𝐜𝐨𝐫𝐫𝐞𝐭𝐭𝐨:*  
.ricorda HH:MM messaggio`)
  }

  const [hour, minute] = time.split(':').map(Number)

  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return m.reply('*𝐎𝐫𝐚𝐫𝐢𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.*')
  }

  const now = new Date()
  const target = new Date()

  target.setHours(hour)
  target.setMinutes(minute)
  target.setSeconds(0)
  target.setMilliseconds(0)

  if (target <= now) target.setDate(target.getDate() + 1)

  const delay = target - now
  const tag = `@${m.sender.split('@')[0]}`

  await m.reply(`*╭━━━━━━━⏰━━━━━━━╮*
*✦ 𝐏𝐑𝐎𝐌𝐄𝐌𝐎𝐑𝐈𝐀 𝐒𝐀𝐋𝐕𝐀𝐓𝐎 ✦*
*╰━━━━━━━⏰━━━━━━━╯*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}
*🕒 𝐎𝐫𝐚𝐫𝐢𝐨:* ${time}
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨:* ${message}

*✔️ 𝐏𝐫𝐨𝐦𝐞𝐦𝐨𝐫𝐢𝐚 𝐩𝐫𝐨𝐠𝐫𝐚𝐦𝐦𝐚𝐭𝐨.*`, null, { mentions: [m.sender] })

  setTimeout(async () => {
    try {
      let msg

      if (delay > 5000) {
        msg = await conn.sendMessage(m.chat, {
          text: `*╭━━━━━━━⏳━━━━━━━╮*
*✦ 𝐏𝐑𝐎𝐌𝐄𝐌𝐎𝐑𝐈𝐀 𝐈𝐍 𝐀𝐑𝐑𝐈𝐕𝐎 ✦*
*╰━━━━━━━⏳━━━━━━━╯*

*⌛ 𝟓 𝐬𝐞𝐜𝐨𝐧𝐝𝐢*`
        }, { quoted: m })

        for (let i = 4; i > 0; i--) {
          await new Promise(r => setTimeout(r, 1000))
          await conn.sendMessage(m.chat, {
            text: `*╭━━━━━━━⏳━━━━━━━╮*
*✦ 𝐏𝐑𝐎𝐌𝐄𝐌𝐎𝐑𝐈𝐀 𝐈𝐍 𝐀𝐑𝐑𝐈𝐕𝐎 ✦*
*╰━━━━━━━⏳━━━━━━━╯*

*⌛ ${i} 𝐬𝐞𝐜𝐨𝐧𝐝𝐢*`,
            edit: msg.key
          })
        }
      } else if (delay > 0) {
        await new Promise(r => setTimeout(r, Math.max(delay - 1000, 0)))
      }

      await conn.sendMessage(m.chat, {
        text: `*╭━━━━━━━⏰━━━━━━━╮*
*✦ 𝐏𝐑𝐎𝐌𝐄𝐌𝐎𝐑𝐈𝐀 ✦*
*╰━━━━━━━⏰━━━━━━━╯*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨:* ${message}
*🕒 𝐎𝐫𝐚𝐫𝐢𝐨:* ${time}

> 𝐃𝐞𝐯 𝐛𝐲 𝐁𝐨𝐧𝐳𝐢𝐧𝐨`,
        mentions: [m.sender]
      }, { quoted: m })
    } catch (e) {
      console.error(e)
    }
  }, Math.max(delay - 5000, 0))
}

handler.help = ['ricorda']
handler.tags = ['utility']
handler.command = /^ricorda$/i

export default handler