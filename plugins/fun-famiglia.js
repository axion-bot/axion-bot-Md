// by Bonzino

import fetch from 'node-fetch'

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

function ensureArray(v) {
  return Array.isArray(v) ? v : []
}

function formatList(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return '𝐍𝐞𝐬𝐬𝐮𝐧𝐨'
  return arr.map(j => '@' + bare(j)).join(', ')
}

let handler = async (m, { conn }) => {
  const target = resolveTargetJid(m)
  if (!target) return

  const user = global.db.data.users[target] || {}

  const nome = await conn.getName(target)
  const tag = '@' + bare(target)

  const coniuge = user.coniuge || null

  const madre = user.madre || null
  const padre = user.padre || null

  const figli = ensureArray(user.figli)
  const fratelli = ensureArray(user.fratelli)
  const sorelle = ensureArray(user.sorelle)
  const nonni = ensureArray(user.nonni)
  const nonne = ensureArray(user.nonne)
  const cugini = ensureArray(user.cugini)
  const cugine = ensureArray(user.cugine)

  let mentions = [target]

  if (coniuge) mentions.push(coniuge)
  if (madre) mentions.push(madre)
  if (padre) mentions.push(padre)

  mentions.push(
    ...figli,
    ...fratelli,
    ...sorelle,
    ...nonni,
    ...nonne,
    ...cugini,
    ...cugine
  )

  const partnerTxt = coniuge ? `@${bare(coniuge)}` : '𝐍𝐞𝐬𝐬𝐮𝐧𝐨'
  const madreTxt = madre ? `@${bare(madre)}` : '𝐍𝐞𝐬𝐬𝐮𝐧𝐨'
  const padreTxt = padre ? `@${bare(padre)}` : '𝐍𝐞𝐬𝐬𝐮𝐧𝐨'

  let pp = 'https://i.ibb.co/2kR7x9J/avatar.png'
  try {
    pp = await conn.profilePictureUrl(target, 'image')
  } catch {}

  const thumbnailBuffer = typeof pp === 'string'
    ? await (await fetch(pp)).buffer()
    : pp

  const header = `🏠 𝐄𝐜𝐜𝐨 𝐥𝐚 𝐟𝐚𝐦𝐢𝐠𝐥𝐢𝐚 𝐝𝐢 ${tag}\n\n`

  const text = `${header}*╭━━━━━━━🏠━━━━━━━╮*
   *✦ 𝐅𝐀𝐌𝐈𝐆𝐋𝐈𝐀 ✦*
*╰━━━━━━━🏠━━━━━━━╯*

*❤️ 𝐏𝐚𝐫𝐭𝐧𝐞𝐫:* ${partnerTxt}

*👩 𝐌𝐚𝐝𝐫𝐞:* ${madreTxt}
*👨 𝐏𝐚𝐝𝐫𝐞:* ${padreTxt}

*👶 𝐅𝐢𝐠𝐥𝐢:* ${formatList(figli)}

*🧑‍🤝‍🧑 𝐅𝐫𝐚𝐭𝐞𝐥𝐥𝐢:* ${formatList(fratelli)}
*👭 𝐒𝐨𝐫𝐞𝐥𝐥𝐞:* ${formatList(sorelle)}

*👴 𝐍𝐨𝐧𝐧𝐢:* ${formatList(nonni)}
*👵 𝐍𝐨𝐧𝐧𝐞:* ${formatList(nonne)}

*👬 𝐂𝐮𝐠𝐢𝐧𝐢:* ${formatList(cugini)}
*👭 𝐂𝐮𝐠𝐢𝐧𝐞:* ${formatList(cugine)}`

  await conn.sendMessage(m.chat, {
    text,
    mentions: [...new Set(mentions)],
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      externalAdReply: {
        title: nome,
        body: ' ',
        thumbnail: thumbnailBuffer,
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.help = ['famiglia']
handler.tags = ['fun']
handler.command = /^(famiglia)$/i

export default handler