// menu gestione plugin by Bonzino

import fs from 'fs'
import path from 'path'

const pluginsDir = path.join(process.cwd(), 'plugins')
const files = fs.readdirSync(pluginsDir)

let handler = async (m, { conn, usedPrefix }) => {

  return conn.sendMessage(m.chat, {
    text:
`
⚙️*𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐏𝐋𝐔𝐆𝐈𝐍𝐒*⚙️

*📦 𝐏𝐥𝐮𝐠𝐢𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐢:* *${files.length}*

*𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐬𝐚 𝐯𝐮𝐨𝐢 𝐟𝐚𝐫𝐞:*`,

    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    buttons: [
      {
        buttonId: `${usedPrefix}pluginlist`,
        buttonText: { displayText: '🗂️ Lista' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}getplugin`,
        buttonText: { displayText: '📥 Get Plugin' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}nuovoplugin`,
        buttonText: { displayText: '🆕 Nuovo' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}salvaplugin`,
        buttonText: { displayText: '💾 Salva' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}modificaplugin`,
        buttonText: { displayText: '✏️ Modifica' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}eliminaplugin`,
        buttonText: { displayText: '🗑️ Elimina' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['plugin']
handler.tags = ['owner']
handler.command = /^(plugin|pluginmenu|gestioneplugin|plugins)$/i
handler.owner = true

export default handler