//Plugin Akinator by Bonzino

import axios from 'axios'

const sessions = new Map()

const FOOTER = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
const TIMEOUT = 5 * 60 * 1000

function S(v) {
  return String(v || '')
}

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
  const apis = [
    `https://api.api-me.pro/api/gpt4?q=${encodeURIComponent(prompt)}`,
    `https://api.ryzendesu.vip/api/ai/gpt4?text=${encodeURIComponent(prompt)}`
  ]

  for (const url of apis) {
    try {
      const { data } = await axios.get(url, { timeout: 45000 })

      const result =
        data?.content ||
        data?.result ||
        data?.response ||
        data?.answer ||
        ''

      if (result) return S(result).trim()
    } catch {}
  }

  throw new Error('API AI non disponibile')
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
      { buttonId: 'si', buttonText: { displayText: '✅ Sì' }, type: 1 },
      { buttonId: 'no', buttonText: { displayText: '❌ No' }, type: 1 },
      { buttonId: 'forse', buttonText: { displayText: '🤔 Forse' }, type: 1 },
      { buttonId: 'non so', buttonText: { displayText: '❓ Non so' }, type: 1 },
      { buttonId: `${usedPrefix}aki stop`, buttonText: { displayText: '🛑 Stop' }, type: 1 }
    ],
    headerType: 1
  }
}

let handler = async (m, { conn, usedPrefix }) => {
  const id = getSessionId(m)

  const buttonAnswer =
    m.message?.buttonsResponseMessage?.selectedButtonId ||
    m.message?.templateButtonReplyMessage?.selectedId ||
    null

  const rawText = buttonAnswer || S(m.text).trim()
  const cleanText = S(rawText)
    .replace(new RegExp(`^\\${usedPrefix}(akinator|aki)\\s*`, 'i'), '')
    .trim()

  if (sessions.has(id)) {
    if (/^(stop|annulla|fine|exit)$/i.test(cleanText)) {
      clearSession(id)
      await react(m, '🛑')

      return conn.sendMessage(m.chat, {
        text:
`*╭━━━━━━━🛑━━━━━━━╮*
*✦ 𝐀𝐊𝐈𝐍𝐀𝐓𝐎𝐑 ✦*
*╰━━━━━━━🛑━━━━━━━╯*

*𝐏𝐚𝐫𝐭𝐢𝐭𝐚 𝐭𝐞𝐫𝐦𝐢𝐧𝐚𝐭𝐚.*

> ${FOOTER}`
      }, { quoted: m })
    }

    if (!cleanText) return

    try {
      await react(m, '🧠')

      const session = sessions.get(id)

      const prompt =
`Stai giocando ad Akinator in italiano.
Fai UNA SOLA domanda breve.
Risposte possibili: sì, no, forse, non so.
Quando sei sicuro scrivi:
INDOVINATO: Nome personaggio

Storico:
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

*${nome}*

> ${FOOTER}`

        if (image) {
          return conn.sendMessage(m.chat, {
            image: { url: image },
            caption
          }, { quoted: m })
        }

        return conn.sendMessage(m.chat, { text: caption }, { quoted: m })
      }

      return conn.sendMessage(
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

    } catch (e) {
      clearSession(id)
      await react(m, '❌')

      return conn.sendMessage(m.chat, {
        text:
`*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐄𝐑𝐑𝐎𝐑𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*❌ 𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐧𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞.*

> ${FOOTER}`
      }, { quoted: m })
    }
  }

  try {
    await react(m, '🧞')

    const prompt =
`Inizia una partita ad Akinator in italiano.
Saluta brevemente e fai la prima domanda.`

    const startTxt = await askAI(prompt)

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

handler.help = ['akinator']
handler.tags = ['fun']
handler.command = /^(akinator|aki)$/i

export default handler