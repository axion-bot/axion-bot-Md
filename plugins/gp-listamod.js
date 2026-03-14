import fetch from 'node-fetch'

const handler = async (m, { conn }) => {

  if (!m.isGroup)
    return m.reply('❌ Questo comando funziona solo nei gruppi.')

  const users = global.db.data.users
  const groupMods = []

  // raccoglie solo i MOD di questo gruppo
  for (let jid in users) {
    if (users[jid].premium && users[jid].premiumGroup === m.chat) {
      groupMods.push(jid)
    }
  }

  if (groupMods.length === 0)
    return m.reply('ℹ️ Non ci sono moderatori in questo gruppo.')

  // thumbnail del gruppo
  let thumb = null
  try {
    const pp = await conn.profilePictureUrl(m.chat, 'image')
    const res = await fetch(pp)
    thumb = await res.buffer()
  } catch {}

  const list = groupMods
    .map((jid, i) => `🛡️ ${i + 1}. @${jid.split('@')[0]}`)
    .join('\n')

  const caption = `Ecco la lista dei moderatori di questo gruppo:\n\n${list}`

  await conn.sendMessage(
    m.chat,
    {
      text: caption,
      mentions: groupMods,
      contextInfo: thumb ? { jpegThumbnail: thumb } : {}
    },
    { quoted: m }
  )
}

handler.help = ['listmod']
handler.tags = ['group']
handler.command = ['listmod']
handler.group = true
handler.rowner = true

export default handler