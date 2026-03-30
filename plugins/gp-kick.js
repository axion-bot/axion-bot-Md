// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

const S = v => String(v || '')

async function handler(m, { isBotAdmin, conn }) {
  if (!isBotAdmin) {
    return await conn.sendMessage(m.chat, {
      text: '*𝐃𝐞𝐯𝐨 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐝𝐦𝐢𝐧 𝐩𝐞𝐫 𝐩𝐨𝐭𝐞𝐫 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞.*'
    }, { quoted: m })
  }

  const mention = m.mentionedJid?.[0] || m.quoted?.sender || null

  if (!mention) {
    return await conn.sendMessage(m.chat, {
      text: '*𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐨 𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞.*'
    }, { quoted: m })
  }

  const ownerJids = Array.isArray(global.owner)
    ? global.owner.map(o => `${Array.isArray(o) ? o[0] : o}@s.whatsapp.net`)
    : []

  if (ownerJids.includes(mention)) {
    return await conn.sendMessage(m.chat, {
      text: '*𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐮𝐧 𝐎𝐰𝐧𝐞𝐫.*'
    }, { quoted: m })
  }

  if (mention === conn.user.jid) {
    return await conn.sendMessage(m.chat, {
      text: '*𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐢𝐥 𝐛𝐨𝐭.*'
    }, { quoted: m })
  }

  if (mention === m.sender) {
    return await conn.sendMessage(m.chat, {
      text: '*𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐭𝐞 𝐬𝐭𝐞𝐬𝐬𝐨.*'
    }, { quoted: m })
  }

  const groupMetadata = await conn.groupMetadata(m.chat)
  const participant = groupMetadata.participants.find(u => u.id === mention)

  if (participant?.admin === 'admin' || participant?.admin === 'superadmin') {
    return await conn.sendMessage(m.chat, {
      text: '*𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐮𝐧 𝐚𝐝𝐦𝐢𝐧.*'
    }, { quoted: m })
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [mention], 'remove')

    await conn.sendMessage(m.chat, {
      text: `*╭━━━━━━━💨━━━━━━━╮*
*✦ 𝐔𝐓𝐄𝐍𝐓𝐄 𝐑𝐈𝐌𝐎𝐒𝐒𝐎 ✦*
*╰━━━━━━━💨━━━━━━━╯*

*@${mention.split('@')[0]} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*`,
      mentions: [mention]
    }, { quoted: m })
  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: '*𝐄𝐫𝐫𝐨𝐫𝐞: 𝐧𝐨𝐧 𝐡𝐨 𝐢 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢 𝐧𝐞𝐜𝐞𝐬𝐬𝐚𝐫𝐢 𝐨 𝐥’𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢𝐚̀ 𝐮𝐬𝐜𝐢𝐭𝐨.*'
    }, { quoted: m })
  }
}

handler.command = /^(kick|avadachedavra|pannolini|puffo)$/i
handler.admin = true
handler.group = true

export default handler