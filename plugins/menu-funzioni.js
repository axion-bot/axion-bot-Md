import fs from 'fs'
import fetch from 'node-fetch'

function stato(value) {
  return value ? '🟢 *𝐀𝐭𝐭𝐢𝐯𝐨*' : '⚪ *𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐨*'
}

let handler = async (m, { conn, usedPrefix }) => {
  const chat = global.db?.data?.chats?.[m.chat] || {}
  const bot = global.db?.data?.settings?.[conn.user.jid] || {}

  let pp = null
  try {
    pp = await conn.profilePictureUrl(m.sender, 'image')
  } catch {}

  let thumbnail = null
  try {
    if (pp) {
      const res = await fetch(pp)
      if (res.ok) thumbnail = Buffer.from(await res.arrayBuffer())
    }
  } catch {}

  if (!thumbnail) {
    try {
      thumbnail = fs.readFileSync('./media/default-avatar.png')
    } catch {}
  }

  const text = `╭━━━━━━━⚙️━━━━━━━╮
*✦ 𝐀𝐗𝐈𝐎𝐍 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐈 ✦*
╰━━━━━━━⚙️━━━━━━━╯

*🛡️ 𝐒𝐢𝐜𝐮𝐫𝐞𝐳𝐳𝐚*
*◈ 𝐀𝐧𝐭𝐢𝐥𝐢𝐧𝐤:* ${stato(chat.antiLink)}
*◈ 𝐀𝐧𝐭𝐢𝐬𝐩𝐚𝐦:* ${stato(chat.antispam)}
*◈ 𝐀𝐧𝐭𝐢𝐛𝐨𝐭:* ${stato(chat.antiBot)}
*◈ 𝐀𝐧𝐭𝐢𝐓𝐚𝐠:* ${stato(chat.antiTag)}
*◈ 𝐀𝐧𝐭𝐢𝐩𝐨𝐫𝐧𝐨:* ${stato(chat.antiporno)}
*◈ 𝐀𝐧𝐭𝐢𝐠𝐨𝐫𝐞:* ${stato(chat.antigore)}
*◈ 𝐀𝐧𝐭𝐢𝐭𝐫𝐚𝐯𝐚:* ${stato(chat.antitrava)}
*◈ 𝐀𝐧𝐭𝐢𝐌𝐞𝐝𝐢𝐚:* ${stato(chat.antimedia)}

*📱 𝐑𝐞𝐭𝐞*
*◈ 𝐀𝐧𝐭𝐢𝐈𝐧𝐬𝐭𝐚:* ${stato(chat.antiInsta)}
*◈ 𝐀𝐧𝐭𝐢𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦:* ${stato(chat.antiTelegram)}
*◈ 𝐀𝐧𝐭𝐢𝐓𝐢𝐤𝐓𝐨𝐤:* ${stato(chat.antiTiktok)}

*⚙️ 𝐆𝐞𝐬𝐭𝐢𝐨𝐧𝐞*
*◈ 𝐌𝐨𝐝𝐨 𝐀𝐝𝐦𝐢𝐧:* ${stato(chat.modoadmin)}
*◈ 𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨:* ${stato(chat.welcome)}
*◈ 𝐀𝐝𝐝𝐢𝐨:* ${stato(chat.goodbye)}

*🔒 𝐏𝐫𝐢𝐯𝐚𝐭𝐨*
*◈ 𝐀𝐧𝐭𝐢𝐩𝐫𝐢𝐯𝐚𝐭𝐨:* ${stato(bot.antiprivato)}

*──────────────*

*🟢 𝐀𝐭𝐭𝐢𝐯𝐚:* *${usedPrefix}1 <funzione>*
*⚪ 𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚:* *${usedPrefix}0 <funzione>*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

await conn.sendMessage(m.chat, {
  text,
  footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
  buttons: [
    {
      buttonId: `${usedPrefix}menu`,
      buttonText: {
        displayText: '⬅️ Menu Principale'
      },
      type: 1
    }
  ],
  headerType: 1,
  contextInfo: {
    ...(global.rcanal?.contextInfo || {}),
    ...(thumbnail ? {
      externalAdReply: {
        title: '𝐀𝐗𝐈𝐎𝐍 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐈',
        body: 'Stato moduli del sistema',
        thumbnail,
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    } : {})
  }
}, { quoted: m })
}

handler.help = ['funzioni']
handler.tags = ['group']
handler.command = /^(funzioni|statusfunzioni|moduli)$/i

export default handler