// Plugin Classifiche by Bonzino

const DELAY_TRA_GRUPPI_MS = 2000
const PREMI_TOP10 = [500, 300, 200, 150, 100, 80, 60, 50, 40, 30]

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function ensureChat(chat, oggi) {
  if (!chat.classificaGiornaliera || chat.classificaGiornaliera.ultimoReset !== oggi) {
    chat.classificaGiornaliera = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }
  }

  if (!chat.topNotturna) {
    chat.topNotturna = {
      ultimoInvio: null,
      inCorso: false
    }
  }
}

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num || 0)
}

function getClassifica(utenti = {}, limite = 10) {
  return Object.entries(utenti)
    .filter(([_, data]) => (data?.conteggio || 0) > 0)
    .sort((a, b) => (b[1]?.conteggio || 0) - (a[1]?.conteggio || 0))
    .slice(0, limite)
}

async function inviaTopNotturna(conn, chatId, chatData, dataLabel) {
  const classifica = getClassifica(chatData.classificaGiornaliera?.utenti || {}, 10)
  if (!classifica.length) return

  const medaglie = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
  const menzioni = []

  let testo = `╭━━━━━━━🌙━━━━━━━╮
*✦ 𝐓𝐎𝐏 𝟏𝟎 𝐆𝐈𝐎𝐑𝐍𝐀𝐋𝐈𝐄𝐑𝐀 ✦*
╰━━━━━━━🌙━━━━━━━╯

*📅 𝐆𝐢𝐨𝐫𝐧𝐨:* *${dataLabel}*
*📊 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐭𝐨𝐭𝐚𝐥𝐢:* *${formatNumber(chatData.classificaGiornaliera?.totali || 0)}*

*──────────────*`

  classifica.forEach(([jid, data], i) => {
    const premio = PREMI_TOP10[i] || 0
    const user = global.db.data.users[jid] || (global.db.data.users[jid] = {})
    if (typeof user.euro !== 'number') user.euro = 0
    user.euro += premio

    menzioni.push(jid)

    testo += `

*${medaglie[i]} ${i + 1}°* *@${jid.split('@')[0]}* • *${formatNumber(data?.conteggio || 0)} 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢*
*💸 𝐏𝐫𝐞𝐦𝐢𝐨:* *+${formatNumber(premio)}€*`
  })

  testo += `

*──────────────*
*🔥 𝐋𝐚 𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐚 è 𝐭𝐞𝐫𝐦𝐢𝐧𝐚𝐭𝐚, 𝐝𝐚 𝐨𝐫𝐚 𝐬𝐢 𝐫𝐢𝐩𝐚𝐫𝐭𝐞!*
*⏳ 𝐍𝐮𝐨𝐯𝐚 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚, 𝐧𝐮𝐨𝐯𝐚 𝐬𝐟𝐢𝐝𝐚.*`

  await conn.sendMessage(chatId, {
    text: testo,
    mentions: menzioni,
    footer: '𝐏𝐫𝐞𝐦𝐢 𝐠𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐢 𝐚𝐬𝐬𝐞𝐠𝐧𝐚𝐭𝐢✅️',
    buttons: [
      { buttonId: `.top`, buttonText: { displayText: 'Top Oggi' }, type: 1 },
      { buttonId: `.topall`, buttonText: { displayText: 'TopAll' }, type: 1 }
    ],
    headerType: 1
  })
}

async function processaTopNotturnaSeNecessaria(conn, currentChatId) {
  const now = new Date()
  const ora = now.getHours()
  const minuto = now.getMinutes()

  if (ora !== 0 || minuto > 10) return
 
  const dataOggi = now.toDateString()
  const ieri = new Date(now)
  ieri.setDate(ieri.getDate() - 1)
  const dataIeri = ieri.toLocaleDateString('it-IT')

  const chats = global.db.data.chats || {}
  const keys = Object.keys(chats).filter(id => id.endsWith('@g.us'))

  for (const chatId of keys) {
    const chat = chats[chatId]
    if (!chat) continue

    if (!chat.topNotturna) {
      chat.topNotturna = {
        ultimoInvio: null,
        inCorso: false
      }
    }

    if (chat.topNotturna.ultimoInvio === dataOggi) continue
    if (chat.topNotturna.inCorso) continue

    const classificaVecchia = chat.classificaGiornaliera
    if (!classificaVecchia || classificaVecchia.ultimoReset === dataOggi) continue

    if ((classificaVecchia.totali || 0) <= 0) {
      chat.topNotturna.ultimoInvio = dataOggi
      chat.classificaGiornaliera = {
        totali: 0,
        utenti: {},
        ultimoReset: dataOggi
      }
      continue
    }

    chat.topNotturna.inCorso = true

    try {
      if (chatId !== currentChatId) {
        await delay(DELAY_TRA_GRUPPI_MS)
      }

      await inviaTopNotturna(conn, chatId, chat, dataIeri)

      chat.classificaGiornaliera = {
        totali: 0,
        utenti: {},
        ultimoReset: dataOggi
      }

      chat.topNotturna.ultimoInvio = dataOggi
    } catch (e) {
      console.error('Errore invio top notturna:', chatId, e)
    } finally {
      chat.topNotturna.inCorso = false
    }
  }
}

let handler = async (m, { conn, command, usedPrefix, isAdmin, isOwner }) => {
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  let oggi = new Date().toDateString()

  ensureChat(chat, oggi)

  if (command === 'resettp') {
    if (!isAdmin && !isOwner && !m.fromMe) {
      return m.reply(`╭━━━━━━━🔒━━━━━━━╮
*✦ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ✦*
╰━━━━━━━🔒━━━━━━━╯

*❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐨𝐰𝐧𝐞𝐫 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐫𝐞 𝐥𝐚 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚*`)
    }

    chat.classificaGiornaliera = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }

    return m.reply(`╭━━━━━━━🔄━━━━━━━╮
*✦ 𝐑𝐄𝐒𝐄𝐓 ✦*
╰━━━━━━━🔄━━━━━━━╯

*✅ 𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐠𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐚 𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐭𝐚*`)
  }

  const isAll = /^topall/i.test(command)

  let limite = 3
  if (command.includes('5')) limite = 5
  if (command.includes('10')) limite = 10

  let classifica = []
  let totaleMessaggi = 0

  if (isAll) {
    let utenti = chat.users || {}

    classifica = Object.entries(utenti)
      .map(([id, data]) => [id, { conteggio: data.messages || 0 }])
      .filter(u => u[1].conteggio > 0)
      .sort((a, b) => b[1].conteggio - a[1].conteggio)
      .slice(0, limite)

    totaleMessaggi = Object.values(utenti)
      .reduce((acc, u) => acc + (u.messages || 0), 0)

    if (!classifica.length) {
      return m.reply(`╭━━━━━━━📊━━━━━━━╮
*✦ 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 ✦*
╰━━━━━━━📊━━━━━━━╯

*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨*`)
    }
  } else {
    if (!chat.classificaGiornaliera || chat.classificaGiornaliera.totali === 0) {
      return m.reply(`╭━━━━━━━📊━━━━━━━╮
*✦ 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 ✦*
╰━━━━━━━📊━━━━━━━╯

*⏳ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐨𝐠𝐠𝐢*`)
    }

    let dati = chat.classificaGiornaliera
    totaleMessaggi = dati.totali

    classifica = Object.entries(dati.utenti || {})
      .filter(u => (u[1].conteggio || 0) > 0)
      .sort((a, b) => b[1].conteggio - a[1].conteggio)
      .slice(0, limite)
  }

  const medaglie = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
  const titolo = isAll
    ? '*🌐 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐆𝐋𝐎𝐁𝐀𝐋𝐄*'
    : '*⏳ 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐃𝐈 𝐎𝐆𝐆𝐈*'

  let testo = `╭━━━━━━━📊━━━━━━━╮
*✦ 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 ✦*
╰━━━━━━━📊━━━━━━━╯

${titolo}

*𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐭𝐨𝐭𝐚𝐥𝐢:* *${formatNumber(totaleMessaggi)}* • *𝐓𝐨𝐩 ${classifica.length}*

*──────────────*`

  let menzioni = classifica.map(([jid]) => jid).filter(Boolean)

  classifica.forEach(([jid, data], i) => {
    let posizione = i + 1
    let medaglia = medaglie[i] || '🏅'

    testo += `

*${medaglia} ${posizione}°* *@${jid.split('@')[0]}* • *${formatNumber(data.conteggio || 0)} 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢*`
  })

  testo += `

*──────────────*
${isAll
    ? `*⏳ 𝐏𝐞𝐫 𝐥𝐚 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐝𝐢 𝐨𝐠𝐠𝐢: ${usedPrefix}top*`
    : `*🌐 𝐏𝐞𝐫 𝐥𝐚 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐬𝐭𝐨𝐫𝐢𝐜𝐚: ${usedPrefix}topall*`}`

  let buttons = []

  if (isAll) {
    if (limite === 3) {
      buttons.push(
        { buttonId: `${usedPrefix}topall5`, buttonText: { displayText: 'TopAll 5' }, type: 1 },
        { buttonId: `${usedPrefix}top`, buttonText: { displayText: 'Top Oggi' }, type: 1 }
      )
    } else if (limite === 5) {
      buttons.push(
        { buttonId: `${usedPrefix}topall10`, buttonText: { displayText: 'TopAll 10' }, type: 1 },
        { buttonId: `${usedPrefix}topall`, buttonText: { displayText: 'TopAll 3' }, type: 1 }
      )
    } else {
      buttons.push(
        { buttonId: `${usedPrefix}topall`, buttonText: { displayText: 'TopAll 3' }, type: 1 },
        { buttonId: `${usedPrefix}top`, buttonText: { displayText: 'Top Oggi' }, type: 1 }
      )
    }
  } else {
    if (limite === 3) {
      buttons.push(
        { buttonId: `${usedPrefix}top5`, buttonText: { displayText: 'Top 5' }, type: 1 },
        { buttonId: `${usedPrefix}topall`, buttonText: { displayText: 'TopAll' }, type: 1 }
      )
    } else if (limite === 5) {
      buttons.push(
        { buttonId: `${usedPrefix}top10`, buttonText: { displayText: 'Top 10' }, type: 1 },
        { buttonId: `${usedPrefix}top`, buttonText: { displayText: 'Top 3' }, type: 1 }
      )
    } else {
      buttons.push(
        { buttonId: `${usedPrefix}top`, buttonText: { displayText: 'Top 3' }, type: 1 },
        { buttonId: `${usedPrefix}topall`, buttonText: { displayText: 'TopAll' }, type: 1 }
      )
    }
  }

  await conn.sendMessage(m.chat, {
    text: testo,
    mentions: menzioni,
    footer: isAll
      ? 'Classifica storica del gruppo'
      : 'Classifica giornaliera del gruppo',
    buttons,
    headerType: 1
  }, { quoted: m })
}

handler.before = async function (m, { conn }) {
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  let oggi = new Date().toDateString()

  if (!chat.classificaGiornaliera || !chat.topNotturna) {
    ensureChat(chat, oggi)
  }

  await processaTopNotturnaSeNecessaria(conn, m.chat)

  if (!chat.classificaGiornaliera || chat.classificaGiornaliera.ultimoReset !== oggi) {
    chat.classificaGiornaliera = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }
  }

  let giornaliera = chat.classificaGiornaliera
  giornaliera.totali++

  if (!giornaliera.utenti[m.sender]) {
    giornaliera.utenti[m.sender] = { conteggio: 0 }
  }

  giornaliera.utenti[m.sender].conteggio++
}

handler.command = /^(top|top5|top10|topall|topall5|topall10|resettp)$/i
handler.group = true
handler.tags = ['group']
handler.help = ['top', 'top5', 'top10', 'topall', 'topall5', 'topall10', 'resettp']

export default handler