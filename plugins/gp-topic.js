// Plugin Top Indovina Canzone by Bonzino

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num || 0)
}

function getPercent(vittorie, giocate) {
  if (!giocate) return 0
  return Math.round((vittorie / giocate) * 100)
}

function getWinrateEmoji(percent) {
  if (percent >= 90) return '👑'
  if (percent >= 75) return '🔥'
  if (percent >= 60) return '⚡'
  if (percent >= 40) return '📈'
  if (percent >= 20) return '📉'
  return '💀'
}

function normalizeDigits(str = '') {
  return String(str).replace(/\D/g, '')
}

function resolveUserFromParticipants(conn, participant = {}) {
  const rawCandidates = [
    participant.id,
    participant.jid,
    participant.lid
  ].filter(Boolean)

  const decodedCandidates = rawCandidates
    .map(v => conn.decodeJid?.(v) || v)
    .filter(Boolean)

  const allCandidates = [...new Set([...rawCandidates, ...decodedCandidates])]
  const users = global.db.data.users || {}

  for (const jid of allCandidates) {
    if (users[jid]) return { jid, user: users[jid] }
  }

  const numbers = [...new Set(allCandidates.map(v => normalizeDigits(v)).filter(Boolean))]

  for (const num of numbers) {
    const foundKey = Object.keys(users).find(key => normalizeDigits(key) === num)
    if (foundKey) return { jid: foundKey, user: users[foundKey] }
  }

  const fallbackJid = decodedCandidates[0] || rawCandidates[0] || ''
  return { jid: fallbackJid, user: {} }
}

let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('*⚠️ 𝐒𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢*')

  const ordinaPerGiocate = /^topicgiocate$/i.test(command)
  const metadata = await conn.groupMetadata(m.chat)
  const participants = metadata?.participants || []

  const classifica = participants
    .map(p => {
      const resolved = resolveUserFromParticipants(conn, p)
      const jid = resolved.jid
      const user = resolved.user || {}

      return {
        jid,
        vittorie: user.icWins || 0,
        giocate: user.icGames || 0,
        streak: user.icStreak || 0,
        record: user.icRecord || 0,
        euro: user.icEuroWon || 0
      }
    })
    .filter(user => user.jid && (user.vittorie > 0 || user.giocate > 0))
    .sort((a, b) => {
      if (ordinaPerGiocate) {
        return (b.giocate - a.giocate) || (b.vittorie - a.vittorie) || (b.record - a.record)
      }

      return (b.vittorie - a.vittorie) || (b.giocate - a.giocate) || (b.record - a.record)
    })
    .slice(0, 10)

  if (!classifica.length) {
    return m.reply(`*╭━━━━━━━📊━━━━━━━╮*
*✦ 𝐓𝐎𝐏 𝐂𝐀𝐍𝐙𝐎𝐍𝐄 ✦*
*╰━━━━━━━📊━━━━━━━╯*

*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐝𝐚𝐭𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`)
  }

  const medaglie = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
  const menzioni = classifica.map(user => user.jid)

  const sottotitolo = ordinaPerGiocate
    ? '*📊 𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐩𝐞𝐫 𝐠𝐢𝐨𝐜𝐚𝐭𝐞*'
    : '*🏆 𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐩𝐞𝐫 𝐯𝐢𝐭𝐭𝐨𝐫𝐢𝐞*'

  let testo = `*╭━━━━━━━📊━━━━━━━╮*
*✦ 𝐓𝐎𝐏 𝐂𝐀𝐍𝐙𝐎𝐍𝐄 ✦*
*╰━━━━━━━📊━━━━━━━╯*

${sottotitolo}

*──────────────*`

  classifica.forEach((user, i) => {
    const medaglia = medaglie[i] || '🏅'
    const percent = getPercent(user.vittorie, user.giocate)
    const winrateEmoji = getWinrateEmoji(percent)
    const tag = user.jid.split('@')[0]

    if (ordinaPerGiocate) {
      testo += `

*${medaglia} ${i + 1}°* *@${tag}*
*🎮 Giocate:* *${formatNumber(user.giocate)}*
*🏆 Vittorie:* *${formatNumber(user.vittorie)}*
*${winrateEmoji} Winrate:* *${percent}%*
*🔥 Streak:* *${formatNumber(user.streak)}* • *👑 Record:* *${formatNumber(user.record)}*`
    } else {
      testo += `

*${medaglia} ${i + 1}°* *@${tag}*
*🏆 Vittorie:* *${formatNumber(user.vittorie)}*
*🎮 Giocate:* *${formatNumber(user.giocate)}*
*${winrateEmoji} Winrate:* *${percent}%*
*🔥 Streak:* *${formatNumber(user.streak)}* • *👑 Record:* *${formatNumber(user.record)}*`
    }
  })

  testo += `

*──────────────*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  await conn.sendMessage(m.chat, {
    text: testo,
    mentions: menzioni,
    buttons: [
      {
        buttonId: `${usedPrefix}topic`,
        buttonText: { displayText: '🏆 Ordina per: Vittorie' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}topicgiocate`,
        buttonText: { displayText: '🎮 Ordina per: Giocate' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['topic', 'topicgiocate']
handler.tags = ['fun']
handler.command = /^(topic|topicgiocate)$/i
handler.group = true

export default handler