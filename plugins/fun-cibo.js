// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

global.ciboGame = global.ciboGame || {}
global.cooldowns = global.cooldowns || {}

const S = v => String(v || '')
const random = arr => arr[Math.floor(Math.random() * arr.length)]

const playAgainButtons = prefix => [
  {
    buttonId: `${prefix}cibo`,
    buttonText: { displayText: '🍽️ Gioca Ancora!' },
    type: 1
  }
]

const frasi = [
  '🍽️ *𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀 𝐈𝐋 𝐂𝐈𝐁𝐎!*',
  '😋 *𝐒𝐚𝐢 𝐜𝐡𝐞 𝐩𝐢𝐚𝐭𝐭𝐨 è 𝐪𝐮𝐞𝐬𝐭𝐨?*',
  '👨‍🍳 *𝐑𝐢𝐜𝐨𝐧𝐨𝐬𝐜𝐢 𝐪𝐮𝐞𝐬𝐭𝐚 𝐬𝐩𝐞𝐜𝐢𝐚𝐥𝐢𝐭à?*',
  '🍴 *𝐒𝐟𝐢𝐝𝐚 𝐜𝐮𝐥𝐢𝐧𝐚𝐫𝐢𝐚!*',
  '🔥 *𝐂𝐡𝐞 𝐜𝐢𝐛𝐨 è 𝐪𝐮𝐞𝐬𝐭𝐨?*',
  '🌍 *𝐈𝐧𝐝𝐨𝐯𝐢𝐧𝐚 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐩𝐢𝐚𝐭𝐭𝐨!*'
]

const cibi = [
  { nome: 'Pizza', url: 'https://images.unsplash.com/photo-1601924582975-7e7eaa20f9c4' },
  { nome: 'Sushi', url: 'https://images.unsplash.com/photo-1553621042-f6e147245754' },
  { nome: 'Hamburger', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349' },
  { nome: 'Carbonara', url: 'https://images.unsplash.com/photo-1589307004391-1c6b6f77c9d1' },
  { nome: 'Lasagna', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b' },
  { nome: 'Tiramisù', url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9' },
  { nome: 'Paella', url: 'https://images.unsplash.com/photo-1604908176997-4318a4f4b0c8' },
  { nome: 'Ramen', url: 'https://images.unsplash.com/photo-1604908554025-15b0c37f3c5e' },
  { nome: 'Hot Dog', url: 'https://images.unsplash.com/photo-1550547660-8d7f5f1c36c5' },
  { nome: 'Gelato', url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625' }
]

function normalizeString(str) {
  return S(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
}

let handler = async (m, { conn, usedPrefix, isAdmin, command }) => {
  const chat = m.chat

  if (command === 'skipcibo') {
    if (!m.isGroup) return m.reply('*𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐚 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢.*')
    if (!global.ciboGame?.[chat]) return m.reply('*𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐭𝐭𝐢𝐯𝐚.*')
    if (!isAdmin && !m.fromMe) return m.reply('*𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐢𝐧𝐭𝐞𝐫𝐫𝐨𝐦𝐩𝐞𝐫𝐞 𝐢𝐥 𝐠𝐢𝐨𝐜𝐨.*')

    clearTimeout(global.ciboGame[chat].timeout)

    await conn.sendMessage(chat, {
      text: `*╭━━━━━━━🛑━━━━━━━╮*
*✦ 𝐆𝐈𝐎𝐂𝐎 𝐈𝐍𝐓𝐄𝐑𝐑𝐎𝐓𝐓𝐎 ✦*
*╰━━━━━━━🛑━━━━━━━╯*

*🍽️ 𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚:* ${global.ciboGame[chat].rispostaOriginale}`,
      footer: '𝐆𝐢𝐨𝐜𝐚 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨',
      buttons: playAgainButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })

    delete global.ciboGame[chat]
    return
  }

  if (global.ciboGame?.[chat]) {
    return m.reply('*𝐂’è 𝐠𝐢à 𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐭𝐭𝐢𝐯𝐚.*')
  }

  const cooldownKey = `cibo_${chat}`
  const now = Date.now()
  const lastGame = global.cooldowns[cooldownKey] || 0
  const cooldownTime = 10000

  if (now - lastGame < cooldownTime) {
    const remaining = Math.ceil((cooldownTime - (now - lastGame)) / 1000)
    return m.reply(`*⏳ 𝐀𝐬𝐩𝐞𝐭𝐭𝐚 𝐚𝐧𝐜𝐨𝐫𝐚 ${remaining} 𝐬𝐞𝐜𝐨𝐧𝐝𝐢.*`)
  }

  global.cooldowns[cooldownKey] = now

  const scelta = random(cibi)
  const frase = random(frasi)

  try {
    const msg = await conn.sendMessage(chat, {
      image: { url: scelta.url },
      caption: `${frase}

*🍽️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐜𝐨𝐧 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐜𝐢𝐛𝐨!*
*⏱️ 𝐓𝐞𝐦𝐩𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞:* 30 𝐬𝐞𝐜𝐨𝐧𝐝𝐢

> 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino`,
    }, { quoted: m })

    global.ciboGame[chat] = {
      id: msg.key.id,
      risposta: scelta.nome.toLowerCase(),
      rispostaOriginale: scelta.nome,
      tentativi: {},
      suggerito: false,
      startTime: Date.now(),
      timeout: setTimeout(async () => {
        if (!global.ciboGame?.[chat]) return

        await conn.sendMessage(chat, {
          text: `*╭━━━━━━━⏳━━━━━━━╮*
*✦ 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎 ✦*
*╰━━━━━━━⏳━━━━━━━╯*

*🍽️ 𝐄𝐫𝐚:* ${scelta.nome}`,
          footer: '𝐆𝐢𝐨𝐜𝐚 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨',
          buttons: playAgainButtons(usedPrefix),
          headerType: 1
        }, { quoted: msg })

        delete global.ciboGame[chat]
      }, 30000)
    }
  } catch (e) {
    console.error(e)
    m.reply(`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥’𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐠𝐢𝐨𝐜𝐨.*`)
  }
}

handler.before = async (m, { conn, usedPrefix }) => {
  const game = global.ciboGame?.[m.chat]
  if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe) return

  const userAnswer = normalizeString(m.text)
  const correctAnswer = normalizeString(game.risposta)
  if (!userAnswer) return

  if (userAnswer === correctAnswer) {
    clearTimeout(game.timeout)

    const reward = Math.floor(Math.random() * 31) + 20
    const exp = 500

    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}

    global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + reward
    global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + exp

    await conn.sendMessage(m.chat, {
      text: `*╭━━━━━━━🎉━━━━━━━╮*
*✦ 𝐑𝐈𝐒𝐏𝐎𝐒𝐓𝐀 𝐂𝐎𝐑𝐑𝐄𝐓𝐓𝐀 ✦*
*╰━━━━━━━🎉━━━━━━━╯*

*🍽️ 𝐄𝐫𝐚:* ${game.rispostaOriginale}
*🎁 𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚:* +${reward} 💰
*🆙 𝐄𝐗𝐏:* +${exp}`,
      footer: '𝐆𝐢𝐨𝐜𝐚 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨',
      buttons: playAgainButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })

    delete global.ciboGame[m.chat]
    return
  }

  game.tentativi[m.sender] = (game.tentativi[m.sender] || 0) + 1
  const rimasti = 3 - game.tentativi[m.sender]

  if (rimasti <= 0) {
    await conn.sendMessage(m.chat, {
      text: `*╭━━━━━━━❌━━━━━━━╮*
*✦ 𝐓𝐄𝐍𝐓𝐀𝐓𝐈𝐕𝐈 𝐅𝐈𝐍𝐈𝐓𝐈 ✦*
*╰━━━━━━━❌━━━━━━━╯*

*🍽️ 𝐄𝐫𝐚:* ${game.rispostaOriginale}`,
      footer: '𝐆𝐢𝐨𝐜𝐚 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨',
      buttons: playAgainButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })

    delete global.ciboGame[m.chat]
  } else {
    await conn.reply(m.chat, `*❌ 𝐒𝐛𝐚𝐠𝐥𝐢𝐚𝐭𝐨!*\n*𝐓𝐞𝐧𝐭𝐚𝐭𝐢𝐯𝐢 𝐫𝐢𝐦𝐚𝐬𝐭𝐢:* ${rimasti}`, m)
  }
}

handler.help = ['cibo']
handler.tags = ['giochi']
handler.command = /^(cibo|skipcibo)$/i
handler.group = true

export default handler