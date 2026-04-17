// Plugin Bandiera by Bonzino 

import fetch from 'node-fetch'
import { createCanvas, loadImage } from 'canvas'

const H = '╭━━━〔 *🏳️ 𝐁𝐀𝐍𝐃𝐈𝐄𝐑𝐀* 〕━━━⬣'
const F = '╰━━━━━━━━━━━━━━━━⬣'
const GAME_MS = 30_000
const MAX_TENTATIVI = 3
const ANSWER_COOLDOWN_MS = 1200
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const playAgainButtons = () => [{
  name: 'quick_reply',
  buttonParamsJson: JSON.stringify({
    display_text: '⟲ Gioca Ancora',
    id: '.bandiera'
  })
}]

const gameButtons = () => [{
  name: 'quick_reply',
  buttonParamsJson: JSON.stringify({
    display_text: '💡 Indizio',
    id: '.indiziobandiera'
  })
}]

function normalizeString(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function similarity(a, b) {
  const x = normalizeString(a)
  const y = normalizeString(b)
  if (!x || !y) return false
  if (x === y) return true
  if (x.includes(y) || y.includes(x)) return true
  return false
}

function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function addUnique(arr, value) {
  if (!arr.includes(value)) arr.push(value)
}

function getHintText(name = '') {
  const clean = String(name).trim()
  if (!clean) return '𝐈𝐧𝐝𝐢𝐳𝐢𝐨 𝐧𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞'

  const masked = clean
    .split('')
    .map((ch, i, arr) => {
      if (ch === ' ' || ch === '-' || ch === "'") return ch
      if (i === 0 || i === arr.length - 1) return ch
      return '•'
    })
    .join('')

  const firstLetter = clean[0]
  const lastLetter = clean[clean.length - 1]
  const lettersOnly = clean.replace(/[^A-Za-zÀ-ÿ]/g, '').length

  return `*💡 𝐈𝐧𝐝𝐢𝐳𝐢𝐨:*\n┃ *𝐈𝐧𝐢𝐳𝐢𝐚 𝐜𝐨𝐧:* ${firstLetter}\n┃ *𝐅𝐢𝐧𝐢𝐬𝐜𝐞 𝐜𝐨𝐧:* ${lastLetter}\n┃ *𝐋𝐞𝐭𝐭𝐞𝐫𝐞:* ${lettersOnly}\n┃ *𝐅𝐨𝐫𝐦𝐚:* ${masked}`
}

async function loadAllFlags() {
  if (global.allFlagsCache?.length) return global.allFlagsCache

  const res = await fetch('https://restcountries.com/v3.1/all?fields=cca2,name,translations,altSpellings')
  if (!res.ok) throw new Error(`RESTCountries ${res.status}`)

  const json = await res.json()

  const flags = json
    .filter(c => c?.cca2 && c?.name?.common)
    .map(c => {
      const names = []

      addUnique(names, c.name.common)
      if (c.name.official) addUnique(names, c.name.official)

      const it = c.translations?.ita
      if (it?.common) addUnique(names, it.common)
      if (it?.official) addUnique(names, it.official)

      for (const v of c.altSpellings || []) {
        if (v && v.length > 1) addUnique(names, v)
      }

      return {
        url: `https://flagcdn.com/w320/${String(c.cca2).toLowerCase()}.png`,
        nome: it?.common || c.name.common,
        alias: names.map(normalizeString).filter(Boolean)
      }
    })
    .filter(v => v.alias.length)

  global.allFlagsCache = flags
  return flags
}

async function createFlagThumb(url) {
  try {
    const img = await loadImage(url)

    const SIZE = 320
    const PADDING = 14
    const W = SIZE
    const H = SIZE

    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#000000ff'
    ctx.fillRect(0, 0, W, H)

    const innerW = W - PADDING * 2
    const innerH = H - PADDING * 2

    const scale = Math.min(innerW / img.width, innerH / img.height)
    const newW = Math.max(1, Math.round(img.width * scale))
    const newH = Math.max(1, Math.round(img.height * scale))
    const x = Math.round((W - newW) / 2)
    const y = Math.round((H - newH) / 2)

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, x, y, newW, newH)

    return canvas.toBuffer('image/jpeg', { quality: 0.9 })
  } catch {
    return null
  }
}

async function sendFlagCard(conn, chat, url, caption, quoted) {
  const thumb = await createFlagThumb(url)

  if (thumb) {
    return conn.sendMessage(
      chat,
      {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title: '      🌍 𝐐𝐮𝐢𝐳 𝐠𝐞𝐨𝐠𝐫𝐚𝐟𝐢𝐜𝐨',
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false,
            thumbnail: thumb
          }
        }
      },
      { quoted }
    )
  }

  return conn.sendMessage(
    chat,
    {
      image: { url },
      caption
    },
    { quoted }
  )
}

function ensureUser(user) {
  if (typeof user.euro !== 'number') user.euro = 0
  if (typeof user.bandieraStreak !== 'number') user.bandieraStreak = 0
}

function addReward(user, coins) {
  ensureUser(user)
  user.euro += coins
}

function getSpeedBonus(seconds) {
  if (seconds <= 3) return 40
  if (seconds <= 5) return 30
  if (seconds <= 8) return 20
  if (seconds <= 12) return 10
  return 0
}

function getSpeedLabel(seconds) {
  if (seconds <= 3) return '*⚡ 𝐅𝐮𝐥𝐦𝐢𝐧𝐞𝐨*'
  if (seconds <= 5) return '*🚀 𝐕𝐞𝐥𝐨𝐜𝐢𝐬𝐬𝐢𝐦𝐨*'
  if (seconds <= 8) return '*🔥 𝐎𝐭𝐭𝐢𝐦𝐚 𝐯𝐞𝐥𝐨𝐜𝐢𝐭𝐚*̀'
  if (seconds <= 12) return '*⚡ 𝐁𝐮𝐨𝐧𝐚 𝐯𝐞𝐥𝐨𝐜𝐢𝐭à*'
  return '*🧠 𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐜𝐨𝐫𝐫𝐞𝐭𝐭𝐚*'
}

function getStreakBonus(streak) {
  if (streak >= 20) return 50
  if (streak >= 10) return 30
  if (streak >= 5) return 15
  if (streak >= 2) return 5
  return 0
}

function getStreakEmoji(streak) {
  if (streak >= 20) return '🔥🔥🔥🔥'
  if (streak >= 10) return '🔥🔥🔥'
  if (streak >= 5) return '🔥🔥'
  if (streak >= 2) return '🔥'
  return '✨'
}

let handler = async (m, { conn, command, isAdmin }) => {
  global.bandieraGame = global.bandieraGame || {}

  if (command === 'indiziobandiera') {
    if (!m.isGroup) return m.reply('*⚠️ 𝐒𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢*')
    const game = global.bandieraGame[m.chat]
    if (!game) return m.reply('*⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐭𝐭𝐢𝐯𝐚'*)

    if (game.hintUsed) {
      return m.reply(`*⚠️ 𝐇𝐚𝐢 𝐠𝐢à 𝐮𝐬𝐚𝐭𝐨 𝐥'𝐢𝐧𝐝𝐢𝐳𝐢𝐨*\n\n${game.hintText}`)
    }

    game.hintUsed = true

    await conn.sendMessage(m.chat, {
      text: `${H}
┃ 💡 𝐈𝐍𝐃𝐈𝐙𝐈𝐎
┃
${game.hintText}
${F}`
    }, { quoted: m })

    return
  }

  if (command === 'skipbandiera') {
    if (!m.isGroup) return m.reply('⚠️ 𝐒𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢')
    if (!global.bandieraGame[m.chat]) return m.reply('⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐭𝐭𝐢𝐯𝐚')
    if (!isAdmin && !m.fromMe) return m.reply('❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧')

    const game = global.bandieraGame[m.chat]
    clearTimeout(game.timeout)

    await conn.sendMessage(m.chat, {
      text: `${H}
┃ *⛔ 𝐏𝐀𝐑𝐓𝐈𝐓𝐀 𝐈𝐍𝐓𝐄𝐑𝐑𝐎𝐓𝐓𝐀*
┃
┃ *🏳️ 𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚:* ${game.rispostaOriginale}
${F}`
    }, { quoted: m })

    delete global.bandieraGame[m.chat]
    return
  }

  if (!m.isGroup) return m.reply('⚠️ 𝐒𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢')
  if (global.bandieraGame[m.chat]) return m.reply('⚠️ 𝐂𝐞̀ 𝐠𝐢à 𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐭𝐭𝐢𝐯𝐚')

  let bandiere
  try {
    bandiere = await loadAllFlags()
  } catch {
    return m.reply('❌ 𝐍𝐨𝐧 𝐫𝐢𝐞𝐬𝐜𝐨 𝐚 𝐜𝐚𝐫𝐢𝐜𝐚𝐫𝐞 𝐥𝐞 𝐛𝐚𝐧𝐝𝐢𝐞𝐫𝐞')
  }

  const frasi = [
    '*🧠 𝐌𝐞𝐭𝐭𝐢 𝐚𝐥𝐥𝐚 𝐩𝐫𝐨𝐯𝐚 𝐥𝐚 𝐭𝐮𝐚 𝐦𝐞𝐧𝐭𝐞!*',
    '*🌍 𝐑𝐢𝐜𝐨𝐧𝐨𝐬𝐜𝐢 𝐪𝐮𝐞𝐬𝐭𝐚 𝐛𝐚𝐧𝐝𝐢𝐞𝐫𝐚?*',
    '*🎯 𝐒𝐨𝐥𝐨 𝐢 𝐯𝐞𝐫𝐢 𝐞𝐬𝐩𝐞𝐫𝐭𝐢 𝐢𝐧𝐝𝐨𝐯𝐢𝐧𝐚𝐧𝐨!*',
    '*🔍 𝐎𝐬𝐬𝐞𝐫𝐯𝐚 𝐛𝐞𝐧𝐞 𝐨𝐠𝐧𝐢 𝐝𝐞𝐭𝐭𝐚𝐠𝐥𝐢𝐨...*',
    '*⚡ 𝐒𝐟𝐢𝐝𝐚 𝐚𝐭𝐭𝐢𝐯𝐚!*'
  ]

  const scelta = pickRandom(bandiere)
  const frase = pickRandom(frasi)

  const sent = await sendFlagCard(
    conn,
    m.chat,
    scelta.url,
    `${H}
┃ *🌍 𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀 𝐋𝐀 𝐍𝐀𝐙𝐈𝐎𝐍𝐄*
┃
┃ ${frase}
┃
┃ ⏱️ *𝐓𝐞𝐦𝐩𝐨*: 30𝐬
┃ 🎯 *𝐓𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐢*: ${MAX_TENTATIVI} *𝐩𝐞𝐫 𝐮𝐭𝐞𝐧𝐭𝐞*
${F}`,
    m
  )
  
  await delay(1200)

  await conn.sendMessage(m.chat, {
    text: '*💡 𝐔𝐬𝐚 𝐢𝐥 𝐩𝐮𝐥𝐬𝐚𝐧𝐭𝐞 𝐪𝐮𝐢 𝐬𝐨𝐭𝐭𝐨 𝐩𝐞𝐫 𝐥\'𝐢𝐧𝐝𝐢𝐳𝐢𝐨*',
    interactiveButtons: gameButtons()
  }, { quoted: sent })

  global.bandieraGame[m.chat] = {
    id: sent.key.id,
    risposta: normalizeString(scelta.nome),
    rispostaOriginale: scelta.nome,
    alias: scelta.alias,
    hintText: getHintText(scelta.nome),
    hintUsed: false,
    tentativi: {},
    lastAnswerAt: {},
    startTime: Date.now(),
    timeout: setTimeout(async () => {
      const game = global.bandieraGame?.[m.chat]
      if (!game) return

      await conn.sendMessage(m.chat, {
        text: `${H}
┃ *⏰ 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎*
┃
┃ *🏳️ 𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚:* ${game.rispostaOriginale}
${F}`,
        interactiveButtons: playAgainButtons()
      })

      delete global.bandieraGame[m.chat]
    }, GAME_MS)
  }
}

handler.before = async (m, { conn }) => {
  const game = global.bandieraGame?.[m.chat]
  if (!game) return
  if (!m.quoted || m.quoted.id !== game.id) return
  if (!m.text) return

  const rawText = String(m.text || '').trim()

  if (/^[./#!](indiziobandiera|bandiera|skipbandiera)\b/i.test(rawText)) {
    return
  }

  const now = Date.now()
  const last = game.lastAnswerAt[m.sender] || 0
  if (now - last < ANSWER_COOLDOWN_MS) return true
  game.lastAnswerAt[m.sender] = now

  const guess = normalizeString(m.text)
  if (!guess) return true

  const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
  ensureUser(user)

  const isCorrect = game.alias.some(v => similarity(guess, v))

  if (isCorrect) {
    clearTimeout(game.timeout)

    user.bandieraStreak += 1

    const seconds = Math.floor((Date.now() - game.startTime) / 1000)
    const baseReward = Math.floor(Math.random() * 31) + 20
    const speedBonus = getSpeedBonus(seconds)
    const streakBonus = getStreakBonus(user.bandieraStreak)
    const totalReward = baseReward + speedBonus + streakBonus
    const speedLabel = getSpeedLabel(seconds)
    const streakEmoji = getStreakEmoji(user.bandieraStreak)

    addReward(user, totalReward)

    const speedLine = speedBonus > 0
      ? `┃ ⚡ 𝐁𝐨𝐧𝐮𝐬 𝐯𝐞𝐥𝐨𝐜𝐢𝐭à: +${speedBonus}\n`
      : ''

    const streakLine = streakBonus > 0
      ? `┃ ${streakEmoji} 𝐁𝐨𝐧𝐮𝐬 𝐬𝐭𝐫𝐞𝐚𝐤: +${streakBonus}\n`
      : `┃ ${streakEmoji} 𝐒𝐭𝐫𝐞𝐚𝐤: ${user.bandieraStreak}\n`

    await conn.sendMessage(m.chat, {
      text: `${H}
┃ *✅ 𝐂𝐎𝐑𝐑𝐄𝐓𝐓𝐎!*
┃
┃ *🏳️ 𝐁𝐚𝐧𝐝𝐢𝐞𝐫𝐚:* ${game.rispostaOriginale}
┃ *⏱️ 𝐓𝐞𝐦𝐩𝐨:* ${seconds}𝐬
┃ *🎖️ 𝐄𝐬𝐢𝐭𝐨:* ${speedLabel}
┃
┃ *💰 𝐁𝐚𝐬𝐞:* +${baseReward}
${speedLine}${streakLine}┃ *💸 𝐓𝐨𝐭𝐚𝐥𝐞* +${totalReward}
${F}`,
      interactiveButtons: playAgainButtons()
    }, { quoted: m })

    delete global.bandieraGame[m.chat]
    return true
  }

  game.tentativi[m.sender] = (game.tentativi[m.sender] || 0) + 1
  const left = MAX_TENTATIVI - game.tentativi[m.sender]

  if (left <= 0) {
    user.bandieraStreak = 0

    await conn.reply(m.chat, `${H}
┃ *🚫 𝐇𝐚𝐢 𝐟𝐢𝐧𝐢𝐭𝐨 𝐢 𝐭𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐢*
┃
┃ *🏳️ 𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚:* ${game.rispostaOriginale}
┃ *💥 𝐒𝐭𝐫𝐞𝐚𝐤 𝐚𝐳𝐳𝐞𝐫𝐚𝐭𝐚*
${F}`, m)

    delete global.bandieraGame[m.chat]
    return true
  }

  await conn.reply(m.chat, `${H}
┃ *❌ 𝐒𝐛𝐚𝐠𝐥𝐢𝐚𝐭𝐨*
┃ *📝 𝐓𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐢 𝐫𝐢𝐦𝐚𝐬𝐭𝐢:* ${left}
${F}`, m)
  return true
}

handler.help = ['bandiera', 'skipbandiera', 'indiziobandiera']
handler.tags = ['fun']
handler.command = /^(bandiera|skipbandiera|indiziobandiera)$/i
handler.group = true

export default handler