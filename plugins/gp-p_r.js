// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import fetch from 'node-fetch'

const S = v => String(v || '')

var handler = async (m, { conn, text, command }) => {
  let action, title, icon
  const sender = m.sender

  let users = m.mentionedJid && m.mentionedJid.length > 0
    ? m.mentionedJid
    : (m.quoted ? [m.quoted.sender] : [])

  if (!users.length && text) {
    const numbers = S(text).split(/[\s,]+/).filter(v => !isNaN(v))
    users = numbers.map(n => n + '@s.whatsapp.net')
  }

  if (!users.length) {
    return conn.reply(m.chat, '*⚠️ 𝐈𝐧𝐝𝐢𝐜𝐚 𝐚𝐥𝐦𝐞𝐧𝐨 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞.*', m)
  }

  if (['promote', 'promuovi', 'p', 'p2'].includes(command)) {
    action = 'promote'
    icon = '👑'
    title = '𝐏𝐑𝐎𝐌𝐎𝐙𝐈𝐎𝐍𝐄'
  } else {
    action = 'demote'
    icon = '🙇‍♂️'
    title = '𝐑𝐄𝐓𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐎𝐍𝐄'
  }

  try {
    const metadata = await conn.groupMetadata(m.chat)
    const normalizeJid = jid => String(jid || '').split(':')[0]

const participantMap = new Map(
  (metadata.participants || []).map(p => [
    normalizeJid(p.id),
    p.admin === 'admin' || p.admin === 'superadmin'
  ])
)

    const ownerNumbers = (global.owner || []).map(v => String(Array.isArray(v) ? v[0] : v))
    const ownerJids = ownerNumbers.map(v => v.replace(/\D/g, '') + '@s.whatsapp.net')
    const isBotOwnerTarget = jid => ownerJids.includes(jid)

    const alreadyOk = []
    const blockedOwners = []
    const toUpdate = []

    for (const user of users) {
      const isAdminNow = participantMap.get(normalizeJid(user)) || false

      if (action === 'promote') {
        if (isAdminNow) alreadyOk.push(user)
        else toUpdate.push(user)
      } else {
        if (isBotOwnerTarget(user)) blockedOwners.push(user)
        else if (!isAdminNow) alreadyOk.push(user)
        else toUpdate.push(user)
      }
    }

    if (!toUpdate.length) {
      let warningText = ''

      if (blockedOwners.length) {
        warningText = '*⛔️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐝𝐞𝐫𝐞 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫 𝐝𝐞𝐥 𝐛𝐨𝐭.*'
      } else {
        warningText = action === 'promote'
          ? "*⚠️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐚𝐝𝐦𝐢𝐧.*"
          : "*⚠️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐨.*"
      }

      const mentionsList = [sender, ...alreadyOk, ...blockedOwners]
      const shownList = [...alreadyOk, ...blockedOwners]
      const tagList = shownList.length
        ? shownList.map(u => `• @${u.split('@')[0]}`).join('\n')
        : `• @${users[0].split('@')[0]}`

      const msg = `*╭━━━━━━━${icon}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${icon}━━━━━━━╯*

${warningText}

*👥 𝐔𝐭𝐞𝐧𝐭𝐢:*
${tagList}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

      return conn.sendMessage(m.chat, {
        text: msg,
        mentions: mentionsList
      }, { quoted: m })
    }

    await conn.groupParticipantsUpdate(m.chat, toUpdate, action)

    let thumb = 'https://i.ibb.co/2kR7x9J/avatar.png'
    try {
      thumb = await conn.profilePictureUrl(m.chat, 'image')
    } catch {}

    const thumbnailBuffer = typeof thumb === 'string'
      ? await (await fetch(thumb)).buffer()
      : thumb

    const targetLabel = toUpdate.length === 1
      ? `@${toUpdate[0].split('@')[0]}`
      : 'gli utenti selezionati'

    const actionText = action === 'promote'
  ? `*@${sender.split('@')[0]} 𝐡𝐚 𝐝𝐚𝐭𝐨 𝐢 𝐩𝐨𝐭𝐞𝐫𝐢 𝐚 ${targetLabel}.*`
  : `*@${sender.split('@')[0]} 𝐡𝐚 𝐭𝐨𝐥𝐭𝐨 𝐢 𝐩𝐨𝐭𝐞𝐫𝐢 𝐚 ${targetLabel}.*`

    const tagList = toUpdate.map(u => `• @${u.split('@')[0]}`).join('\n')

    let extraText = ''

    if (alreadyOk.length) {
      const alreadyList = alreadyOk.map(u => `• @${u.split('@')[0]}`).join('\n')
      extraText += action === 'promote'
        ? `\n\n*⚠️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐚𝐝𝐦𝐢𝐧.*\n${alreadyList}`
        : `\n\n*⚠️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐨.*\n${alreadyList}`
    }

    if (blockedOwners.length) {
      const ownerList = blockedOwners.map(u => `• @${u.split('@')[0]}`).join('\n')
      extraText += `\n\n*⛔️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐝𝐞𝐫𝐞 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫 𝐝𝐞𝐥 𝐛𝐨𝐭.*\n${ownerList}`
    }

    const msg = `*╭━━━━━━━${icon}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${icon}━━━━━━━╯*

${actionText}

*👥 𝐔𝐭𝐞𝐧𝐭𝐢:*
${tagList}${extraText}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

    await conn.sendMessage(m.chat, {
      text: msg,
      mentions: [sender, ...toUpdate, ...alreadyOk, ...blockedOwners],
      contextInfo: {
        ...(global.rcanal?.contextInfo || {}),
        externalAdReply: {
          title: 'Gestione permessi gruppo',
          body: ' ',
          thumbnail: thumbnailBuffer,
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false
        }
      }
    }, { quoted: m })

  } catch (e) {
    conn.reply(
      m.chat,
      '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚 𝐝𝐞𝐢 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢.*\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*',
      m
    )
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['admin']
handler.command = ['promote', 'promuovi', 'p', 'p2', 'demote', 'retrocedi', 'r']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler