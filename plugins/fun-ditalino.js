// plugin by Bonzino (adapted)
import { performance } from 'perf_hooks'

const sleep = ms => new Promise(r => setTimeout(r, ms))
const tag = jid => '@' + String(jid || '').split('@')[0]

async function editMessage(conn, chatId, key, text, mentions = []) {
  await conn.relayMessage(
    chatId,
    {
      protocolMessage: {
        key,
        type: 14,
        editedMessage: {
          extendedTextMessage: {
            text,
            contextInfo: mentions.length ? { mentionedJid: mentions } : {}
          }
        }
      }
    },
    {}
  )
}

let handler = async (m, { conn }) => {
  const chatId = m.chat
  if (!chatId) return

  let destinatario =
    m.quoted?.sender ||
    (Array.isArray(m.mentionedJid) && m.mentionedJid[0]) ||
    m?.message?.extendedTextMessage?.contextInfo?.participant ||
    m?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    null

  if (!destinatario) {
    await conn.sendMessage(
      chatId,
      {
        text: '⚠️ *Tagga qualcuno o rispondi a un messaggio.*'
      },
      { quoted: m }
    )
    return
  }

  const mittente =
    m.sender ||
    m.key?.participant ||
    m.participant ||
    (m.key?.fromMe ? conn?.user?.id : m.key?.remoteJid) ||
    ''

  const start = performance.now()

  const sent = await conn.sendMessage(
    chatId,
    {
      text: `*Sfilo le mutandine a ${tag(destinatario)}... le labbra sono già calde e bagnate* 🤤`,
      mentions: [destinatario]
    },
    { quoted: m }
  )

  const key = sent?.key
  if (!key) return

  await sleep(1500)

  const frames = [
    '*  ( { | } )  ✌🏻*   _(inizio a stimolare la clitoride...)_',
    '*  ( { ✌🏻 } )*   _(le dita scivolano dentro...)_',
    '*  ( { | } )💦 ✌🏻*   _(esco... cola il primo succo...)_',
    '*  ( { ✌🏻💦 } )*   _(spingo più a fondo, ahh...)_',
    '*  ( { | } )💦💦 ✌🏻*   _(la figa è completamente fradicia...)_',
    '*  ( { ✌🏻🔥 } )*   _(ritmo serrato, la stringo forte...)_',
    '*🥵 ( { ✌🏻🌊 } )*   _(ANIMA IL BACINO, STA VENENDO!!)_',
    '*💦 ( { | } ) 🌊🌊 💦*'
  ]

  for (const f of frames) {
    await editMessage(conn, chatId, key, f, [destinatario])
    const randomDelay = Math.floor(Math.random() * (600 - 200 + 1)) + 200
    await sleep(randomDelay)
  }

  const end = performance.now()
  const elapsed = ((end - start) / 1000).toFixed(2)

  await editMessage(
    conn,
    chatId,
    key,
`*🤤 Squirta l\'impossibile!! 🌊💦*\n\n${tag(mittente)} *ha letteralmente allagato la figa di ${tag(destinatario)} muovendo le dita a tempo record, facendola godere e spruzzare ovunque in soli ${elapsed} secondi! 🥵🔥🌊*`,
    [mittente, destinatario]
  )
}

handler.help = ['ditalino @utente']
handler.tags = ['fun']
handler.command = ['ditalino', 'dtrd']
handler.group = true

export default handler
