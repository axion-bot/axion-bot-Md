import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn, text, isOwner }) => {
    const SIGN = "𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓"
    
    if (!text) {
        return conn.reply(m.chat, `
⚙️ *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - FILE RETRIEVER*
Uso corretto: 
*.getpl <nome-plugin>*

Esempio:
*.getpl info-ping.js*

${SIGN}`, m)
    }

    if (!isOwner) {
        return conn.reply(m.chat, `🔒 *Accesso Negato*\nSolo il proprietario può eseguire questa funzione.\n\n${SIGN}`, m)
    }

    let pluginName = text.endsWith('.js') ? text : text + '.js'
    // Naviga tra le cartelle dei plugin (assicurati che il path sia corretto per la tua struttura)
    let pluginPath = path.join(__dirname, '../plugins', pluginName) 

    if (!fs.existsSync(pluginPath)) {
        return conn.reply(m.chat, `❌ *Errore:* Plugin *${pluginName}* non trovato nel directory.\n\n${SIGN}`, m)
    }

    let code = fs.readFileSync(pluginPath, 'utf-8')

    if (code.length > 60000) {
        return conn.reply(m.chat, `⚠️ *Errore:* Il file *${pluginName}* è troppo grande per WhatsApp.\n\n${SIGN}`, m)
    }

    // Risposta estetica
    let msg = `
🚀 *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - PLUGIN LOADED*

📂 *FILE:* ${pluginName}
📊 *SIZE:* ${(code.length / 1024).toFixed(2)} KB
👤 *AUTHOR:* ${SIGN}

\`\`\`javascript
${code}
\`\`\`

${SIGN}`

    await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
}

handler.help = ['getpl']
handler.tags = ['tools']
handler.command = /^getpl$/i
handler.owner = true 

export default handler
