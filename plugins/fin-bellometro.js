// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import { createCanvas, loadImage } from 'canvas'

const DEFAULT_AVATAR_URL = 'https://i.ibb.co/jH0VpAv/default-avatar-profile-icon-of-social-media-user-vector.jpg'

const S = v => String(v || '')

function drawStrokedText(ctx, text, x, y) {
  ctx.save()
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 8
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.strokeText(text, x, y)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(text, x, y)
  ctx.restore()
}

function generateThemedBackground(ctx, width, height, colors) {
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.5)
  gradient.addColorStop(0, colors[0])
  gradient.addColorStop(1, colors[1])

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.2})`
    ctx.beginPath()
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 3 + 1, 0, Math.PI * 2)
    ctx.fill()
  }
}

async function generateMeterImage({ title, percentage, avatarUrl, description, themeColors }) {
  const width = 1080
  const height = 1080

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  generateThemedBackground(ctx, width, height, themeColors)

  const avatar = await loadImage(avatarUrl).catch(() => loadImage(DEFAULT_AVATAR_URL))

  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(0, 0, width, height)

  ctx.font = 'bold 120px Impact, "Arial Black", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  drawStrokedText(ctx, title, width / 2, 50)

  const avatarSize = 400
  const avatarX = (width - avatarSize) / 2
  const avatarY = 220

  ctx.save()
  ctx.beginPath()
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize)
  ctx.restore()

  ctx.beginPath()
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 10
  ctx.stroke()

  const barWidth = 800
  const barHeight = 80
  const barX = (width - barWidth) / 2
  const barY = 700

  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.roundRect(barX, barY, barWidth, barHeight, 40)
  ctx.fill()

  if (percentage > 0) {
    const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0)
    gradient.addColorStop(0, themeColors[0])
    gradient.addColorStop(1, themeColors[1])
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.roundRect(barX, barY, (barWidth * percentage) / 100, barHeight, 40)
    ctx.fill()
  }

  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.roundRect(barX, barY, barWidth, barHeight, 40)
  ctx.stroke()

  ctx.font = 'bold 100px Impact, "Arial Black", sans-serif'
  drawStrokedText(ctx, `${percentage}%`, width / 2, 820)

  ctx.font = 'normal 50px Arial, sans-serif'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.fillText(description, width / 2, 950)

  return canvas.toBuffer('image/jpeg')
}

const commandConfig = {
  gaymetro: {
    title: 'GAYMETRO',
    themeColors: ['#FF00FF', '#4a004a'],
    getDescription: p => p < 50
      ? '𝐒𝐞𝐢 𝐩𝐢𝐮̀ 𝐬𝐢𝐦𝐩𝐚𝐭𝐢𝐜𝐨 𝐜𝐡𝐞 𝐠𝐚𝐲!'
      : p > 90
        ? '𝐋𝐢𝐯𝐞𝐥𝐥𝐢 𝐬𝐭𝐫𝐚𝐭𝐨𝐬𝐟𝐞𝐫𝐢𝐜𝐢!'
        : '𝐂𝐞 𝐥𝐨 𝐚𝐬𝐩𝐞𝐭𝐭𝐚𝐯𝐚𝐦𝐨!'
  },
  lesbiometro: {
    title: 'LESBIOMETRO',
    themeColors: ['#FF69B4', '#c71585'],
    getDescription: p => p < 50
      ? '𝐅𝐨𝐫𝐬𝐞 𝐧𝐨𝐧 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐫𝐨𝐦𝐚𝐧𝐭𝐢𝐜𝐨.'
      : p > 90
        ? '𝐀𝐦𝐨𝐫𝐞 𝐬𝐦𝐢𝐬𝐮𝐫𝐚𝐭𝐨!'
        : '𝐀𝐬𝐬𝐨𝐥𝐮𝐭𝐚𝐦𝐞𝐧𝐭𝐞 𝐜𝐨𝐧𝐟𝐞𝐫𝐦𝐚𝐭𝐨!'
  },
  masturbometro: {
    title: 'MASTURBOMETRO',
    themeColors: ['#8E44AD', '#E74C3C'],
    getDescription: p => p < 50
      ? '𝐓𝐫𝐨𝐯𝐚 𝐩𝐢𝐮̀ 𝐡𝐨𝐛𝐛𝐲.'
      : p > 90
        ? '𝐂𝐚𝐦𝐩𝐢𝐨𝐧𝐞 𝐚𝐬𝐬𝐨𝐥𝐮𝐭𝐨!'
        : '𝐂𝐨𝐬𝐭𝐚𝐧𝐭𝐞 𝐞 𝐝𝐞𝐭𝐞𝐫𝐦𝐢𝐧𝐚𝐭𝐨!'
  },
  fortunometro: {
    title: 'FORTUNOMETRO',
    themeColors: ['#2ECC71', '#006400'],
    getDescription: p => p < 50
      ? '𝐏𝐨𝐜𝐚 𝐟𝐨𝐫𝐭𝐮𝐧𝐚 𝐨𝐠𝐠𝐢.'
      : p > 90
        ? '𝐅𝐨𝐫𝐭𝐮𝐧𝐚 𝐚𝐥 𝐦𝐚𝐬𝐬𝐢𝐦𝐨!'
        : '𝐆𝐢𝐨𝐫𝐧𝐚𝐭𝐚 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐬𝐚𝐧𝐭𝐞!'
  },
  intelligiometro: {
    title: 'INTELLIGIOMETRO',
    themeColors: ['#3498DB', '#00008b'],
    getDescription: p => p < 50
      ? '𝐌𝐚𝐫𝐠𝐢𝐧𝐞 𝐝𝐢 𝐦𝐢𝐠𝐥𝐢𝐨𝐫𝐚𝐦𝐞𝐧𝐭𝐨.'
      : p > 90
        ? '𝐆𝐞𝐧𝐢𝐨 𝐚𝐬𝐬𝐨𝐥𝐮𝐭𝐨!'
        : '𝐒𝐨𝐩𝐫𝐚 𝐥𝐚 𝐦𝐞𝐝𝐢𝐚!'
  },
  bellometro: {
    title: 'BELLOMETRO',
    themeColors: ['#E74C3C', '#f39c12'],
    getDescription: p => p < 50
      ? '𝐋𝐚 𝐛𝐞𝐥𝐥𝐞𝐳𝐳𝐚 è 𝐬𝐨𝐠𝐠𝐞𝐭𝐭𝐢𝐯𝐚.'
      : p > 90
        ? '𝐁𝐞𝐥𝐥𝐞𝐳𝐳𝐚 𝐝𝐚 𝐜𝐨𝐩𝐞𝐫𝐭𝐢𝐧𝐚!'
        : '𝐌𝐨𝐥𝐭𝐨 𝐟𝐚𝐬𝐜𝐢𝐧𝐨!'
  }
}

const handler = async (m, { conn, command, text }) => {
  const config = commandConfig[command]
  if (!config) return

  const targetUser = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const targetName = text.trim() || await conn.getName(targetUser)

  if (!targetName) {
    return conn.reply(m.chat, '*𝐓𝐚𝐠𝐠𝐚 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞.*', m)
  }

  const percentage = Math.floor(Math.random() * 101)
  const description = config.getDescription(percentage)

  try {
    await conn.reply(m.chat, `*𝐂𝐚𝐥𝐜𝐨𝐥𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨 𝐩𝐞𝐫 ${targetName}...*`, m)

    const avatar = await conn.profilePictureUrl(targetUser, 'image').catch(() => DEFAULT_AVATAR_URL)

    const imageBuffer = await generateMeterImage({
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
*📈 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐮𝐚𝐥𝐞:* ${percentage}%`,
      mentions: [targetUser]
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `${global.errore}`, m)
  }
}

handler.help = Object.keys(commandConfig).map(cmd => `${cmd} <@tag/nome>`)
handler.tags = ['giochi']
handler.group = true
handler.command = Object.keys(commandConfig)

export default handler