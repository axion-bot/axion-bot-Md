
import fs from 'fs'
import fetch from 'node-fetch'

let sharp = null
let sharpOk = true

try {
  sharp = (await import('sharp')).default
} catch {
  sharpOk = false
}

const TEMPLATE_PATH = './media/flame.png'
const FALLBACK_AVATAR = 'https://i.ibb.co/2kR7x9J/avatar.png'

const LEFT_SLOT = { x: 91, y: 272, size: 500 }
const RIGHT_SLOT = { x: 944, y: 272, size: 500 }

global.flameSessions = global.flameSessions || {}

const S = v => String(v || '')
const bare = j => S(j).split('@')[0].split(':')[0]

let handler = async (m, { conn, usedPrefix, command, isAdmin }) => {
  if (!m.isGroup) {
    return m.reply(`╭━━━━━━━🔥━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 ✦
╰━━━━━━━🔥━━━━━━━╯

⚠️ 𝐋𝐞 𝐟𝐢𝐚𝐦𝐦𝐞 𝐚𝐫𝐝𝐨𝐧𝐨 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢`)
  }

  if (command === 'stopflame') {
    const active = global.flameSessions[m.chat]

    if (!active?.battleActive) {
      return m.reply(`╭━━━━━━━🛑━━━━━━━╮
✦ 𝐒𝐓𝐎𝐏 𝐅𝐋𝐀𝐌𝐄 ✦
╰━━━━━━━🛑━━━━━━━╯

⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐟𝐥𝐚𝐦𝐞 𝐚𝐭𝐭𝐢𝐯𝐚 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨`)
    }

    const botNumber = bare(conn.user.id || conn.user.jid || '') + '@s.whatsapp.net'
    const isOwner = Array.isArray(global.owner) && global.owner
      .map(o => Array.isArray(o) ? String(o[0]) : String(o))
      .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
      .includes(m.sender)

    if (!isAdmin && !isOwner && m.sender !== botNumber) {
      return m.reply(`╭━━━━━━━🛑━━━━━━━╮
✦ 𝐒𝐓𝐎𝐏 𝐅𝐋𝐀𝐌𝐄 ✦
╰━━━━━━━🛑━━━━━━━╯

⚠️ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐨𝐰𝐧𝐞𝐫 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐟𝐞𝐫𝐦𝐚𝐫𝐥𝐚`)
    }

    active.battleActive = false
    conn.ev.off('messages.upsert', active.battleHandler)

    if (active.firstAttackTimeout) clearTimeout(active.firstAttackTimeout)
    if (active.endTimeout) clearTimeout(active.endTimeout)

    const finalCount = active.flameCount || 0
    const finalWho = active.who

    delete global.flameSessions[m.chat]

    return conn.sendMessage(m.chat, {
      text: `╭━━━━━━━🛑━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 𝐈𝐍𝐓𝐄𝐑𝐑𝐎𝐓𝐓𝐀 ✦
╰━━━━━━━🛑━━━━━━━╯

👮 𝐋𝐚 𝐟𝐥𝐚𝐦𝐞 è 𝐬𝐭𝐚𝐭𝐚 𝐟𝐞𝐫𝐦𝐚𝐭𝐚
📊 𝐅𝐥𝐚𝐦𝐞 𝐭𝐨𝐭𝐚𝐥𝐢: ${finalCount}`,
      mentions: finalWho ? [finalWho] : []
    }, { quoted: m })
  }

  if (global.flameSessions[m.chat]?.battleActive) {
    return m.reply(`╭━━━━━━━🔥━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 ✦
╰━━━━━━━🔥━━━━━━━╯

⚠️ 𝐂'è 𝐠𝐢à 𝐮𝐧𝐚 𝐟𝐥𝐚𝐦𝐞 𝐚𝐭𝐭𝐢𝐯𝐚

🛑 𝐔𝐬𝐚 ${usedPrefix}stopflame 𝐩𝐞𝐫 𝐟𝐞𝐫𝐦𝐚𝐫𝐥𝐚`)
  }

  let who = m.mentionedJid?.[0] || m.quoted?.sender || null

  if (!who) {
    return m.reply(`╭━━━━━━━🔥━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 ✦
╰━━━━━━━🔥━━━━━━━╯

👤 𝐓𝐚𝐠𝐠𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐬𝐮𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨

📌 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:
${usedPrefix + command} @utente`)
  }

  const botNumber = bare(conn.user.id || conn.user.jid || '') + '@s.whatsapp.net'
  if (bare(who) === bare(botNumber)) {
    return m.reply(`╭━━━━━━━😏━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 ✦
╰━━━━━━━😏━━━━━━━╯

🚫 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐟𝐥𝐚𝐦𝐦𝐚𝐫𝐞 𝐢𝐥 𝐛𝐨𝐭`)
  }

  const victimName = '@' + bare(who)
  const attackerName = '@' + bare(m.sender)

  let vsBuffer

  if (!sharpOk) {
    await m.reply(`╭━━━━━━━⚠️━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 ✦
╰━━━━━━━⚠️━━━━━━━╯

❌ 𝐌𝐨𝐝𝐮𝐥𝐨 *sharp* 𝐦𝐚𝐧𝐜𝐚𝐧𝐭𝐞

📦 Installa con:
npm i sharp

🖼️ 𝐔𝐬𝐨 𝐢𝐥 𝐭𝐞𝐦𝐩𝐥𝐚𝐭𝐞 𝐛𝐚𝐬𝐞`)
    vsBuffer = fs.readFileSync(TEMPLATE_PATH)
  } else {
    try {
      vsBuffer = await makeFlameVsImage(conn, m.sender, who)
    } catch (e) {
      console.error('[FLAME] errore composizione:', e)
      await m.reply(`╭━━━━━━━⚠️━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 ✦
╰━━━━━━━⚠️━━━━━━━╯

❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐜𝐨𝐦𝐩𝐨𝐬𝐢𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥𝐥'𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞

🖼️ 𝐔𝐬𝐨 𝐢𝐥 𝐭𝐞𝐦𝐩𝐥𝐚𝐭𝐞 𝐛𝐚𝐬𝐞`)
      vsBuffer = fs.readFileSync(TEMPLATE_PATH)
    }
  }

  await conn.sendMessage(m.chat, {
    image: vsBuffer,
    caption: `╭━━━━━━━🔥━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 𝐖𝐀𝐑 ✦
╰━━━━━━━🔥━━━━━━━╯

👊 𝐒𝐟𝐢𝐝𝐚𝐧𝐭𝐞: ${attackerName}
🎯 𝐁𝐞𝐫𝐬𝐚𝐠𝐥𝐢𝐨: ${victimName}

⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: 3 𝐦𝐢𝐧𝐮𝐭𝐢
💬 𝐈𝐥 𝐛𝐨𝐭 𝐚𝐭𝐭𝐚𝐜𝐜𝐚 𝐩𝐞𝐫 𝐩𝐫𝐢𝐦𝐨

🛑 𝐏𝐞𝐫 𝐟𝐞𝐫𝐦𝐚𝐫𝐥𝐚: ${usedPrefix}stopflame`,
    mentions: [m.sender, who]
  }, { quoted: m })

  global.flameSessions[m.chat] = {
    who,
    flameCount: 0,
    battleActive: true,
    battleHandler: null,
    firstAttackTimeout: null,
    endTimeout: null
  }

  const generateFlame = (target) => {
    const flames = [
      `🔊 ${target}, scrivi così piano che i tuoi messaggi arrivano via fax?`,
      `🎭 ${target}, sembri un bug di sistema... inutile e fastidioso!`,
      `📱 ${target}, la tua sfiga prende sempre il 5G, complimenti!`,
      `⚡ ${target}, se la stupidità fosse energia, saresti una centrale elettrica!`,
      `🤡 ${target}, il circo ha chiamato, dicono che manchi solo tu!`,
      `⚰️ ${target}, il tuo senso dell'umorismo è morto e sepolto!`,
      `📡 ${target}, il segnale è arrivato, ma il tuo cervello è ancora in roaming?`,
      `💅 ${target}, anche i sassi hanno conversazioni più interessanti delle tue!`,
      `📉 ${target}, la tua dignità sta scendendo più velocemente delle azioni di una banca in crisi!`,
      `🧟 ${target}, ti hanno mai detto che hai il carisma di un router spento?`
    ]
    return flames[Math.floor(Math.random() * flames.length)]
  }

  const battleHandler = async (chatUpdate) => {
    const session = global.flameSessions[m.chat]
    if (!session?.battleActive) return

    const m2 = chatUpdate.messages?.[0]
    if (!m2?.message || m2.key.fromMe) return

    const sender = m2.key.participant || m2.key.remoteJid
    if (bare(sender) !== bare(who) || m2.key.remoteJid !== m.chat) return

    session.flameCount++
    const reply = generateFlame(victimName)

    await new Promise(res => setTimeout(res, 1000))

    const stillActive = global.flameSessions[m.chat]
    if (!stillActive?.battleActive) return

    await conn.sendMessage(m.chat, {
      text: reply,
      mentions: [who]
    }, { quoted: m2 })
  }

  global.flameSessions[m.chat].battleHandler = battleHandler
  conn.ev.on('messages.upsert', battleHandler)

  const firstAttackTimeout = setTimeout(() => {
    const session = global.flameSessions[m.chat]
    if (!session?.battleActive) return

    session.flameCount++

    conn.sendMessage(m.chat, {
      text: generateFlame(victimName),
      mentions: [who]
    }, { quoted: m })
  }, 2000)

  global.flameSessions[m.chat].firstAttackTimeout = firstAttackTimeout

  const endTimeout = setTimeout(async () => {
    const session = global.flameSessions[m.chat]
    if (!session?.battleActive) return

    session.battleActive = false
    conn.ev.off('messages.upsert', session.battleHandler)

    const finalCount = session.flameCount
    delete global.flameSessions[m.chat]

    const endMsg = `╭━━━━━━━⏱️━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 𝐂𝐎𝐍𝐂𝐋𝐔𝐒𝐀 ✦
╰━━━━━━━⏱️━━━━━━━╯

🥊 𝐈𝐥 𝐛𝐨𝐭 𝐯𝐢𝐧𝐜𝐞 𝐩𝐞𝐫 𝐊𝐎 𝐭𝐞𝐜𝐧𝐢𝐜𝐨
📊 𝐅𝐥𝐚𝐦𝐞 𝐭𝐨𝐭𝐚𝐥𝐢: ${finalCount}`

    await conn.sendMessage(m.chat, {
      text: endMsg,
      mentions: [who]
    }, { quoted: m })
  }, 180000)

  global.flameSessions[m.chat].endTimeout = endTimeout
}

handler.help = ['flame', 'stopflame']
handler.tags = ['giochi']
handler.command = /^(flame|stopflame)$/i
handler.group = true

export default handler

async function makeFlameVsImage(conn, leftJid, rightJid) {
  const template = fs.readFileSync(TEMPLATE_PATH)

  const [leftAvatar, rightAvatar] = await Promise.all([
    getAvatarBuffer(conn, leftJid),
    getAvatarBuffer(conn, rightJid)
  ])

  const [leftCircle, rightCircle] = await Promise.all([
    makeCircularAvatar(leftAvatar, LEFT_SLOT.size),
    makeCircularAvatar(rightAvatar, RIGHT_SLOT.size)
  ])

  return await sharp(template)
    .composite([
      { input: leftCircle, left: LEFT_SLOT.x, top: LEFT_SLOT.y },
      { input: rightCircle, left: RIGHT_SLOT.x, top: RIGHT_SLOT.y }
    ])
    .png()
    .toBuffer()
}

async function getAvatarBuffer(conn, jid) {
  let url
  try {
    url = await conn.profilePictureUrl(jid, 'image')
  } catch {
    url = FALLBACK_AVATAR
  }

  const res = await fetch(url)
  if (!res.ok) {
    const fallbackRes = await fetch(FALLBACK_AVATAR)
    return Buffer.from(await fallbackRes.arrayBuffer())
  }

  return Buffer.from(await res.arrayBuffer())
}

async function makeCircularAvatar(inputBuffer, size) {
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
    </svg>`
  )

  return await sharp(inputBuffer)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
}