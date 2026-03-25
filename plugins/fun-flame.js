import fs from 'fs'
import sharp from 'sharp'
import fetch from 'node-fetch'

const TEMPLATE_PATH = './media/flame.png'
const FALLBACK_AVATAR = 'https://i.ibb.co/2kR7x9J/avatar.png'

const LEFT_SLOT = { x: 91, y: 272, size: 500 }
const RIGHT_SLOT = { x: 944, y: 272, size: 500 }

let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup) {
    return m.reply(`╭━━━━━━━🔥━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 ✦
╰━━━━━━━🔥━━━━━━━╯

⚠️ 𝐋𝐞 𝐟𝐢𝐚𝐦𝐦𝐞 𝐚𝐫𝐝𝐨𝐧𝐨 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢`)
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

  const botNumber = ((conn.user.id || conn.user.jid || '').split(':')[0]) + '@s.whatsapp.net'
  if (who === botNumber) {
    return m.reply(`╭━━━━━━━😏━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 ✦
╰━━━━━━━😏━━━━━━━╯

🚫 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐟𝐥𝐚𝐦𝐦𝐚𝐫𝐞 𝐢𝐥 𝐛𝐨𝐭`)
  }

  const victimName = '@' + who.split('@')[0]
  const attackerName = '@' + m.sender.split('@')[0]

  let vsBuffer
  try {
    vsBuffer = await makeFlameVsImage(conn, m.sender, who)
  } catch (e) {
    console.error('[FLAME] errore composizione:', e)
    vsBuffer = fs.readFileSync(TEMPLATE_PATH)
  }

  await conn.sendMessage(m.chat, {
    image: vsBuffer,
    caption: `╭━━━━━━━🔥━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 𝐖𝐀𝐑 ✦
╰━━━━━━━🔥━━━━━━━╯

👊 𝐒𝐟𝐢𝐝𝐚𝐧𝐭𝐞: ${attackerName}
🎯 𝐁𝐞𝐫𝐬𝐚𝐠𝐥𝐢𝐨: ${victimName}

⏱️ 𝐃𝐮𝐫𝐚𝐭𝐚: 3 𝐦𝐢𝐧𝐮𝐭𝐢
💬 𝐈𝐥 𝐛𝐨𝐭 𝐚𝐭𝐭𝐚𝐜𝐜𝐚 𝐩𝐞𝐫 𝐩𝐫𝐢𝐦𝐨`,
    mentions: [m.sender, who]
  }, { quoted: m })

  let flameCount = 0
  let battleActive = true

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
    if (!battleActive) return

    const m2 = chatUpdate.messages?.[0]
    if (!m2?.message || m2.key.fromMe) return

    const sender = m2.key.participant || m2.key.remoteJid
    if (sender !== who || m2.key.remoteJid !== m.chat) return

    flameCount++
    const reply = generateFlame(victimName)

    await new Promise(res => setTimeout(res, 1000))
    await conn.sendMessage(m.chat, {
      text: reply,
      mentions: [who]
    }, { quoted: m2 })
  }

  conn.ev.on('messages.upsert', battleHandler)

  setTimeout(() => {
    if (!battleActive) return
    conn.sendMessage(m.chat, {
      text: generateFlame(victimName),
      mentions: [who]
    }, { quoted: m })
  }, 2000)

  setTimeout(async () => {
    if (!battleActive) return

    battleActive = false
    conn.ev.off('messages.upsert', battleHandler)

    const endMsg = `╭━━━━━━━⏱️━━━━━━━╮
✦ 𝐅𝐋𝐀𝐌𝐄 𝐂𝐎𝐍𝐂𝐋𝐔𝐒𝐀 ✦
╰━━━━━━━⏱️━━━━━━━╯

🥊 𝐈𝐥 𝐛𝐨𝐭 𝐯𝐢𝐧𝐜𝐞 𝐩𝐞𝐫 𝐊𝐎 𝐭𝐞𝐜𝐧𝐢𝐜𝐨
📊 𝐅𝐥𝐚𝐦𝐞 𝐭𝐨𝐭𝐚𝐥𝐢: ${flameCount + 1}

🏃 𝐏𝐞𝐫 𝐬𝐜𝐚𝐩𝐩𝐚𝐫𝐞 𝐝𝐨𝐯𝐫𝐚𝐢 𝐜𝐨𝐫𝐫𝐞𝐫𝐞 2,5 𝐤𝐦
👣 𝐎𝐯𝐯𝐞𝐫𝐨 3.750 𝐩𝐚𝐬𝐬𝐢`

    await conn.sendMessage(m.chat, {
      text: endMsg,
      mentions: [who]
    }, { quoted: m })
  }, 180000)
}

handler.help = ['flame']
handler.tags = ['giochi']
handler.command = /^(flame)$/i
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