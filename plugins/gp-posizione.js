// Plugin Posizione by Bonzino

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num || 0)
}

let handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply('*⚠️ 𝐒𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢*')
  }

  const chat = global.db.data.chats?.[m.chat] || {}
  const giornaliera = chat.classificaGiornaliera || { utenti: {}, totali: 0 }
  const utentiGruppo = chat.users || {}
  const user = global.db.data.users?.[m.sender] || {}

  const classifica = Object.entries(utentiGruppo)
    .map(([jid, data]) => [jid, { conteggio: data?.messages || 0 }])
    .filter(([_, data]) => (data?.conteggio || 0) > 0)
    .sort((a, b) => (b[1]?.conteggio || 0) - (a[1]?.conteggio || 0))

  const posizione = classifica.findIndex(([jid]) => jid === m.sender)

  if (posizione === -1) {
    return m.reply('*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐝𝐚𝐭𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞*')
  }

  const posizioneReale = posizione + 1
  const totaleMessaggi = user.messages || 0
  const messaggiOggi = giornaliera.utenti?.[m.sender]?.conteggio || 0

  let medaglia = '🏅'
  if (posizioneReale === 1) medaglia = '🥇'
  else if (posizioneReale === 2) medaglia = '🥈'
  else if (posizioneReale === 3) medaglia = '🥉'

  const text = `*╭━━━━━━━🏆━━━━━━━╮*
*✦ 𝐏𝐎𝐒𝐈𝐙𝐈𝐎𝐍𝐄 ✦*
*╰━━━━━━━🏆━━━━━━━╯*

*${medaglia} 𝐏𝐨𝐬𝐢𝐳𝐢𝐨𝐧𝐞:* *#${posizioneReale}*
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐭𝐨𝐭𝐚𝐥𝐢:* *${formatNumber(totaleMessaggi)}*
*⏳ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐨𝐠𝐠𝐢:* *${formatNumber(messaggiOggi)}*
*📊 𝐔𝐭𝐞𝐧𝐭𝐢 𝐢𝐧 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚:* *${formatNumber(classifica.length)}*`

  await conn.sendMessage(m.chat, {
    text,
    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    buttons: [
      {
        buttonId: '.top',
        buttonText: { displayText: '📊 Top Oggi' },
        type: 1
      },
      {
        buttonId: '.topall',
        buttonText: { displayText: '🌐 TopAll' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['posizione']
handler.tags = ['group']
handler.command = /^(posizione|rank|mypost|myrank)$/i
handler.group = true

export default handler