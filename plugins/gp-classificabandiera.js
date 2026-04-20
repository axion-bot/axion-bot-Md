// Plugin TopBandiera by Bonzino

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num || 0)
}

function getPercent(vittorie, giocate) {
  if (!giocate) return 0
  return Math.round((vittorie / giocate) * 100)
}

let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('*⚠️ 𝐒𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢*')

  const chat = global.db.data.chats?.[m.chat] || {}
  const utentiGruppo = chat.users || {}
  const ordinaPerGiocate = /^topbandieragiocate$/i.test(command)

  const classifica = Object.keys(utentiGruppo)
    .map(jid => {
      const user = global.db.data.users?.[jid] || {}
      return {
        jid,
        vittorie: user.bandieraVittorie || 0,
        giocate: user.bandieraGiocate || 0
      }
    })
    .filter(user => user.vittorie > 0 || user.giocate > 0)
    .sort((a, b) => {
      if (ordinaPerGiocate) {
        return (b.giocate - a.giocate) || (b.vittorie - a.vittorie)
      }
      return (b.vittorie - a.vittorie) || (b.giocate - a.giocate)
    })
    .slice(0, 10)

  if (!classifica.length) {
    return m.reply(`╭━━━━━━━🏳️━━━━━━━╮
*✦ 𝐓𝐎𝐏 𝐁𝐀𝐍𝐃𝐈𝐄𝐑𝐀 ✦*
╰━━━━━━━🏳️━━━━━━━╯

*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐝𝐚𝐭𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐩𝐞𝐫 𝐢𝐥 𝐠𝐢𝐨𝐜𝐨 𝐛𝐚𝐧𝐝𝐢𝐞𝐫𝐚*`)
  }

  const medaglie = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
  const menzioni = classifica.map(user => user.jid)
  const sottotitolo = ordinaPerGiocate
    ? '*📊 𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐨𝐫𝐝𝐢𝐧𝐚𝐭𝐚 𝐩𝐞𝐫 𝐠𝐢𝐨𝐜𝐚𝐭𝐞*'
    : '*📊 𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐨𝐫𝐝𝐢𝐧𝐚𝐭𝐚 𝐩𝐞𝐫 𝐯𝐢𝐭𝐭𝐨𝐫𝐢𝐞*'

  let testo = `╭━━━━━━━🏳️━━━━━━━╮
*✦ 𝐓𝐎𝐏 𝐁𝐀𝐍𝐃𝐈𝐄𝐑𝐀 ✦*
╰━━━━━━━🏳️━━━━━━━╯

${sottotitolo}

*──────────────*`

  classifica.forEach((user, i) => {
    const medaglia = medaglie[i] || '🏅'
    const percent = getPercent(user.vittorie, user.giocate)

    if (ordinaPerGiocate) {
      testo += `

*${medaglia} ${i + 1}°* *@${user.jid.split('@')[0]}* • *${formatNumber(user.giocate)} 𝐠𝐢𝐨𝐜𝐚𝐭𝐞*
*(🏆 ${formatNumber(user.vittorie)} 𝐯𝐢𝐭𝐭𝐨𝐫𝐢𝐞 • 📈 ${percent}%)*`
    } else {
      testo += `

*${medaglia} ${i + 1}°* *@${user.jid.split('@')[0]}* • *${formatNumber(user.vittorie)} 𝐯𝐢𝐭𝐭𝐨𝐫𝐢𝐞*
*(🎮 ${formatNumber(user.giocate)} 𝐠𝐢𝐨𝐜𝐚𝐭𝐞 • 📈 ${percent}%)*`
    }
  })

  testo += `

*──────────────*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  await conn.sendMessage(m.chat, {
    text: testo,
    mentions: menzioni,
    buttons: [
      { buttonId: `${usedPrefix}topbandiera`, buttonText: { displayText: '🏆 𝐎𝐫𝐝𝐢𝐧𝐚 𝐩𝐞𝐫 𝐯𝐢𝐭𝐭𝐨𝐫𝐢𝐞' }, type: 1 },
      { buttonId: `${usedPrefix}topbandieragiocate`, buttonText: { displayText: '🎮 𝐎𝐫𝐝𝐢𝐧𝐚 𝐩𝐞𝐫 𝐠𝐢𝐨𝐜𝐚𝐭𝐞' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['topbandiera', 'topbandieragiocate']
handler.tags = ['fun']
handler.command = /^(topbandiera|topbandieragiocate)$/i
handler.group = true

export default handler