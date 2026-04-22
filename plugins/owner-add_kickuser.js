let handler = async (m, { conn, text, usedPrefix, command, isOwner, isROwner }) => {
  const input = String(text || '').trim()

  if (!input) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━👥━━━━━━━╮*
*✦ 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐔𝐓𝐄𝐍𝐓𝐈 ✦*
*╰━━━━━━━👥━━━━━━━╯*

*📌 𝐀𝐠𝐠𝐢𝐮𝐧𝐠𝐢:*
*${usedPrefix}adduser 393xxxxxxxxx 1203630xxxxxxxxx@g.us*

*📌 𝐑𝐢𝐦𝐮𝐨𝐯𝐢:*
*${usedPrefix}kickuser 393xxxxxxxxx 1203630xxxxxxxxx@g.us*

*📌 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐚 𝐚𝐧𝐜𝐡𝐞:*
*${usedPrefix}kickuser 393xxx | link*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  if (!(isOwner || isROwner)) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⛔━━━━━━━╮*
*✦ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ✦*
*╰━━━━━━━⛔━━━━━━━╯*

*❌ 𝐒𝐨𝐥𝐨 𝐨𝐰𝐧𝐞𝐫.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  const isAdd = ['adduser', 'addnum', 'addutente'].includes(command)
  const action = isAdd ? 'add' : 'remove'
  const actionLabel = isAdd ? '𝐀𝐆𝐆𝐈𝐔𝐍𝐓𝐎' : '𝐑𝐈𝐌𝐎𝐒𝐒𝐎'
  const actionVerb = isAdd ? 'aggiunto' : 'rimosso'

  const log = (...a) => console.log('[ADD-KICK]', ...a)

  // ========= PARSER FIX =========

  const normalized = input
    .replace(/\r/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*@\s*g\.us/gi, '@g.us')
    .trim()

  const extractGroupId = str => {
    const match = str.match(/(?:^|\s)(\d{10,}@g\.us)(?=$|\s)/i)
    return match ? match[1] : null
  }

  const extractInvite = str => {
    const match = str.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/i)
    return match ? match[1] : null
  }

  const extractNumber = str => {
    const match = str.match(/\b\d{6,15}\b/)
    return match ? match[0] : ''
  }

  const groupId = extractGroupId(normalized)
  const inviteCode = extractInvite(normalized)
  const number = extractNumber(normalized)

  log('INPUT:', input)
  log('NORMALIZED:', normalized)
  log('GROUP ID:', groupId)
  log('INVITE:', inviteCode)
  log('NUMBER:', number)

  if (!number) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━❌━━━━━━━╮*
*✦ 𝐍𝐔𝐌𝐄𝐑𝐎 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐎 ✦*
*╰━━━━━━━❌━━━━━━━╯*`,
      m
    )
  }

  if (!groupId && !inviteCode) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐌𝐀𝐍𝐂𝐀𝐍𝐓𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*`,
      m
    )
  }

  const userJid = number + '@s.whatsapp.net'

  const withTimeout = (p, ms = 30000) =>
    Promise.race([
      p,
      new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))
    ])

  const sleep = ms => new Promise(r => setTimeout(r, ms))

  let target = null

  if (groupId) {
    target = groupId
  } else {
    try {
      const info = await withTimeout(conn.groupGetInviteInfo(inviteCode), 20000)
      target = info?.id
    } catch (e) {
      log('INVITE ERROR:', e)
    }
  }

  if (!target) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐎 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*`,
      m
    )
  }

  // 🚫 BLOCCO SICUREZZA
  const hasExplicitTarget = Boolean(groupId || inviteCode)

if (target === m.chat && !hasExplicitTarget) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐁𝐋𝐎𝐂𝐂𝐀𝐓𝐎 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐍𝐨𝐧 𝐭𝐨𝐜𝐜𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞.*`,
      m
    )
  }

  try {
    const meta = await withTimeout(conn.groupMetadata(target), 20000)
    const participants = meta.participants || []

    const exists = participants.some(p =>
      conn.decodeJid(p.id) === userJid
    )

    log('EXISTS:', exists)

    if (action === 'remove' && !exists) {
      return conn.reply(
        m.chat,
        `*╭━━━━━━━ℹ️━━━━━━━╮*
*✦ 𝐔𝐓𝐄𝐍𝐓𝐄 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎 ✦*
*╰━━━━━━━ℹ️━━━━━━━╯*`,
        m
      )
    }

    let ok = false

    for (let i = 0; i < 3; i++) {
      try {
        log('TRY UPDATE', i + 1)
        await withTimeout(conn.groupParticipantsUpdate(target, [userJid], action), 30000)
        ok = true
        break
      } catch (e) {
        log('RETRY ERROR:', e)
        await sleep(2000)
      }
    }

    if (!ok) {
      return conn.reply(
        m.chat,
        `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐓𝐈𝐌𝐄𝐎𝐔𝐓 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐧𝐨𝐧 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞.*`,
        m
      )
    }

    return conn.reply(
      m.chat,
      `*╭━━━━━━━✅━━━━━━━╮*
*✦ 𝐔𝐓𝐄𝐍𝐓𝐄 ${actionLabel} ✦*
*╰━━━━━━━✅━━━━━━━╯*

*@${number} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 ${actionVerb}.`,
      m,
      { mentions: [userJid] }
    )

  } catch (e) {
    log('FATAL:', e)

    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐄𝐑𝐑𝐎𝐑𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*`,
      m
    )
  }
}

handler.help = ['adduser', 'kickuser']
handler.tags = ['group']
handler.command = ['adduser', 'addnum', 'addutente', 'kickuser', 'deluser', 'removeuser']
handler.group = false

export default handler