let handler = async (m, { conn, text, usedPrefix, command, isOwner, isROwner }) => {
  const input = String(text || '').trim()

  if (!input) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━👥━━━━━━━╮*
*✦ 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐔𝐓𝐄𝐍𝐓𝐈 ✦*
*╰━━━━━━━👥━━━━━━━╯*

*📌 𝐀𝐠𝐠𝐢𝐮𝐧𝐠𝐢 𝐢𝐧 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐭𝐫𝐚𝐦𝐢𝐭𝐞 𝐈𝐃:*
*${usedPrefix}adduser 393xxxxxxxxx 1203630xxxxxxxxx@g.us*

*📌 𝐀𝐠𝐠𝐢𝐮𝐧𝐠𝐢 𝐢𝐧 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐭𝐫𝐚𝐦𝐢𝐭𝐞 𝐥𝐢𝐧𝐤:*
*${usedPrefix}adduser 393xxxxxxxxx https://chat.whatsapp.com/XXXXXXXXXXXXXXXXXXXXXX*

*📌 𝐑𝐢𝐦𝐮𝐨𝐯𝐢 𝐝𝐚 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨 𝐠𝐫𝐮𝐩𝐩𝐨:*
*${usedPrefix}kickuser 393xxxxxxxxx 1203630xxxxxxxxx@g.us*

*📌 𝐑𝐢𝐦𝐮𝐨𝐯𝐢 𝐝𝐚 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐭𝐫𝐚𝐦𝐢𝐭𝐞 𝐥𝐢𝐧𝐤:*
*${usedPrefix}kickuser 393xxxxxxxxx https://chat.whatsapp.com/XXXXXXXXXXXXXXXXXXXXXX*

*📌 𝐒𝐨𝐧𝐨 𝐚𝐜𝐜𝐞𝐭𝐚𝐭𝐢 𝐚𝐧𝐜𝐡𝐞:*
*${usedPrefix}kickuser 393xxxxxxxxx | 1203630xxxxxxxxx@g.us*

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

*❌ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 è 𝐫𝐢𝐬𝐞𝐫𝐯𝐚𝐭𝐨 𝐚𝐥𝐥'𝐨𝐰𝐧𝐞𝐫.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  const isAdd = ['adduser', 'addnum', 'addutente'].includes(command)
  const action = isAdd ? 'add' : 'remove'
  const actionLabel = isAdd ? '𝐀𝐆𝐆𝐈𝐔𝐍𝐓𝐎' : '𝐑𝐈𝐌𝐎𝐒𝐒𝐎'
  const actionVerb = isAdd ? 'aggiunto' : 'rimosso'

  const log = (...args) => console.log('[OWNER-ADD-KICKUSER]', ...args)

  const normalizeInput = str => String(str || '')
    .replace(/\r/g, '\n')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/https:\/\/chat\.whatsapp\.com\s*\/\s*/gi, 'https://chat.whatsapp.com/')
    .replace(/\s*@\s*g\.us/gi, '@g.us')
    .trim()

  const normalizedInput = normalizeInput(input)

  const extractGroupId = str => {
    const clean = String(str || '').replace(/\s+/g, '').replace(/\s*@\s*g\.us/gi, '@g.us')
    const match = clean.match(/\b\d{10,}@g\.us\b/i)
    return match ? match[0] : null
  }

  const extractInviteCode = str => {
    const clean = String(str || '')
      .replace(/\s+/g, '')
      .replace(/https:\/\/chat\.whatsapp\.com\/+/gi, 'https://chat.whatsapp.com/')
    const match = clean.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/i)
    return match ? match[1] : null
  }

  const extractNumber = (str, groupId = null, inviteCode = null) => {
    let clean = String(str || '')

    if (groupId) {
      const escaped = groupId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      clean = clean.replace(new RegExp(escaped, 'ig'), ' ')
    }

    if (inviteCode) {
      const escapedCode = inviteCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      clean = clean
        .replace(new RegExp(`https:\\/\\/chat\\.whatsapp\\.com\\/${escapedCode}`, 'ig'), ' ')
        .replace(new RegExp(escapedCode, 'ig'), ' ')
    }

    clean = clean.replace(/\|/g, ' ')
    const matches = clean.match(/\b\d{6,15}\b/g) || []
    return matches.length ? matches[0] : ''
  }

  const groupIdFound = extractGroupId(normalizedInput)
  const inviteCodeFound = extractInviteCode(normalizedInput)
  const cleanNumber = extractNumber(normalizedInput, groupIdFound, inviteCodeFound)

  log('INPUT:', input)
  log('NORMALIZED INPUT:', normalizedInput)
  log('GROUP ID FOUND:', groupIdFound)
  log('INVITE CODE FOUND:', inviteCodeFound)
  log('CLEAN NUMBER:', cleanNumber)

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

  if (!groupIdFound && !inviteCodeFound) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐌𝐀𝐍𝐂𝐀𝐍𝐓𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐃𝐞𝐯𝐢 𝐢𝐧𝐝𝐢𝐜𝐚𝐫𝐞 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐝𝐢 𝐝𝐞𝐬𝐭𝐢𝐧𝐚𝐳𝐢𝐨𝐧𝐞 𝐭𝐫𝐚𝐦𝐢𝐭𝐞 𝐈𝐃 𝐨 𝐥𝐢𝐧𝐤.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  const userJid = `${cleanNumber}@s.whatsapp.net`

  const withTimeout = (promise, ms = 20000) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout:${ms}`)), ms))
    ])

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  let targetGroup = null

  if (groupIdFound) {
    targetGroup = groupIdFound
  } else if (inviteCodeFound) {
    try {
      log('TRY groupGetInviteInfo START')
      const info = await withTimeout(conn.groupGetInviteInfo(inviteCodeFound), 20000)
      log('TRY groupGetInviteInfo OK:', info)
      targetGroup = info?.id || null
    } catch (e) {
      log('TRY groupGetInviteInfo ERROR:', e)
      targetGroup = null
    }
  }

  log('TARGET GROUP:', targetGroup)
  log('USER JID:', userJid)
  log('ACTION:', action)

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

  if (targetGroup === m.chat) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐄𝐑𝐑𝐀𝐓𝐎 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐐𝐮𝐞𝐬𝐭𝐨 𝐩𝐥𝐮𝐠𝐢𝐧 è 𝐩𝐞𝐧𝐬𝐚𝐭𝐨 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐠𝐞𝐬𝐭𝐢𝐫𝐞 𝐮𝐭𝐞𝐧𝐭𝐢 𝐢𝐧 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨 𝐠𝐫𝐮𝐩𝐩𝐨.*
*𝐏𝐞𝐫 𝐬𝐢𝐜𝐮𝐫𝐞𝐳𝐳𝐚 𝐧𝐨𝐧 𝐡𝐨 𝐭𝐨𝐜𝐜𝐚𝐭𝐨 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  try {
    log('TRY groupMetadata START')
    const metadata = await withTimeout(conn.groupMetadata(targetGroup), 20000)
    log('TRY groupMetadata OK:', {
      id: metadata?.id,
      subject: metadata?.subject,
      participants: metadata?.participants?.length
    })

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

    log('SENDER JID:', senderJid)
    log('SENDER IS ADMIN IN TARGET:', senderIsAdmin)

    if (!senderIsAdmin && !(isOwner || isROwner)) {
      return conn.reply(
        m.chat,
        `*╭━━━━━━━⛔━━━━━━━╮*
*✦ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ✦*
*╰━━━━━━━⛔━━━━━━━╯*

*❌ 𝐃𝐞𝐯𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐦𝐦𝐢𝐧 𝐚𝐧𝐜𝐡𝐞 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐝𝐢 𝐝𝐞𝐬𝐭𝐢𝐧𝐚𝐳𝐢𝐨𝐧𝐞.*

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

    log('ALREADY IN GROUP:', alreadyInGroup)

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

    let updateError = null
    let updateResult = null

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        log(`TRY groupParticipantsUpdate START attempt ${attempt}`)
        updateResult = await withTimeout(
          conn.groupParticipantsUpdate(targetGroup, [userJid], action),
          30000
        )
        log(`TRY groupParticipantsUpdate OK attempt ${attempt}:`, updateResult)
        updateError = null
        break
      } catch (e) {
        updateError = e
        log(`TRY groupParticipantsUpdate ERROR attempt ${attempt}:`, e)
        if (attempt < 3) await sleep(3000)
      }
    }

    log('VERIFY metadata AFTER update START')
    let verifyMetadata = null
    try {
      verifyMetadata = await withTimeout(conn.groupMetadata(targetGroup), 20000)
      log('VERIFY metadata AFTER update OK')
    } catch (e) {
      log('VERIFY metadata AFTER update ERROR:', e)
    }

    let finalPresence = null
    if (verifyMetadata?.participants) {
      finalPresence = verifyMetadata.participants.some(p => {
        const ids = [
          conn.decodeJid(p.id),
          p.jid ? conn.decodeJid(p.jid) : null,
          p.lid ? conn.decodeJid(p.lid) : null
        ].filter(Boolean)

        return ids.includes(userJid)
      })
    }

    log('FINAL PRESENCE:', finalPresence)
    log('UPDATE RESULT:', updateResult)
    log('UPDATE ERROR FINAL:', updateError)

    if (action === 'add' && finalPresence === true) {
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
    }

    if (action === 'remove' && finalPresence === false) {
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
    }

    if (!updateError) {
      return conn.reply(
        m.chat,
        `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐑𝐈𝐒𝐔𝐋𝐓𝐀𝐓𝐎 𝐍𝐎𝐍 𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀𝐓𝐎 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐋𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 è 𝐬𝐭𝐚𝐭𝐚 𝐢𝐧𝐯𝐢𝐚𝐭𝐚, 𝐦𝐚 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐧𝐨𝐧 𝐡𝐚 𝐜𝐨𝐧𝐟𝐞𝐫𝐦𝐚𝐭𝐨 𝐬𝐮𝐛𝐢𝐭𝐨 𝐥𝐨 𝐬𝐭𝐚𝐭𝐨 𝐟𝐢𝐧𝐚𝐥𝐞.*
*🎯 𝐆𝐫𝐮𝐩𝐩𝐨:* \`${targetGroup}\`

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
        m
      )
    }

    const err = String(updateError?.message || updateError || '').toLowerCase()
    let msg = `*𝐍𝐨𝐧 𝐬𝐨𝐧𝐨 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚𝐫𝐞 𝐥'𝐮𝐭𝐞𝐧𝐭𝐞.*`

    if (err.includes('timeout')) {
      msg = `*❌ 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐧𝐨𝐧 𝐡𝐚 𝐫𝐢𝐬𝐩𝐨𝐬𝐭𝐨 𝐢𝐧 𝐭𝐞𝐦𝐩𝐨 𝐮𝐭𝐢𝐥𝐞.*`
    } else if (err.includes('403') || err.includes('admin') || err.includes('not-authorized')) {
      msg = `*❌ 𝐈𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 𝐡𝐚 𝐢 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢 𝐧𝐞𝐜𝐞𝐬𝐬𝐚𝐫𝐢 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐝𝐢 𝐝𝐞𝐬𝐭𝐢𝐧𝐚𝐳𝐢𝐨𝐧𝐞.*`
    } else if (err.includes('privacy') || err.includes('invite')) {
      msg = `*❌ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 𝐩𝐨𝐭𝐫𝐞𝐛𝐛𝐞 𝐚𝐯𝐞𝐫𝐞 𝐩𝐫𝐢𝐯𝐚𝐜𝐲 𝐜𝐡𝐢𝐮𝐬𝐚 𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐝𝐞𝐫𝐞 𝐢𝐧𝐯𝐢𝐭𝐨 𝐭𝐫𝐚𝐦𝐢𝐭𝐞 𝐥𝐢𝐧𝐤.*`
    } else if (err.includes('participant')) {
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
  } catch (e) {
    log('ERRORE BLOCCO PRINCIPALE:', e)

    const err = String(e?.message || e || '').toLowerCase()
    let msg = `*𝐍𝐨𝐧 𝐬𝐨𝐧𝐨 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚𝐫𝐞 𝐥'𝐮𝐭𝐞𝐧𝐭𝐞.*`

    if (err.includes('timeout')) {
      msg = `*❌ 𝐋'𝐨𝐩𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐡𝐚 𝐢𝐦𝐩𝐢𝐞𝐠𝐚𝐭𝐨 𝐭𝐫𝐨𝐩𝐩𝐨 𝐭𝐞𝐦𝐩𝐨 𝐞 𝐞̀ 𝐬𝐭𝐚𝐭𝐚 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐚.*`
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