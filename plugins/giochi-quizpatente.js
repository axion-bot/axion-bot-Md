/*Plugin originale: https://github.com/realvare/varebot
edit by Bonzino */

import fs from 'fs/promises'

const MAX_DOMANDE_DEFAULT = 10
const MAX_CONSENTITE = 50
const QUIZ_PATH = './database/quizpatente.json'
const TIMEOUT = 60_000
const PREMIO_EURO = 30
const PREMIO_EXP = 150
const ERRORI_MASSIMI_PREMIO = 3
const FOOTER = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

function shuffleArray(array) {
  let arr = array.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

async function react(m, emoji) {
  try {
    await m.react(emoji)
  } catch {}
}

function S(v) {
  return String(v || '')
}

function buildQuestionMessage(q, index, total) {
  const opts = Object.entries(q.opzioni)
    .map(([k, v]) => `*${k}* - *${S(v)}*`)
    .join('\n')

  const buttons = Object.keys(q.opzioni).map(key => ({
    buttonId: key,
    buttonText: { displayText: key },
    type: 1
  }))

  const text =
`*🚦 𝐐𝐮𝐢𝐳 𝐏𝐚𝐭𝐞𝐧𝐭𝐞*

*📍 𝐃𝐨𝐦𝐚𝐧𝐝𝐚:* *${index}/${total}*

*${S(q.domanda)}*

${opts}

*⏱️ 𝐓𝐞𝐦𝐩𝐨:* *𝟔𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢*`

  return {
    text,
    footer: FOOTER,
    buttons,
    headerType: 1
  }
}

let handler = async (m, { conn, args }) => {
  conn.quizpatente = conn.quizpatente || {}

  const id = m.chat + ':' + m.sender

  if (id in conn.quizpatente) {
    await react(m, '⚠️')
    await conn.reply(
      m.chat,
      '*⚠️ 𝐇𝐚𝐢 𝐠𝐢à 𝐮𝐧 𝐪𝐮𝐢𝐳 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨. 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥𝐥𝐚 𝐝𝐨𝐦𝐚𝐧𝐝𝐚 𝐚𝐭𝐭𝐮𝐚𝐥𝐞 𝐩𝐫𝐢𝐦𝐚 𝐝𝐢 𝐜𝐨𝐦𝐢𝐧𝐜𝐢𝐚𝐫𝐧𝐞 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨.*',
      conn.quizpatente[id].msg || m
    )
    return
  }

  try {
    await react(m, '🚦')

    const raw = await fs.readFile(QUIZ_PATH, 'utf8')
    const quizData = JSON.parse(raw)

    if (!Array.isArray(quizData) || quizData.length === 0) {
      await react(m, '❌')
      return conn.reply(m.chat, '*❌ 𝐃𝐚𝐭𝐚𝐛𝐚𝐬𝐞 𝐪𝐮𝐢𝐳 𝐯𝐮𝐨𝐭𝐨 𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.*', m)
    }

    let numeroDomande = parseInt(args[0])

    if (isNaN(numeroDomande) || numeroDomande < 1 || numeroDomande > MAX_CONSENTITE) {
      numeroDomande = MAX_DOMANDE_DEFAULT
    }

    numeroDomande = Math.min(numeroDomande, quizData.length)

    const domande = shuffleArray(quizData).slice(0, numeroDomande)

    const session = {
      domande,
      currentIndex: 0,
      score: 0,
      risposte: [],
      msg: null,
      timeout: null
    }

    const sendNextQuestion = async () => {
      const q = session.domande[session.currentIndex]

      session.msg = await conn.sendMessage(
        m.chat,
        buildQuestionMessage(q, session.currentIndex + 1, session.domande.length),
        { quoted: m }
      )

      clearTimeout(session.timeout)

      session.timeout = setTimeout(async () => {
        delete conn.quizpatente[id]
        await react(m, '⏱️')

        await conn.sendMessage(m.chat, {
          text:
`*⏱️ 𝐓𝐞𝐦𝐩𝐨 𝐬𝐜𝐚𝐝𝐮𝐭𝐨!*

*𝐇𝐚𝐢 𝐢𝐦𝐩𝐢𝐞𝐠𝐚𝐭𝐨 𝐭𝐫𝐨𝐩𝐩𝐨 𝐭𝐞𝐦𝐩𝐨 𝐩𝐞𝐫 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞.*
*𝐈𝐥 𝐪𝐮𝐢𝐳 è 𝐬𝐭𝐚𝐭𝐨 𝐚𝐧𝐧𝐮𝐥𝐥𝐚𝐭𝐨.*

> ${FOOTER}`
        }, { quoted: session.msg || m })
      }, TIMEOUT)
    }

    conn.quizpatente[id] = session
    await sendNextQuestion()

  } catch (e) {
    console.error('Errore quizpatente:', e)
    await react(m, '❌')
    await conn.reply(
      m.chat,
      `*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥'𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐪𝐮𝐢𝐳.*\n\n\`\`\`${S(e?.message || e).slice(0, 800)}\`\`\`\n\n> ${FOOTER}`,
      m
    )
  }
}

handler.before = async (m, { conn }) => {
  conn.quizpatente = conn.quizpatente || {}

  const id = m.chat + ':' + m.sender
  if (!(id in conn.quizpatente)) return

  const session = conn.quizpatente[id]
  const userAnswer = m.message?.buttonsResponseMessage?.selectedButtonId || null

  if (!userAnswer) return

  const domandaAttuale = session.domande[session.currentIndex]
  const corretta = S(domandaAttuale.rispostaCorretta).toUpperCase()
  const rispostaUtente = S(userAnswer).toUpperCase()
  const isCorrect = rispostaUtente === corretta

  if (isCorrect) {
    session.score++
    await react(m, '✅')
  } else {
    await react(m, '❌')
  }

  session.risposte.push({
    domanda: domandaAttuale.domanda,
    rispostaUtente,
    corretta,
    esito: isCorrect
  })

  session.currentIndex++

  if (session.currentIndex >= session.domande.length) {
    clearTimeout(session.timeout)
    delete conn.quizpatente[id]

    const errori = session.risposte.filter(r => !r.esito).length

    let riepilogo = session.risposte.map((r, i) => {
      const simbolo = r.esito ? '✅' : '❌'
      const domandaOriginale = session.domande[i]
      const rispostaCorrettaTesto = domandaOriginale.opzioni[r.corretta] || 'N/D'
      const rispostaUtenteTesto = domandaOriginale.opzioni[r.rispostaUtente] || 'N/D'

      return `*${simbolo} 𝐃𝐨𝐦𝐚𝐧𝐝𝐚 ${i + 1}*\n*${S(r.domanda)}*\n\n*𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐝𝐚𝐭𝐚:* *${r.rispostaUtente}* - *${S(rispostaUtenteTesto)}*\n*𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐜𝐨𝐫𝐫𝐞𝐭𝐭𝐚:* *${r.corretta}* - *${S(rispostaCorrettaTesto)}*`
    }).join('\n\n')

    let finale =
`*🎉 𝐐𝐮𝐢𝐳 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨!*

*📊 𝐏𝐮𝐧𝐭𝐞𝐠𝐠𝐢𝐨:* *${session.score}/${session.domande.length}*
*❌ 𝐄𝐫𝐫𝐨𝐫𝐢:* *${errori}*

*📋 𝐑𝐢𝐞𝐩𝐢𝐥𝐨𝐠𝐨:*

${riepilogo}`

    if (errori <= ERRORI_MASSIMI_PREMIO) {
      if (global.db?.data?.users?.[m.sender]) {
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + PREMIO_EURO
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + PREMIO_EXP
      }

      finale += `\n\n*🏆 𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚:* *+${PREMIO_EURO} 𝐞𝐮𝐫𝐨, +${PREMIO_EXP} 𝐞𝐱𝐩*`
    } else {
      finale += `\n\n*💡 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐫𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚:* *𝐦𝐚𝐬𝐬𝐢𝐦𝐨 ${ERRORI_MASSIMI_PREMIO} 𝐞𝐫𝐫𝐨𝐫𝐢 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐢.*`
    }

    finale += `\n\n> ${FOOTER}`

    return conn.sendMessage(m.chat, { text: finale }, { quoted: m })
  }

  const nextQ = session.domande[session.currentIndex]

  session.msg = await conn.sendMessage(
    m.chat,
    buildQuestionMessage(nextQ, session.currentIndex + 1, session.domande.length),
    { quoted: m }
  )

  clearTimeout(session.timeout)

  session.timeout = setTimeout(async () => {
    delete conn.quizpatente[id]
    await react(m, '⏱️')

    await conn.sendMessage(m.chat, {
      text:
`*⏱️ 𝐓𝐞𝐦𝐩𝐨 𝐬𝐜𝐚𝐝𝐮𝐭𝐨!*

*𝐇𝐚𝐢 𝐢𝐦𝐩𝐢𝐞𝐠𝐚𝐭𝐨 𝐭𝐫𝐨𝐩𝐩𝐨 𝐭𝐞𝐦𝐩𝐨 𝐩𝐞𝐫 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞.*
*𝐈𝐥 𝐪𝐮𝐢𝐳 è 𝐬𝐭𝐚𝐭𝐨 𝐚𝐧𝐧𝐮𝐥𝐥𝐚𝐭𝐨.*

> ${FOOTER}`
    }, { quoted: session.msg || m })
  }, TIMEOUT)
}

handler.command = ['quizpatente']
handler.tags = ['giochi']
handler.help = ['quizpatente']

export default handler