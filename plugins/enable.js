import fs from 'fs'

let handler = async (m, { conn, command, args, isAdmin, isOwner, isROwner, usedPrefix }) => {
  const isEnable = /^(attiva|enable|1)$/i.test(command)

  const chats = global.db.data.chats
  const settings = global.db.data.settings

  chats[m.chat] ??= {}
  settings[conn.user.jid] ??= {}

  const chat = chats[m.chat]
  const bot = settings[conn.user.jid]

  const thumbs = {
    antilink: './media/funzioni/antilink.png',
    antiinsta: './media/funzioni/antiinsta.png',
    antitelegram: './media/funzioni/antitelegram.png',
    antitiktok: './media/funzioni/antitiktok.png',
    antitag: './media/funzioni/antitag.png',
    antigore: './media/funzioni/antigore.png',
    antiporno: './media/funzioni/antiporno.png',
    antiporn: './media/funzioni/antiporno.png',
    modoadmin: './media/funzioni/modoadmin.png',
    soloadmin: './media/funzioni/modoadmin.png',
    benvenuto: './media/funzioni/benvenuto.png',
    addio: './media/funzioni/addio.png',
    antiprivato: './media/funzioni/antiprivato.png',
    antibot: './media/funzioni/antibot.png',
    antispam: './media/funzioni/antispam.png',
    antitrava: './media/funzioni/antitrava.png',
    default: './media/funzioni/default.png'
  }

  const getThumbBuffer = feature => {
    try {
      const file = thumbs[feature] || thumbs.default
      return fs.readFileSync(file)
    } catch {
      try {
        return fs.readFileSync(thumbs.default)
      } catch {
        return null
      }
    }
  }

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

*🛡️ 𝐒𝐢𝐜𝐮𝐫𝐞𝐳𝐳𝐚:*
*antilink, antispam, antibot*
*antiporno, antigore, antitrava*
*antitag, antiprivato*

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
      result = box('𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍', `${isEnable ? '✅' : '❌'} 𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐢𝐥 𝐛𝐨𝐭`)
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
      result = box('𝐀𝐍𝐓𝐈 𝐓𝐑𝐀𝐕𝐀', `${isEnable ? '✅' : '❌'} 𝐏𝐫𝐨𝐭𝐞𝐳𝐢𝐨𝐧𝐞 𝐜𝐫𝐚𝐬𝐡 ${isEnable ? '𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐚' : '𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐚'}`)
      break

    default:
      throw box('𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐄 𝐒𝐂𝐎𝐍𝐎𝐒𝐂𝐈𝐔𝐓𝐀', '⚠️ 𝐋𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐧𝐨𝐧 è 𝐯𝐚𝐥𝐢𝐝𝐚')
  }

  const thumbBuffer = getThumbBuffer(thumbFeature)

  await conn.sendMessage(m.chat, {
    text: result,
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      externalAdReply: {
        title: '𝚫𝐗𝐈𝐎𝐍 • 𝐒𝐘𝐒𝐓𝐄𝐌',
        body: `Utenza: ${senderName}`,
        thumbnail: thumbBuffer,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.help = ['attiva <feature>', 'disattiva <feature>']
handler.tags = ['group']
handler.command = ['attiva', 'disattiva', 'enable', 'disable', '1', '0']

export default handler