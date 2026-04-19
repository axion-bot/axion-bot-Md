// Plugin ricompense by Bonzino

const TRAGUARDI_MESSAGGI = [50, 100, 150, 250, 400, 600, 850, 1150, 1500]
const PREMI_MESSAGGI = [30, 60, 90, 140, 220, 320, 450, 650, 900]

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num)
}

function getMessageRewardData(user) {
  if (typeof user.totalMessages !== 'number') user.totalMessages = 0
  if (typeof user.messageRewardIndex !== 'number') user.messageRewardIndex = 0

  let traguardo = 0
  let premioBase = 0

  if (user.messageRewardIndex < TRAGUARDI_MESSAGGI.length) {
    traguardo = TRAGUARDI_MESSAGGI[user.messageRewardIndex]
    premioBase = PREMI_MESSAGGI[user.messageRewardIndex]
  } else {
    const extraIndex = user.messageRewardIndex - TRAGUARDI_MESSAGGI.length
    traguardo = 1500 + ((extraIndex + 1) * 500)
    premioBase = 900 + ((extraIndex + 1) * 250)
  }

  return { traguardo, premioBase }
}

function calcolaBonusMessaggi() {
  let bonus = Math.floor(Math.random() * 51)
  let evento = '*✨ 𝐁𝐨𝐧𝐮𝐬 𝐧𝐨𝐫𝐦𝐚𝐥𝐞*'

  const roll = Math.random()

  if (roll < 0.01) {
    bonus += 1000
    evento = '*💎 𝐉𝐀𝐂𝐊𝐏𝐎𝐓 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈*'
  } else if (roll < 0.04) {
    bonus += 300
    evento = '*🔥 𝐒𝐔𝐏𝐄𝐑 𝐁𝐎𝐍𝐔𝐒*'
  } else if (roll < 0.19) {
    bonus += 100
    evento = '*⚡ 𝐁𝐎𝐍𝐔𝐒 𝐑𝐀𝐑𝐎*'
  }

  return { bonus, evento }
}

async function controllaRicompensaMessaggi(m, conn) {
  try {
    if (!global.db?.data?.users?.[m.sender]) return

    let user = global.db.data.users[m.sender]

    if (typeof user.euro !== 'number') user.euro = 0
    if (typeof user.totalMessages !== 'number') user.totalMessages = 0
    if (typeof user.messageRewardIndex !== 'number') user.messageRewardIndex = 0

    user.totalMessages += 1

    const { traguardo, premioBase } = getMessageRewardData(user)

    if (user.totalMessages < traguardo) return

    const { bonus, evento } = calcolaBonusMessaggi()
    const totale = premioBase + bonus

    user.euro += totale
    user.messageRewardIndex += 1

    await conn.sendMessage(m.chat, {
      text:
`╭━━━〔 🏆 𝐍𝐔𝐎𝐕𝐎 𝐎𝐁𝐈𝐄𝐓𝐓𝐈𝐕𝐎 𝐑𝐀𝐆𝐆𝐈𝐔𝐍𝐓𝐎 〕━━━⬣
┃ *📝 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐢:* *${formatNumber(traguardo)}*
┃ *💰 𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚 𝐛𝐚𝐬𝐞:* *${formatNumber(premioBase)}€*
┃ ${evento}: *+${formatNumber(bonus)}€*
┃ *🏦 𝐓𝐨𝐭𝐚𝐥𝐞 𝐨𝐭𝐭𝐞𝐧𝐮𝐭𝐨:* *${formatNumber(totale)}€*
┃
┃ *🚀 𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐚 𝐚 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞 𝐩𝐞𝐫 𝐬𝐛𝐥𝐨𝐜𝐜𝐚𝐫𝐞 𝐫𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐞 𝐬𝐞𝐦𝐩𝐫𝐞 𝐩𝐢ù 𝐚𝐥𝐭𝐞!*
╰━━━━━━━━━━━━━━━━━━━━⬣`,
      mentions: [m.sender]
    }, { quoted: m })
  } catch (e) {
    console.error('ricompensa messaggi error:', e)
  }
}

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  if (typeof user.euro !== 'number') user.euro = 0
  if (typeof user.lastDaily !== 'number') user.lastDaily = 0
  if (typeof user.dailyStreak !== 'number') user.dailyStreak = 0
  if (typeof user.maxDailyStreak !== 'number') user.maxDailyStreak = 0
  if (typeof user.totalMessages !== 'number') user.totalMessages = 0
  if (typeof user.messageRewardIndex !== 'number') user.messageRewardIndex = 0

  const now = Date.now()
  const cooldown = 24 * 60 * 60 * 1000
  const streakReset = 48 * 60 * 60 * 1000

  const elapsed = now - user.lastDaily
  const timeLeft = cooldown - elapsed

  if (user.lastDaily && elapsed < cooldown) {
    const ore = Math.floor(timeLeft / 3600000)
    const minuti = Math.floor((timeLeft % 3600000) / 60000)

    return m.reply(
`*⏳ 𝐇𝐚𝐢 𝐠𝐢à 𝐫𝐢𝐭𝐢𝐫𝐚𝐭𝐨 𝐥𝐚 𝐭𝐮𝐚 𝐫𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚 𝐠𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐚.*

*🕒 𝐓𝐨𝐫𝐧𝐚 𝐭𝐫𝐚:* *${ore}𝐡 ${minuti}𝐦*`)
  }

  if (user.lastDaily && elapsed > streakReset) {
    user.dailyStreak = 0
  }

  user.dailyStreak += 1
  if (user.dailyStreak > user.maxDailyStreak) {
    user.maxDailyStreak = user.dailyStreak
  }

  const base = 250
  const bonus = Math.min(user.dailyStreak * 50, 1500)
  const reward = base + bonus

  user.euro += reward
  user.lastDaily = now

  const { traguardo, premioBase } = getMessageRewardData(user)

  return m.reply(
`╭━━━〔 🎁 𝐑𝐈𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀 𝐆𝐈𝐎𝐑𝐍𝐀𝐋𝐈𝐄𝐑𝐀 〕━━━⬣
┃ *💰 𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚 𝐛𝐚𝐬𝐞:* *${formatNumber(base)}€*
┃ *🔥 𝐁𝐨𝐧𝐮𝐬 𝐬𝐭𝐫𝐞𝐚𝐤:* *+${formatNumber(bonus)}€*
┃ *🏦 𝐓𝐨𝐭𝐚𝐥𝐞 𝐨𝐭𝐭𝐞𝐧𝐮𝐭𝐨:* *${formatNumber(reward)}€*
┃
┃ *🔥 𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐚 𝐥𝐚 𝐬𝐭𝐫𝐞𝐚𝐤 𝐩𝐞𝐫 𝐨𝐭𝐭𝐞𝐧𝐞𝐫𝐞 𝐛𝐨𝐧𝐮𝐬 𝐬𝐞𝐦𝐩𝐫𝐞 𝐩𝐢ù 𝐚𝐥𝐭𝐢!*
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 📊 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐇𝐄 〕━━━⬣
┃ *📅 𝐒𝐭𝐫𝐞𝐚𝐤 𝐚𝐭𝐭𝐮𝐚𝐥𝐞:* *${formatNumber(user.dailyStreak)}*
┃ *👑 𝐌𝐢𝐠𝐥𝐢𝐨𝐫 𝐬𝐭𝐫𝐞𝐚𝐤:* *${formatNumber(user.maxDailyStreak)}*
┃ *💼 𝐒𝐚𝐥𝐝𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞:* *${formatNumber(user.euro)}€*
╰━━━━━━━━━━━━━━━━━━━━⬣`)
}

handler.before = async function (m, { conn }) {
  if (!m || !m.sender || m.fromMe) return
  if (!global.db?.data?.users?.[m.sender]) return
  await controllaRicompensaMessaggi(m, conn)
}

handler.help = ['daily']
handler.tags = ['rpg']
handler.command = /^(daily|ricompensa)$/i

export default handler