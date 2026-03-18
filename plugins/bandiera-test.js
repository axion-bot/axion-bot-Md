import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'

const TEMPO_QUIZ_MS = 30_000
const COOLDOWN_MS = 10_000
const MAX_TENTATIVI = 3
const ANTIRIMBALZO_MS = 800

global.bandieraGameState ||= {
  ACTIVE: new Map(),
  COOLDOWNS: new Map(),
  EXHAUSTED: new Map(),
  LOCKS: new Map()
}
global.bandieraSeen ||= {
  MSG: new Set(),
  REPLY: new Set(),
  RESP: new Set(),
  OUTGOING: new Set()
}

const { ACTIVE, COOLDOWNS, EXHAUSTED, LOCKS } = global.bandieraGameState
const { MSG: MSG_SEEN, REPLY: REPLY_SEEN, RESP: RESP_SENT, OUTGOING: OUTGOING_SEEN } = global.bandieraSeen

const FRASI = [
  '🇺🇳 *INDOVINA LA BANDIERA!* 🇺🇳',
  '🌍 *Che nazione rappresenta questa bandiera?*',
  '🏳️ *Sfida geografica: riconosci questa bandiera?*',
  '🧭 *Indovina la nazione dalla sua bandiera!*',
  '🎯 *Quiz bandiere: quale paese è questo?*',
  '🌟 *Metti alla prova la tua conoscenza geografica!*',
  '🔍 *Osserva attentamente e indovina la nazione!*',
  '*Riesci a riconoscere questa bandiera?*',
  '🌍 *Di quale Paese è questo simbolo?*',
  '🏳️ *Metti alla prova la tua memoria geografica!*',
  '🧭 *Osserva bene: a quale nazione appartiene?*',
  '🎯 *Sfida veloce: identifica la bandiera!*',
  '🌟 *Quanto conosci il mondo? Prova con questa bandiera!*',
  '🔍 *Guarda attentamente e prova a indovinare!*'
]

const fallbackFlags = [
  { name: 'Italia', iso2: 'it', continent: 'Europa', aliases: [] },
  { name: 'Francia', iso2: 'fr', continent: 'Europa', aliases: [] },
  { name: 'Germania', iso2: 'de', continent: 'Europa', aliases: [] },
  { name: 'Spagna', iso2: 'es', continent: 'Europa', aliases: [] },
  { name: 'Portogallo', iso2: 'pt', continent: 'Europa', aliases: [] },
  { name: 'Regno Unito', iso2: 'gb', continent: 'Europa', aliases: ['UK', 'Gran Bretagna', 'Inghilterra'] },
  { name: 'Stati Uniti', iso2: 'us', continent: 'America', aliases: ['USA', 'America', 'United States'] },
  { name: 'Canada', iso2: 'ca', continent: 'America', aliases: [] },
  { name: 'Brasile', iso2: 'br', continent: 'America', aliases: ['Brasil'] },
  { name: 'Argentina', iso2: 'ar', continent: 'America', aliases: [] },
  { name: 'Giappone', iso2: 'jp', continent: 'Asia', aliases: [] },
  { name: 'Cina', iso2: 'cn', continent: 'Asia', aliases: [] },
  { name: 'India', iso2: 'in', continent: 'Asia', aliases: [] },
  { name: 'Australia', iso2: 'au', continent: 'Oceania', aliases: [] }
]

function loadFlags() {
  try {
    const filePath = path.resolve('./data/bandiere.json')
    const raw = fs.readFileSync(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length) return parsed
  } catch {}
  return fallbackFlags
}

let FLAGS = loadFlags()

const S = v => String(v || '')

const getBody = m =>
  (m?.message?.extendedTextMessage?.text ||
   m?.message?.conversation ||
   m?.message?.imageMessage?.caption ||
   m?.message?.videoMessage?.caption ||
   m?.text ||
   '').trim()

const normalize = (s = '') =>
  s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const normName = name => normalize(name)

function levenshtein(a, b) {
  a = a || ''
  b = b || ''
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }
  return dp[m][n]
}

function similarity(a, b) {
  a = normName(a)
  b = normName(b)
  if (!a || !b) return 0
  const dist = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length) || 1
  return 1 - dist / maxLen
}

function getQuotedInfo(m) {
  const et = m?.message?.extendedTextMessage
  const ctx = et?.contextInfo || {}
  const quotedId = ctx.stanzaId || m?.quoted?.id || m?.quoted?.key?.id || null
  const quotedParticipant = ctx.participant || m?.quoted?.sender || m?.quoted?.key?.participant || null
  const fromMe = !!(m?.quoted?.fromMe || ctx?.fromMe)
  return { quotedId, quotedParticipant, fromMe }
}

async function withChatLock(chat, fn) {
  const prev = LOCKS.get(chat) || Promise.resolve()
  let release
  const gate = new Promise(res => { release = res })
  LOCKS.set(chat, prev.then(() => gate, () => gate))
  await prev.catch(() => {})
  try {
    await fn()
  } finally {
    release()
  }
}

async function sendAndMark(conn, chat, content, opts = {}) {
  const sent = await conn.sendMessage(chat, content, opts)
  const id = sent?.key?.id || sent?.id
  if (id) {
    OUTGOING_SEEN.add(id)
    setTimeout(() => OUTGOING_SEEN.delete(id), 10 * 60 * 1000)
  }
  return sent
}

async function sendBandiera(conn, chat, url, caption, quoted) {
  let thumb = null

  try {
    const img = await loadImage(url)
    const SIZE = 320
    const PADDING = 14
    const W = SIZE
    const H = SIZE

    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#000000'
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

    thumb = canvas.toBuffer('image/jpeg', { quality: 0.9 })
  } catch {}

  if (thumb) {
    const PAD = '\u2003\u2003'
    const title = `${PAD}Quiz bandiere!${PAD}`
    return conn.sendMessage(
      chat,
      {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false,
            thumbnail: thumb
          },
          jpegThumbnail: thumb
        }
      },
      { quoted }
    )
  }

  return conn.sendMessage(chat, { image: { url }, caption }, { quoted })
}

function startTimeout(chat, conn) {
  const st = ACTIVE.get(chat)
  if (!st) return

  clearTimeout(st.timeout)
  st.timeout = setTimeout(async () => {
    const cur = ACTIVE.get(chat)
    if (!cur) return

    ACTIVE.delete(chat)
    EXHAUSTED.get(chat)?.clear()

    try {
      await conn.sendMessage(
        chat,
        { text: `⌛ *Tempo scaduto!*\n🌍 La risposta era: *${cur.country}*` },
        { quoted: cur.quoted }
      )
    } catch {}
  }, TEMPO_QUIZ_MS)
}

function isCommandText(text = '') {
  return /^[./!#$%^&+=,;:?-]/.test(text)
}

function isAdminOrOwner(m, isAdmin) {
  return !!(isAdmin || m.fromMe)
}

function buildValidNames(flags) {
  return new Set(
    (Array.isArray(flags) ? flags : [])
      .flatMap(f => {
        const base = normName(f?.name || '')
        const aliases = Array.isArray(f?.aliases) ? f.aliases.map(a => normName(a)) : []
        return [base, ...aliases]
      })
      .filter(Boolean)
  )
}

let NOMI_VALIDI = buildValidNames(FLAGS)

async function bandieraBefore(m, { conn }) {
  const chat = m.chat
  if (!chat) return
  if (!m.isGroup) return

  if (m.key?.fromMe && !m.quoted) return

  const msgId = m?.key?.id
  if (msgId) {
    if (OUTGOING_SEEN.has(msgId)) return
    if (MSG_SEEN.has(msgId)) return
    MSG_SEEN.add(msgId)
    setTimeout(() => MSG_SEEN.delete(msgId), 10 * 60 * 1000)
  }

  const st = ACTIVE.get(chat)
  if (!st) return

  const { quotedId } = getQuotedInfo(m)
  const isDirectReply = !!quotedId && quotedId === st.id

  const guessRaw = getBody(m).trim()
  if (!guessRaw) return
  if (isCommandText(guessRaw)) return

  const guess = normName(guessRaw)
  if (!guess) return

  // modalità fissa tipo smart
  if (!isDirectReply) {
    if (guess.length < 3) return
    if (!NOMI_VALIDI.has(guess) && !['indizio', 'aiuto', 'hint'].includes(guess)) return
  }

  const sender = String(m.sender || m.participant || m.key?.participant || '')

  const isHint = ['indizio', 'aiuto', 'hint'].includes(guess)
  if (!isHint) {
    const replyKey = `${chat}|${st.id}|${sender}|${guess}`
    if (REPLY_SEEN.has(replyKey)) return
    REPLY_SEEN.add(replyKey)
    setTimeout(() => REPLY_SEEN.delete(replyKey), 60_000)
  }

  await withChatLock(chat, async () => {
    const st2 = ACTIVE.get(chat)
    if (!st2) return

    st2.seen ||= new Set()
    st2.lastTs ||= Object.create(null)

    if (isHint) {
      st2.usatoIndizio ||= new Set()

      if (st2.usatoIndizio.has(sender)) {
        await sendAndMark(conn, chat, { text: '*❗ Hai già usato il tuo indizio per questo turno!*' }, { quoted: m })
        return
      }

      st2.usatoIndizio.add(sender)

      const soluzione = FLAGS.find(f => normName(f.name) === normName(st2.country))
      const nome = soluzione?.name || st2.country
      const continente = soluzione?.continent || 'sconosciuto'

      const norm = normName(nome)
      const prima = norm.charAt(0).toUpperCase()
      const ultima = norm.charAt(norm.length - 1).toUpperCase()
      const lunghezza = norm.length

      const indizi = [
        `💡 *Suggerimento:*\n• Inizia con *"${prima}"*\n• È composta da *${lunghezza} lettere*`,
        `💡 *Suggerimento:*\n• Inizia con *"${prima}"*\n• Finisce con *"${ultima}"*`,
        `💡 *Suggerimento:*\n• Si trova nel continente: *${continente}*`
      ]

      const testoIndizio = indizi[Math.floor(Math.random() * indizi.length)]
      await sendAndMark(conn, chat, { text: testoIndizio }, { quoted: st2.quoted || m })
      return
    }

    const strongKey = msgId || `${sender}|${quotedId || 'no-reply'}|${guess}`
    if (st2.seen.has(strongKey)) return
    st2.seen.add(strongKey)
    setTimeout(() => st2.seen.delete(strongKey), 10 * 60 * 1000)

    const last = st2.lastTs[sender] || 0
    if (Date.now() - last < ANTIRIMBALZO_MS) return
    st2.lastTs[sender] = Date.now()
    st2.lastUserMsg = m

    if (!st2.tentativi) st2.tentativi = {}
    if (!EXHAUSTED.has(chat)) EXHAUSTED.set(chat, new Set())
    const exhaustedSet = EXHAUSTED.get(chat)

    if (exhaustedSet.has(sender)) {
      const respKey = `${chat}|${strongKey}`
      if (RESP_SENT.has(respKey)) return
      RESP_SENT.add(respKey)
      setTimeout(() => RESP_SENT.delete(respKey), 10 * 60 * 1000)

      await sendAndMark(
        conn,
        chat,
        { text: '⛔ *Tentativi esauriti!*\n⏳ *Attendi la fine del turno.*' },
        { quoted: st2.quoted || m }
      )
      return
    }

    const target = FLAGS.find(f => f && f.name && normName(f.name) === normName(st2.country))
    const targetNorm = target ? normName(target.name) : normName(st2.country)

    const exactMatch =
      target &&
      (
        normName(guess) === targetNorm ||
        (Array.isArray(target.aliases) && target.aliases.some(a => normName(a) === guess))
      )

    if (exactMatch) {
      clearTimeout(st2.timeout)
      ACTIVE.delete(chat)
      EXHAUSTED.get(chat)?.clear()

      const elapsedMs = Date.now() - (st2.askedAt || Date.now())
      const timeTaken = Math.max(1, Math.round(elapsedMs / 1000))

      const congratsMessage =
`╭━『 🎉 *RISPOSTA CORRETTA!* 』━╮
┃
┃ 🌍 *Nazione:* ${st2.country}
┃ ⏱️ *Tempo impiegato:* ${timeTaken}s
┃
╰━━━━━━━━━━━━━━━━╯`

      await sendAndMark(conn, chat, { text: congratsMessage }, { quoted: m })
      return
    }

    if (targetNorm) {
      const sim = similarity(guess, targetNorm)
      if (sim >= 0.70) {
        st2.hints ||= new Set()
        const hintKey = `${chat}|${st2.id}|${sender}`
        if (!st2.hints.has(hintKey)) {
          st2.hints.add(hintKey)
          setTimeout(() => st2.hints.delete(hintKey), 60_000)
          await sendAndMark(conn, chat, { text: '👀 *Ci sei quasi!*' }, { quoted: st2.quoted || m })
        }
      }
    }

    const prev = st2.tentativi[sender] || 0
    const nowCount = st2.tentativi[sender] = prev + 1

    const respKeyOnce = `${chat}|${strongKey}|wrong`
    if (RESP_SENT.has(respKeyOnce)) return
    RESP_SENT.add(respKeyOnce)
    setTimeout(() => RESP_SENT.delete(respKeyOnce), 10 * 60 * 1000)

    if (nowCount >= MAX_TENTATIVI) {
      exhaustedSet.add(sender)
      await sendAndMark(
        conn,
        chat,
        { text: '❌ *Risposta errata!*\n⏳ *Hai esaurito i tentativi. Attendi che un altro giocatore indovini oppure aspetta la fine del tempo!*' },
        { quoted: m }
      )
      return
    }

    const remaining = MAX_TENTATIVI - nowCount

    if (remaining === 1) {
      await sendAndMark(
        conn,
        chat,
        { text: '⚠️ *Ultimo tentativo rimasto!*\nPensa bene alla tua prossima risposta…' },
        { quoted: m }
      )
    } else {
      await sendAndMark(
        conn,
        chat,
        { text: `❌ *Risposta errata!* (Ti rimangono: ${remaining} tentativi!)` },
        { quoted: m }
      )
    }
  })
}

let handler = async (m, { conn, command, isAdmin }) => {
  const chat = m.chat
  if (!chat) return
  if (!m.isGroup) return

  FLAGS = loadFlags()
  NOMI_VALIDI = buildValidNames(FLAGS)

  if (/^(skipbandiera|skip)$/i.test(command)) {
    const cur = ACTIVE.get(chat)
    if (!cur) {
      await conn.sendMessage(chat, { text: '⚠️ Nessun gioco attivo in questo gruppo!' }, { quoted: m })
      return
    }

    if (!isAdminOrOwner(m, isAdmin)) {
      await conn.sendMessage(chat, { text: '❌ Solo gli admin possono interrompere il gioco.' }, { quoted: m })
      return
    }

    clearTimeout(cur.timeout)
    ACTIVE.delete(chat)
    EXHAUSTED.get(chat)?.clear()

    await conn.sendMessage(
      chat,
      { text: `🛑 *Gioco interrotto.*\n✨ La risposta era: *${cur.country}*` },
      { quoted: cur.quoted || m }
    )
    return
  }

  if (/^bandiera$/i.test(command)) {
    const st = ACTIVE.get(chat)
    if (st) {
      const elapsed = Date.now() - (st.askedAt || 0)
      const remaining = Math.max(0, TEMPO_QUIZ_MS - elapsed)

      if (remaining > 0) {
        const sec = Math.ceil(remaining / 1000)
        await sendAndMark(
          conn,
          chat,
          { text: `⏳ *Aspetta ancora ${sec} secondi prima di avviare un nuovo gioco!*` },
          { quoted: st.quoted || m }
        )
        return
      } else {
        ACTIVE.delete(chat)
        EXHAUSTED.get(chat)?.clear()
      }
    }

    const last = COOLDOWNS.get(chat) || 0
    const now = Date.now()
    if (now - last < COOLDOWN_MS) {
      const sec = Math.ceil((last + COOLDOWN_MS - now) / 1000)
      await sendAndMark(conn, chat, { text: `🕓 *Riprova tra ${sec}s.*` }, { quoted: m })
      return
    }
    COOLDOWNS.set(chat, now)

    if (!FLAGS.length) {
      await conn.sendMessage(chat, { text: '⚠️ Dataset bandiere non disponibile.' }, { quoted: m })
      return
    }

    const item = FLAGS[Math.floor(Math.random() * FLAGS.length)]
    const country = item?.name || 'Sconosciuta'
    const iso2 = S(item?.iso2 || '').toLowerCase()
    const url = iso2 ? `https://flagcdn.com/w640/${iso2}.png` : null

    const head = FRASI[Math.floor(Math.random() * FRASI.length)]
    const caption =
`${head}

💬 *Rispondi con il nome della nazione per indovinare!*
💡 *Puoi scrivere anche:* indizio

⏱️ *Tempo disponibile:* ${Math.round(TEMPO_QUIZ_MS / 1000)} secondi

*Buon divertimento!*`

    try {
      const sent = url
        ? await sendBandiera(conn, chat, url, caption, m)
        : await conn.sendMessage(chat, { text: `${caption}\n\n(immagine non disponibile)` }, { quoted: m })

      const msgId = sent?.key?.id || sent?.id
      ACTIVE.set(chat, {
        id: msgId,
        country,
        lastUserMsg: null,
        iso2,
        askedAt: Date.now(),
        quoted: sent || m,
        timeout: null,
        tentativi: {},
        seen: new Set(),
        lastTs: Object.create(null),
        usatoIndizio: new Set()
      })

      startTimeout(chat, conn)
    } catch (err) {
      console.error('Errore avvio bandiera:', err)
      await conn.sendMessage(
        chat,
        { text: '❌ *Errore durante l’avvio del gioco.* Riprova più tardi.' },
        { quoted: m }
      )
    }
  }
}

handler.before = bandieraBefore
handler.help = ['bandiera', 'skipbandiera']
handler.tags = ['giochi']
handler.command = ['bandiera2','skipbandiera',]
handler.group = true

export default handler
