import 'dotenv/config'
import axios from 'axios'

const sessions = new Map()

const FOOTER = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
const TIMEOUT = 5 * 60 * 1000
const GROQ_API_KEY = process.env.GROQ_API_KEY

const S = v => String(v || '')

async function react(m, emoji) {
  try { await m.react(emoji) } catch {}
}

function getSessionId(m) {
  return `${m.chat}:${m.sender}`
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
        {
          role: 'user',
          content: prompt
        }
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

async function getCharacterImage(name) {
  try {
    const title = encodeURIComponent(name)
    const { data } = await axios.get(
      `https://it.wikipedia.org/api/rest_v1/page/summary/${title}`,
      { timeout: 15000 }
    )

    return data?.thumbnail?.source || data?.originalimage?.source || null
  } catch {
    return null
  }
}

function resetTimeout(id, m, conn) {
  const session = sessions.get(id)
  if (!session) return

  if (session.timeout) clearTimeout(session.timeout)

  session.timeout = setTimeout(async () => {
    sessions.delete(id)

    await conn.sendMessage(m.chat, {
      text:
`*╭━━━━━━━⏱️━━━━━━━╮*
*✦ 𝐀𝐊𝐈𝐍𝐀𝐓𝐎𝐑 ✦*
*╰━━━━━━━⏱️━━━━━━━╯*

*⏱️ 𝐒𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐬𝐜𝐚𝐝𝐮𝐭𝐚.*

> ${FOOTER}`
    }, { quoted: m })
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

function cleanAnswer(text, usedPrefix = '.') {
  return S(text)
    .replace(new RegExp(`^\\${usedPrefix}(akinator|aki)\\s*`, 'i'), '')
    .trim()
    .toLowerCase()
    .replace(/^sì$/, 'si')
}

async function handleAnswer(m, conn, usedPrefix = '.') {
  const id = getSessionId(m)
  if (!sessions.has(id)) return false

  const buttonAnswer =
    m.message?.buttonsResponseMessage?.selectedButtonId ||
    m.message?.templateButtonReplyMessage?.selectedId ||
    null

  const rawText = buttonAnswer || S(m.text).trim()
  const cleanText = cleanAnswer(rawText, usedPrefix)

  if (!cleanText) return true

  if (/^(stop|annulla|fine|exit)$/i.test(cleanText)) {
    clearSession(id)
    await react(m, '🛑')

    await conn.sendMessage(m.chat, {
      text:
`*╭━━━━━━━🛑━━━━━━━╮*
*✦ 𝐀𝐊𝐈𝐍𝐀𝐓𝐎𝐑 ✦*
*╰━━━━━━━🛑━━━━━━━╯*

*𝐏𝐚𝐫𝐭𝐢𝐭𝐚 𝐭𝐞𝐫𝐦𝐢𝐧𝐚𝐭𝐚.*

> ${FOOTER}`
    }, { quoted: m })

    return true
  }

  if (!/^(si|no|forse|non so)$/i.test(cleanText)) return true

  try {
    await react(m, '🧠')

    const session = sessions.get(id)

    const prompt =
`Storico partita:
${session.history.join('\n')}

Risposta utente: ${cleanText}`

    const replyText = await askAI(prompt)

    session.history.push(`Utente: ${cleanText}`)
    session.history.push(`Akinator: ${replyText}`)

    resetTimeout(id, m, conn)

    if (/INDOVINATO:/i.test(replyText)) {
      const nome = replyText.split(/INDOVINATO:/i)[1]?.trim() || 'N/D'
      const image = await getCharacterImage(nome)

      clearSession(id)
      await react(m, '🏆')

      const caption =
`*╭━━━━━━━🏆━━━━━━━╮*
*✦ 𝐀𝐊𝐈𝐍𝐀𝐓𝐎𝐑 ✦*
*╰━━━━━━━🏆━━━━━━━╯*

*✨ 𝐕𝐢𝐭𝐭𝐨𝐫𝐢𝐚!*

*𝐒𝐭𝐚𝐯𝐢 𝐩𝐞𝐧𝐬𝐚𝐧𝐝𝐨 𝐚:*
*${nome}*

> ${FOOTER}`

      if (image) {
        await conn.sendMessage(m.chat, {
          image: { url: image },
          caption
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
      }

      return true
    }

    await conn.sendMessage(
      m.chat,
      buttonsMessage(
`*╭━━━━━━━🧞━━━━━━━╮*
*✦ 𝐀𝐊𝐈𝐍𝐀𝐓𝐎𝐑 ✦*
*╰━━━━━━━🧞━━━━━━━╯*

*${replyText}*

> ${FOOTER}`,
        usedPrefix
      ),
      { quoted: m }
    )

    return true

  } catch (e) {
    console.error('Errore akinator:', e?.response?.data || e?.message || e)
    clearSession(id)
    await react(m, '❌')

    await conn.sendMessage(m.chat, {
      text:
`*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐄𝐑𝐑𝐎𝐑𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*❌ 𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐧𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞.*

> ${FOOTER}`
    }, { quoted: m })

    return true
  }
}

let handler = async (m, { conn, usedPrefix }) => {
  const id = getSessionId(m)

  if (sessions.has(id)) {
    return handleAnswer(m, conn, usedPrefix)
  }

  try {
    await react(m, '🧞')

    const startTxt = await askAI(
      'Inizia una partita ad Akinator in italiano. Saluta brevemente e fai la prima domanda.'
    )

    sessions.set(id, {
      history: [`Akinator: ${startTxt}`],
      timeout: null
    })

    resetTimeout(id, m, conn)

    return conn.sendMessage(
      m.chat,
      buttonsMessage(
`*╭━━━━━━━🧞━━━━━━━╮*
*✦ 𝐀𝐊𝐈𝐍𝐀𝐓𝐎𝐑 𝐀𝐈 ✦*
*╰━━━━━━━🧞━━━━━━━╯*

*${startTxt}*

> ${FOOTER}`,
        usedPrefix
      ),
      { quoted: m }
    )

  } catch (e) {
    console.error('Errore avvio akinator:', e?.response?.data || e?.message || e)
    await react(m, '❌')

    return conn.sendMessage(m.chat, {
      text:
`*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐄𝐑𝐑𝐎𝐑𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*❌ 𝐀𝐏𝐈 𝐧𝐨𝐧 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐠𝐢𝐛𝐢𝐥𝐞.*

> ${FOOTER}`
    }, { quoted: m })
  }
}

handler.before = async (m, { conn, usedPrefix }) => {
  const prefix = usedPrefix || '.'
  const text = S(m.text).trim().toLowerCase()

  // Ignora comando iniziale
  if (new RegExp(`^\\${prefix}(akinator|aki)(\\s|$)`, 'i').test(text)) return

  // Ignora risposte da pulsanti
  const blocked = [
    'akinator_si',
    'akinator_no',
    'akinator_forse',
    'akinator_nonso',
    'akinator_stop'
  ]

  if (blocked.includes(text)) return

  const id = getSessionId(m)
  if (!sessions.has(id)) return

  await handleAnswer(m, conn, prefix)
  return true
}

handler.help = ['akinator', 'aki']
handler.tags = ['fun']
handler.command = /^(akinator|aki)$/i

export default handler