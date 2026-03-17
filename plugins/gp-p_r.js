var handler = async (m, { conn, text, command }) => {
  let action, successTitle, errorMsg
  let sender = m.sender

  // 🔥 PRENDE TUTTI GLI UTENTI TAGGATI
  let users = []

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    users = m.mentionedJid
  } else if (m.quoted && m.quoted.sender) {
    users = [m.quoted.sender]
  } else if (text) {
    let numbers = text.split(/[\s,]+/).filter(v => !isNaN(v))
    users = numbers.map(n => n + '@s.whatsapp.net')
  }

  if (!users.length) {
    return conn.reply(m.chat, '⚠️ 𝚫𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 • Devi menzionare almeno un utente per il rituale!', m)
  }

  if (['promote', 'promuovi', 'p', 'p2'].includes(command)) {
    action = 'promote'
    successTitle = '⚡ 𝐏𝐑𝐎𝐌𝐎𝐙𝐈𝐎𝐍𝐄 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐀 ⚡'
    errorMsg = '💀 Il rituale di potere è fallito!'
  }

  if (['demote', 'retrocedi', 'r'].includes(command)) {
    action = 'demote'
    successTitle = '☠️ 𝐑𝐄𝐓𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐎𝐍𝐄 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐀 ☠️'
    errorMsg = '💀 Tentativo di abbassamento fallito!'
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, users, action)

    let tagList = users.map(u => '@' + u.split('@')[0]).join(' ')

    let successMsg = `
╭━━━⚡ 𝚫𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 ⚡━━━╮
│ 🔥 𝐑𝐈𝐓𝐔𝐀𝐋𝐄 𝐃𝐈 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐄𝐒𝐄𝐆𝐔𝐈𝐓𝐎
│
│ 👥 𝐁𝐞𝐫𝐬𝐚𝐠𝐥𝐢: ${tagList}
│ ✨ 𝐀𝐳𝐢𝐨𝐧𝐞: ${successTitle}
│ 🕷️ 𝐃𝐚: @${sender.split('@')[0]}
│
│ ☠️ 𝚫𝐗𝐈𝚶𝐍 osserva...
╰━━━━━━━━━━━━━━━━╯
`.trim()

    conn.reply(m.chat, successMsg, m, {
      mentions: [sender, ...users]
    })

  } catch (e) {
    conn.reply(m.chat, `💀 ${errorMsg}`, m)
  }
}

handler.command = ['promote', 'promuovi', 'p', 'p2', 'demote', 'retrocedi', 'r']
handler.group = true
handler.owner = true
handler.botAdmin = true

export default handler
