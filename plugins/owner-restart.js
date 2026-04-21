//Plugin Restart by Bonzino

import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const RESTART_FILE = path.resolve('./tmp/restart-state.json')
const sleep = ms => new Promise(r => setTimeout(r, ms))

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

let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) {
    return m.reply('*𝐒𝐨𝐥𝐨 𝐢𝐥 𝐩𝐫𝐨𝐩𝐫𝐢𝐞𝐭𝐚𝐫𝐢𝐨 può 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*')
  }

  let errors = 0

  try {
    fs.mkdirSync(path.dirname(RESTART_FILE), { recursive: true })

    const sent = await conn.sendMessage(
      m.chat,
      {
        text: '*» 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*\n*[░░░░░░░░░░]*',
        mentions: [m.sender]
      },
      { quoted: m }
    )

    const key = sent?.key
    if (!key) throw new Error('Messaggio animazione non inviato correttamente')

    const frames = [
      '*» 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*\n*[█░░░░░░░░░]*',
      '*» 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*\n*[██░░░░░░░░]*',
      '*» 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*\n*[███░░░░░░░]*',
      '*» 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*\n*[████░░░░░░]*',
      '*» 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*\n*[█████░░░░░]*',
      '*» 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*\n*[██████░░░░]*',
      '*» 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*\n*[███████░░░]*',
      '*» 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*\n*[████████░░]*',
      '*» 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*\n*[█████████░]*',
      '*» 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*\n*[██████████]*'
    ]

    for (const frame of frames) {
      await sleep(180)
      await editMessage(conn, m.chat, key, frame, [m.sender])
    }

    const payload = {
      type: 'manual_restart',
      chat: m.chat,
      sender: m.sender,
      startedAt: Date.now(),
      errors
    }

    fs.writeFileSync(RESTART_FILE, JSON.stringify(payload, null, 2))

    const isPm2 =
      process.env.pm_id !== undefined ||
      process.env.PM_ID !== undefined ||
      process.env.NODE_APP_INSTANCE !== undefined

    if (isPm2) {
      setTimeout(() => {
        process.exit(0)
      }, 500)
      return
    }

    const child = spawn(process.argv[0], process.argv.slice(1), {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: {
        ...process.env,
        AXION_INTERNAL_RESTART: '1'
      }
    })

    child.on('error', err => {
      console.error('restart spawn error:', err)
    })

    setTimeout(() => {
      process.exit(0)
    }, 500)
  } catch (e) {
    errors++

    try {
      fs.mkdirSync(path.dirname(RESTART_FILE), { recursive: true })
      fs.writeFileSync(RESTART_FILE, JSON.stringify({
        type: 'manual_restart',
        chat: m.chat,
        sender: m.sender,
        startedAt: Date.now(),
        errors,
        lastError: String(e?.message || e)
      }, null, 2))
    } catch {}

    return m.reply(`*» 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐟𝐚𝐥𝐥𝐢𝐭𝐨*\n*🧾 𝐄𝐫𝐫𝐨𝐫𝐢:* ${errors}`)
  }
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = ['restart', 'riavvia']
handler.owner = true

export default handler