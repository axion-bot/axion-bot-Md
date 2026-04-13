// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

const TEMPLATE_URL = 'https://i.imgur.com/nav6WWX.png'

async function getJimp() {
  const mod = await import('jimp')
  return mod?.default || mod.Jimp || mod
}

async function resizeCompat(img, w, h) {
  try { return img.resize({ w, h }) } catch {}
  try { return img.resize(w, h) } catch {}
  return img
}

async function getBufferCompat(image, mime) {
  if (typeof image.getBuffer === 'function') {
    try {
      const maybe = image.getBuffer(mime)
      if (maybe && typeof maybe.then === 'function') return await maybe
    } catch {}
    try {
      return await new Promise((res, rej) => image.getBuffer(mime, (e, b) => e ? rej(e) : res(b)))
    } catch {}
  }
  if (typeof image.getBufferAsync === 'function') return await image.getBufferAsync(mime)
  throw new Error('Jimp getBuffer compat failed')
}

function resolveTarget(m, text = '') {
  const raw = String(text || '').trim()
  const digits = raw.replace(/\D/g, '')

  if (digits.length >= 7 && digits.length <= 15) {
    return digits + '@s.whatsapp.net'
  }

  if (m.mentionedJid?.length) return m.mentionedJid[0]
  if (m.quoted) return m.quoted.sender
  return m.sender
}

let handler = async (m, { conn, text }) => {
  try {
    const sender = conn.decodeJid(m.sender)
    const who = conn.decodeJid(resolveTarget(m, text))

    let avatarUrl
    try {
      avatarUrl = await conn.profilePictureUrl(who, 'image')
    } catch (e) {
      console.log('[bonk:pfp]', who, e?.message || e)
      return conn.reply(
        m.chat,
        '*⚠️ 𝐍𝐨𝐧 𝐫𝐢𝐞𝐬𝐜𝐨 𝐚 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐚𝐫𝐞 𝐥𝐚 𝐟𝐨𝐭𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨.*',
        m,
        global.rcanal
      )
    }

    const Jimp = await getJimp()
    const img = await Jimp.read(TEMPLATE_URL)
    const avatar = await Jimp.read(avatarUrl)

    await resizeCompat(avatar, 128, 128)

    const blendMode = Jimp.BLEND_DESTINATION_OVER ?? 'dstOver'

    img.composite(avatar, 120, 90, {
      mode: blendMode,
      opacitySource: 1,
      opacityDest: 1
    })

    const png = await getBufferCompat(img, Jimp.MIME_PNG || 'image/png')

    const caption = sender === who
      ? '*🔨 𝐂𝐨𝐥𝐩𝐨 𝐚𝐮𝐭𝐨𝐢𝐧𝐟𝐥𝐢𝐭𝐭𝐨*'
      : '*🔨 𝐁𝐨𝐧𝐤!*'

    await conn.sendMessage(
      m.chat,
      {
        image: png,
        caption,
        mentions: [who],
        contextInfo: {
          ...(global.rcanal?.contextInfo || {})
        }
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('[bonk:error]', e)
    await conn.reply(
      m.chat,
      '*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*',
      m,
      global.rcanal
    )
  }
}

handler.help = ['bonk', 'bonk @utente', 'bonk numero']
handler.tags = ['fun']
handler.command = /^(bonk)$/i

export default handler