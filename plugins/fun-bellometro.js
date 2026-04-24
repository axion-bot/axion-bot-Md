// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import { createCanvas, loadImage } from 'canvas'

const DEFAULT_AVATAR_URL = 'https://i.ibb.co/jH0VpAv/default-avatar-profile-icon-of-social-media-user-vector.jpg'

function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) return ctx.roundRect(x, y, w, h, r)

  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawStrokedText(ctx, text, x, y) {
  ctx.save()
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 6
  ctx.strokeText(text, x, y)
  ctx.fillStyle = '#fff'
  ctx.fillText(text, x, y)
  ctx.restore()
}

function generateBg(ctx, w, h, colors) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, colors[0])
  g.addColorStop(1, colors[1])

  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`
    ctx.beginPath()
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

async function generateImage({ title, percentage, avatarUrl, description, themeColors }) {
  const w = 900
  const h = 1000

  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')

  generateBg(ctx, w, h, themeColors)

  const avatar = await loadImage(avatarUrl).catch(() => loadImage(DEFAULT_AVATAR_URL))

  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 0, w, h)

  ctx.font = 'bold 76px Sans'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  drawStrokedText(ctx, title, w / 2, 70)

  const size = 300
  const ax = (w - size) / 2
  const ay = 185

  ctx.save()
  ctx.beginPath()
  ctx.arc(ax + size / 2, ay + size / 2, size / 2, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(avatar, ax, ay, size, size)
  ctx.restore()

  ctx.beginPath()
  ctx.arc(ax + size / 2, ay + size / 2, size / 2, 0, Math.PI * 2)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 6
  ctx.stroke()

  const bw = 700
  const bh = 50
  const bx = (w - bw) / 2
  const by = 600

  ctx.fillStyle = '#222'
  roundRect(ctx, bx, by, bw, bh, 25)
  ctx.fill()

  const fill = Math.max(8, (bw * percentage) / 100)

  const grad = ctx.createLinearGradient(bx, 0, bx + bw, 0)
  grad.addColorStop(0, themeColors[0])
  grad.addColorStop(1, themeColors[1])

  ctx.fillStyle = grad
  roundRect(ctx, bx, by, fill, bh, 25)
  ctx.fill()

  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 4
  roundRect(ctx, bx, by, bw, bh, 25)
  ctx.stroke()

  ctx.font = 'bold 70px Sans'
  ctx.textBaseline = 'top'
  drawStrokedText(ctx, `${percentage}%`, w / 2, 675)

  ctx.font = '30px Sans'
  ctx.fillStyle = '#fff'
  ctx.fillText(description, w / 2, 790)

  ctx.globalAlpha = 0.7
  ctx.font = 'bold 22px Sans'
  ctx.fillText('AXION BOT', w / 2, 940)
  ctx.globalAlpha = 1

  return canvas.toBuffer('image/jpeg')
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function makeDescription(low, mid, high) {
  return p => {
    if (p < 30) return pick(low)
    if (p > 80) return pick(high)
    return pick(mid)
  }
}

const commandConfig = {
  gaymetro: {
    title: 'GAYMETRO',
    themeColors: ['#FF00FF', '#4a004a'],
    getDescription: makeDescription(
      [
        '𝐋𝐢𝐯𝐞𝐥𝐥𝐨 𝐛𝐚𝐬𝐬𝐨 😅',
        '𝐍𝐞𝐠𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐭𝐢𝐥𝐞 😂',
        '𝐎𝐠𝐠𝐢 𝐧𝐨𝐧 𝐬𝐢 𝐯𝐞𝐝𝐞'
      ],
      [
        '𝐂𝐢 𝐬𝐭𝐚 𝐮𝐧 𝐩𝐨̀ 😏',
        '𝐍𝐞𝐥 𝐦𝐞𝐳𝐳𝐨',
        '𝐐𝐮𝐚𝐥𝐜𝐨𝐬𝐚 𝐬𝐢 𝐢𝐧𝐭𝐫𝐚𝐯𝐞𝐝𝐞'
      ],
      [
        '𝐋𝐢𝐯𝐞𝐥𝐥𝐢 𝐬𝐭𝐫𝐚𝐭𝐨𝐬𝐟𝐞𝐫𝐢𝐜𝐢 🔥',
        '𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐝𝐮𝐛𝐛𝐢 😈',
        '𝐏𝐫𝐨𝐟𝐢𝐥𝐨 𝐬𝐨𝐬𝐩𝐞𝐭𝐭𝐨 😏'
      ]
    )
  },

  lesbiometro: {
    title: 'LESBIOMETRO',
    themeColors: ['#FF69B4', '#c71585'],
    getDescription: makeDescription(
      [
        '𝐏𝐨𝐜𝐚 𝐯𝐢𝐛𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐬𝐚𝐟𝐟𝐢𝐜𝐚 😅',
        '𝐀𝐧𝐜𝐨𝐫𝐚 𝐢𝐧 𝐟𝐚𝐬𝐞 𝐝𝐢 𝐭𝐞𝐬𝐭',
        '𝐍𝐨𝐧 𝐦𝐨𝐥𝐭𝐨 𝐜𝐨𝐧𝐯𝐢𝐧𝐭𝐨'
      ],
      [
        '𝐂𝐢 𝐬𝐢𝐚𝐦𝐨 𝐪𝐮𝐚𝐬𝐢 😏',
        '𝐄𝐧𝐞𝐫𝐠𝐢𝐚 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐬𝐚𝐧𝐭𝐞',
        '𝐀𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐜𝐨𝐧𝐟𝐞𝐫𝐦𝐚𝐭𝐨'
      ],
      [
        '𝐀𝐦𝐨𝐫𝐞 𝐬𝐦𝐢𝐬𝐮𝐫𝐚𝐭𝐨 🔥',
        '𝐂𝐨𝐧𝐟𝐞𝐫𝐦𝐚 𝐭𝐨𝐭𝐚𝐥𝐞 😌',
        '𝐋𝐢𝐯𝐞𝐥𝐥𝐨 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 💅'
      ]
    )
  },

  masturbometro: {
    title: 'MASTURBOMETRO',
    themeColors: ['#8E44AD', '#E74C3C'],
    getDescription: makeDescription(
      [
        '𝐓𝐫𝐨𝐯𝐚 𝐩𝐢𝐮̀ 𝐡𝐨𝐛𝐛𝐲 😂',
        '𝐋𝐢𝐯𝐞𝐥𝐥𝐨 𝐢𝐧𝐧𝐨𝐜𝐞𝐧𝐭𝐞',
        '𝐌𝐨𝐥𝐭𝐨 𝐭𝐫𝐚𝐧𝐪𝐮𝐢𝐥𝐥𝐨'
      ],
      [
        '𝐂𝐨𝐬𝐭𝐚𝐧𝐭𝐞 𝐞 𝐝𝐞𝐭𝐞𝐫𝐦𝐢𝐧𝐚𝐭𝐨 😭',
        '𝐀𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐚𝐥𝐥𝐞𝐧𝐚𝐭𝐨',
        '𝐒𝐢 𝐝𝐢𝐟𝐞𝐧𝐝𝐞 𝐛𝐞𝐧𝐞'
      ],
      [
        '𝐂𝐚𝐦𝐩𝐢𝐨𝐧𝐞 𝐚𝐬𝐬𝐨𝐥𝐮𝐭𝐨 💀',
        '𝐋𝐢𝐯𝐞𝐥𝐥𝐨 𝐟𝐮𝐨𝐫𝐢 𝐬𝐜𝐚𝐥𝐚 🔥',
        '𝐒𝐢𝐭𝐮𝐚𝐳𝐢𝐨𝐧𝐞 𝐠𝐫𝐚𝐯𝐞 😭'
      ]
    )
  },

  fortunometro: {
    title: 'FORTUNOMETRO',
    themeColors: ['#2ECC71', '#006400'],
    getDescription: makeDescription(
      [
        '𝐆𝐢𝐨𝐫𝐧𝐚𝐭𝐚 𝐧𝐞𝐫𝐚 💀',
        '𝐌𝐞𝐠𝐥𝐢𝐨 𝐧𝐨𝐧 𝐫𝐢𝐬𝐜𝐡𝐢𝐚𝐫𝐞',
        '𝐏𝐨𝐜𝐚 𝐟𝐨𝐫𝐭𝐮𝐧𝐚 𝐨𝐠𝐠𝐢'
      ],
      [
        '𝐆𝐢𝐨𝐫𝐧𝐚𝐭𝐚 𝐧𝐨𝐫𝐦𝐚𝐥𝐞',
        '𝐒𝐢 𝐩𝐮𝐨̀ 𝐟𝐚𝐫𝐞',
        '𝐅𝐨𝐫𝐭𝐮𝐧𝐚 𝐝𝐢𝐬𝐜𝐫𝐞𝐭𝐚'
      ],
      [
        '𝐅𝐨𝐫𝐭𝐮𝐧𝐚 𝐚𝐥 𝐦𝐚𝐬𝐬𝐢𝐦𝐨 🍀',
        '𝐎𝐠𝐠𝐢 𝐯𝐢𝐧𝐜𝐢 𝐭𝐮𝐭𝐭𝐨 🔥',
        '𝐂𝐨𝐥𝐩𝐨 𝐝𝐢 𝐜𝐮𝐥𝐨 𝐥𝐞𝐠𝐠𝐞𝐧𝐝𝐚𝐫𝐢𝐨 😎'
      ]
    )
  },

  intelligiometro: {
    title: 'INTELLIGIOMETRO',
    themeColors: ['#3498DB', '#00008b'],
    getDescription: makeDescription(
      [
        '𝐌𝐚𝐫𝐠𝐢𝐧𝐞 𝐝𝐢 𝐦𝐢𝐠𝐥𝐢𝐨𝐫𝐚𝐦𝐞𝐧𝐭𝐨 😅',
        '𝐈𝐥 𝐜𝐞𝐫𝐯𝐞𝐥𝐥𝐨 𝐬𝐭𝐚 𝐜𝐚𝐫𝐢𝐜𝐚𝐧𝐝𝐨',
        '𝐎𝐠𝐠𝐢 𝐧𝐨𝐧 𝐞̀ 𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐚'
      ],
      [
        '𝐒𝐨𝐩𝐫𝐚 𝐥𝐚 𝐦𝐞𝐝𝐢𝐚 🧠',
        '𝐑𝐚𝐠𝐢𝐨𝐧𝐚 𝐛𝐞𝐧𝐞',
        '𝐌𝐢𝐜𝐚 𝐦𝐚𝐥𝐞'
      ],
      [
        '𝐆𝐞𝐧𝐢𝐨 𝐚𝐬𝐬𝐨𝐥𝐮𝐭𝐨 🧠',
        '𝐐𝐮𝐢 𝐬𝐢 𝐯𝐨𝐥𝐚 𝐚𝐥𝐭𝐨 🔥',
        '𝐈𝐧𝐭𝐞𝐥𝐥𝐢𝐠𝐞𝐧𝐳𝐚 𝐝𝐚 𝐛𝐨𝐬𝐬'
      ]
    )
  },

  bellometro: {
    title: 'BELLOMETRO',
    themeColors: ['#E74C3C', '#f39c12'],
    getDescription: makeDescription(
      [
        '𝐋𝐚 𝐛𝐞𝐥𝐥𝐞𝐳𝐳𝐚 𝐞̀ 𝐬𝐨𝐠𝐠𝐞𝐭𝐭𝐢𝐯𝐚 😅',
        '𝐃𝐚 𝐫𝐢𝐯𝐞𝐝𝐞𝐫𝐞 😂',
        '𝐏𝐮𝐨𝐢 𝐦𝐢𝐠𝐥𝐢𝐨𝐫𝐚𝐫𝐞'
      ],
      [
        '𝐍𝐨𝐧 𝐦𝐚𝐥𝐞 😉',
        '𝐒𝐢 𝐝𝐢𝐟𝐞𝐧𝐝𝐞',
        '𝐌𝐨𝐥𝐭𝐨 𝐟𝐚𝐬𝐜𝐢𝐧𝐨'
      ],
      [
        '𝐁𝐞𝐥𝐥𝐞𝐳𝐳𝐚 𝐝𝐚 𝐜𝐨𝐩𝐞𝐫𝐭𝐢𝐧𝐚 🔥',
        '𝐌𝐨𝐝𝐞𝐥𝐥𝐨 😎',
        '𝐏𝐞𝐫𝐢𝐜𝐨𝐥𝐨 𝐩𝐮𝐛𝐛𝐥𝐢𝐜𝐨 💀'
      ]
    )
  }
}

function isUsefulName(value, jid) {
  if (!value) return false
  const name = String(value).trim()
  const number = String(jid || '').split('@')[0]
  if (!name) return false
  if (name === jid) return false
  if (name === number) return false
  if (name === `+${number}`) return false
  if (/^\+?\d[\d\s\-()]+$/.test(name)) return false
  return true
}

async function getDisplayName(conn, m, jid, text) {
  if (text?.trim() && !m.mentionedJid?.length) return text.trim()

  const candidates = []

  try {
    candidates.push(await conn.getName(jid))
  } catch {}

  if (m.quoted?.sender === jid) {
    candidates.push(m.quoted?.pushName)
    candidates.push(m.quoted?.name)
  }

  if (jid === m.sender) {
    candidates.push(m.pushName)
  }

  const number = String(jid || '').split('@')[0]
  const contact = conn.contacts?.[jid] || conn.contacts?.[`${number}@s.whatsapp.net`]

  candidates.push(contact?.name)
  candidates.push(contact?.notify)
  candidates.push(contact?.vname)

  for (const candidate of candidates) {
    if (isUsefulName(candidate, jid)) return String(candidate).trim()
  }

  return 'Utente'
}

const handler = async (m, { conn, command, text }) => {
  const config = commandConfig[command]
  if (!config) return

  const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const targetName = await getDisplayName(conn, m, target, text)

  const percentage = Math.floor(Math.random() * 101)
  const description = config.getDescription(percentage)

  try {
    await m.react('⏳')

    const avatar = await conn.profilePictureUrl(target, 'image').catch(() => DEFAULT_AVATAR_URL)

    const imageBuffer = await generateImage({
      title: config.title,
      percentage,
      avatarUrl: avatar,
      description,
      themeColors: config.themeColors
    })

    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `*╭━━━━━━━📊━━━━━━━╮*
*✦ 𝐑𝐈𝐒𝐔𝐋𝐓𝐀𝐓𝐎 ✦*
*╰━━━━━━━📊━━━━━━━╯*

*👤 ${targetName}*
*📈 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐮𝐚𝐥𝐞:* *${percentage}%*`,
      mentions: [target]
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    await conn.reply(m.chat, `${global.errore || '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞.*'}`, m)
  }
}

handler.help = Object.keys(commandConfig).map(cmd => `${cmd} <@tag/nome>`)
handler.tags = ['giochi']
handler.group = true
handler.command = Object.keys(commandConfig)

export default handler