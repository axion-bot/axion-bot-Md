// Ban/Unban gp by Bonzjno

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isROwner }) => {
  const input = String(text || '').trim()

  const publicBanCommands = ['bangp']
  const publicUnbanCommands = ['unbangp']

  const internalBanConfirmCommands = ['_bangp_confirm']
  const internalUnbanConfirmCommands = ['_unbangp_confirm']
  const internalBanEditCommands = ['_bangp_edit']
  const internalUnbanEditCommands = ['_unbangp_edit']

  const isBan =
    publicBanCommands.includes(command) ||
    internalBanConfirmCommands.includes(command) ||
    internalBanEditCommands.includes(command)

  const isUnban =
    publicUnbanCommands.includes(command) ||
    internalUnbanConfirmCommands.includes(command) ||
    internalUnbanEditCommands.includes(command)

  const isConfirm =
    internalBanConfirmCommands.includes(command) ||
    internalUnbanConfirmCommands.includes(command)

  const isEdit =
    internalBanEditCommands.includes(command) ||
    internalUnbanEditCommands.includes(command)

  if (!isBan && !isUnban) return

  const footer = `\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
  const action = isBan ? 'ban' : 'unban'
  const actionLabel = isBan ? '𝐁𝐀𝐍𝐍𝐀𝐓𝐎' : '𝐒𝐁𝐀𝐍𝐍𝐀𝐓𝐎'
  const actionText = isBan ? 'bannato' : 'sbannato'
  const baseCommand = isBan ? 'bangp' : 'unbangp'

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

  if (!input) {
    await react('⚠️')
    return conn.reply(
      m.chat,
      `*╭━━━━━━━👥━━━━━━━╮*
*✦ 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐆𝐑𝐔𝐏𝐏𝐈 ✦*
*╰━━━━━━━👥━━━━━━━╯*

*📌 𝐁𝐚𝐧 𝐠𝐫𝐮𝐩𝐩𝐨:*
*${usedPrefix}bangp 1203630xxxxxxxxx@g.us*

*📌 𝐒𝐛𝐚𝐧 𝐠𝐫𝐮𝐩𝐩𝐨:*
*${usedPrefix}unbangp 1203630xxxxxxxxx@g.us*

*📌 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐚 𝐚𝐧𝐜𝐡𝐞 𝐢𝐥 𝐥𝐢𝐧𝐤 𝐢𝐧𝐯𝐢𝐭𝐨.*${footer}`,
      m
    )
  }

  const groupId = extractGroupId(normalized)
  const inviteCode = extractInvite(normalized)

  if (!groupId && !inviteCode) {
    await react('⚠️')
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐌𝐀𝐍𝐂𝐀𝐍𝐓𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐈𝐃 𝐠𝐫𝐮𝐩𝐩𝐨 𝐨 𝐮𝐧 𝐥𝐢𝐧𝐤 𝐢𝐧𝐯𝐢𝐭𝐨.*${footer}`,
      m
    )
  }

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
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐍𝐨𝐧 𝐫𝐢𝐞𝐬𝐜𝐨 𝐚 𝐫𝐢𝐬𝐨𝐥𝐯𝐞𝐫𝐞 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐭𝐚𝐫𝐠𝐞𝐭.*${footer}`,
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

*${usedPrefix}${baseCommand} ${target}*${footer}`,
      m
    )
  }

  const getMetaSafe = async jid => {
    let lastError = null

    for (let i = 0; i < 2; i++) {
      try {
        const meta = await withTimeout(conn.groupMetadata(jid), 20000)
        if (meta?.id) return meta
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

    const botJid = normalizeJid(conn.user?.jid || conn.user?.id || '')
    const botPhone = jidPhone(botJid)

    const botParticipant = participants.find(p =>
      participantIds(p).some(id => jidPhone(id) === botPhone)
    )

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

    const currentState = !!global.db.data.chats[target]?.isBanned

    if (!isConfirm) {
      await react('📍')
      return conn.sendMessage(
        m.chat,
        {
          text: `*╭━━━━━━━📍━━━━━━━╮*
*✦ 𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 𝐀𝐙𝐈𝐎𝐍𝐄 ✦*
*╰━━━━━━━📍━━━━━━━╯*

*𝐀𝐳𝐢𝐨𝐧𝐞:* *${action}*
*𝐆𝐫𝐮𝐩𝐩𝐨:* *${meta?.subject || '-'}*
*𝐈𝐃:* *${target}*
*𝐒𝐭𝐚𝐭𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞:* *${currentState ? 'bannato' : 'attivo'}*${footer}`,
          buttons: [
            {
              buttonId: `${usedPrefix}${isBan ? '_bangp_confirm' : '_unbangp_confirm'} ${target}`,
              buttonText: { displayText: '✅ Conferma' },
              type: 1
            },
            {
              buttonId: `${usedPrefix}${isBan ? '_bangp_edit' : '_unbangp_edit'} ${target}`,
              buttonText: { displayText: '✏️ Modifica dati' },
              type: 1
            }
          ],
          headerType: 1
        },
        { quoted: m }
      )
    }

    if (!global.db.data.chats[target]) global.db.data.chats[target] = {}

    if (isBan && global.db.data.chats[target].isBanned) {
      await react('ℹ️')
      return conn.reply(
        m.chat,
        `*╭━━━━━━━ℹ️━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐆𝐈𝐀̀ 𝐁𝐀𝐍𝐍𝐀𝐓𝐎 ✦*
*╰━━━━━━━ℹ️━━━━━━━╯*

*𝐈𝐥 𝐛𝐨𝐭 𝐞̀ 𝐠𝐢𝐚̀ 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨.*${footer}`,
        m
      )
    }

    if (isUnban && !global.db.data.chats[target].isBanned) {
      await react('ℹ️')
      return conn.reply(
        m.chat,
        `*╭━━━━━━━ℹ️━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 𝐆𝐈𝐀̀ 𝐀𝐓𝐓𝐈𝐕𝐎 ✦*
*╰━━━━━━━ℹ️━━━━━━━╯*

*𝐈𝐥 𝐛𝐨𝐭 𝐞̀ 𝐠𝐢𝐚̀ 𝐚𝐭𝐭𝐢𝐯𝐨 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨.*${footer}`,
        m
      )
    }

    global.db.data.chats[target].isBanned = isBan

    await react(isBan ? '🌙' : '☀️')
    return conn.reply(
      m.chat,
      `*╭━━━━━━━${isBan ? '🌙' : '☀️'}━━━━━━━╮*
*✦ 𝐆𝐑𝐔𝐏𝐏𝐎 ${actionLabel} ✦*
*╰━━━━━━━${isBan ? '🌙' : '☀️'}━━━━━━━╯*

*𝐈𝐥 𝐠𝐫𝐮𝐩𝐩𝐨:* *${meta?.subject || '-'}*
*𝐞̀ 𝐬𝐭𝐚𝐭𝐨 ${actionText}.*${footer}`,
      m
    )
  } catch {
    await react('❌')
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐄𝐑𝐑𝐎𝐑𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐈𝐦𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞 𝐠𝐞𝐬𝐭𝐢𝐫𝐞 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐭𝐚𝐫𝐠𝐞𝐭.*${footer}`,
      m
    )
  }
}

handler.help = ['bangp', 'unbangp']
handler.tags = ['owner']
handler.command = [
  'bangp',
  'unbangp',
  '_bangp_confirm',
  '_unbangp_confirm',
  '_bangp_edit',
  '_unbangp_edit'
]
handler.rowner = true
handler.group = false

export default handler