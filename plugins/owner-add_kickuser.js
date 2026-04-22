let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isOwner, isROwner }) => {
  const input = String(text || '').trim()

  if (!input) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━👥━━━━━━━╮*
*✦ 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐔𝐓𝐄𝐍𝐓𝐈 ✦*
*╰━━━━━━━👥━━━━━━━╯*

*📌 𝐀𝐠𝐠𝐢𝐮𝐧𝐠𝐢 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞:*
*${usedPrefix}adduser 393xxxxxxxxx*

*📌 𝐑𝐢𝐦𝐮𝐨𝐯𝐢 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞:*
*${usedPrefix}kickuser 393xxxxxxxxx*

*📌 𝐀𝐠𝐠𝐢𝐮𝐧𝐠𝐢 𝐢𝐧 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐭𝐫𝐚𝐦𝐢𝐭𝐞 𝐈𝐃:*
*${usedPrefix}adduser 393xxxxxxxxx | 1203630xxxxxxxxx@g.us*

*📌 𝐀𝐠𝐠𝐢𝐮𝐧𝐠𝐢 𝐢𝐧 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐭𝐫𝐚𝐦𝐢𝐭𝐞 𝐥𝐢𝐧𝐤:*
*${usedPrefix}adduser 393xxxxxxxxx | https://chat.whatsapp.com/XXXXXXXXXXXXXXXXXXXXXX*

*📌 𝐑𝐢𝐦𝐮𝐨𝐯𝐢 𝐝𝐚 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨 𝐠𝐫𝐮𝐩𝐩𝐨:*
*${usedPrefix}kickuser 393xxxxxxxxx | 1203630xxxxxxxxx@g.us*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  if (!m.isGroup && !(isOwner || isROwner)) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⛔━━━━━━━╮*
*✦ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ✦*
*╰━━━━━━━⛔━━━━━━━╯*

*❌ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐢𝐧 𝐩𝐫𝐢𝐯𝐚𝐭𝐨 è 𝐫𝐢𝐬𝐞𝐫𝐯𝐚𝐭𝐨 𝐬𝐨𝐥𝐨 𝐚𝐥𝐥'𝐨𝐰𝐧𝐞𝐫.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  const isAdd = ['adduser', 'addnum', 'addutente'].includes(command)
  const action = isAdd ? 'add' : 'remove'
  const actionLabel = isAdd ? '𝐀𝐆𝐆𝐈𝐔𝐍𝐓𝐎' : '𝐑𝐈𝐌𝐎𝐒𝐒𝐎'
  const actionVerb = isAdd ? 'aggiunto' : 'rimosso'

  const normalizedInput = String(input || '')
    .replace(/\r/g, '\n')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/https:\/\/chat\.whatsapp\.com\s*\/\s*/gi, 'https://chat.whatsapp.com/')
    .replace(/\s*@\s*g\.us/gi, '@g.us')
    .trim()

  const getInviteCode = str => {
    const clean = String(str || '')
      .replace(/\s+/g, '')
      .replace(/https:\/\/chat\.whatsapp\.com\/+/gi, 'https://chat.whatsapp.com/')

    const match = clean.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/i)
    return match ? match[1] : null
  }

  const getGroupId = str => {
    const clean = String(str || '')
      .replace(/\s+/g, '')
      .replace(/\s*@\s*g\.us/gi, '@g.us')

    const match = clean.match(/(\d{10,}@g\.us)/i)
    return match ? match[1] : null
  }

  const parts = normalizedInput.split('|').map(v => v.trim()).filter(Boolean)

  let rawNumber = ''
  let explicitTargetText = ''

  if (parts.length >= 2) {
    rawNumber = parts[0]
    explicitTargetText = parts.slice(1).join(' | ')
  } else {
    const groupIdFound = getGroupId(normalizedInput)
    const inviteCodeFound = getInviteCode(normalizedInput)

    if (groupIdFound || inviteCodeFound) {
      explicitTargetText = normalizedInput
      rawNumber = normalizedInput
        .replace(/https:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]+)/gi, ' ')
        .replace(/(\d{10,}@g\.us)/gi, ' ')
        .replace(/[^\d]/g, ' ')
        .trim()
        .split(/\s+/)[0] || ''
    } else {
      rawNumber = normalizedInput
    }
  }

  const cleanNumber = String(rawNumber || '').replace(/\D/g, '')
  if (!cleanNumber) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━❌━━━━━━━╮*
*✦ 𝐍𝐔𝐌𝐄𝐑𝐎 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐎 ✦*
*╰━━━━━━━❌━━━━━━━╯*

*𝐃𝐞𝐯𝐢 𝐢𝐧𝐬𝐞𝐫𝐢𝐫𝐞 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐯𝐚𝐥𝐢𝐝𝐨.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  const userJid = `${cleanNumber}@s.whatsapp.net`

  const hasExplicitTarget = Boolean(explicitTargetText)
  let targetGroup = m.chat

  if (hasExplicitTarget) {
    const groupIdFound = getGroupId(explicitTargetText)
    const inviteCodeFound = getInviteCode(explicitTargetText)

    if (groupIdFound) {
      targetGroup = groupIdFound
    } else if (inviteCodeFound) {
      try {
        const info = await conn.groupGetInviteInfo(inviteCodeFound)
        targetGroup = info?.id || null
      } catch {
        targetGroup = null
      }
    } else {
      targetGroup = null
    }
  }

  if (!targetGroup) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐎 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐍𝐨𝐧 𝐬𝐨𝐧𝐨 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐫𝐢𝐜𝐚𝐯𝐚𝐫𝐞 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐝𝐚𝐥 𝐥𝐢𝐧𝐤/𝐈𝐃 𝐢𝐧𝐯𝐢𝐚𝐭𝐨.*
*𝐏𝐞𝐫 𝐬𝐢𝐜𝐮𝐫𝐞𝐳𝐳𝐚 𝐧𝐨𝐧 𝐡𝐨 𝐞𝐬𝐞𝐠𝐮𝐢𝐭𝐨 𝐧𝐞𝐬𝐬𝐮𝐧𝐚 𝐚𝐳𝐢𝐨𝐧𝐞.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  const isSameGroup = targetGroup === m.chat

  if (hasExplicitTarget && isSameGroup) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐃𝐈 𝐃𝐄𝐒𝐓𝐈𝐍𝐀𝐙𝐈𝐎𝐍𝐄 𝐄𝐑𝐑𝐀𝐓𝐎 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐇𝐚𝐢 𝐢𝐧𝐝𝐢𝐜𝐚𝐭𝐨 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨 𝐠𝐫𝐮𝐩𝐩𝐨, 𝐦𝐚 𝐧𝐨𝐧 è 𝐬𝐭𝐚𝐭𝐨 𝐫𝐢𝐬𝐨𝐥𝐭𝐨 𝐜𝐨𝐫𝐫𝐞𝐭𝐭𝐚𝐦𝐞𝐧𝐭𝐞.*
*𝐏𝐞𝐫 𝐬𝐢𝐜𝐮𝐫𝐞𝐳𝐳𝐚 𝐧𝐨𝐧 𝐡𝐨 𝐭𝐨𝐜𝐜𝐚𝐭𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  try {
    const metadata = await conn.groupMetadata(targetGroup)
    const participants = metadata?.participants || []

    const normalize = jid => String(conn.decodeJid(jid || '') || '').split(':')[0]
    const senderJid = normalize(m.sender)

    const senderParticipant = participants.find(p => normalize(p.id) === senderJid)
    const senderIsAdmin = senderParticipant
      ? (
          senderParticipant.admin === 'admin' ||
          senderParticipant.admin === 'superadmin' ||
          senderParticipant.admin === true ||
          senderParticipant.isAdmin === true
        )
      : false

    if (!isSameGroup && !(isOwner || isROwner) && !senderIsAdmin) {
      return conn.reply(
        m.chat,
        `*╭━━━━━━━⛔━━━━━━━╮*
*✦ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ✦*
*╰━━━━━━━⛔━━━━━━━╯*

*❌ 𝐏𝐞𝐫 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚𝐫𝐞 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐝𝐞𝐯𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐦𝐦𝐢𝐧 𝐝𝐢 𝐪𝐮𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐨 𝐨𝐰𝐧𝐞𝐫 𝐝𝐞𝐥 𝐛𝐨𝐭.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
        m
      )
    }

    if (isSameGroup && !(isAdmin || isOwner || isROwner)) {
      return conn.reply(
        m.chat,
        `*╭━━━━━━━⛔━━━━━━━╮*
*✦ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ✦*
*╰━━━━━━━⛔━━━━━━━╯*

*❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐨𝐰𝐧𝐞𝐫 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
        m
      )
    }

    const alreadyInGroup = participants.some(p => normalize(p.id) === userJid)

    if (action === 'add' && alreadyInGroup) {
      return conn.reply(
        m.chat,
        `*╭━━━━━━━ℹ️━━━━━━━╮*
*✦ 𝐔𝐓𝐄𝐍𝐓𝐄 𝐆𝐈À 𝐏𝐑𝐄𝐒𝐄𝐍𝐓𝐄 ✦*
*╰━━━━━━━ℹ️━━━━━━━╯*

*@${cleanNumber} 𝐞̀ 𝐠𝐢𝐚̀ 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
        m,
        { mentions: [userJid] }
      )
    }

    if (action === 'remove' && !alreadyInGroup) {
      return conn.reply(
        m.chat,
        `*╭━━━━━━━ℹ️━━━━━━━╮*
*✦ 𝐔𝐓𝐄𝐍𝐓𝐄 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎 ✦*
*╰━━━━━━━ℹ️━━━━━━━╯*

*@${cleanNumber} 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
        m,
        { mentions: [userJid] }
      )
    }

    await conn.groupParticipantsUpdate(targetGroup, [userJid], action)

    return conn.reply(
      m.chat,
      `*╭━━━━━━━✅━━━━━━━╮*
*✦ 𝐔𝐓𝐄𝐍𝐓𝐄 ${actionLabel} ✦*
*╰━━━━━━━✅━━━━━━━╯*

*@${cleanNumber} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 ${actionVerb} 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨.*
*🎯 𝐆𝐫𝐮𝐩𝐩𝐨:* \`${targetGroup}\`

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m,
      { mentions: [userJid] }
    )
  } catch (e) {
    console.log('ERRORE GROUP ACTION:', e)

    const err = String(e?.message || e || '').toLowerCase()

    let msg = `*𝐍𝐨𝐧 𝐬𝐨𝐧𝐨 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚𝐫𝐞 𝐥'𝐮𝐭𝐞𝐧𝐭𝐞.*`

    if (err.includes('403') || err.includes('admin') || err.includes('not-authorized')) {
      msg = `*❌ 𝐈𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 𝐡𝐚 𝐢 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢 𝐧𝐞𝐜𝐞𝐬𝐬𝐚𝐫𝐢 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐝𝐢 𝐝𝐞𝐬𝐭𝐢𝐧𝐚𝐳𝐢𝐨𝐧𝐞.*`
    } else if (err.includes('privacy') || err.includes('invite')) {
      msg = `*❌ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 𝐩𝐨𝐭𝐫𝐞𝐛𝐛𝐞 𝐚𝐯𝐞𝐫𝐞 𝐩𝐫𝐢𝐯𝐚𝐜𝐲 𝐜𝐡𝐢𝐮𝐬𝐚 𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐝𝐞𝐫𝐞 𝐢𝐧𝐯𝐢𝐭𝐨 𝐭𝐫𝐚𝐦𝐢𝐭𝐞 𝐥𝐢𝐧𝐤.*`
    } else if (err.includes('not a participant') || err.includes('participant')) {
      msg = `*❌ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐠𝐞𝐬𝐭𝐢𝐛𝐢𝐥𝐞 𝐢𝐧 𝐪𝐮𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*`
    }

    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐄𝐑𝐑𝐎𝐑𝐄 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

${msg}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }
}

handler.help = ['adduser', 'kickuser']
handler.tags = ['group']
handler.command = ['adduser', 'addnum', 'addutente', 'kickuser', 'deluser', 'removeuser']
handler.group = false

export default handler