// Plugin pulizia automatica by Bonzino

import fs from 'fs'
import path from 'path'

const CLEANUP_INTERVAL_HOURS = 6
const DELAY_TRA_GRUPPI_MS = 3000
const MIN_FILE_AGE_MS = 30 * 60 * 1000

const TEMP_DIRS = ['temp', 'tmp']
const SAFE_FILES = new Set(['restart-state.json', '.gitkeep'])

global.autoCleanState = global.autoCleanState || {
  started: false,
  interval: null,
  running: false
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function isOldEnough(stats) {
  return Date.now() - stats.mtimeMs >= MIN_FILE_AGE_MS
}

function collectFiles(dirPath, list = []) {
  if (!fs.existsSync(dirPath)) return list

  for (const name of fs.readdirSync(dirPath)) {
    const full = path.join(dirPath, name)

    let stats
    try {
      stats = fs.statSync(full)
    } catch {
      continue
    }

    if (stats.isDirectory()) {
      collectFiles(full, list)
      continue
    }

    list.push({ full, name, stats })
  }

  return list
}

function removeEmptyDirs(dirPath) {
  if (!fs.existsSync(dirPath)) return

  for (const name of fs.readdirSync(dirPath)) {
    const full = path.join(dirPath, name)

    let stats
    try {
      stats = fs.statSync(full)
    } catch {
      continue
    }

    if (stats.isDirectory()) {
      removeEmptyDirs(full)

      try {
        if (!fs.readdirSync(full).length) fs.rmdirSync(full)
      } catch {}
    }
  }
}

function cleanupDirGroup(dirNames = []) {
  let removed = 0

  for (const dirName of dirNames) {
    const dirPath = path.join(process.cwd(), dirName)
    const files = collectFiles(dirPath)

    for (const file of files) {
      if (SAFE_FILES.has(file.name)) continue
      if (!isOldEnough(file.stats)) continue

      try {
        fs.unlinkSync(file.full)
        removed++
      } catch {}
    }

    try {
      removeEmptyDirs(dirPath)
    } catch {}
  }

  return removed
}

function runCleanup() {
  const tempRemoved = cleanupDirGroup(TEMP_DIRS)
  return { tempRemoved }
}

async function announceCleanup(conn, summary) {
  const chats = global.db?.data?.chats || {}
  const groupIds = Object.keys(chats).filter(id => id.endsWith('@g.us'))

  for (const chatId of groupIds) {
    try {
      await conn.sendMessage(chatId, {
        text:
`╭━━━〔 *🧹 𝐀𝐔𝐓𝐎𝐂𝐋𝐄𝐀𝐍* 〕━━━⬣
┃ *𝐒𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢 ${summary.tempRemoved} 𝐟𝐢𝐥𝐞 𝐭𝐞𝐦𝐩𝐨𝐫𝐚𝐧𝐞𝐢 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨✅️*
╰━━━━━━━━━━━━━━━━━━━━⬣

>  *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

      })
    } catch (e) {
      console.error('cleanup announce error:', chatId, e)
    }

    await delay(DELAY_TRA_GRUPPI_MS)
  }
}

async function executeCleanup(conn) {
  const state = global.autoCleanState
  if (state.running) return

  state.running = true

  try {
    const summary = runCleanup()
    await announceCleanup(conn, summary)
  } catch (e) {
    console.error('auto cleanup error:', e)
  } finally {
    state.running = false
  }
}

let handler = async () => {}

handler.before = async function (m, { conn }) {
  const state = global.autoCleanState

  if (state.started) return

  state.started = true

  // Primo avvio immediato
  executeCleanup(conn)

  // Ripetizione ogni X ore
  state.interval = setInterval(() => {
    executeCleanup(conn)
  }, CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000)
}

export default handler