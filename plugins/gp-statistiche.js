// Plugin statistiche by Bonzino

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num || 0)
}

function formatDateLabel(date = new Date()) {
  return date.toLocaleDateString('it-IT')
}

let handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) return m.reply('*⚠️ 𝐒𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢*')

  const chat = global.db.data.chats?.[m.chat] || {}
  const giornaliera = chat.classificaGiornaliera || { utenti: {}, totali: 0 }

  const classificaOggi = Object.entries(giornaliera.utenti || {})
    .filter(([_, data]) => (data?.conteggio || 0) > 0)
    .sort((a, b) => (b[1]?.conteggio || 0) - (a[1]?.conteggio || 0))

  const posizione = classificaOggi.findIndex(([jid]) => jid === m.sender)
  const posizioneReale = posizione >= 0 ? posizione + 1 : '-'

  const msgOggi = giornaliera.utenti?.[m.sender]?.conteggio || 0
  const totaleOggi = giornaliera.totali || 0
  const dataOggi = formatDateLabel(new Date())

  let nome = 'Utente'
  let nomeGruppo = 'Gruppo'

  try {
    nome = await conn.getName(m.sender)
  } catch {
    nome = m.pushName || 'Utente'
  }

  try {
    const meta = await conn.groupMetadata(m.chat)
    nomeGruppo = meta?.subject || 'Gruppo'
  } catch {
    nomeGruppo = 'Gruppo'
  }

  const text = `
*𝐋𝐄 𝐓𝐔𝐄 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐇𝐄📊*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${nome}
*📍 𝐏𝐨𝐬𝐢𝐳𝐢𝐨𝐧𝐞:* *#${posizioneReale}*
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐨𝐠𝐠𝐢:* *${formatNumber(msgOggi)}*
*📅 𝐃𝐚𝐭𝐚:* *${dataOggi}*

*🏷️ 𝐆𝐫𝐮𝐩𝐩𝐨:* ${nomeGruppo}
*👥 𝐓𝐨𝐭𝐚𝐥𝐞 𝐠𝐫𝐮𝐩𝐩𝐨:* *${formatNumber(totaleOggi)} 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  await conn.sendMessage(m.chat, {
    text,
    buttons: [
      { buttonId: `${usedPrefix}top`, buttonText: { displayText: '🏆 Top 3' }, type: 1 },
      { buttonId: `${usedPrefix}top10`, buttonText: { displayText: '📊 Top 10' }, type: 1 },
      { buttonId: `${usedPrefix}topall`, buttonText: { displayText: '🌐 TopAll' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['statistiche', 'stats']
handler.tags = ['group']
handler.command = /^(statistiche|stats)$/i
handler.group = true

export default handler