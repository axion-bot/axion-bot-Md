// by Bonzino

const S = v => String(v || '')

function bare(j = '') {
  return S(j).split('@')[0].split(':')[0]
}

function resolveTargetJid(m) {
  const ctx = m.message?.extendedTextMessage?.contextInfo || {}

  if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) return m.mentionedJid[0]
  if (Array.isArray(ctx.mentionedJid) && ctx.mentionedJid.length) return ctx.mentionedJid[0]
  if (m.quoted?.sender) return m.quoted.sender
  if (m.quoted?.participant) return m.quoted.participant
  if (ctx.participant) return ctx.participant

  return m.sender || m.key?.participant || m.participant || null
}

function getStato(user = {}) {
  const sposato = !!user.sposato
  const coniuge = user.coniuge || null
  const ex = Array.isArray(user.ex) ? user.ex : []

  if (sposato && coniuge) {
    return { label: '𝐒𝐩𝐨𝐬𝐚𝐭𝐨', icon: '💍' }
  }

  if (!sposato && ex.length > 0) {
    return { label: '𝐃𝐢𝐯𝐨𝐫𝐳𝐢𝐚𝐭𝐨', icon: '💔' }
  }

  return { label: '𝐒𝐢𝐧𝐠𝐥𝐞', icon: '✨' }
}

function formatList(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return '𝐍𝐞𝐬𝐬𝐮𝐧𝐨'
  return arr.map(j => '@' + bare(j)).join(', ')
}

let handler = async (m, { conn }) => {
  const target = resolveTargetJid(m)
  if (!target) return

  const user = global.db.data.users[target] || {}

  const stato = getStato(user)

  const coniuge = user.coniuge || null
  const ex = Array.isArray(user.ex) ? user.ex : []
  const figli = Array.isArray(user.figli) ? user.figli : []
  const amici = Array.isArray(user.amici) ? user.amici : []

  const nome = await conn.getName(target)
  const tag = '@' + bare(target)

  let mentions = [target]

  if (coniuge) mentions.push(coniuge)
  mentions.push(...ex, ...figli, ...amici)

  const coniugeTxt = coniuge ? `@${bare(coniuge)}` : '𝐍𝐞𝐬𝐬𝐮𝐧𝐨'
  const exTxt = formatList(ex)
  const figliTxt = formatList(figli)
  const amiciTxt = formatList(amici)

  const text = `*╭━━━━━━━💍━━━━━━━╮*
   *✦ 𝐒𝐓𝐀𝐓𝐎 ✦*
*╰━━━━━━━💍━━━━━━━╯*

*👤 𝐍𝐨𝐦𝐞:* ${nome}
*🆔 𝐈𝐃:* ${tag}
*${stato.icon} 𝐒𝐭𝐚𝐭𝐨:* ${stato.label}
*❤️ 𝐂𝐨𝐧𝐢𝐮𝐠𝐞:* ${coniugeTxt}
*💔 𝐄𝐱:* ${exTxt}
*👶 𝐅𝐢𝐠𝐥𝐢:* ${figliTxt}
*🤝 𝐀𝐦𝐢𝐜𝐢:* ${amiciTxt}`

  let pp = 'https://i.ibb.co/2kR7x9J/avatar.png'
  try {
    pp = await conn.profilePictureUrl(target, 'image')
  } catch {}

  await conn.sendMessage(m.chat, {
    text,
    mentions: [...new Set(mentions)],
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      externalAdReply: {
        title: nome,
        body: '',
        thumbnailUrl: pp,
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.help = ['stato']
handler.tags = ['fun']
handler.command = /^(stato)$/i

export default handler