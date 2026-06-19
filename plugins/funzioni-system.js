// Sistema funzioni by Bonzino

import { getThumbBuffer } from '../lib/thumb.js'
import { createFakeContact } from '../lib/fakecontact.js'

let handler = async (m, { conn, command, args, isAdmin, isOwner, isROwner, usedPrefix }) => {
  const isEnable = /^(attiva|enable|1)$/i.test(command)
  const isStatus = /^(statofunzione|sf)$/i.test(command)

  const chats = global.db.data.chats
  const settings = global.db.data.settings

  chats[m.chat] ??= {}
  settings[conn.user.jid] ??= {}

  const chat = chats[m.chat]
  const bot = settings[conn.user.jid]

  let senderName = 'Utente'
  try {
    senderName = await conn.getName(m.sender)
  } catch {
    senderName = m.pushName || 'Utente'
  }

  const mentionTag = `@${m.sender.split('@')[0]}`
  const fakeContact = await createFakeContact(m, conn)

const actor = `👤 ${mentionTag}\n\n`

const box = (_, desc) => desc


  const alreadyText = label =>
    `*⚠️ 𝐋𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞 ${label} è 𝐠𝐢à ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚'}.*`

  const statusText = label =>
    `*${isEnable ? '✅' : '❌'} ${label} ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐚' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐚'}*`

  const setFeature = (target, key, title, label) => {

if (isStatus) {
  return box(
    title,
    `${actor}*${label}:* ${target[key] ? '✅ 𝐀𝐭𝐭𝐢𝐯𝐚' : '❌ 𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚'}`
  )
}

  if (target[key] === isEnable) {
    return box(
      title,
      `${actor}${alreadyText(label)}`
    )
  }

  target[key] = isEnable

  return box(
    title,
    `${actor}${statusText(label)}`
  )
}

  const sendDenied = async text => {
    await conn.sendMessage(m.chat, {
      text: `${text}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [m.sender]
    }, { quoted: fakeContact })

    return false
  }

  const requireAdmin = async () => {
    if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
      return sendDenied(
        box(
          '𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎',
          `*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${mentionTag}

*❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐨𝐰𝐧𝐞𝐫 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞*`
        )
      )
    }

    return true
  }
  
    const requireOwner = async () => {
    if (!(isOwner || isROwner)) {
      return sendDenied(
        box(
          '𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎',
          `*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${mentionTag}

*❌ 𝐒𝐨𝐥𝐨 𝐥’𝐨𝐰𝐧𝐞𝐫 𝐩𝐮𝐨̀ 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞*`
        )
      )
    }

    return true
  }


  if (!args[0]) {
    throw `*╭━━━━━━━⚙️━━━━━━━╮*
*✦ 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐈 ✦*
*╰━━━━━━━⚙️━━━━━━━╯*

*📌 𝐔𝐬𝐨:*
*${usedPrefix}1 <funzione>*
*${usedPrefix}0 <funzione>*
*${usedPrefix}sf <funzione>*

*🛡️ 𝐒𝐢𝐜𝐮𝐫𝐞𝐳𝐳𝐚:*
*antilink, antispam, antibot*
*antiporno, antigore, antitrava*
*antitag, antiprivato, antivoip*
*antimedia, antiviewonce, *antidelete,*
*antinuke*, *antiwz*
*antiinsta, antitelegram*
*antitiktok*

*⚙️ 𝐆𝐞𝐬𝐭𝐢𝐨𝐧𝐞:*
*soloadmin, modoadmin*
*benvenuto, addio*
*presentazione*
*autodb, ia*`
  }

  let feature = args[0].toLowerCase()
  let result = ''
  let thumbFeature = feature
  let showActivator = true

  switch (feature) {

    case 'antilink':
      if (!await requireAdmin()) return
      result = setFeature(chat, 'antiLink', '𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊', '𝐀𝐧𝐭𝐢𝐥𝐢𝐧𝐤')
      break

    case 'antiinsta':
      if (!await requireAdmin()) return
      result = setFeature(chat, 'antiInsta', '𝐀𝐍𝐓𝐈 𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌', '𝐀𝐧𝐭𝐢 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦')
      break

    case 'antimedia':
      if (!await requireAdmin()) return
      result = setFeature(chat, 'antimedia', '𝐀𝐍𝐓𝐈 𝐌𝐄𝐃𝐈𝐀', '𝐀𝐧𝐭𝐢 𝐌𝐞𝐝𝐢𝐚')
      break
      
      case 'antiviewonce':
      if (!await requireAdmin()) return
      thumbFeature = 'antiviewonce'
      result = setFeature(chat, 'antiviewonce', '𝐀𝐍𝐓𝐈 𝐕𝐈𝐄𝐖 𝐎𝐍𝐂𝐄', '𝐀𝐧𝐭𝐢 𝐕𝐢𝐞𝐰 𝐎𝐧𝐜𝐞')
      break
      
      case 'antidelete':
  if (!await requireAdmin()) return
  thumbFeature = 'antidelete'
  result = setFeature(
    chat,
    'antidelete',
    '𝐀𝐍𝐓𝐈 𝐃𝐄𝐋𝐄𝐓𝐄',
    '𝐀𝐧𝐭𝐢 𝐃𝐞𝐥𝐞𝐭𝐞'
  )
  break

    case 'antitelegram':
      if (!await requireAdmin()) return
      result = setFeature(chat, 'antiTelegram', '𝐀𝐍𝐓𝐈 𝐓𝐄𝐋𝐄𝐆𝐑𝐀𝐌', '𝐀𝐧𝐭𝐢 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦')
      break

    case 'antitiktok':
      if (!await requireAdmin()) return
      result = setFeature(chat, 'antiTiktok', '𝐀𝐍𝐓𝐈 𝐓𝐈𝐊𝐓𝐎𝐊', '𝐀𝐧𝐭𝐢 𝐓𝐢𝐤𝐓𝐨𝐤')
      break

    case 'antitag':
      if (!await requireAdmin()) return
      result = setFeature(chat, 'antiTag', '𝐀𝐍𝐓𝐈 𝐓𝐀𝐆', '𝐀𝐧𝐭𝐢 𝐓𝐚𝐠')
      break

    case 'antigore':
      if (!await requireAdmin()) return
      result = setFeature(chat, 'antigore', '𝐀𝐍𝐓𝐈 𝐆𝐎𝐑𝐄', '𝐀𝐧𝐭𝐢 𝐆𝐨𝐫𝐞')
      break

    case 'antiporno':
    case 'antiporn':
      if (!await requireAdmin()) return
      thumbFeature = 'antiporno'
      result = setFeature(chat, 'antiporno', '𝐀𝐍𝐓𝐈 𝐏𝐎𝐑𝐍𝐎', '𝐀𝐧𝐭𝐢 𝐏𝐨𝐫𝐧𝐨')
      break

    case 'soloadmin':
    case 'modoadmin':
      if (!await requireAdmin()) return
      thumbFeature = 'modoadmin'
      result = setFeature(chat, 'modoadmin', '𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍', '𝐌𝐨𝐝𝐨 𝐀𝐝𝐦𝐢𝐧')
      break

    case 'benvenuto':
      if (!await requireAdmin()) return
      result = setFeature(chat, 'welcome', '𝐁𝐄𝐍𝐕𝐄𝐍𝐔𝐓𝐎', '𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨')
      break

    case 'addio':
      if (!await requireAdmin()) return
      result = setFeature(chat, 'goodbye', '𝐀𝐃𝐃𝐈𝐎', '𝐀𝐝𝐝𝐢𝐨')
      break
      
      case 'presentazione':
      if (!await requireAdmin()) return
      result = setFeature(
      chat, 'presentazione', '𝐏𝐑𝐄𝐒𝐄𝐍𝐓𝐀𝐙𝐈𝐎𝐍𝐄',  '𝐏𝐫𝐞𝐬𝐞𝐧𝐭𝐚𝐳𝐢𝐨𝐧𝐞')
  break

    case 'ia':
    case 'ai':
    case 'gpt':
      if (!await requireAdmin()) return
      thumbFeature = 'ia'
      result = setFeature(chat, 'ai', '𝐈𝐀', '𝐈𝐀')
      break

    case 'autodb':
    case 'backupauto':
      if (!await requireOwner()) return
      thumbFeature = 'system'
      result = setFeature(bot, 'autoDbBackup', '𝐁𝐀𝐂𝐊𝐔𝐏 𝐃𝐀𝐓𝐀𝐁𝐀𝐒𝐄', '𝐀𝐮𝐭𝐨𝐃𝐁')
      if (typeof global.restartAutoDbBackupLoop === 'function') {
        global.restartAutoDbBackupLoop(conn)
      }
      break

    case 'antiprivato':
      if (!await requireOwner()) return
      result = setFeature(bot, 'antiprivato', '𝐀𝐍𝐓𝐈 𝐏𝐑𝐈𝐕𝐀𝐓𝐎', '𝐀𝐧𝐭𝐢 𝐏𝐫𝐢𝐯𝐚𝐭𝐨')
      break

    case 'antibot':
      if (!await requireAdmin()) return
      result = setFeature(chat, 'antiBot', '𝐀𝐍𝐓𝐈 𝐁𝐎𝐓', '𝐀𝐧𝐭𝐢 𝐁𝐨𝐭')
      break

    case 'antivoip':
      if (!await requireAdmin()) return
      thumbFeature = 'antivoip'
      result = setFeature(chat, 'antivoip', '𝐀𝐍𝐓𝐈 𝐕𝐎𝐈𝐏', '𝐀𝐧𝐭𝐢 𝐕𝐨𝐢𝐩')
      break

    case 'antiwhatsapp':
    case 'antiwz':
    case 'antiwa':
      if (!await requireAdmin()) return
      thumbFeature = 'antiwhatsapp'
      result = setFeature(chat, 'antiWhatsapp', '𝐀𝐍𝐓𝐈 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏', '𝐀𝐧𝐭𝐢 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩')
      break

    case 'antispam':
      if (!await requireAdmin()) return
      result = setFeature(chat, 'antispam', '𝐀𝐍𝐓𝐈 𝐒𝐏𝐀𝐌', '𝐀𝐧𝐭𝐢 𝐒𝐩𝐚𝐦')
      break

    case 'antitrava':
      if (!await requireAdmin()) return
      result = setFeature(chat, 'antitrava', '𝐀𝐍𝐓𝐈 𝐓𝐑𝐀𝐕𝐀', '𝐀𝐧𝐭𝐢 𝐓𝐫𝐚𝐯𝐚')
      break

    case 'antinuke':
      if (!await requireAdmin()) return
      thumbFeature = 'antinuke'
      result = setFeature(chat, 'antinuke', '𝐀𝐍𝐓𝐈 𝐍𝐔𝐊𝐄', '𝐀𝐧𝐭𝐢 𝐍𝐮𝐤𝐞')
      break

    case 'tutte':
    case 'all':
      if (!await requireOwner()) return

      const allState = [
        chat.antiLink,
        chat.antispam,
        chat.antiBot,
        chat.antiporno,
        chat.antigore,
        chat.antitrava,
        chat.antiTag,
        chat.antimedia,
        chat.antidelete,
        chat.antiviewonce,
        chat.antinuke,
        chat.antiWhatsapp,
        chat.antiInsta,
        chat.antiTelegram,
        chat.antiTiktok,
        chat.antivoip,
        chat.welcome,
        chat.presentazione,
        chat.goodbye,
        bot.antiprivato,
        chat.modoadmin,
        chat.ai,
        bot.autoDbBackup
      ].every(v => v === isEnable)

      if (allState) {
        result = box(
          '𝐓𝐔𝐓𝐓𝐄 𝐋𝐄 𝐏𝐑𝐎𝐓𝐄𝐙𝐈𝐎𝐍𝐈',
          `${actor}*⚠️ 𝐓𝐮𝐭𝐭𝐞 𝐥𝐞 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐢 𝐬𝐨𝐧𝐨 𝐠𝐢à ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐞' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐞'}.*`
        )
      } else {
        chat.antiLink = isEnable
        chat.antispam = isEnable
        chat.antiBot = isEnable
        chat.antiporno = isEnable
        chat.antigore = isEnable
        chat.antitrava = isEnable
        chat.antiTag = isEnable
        chat.antimedia = isEnable
        chat.antidelete = isEnable
        chat.antiviewonce = isEnable
        chat.antinuke = isEnable
        chat.antiWhatsapp = isEnable
        chat.antiInsta = isEnable
        chat.antiTelegram = isEnable
        chat.antiTiktok = isEnable
        chat.antivoip = isEnable
        chat.welcome = isEnable
        chat.goodbye = isEnable
        chat.presentazione = isEnable
        bot.antiprivato = isEnable
        chat.modoadmin = isEnable
        chat.ai = isEnable
        bot.autoDbBackup = isEnable
        if (typeof global.restartAutoDbBackupLoop === 'function') {
        global.restartAutoDbBackupLoop(conn)}

        result = box(
          '𝐓𝐔𝐓𝐓𝐄 𝐋𝐄 𝐏𝐑𝐎𝐓𝐄𝐙𝐈𝐎𝐍𝐈',
          `${actor}*${isEnable ? '✅' : '❌'} 𝐓𝐮𝐭𝐭𝐞 𝐥𝐞 𝐩𝐫𝐨𝐭𝐞𝐳𝐢𝐨𝐧𝐢 𝐬𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐞 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐞' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐞'}*`
        )
      }

      thumbFeature = 'system'
      break

    default:
      showActivator = false
      result = box(
        '𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐄 𝐈𝐍𝐄𝐒𝐈𝐒𝐓𝐄𝐍𝐓𝐄',
        `*❌ 𝐋𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞 "${feature}" 𝐧𝐨𝐧 𝐞𝐬𝐢𝐬𝐭𝐞*

*📌 𝐔𝐬𝐚:* 
*${usedPrefix}funzioni*
*${usedPrefix}sf <funzione>*
*𝐩𝐞𝐫 𝐯𝐞𝐝𝐞𝐫𝐞 𝐥𝐚 𝐥𝐢𝐬𝐭𝐚 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚*`
      )
      thumbFeature = 'error'
      break
  }

  result += `

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  const thumbnail = await getThumbBuffer(thumbFeature)

  try {
    await conn.sendMessage(m.chat, {
      text: result,
      mentions: showActivator ? [m.sender] : [],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        mentionedJid: showActivator ? [m.sender] : [],
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.rcanal?.contextInfo?.forwardedNewsletterMessageInfo?.newsletterJid || '120363424041538498@newsletter',
          newsletterName: global.rcanal?.contextInfo?.forwardedNewsletterMessageInfo?.newsletterName || '𝛥𝐗𝐈𝐎𝐍 𝚩𝚯𝐓',
          serverMessageId: -1
        },
        externalAdReply: {
          title: '      𝚫𝐗𝐈𝐎𝐍 • 𝐒𝐘𝐒𝐓𝐄𝐌',
          body: ``,
          ...(thumbnail ? { thumbnail } : {}),
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false
        }
      }
    }, { quoted: fakeContact })
  } catch (e) {
    console.error('Errore invio preview funzione:', e)

    return conn.sendMessage(m.chat, {
      text: result,
      mentions: showActivator ? [m.sender] : []
    }, { quoted: fakeContact })
  }
}

handler.help = ['attiva <feature>', 'disattiva <feature>']
handler.tags = ['group']
handler.command = [  'attiva',  'disattiva',  'enable', 'disable',  '1',  '0',  'statofunzione', 'sf']
export default handler