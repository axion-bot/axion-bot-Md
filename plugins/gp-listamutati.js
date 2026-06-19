//listamutati by Bonzino 

import { createMuteCard } from '../lib/cards/mute-card.js'

let handler = async (m, { conn, isAdmin, isOwner, isROwner, command }) => {

  const cleanJid = jid => String(jid || '').replace(/[^0-9]/g, '')
  const chatId = m.chat

  function ensureChatMuteStore(chat) {
    global.db.data.chats ||= {}
    global.db.data.chats[chat] ||= {}
    global.db.data.chats[chat].mutedUsers ||= {}

    return global.db.data.chats[chat].mutedUsers
  }

  function formatRemaining(ms) {
    if (!ms || ms <= 0) return 'scaduto'

    const minutes = Math.ceil(ms / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days >= 1) return `${days} ${days === 1 ? 'giorno' : 'giorni'}`
    if (hours >= 1) return `${hours} ${hours === 1 ? 'ora' : 'ore'}`
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minuti'}`
  }

  function muteListButtons() {
    return [
      {
        buttonId: '.smutautente',
        buttonText: {
          displayText: '🔊 Smuta utente'
        },
        type: 1
      },
      {
        buttonId: '.listamutati',
        buttonText: {
          displayText: '🔄 Aggiorna lista'
        },
        type: 1
      }
    ]
  }

  function openListButton() {
    return [
      {
        buttonId: '.listamutati',
        buttonText: {
          displayText: '🔇 Apri lista'
        },
        type: 1
      }
    ]
  }

  function buildMutedList(chat) {
    const mutedUsers = ensureChatMuteStore(chat)
    const entries = []

    for (const jid in mutedUsers) {
      const data = mutedUsers[jid]

      if (!data) continue

      if (
        data !== true &&
        data.expiresAt &&
        Date.now() >= data.expiresAt
      ) {
        delete mutedUsers[jid]
        continue
      }

      entries.push({
        jid,
        data
      })
    }

    return entries
  }

  if (!(isAdmin || isOwner || isROwner)) {
    throw '⛔ *𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*'
  }

  const cmd = String(command || '').toLowerCase()
  const mutedList = buildMutedList(chatId)

  if (cmd === 'mutati' || cmd === 'listamutati') {

    if (!mutedList.length) {
      return conn.sendMessage(chatId, {
        text: '✅ *𝐋𝐈𝐒𝐓𝐀 𝐌𝐔𝐓𝐀𝐓𝐈*\n\n*𝐍𝐞𝐬𝐬𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 𝐦𝐮𝐭𝐚𝐭ο 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭ο 𝐠𝐫𝐮𝐩𝐩𝐨.*',
        footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
        buttons: [
          {
            buttonId: '.listamutati',
            buttonText: {
              displayText: '🔄 Aggiorna lista'
            },
            type: 1
          }
        ],
        headerType: 1
      }, { quoted: m })
    }

    const mentions = mutedList.map(u => u.jid)

    const list = mutedList.map((u, i) => {
      const tag = '@' + cleanJid(u.jid)

      const duration =
        u.data === true ||
        !u.data.expiresAt
          ? '*♾️ 𝐃𝐮𝐫𝐚𝐭𝐚:* *permanente*'
          : `*⏳ 𝐃𝐮𝐫𝐚𝐭𝐚:* *${formatRemaining(u.data.expiresAt - Date.now())}*`

      return `*${i + 1}. 👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}\n${duration}`
    }).join('\n\n')

    return conn.sendMessage(chatId, {
      text: `🔇 *𝐋𝐈𝐒𝐓𝐀 𝐌𝐔𝐓𝐀𝐓𝐈*\n\n${list}`,
      mentions,
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
      buttons: muteListButtons(),
      headerType: 1
    }, { quoted: m })
  }

  if (cmd === 'smutautente') {

    if (!mutedList.length) {
      return conn.sendMessage(chatId, {
        text: '⚠️ *𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐮𝐭𝐞𝐧𝐭𝐢 𝐦𝐮𝐭𝐚𝐭𝐢 𝐝𝐚 𝐬𝐦𝐮𝐭𝐚𝐫𝐞.*',
        footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
        buttons: [
          {
            buttonId: '.listamutati',
            buttonText: {
              displayText: '🔄 Aggiorna lista'
            },
            type: 1
          }
        ],
        headerType: 1
      }, { quoted: m })
    }

    const mentions = mutedList.map(u => u.jid)

    const buttons = mutedList.slice(0, 10).map((u, i) => ({
      buttonId: `.smutaid ${i + 1}`,
      buttonText: {
        displayText: `${i + 1}`
      },
      type: 1
    }))

    const list = mutedList.map((u, i) => {
      return `*${i + 1}. 👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${cleanJid(u.jid)}`
    }).join('\n')

    return conn.sendMessage(chatId, {
      text: `🔊 *𝐒𝐌𝐔𝐓𝐀 𝐔𝐓𝐄𝐍𝐓𝐄*\n\n${list}\n\n*𝐒𝐞𝐥𝐞𝐳𝐢𝐨𝐧𝐚 𝐢𝐥 𝐧𝐮𝐦𝐞𝐫𝐨 𝐝𝐞𝐥𝐥’𝐮𝐭𝐞𝐧𝐭𝐞 𝐝𝐚 𝐬𝐦𝐮𝐭𝐚𝐫𝐞.*`,
      mentions,
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
      buttons,
      headerType: 1
    }, { quoted: m })
  }

  if (cmd === 'smutaid') {
    const number = Number(String(m.text || '').split(' ')[1])

    if (!number || number < 1 || number > mutedList.length) {
      return conn.sendMessage(chatId, {
        text: '⚠️ *𝐍𝐮𝐦𝐞𝐫𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.*',
        footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
        buttons: openListButton(),
        headerType: 1
      }, { quoted: m })
    }

    const target = mutedList[number - 1]

    if (!target) {
      return conn.sendMessage(chatId, {
        text: '⚠️ *𝐔𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.*',
        footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
        buttons: openListButton(),
        headerType: 1
      }, { quoted: m })
    }

    const mutedUsers = ensureChatMuteStore(chatId)
    delete mutedUsers[target.jid]

    const username = await conn.getName(target.jid)

    let avatar

    try {
      avatar = await conn.profilePictureUrl(target.jid, 'image')
    } catch {
      avatar = undefined
    }

    const card = await createMuteCard(
      username,
      avatar,
      false
    )

    return conn.sendMessage(chatId, {
      image: card,
      caption: `🔊 *𝐌𝐔𝐓𝐄 𝐑𝐈𝐌𝐎𝐒𝐒𝐎*\n\n*𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 𝐩𝐮𝐨̀ 𝐭𝐨𝐫𝐧𝐚𝐫𝐞 𝐚 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞.*\n\n*👮 𝐄𝐬𝐞𝐠𝐮𝐢𝐭𝐨 𝐝𝐚:* @${cleanJid(m.sender)}\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [target.jid, m.sender]
    }, { quoted: m })
  }
}

handler.command = /^(mutati|listamutati|smutautente|smutaid)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
