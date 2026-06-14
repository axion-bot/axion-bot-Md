// Plugin lista plugin by Bonzino

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn, usedPrefix }) => {

  const pluginsDir = path.join(__dirname, '../plugins')

  if (!fs.existsSync(pluginsDir)) {
    return m.reply(
`*❌ 𝐂𝐚𝐫𝐭𝐞𝐥𝐥𝐚 𝐩𝐥𝐮𝐠𝐢𝐧 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐚.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`)
  }

  const files = fs.readdirSync(pluginsDir)
    .filter(file => file.endsWith('.js'))
    .sort((a, b) => a.localeCompare(b))

  if (!files.length) {
    return m.reply(
`*⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐩𝐥𝐮𝐠𝐢𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`)
  }

  let text =
`🧩*𝐋𝐈𝐒𝐓𝐀 𝐏𝐋𝐔𝐆𝐈𝐍𝐒*🧩

*📦 𝐏𝐥𝐮𝐠𝐢𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐢:* *${files.length}*\n`

  files.forEach((file, i) => {
    text += `\n*${i + 1}.* *${file}*`
  })

  text += `\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  return conn.sendMessage(m.chat, {
    text,
    footer: '',
    buttons: [
      {
        buttonId: `${usedPrefix}getplugin`,
        buttonText: { displayText: '📥 Get Plugin' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}nuovoplugin`,
        buttonText: { displayText: '🆕 Nuovo Plugin' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}plugin`,
        buttonText: { displayText: '🔙 Menu Plugin' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['pluginlist']
handler.tags = ['owner']
handler.command = /^(pluginlist|listaplugin|plugins)$/i
handler.owner = true

export default handler