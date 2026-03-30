// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import fetch from 'node-fetch'

const S = v => String(v || '')

const handler = async (m, { conn }) => {

  if (!m.isGroup) {
    return m.reply('*⚠️ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐚 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢.*')
  }

  const users = global.db.data.users || {}
  const groupMods = []

  for (let jid in users) {
    if (users[jid].premium && users[jid].premiumGroup === m.chat) {
      groupMods.push(jid)
    }
  }

  if (groupMods.length === 0) {
    return m.reply('*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐦𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐢 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨.*')
  }

  let thumb = 'https://i.ibb.co/2kR7x9J/avatar.png'
  try {
    thumb = await conn.profilePictureUrl(m.chat, 'image')
  } catch {}

  const thumbnailBuffer = typeof thumb === 'string'
    ? await (await fetch(thumb)).buffer()
    : thumb

  const list = groupMods
    .map((jid, i) => `🛡️ ${i + 1}. @${jid.split('@')[0]}`)
    .join('\n')

  const text = `*╭━━━━━━━🛡️━━━━━━━╮*
*✦ 𝐌𝐎𝐃𝐄𝐑𝐀𝐓𝐎𝐑𝐈 ✦*
*╰━━━━━━━🛡️━━━━━━━╯*

${list}`

  await conn.sendMessage(m.chat, {
    text,
    mentions: groupMods,
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      externalAdReply: {
        title: 'Moderatori del gruppo',
        body: ' ',
        thumbnail: thumbnailBuffer,
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.help = ['listmod']
handler.tags = ['group']
handler.command = ['listamod']
handler.group = true

export default handler