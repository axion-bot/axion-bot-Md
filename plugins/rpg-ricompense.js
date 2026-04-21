// Plugin ricompense by Bonzino

const TRAGUARDI_MESSAGGI = [50, 100, 150, 250, 400, 600, 850, 1150, 1500]
const PREMI_MESSAGGI = [30, 60, 90, 140, 220, 320, 450, 650, 900]

const TRAGUARDI_GRUPPO_GIORNO = [500, 1000, 1500, 2200, 3000, 4000, 5500, 7000, 8500, 10000]
const PREMI_GRUPPO_GIORNO = [120, 220, 320, 450, 650, 900, 1300, 1800, 2400, 3200]

const FINESTRA_ATTIVITA_MS = 2 * 60 * 60 * 1000

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num)
}

function getTodayKey() {
  return new Date().toLocaleDateString('en-CA')
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

function ensureRecentActivity(chat) {
  chat.recentActivity ??= {}
  return chat.recentActivity
}

function trackRecentMessage(chat, sender) {
  const recent = ensureRecentActivity(chat)
  recent[sender] ??= []
  recent[sender].push(Date.now())

  const minTime = Date.now() - FINESTRA_ATTIVITA_MS

  for (const jid of Object.keys(recent)) {
    recent[jid] = recent[jid].filter(ts => ts >= minTime)
    if (!recent[jid].length) delete recent[jid]
  }
}

function getRecentActiveUsers(chat) {
  const recent = ensureRecentActivity(chat)
  const minTime = Date.now() - FINESTRA_ATTIVITA_MS

  return Object.entries(recent)
    .map(([jid, timestamps]) => {
      const valid = timestamps.filter(ts => ts >= minTime)
      return { jid, count: valid.length }
    })
    .filter(v => v.count > 0)
    .sort((a, b) => b.count - a.count)
}

function calcolaPremioAttivita(count) {
  if (count >= 120) return 350
  if (count >= 90) return 260
  if (count >= 60) return 180
  if (count >= 35) return 110
  if (count >= 20) return 60
  if (count >= 10) return 30
  return 0
}

function ensureGroupMilestoneState(chat) {
  chat.classificaGiornaliera ??= {}
  const todayKey = String(chat.classificaGiornaliera.ultimoReset || getTodayKey())

  if (!chat.classificaGiornaliera.traguardiMessaggiGruppoState) {
    chat.classificaGiornaliera.traguardiMessaggiGruppoState = {
      dayKey: todayKey,
      unlocked: []
    }
  }

  const state = chat.classificaGiornaliera.traguardiMessaggiGruppoState

  if (state.dayKey !== todayKey) {
    state.dayKey = todayKey
    state.unlocked = []
  }

  if (!Array.isArray(state.unlocked)) state.unlocked = []

  return state
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
`🎉 *𝐍𝐮𝐨𝐯𝐨 𝐨𝐛𝐢𝐞𝐭𝐭𝐢𝐯𝐨 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨! 🥳*

╭━━━━━━━━━━━━━━⬣
┃ *💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢:* *${formatNumber(traguardo)}*
┃ *💰 𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚:* *${formatNumber(premioBase)}€*
┃ *🎁 𝐁𝐨𝐧𝐮𝐬:* *+${formatNumber(bonus)}€*
┃ *🏦 𝐓𝐨𝐭𝐚𝐥𝐞:* *${formatNumber(totale)}€*
┃ *✨ 𝐄𝐯𝐞𝐧𝐭𝐨:* ${evento}
┃
┃ *🚀 𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐚 𝐚 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞 𝐩𝐞𝐫 𝐬𝐛𝐥𝐨𝐜𝐜𝐚𝐫𝐞 𝐫𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐞 𝐬𝐞𝐦𝐩𝐫𝐞 𝐩𝐢ù 𝐚𝐥𝐭𝐞!*
╰━━━━━━━━━━━━━━⬣`,
      mentions: [m.sender]
    }, { quoted: m })
  } catch (e) {
    console.error('ricompensa messaggi error:', e)
  }
}

async function controllaTraguardoGruppo(m, conn) {
  try {
    if (!m.isGroup) return

    const chat = global.db.data.chats?.[m.chat]
    if (!chat?.classificaGiornaliera?.utenti) return

    const state = ensureGroupMilestoneState(chat)
    const totaleGruppo = Number(chat.classificaGiornaliera.totali || 0)

    for (let i = 0; i < TRAGUARDI_GRUPPO_GIORNO.length; i++) {
      const traguardo = TRAGUARDI_GRUPPO_GIORNO[i]
      if (totaleGruppo < traguardo) continue
      if (state.unlocked.includes(traguardo)) continue

      state.unlocked.push(traguardo)

      const bonusSbloccato = PREMI_GRUPPO_GIORNO[i]
      const recenti = getRecentActiveUsers(chat)
      const premiati = []

      for (const row of recenti) {
        const premio = calcolaPremioAttivita(row.count)
        if (premio <= 0) continue

        global.db.data.users[row.jid] ??= {}
        const user = global.db.data.users[row.jid]
        if (typeof user.euro !== 'number') user.euro = 0

        user.euro += premio
        premiati.push({
          jid: row.jid,
          count: row.count,
          premio
        })
      }

      const premiText = premiati.length ? premiati
      .slice(0, 10)
      .map(v => `• @${v.jid.split('@')[0]} — *${formatNumber(v.count)} msg* *(+${formatNumber(v.premio)}€)*`)
      .join('\n')
  : '*𝐍𝐞𝐬𝐬𝐮𝐧 𝐩𝐫𝐞𝐦𝐢𝐨 𝐚𝐬𝐬𝐞𝐠𝐧𝐚𝐭𝐨 𝐝𝐢 𝐫𝐞𝐜𝐞𝐧𝐭𝐞.*'

      await conn.sendMessage(m.chat, {
        text:
`🎉 *𝐍𝐮𝐨𝐯𝐨 𝐨𝐛𝐢𝐞𝐭𝐭𝐢𝐯𝐨 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨! 🥳*

╭━━━━━━━━━━━━━━⬣
┃ *💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐆𝐫𝐮𝐩𝐩𝐨:* *${formatNumber(traguardo)}*
┃ *🎁 𝐁𝐨𝐧𝐮𝐬 𝐒𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨:* *${formatNumber(bonusSbloccato)}€*
┃
┃ *🚀 𝐆𝐥𝐢 𝐮𝐭𝐞𝐧𝐭𝐢 𝐩𝐢ù 𝐚𝐭𝐭𝐢𝐯𝐢 𝐝𝐢 𝐫𝐞𝐜𝐞𝐧𝐭𝐞*
┃ *𝐡𝐚𝐧𝐧𝐨 𝐫𝐢𝐜𝐞𝐯𝐮𝐭𝐨 𝐮𝐧 𝐛𝐨𝐧𝐮𝐬 𝐞𝐱𝐭𝐫𝐚!*
╰━━━━━━━━━━━━━━⬣

╭━━━〔 🎁 𝐏𝐑𝐄𝐌𝐈 〕━━━⬣
┃ ${premiText.replace(/\n/g, '\n┃ ')}
╰━━━━━━━━━━━━━━━━━━━━⬣

*🔥 𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐚𝐭𝐞 𝐚 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞!*
*💎 𝐏𝐨𝐭𝐫𝐞𝐬𝐭𝐞 𝐫𝐢𝐜𝐞𝐯𝐞𝐫𝐞 𝐚𝐥𝐭𝐫𝐢 𝐩𝐫𝐞𝐦𝐢 𝐞𝐬𝐜𝐥𝐮𝐬𝐢𝐯𝐢!*`,
        mentions: premiati.map(v => v.jid)
      }, { quoted: m })
    }
  } catch (e) {
    console.error('traguardo gruppo error:', e)
  }
}

let handler = async (m) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

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
  const bonusStreak = Math.min(user.dailyStreak * 50, 1500)
  const reward = base + bonusStreak

  user.euro += reward
  user.lastDaily = now

  const { traguardo, premioBase } = getMessageRewardData(user)

  return m.reply(
`🎉 *𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚 𝐆𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐚 𝐑𝐢𝐭𝐢𝐫𝐚𝐭𝐚! 🥳*

━━━〔 💰 𝐃𝐀𝐈𝐋𝐘 〕━━━⬣
┃ *💵 𝐁𝐚𝐬𝐞:* *${formatNumber(base)}€*
┃ *🔥 𝐁𝐨𝐧𝐮𝐬 𝐒𝐭𝐫𝐞𝐚𝐤:* *+${formatNumber(bonusStreak)}€*
┃ *🏦 𝐓𝐨𝐭𝐚𝐥𝐞:* *${formatNumber(reward)}€*
╰━━━━━━━━━━━━━━━━━━━━⬣`)
}

handler.before = async function (m, { conn }) {
  if (!m || !m.sender || m.fromMe) return
  if (!global.db?.data?.users?.[m.sender]) return

  if (m.isGroup && global.db.data.chats?.[m.chat]) {
    trackRecentMessage(global.db.data.chats[m.chat], m.sender)
  }

  await controllaRicompensaMessaggi(m, conn)
  await controllaTraguardoGruppo(m, conn)
}

handler.help = ['daily']
handler.tags = ['rpg']
handler.command = /^(daily|ricompensa)$/i

export default handler