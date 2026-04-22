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

  const parts = input.split('|').map(v => v.trim()).filter(Boolean)
  const firstPart = parts[0] || ''
  const secondPart = parts[1] || ''

  const getInviteCode = link => {
    const clean = String(link || '').replace(/\s+/g, '')
    const match = clean.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/i)
    return match ? match[1] : null
  }

  const getGroupId = str => {
    const match = String(str || '').match(/\b(\d{10,}@g\.us)\b/i)
    return match ? match[1] : null
  }

  let rawNumber = ''
  let rawTarget = ''

  if (parts.length >= 2) {
    rawNumber = firstPart
    rawTarget = secondPart
  } else {
    const inviteCode = getInviteCode(input)
    const groupId = getGroupId(input)

    if (inviteCode || groupId) {
      const cleanedInput = input.replace(/\s+/g, ' ')
      const numberMatch = cleanedInput.match(/\b\d{6,15}\b/)
      rawNumber = numberMatch ? numberMatch[0] : ''
      rawTarget = groupId || input
    } else {
      rawNumber = input
      rawTarget = ''
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

  const resolveTargetGroup = async () => {
    if (!rawTarget) return m.chat

    const cleanTarget = String(rawTarget || '').trim()

    if (/@g\.us$/i.test(cleanTarget)) return cleanTarget

    const inviteCode = getInviteCode(cleanTarget)
    if (!inviteCode) return null

    try {
      const info = await conn.groupGetInviteInfo(inviteCode)
      return info?.id || null
    } catch {
      return null
    }
  }

  const targetGroup = await resolveTargetGroup()

  if (!targetGroup) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐎 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐍𝐨𝐧 𝐬𝐨𝐧𝐨 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐫𝐢𝐜𝐚𝐯𝐚𝐫𝐞 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐝𝐚𝐥 𝐥𝐢𝐧𝐤/𝐈𝐃 𝐢𝐧𝐯𝐢𝐚𝐭𝐨.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  const isSameGroup = targetGroup === m.chat

  try {
    const metadata = await conn.groupMetadata(targetGroup)
    const participants = metadata?.participants || []

    const senderJid = conn.decodeJid(m.sender)
    const botJid = conn.decodeJid(conn.user?.jid || '')

    const senderIsAdmin = participants.some(p => {
      const ids = [
        conn.decodeJid(p.id),
        p.jid ? conn.decodeJid(p.jid) : null,
        p.lid ? conn.decodeJid(p.lid) : null
      ].filter(Boolean)

      return ids.includes(senderJid) && (
        p.admin === 'admin' ||
        p.admin === 'superadmin' ||
        p.admin === true ||
        p.isAdmin === true
      )
    })

    const botIsAdmin = participants.some(p => {
      const ids = [
        conn.decodeJid(p.id),
        p.jid ? conn.decodeJid(p.jid) : null,
        p.lid ? conn.decodeJid(p.lid) : null
      ].filter(Boolean)

      return ids.includes(botJid) && (
        p.admin === 'admin' ||
        p.admin === 'superadmin' ||
        p.admin === true ||
        p.isAdmin === true
      )
    })

    if (!botIsAdmin) {
      return conn.reply(
        m.chat,
        `*╭━━━━━━━🤖━━━━━━━╮*
*✦ 𝐁𝐎𝐓 𝐍𝐎𝐍 𝐀𝐃𝐌𝐈𝐍 ✦*
*╰━━━━━━━🤖━━━━━━━╯*

*❌ 𝐍𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐝𝐢 𝐝𝐞𝐬𝐭𝐢𝐧𝐚𝐳𝐢𝐨𝐧𝐞 𝐢𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 è 𝐚𝐦𝐦𝐢𝐧.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
        m
      )
    }

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

    const alreadyInGroup = participants.some(p => {
      const ids = [
        conn.decodeJid(p.id),
        p.jid ? conn.decodeJid(p.jid) : null,
        p.lid ? conn.decodeJid(p.lid) : null
      ].filter(Boolean)

      return ids.includes(userJid)
    })

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
  } catch {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐄𝐑𝐑𝐎𝐑𝐄 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐍𝐨𝐧 𝐬𝐨𝐧𝐨 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚𝐫𝐞 𝐥'𝐮𝐭𝐞𝐧𝐭𝐞.*
*𝐈𝐥 𝐛𝐨𝐭 𝐩𝐨𝐭𝐫𝐞𝐛𝐛𝐞 𝐧𝐨𝐧 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐦𝐦𝐢𝐧, 𝐥'𝐮𝐭𝐞𝐧𝐭𝐞 𝐩𝐨𝐭𝐫𝐞𝐛𝐛𝐞 𝐚𝐯𝐞𝐫𝐞 𝐩𝐫𝐢𝐯𝐚𝐜𝐲 𝐜𝐡𝐢𝐮𝐬𝐚 𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐩𝐨𝐭𝐫𝐞𝐛𝐛𝐞 𝐧𝐨𝐧 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐜𝐜𝐞𝐬𝐬𝐢𝐛𝐢𝐥𝐞.*

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