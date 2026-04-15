// by Bonzino

async function sendWelcomeGoodbye(conn, id, participants, action) {
  const chat = global.db?.data?.chats?.[id]
  if (!chat || (!chat.welcome && !chat.goodbye)) return

  let metadata
  try {
    metadata = await conn.groupMetadata(id)
  } catch {}

  const groupName = metadata?.subject || 'Gruppo'

  for (const who of participants || []) {
    const jid = conn.decodeJid(who)
    const cleanUserId = jid.split('@')[0]

    let text = ''

    if (action === 'add' && chat.welcome) {
      text = `@${cleanUserId} 𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 𝐬𝐮 ${groupName}`
    }

    if ((action === 'remove' || action === 'leave') && chat.goodbye) {
      text = `@${cleanUserId} 𝐡𝐚 𝐚𝐛𝐛𝐚𝐧𝐝𝐨𝐧𝐚𝐭𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨`
    }

    if (!text) continue

    await conn.sendMessage(id, {
      text,
      mentions: [jid]
    })
  }
}

let handler = async (m, { conn, command }) => {
  if (!m.isGroup) return

  const action = /^testwelcome$/i.test(command) ? 'add' : 'remove'
  await sendWelcomeGoodbye(conn, m.chat, [m.sender], action)
}

handler.participantsUpdate = async function ({ id, participants, action }) {
  const conn = this
  await sendWelcomeGoodbye(conn, id, participants, action)
}

handler.help = ['testwelcome', 'testaddio']
handler.tags = ['group']
handler.command = /^(testwelcome|testaddio)$/i
handler.admin = true
handler.group = true

export default handler