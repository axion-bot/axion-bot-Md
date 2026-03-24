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

async function getDisplayName(conn, jid) {
  try {
    return await conn.getName(jid)
  } catch {
    return '@' + bare(jid)
  }
}

function getStato(user = {}) {
  const sposato = !!user.sposato
  const coniuge = user.coniuge || null
  const ex = Array.isArray(user.ex) ? user.ex : []
  const figli = Array.isArray(user.figli) ? user.figli : []

  if (sposato && coniuge) {
    return {
      label: '𝐒𝐩𝐨𝐬𝐚𝐭𝐨',
      icon: '💍'
    }
  }

  if (!sposato && ex.length > 0) {
    return {
      label: '𝐃𝐢𝐯𝐨𝐫𝐳𝐢𝐚𝐭𝐨',
      icon: '💔'
    }
  }

  return {
    label: '𝐒𝐢𝐧𝐠𝐥𝐞',
    icon: '✨'
  }
}

let handler = async (m, { conn }) => {
  const target = resolveTargetJid(m)
  if (!target) return

  const user = global.db.data.users[target] || {}
  const stato = getStato(user)

  const coniuge = user.coniuge || null
  const ex = Array.isArray(user.ex) ? user.ex : []
  const figli = Array.isArray(user.figli) ? user.figli : []

  const nome = await getDisplayName(conn, target)
  const tag = '@' + bare(target)

  let coniugeTxt = '𝐍𝐞𝐬𝐬𝐮𝐧𝐨'
  let mentions = [target]

  if (coniuge) {
    const nomeConiuge = await getDisplayName(conn, coniuge)
    coniugeTxt = `@${bare(coniuge)} (${nomeConiuge})`
    mentions.push(coniuge)
  }

  let exTxt = '0'
  if (ex.length > 0) {
    exTxt = `${ex.length}`
    mentions.push(...ex)
  }

  let figliTxt = '0'
  if (figli.length > 0) {
    figliTxt = `${figli.length}`
    mentions.push(...figli)
  }

  const text = `*╭━━━━━━━💍━━━━━━━╮*
   *✦ 𝐒𝐓𝐀𝐓𝐎 ✦*
*╰━━━━━━━💍━━━━━━━╯*

*👤 𝐍𝐨𝐦𝐞:* ${nome}
*🆔 𝐈𝐃:* ${tag}
*${stato.icon} 𝐒𝐭𝐚𝐭𝐨:* ${stato.label}
*❤️ 𝐂𝐨𝐧𝐢𝐮𝐠𝐞:* ${coniugeTxt}
*💔 𝐄𝐱:* ${exTxt}
*👶 𝐅𝐢𝐠𝐥𝐢:* ${figliTxt}`

  await conn.sendMessage(m.chat, {
    text,
    mentions: [...new Set(mentions)]
  }, { quoted: m })
}

handler.help = ['stato']
handler.tags = ['fun']
handler.command = /^(stato)$/i

export default handler