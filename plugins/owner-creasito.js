import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*⚠️ Formato richiesto:*
${usedPrefix + command} Descrizione | Link GitHub`)

    let [desc, git] = text.split('|').map(v => v.trim())
    if (!desc) return m.reply(`*❌ Inserisci almeno una descrizione!*`)

    const botName = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
    m.reply('🌌 *ACCESSO OWNER AUTORIZZATO.*\nGenerazione portale eterno in corso...')

    let githubSection = git ? `
        <div class="card">
            <h2 class="cyan-text">💾 SOURCE CODE</h2>
            <p>Accedi alla repository ufficiale su GitHub per aggiornamenti e documentazione.</p>
            <a href="${git}" class="btn git-btn" target="_blank">GITHUB REPO</a>
        </div>` : ''

    let htmlContent = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${botName} - Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap" rel="stylesheet">
    <style>
        :root { --bg: #050505; --panel: rgba(20, 20, 30, 0.9); --accent: #00f2ff; --secondary: #7000ff; --text: #e0e0e0; }
        body { font-family: 'Rajdhani', sans-serif; background-color: var(--bg); color: var(--text); margin: 0; text-align: center; background-image: radial-gradient(circle at 50% 50%, #101020 0%, #050505 100%); }
        header { padding: 100px 20px; background: linear-gradient(to bottom, rgba(0, 242, 255, 0.1), transparent); }
        h1 { font-family: 'Orbitron', sans-serif; font-size: 3.5rem; letter-spacing: 5px; background: linear-gradient(90deg, var(--accent), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; text-shadow: 0 0 20px rgba(0, 242, 255, 0.3); }
        .container { max-width: 900px; margin: -50px auto 50px auto; padding: 0 20px; }
        .card { background: var(--panel); backdrop-filter: blur(10px); border: 1px solid rgba(0, 242, 255, 0.2); border-radius: 20px; padding: 40px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .cyan-text { color: var(--accent); font-family: 'Orbitron', sans-serif; letter-spacing: 2px; }
        .btn { display: inline-block; padding: 15px 35px; border-radius: 50px; text-decoration: none; font-weight: bold; font-family: 'Orbitron', sans-serif; transition: 0.4s; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .main-btn { background: linear-gradient(45deg, var(--accent), var(--secondary)); color: white; box-shadow: 0 0 15px rgba(0, 242, 255, 0.4); }
        .git-btn { border: 2px solid var(--accent); color: var(--accent); }
        .git-btn:hover { background: var(--accent); color: black; }
        footer { padding: 40px; font-size: 0.8rem; color: #555; letter-spacing: 2px; }
    </style>
</head>
<body>
    <header>
        <h1>𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓</h1>
        <p style="color: var(--accent); letter-spacing: 3px;">STAZIONE DI CONTROLLO OPERATIVA</p>
    </header>
    <div class="container">
        <div class="card">
            <h2 class="cyan-text">OVERVIEW</h2>
            <p style="font-size: 1.1rem; line-height: 1.6;">${desc}</p>
            <a href="https://wa.me/${conn.user.jid.split('@')[0]}" class="btn main-btn">AVVIA PROTOCOLLO</a>
        </div>
        ${githubSection}
    </div>
    <footer>© 2026 AXION CORP. PERMANENT UPLINK.</footer>
</body>
</html>`

    const path = `./tmp/index.html`
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
    fs.writeFileSync(path, htmlContent)

    try {
        // Funzione di upload interna per evitare SyntaxError di importazione
        const bodyForm = new FormData()
        bodyForm.append('file', fs.createReadStream(path))
        
        const response = await axios.post('https://telegra.ph/upload', bodyForm, {
            headers: {
                ...bodyForm.getHeaders()
            }
        })
        
        const eternalLink = 'https://telegra.ph' + response.data[0].src

        let linkMsg = `🛸 *𝛥𝐗𝐈𝚶𝐍 𝐄𝐓𝐄𝐑𝐍𝐀𝐋 𝐏𝐎𝐑𝐓𝐀𝐋*\n\n`
        linkMsg += `🌐 *Link Sito:* ${eternalLink}\n`
        linkMsg += `♾️ *Durata:* Permanente\n`
        linkMsg += `🛡️ *Privilegi:* Solo Owner\n\n`
        linkMsg += `Il file index.html è stato allegato.`

        await conn.sendMessage(m.chat, { text: linkMsg }, { quoted: m })
        
        await conn.sendMessage(m.chat, { 
            document: fs.readFileSync(path), 
            fileName: `index.html`, 
            mimetype: 'text/html'
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('❌ Errore durante l\'upload. Ti invio il file manualmente.')
        await conn.sendMessage(m.chat, { 
            document: fs.readFileSync(path), 
            fileName: `index.html`, 
            mimetype: 'text/html' 
        }, { quoted: m })
    }

    if (fs.existsSync(path)) fs.unlinkSync(path)
}

handler.help = ['creasito']
handler.tags = ['owner']
handler.command = /^(creasito|makesite)$/i
handler.owner = true

export default handler
