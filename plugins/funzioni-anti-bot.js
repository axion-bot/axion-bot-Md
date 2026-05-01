// Plugin AntiBot by Bonzino

let whitelist = []

function rilevaDispositivoCheck(msgID = '') {
  if (!msgID) return 'sconosciuto'

  if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) return 'bot'
  if (msgID.startsWith('false_') || msgID.startsWith('true_')) return 'web'
  if (msgID.startsWith('3EB0') && /^[A-Z0-9]+$/.test(msgID)) return 'webbot'
  if (msgID.includes(':')) return 'desktop'
  if (/^[A-F0-9]{32}$/i.test(msgID)) return 'android'
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)) return 'ios'
  if (/^[A-Z0-9]{20,25}$/i.test(msgID) && !msgID.startsWith('3EB0')) return 'ios'
  if (msgID.startsWith('3EB0')) return 'android_old'

  return 'sconosciuto'
}

export async function before(m, { conn, isOwner, isROwner }) {
  if (!m.isGroup || !m.sender || !m.key?.id) return true
  if (m.fromMe || m.isBaileys) return true
  if (isOwner || isROwner) return true

  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiBot) return true

  const msgID = m.key.id
  const device = rilevaDispositivoCheck(msgID)

  const sospettiDispositivi = ['bot', 'web', 'webbot']
  if (!sospettiDispositivi.includes(device)) return true

  const metadata = await conn.groupMetadata(m.chat)
  const botNumber = conn.decodeJid(conn.user?.jid || conn.user?.id || '')
  const owner = metadata.owner || ''
  const participants = metadata.participants || []

  const autorizzati = [botNumber, owner, ...whitelist]
  if (autorizzati.includes(m.sender)) return true

  const currentAdmins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  const isAdminUser = currentAdmins.includes(m.sender)
  const senderTag = m.sender.split('@')[0]

  if (isAdminUser) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'demote')

      await conn.sendMessage(m.chat, {
        text: `╭━━━━━━━🤖━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐁𝐎𝐓 ✦*
╰━━━━━━━🤖━━━━━━━╯

*@${senderTag}*
*⚠️ 𝐑𝐢𝐥𝐞𝐯𝐚𝐭𝐨 𝐜𝐨𝐦𝐞 𝐛𝐨𝐭 / 𝐜𝐥𝐢𝐞𝐧𝐭 𝐬𝐨𝐬𝐩𝐞𝐭𝐭𝐨*
*📱 𝐃𝐢𝐬𝐩𝐨𝐬𝐢𝐭𝐢𝐯𝐨:* *${device.toUpperCase()}*
*⬇️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐬𝐭𝐚𝐭𝐨 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐨*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
        mentions: [m.sender]
      }, { quoted: m })
    } catch (e) {
      console.error('Errore retrocessione admin antibot:', e)
    }
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')

    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🤖━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐁𝐎𝐓 ✦*
╰━━━━━━━🤖━━━━━━━╯

*@${senderTag}*
*🚷 𝐑𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*
*📱 𝐃𝐢𝐬𝐩𝐨𝐬𝐢𝐭𝐢𝐯𝐨:* *${device.toUpperCase()}*
*📌 𝐌𝐨𝐭𝐢𝐯𝐨:* *𝐂𝐥𝐢𝐞𝐧𝐭 / 𝐁𝐨𝐭 𝐬𝐨𝐬𝐩𝐞𝐭𝐭𝐨*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [m.sender]
    }, { quoted: m })
  } catch (e) {
    console.error('Errore rimozione antibot:', e)

    await conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🤖━━━━━━━╮
*✦ 𝐀𝐍𝐓𝐈 𝐁𝐎𝐓 ✦*
╰━━━━━━━🤖━━━━━━━╯

*@${senderTag}*
*⚠️ 𝐑𝐢𝐥𝐞𝐯𝐚𝐭𝐨 𝐜𝐨𝐦𝐞 𝐜𝐥𝐢𝐞𝐧𝐭 𝐬𝐨𝐬𝐩𝐞𝐭𝐭𝐨*
*📱 𝐃𝐢𝐬𝐩𝐨𝐬𝐢𝐭𝐢𝐯𝐨:* *${device.toUpperCase()}*
*❌ 𝐍𝐨𝐧 𝐬𝐨𝐧𝐨 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐥𝐨*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  return true
}