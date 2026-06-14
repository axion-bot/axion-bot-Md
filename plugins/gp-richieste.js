// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import prefissi from '../database/prefissi.js'
import { sendPresentazione } from '../lib/groups/presentazione.js'

let richiestaInAttesa = {}

function getPendingKey(sender, chat) {
  return `${sender}|${chat}`
}

function getRequestJid(p = {}) {
  return p.jid || p.participant || p.id || p.lid || p.phoneNumber || ''
}

function getRequestNumber(p = {}) {
  const raw =
    p.phoneNumber ||
    p.jid ||
    p.participant ||
    p.id ||
    p.lid ||
    ''

  return String(raw)
    .split('@')[0]
    .replace(/[^0-9]/g, '')
}

function isItalianRequest(p = {}) {
  return getRequestNumber(p).startsWith('39')
}

function getPrefixLabel(p = {}) {
  const number = getRequestNumber(p)

  if (number.startsWith('39')) return '🇮🇹 +39 Italia'

  const sorted = Object.entries(prefissi).sort((a, b) => String(b[0]).length - String(a[0]).length)

  for (const [code, label] of sorted) {
    const cleanCode = String(code).replace(/[^0-9]/g, '')
    if (cleanCode && number.startsWith(cleanCode)) return label
  }

  return '❓ Altri'
}

function getPrefixStats(pending = []) {
  const stats = {}

  for (const p of pending) {
    const prefix = getPrefixLabel(p)
    stats[prefix] = (stats[prefix] || 0) + 1
  }

  return stats
}

function formatPrefixDetails(pending = []) {
  const stats = getPrefixStats(pending)

  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .map(([prefix, count]) => `${prefix} ➜ *${count}*`)
    .join('\n')
}

function getJidList(list = []) {
  return list.map(p => getRequestJid(p)).filter(Boolean)
}

function extractGroupInput(args = []) {
  const joined = args.join(' ').replace(/\n/g, ' ')
  const compact = joined.replace(/\s+/g, '')

  const linkMatch = compact.match(/https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/i)
  if (linkMatch) return linkMatch[0]

  const idMatch = compact.match(/\d{10,}-\d+@g\.us|\d{10,}@g\.us/i)
  if (idMatch) return idMatch[0]

  return ''
}

function cleanArgs(args = []) {
  const groupInput = extractGroupInput(args)
  if (!groupInput) return args
  return args.filter(arg => !String(arg).includes(groupInput))
}

function getTargetSuffix(groupInput = '') {
  return groupInput ? ` ${groupInput}` : ''
}

function getRemoteLabel(target) {
  return target?.remote ? ` 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 *${target.title}*` : ''
}

async function resolveTargetGroup(conn, m, args = []) {
  const groupInput = extractGroupInput(args)

  if (!groupInput) {
    return {
      groupId: m.chat,
      remote: false,
      groupInput: '',
      title: 'Questo gruppo'
    }
  }

  if (/chat\.whatsapp\.com/i.test(groupInput)) {
    const code = groupInput.split('/').pop().replace(/[^A-Za-z0-9]/g, '')
    const info = await conn.groupGetInviteInfo(code)
    const id = String(info?.id || '').endsWith('@g.us') ? info.id : `${info?.id}@g.us`

    return {
      groupId: id,
      remote: true,
      groupInput,
      title: info?.subject || 'Gruppo remoto'
    }
  }

  let title = 'Gruppo remoto'

  try {
    const metadata = await conn.groupMetadata(groupInput)
    title = metadata?.subject || title
  } catch {}

  return {
    groupId: groupInput,
    remote: true,
    groupInput,
    title
  }
}

let handler = async (m, { conn, isAdmin, isBotAdmin, args, usedPrefix, command }) => {
  if (!m.isGroup) return

  if (!isAdmin) {
    return m.reply('*⚠️ 𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*')
  }

  let target

  try {
    target = await resolveTargetGroup(conn, m, args)
  } catch {
    return m.reply('*⚠️ 𝐍𝐨𝐧 𝐬𝐨𝐧𝐨 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐫𝐢𝐜𝐚𝐯𝐚𝐫𝐞 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*')
  }

  const groupId = target.groupId
  const groupInput = target.groupInput
  const targetSuffix = getTargetSuffix(groupInput)
  const remoteLabel = getRemoteLabel(target)
  const clean = cleanArgs(args)
  const pendingKey = getPendingKey(m.sender, groupId)

  const botAdmin = target.remote ? true : isBotAdmin

  if (!botAdmin) {
    return m.reply('*⚠️ 𝐃𝐞𝐯𝐨 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐝𝐦𝐢𝐧 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐝𝐢 𝐝𝐞𝐬𝐭𝐢𝐧𝐚𝐳𝐢𝐨𝐧𝐞.*')
  }

  let pending = []

  try {
    pending = await conn.groupRequestParticipantsList(groupId)
  } catch {
    return m.reply(`*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐨 𝐝𝐞𝐥𝐥𝐞 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞${remoteLabel}.*`)
  }

  if (richiestaInAttesa[pendingKey]) {
    const input = String(m.text || '').trim()

    delete richiestaInAttesa[pendingKey]

    if (!/^\d+$/.test(input)) {
      return m.reply('*⚠️ 𝐈𝐧𝐯𝐢𝐚 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐯𝐚𝐥𝐢𝐝𝐨.*')
    }

    const numero = parseInt(input)
    const jidList = getJidList(pending.slice(0, numero))

    if (!jidList.length) {
      return m.reply(`*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞${remoteLabel}.*`)
    }

    await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve')
    await sendPresentazione(conn, groupId, jidList.length)
    

    return m.reply(`*✅ 𝐇𝐨 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞${remoteLabel}.*`)
  }

  if (!pending.length) {
    return m.reply(`*✅ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐢𝐧 𝐬𝐨𝐬𝐩𝐞𝐬𝐨${remoteLabel}.*`)
  }

  if (!clean[0]) {
    const italiani = pending.filter(p => isItalianRequest(p)).length
    const esteri = pending.length - italiani

    return conn.sendMessage(m.chat, {
      text:
`
*𝐑𝐈𝐂𝐇𝐈𝐄𝐒𝐓𝐄 𝐈𝐍 𝐒𝐎𝐒𝐏𝐄𝐒𝐎*

${target.remote ? `*📌 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨:* *${target.title}*\n` : ''}
*📊 𝐓𝐨𝐭𝐚𝐥𝐞:* *${pending.length}*

*🇮🇹 𝐏𝐫𝐞𝐟𝐢𝐬𝐬𝐨 +39:* *${italiani}*
*🌍 𝐏𝐫𝐞𝐟𝐢𝐬𝐬𝐢 𝐞𝐬𝐭𝐞𝐫𝐢:* *${esteri}*

*━━━━━━━━━━━━━━*
*𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐬𝐚 𝐟𝐚𝐫𝐞:*`,
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
      buttons: [
        { buttonId: `${usedPrefix}${command} accetta${targetSuffix}`, buttonText: { displayText: '✅ Accetta tutte' }, type: 1 },
        { buttonId: `${usedPrefix}${command} rifiuta${targetSuffix}`, buttonText: { displayText: '❌ Rifiuta tutte' }, type: 1 },
        { buttonId: `${usedPrefix}${command} accetta39${targetSuffix}`, buttonText: { displayText: '🇮🇹 Accetta +39' }, type: 1 },
        { buttonId: `${usedPrefix}${command} prefissi${targetSuffix}`, buttonText: { displayText: '🌍 Vedi prefissi' }, type: 1 },
        { buttonId: `${usedPrefix}${command} gestisci${targetSuffix}`, buttonText: { displayText: '📥 Gestisci numero' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (clean[0] === 'prefissi') {
    const details = formatPrefixDetails(pending)

    return conn.sendMessage(m.chat, {
      text:
`╭━━━━━━━🌍━━━━━━━╮
*✦ 𝐃𝐄𝐓𝐓𝐀𝐆𝐋𝐈𝐎 𝐏𝐑𝐄𝐅𝐈𝐒𝐒𝐈 ✦*
╰━━━━━━━🌍━━━━━━━╯

*📌 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨:* *${target.title}*
*📊 𝐓𝐨𝐭𝐚𝐥𝐞:* *${pending.length}*

${details}`,
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
      buttons: [
        { buttonId: `${usedPrefix}${command}${targetSuffix}`, buttonText: { displayText: '⬅️ Torna al menu' }, type: 1 },
        { buttonId: `${usedPrefix}${command} accetta39${targetSuffix}`, buttonText: { displayText: '🇮🇹 Accetta +39' }, type: 1 },
        { buttonId: `${usedPrefix}${command} rifiuta${targetSuffix}`, buttonText: { displayText: '❌ Rifiuta tutte' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (clean[0] === 'accetta') {
    const jidList = getJidList(pending)

    if (!jidList.length) {
      return m.reply(`*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐝𝐚 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐫𝐞${remoteLabel}.*`)
    }

    await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve')
    await sendPresentazione(conn, groupId, jidList.length)

    return m.reply(`*✅ 𝐇𝐨 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞${remoteLabel}.*`)
  }

  if (clean[0] === 'rifiuta') {
    const jidList = getJidList(pending)

    if (!jidList.length) {
      return m.reply(`*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐝𝐚 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐫𝐞${remoteLabel}.*`)
    }

    await conn.groupRequestParticipantsUpdate(groupId, jidList, 'reject')

    return m.reply(`*❌ 𝐇𝐨 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞${remoteLabel}.*`)
  }

  if (clean[0] === 'accetta39') {
    const italiani = pending.filter(p => isItalianRequest(p))
    const jidList = getJidList(italiani)

    if (!jidList.length) {
      return m.reply(`*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 +39${remoteLabel}.*`)
    }

    await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve')
    await sendPresentazione(conn, groupId, jidList.length)

    return m.reply(`*✅ 𝐇𝐨 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 +39${remoteLabel}.*`)
  }

  if (clean[0] === 'gestisci') {
    richiestaInAttesa[pendingKey] = true

    return conn.sendMessage(m.chat, {
      text:
`*❓ 𝐐𝐮𝐚𝐧𝐭𝐞 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐯𝐮𝐨𝐢 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐫𝐞${remoteLabel}?*

*🔢 𝐒𝐜𝐫𝐢𝐯𝐢 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨.*`,
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
      buttons: [
        { buttonId: `${usedPrefix}${command} accettane 10${targetSuffix}`, buttonText: { displayText: '10' }, type: 1 },
        { buttonId: `${usedPrefix}${command} accettane 20${targetSuffix}`, buttonText: { displayText: '20' }, type: 1 },
        { buttonId: `${usedPrefix}${command} accettane 50${targetSuffix}`, buttonText: { displayText: '50' }, type: 1 },
        { buttonId: `${usedPrefix}${command} accettane 100${targetSuffix}`, buttonText: { displayText: '100' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (clean[0] === 'accettane') {
    const numero = parseInt(clean[1])

    if (isNaN(numero) || numero <= 0) {
      return m.reply('*⚠️ 𝐍𝐮𝐦𝐞𝐫𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.*')
    }

    const jidList = getJidList(pending.slice(0, numero))

    if (!jidList.length) {
      return m.reply(`*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞${remoteLabel}.*`)
    }

    await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve')
    await sendPresentazione(conn, groupId, jidList.length)

    return m.reply(`*✅ 𝐇𝐨 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞${remoteLabel}.*`)
  }

  return m.reply(`*⚠️ 𝐔𝐬𝐚:* *${usedPrefix}${command}*`)
}

handler.command = ['richieste']
handler.tags = ['gruppo']
handler.help = ['richieste']
handler.group = true
handler.admin = true
handler.botAdmin = false

export default handler