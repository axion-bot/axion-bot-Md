import fetch from 'node-fetch'

const getThumb = async () =>
  Buffer.from(await (await fetch('https://qu.ax/fmHdc.png')).arrayBuffer())

let handler = async (m, { conn, text, command, isOwner, isAdmin }) => {
  // ================= UTENTE =================
  let who
  if (m.isGroup)
    who = m.mentionedJid?.[0] ?? m.quoted?.sender ?? null
  else who = m.chat

  if (!who) return

  // ================= PERMESSI =================
  const senderDB = global.db.data.users[m.sender] || {}

  if (!isOwner && !isAdmin && !senderDB.premium) {
    return m.reply('⛔ *Questo comando è riservato ai MOD / PREMIUM*')
  }

  if (!global.db.data.users[who]) {
    global.db.data.users[who] = { warn: 0 }
  }

  let user = global.db.data.users[who]

  const prova = {
    key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
    message: {
      locationMessage: {
        name: '𝐀𝐭𝐭𝐞𝐧𝐳𝐢𝐨𝐧𝐞',
        jpegThumbnail: await getThumb(),
        vcard: `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:y
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  }

  // ================= WARN MOD =================
  if (command === 'warnmod') {
    user.warn = (user.warn || 0) + 1

    // messaggio warn
    await conn.reply(
      m.chat,
      `⚠️ @${who.split('@')[0]} è stato ammonito da un moderatore\n` +
      `📝 Numero totale di warn: ${user.warn}/3`,
      prova,
      { mentions: [who] }
    )

    // kick automatico al 3° warn
    if (user.warn >= 3) {
      await conn.reply(
        m.chat,
        `🚫 @${who.split('@')[0]} ha raggiunto *3 WARN*\n❌ Rimosso dal gruppo`,
        prova,
        { mentions: [who] }
      )

      await conn.groupParticipantsUpdate(m.chat, [who], 'remove')

      // reset warn dopo il kick
      user.warn = 0
    }
  }

  // ================= UNWARN MOD =================
  if (command === 'unwarnmod') {
    user.warn = 0
    await conn.reply(
      m.chat,
      `✅ @${who.split('@')[0]} non ha più warn\n` +
      `📝 Numero totale di warn: ${user.warn}`,
      prova,
      { mentions: [who] }
    )
  }
}

handler.help = ['warnmod', 'unwarnmod']
handler.command = ['warnmod', 'unwarnmod']
handler.group = true
handler.premium = false
handler.botAdmin = true

export default handler