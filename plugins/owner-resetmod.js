import fetch from 'node-fetch'

const handler = async (m, { conn }) => {

  if (!m.isGroup)
    return m.reply('❌ Questo comando funziona solo nei gruppi.')

  const users = global.db.data.users
  let removed = []

  // rimuove solo i MOD di questo gruppo
  for (let jid in users) {
    if (users[jid].premium && users[jid].premiumGroup === m.chat) {
      users[jid].premium = false
      delete users[jid].premiumGroup
      removed.push(jid)
    }
  }

  if (removed.length === 0)
    return m.reply('ℹ️ Non ci sono moderatori da rimuovere in questo gruppo.')

  // thumbnail del gruppo
  let thumb = null
  try {
    const pp = await conn.profilePictureUrl(m.chat, 'image')
    const res = await fetch(pp)
    thumb = await res.buffer()
  } catch {}

  const list = removed
    .map((jid, i) => `☠️ ${i + 1}. @${jid.split('@')[0]}`)
    .join('\n')

  // messaggio semplice
  const caption = `Tutti i moderatori di questo gruppo sono stati rimossi.\n\nUtenti rimossi:\n${list}`

  await conn.sendMessage(
    m.chat,
    {
      text: caption,
      mentions: removed,
      contextInfo: thumb ? { jpegThumbnail: thumb } : {}
    },
    { quoted: m }
  )
}

handler.help = ['resetmod']
handler.tags = ['owner']
handler.command = ['resetmod']
handler.group = true
handler.rowner = true

export default handler