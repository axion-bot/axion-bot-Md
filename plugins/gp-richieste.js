// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

let richiestaInAttesa = {}

function getPendingKey(sender, chat) {
  return `${sender}|${chat}`
}

let handler = async (m, { conn, isAdmin, isBotAdmin, args, usedPrefix, command }) => {
  if (!m.isGroup) return

  const groupId = m.chat
  const pendingKey = getPendingKey(m.sender, groupId)

  if (!isBotAdmin) {
    return m.reply('*⚠️ 𝐃𝐞𝐯𝐨 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐝𝐦𝐢𝐧 𝐩𝐞𝐫 𝐠𝐞𝐬𝐭𝐢𝐫𝐞 𝐥𝐞 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞.*')
  }

  if (!isAdmin) {
    return m.reply('*⚠️ 𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*')
  }

  const pending = await conn.groupRequestParticipantsList(groupId)

  // risposta manuale numero
  if (richiestaInAttesa[pendingKey]) {
    const input = String(m.text || '').trim()
    delete richiestaInAttesa[pendingKey]

    if (!/^\d+$/.test(input)) {
      return m.reply('*⚠️ 𝐈𝐧𝐯𝐢𝐚 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐯𝐚𝐥𝐢𝐝𝐨.*')
    }

    const numero = parseInt(input)
    const daAccettare = pending.slice(0, numero)
    const jidList = daAccettare.map(p => p.jid).filter(Boolean)

    if (!jidList.length) {
      return m.reply('*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐝𝐚 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐫𝐞.*')
    }

    await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve')
    return m.reply(`*✅ 𝐇𝐨 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞.*`)
  }

  if (!pending.length) {
    return m.reply('*✅ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐢𝐧 𝐬𝐨𝐬𝐩𝐞𝐬𝐨.*')
  }

  // menu
  if (!args[0]) {
    return conn.sendMessage(groupId, {
      text: `*📨 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐢𝐧 𝐬𝐨𝐬𝐩𝐞𝐬𝐨:* *${pending.length}*\n\n*𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐬𝐚 𝐟𝐚𝐫𝐞:*`,
      footer: 'Gestione richieste gruppo',
      buttons: [
        { buttonId: `${usedPrefix}${command} accetta`, buttonText: { displayText: '✅ Accetta tutte' }, type: 1 },
        { buttonId: `${usedPrefix}${command} rifiuta`, buttonText: { displayText: '❌ Rifiuta tutte' }, type: 1 },
        { buttonId: `${usedPrefix}${command} accetta39`, buttonText: { displayText: '🇮🇹 Accetta +39' }, type: 1 },
        { buttonId: `${usedPrefix}${command} gestisci`, buttonText: { displayText: '📥 Gestisci numero' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  // accetta tutte
  if (args[0] === 'accetta') {
    const jidList = pending.map(p => p.jid).filter(Boolean)

    if (!jidList.length) {
      return m.reply('*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐝𝐚 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐫𝐞.*')
    }

    await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve')
    return m.reply(`*✅ 𝐇𝐨 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞.*`)
  }

  // rifiuta tutte
  if (args[0] === 'rifiuta') {
    const jidList = pending.map(p => p.jid).filter(Boolean)

    if (!jidList.length) {
      return m.reply('*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐝𝐚 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐫𝐞.*')
    }

    await conn.groupRequestParticipantsUpdate(groupId, jidList, 'reject')
    return m.reply(`*❌ 𝐇𝐨 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞.*`)
  }

  // accetta +39
  if (args[0] === 'accetta39') {
    const italiani = pending.filter(p => String(p.jid || '').startsWith('39'))
    const jidList = italiani.map(p => p.jid).filter(Boolean)

    if (!jidList.length) {
      return m.reply('*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐜𝐨𝐧 𝐩𝐫𝐞𝐟𝐢𝐬𝐬𝐨 +39.*')
    }

    await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve')
    return m.reply(`*✅ 𝐇𝐨 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐜𝐨𝐧 𝐩𝐫𝐞𝐟𝐢𝐬𝐬𝐨 +39.*`)
  }

  // gestione numero
  if (args[0] === 'gestisci') {
    richiestaInAttesa[pendingKey] = true

    return conn.sendMessage(groupId, {
      text: '*❓ 𝐐𝐮𝐚𝐧𝐭𝐞 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐯𝐮𝐨𝐢 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐫𝐞?*\n\n*🔢 𝐒𝐜𝐫𝐢𝐯𝐢 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐢𝐧 𝐜𝐡𝐚𝐭.*',
      footer: 'Gestione richieste',
      buttons: [
        { buttonId: `${usedPrefix}${command} accettane 10`, buttonText: { displayText: '10' }, type: 1 },
        { buttonId: `${usedPrefix}${command} accettane 20`, buttonText: { displayText: '20' }, type: 1 },
        { buttonId: `${usedPrefix}${command} accettane 50`, buttonText: { displayText: '50' }, type: 1 },
        { buttonId: `${usedPrefix}${command} accettane 100`, buttonText: { displayText: '100' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  // accetta numero
  if (args[0] === 'accettane') {
    const numero = parseInt(args[1])
    if (isNaN(numero) || numero <= 0) {
      return m.reply('*⚠️ 𝐍𝐮𝐦𝐞𝐫𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.*')
    }

    const daAccettare = pending.slice(0, numero)
    const jidList = daAccettare.map(p => p.jid).filter(Boolean)

    if (!jidList.length) {
      return m.reply('*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐝𝐚 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐫𝐞.*')
    }

    await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve')
    return m.reply(`*✅ 𝐇𝐨 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞.*`)
  }

  return m.reply(`*⚠️ 𝐔𝐬𝐚:* *${usedPrefix}${command}*`)
}

handler.command = ['richieste']
handler.tags = ['gruppo']
handler.help = ['richieste']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler