// by Bonzino

import fetch from 'node-fetch'
import fs from 'fs'

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

  let thumbnailBuffer

try {
  const pp = await conn.profilePictureUrl(target, 'image')
  thumbnailBuffer = await (await fetch(pp)).buffer()
} catch {
  thumbnailBuffer = fs.readFileSync('./media/default-avatar.png')
}

const text =
`*🏠 𝐀𝐋𝐁𝐄𝐑𝐎 𝐆𝐄𝐍𝐄𝐀𝐋𝐎𝐆𝐈𝐂𝐎 𝐃𝐈* ${tag}

*❤️ 𝐏𝐀𝐑𝐓𝐍𝐄𝐑*
╰ ${partnerTxt}

*👨‍👩‍👧 𝐆𝐄𝐍𝐈𝐓𝐎𝐑𝐈*
├ 👩 ${madreTxt}
╰ 👨 ${padreTxt}

*👶 𝐅𝐈𝐆𝐋𝐈*
╰ ${formatList(figli)}

*🧑‍🤝‍🧑 𝐅𝐑𝐀𝐓𝐄𝐋𝐋𝐈*
├ 👦 ${formatList(fratelli)}
╰ 👧 ${formatList(sorelle)}

*👴👵 𝐍𝐎𝐍𝐍𝐈*
├ 👴 ${formatList(nonni)}
╰ 👵 ${formatList(nonne)}

*👬👭 𝐂𝐔𝐆𝐈𝐍𝐈*
├ 👦 ${formatList(cugini)}
╰ 👧 ${formatList(cugine)}`

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