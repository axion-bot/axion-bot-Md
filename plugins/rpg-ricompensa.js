// by Bonzino

const cooldown = 24 * 60 * 60 * 1000

function formatTime(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms % 3600000 / 60000)
  return `${h}h ${m}m`
}

function getStreakEmoji(streak) {
  if (streak >= 30) return '🔥🔥🔥🔥🔥'
  if (streak >= 20) return '🔥🔥🔥🔥'
  if (streak >= 10) return '🔥🔥🔥'
  if (streak >= 5) return '🔥🔥'
  if (streak >= 2) return '🔥'
  return '✨'
}

let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  if (!user) return

  if (!user.lastDaily) user.lastDaily = 0
  if (!user.money) user.money = 0
  if (!user.dailyStreak) user.dailyStreak = 0

  const now = Date.now()
  const diff = now - user.lastDaily

  if (diff < cooldown) {
    return conn.sendMessage(m.chat, {
      text: `*⏳ 𝐓𝐨𝐫𝐧𝐚 𝐝𝐨𝐦𝐚𝐧𝐢*\n\n𝐏𝐮𝐨𝐢 𝐫𝐢𝐬𝐜𝐚𝐭𝐭𝐚𝐫𝐞 𝐥𝐚 𝐫𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚 𝐭𝐫𝐚 ${formatTime(cooldown - diff)}`
    }, { quoted: m })
  }

  if (diff > cooldown * 2) {
    user.dailyStreak = 0
  }

  user.dailyStreak += 1
  user.lastDaily = now

  const base = 200
  const bonus = user.dailyStreak * 50
  const reward = base + bonus

  user.money += reward

  const tag = '@' + m.sender.split('@')[0]
  const streakEmoji = getStreakEmoji(user.dailyStreak)

  let motivazione = ''

  if (user.dailyStreak === 1) motivazione = '𝐁𝐮𝐨𝐧 𝐢𝐧𝐢𝐳𝐢𝐨!'
  else if (user.dailyStreak < 5) motivazione = '𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐚 𝐜𝐨𝐬𝐢!'
  else if (user.dailyStreak < 10) motivazione = '🔥 𝐒𝐭𝐚𝐢 𝐜𝐫𝐞𝐬𝐜𝐞𝐧𝐝𝐨!'
  else if (user.dailyStreak < 20) motivazione = '💎 𝐒𝐭𝐫𝐞𝐚𝐤 𝐢𝐦𝐩𝐫𝐞𝐬𝐬𝐢𝐨𝐧𝐚𝐧𝐭𝐞!'
  else motivazione = '👑 𝐋𝐞𝐠𝐠𝐞𝐧𝐝𝐚 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨!'

  const msg = `*╭━━━〔 🎁 𝐃𝐀𝐈𝐋𝐘 〕━━━⬣*
┃ ${tag} 𝐡𝐚𝐢 𝐫𝐢𝐬𝐜𝐚𝐭𝐭𝐚𝐭𝐨 𝐥𝐚 𝐭𝐮𝐚 𝐫𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚 𝐠𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐚! 🎉
┃
┃ *💰 +${reward}*
┃ *${streakEmoji} 𝐒𝐭𝐫𝐞𝐚𝐤:* ${user.dailyStreak} 𝐠𝐢𝐨𝐫𝐧𝐢
┃
┃ ${motivazione}
┃
┃ ⏳ 𝐓𝐨𝐫𝐧𝐚 𝐝𝐨𝐦𝐚𝐧𝐢 𝐩𝐞𝐫 𝐧𝐨𝐧 𝐩𝐞𝐫𝐝𝐞𝐫𝐞 𝐥𝐚 𝐬𝐭𝐫𝐞𝐚𝐤!
*╰━━━━━━━━━━━━━━━━⬣*`

  await conn.sendMessage(m.chat, {
    text: msg,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['daily', 'ricompensa']
handler.tags = ['economy']
handler.command = /^(daily|giornaliero|ricompensa)$/i

export default handler