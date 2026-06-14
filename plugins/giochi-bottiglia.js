// bottiglia by Bonzino

import fs from 'fs'

const DATA_PATH = './database/bottiglia.json'
const footer = '> 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

global.bottigliaGames ||= {}

const CATEGORY_LABELS = {
  normale: '*🎲 𝐍𝐨𝐫𝐦𝐚𝐥𝐞*',
  imbarazzante: '*😳 𝐈𝐦𝐛𝐚𝐫𝐚𝐳𝐳𝐚𝐧𝐭𝐞*',
  sentimentale: '*💘 𝐒𝐞𝐧𝐭𝐢𝐦𝐞𝐧𝐭𝐚𝐥𝐞*',
  piccante: '*😈 𝐏𝐢𝐜𝐜𝐚𝐧𝐭𝐞*',
  hot18: '*🔞 18+*'
}

const CATEGORY_WEIGHTS = {
  normale: 10,
  imbarazzante: 15,
  sentimentale: 15,
  piccante: 35,
  hot18: 25
}

const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const pick = arr => arr[Math.floor(Math.random() * arr.length)]
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const tag = jid => '@' + String(jid || '').split('@')[0]

async function getName(conn, jid) {
  try {
    return await conn.getName(jid)
  } catch {
    return tag(jid)
  }
}

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
  } catch (e) {
    return { obbligo: {}, verita: {} }
  }
}

function getWeightedCategory() {
  const total = Object.values(CATEGORY_WEIGHTS)
    .reduce((a, b) => a + b, 0)

  let random = Math.random() * total

  for (const [key, value] of Object.entries(CATEGORY_WEIGHTS)) {
    random -= value
    if (random <= 0) return key
  }

  return 'normale'
}

function gameButtons(prefix) {
  return [
    {
      buttonId: `${prefix}bottigliacambia`,
      buttonText: {
        displayText: '🔄 Cambia Domanda'
      },
      type: 1
    },
    {
      buttonId: `${prefix}bottiglia`,
      buttonText: {
        displayText: '↻ Gioca Ancora'
      },
      type: 1
    }
  ]
}
async function startBottleGame(m, conn, usedPrefix, participants) {
  const players = participants
    .map(p => p.id || p.jid)
    .filter(Boolean)
    .filter(jid =>
      jid &&
      !String(jid).includes('@lid') &&
      jid !== conn.user?.jid &&
      jid.split('@')[0] !== conn.user?.jid?.split('@')[0]
    )

  delete global.bottigliaGames[m.chat]

  if (!players.length) {
    return m.reply('*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐠𝐢𝐨𝐜𝐚𝐭𝐨𝐫𝐞 𝐯𝐚𝐥𝐢𝐝𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.*')
  }

  const sent = await conn.sendMessage(
    m.chat,
    {
      text: `🎲 𝐆𝐈𝐎𝐂𝐎 𝐃𝐄𝐋𝐋𝐀 𝐁𝐎𝐓𝐓𝐈𝐆𝐋𝐈𝐀

🔄 𝐋𝐚 𝐛𝐨𝐭𝐭𝐢𝐠𝐥𝐢𝐚 𝐬𝐭𝐚 𝐠𝐢𝐫𝐚𝐧𝐝𝐨...`
    },
    { quoted: m }
  )

  const spins = rand(8, 12)
  const selected = pick(players)

  for (let i = 0; i < spins; i++) {
    const user =
      i === spins - 1
        ? selected
        : pick(players)

    await conn.sendMessage(m.chat, {
      text: `*🍾 𝐆𝐈𝐎𝐂𝐎 𝐃𝐄𝐋𝐋𝐀 𝐁𝐎𝐓𝐓𝐈𝐆𝐋𝐈𝐀*

 *𝐋𝐚 𝐛𝐨𝐭𝐭𝐢𝐠𝐥𝐢𝐚 𝐬𝐭𝐚 𝐠𝐢𝐫𝐚𝐧𝐝𝐨...*

🎯 ${await getName(conn, user)}`,
      mentions: [user],
      edit: sent.key
    })

    let wait = 500

    if (i === spins - 3) wait = 700
    if (i === spins - 2) wait = 900
    if (i === spins - 1) wait = 1200

    await delay(wait)
  }

return generateChallenge(
  m,
  conn,
  usedPrefix,
  sent.key,
  selected
)
}
async function generateChallenge(
  m,
  conn,
  usedPrefix,
  editKey,
  selected
) {
const data = loadData()

const tipo =
  Math.random() < 0.5
    ? 'verita'
    : 'obbligo'

const categoria = getWeightedCategory()

const pool =
  data?.[tipo]?.[categoria] || []


  if (!pool.length) {
    return conn.sendMessage(
      m.chat,
      {
        text: '*❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐝𝐨𝐦𝐚𝐧𝐝𝐚 𝐭𝐫𝐨𝐯𝐚𝐭𝐚.*',
        edit: editKey
      }
    )
  }

  const frase = pick(pool)

  global.bottigliaGames[m.chat] = {
  creator: m.sender,
  selected,
  tipo,
  categoria,
  frase,
  rerollUsed: false,
  createdAt: Date.now(),
  messageKey: editKey,
  originalMessage: m,
  buttonMessage: null
}

  return sendBottleResult(
    m.chat,
    conn,
    usedPrefix,
    editKey,
    global.bottigliaGames[m.chat]
  )
}
async function sendBottleResult(
  chat,
  conn,
  usedPrefix,
  editKey,
  game
) {
  const titolo =
    game.tipo === 'verita'
      ? '*❓ 𝐕𝐄𝐑𝐈𝐓À*'
      : '*🙊 𝐎𝐁𝐁𝐋𝐈𝐆𝐎*'

  const label =
    game.tipo === 'verita'
      ? '*𝐃𝐨𝐦𝐚𝐧𝐝𝐚*'
      : '*𝐒𝐟𝐢𝐝𝐚*'

  await conn.sendMessage(chat, {
    text: `*🍾 𝐆𝐈𝐎𝐂𝐎 𝐃𝐄𝐋𝐋𝐀 𝐁𝐎𝐓𝐓𝐈𝐆𝐋𝐈𝐀*

👤 *𝐆𝐢𝐨𝐜𝐚𝐭𝐨𝐫𝐞:* ${tag(game.selected)}
🏷️ *𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚:* ${CATEGORY_LABELS[game.categoria]}

${titolo}

📜 ${label}

${game.frase}

${footer}`,
    mentions: [game.selected],
    edit: editKey
  })

  const btn = await conn.sendMessage(
    chat,
    {
      text: '👇 *Scegli un’opzione*',
      buttons: gameButtons(usedPrefix),
      headerType: 1
    },
    {
      quoted: game.originalMessage
    }
  )

  game.buttonMessage = btn.key

  return btn
}
async function rerollChallenge(
  m,
  conn,
  usedPrefix
) {
  const game = global.bottigliaGames[m.chat]

  if (!game) {
    return m.reply('*❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐭𝐭𝐢𝐯𝐚.*')
  }

  if (
    ![game.creator, game.selected]
      .includes(m.sender)
  ) {
    return m.reply(
      '*❌ 𝐒𝐨𝐥𝐨 𝐢𝐥 𝐠𝐢𝐨𝐜𝐚𝐭𝐨𝐫𝐞 𝐬𝐞𝐥𝐞𝐳𝐢𝐨𝐧𝐚𝐭𝐨 𝐨 𝐜𝐡𝐢 𝐡𝐚 𝐚𝐯𝐯𝐢𝐚𝐭𝐨 𝐥𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐩𝐮ò 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐩𝐮𝐥𝐬𝐚𝐧𝐭𝐞.*'
    )
  }

  if (game.rerollUsed) {
    return m.reply(
      '*⚠️ 𝐈𝐥 𝐜𝐚𝐦𝐛𝐢𝐨 𝐝𝐨𝐦𝐚𝐧𝐝𝐚 è 𝐠𝐢à 𝐬𝐭𝐚𝐭𝐨 𝐮𝐬𝐚𝐭𝐨.*'
    )
  }

  const data = loadData()

const pool =
  data?.[game.tipo]?.[game.categoria] || []

  if (!pool.length) {
    return m.reply(
      '*❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐝𝐨𝐦𝐚𝐧𝐝𝐚 𝐭𝐫𝐨𝐯𝐚𝐭𝐚.*'
    )
  }

  let nuova = pick(pool)

  for (let i = 0; i < 5; i++) {
    if (nuova !== game.frase) break
    nuova = pick(pool)
  }

  game.frase = nuova
  game.rerollUsed = true
  if (game.buttonMessage) {
  try {
    await conn.sendMessage(m.chat, {
      delete: game.buttonMessage
    })
  } catch {}
}

await sendBottleResult(
  m.chat,
  conn,
  usedPrefix,
  game.messageKey,
  game
)

return
}
let handler = async (m, { conn, command, usedPrefix, participants }) => {
command = command.toLowerCase()

if (command === 'bottiglia') {
return startBottleGame(
m,
conn,
usedPrefix,
participants
)
}

if (command === 'bottigliacambia') {
return rerollChallenge(
m,
conn,
usedPrefix
)
}
}

handler.help = ['bottiglia']
handler.tags = ['fun']
handler.command = /^(bottiglia|bottigliacambia)$/i
handler.group = true

export default handler