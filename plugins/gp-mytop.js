// Plugin MyTop by Bonzino

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num || 0)
}

function getRank(list = [], jid = '') {
  const index = list.findIndex(([id]) => id === jid)
  return index >= 0 ? index + 1 : 0
}

function getMedal(pos) {
  if (pos === 1) return '🥇'
  if (pos === 2) return '🥈'
  if (pos === 3) return '🥉'
  return '🏅'
}

let handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) return m.reply('*⚠️ 𝐒𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢*')

  const chat = global.db.data.chats?.[m.chat] || {}
  const user = global.db.data.users?.[m.sender] || {}

  const giornaliera = chat.classificaGiornaliera || { utenti: {}, totali: 0 }
  const utentiTotali = chat.users || {}

  const classificaOggi = Object.entries(giornaliera.utenti || {})
    .filter(([_, data]) => (data?.conteggio || 0) > 0)
    .sort((a, b) => (b[1]?.conteggio || 0) - (a[1]?.conteggio || 0))

  const classificaTotale = Object.entries(utentiTotali || {})
    .map(([jid, data]) => [jid, { conteggio: data?.messages || 0 }])
    .filter(([_, data]) => (data?.conteggio || 0) > 0)
    .sort((a, b) => (b[1]?.conteggio || 0) - (a[1]?.conteggio || 0))

  const rankOggi = getRank(classificaOggi, m.sender)
  const rankTotale = getRank(classificaTotale, m.sender)

  const msgOggi = giornaliera.utenti?.[m.sender]?.conteggio || 0
  const msgTotali = user.messages || 0

  if (!rankOggi && !rankTotale && !msgOggi && !msgTotali) {
    return m.reply('*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐝𝐚𝐭𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞*')
  }

  const medalOggi = getMedal(rankOggi)
  const medalTotale = getMedal(rankTotale)

  const text = `╭━━━〔 📊 𝐌𝐘 𝐓𝐎𝐏 〕━━━⬣
┃  
┃ 👤 @${m.sender.split('@')[0]}
┃
┃ *⏳ 𝐎𝐆𝐆𝐈*
┃ ${rankOggi ? `${medalOggi} *#${rankOggi}* • *${formatNumber(msgOggi)} 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢*` : '🏅 *𝐍𝐨𝐧 𝐢𝐧 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚*'}
┃ *👥 𝐔𝐭𝐞𝐧𝐭𝐢:* *${formatNumber(classificaOggi.length)}*
┃
┃ ──────────────
┃
┃ *🌐 𝐓𝐎𝐓𝐀𝐋𝐄*
┃ ${rankTotale ? `${medalTotale} *#${rankTotale}* • *${formatNumber(msgTotali)} 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢*` : '🏅 *𝐍𝐨𝐧 𝐢𝐧 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚*'}
┃ *👥 𝐔𝐭𝐞𝐧𝐭𝐢:* *${formatNumber(classificaTotale.length)}*
╰━━━━━━━━━━━━━━⬣`

  await conn.sendMessage(m.chat, {
    text,
    mentions: [m.sender],
    footer: '𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐥𝐞',
    buttons: [
      { buttonId: `${usedPrefix}top`, buttonText: { displayText: 'Top Oggi' }, type: 1 },
      { buttonId: `${usedPrefix}topall`, buttonText: { displayText: 'TopAll' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['mytop']
handler.tags = ['group']
handler.command = /^(mytop|miatop|mymessages|myrank)$/i
handler.group = true

export default handler