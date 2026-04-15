// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import os from 'os'
import { performance } from 'perf_hooks'

const toMathematicalAlphanumericSymbols = number => {
  const map = {
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒',
    '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗', '.': '.'
  }
  return number.toString().split('').map(d => map[d] || d).join('')
}

const clockString = ms => {
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)

  return `${toMathematicalAlphanumericSymbols(days.toString().padStart(2, '0'))}d ${toMathematicalAlphanumericSymbols(hours.toString().padStart(2, '0'))}h ${toMathematicalAlphanumericSymbols(minutes.toString().padStart(2, '0'))}m`
}

const handler = async (m, { conn, usedPrefix }) => {
  const _uptime = process.uptime() * 1000
  const uptime = clockString(_uptime)

  const start = performance.now()
  const end = performance.now()
  const speed = (end - start).toFixed(4)
  const speedWithFont = toMathematicalAlphanumericSymbols(speed)

  const totalMem = (os.totalmem() / (1024 * 1024)).toFixed(0)
  const usedMem = ((os.totalmem() - os.freemem()) / (1024 * 1024)).toFixed(0)

  const processMemory = process.memoryUsage()
  const heapUsed = (processMemory.heapUsed / (1024 * 1024)).toFixed(1)

  const info = `
『 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 — 𝐒𝐓𝐀𝐓𝐔𝐒 』

🚀 *𝐋𝐚𝐭𝐞𝐧𝐜𝐲*
╰➤ ${speedWithFont} ms

⏱️ *𝐔𝐩𝐭𝐢𝐦𝐞*
╰➤ ${uptime}

💻 *𝐑𝐞𝐬𝐨𝐮𝐫𝐜𝐞𝐬*
╰➤ Server: ${toMathematicalAlphanumericSymbols(usedMem)} / ${toMathematicalAlphanumericSymbols(totalMem)} MB
╰➤ Engine: ${toMathematicalAlphanumericSymbols(heapUsed)} MB

✅️ *𝐒𝐭𝐚𝐭𝐮𝐬*
╰➤ System online

> 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓
`.trim()

  const buttons = [
    {
      buttonId: `${usedPrefix}ping`,
      buttonText: { displayText: '🔄 Rifai Ping' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}menu`,
      buttonText: { displayText: '📋 Menu' },
      type: 1
    }
  ]

  await conn.sendMessage(m.chat, {
    text: info,
    buttons,
    headerType: 1
  }, { quoted: m })
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping)$/i

export default handler