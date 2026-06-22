import 'dotenv/config'
import axios from 'axios'

const sessions = new Map()
const processing = new Set()

const FOOTER = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
const TIMEOUT = 5 * 60 * 1000
const GROQ_API_KEY = process.env.GROQ_API_KEY

const S = v => String(v || '')

async function react(m, emoji) {
  try { await m.react(emoji) } catch (e) {}
}

function getSessionId(m) {
  return `${m.chat}:${m.sender}`
}

function getMessageId(m) {
  return m.key?.id || ''
}

function clearSession(id) {
  const session = sessions.get(id)
  if (session?.timeout) clearTimeout(session.timeout)
  sessions.delete(id)
}

async function askAI(prompt) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY mancante')
  const { data } = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Sei Akinator in italiano. Fai una sola domanda breve alla volta. Le risposte possibili sono sì, no, forse, non so. Quando sei abbastanza sicuro rispondi ESATTAMENTE con: INDOVINATO: Nome Personaggio'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 45000
    }
  )
  return S(data?.choices?.[0]?.message?.content || '').trim()
}

async function getWikiImage(lang, name) {
  try {
    const title = encodeURIComponent(name)
    const { data } = await axios.get(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`,
      { timeout: 15000, headers: { 'User-Agent': 'AxionBot/1.0' } }
    )
    return data?.originalimage?.source || data?.thumbnail?.source || null
  } catch (e) { return null }
}

function resetTimeout(id, m, conn) {
  const session = sessions.get(id)
  if (!session) return
  if (session.timeout) clearTimeout(session.timeout)
  session.timeout = setTimeout(async () => {
    sessions.delete(id)
    await conn.sendMessage(m.chat, { text: '*⏱️ Sessione scaduta.*' }, { quoted: m })
  }, TIMEOUT)
}

function buttonsMessage(text, usedPrefix) {
  return {
    text,
    footer: FOOTER,
    buttons: [
      { buttonId: `${usedPrefix}aki si`, buttonText: { displayText: '✅ Sì' }, type: 1 },
      { buttonId: `${usedPrefix}aki no`, buttonText: { displayText: '❌ No' }, type: 1 },
      { buttonId: `${usedPrefix}aki forse`, buttonText: { displayText: '🤔 Forse' }, type: 1 },
      { buttonId: `${usedPrefix}aki non so`, buttonText: { displayText: '❓ Non so' }, type: 1 },
      { buttonId: `${usedPrefix}aki stop`, buttonText: { displayText: '🛑 Stop' }, type: 1 }
    ],
    headerType: 1
  }
}

async function handleAnswer(m, conn, usedPrefix = '.') {
  const id = getSessionId(m)
  const msgId = getMessageId(m)
  if (!sessions.has(id)) return false
  if (msgId && processing.has(msgId)) return true
  processing.add(msgId)
  try {
    const rawText = m.text || ''
    const cleanText = rawText.replace(new RegExp(`^\\${usedPrefix}(akinator|aki)\\s*`, 'i'), '').trim().toLowerCase().replace(/^sì$/, 'si')
    if (/^(stop|annulla|fine|exit)$/i.test(cleanText)) {
      clearSession(id)
      await react(m, '🛑')
      return m.reply('*Partita terminata.*')
    }
    if (!/^(si|no|forse|non so)$/i.test(cleanText)) return true
    await react(m, '🧠')
    const session = sessions.get(id)
    const replyText = await askAI(`Storico: ${session.history.join('\n')}\nRisposta: ${cleanText}`)
    session.history.push(`Utente: ${cleanText}`, `Akinator: ${replyText}`)
    resetTimeout(id, m, conn)
    if (/INDOVINATO:/i.test(replyText)) {
      const nome = replyText.split(/INDOVINATO:/i)[1]?.trim() || 'N/D'
      const image = await getWikiImage('it', nome) || await getWikiImage('en', nome)
      clearSession(id)
      await react(m, '🏆')
      let caption = `*🏆 AKINATOR HA VINTO!*\n\n*Stavi pensando a:*\n*${nome}*`
      return image ? conn.sendMessage(m.chat, { image: { url: image }, caption }, { quoted: m }) : m.reply(caption)
    }
    await conn.sendMessage(m.chat, buttonsMessage(`*🧞 Akinator:* \n\n${replyText}`, usedPrefix), { quoted: m })
    return true
  } catch (e) {
    clearSession(id)
    return m.reply('*Errore durante la partita.*')
  } finally {
    if (msgId) setTimeout(() => processing.delete(msgId), 2000)
  }
}

let handler = async (m, { conn, usedPrefix }) => {
  const id = getSessionId(m)
  if (sessions.has(id)) return handleAnswer(m, conn, usedPrefix)
  try {
    await react(m, '🧞')
    const startTxt = await askAI('Inizia una partita ad Akinator. Fai la prima domanda.')
    sessions.set(id, { history: [`Akinator: ${startTxt}`], timeout: null })
    resetTimeout(id, m, conn)
    await conn.sendMessage(m.chat, buttonsMessage(`*🧞 AKINATOR*\n\n${startTxt}`, usedPrefix), { quoted: m })
  } catch (e) {
    m.reply('*Errore avvio: Controlla la chiave Groq.*')
  }
}

handler.before = async (m, { conn, usedPrefix }) => {
  const id = getSessionId(m)
  if (!sessions.has(id) || m.text.startsWith(usedPrefix)) return
  await handleAnswer(m, conn, usedPrefix)
  return true
}

handler.help = ['akinator', 'aki']
handler.tags = ['fun']
handler.command = /^(akinator|aki)$/i

export default handler
