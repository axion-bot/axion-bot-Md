let handler = async (m, { conn, text, usedPrefix, command, isOwner, isROwner }) => {
  const input = String(text || '').trim()

  const publicAddCommands = ['adduser']
  const publicRemoveCommands = ['kickuser']

  const internalAddConfirmCommands = ['_adduser_confirm']
  const internalKickConfirmCommands = ['_kickuser_confirm']
  const internalAddEditCommands = ['_adduser_edit']
  const internalKickEditCommands = ['_kickuser_edit']

  const isAdd =
    publicAddCommands.includes(command) ||
    internalAddConfirmCommands.includes(command) ||
    internalAddEditCommands.includes(command)

  const isKick =
    publicRemoveCommands.includes(command) ||
    internalKickConfirmCommands.includes(command) ||
    internalKickEditCommands.includes(command)

  const isConfirm =
    internalAddConfirmCommands.includes(command) ||
    internalKickConfirmCommands.includes(command)

  const isEdit =
    internalAddEditCommands.includes(command) ||
    internalKickEditCommands.includes(command)

  if (!isAdd && !isKick) return

  const action = isAdd ? 'add' : 'remove'
  const actionLabel = isAdd ? '𝐀𝐆𝐆𝐈𝐔𝐍𝐓𝐎' : '𝐑𝐈𝐌𝐎𝐒𝐒𝐎'
  const actionText = isAdd ? 'aggiunto' : 'rimosso'
  const baseCommand = isAdd ? 'adduser' : 'kickuser'
  const footer = `\n\n*— axion bot*`

  const react = async emoji => {
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: emoji,
          key: m.key
        }
      })
    } catch {}
  }

  if (!(isOwner || isROwner)) {
    await react('⛔')
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⛔━━━━━━━╮*
*✦ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ✦*
*╰━━━━━━━⛔━━━━━━━╯*

*❌ 𝐒𝐨𝐥𝐨 𝐨𝐰𝐧𝐞𝐫.*${footer}`,
      m
    )
  }

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

  const normalizeJid = jid => {
    if (!jid) return ''
    try {
      if (typeof conn.decodeJid === 'function') jid = conn.decodeJid(jid)
    } catch {}
    return String(jid || '').trim().toLowerCase()
  }

  const jidPhone = jid => normalizeJid(jid).split('@')[0].split(':')[0].replace(/\D/g, '')

  const participantIds = p => [
    p?.id,
    p?.jid,
    p?.lid,
    p?.participant
  ].filter(Boolean)

  if (!input) {
    await react('⚠️')
    return conn.reply(
      m.chat,
      `*╭━━━━━━━👥━━━━━━━╮*
*✦ 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐔𝐓𝐄𝐍𝐓𝐈 ✦*
*╰━━━━━━━👥━━━━━━━╯*

*📌 𝐀𝐠𝐠𝐢𝐮𝐧𝐠𝐢:*
*${usedPrefix}adduser 393xxxxxxxxx 1203630xxxxxxxxx@g.us*

*📌 𝐑𝐢𝐦𝐮𝐨𝐯𝐢:*
*${usedPrefix}kickuser 393xxxxxxxxx 1203630xxxxxxxxx@g.us*${footer}`,
      m
    )
  }

  const groupId = extractGroupId(normalized)
  const inviteCode = extractInvite(normalized)
  const number = extractNumber(normalized)

  if (!number) {
    await react('❌')
    return conn.reply(
      m.chat,
      `*╭━━━━━━━❌━━━━━━━╮*
*✦ 𝐍𝐔𝐌𝐄𝐑𝐎 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐎 ✦*
*╰━━━━━━━❌━━━━━━━╯*${footer}`,
      m
    )
  }

  if (!groupId && !inviteCode) {
    await react('⚠️')
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐌𝐀𝐍𝐂𝐀𝐍𝐓𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*${footer}`,
      m
    )
  }

  const userJid = `${number}@s.whatsapp.net`
  const cleanUser = jidPhone(userJid)

  const withTimeout = (p, ms = 30000) =>
    Promise.race([
      p,
      new Promise((_, r) => setTimeout(() => r(new Error(`timeout_${ms}`)), ms))
    ])

  const sleep = ms => new Promise(r => setTimeout(r, ms))

  let target = null

  if (groupId) {
    target = groupId
  } else {
    try {
      const info = await withTimeout(conn.groupGetInviteInfo(inviteCode), 20000)
      target = info?.id
    } catch {}
  }

  if (!target) {
    await react('❌')
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐎 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*${footer}`,
      m
    )
  }

  if (isEdit) {
    await react('✏️')
    return conn.reply(
      m.chat,
      `*╭━━━━━━━✏️━━━━━━━╮*
*✦ 𝐌𝐎𝐃𝐈𝐅𝐈𝐂𝐀 𝐃𝐀𝐓𝐈 ✦*
*╰━━━━━━━✏️━━━━━━━╯*

*${usedPrefix}${baseCommand} ${number} ${target}*${footer}`,
      m
    )
  }

  const getMetaSafe = async jid => {
    let lastError = null

    for (let i = 0; i < 2; i++) {
      try {
        const meta = await withTimeout(conn.groupMetadata(jid), 20000)
        if (meta?.id && Array.isArray(meta?.participants) && meta.participants.length > 0) {
          return meta
        }
      } catch (e) {
        lastError = e
        await sleep(1200)
      }
    }

    try {
      const all = await withTimeout(conn.groupFetchAllParticipating(), 25000)
      const direct = all?.[jid]

      if (direct) {
        const participants = Array.isArray(direct.participants)
          ? direct.participants
          : Object.values(direct.participants || {})

        return {
          id: direct.id || jid,
          subject: direct.subject || '',
          participants
        }
      }
    } catch {}

    throw lastError || new Error('metadata_unavailable')
  }

  try {
    await react('⏳')

    const meta = await getMetaSafe(target)
    const participants = Array.isArray(meta?.participants) ? meta.participants : []

    const botJid = normalizeJid(conn.user?.jid || conn.user?.id || '')
    const botPhone = jidPhone(botJid)

    const botParticipant = participants.find(p =>
      participantIds(p).some(id => jidPhone(id) === botPhone)
    )

    if (!participants.length) {
      await react('⚠️')
      return conn.reply(
        m.chat,
        `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐌𝐄𝐓𝐀𝐃𝐀𝐓𝐀 𝐕𝐔𝐎𝐓𝐀 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐍𝐨𝐧 𝐫𝐢𝐞𝐬𝐜𝐨 𝐚 𝐥𝐞𝐠𝐠𝐞𝐫𝐞 𝐢 𝐦𝐞𝐦𝐛𝐫𝐢 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*${footer}`,
        m
      )
    }

    if (!botParticipant) {
      await react('⚠️')
      return conn.reply(
        m.chat,
        `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐁𝐎𝐓 𝐍𝐎𝐍 𝐏𝐑𝐄𝐒𝐄𝐍𝐓𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐈𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐭𝐚𝐫𝐠𝐞𝐭.*${footer}`,
        m
      )
    }

    if (!['admin', 'superadmin'].includes(botParticipant.admin)) {
      await react('⛔')
      return conn.reply(
        m.chat,
        `*╭━━━━━━━⛔━━━━━━━╮*
*✦ 𝐁𝐎𝐓 𝐍𝐎𝐍 𝐀𝐃𝐌𝐈𝐍 ✦*
*╰━━━━━━━⛔━━━━━━━╯*${footer}`,
        m
      )
    }

    let exists = participants.some(p =>
      participantIds(p).some(id => jidPhone(id) === cleanUser)
    )

    if (!isConfirm) {
      await react('📍')
      return conn.sendMessage(
        m.chat,
        {
          text: `*╭━━━━━━━📍━━━━━━━╮*
*✦ 𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 𝐀𝐙𝐈𝐎𝐍𝐄 ✦*
*╰━━━━━━━📍━━━━━━━╯*

*𝐀𝐳𝐢𝐨𝐧𝐞:* *${action}*
*𝐔𝐭𝐞𝐧𝐭𝐞:* *@${number}*
*𝐆𝐫𝐮𝐩𝐩𝐨:* *${meta?.subject || '-'}*
*𝐈𝐃:* *${target}*${footer}`,
          mentions: [userJid],
          buttons: [
            {
              buttonId: `${usedPrefix}${isAdd ? '_adduser_confirm' : '_kickuser_confirm'} ${number} ${target}`,
              buttonText: { displayText: '✅ Conferma' },
              type: 1
            },
            {
              buttonId: `${usedPrefix}${isAdd ? '_adduser_edit' : '_kickuser_edit'} ${number} ${target}`,
              buttonText: { displayText: '✏️ Modifica dati' },
              type: 1
            }
          ],
          headerType: 1
        },
        { quoted: m }
      )
    }

    if (action === 'remove' && !exists) {
      await react('ℹ️')
      return conn.reply(
        m.chat,
        `*╭━━━━━━━ℹ️━━━━━━━╮*
*✦ 𝐔𝐓𝐄𝐍𝐓𝐄 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎 ✦*
*╰━━━━━━━ℹ️━━━━━━━╯*${footer}`,
        m
      )
    }

    if (action === 'add' && exists) {
      await react('ℹ️')
      return conn.reply(
        m.chat,
        `*╭━━━━━━━ℹ️━━━━━━━╮*
*✦ 𝐔𝐓𝐄𝐍𝐓𝐄 𝐆𝐈𝐀̀ 𝐏𝐑𝐄𝐒𝐄𝐍𝐓𝐄 ✦*
*╰━━━━━━━ℹ️━━━━━━━╯*${footer}`,
        m
      )
    }

    let ok = false

    for (let i = 0; i < 3; i++) {
      try {
        await withTimeout(conn.groupParticipantsUpdate(target, [userJid], action), 30000)
        ok = true
        break
      } catch {
        await sleep(2000)
      }
    }

    if (!ok) {
      await react('⚠️')
      return conn.reply(
        m.chat,
        `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐓𝐈𝐌𝐄𝐎𝐔𝐓 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐧𝐨𝐧 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞.*${footer}`,
        m
      )
    }

    await react('✅')
    return conn.reply(
      m.chat,
      `*╭━━━━━━━✅━━━━━━━╮*
*✦ 𝐔𝐓𝐄𝐍𝐓𝐄 ${actionLabel} ✦*
*╰━━━━━━━✅━━━━━━━╯*

*@${number} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 ${actionText}.*
*𝐆𝐫𝐮𝐩𝐩𝐨:* *${meta?.subject || '-'}*${footer}`,
      m,
      { mentions: [userJid] }
    )
  } catch {
    await react('❌')
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐄𝐑𝐑𝐎𝐑𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐈𝐦𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞 𝐥𝐞𝐠𝐠𝐞𝐫𝐞 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*${footer}`,
      m
    )
  }
}

handler.help = ['adduser', 'kickuser']
handler.tags = ['group']
handler.command = [
  'adduser',
  'kickuser',
  '_adduser_confirm',
  '_kickuser_confirm',
  '_adduser_edit',
  '_kickuser_edit'
]
handler.group = false
handler.rowner = true

export default handler