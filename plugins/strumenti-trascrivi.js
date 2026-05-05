import fetch from 'node-fetch'
import FormData from 'form-data'
import dotenv from 'dotenv'

dotenv.config()

const box = (emoji, title, body) => `*╭━━━━━━━${emoji}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${emoji}━━━━━━━╯*

${body}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, {
      react: { text: emoji, key: m.key }
    })
  } catch {}
}

const getFlag = (lang = '') => {
  const map = {
    it: '🇮🇹',
    en: '🇬🇧',
    us: '🇺🇸',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    pt: '🇵🇹',
    br: '🇧🇷',
    ru: '🇷🇺',
    ja: '🇯🇵',
    ko: '🇰🇷',
    zh: '🇨🇳',
    ar: '🇸🇦',
    hi: '🇮🇳'
  }

  const key = lang.toLowerCase().slice(0, 2)
  return map[key] || '🌐'
}

async function trascriviGladia(buffer) {
  const key = process.env.GLADIA_API_KEY
  if (!key) throw '❌️ 𝐀𝐏𝐈 𝐊𝐄𝐘 𝐦𝐚𝐧𝐜𝐚𝐧𝐭𝐞'

  const form = new FormData()
  form.append('audio', buffer, {
    filename: 'audio.ogg',
    contentType: 'audio/ogg'
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000)

  let res
  try {
    res = await fetch('https://api.gladia.io/audio/text/audio-transcription', {
      method: 'POST',
      headers: {
        'x-gladia-key': key,
        accept: 'application/json',
        ...form.getHeaders()
      },
      body: form,
      signal: controller.signal
    })
  } finally {
    clearTimeout(timeout)
  }

  const raw = await res.text()

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    throw '𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐚 𝐝𝐚 𝐆𝐥𝐚𝐝𝐢𝐚'
  }

  if (!res.ok) throw `𝐄𝐫𝐫𝐨𝐫𝐞 𝐆𝐥𝐚𝐝𝐢𝐚 ${res.status}`

  let text = ''
  let lang = '𝐍/𝐃'

  if (Array.isArray(data.prediction)) {
    text = data.prediction
      .map(x => x?.transcription || x?.text || '')
      .filter(Boolean)
      .join(' ')
      .trim()

    lang =
      data.prediction?.[0]?.language ||
      data.prediction?.[0]?.language_code ||
      '𝐍/𝐃'
  }

  if (!text && typeof data.transcription === 'string') text = data.transcription
  if (!text && typeof data.text === 'string') text = data.text

  lang =
    data.language ||
    data.language_code ||
    data.detected_language ||
    data.result?.language ||
    data.result?.language_code ||
    lang

  text = String(text || '').trim()
  if (!text) throw '𝐓𝐫𝐚𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞 𝐯𝐮𝐨𝐭𝐚'

  return { text, lang }
}

let handler = async (m, { conn }) => {
  const start = Date.now()

  let durata = 0
  if (m.quoted?.seconds) durata = m.quoted.seconds
  else if (m.msg?.seconds) durata = m.msg.seconds
  else if (m.quoted?.msg?.seconds) durata = m.quoted.msg.seconds

  const durataAudio = durata
    ? `${Math.floor(durata / 60)}:${String(durata % 60).padStart(2, '0')}`
    : '𝐍/𝐃'

  await react(conn, m, '🎙️')

  let media = null

  try {
    if (m.quoted) media = await m.quoted.download()
  } catch {}

  if (!media) {
    try {
      media = await m.download()
    } catch {}
  }

  if (!media) {
    await react(conn, m, '❌')
    return conn.reply(
      m.chat,
      box(
        '⚠️',
        '𝐀𝐔𝐃𝐈𝐎 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎',
        `*𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐯𝐨𝐜𝐚𝐥𝐞 𝐨 𝐢𝐧𝐯𝐢𝐚 𝐮𝐧 𝐚𝐮𝐝𝐢𝐨 𝐜𝐨𝐧 .𝐭𝐫𝐚𝐬𝐜𝐫𝐢𝐯𝐢*`
      ),
      m
    )
  }

  try {
    const { text, lang } = await trascriviGladia(media)
    const time = ((Date.now() - start) / 1000).toFixed(2)

    await react(conn, m, '✅')

    return conn.reply(
      m.chat,
      box(
        '📝',
        '𝐓𝐑𝐀𝐒𝐂𝐑𝐈𝐙𝐈𝐎𝐍𝐄',
`*🌍 𝐋𝐢𝐧𝐠𝐮𝐚:* ${getFlag(lang)} ${lang}
*🎙 𝐋𝐮𝐧𝐠𝐡𝐞𝐳𝐳𝐚 𝐯𝐨𝐜𝐚𝐥𝐞:* *${durataAudio}*
*⏱️ 𝐓𝐞𝐦𝐩𝐨 𝐭𝐫𝐚𝐬𝐜𝐨𝐫𝐬𝐨:* *${time}s*

${text}`
      ),
      m
    )
  } catch (e) {
    await react(conn, m, '❌')

    return conn.reply(
      m.chat,
      box(
        '❌',
        '𝐄𝐑𝐑𝐎𝐑𝐄',
        `*${String(e?.message || e).slice(0, 250)}*`
      ),
      m
    )
  }
}

handler.command = /^(trascrivi|transcribe)$/i
handler.group = true

export default handler