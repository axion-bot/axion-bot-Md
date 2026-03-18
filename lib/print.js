import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

export default async function (m, conn = { user: {} }) {
  if (!m || m.key?.fromMe) return

  try {
    const senderJid = conn.decodeJid(m.sender)
    const chatJid = conn.decodeJid(m.chat || '')
    const botJid = conn.decodeJid(conn.user?.jid)

    if (!chatJid) return

    // 🆕 Newsletter / Channel
    const newsletterJid = m.key?.newsletterJid
    const isNewsletter = Boolean(newsletterJid)

    const senderName = await conn.getName(senderJid) || ''
    const chatName = await conn.getName(chatJid) || 'Chat'

    const sender = formatPhoneNumber(senderJid, senderName)
    const isGroup = chatJid.endsWith('@g.us')
    const isOwner = Array.isArray(global.owner)
      ? global.owner.map(([number]) => number).includes(senderJid.split('@')[0])
      : global.owner === senderJid.split('@')[0]

    const ts = formatTimestamp(m.messageTimestamp)
    const tipo = (m.mtype || 'unknown').replace(/Message/gi, '').toUpperCase()

    // Palette Axion Bot
    const cyan = chalk.hex('#00F5FF')
    const green = chalk.hex('#39FF14')
    const gray = chalk.hex('#95A5A6')
    const white = chalk.white.bold

    console.log(
      cyan('╭─────────────────────────────────────────────⊷') + '\n' +
      cyan('│') + green('  𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 — INCOMING MESSAGE') + '\n' +
      cyan('├┬───────────────') + '\n' +
      cyan('│') + gray(' 🕒 Ora:   ') + white(ts) + '\n' +
      cyan('│') + gray(' 👤 Da:    ') + white(sender) + ' ' + getUserStatus(isOwner) + '\n' +
      cyan('│') + gray(' 📍 Chat:  ') + white(chatName) +
        (isGroup
          ? gray(' (Gruppo)')
          : isNewsletter
            ? gray(' (Canale)')
            : gray(' (Privato)')
        ) + '\n' +
      (isNewsletter
        ? cyan('│') + gray(' 📢 Channel ID: ') + chalk.hex('#FFD700')(newsletterJid) + '\n'
        : ''
      ) +
      cyan('│') + gray(' 📂 Tipo:  ') + cyan(tipo) + '\n' +
      cyan('╰─────────────────────────────────────────────⊷')
    )

    const text = await formatText(m)
    if (text?.trim()) console.log(cyan(' ❯ ') + text + '\n')

  } catch (e) {
    console.error(chalk.red('Errore print.js:'), e.message)
  }
}

function getUserStatus(isOwner) {
  if (isOwner) return chalk.hex('#39FF14').bold('[OWNER]')
  return chalk.hex('#95A5A6')('[USER]')
}

function formatPhoneNumber(jid, name) {
  if (!jid) return 'Sconosciuto'
  let clean = jid.split('@')[0].split(':')[0]
  try {
    const number = PhoneNumber('+' + clean).getNumber('international')
    return number + (name ? ` ~${name}` : '')
  } catch {
    return clean + (name ? ` ~${name}` : '')
  }
}

function formatTimestamp(timestamp) {
  const date = timestamp ? new Date(timestamp * 1000) : new Date()
  return date.toLocaleTimeString('it-IT')
}

async function formatText(m) {
  if (!m.text && !m.caption) return ''
  let text = (m.text || m.caption || '').replace(/\u200e+/g, '')

  text = text.replace(urlRegex, url => chalk.hex('#00F5FF').underline(url))
  text = text.replace(/#[\w]+/g, tag => chalk.hex('#39FF14')(tag))

  if (m.isCommand) return chalk.bgHex('#008B8B').white.bold(` ${text} `)
  return chalk.white(text)
}

watchFile(__filename, () => {
  console.log(chalk.bgHex('#008B8B').white.bold(" 📝 [SYSTEM] File 'lib/print.js' Aggiornato "))
})