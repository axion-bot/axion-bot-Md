// Enable by Bonzino

import { getThumbBuffer } from '../lib/thumb.js'

let handler = async (m, { conn, command, args, isAdmin, isOwner, isROwner, usedPrefix }) => {
  const isEnable = /^(attiva|enable|1)$/i.test(command)

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

  const box = (title, desc) => `╭━━━━━━━⚙️━━━━━━━╮
*✦ ${title} ✦*
╰━━━━━━━⚙️━━━━━━━╯

*${desc}*`

  const noAdmin = box('𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎', '❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐨𝐰𝐧𝐞𝐫 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞')
  const noOwner = box('𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐑𝐈𝐒𝐄𝐑𝐕𝐀𝐓𝐎', '❌ 𝐅𝐮𝐧𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐬𝐞𝐫𝐯𝐚𝐭𝐚 𝐚𝐥𝐥’𝐨𝐰𝐧𝐞𝐫')

  if (!args[0]) {
    throw `╭━━━━━━━⚙️━━━━━━━╮
*✦ 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐈 ✦*
╰━━━━━━━⚙️━━━━━━━╯

*📌 𝐔𝐬𝐨:*
*${usedPrefix}1 <funzione>*
*${usedPrefix}0 <funzione>*

*⚡ 𝐓𝐮𝐭𝐭𝐨 𝐢𝐧 𝐮𝐧𝐨:*
*${usedPrefix}1 tutte*
*${usedPrefix}0 tutte*

*🛡️ 𝐒𝐢𝐜𝐮𝐫𝐞𝐳𝐳𝐚:*
*antilink, antispam, antibot*
*antiporno, antigore, antitrava*
*antitag, antiprivato, antimedia*

*📱 𝐑𝐞𝐭𝐞:*
*antiinsta, antitelegram, antitiktok*

*⚙️ 𝐆𝐞𝐬𝐭𝐢𝐨𝐧𝐞:*
*soloadmin, modoadmin, benvenuto, addio*`
  }

  let feature = args[0].toLowerCase()
  let result = ''
  let thumbFeature = feature

  const requireAdmin = () => {
    if (m.isGroup && !(isAdmin || isOwner || isROwner)) throw noAdmin
  }

  const requireOwner = () => {
    if (!(isOwner || isROwner)) throw noOwner
  }

  switch (feature) {
    case 'antilink':
      requireAdmin()
      chat.antiLink = isEnable
      result = box('𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊', `${isEnable ? '✅' : '❌'} 𝐏𝐫𝐨𝐭𝐞𝐳𝐢𝐨𝐧𝐞 𝐥𝐢𝐧𝐤 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐚' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐚'}`)
      break

    case 'antiinsta':
      requireAdmin()
      chat.antiInsta = isEnable
      result = box('𝐀𝐍𝐓𝐈 𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌', `${isEnable ? '✅' : '❌'} 𝐅𝐢𝐥𝐭𝐫𝐨 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨'}`)
      break

    case 'antimedia':
      requireAdmin()
      chat.antimedia = isEnable
      result = box(
        '𝐀𝐍𝐓𝐈 𝐌𝐄𝐃𝐈𝐀',
        isEnable
          ? `✅ 𝐅𝐢𝐥𝐭𝐫𝐨 𝐦𝐞𝐝𝐢𝐚 𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨

📸 𝐃𝐚 𝐨𝐫𝐚 𝐢𝐧 𝐩𝐨𝐢 𝐬𝐨𝐧𝐨 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐢 𝐬𝐨𝐥𝐨 𝐢 𝐦𝐞𝐝𝐢𝐚 𝐯𝐢𝐞𝐰 𝐨𝐧𝐜𝐞 / 𝐮𝐧𝐚 𝐯𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞`
          : `❌ 𝐅𝐢𝐥𝐭𝐫𝐨 𝐦𝐞𝐝𝐢𝐚 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨

📸 𝐎𝐫𝐚 𝐬𝐨𝐧𝐨 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐢 𝐚𝐧𝐜𝐡𝐞 𝐢 𝐦𝐞𝐝𝐢𝐚 𝐧𝐨𝐫𝐦𝐚𝐥𝐢`
      )
      break

    case 'antitelegram':
      requireAdmin()
      chat.antiTelegram = isEnable
      result = box('𝐀𝐍𝐓𝐈 𝐓𝐄𝐋𝐄𝐆𝐑𝐀𝐌', `${isEnable ? '✅' : '❌'} 𝐅𝐢𝐥𝐭𝐫𝐨 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨'}`)
      break

    case 'antitiktok':
      requireAdmin()
      chat.antiTiktok = isEnable
      result = box('𝐀𝐍𝐓𝐈 𝐓𝐈𝐊𝐓𝐎𝐊', `${isEnable ? '✅' : '❌'} 𝐅𝐢𝐥𝐭𝐫𝐨 𝐓𝐢𝐤𝐓𝐨𝐤 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨'}`)
      break

    case 'antitag':
      requireAdmin()
      chat.antiTag = isEnable
      result = box('𝐀𝐍𝐓𝐈 𝐓𝐀𝐆', `${isEnable ? '✅' : '❌'} 𝐏𝐫𝐨𝐭𝐞𝐳𝐢𝐨𝐧𝐞 𝐭𝐚𝐠 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐚' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐚'}`)
      break

    case 'antigore':
      requireAdmin()
      chat.antigore = isEnable
      result = box('𝐀𝐍𝐓𝐈 𝐆𝐎𝐑𝐄', `${isEnable ? '✅' : '❌'} 𝐅𝐢𝐥𝐭𝐫𝐨 𝐜𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐢 𝐯𝐢𝐨𝐥𝐞𝐧𝐭𝐢 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨'}`)
      break

    case 'antiporno':
    case 'antiporn':
      requireAdmin()
      chat.antiporno = isEnable
      thumbFeature = 'antiporno'
      result = box('𝐀𝐍𝐓𝐈 𝐏𝐎𝐑𝐍𝐎', `${isEnable ? '✅' : '❌'} 𝐅𝐢𝐥𝐭𝐫𝐨 𝐍𝐒𝐅𝐖 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨'}`)
      break

    case 'soloadmin':
    case 'modoadmin':
      requireAdmin()
      chat.modoadmin = isEnable
      thumbFeature = 'modoadmin'
      result = box(
        '𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍',
        isEnable
          ? '✅ 𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐢 𝐜𝐨𝐦𝐚𝐧𝐝𝐢'
          : '❌ 𝐎𝐫𝐚 𝐭𝐮𝐭𝐭𝐢 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐢 𝐜𝐨𝐦𝐚𝐧𝐝𝐢'
      )
      break

    case 'benvenuto':
      requireAdmin()
      chat.welcome = isEnable
      result = box('𝐁𝐄𝐍𝐕𝐄𝐍𝐔𝐓𝐎', `${isEnable ? '✅' : '❌'} 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐝𝐢 𝐛𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐢' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐢'}`)
      break

    case 'addio':
      requireAdmin()
      chat.goodbye = isEnable
      result = box('𝐀𝐃𝐃𝐈𝐎', `${isEnable ? '✅' : '❌'} 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐝𝐢 𝐮𝐬𝐜𝐢𝐭𝐚 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐢' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐢'}`)
      break

    case 'antiprivato':
      requireOwner()
      bot.antiprivato = isEnable
      result = box('𝐀𝐍𝐓𝐈 𝐏𝐑𝐈𝐕𝐀𝐓𝐎', `${isEnable ? '✅' : '❌'} 𝐁𝐥𝐨𝐜𝐜𝐨 𝐜𝐡𝐚𝐭 𝐩𝐫𝐢𝐯𝐚𝐭𝐞 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨'}`)
      break

    case 'antibot':
      requireAdmin()
      chat.antiBot = isEnable
      result = box('𝐀𝐍𝐓𝐈 𝐁𝐎𝐓', `${isEnable ? '✅' : '❌'} 𝐁𝐥𝐨𝐜𝐜𝐨 𝐚𝐥𝐭𝐫𝐢 𝐛𝐨𝐭 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨'}`)
      break

    case 'antispam':
      requireAdmin()
      chat.antispam = isEnable
      result = box('𝐀𝐍𝐓𝐈 𝐒𝐏𝐀𝐌', `${isEnable ? '✅' : '❌'} 𝐅𝐢𝐥𝐭𝐫𝐨 𝐬𝐩𝐚𝐦 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨'}`)
      break

    case 'antitrava':
      requireAdmin()
      chat.antitrava = isEnable
      result = box('𝐀𝐍𝐓𝐈 𝐓𝐑𝐀𝐕𝐀', `${isEnable ? '✅' : '❌'} 𝐅𝐢𝐥𝐭𝐫𝐨 𝐭𝐞𝐬𝐭𝐨 𝐭𝐫𝐚𝐯𝐚 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨'}`)
      break
  }

  result += `

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  const thumbnail = await getThumbBuffer(thumbFeature)

  try {
    await conn.sendMessage(m.chat, {
      text: result,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.rcanal?.contextInfo?.forwardedNewsletterMessageInfo?.newsletterJid || '120363424041538498@newsletter',
          newsletterName: global.rcanal?.contextInfo?.forwardedNewsletterMessageInfo?.newsletterName || '𝛥𝐗𝐈𝐎𝐍 𝚩𝚯𝐓',
          serverMessageId: -1
        },
        externalAdReply: {
          title: '𝚫𝐗𝐈𝐎𝐍 • 𝐒𝐘𝐒𝐓𝐄𝐌',
          body: `Utenza: ${senderName}`,
          ...(thumbnail ? { thumbnail } : {}),
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false
        }
      }
    }, { quoted: m })
  } catch (e) {
    console.error('Errore invio preview funzione:', e)
    return m.reply(result)
  }
}