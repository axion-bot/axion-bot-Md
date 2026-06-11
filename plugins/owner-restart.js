import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const RESTART_FILE = path.resolve('./tmp/restart-state.json')
const LOCK_FILE = path.resolve('./tmp/restart.lock')
const CONFIRM_FILE = path.resolve('./tmp/restart-confirm.json')

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function detectRuntime() {

  const envText = JSON.stringify(process.env).toLowerCase()
  const argvText = process.argv.join(' ').toLowerCase()

  if (
    process.env.pm_id !== undefined ||
    process.env.PM_ID !== undefined ||
    process.env.NODE_APP_INSTANCE !== undefined ||
    process.env.PM2_HOME !== undefined ||
    envText.includes('pm2')
  ) {
    return 'pm2'
  }

  if (
    process.env.NODEMON === 'true' ||
    process.env.NODEMON_CHILD === 'true' ||
    envText.includes('nodemon') ||
    argvText.includes('nodemon')
  ) {
    return 'nodemon'
  }

  try {

    const parentCmd =
      fs.readFileSync(
        `/proc/${process.ppid}/cmdline`,
        'utf8'
      ).toLowerCase()

    if (parentCmd.includes('pm2')) {
      return 'pm2'
    }

    if (parentCmd.includes('nodemon')) {
      return 'nodemon'
    }

  } catch {}

  return 'node'
}

function isPm2() {
  return detectRuntime() === 'pm2'
}

function isNodemon() {
  return detectRuntime() === 'nodemon'
}

function shellQuote(value) {
  return `"${String(value).replace(/(["\\$`])/g, '\\$1')}"`
}

function restartWithNode() {

  fs.mkdirSync(path.dirname(LOCK_FILE), { recursive: true })

  if (fs.existsSync(LOCK_FILE)) {

    const lockTime =
      Number(fs.readFileSync(LOCK_FILE, 'utf8')) || 0

    const isStale =
      Date.now() - lockTime > 60 * 1000

    if (!isStale) {
      throw new Error('Restart già in corso.')
    }

    fs.rmSync(LOCK_FILE, { force: true })
  }

  fs.writeFileSync(
    LOCK_FILE,
    String(Date.now())
  )

  const node = process.execPath

  const args = [
    ...process.execArgv,
    ...process.argv.slice(1)
  ]

  const command = [
    'sleep 4',
    `rm -f ${shellQuote(LOCK_FILE)}`,
    `cd ${shellQuote(process.cwd())}`,
    `${shellQuote(node)} ${args.map(shellQuote).join(' ')}`
  ].join(' && ')

  const child = spawn(
    'sh',
    ['-c', command],
    {
      detached: true,
      stdio: 'ignore'
    }
  )

  child.unref()
}

function saveConfirm(chat, sender) {

  fs.mkdirSync(
    path.dirname(CONFIRM_FILE),
    { recursive: true }
  )

  fs.writeFileSync(
    CONFIRM_FILE,
    JSON.stringify({
      chat,
      sender,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * 1000
    }, null, 2)
  )
}

function readConfirm() {

  try {

    if (!fs.existsSync(CONFIRM_FILE)) {
      return null
    }

    const data = JSON.parse(
      fs.readFileSync(CONFIRM_FILE, 'utf8')
    )

    if (
      !data?.expiresAt ||
      Date.now() > data.expiresAt
    ) {
      fs.rmSync(CONFIRM_FILE, { force: true })
      return null
    }

    return data

  } catch {
    return null
  }
}

function clearConfirm() {
  try {
    fs.rmSync(CONFIRM_FILE, { force: true })
  } catch {}
}

async function editMessage(
  conn,
  chatId,
  key,
  text,
  mentions = []
) {

  await conn.relayMessage(
    chatId,
    {
      protocolMessage: {
        key,
        type: 14,
        editedMessage: {
          extendedTextMessage: {
            text,
            contextInfo: mentions.length
              ? { mentionedJid: mentions }
              : {}
          }
        }
      }
    },
    {}
  )
}

async function sendRestartWarning(conn, m) {

  saveConfirm(m.chat, m.sender)

  const runtime =
    detectRuntime() === 'pm2'
      ? 'PM2'
      : detectRuntime() === 'nodemon'
        ? 'Nodemon'
        : 'Node'

  const text =
`*⚠️ 𝐂𝐨𝐧𝐟𝐞𝐫𝐦𝐚 𝐫𝐢𝐚𝐯𝐯𝐢𝐨*

*⚡ 𝐈𝐥 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭 𝐯𝐞𝐫𝐫𝐚̀ 𝐫𝐢𝐚𝐯𝐯𝐢𝐚𝐭𝐨.*

*🖥️ 𝐑𝐮𝐧𝐭𝐢𝐦𝐞 𝐚𝐭𝐭𝐢𝐯𝐨:* \`${runtime}\`

*𝐏𝐞𝐫 𝐮𝐧 𝐫𝐢𝐚𝐯𝐯𝐢𝐨 𝐩𝐢𝐮̀ 𝐬𝐭𝐚𝐛𝐢𝐥𝐞 è 𝐜𝐨𝐧𝐬𝐢𝐠𝐥𝐢𝐚𝐭𝐨 𝐮𝐬𝐚𝐫𝐞 \`nodemon\` 𝐨 \`𝐏𝐌𝟐.\`*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  await conn.sendMessage(
    m.chat,
    {
      text,
      buttons: [
        {
          buttonId: '.restartproceed',
          buttonText: {
            displayText: '✅ Procedi'
          },
          type: 1
        },
        {
          buttonId: '.restartcancel',
          buttonText: {
            displayText: '❌ Annulla'
          },
          type: 1
        }
      ],
      headerType: 1
    },
    { quoted: m }
  )
}

async function executeRestart(m, conn) {

  let errors = 0

  try {

    fs.mkdirSync(
      path.dirname(RESTART_FILE),
      { recursive: true }
    )

    const sent = await conn.sendMessage(
      m.chat,
      {
        text:
`*♻️ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*
*[░░░░░░░░░░]*`,
        mentions: [m.sender]
      },
      { quoted: m }
    )

    const key = sent?.key

    if (!key) {
      throw new Error(
        'Messaggio animazione non inviato correttamente'
      )
    }

    const frames = [
`*♻️ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*
*[█░░░░░░░░░]*`,

`*♻️ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*
*[██░░░░░░░░]*`,

`*♻️ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*
*[███░░░░░░░]*`,

`*♻️ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*
*[████░░░░░░]*`,

`*♻️ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*
*[█████░░░░░]*`,

`*♻️ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*
*[██████░░░░]*`,

`*♻️ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*
*[███████░░░]*`,

`*♻️ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*
*[████████░░]*`,

`*♻️ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*
*[█████████░]*`,

`*♻️ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭...*
*[██████████]*`
    ]

    for (const frame of frames) {

      await sleep(180)

      await editMessage(
        conn,
        m.chat,
        key,
        frame,
        [m.sender]
      )
    }

    const payload = {
      type: 'manual_restart',
      chat: m.chat,
      sender: m.sender,
      startedAt: Date.now(),
      mode: detectRuntime(),
      errors,
      messageKey: key
    }

    fs.writeFileSync(
      RESTART_FILE,
      JSON.stringify(payload, null, 2)
    )

    clearConfirm()

    if (
      !isPm2() &&
      !isNodemon()
    ) {
      restartWithNode()
    }

    try {
      await conn.ws.close()
    } catch {}

    if (isNodemon()) {

      setTimeout(() => {
        process.kill(process.pid, 'SIGUSR2')
      }, 500)

    } else {

      setTimeout(() => {
        process.exit(0)
      }, 500)

    }

  } catch (e) {

    errors++

    try {

      fs.mkdirSync(
        path.dirname(RESTART_FILE),
        { recursive: true }
      )

      fs.writeFileSync(
        RESTART_FILE,
        JSON.stringify({
          type: 'manual_restart',
          chat: m.chat,
          sender: m.sender,
          startedAt: Date.now(),
          mode: detectRuntime(),
          errors,
          lastError: String(e?.message || e)
        }, null, 2)
      )

    } catch {}

    return m.reply(
`*❌ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐟𝐚𝐥𝐥𝐢𝐭𝐨*
*🧾 𝐄𝐫𝐫𝐨𝐫𝐢:* ${errors}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
    )
  }
}

let handler = async (
  m,
  {
    conn,
    command,
    isOwner
  }
) => {

  if (!isOwner) {
    return m.reply(
      '*𝐒𝐨𝐥𝐨 𝐢𝐥 𝐩𝐫𝐨𝐩𝐫𝐢𝐞𝐭𝐚𝐫𝐢𝐨 𝐩𝐮𝐨̀ 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*'
    )
  }

  const cmd =
    String(command || '')
      .toLowerCase()

  if (
    cmd === 'restartcancel' ||
    cmd === 'annullariavvio'
  ) {

    clearConfirm()

    return m.reply(
      '*❌ 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐚𝐧𝐧𝐮𝐥𝐥𝐚𝐭𝐨.*\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*'
    )
  }

  if (
    cmd === 'restartproceed' ||
    cmd === 'procediriavvio'
  ) {

    const confirm = readConfirm()

    if (!confirm) {
      return m.reply(
        '*⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐫𝐢𝐚𝐯𝐯𝐢𝐨 𝐢𝐧 𝐚𝐭𝐭𝐞𝐬𝐚 𝐝𝐢 𝐜𝐨𝐧𝐟𝐞𝐫𝐦𝐚.*\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*'
      )
    }

    if (
      confirm.chat !== m.chat ||
      confirm.sender !== m.sender
    ) {
      return m.reply(
        '*⚠️ 𝐏𝐮𝐨𝐢 𝐜𝐨𝐧𝐟𝐞𝐫𝐦𝐚𝐫𝐞 𝐬𝐨𝐥𝐨 𝐢𝐥 𝐫𝐢𝐚𝐯𝐯𝐢𝐨 𝐜𝐡𝐞 𝐡𝐚𝐢 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐨 𝐭𝐮.*\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*'
      )
    }

    return executeRestart(
      m,
      conn
    )
  }

  return sendRestartWarning(
    conn,
    m
  )
}

handler.help = ['restart']
handler.tags = ['owner']

handler.command = [
  'restart',
  'riavvia',
  'restartproceed',
  'procediriavvio',
  'restartcancel',
  'annullariavvio'
]

handler.owner = true

export default handler