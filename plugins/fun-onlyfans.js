import { createCanvas, loadImage } from 'canvas'

const handler = async (m, { conn, args, usedPrefix }) => {

  const cleanNumber = (txt = '') => {
    const match = txt.replace(/\D/g, '')
    return match.length >= 6 ? match : null
  }

  // PRIORITÀ TARGET
  let target =
    m.quoted?.sender ||
    m.mentionedJid?.[0]

  // se non c'è reply/tag → controlla numero scritto
  if (!target) {
    const num = cleanNumber(args.join(' '))
    if (num) target = num + '@s.whatsapp.net'
  }

  // fallback
  if (!target) target = m.sender

  const nome = args.join(" ") || `@${target.split('@')[0]}`

  const random = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  const id = random(100000, 999999)
  const prezzo = random(7, 39)
  const followers = random(5000, 850000)
  const post = random(10, 420)
  const likes = random(20000, 1200000)
  const verified = Math.random() < 0.35

  const bioList = [
    "🔥 Contenuti esclusivi ogni giorno",
    "💋 Solo per veri fan",
    "😈 Accesso VIP senza limiti",
    "💎 Premium content",
    "🌙 Notte calda garantita",
    "🖤 DM aperti per richieste speciali"
  ]

  const bio = bioList[Math.floor(Math.random() * bioList.length)]

  let avatarUrl
  try {
    avatarUrl = await conn.profilePictureUrl(target, 'image')
  } catch {
    avatarUrl = 'https://i.imgur.com/8Km9tLL.png'
  }

  const avatar = await loadImage(avatarUrl)

  const canvas = createCanvas(900, 1100)
  const ctx = canvas.getContext('2d')

  // BACKGROUND
  const bg = ctx.createLinearGradient(0, 0, 0, 1100)
  bg.addColorStop(0, '#0f0f14')
  bg.addColorStop(1, '#1a1a22')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 900, 1100)

  // HEADER
  const header = ctx.createLinearGradient(0, 0, 900, 0)
  header.addColorStop(0, '#00aff0')
  header.addColorStop(1, '#007bb5')

  ctx.fillStyle = header
  ctx.fillRect(0, 0, 900, 160)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px Sans'
  ctx.textAlign = 'center'
  ctx.fillText('ONLYFANS', 450, 100)

  // AVATAR SHADOW
  ctx.beginPath()
  ctx.arc(450, 310, 150, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fill()

  // AVATAR
  ctx.save()
  ctx.beginPath()
  ctx.arc(450, 300, 140, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(avatar, 310, 160, 280, 280)
  ctx.restore()

  // BORDER
  ctx.beginPath()
  ctx.arc(450, 300, 140, 0, Math.PI * 2)
  ctx.strokeStyle = '#00aff0'
  ctx.lineWidth = 6
  ctx.stroke()

  // NAME
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 40px Sans'
  ctx.fillText(nome, 450, 500)

  // VERIFIED
  if (verified) {
    ctx.fillStyle = '#00aff0'
    ctx.beginPath()
    ctx.arc(650, 485, 16, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 20px Sans'
    ctx.fillText('✓', 650, 492)
  }

  ctx.font = '24px Sans'
  ctx.fillStyle = '#bbbbbb'
  ctx.fillText(`ID: OF${id}`, 450, 540)

  ctx.fillStyle = '#ffffff'
  ctx.font = '26px Sans'
  ctx.fillText(`💰 ${prezzo}€ / mese`, 450, 600)

  ctx.font = '24px Sans'
  ctx.fillStyle = '#dddddd'
  ctx.fillText(`👥 ${followers.toLocaleString()} followers`, 450, 650)
  ctx.fillText(`📸 ${post} post`, 450, 690)
  ctx.fillText(`🔥 ${likes.toLocaleString()} like`, 450, 730)

  ctx.font = '22px Sans'
  ctx.fillStyle = '#999999'
  ctx.fillText(bio, 450, 800)

  // BUTTON
  const x = 250
  const y = 900
  const w = 400
  const h = 90
  const r = 25

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

  const btnGrad = ctx.createLinearGradient(x, y, x + w, y)
  btnGrad.addColorStop(0, '#00aff0')
  btnGrad.addColorStop(1, '#008fd6')

  ctx.fillStyle = btnGrad
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 30px Sans'
  ctx.fillText('ABBONATI ORA', 450, 955)

  const buffer = canvas.toBuffer()

  await conn.sendMessage(m.chat, {
    image: buffer,
    caption: `🔞 Profilo onlyfans di @${target.split('@')[0]}`,
    mentions: [target]
  })
}

handler.help = ['onlyfans <nome/numero>']
handler.tags = ['fun']
handler.command = /^onlyfans$/i

export default handler