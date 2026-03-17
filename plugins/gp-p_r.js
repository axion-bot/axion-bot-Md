var handler = async (m, { conn, text, command }) => {
  let action, icon, title, effect
  let sender = m.sender

  // Identificazione utenti (Tag, Quoted o Numero)
  let users = m.mentionedJid && m.mentionedJid.length > 0 
    ? m.mentionedJid 
    : (m.quoted ? [m.quoted.sender] : [])

  if (!users.length && text) {
    let numbers = text.split(/[\s,]+/).filter(v => !isNaN(v))
    users = numbers.map(n => n + '@s.whatsapp.net')
  }

  if (!users.length) {
    return conn.reply(m.chat, '⚠️ 𝚫𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 • 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐛𝐞𝐫𝐬𝐚𝐠𝐥𝐢𝐨 𝐩𝐞𝐫 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.', m)
  }

  // Configurazione Azione
  if (['promote', 'promuovi', 'p', 'p2'].includes(command)) {
    action = 'promote'
    icon = '⛩️'
    title = '𝐄𝐋𝐄𝐕𝐀𝐙𝐈𝐎𝐍𝐄'
  } else {
    action = 'demote'
    icon = '⚙️'
    title = '𝐑𝐄𝐕𝐎𝐂𝐀𝐓𝐎'
    effect = '𝐏𝐎𝐓𝐄𝐑𝐄 𝐑𝐄𝐕𝐎𝐂𝐀𝐓𝐎'
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, users, action)
    
    let tagList = users.map(u => ' @' + u.split('@')[0]).join('\n│ 👥 ')

    let axionMsg = `
┏━━━━━━━━━━━━━━━━━━┓
┃    🔱  𝚫𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌  🔱
┗━━━━━━━━━━━━━━━━━━┛
│
│ 🛠️ 𝐎𝐏𝐄𝐑𝐀𝐙𝐈𝐎𝐍𝐄: ${title}
│ 📊 𝐒𝐓𝐀𝐓𝐔𝐒: 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐎
│
│ 👤 𝐄𝐒𝐄𝐂𝐔𝐓𝐎𝐑𝐄: @${sender.split('@')[0]}
│ 👥 𝐁𝐄𝐑𝐒𝐀𝐆𝐋𝐈:
│ 👥 ${tagList}
│
┃ 🔗 𝚫𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 
┗━━━━━━━━━━━━━━━━━━┛`.trim()

    await conn.sendMessage(m.chat, {
      text: axionMsg,
      mentions: [sender, ...users]
    }, { quoted: m })

  } catch (e) {
    conn.reply(m.chat, `❌ 𝚫𝐗𝐈𝚶𝐍 𝐄𝐑𝐑𝐎𝐑: 𝐈𝐦𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚𝐑𝐞 𝐢 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢.`, m)
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['admin']
handler.command = ['promote', 'promuovi', 'p', 'p2', 'demote', 'retrocedi', 'r']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
