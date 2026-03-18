// plugin by Bonzino
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
      text: `*Ora faccio una sega a ${tag(destinatario)}...* 😏`,
      mentions: [destinatario]
    },
    { quoted: m }
  )

  const key = sent?.key
  if (!key) return

  await sleep(2000)

  const frames = [
    '*8====👊D*',
    '*8===👊=D*',
    '*8==👊==D*',
    '*8=👊===D*',
    '*8=👊===D*',
    '*8==👊==D*',
    '*8===👊=D*',
    "*8====👊D💦*"
  ]

  for (const f of frames) {
    await editMessage(conn, chatId, key, f, [destinatario])
    const randomDelay = Math.floor(Math.random() * (900 - 300 + 1)) + 300
    await sleep(randomDelay)
  }

  const end = performance.now()
  const elapsed = ((end - start) / 1000).toFixed(2)

  await editMessage(
    conn,
    chatId,
    key,
`*🤤 Ohhsyy babyy* 🥵\n\n ${tag(mittente)} *ha fatto una sega a ${tag(destinatario)} e ha sborrato dappertutto in ${elapsed} secondi! 💦*`,
    [mittente, destinatario]
  )
}

handler.help = ['segs @utente']
handler.tags = ['fun']
handler.command = ['sega']
handler.group = true

export default handler
