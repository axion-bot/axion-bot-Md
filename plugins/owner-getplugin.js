import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function normalizeName(str = '') {
  return str
    .toLowerCase()
    .replace(/\.js$/i, '')
    .replace(/[\s_-]+/g, '')
    .trim()
}

function scoreMatch(query, fileName) {
  const q = normalizeName(query)
  const f = normalizeName(fileName)

  if (!q || !f) return 0
  if (q === f) return 100
  if (f.startsWith(q)) return 90
  if (f.includes(q)) return 75

  let qi = 0
  for (let i = 0; i < f.length && qi < q.length; i++) {
    if (f[i] === q[qi]) qi++
  }

  if (qi === q.length) return 50
  return 0
}

function findBestPlugin(query, pluginsDir) {
  const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))
  const normalizedQuery = normalizeName(query)

  let exact = files.find(file => normalizeName(file) === normalizedQuery)
  if (exact) {
    return { bestFile: exact, matches: [{ file: exact, score: 100 }] }
  }

  const matches = files
    .map(file => ({ file, score: scoreMatch(query, file) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))

  if (!matches.length) return { bestFile: null, matches: [] }

  if (matches.length === 1) {
    return { bestFile: matches[0].file, matches }
  }

  if (matches[0].score > matches[1].score) {
    return { bestFile: matches[0].file, matches }
  }

  return { bestFile: null, matches }
}

let handler = async (m, { conn, text, isOwner, usedPrefix }) => {
  const SIGN = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
  const pluginsDir = path.join(__dirname, '../plugins')

  if (!text) {
    return conn.reply(m.chat, `
⚙️ *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*

*Uso corretto:*
*.getpl <nome-plugin>*

${SIGN}`.trim(), m)
  }

  if (!isOwner) {
    return conn.reply(m.chat, `🔒 *Accesso negato*\n*Solo il proprietario può usare questa funzione.*\n\n${SIGN}`, m)
  }

  const parts = text.trim().split(/\s+/)
  const action = parts[0].toLowerCase()

  if (action === 'view' || action === 'visualizza') {
    const target = parts.slice(1).join(' ').trim()
    const pluginFile = target.endsWith('.js') ? target : `${target}.js`
    const pluginPath = path.join(pluginsDir, pluginFile)

    if (!fs.existsSync(pluginPath)) {
      return conn.reply(m.chat, `❌ *Errore:* Plugin *${pluginFile}* non trovato.\n\n${SIGN}`, m)
    }

    const code = fs.readFileSync(pluginPath, 'utf-8')

    if (code.length > 60000) {
      return conn.reply(m.chat, `⚠️ *Errore:* File troppo grande.\n\n${SIGN}`, m)
    }

    return conn.sendMessage(m.chat, {
      text:
`🚀 *Plugin caricato*

📂 *File:* ${pluginFile}
📊 *Size:* ${(code.length / 1024).toFixed(2)} KB

\`\`\`javascript
${code}
\`\`\`

${SIGN}`
    }, { quoted: m })
  }

  if (action === 'download' || action === 'scarica') {
    const target = parts.slice(1).join(' ').trim()
    const pluginFile = target.endsWith('.js') ? target : `${target}.js`
    const pluginPath = path.join(pluginsDir, pluginFile)

    if (!fs.existsSync(pluginPath)) {
      return conn.reply(m.chat, `❌ *Errore:* Plugin *${pluginFile}* non trovato.\n\n${SIGN}`, m)
    }

    return conn.sendMessage(m.chat, {
      document: fs.readFileSync(pluginPath),
      mimetype: 'application/javascript',
      fileName: pluginFile,
      caption: `📥 *Download pronto:*`
    }, { quoted: m })
  }

  const { bestFile, matches } = findBestPlugin(text, pluginsDir)

  if (!bestFile) {
    if (matches.length > 1) {
      const list = matches.slice(0, 8).map(x => `• ${x.file}`).join('\n')
      return conn.reply(m.chat, `⚠️ *Più risultati:*\n\n${list}\n\n*Sii più specifico.*\n\n${SIGN}`, m)
    }
    return conn.reply(m.chat, `❌ *Nessun plugin trovato.*\n\n${SIGN}`, m)
  }

  const stats = fs.statSync(path.join(pluginsDir, bestFile))

  return conn.sendMessage(m.chat, {
    text:
`📂 *Plugin trovato*

📄 *Nome:* ${bestFile}
📊 *Size:* ${(stats.size / 1024).toFixed(2)} KB

*Scegli un’azione:*`,
    footer: SIGN,
    buttons: [
      {
        buttonId: `${usedPrefix}getpl view ${bestFile}`,
        buttonText: { displayText: '👁️ Visualizza' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}getpl download ${bestFile}`,
        buttonText: { displayText: '📥 Scarica' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['getpl']
handler.tags = ['tools']
handler.command = /^getpl$/i
handler.owner = true

export default handler