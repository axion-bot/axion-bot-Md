import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*⚠️ Formato richiesto:*
${usedPrefix + command} Descrizione | Link GitHub

*Esempio:*
${usedPrefix + command} Il bot più potente per la gestione gruppi. | https://github.com/axion-bot/axion-bot-Md`)

    let [desc, git] = text.split('|').map(v => v.trim())
    if (!desc) return m.reply(`*❌ Inserisci almeno una descrizione!*`)

    const botName = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
    m.reply('🌌 *Inizializzazione protocollo 𝛥𝐗𝐈𝚶𝐍...* Generazione sito in corso.')

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
    <title>${botName} - Official Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #050505;
            --panel: rgba(20, 20, 30, 0.8);
            --accent: #00f2ff;
            --secondary: #7000ff;
            --text: #e0e0e0;
        }

        body {
            font-family: 'Rajdhani', sans-serif;
            background-color: var(--bg);
            background-image: radial-gradient(circle at 50% 50%, #101020 0%, #050505 100%);
            color: var(--text);
            margin: 0;
            overflow-x: hidden;
        }

        header {
            padding: 100px 20px;
            text-align: center;
            background: linear-gradient(to bottom, rgba(0, 242, 255, 0.1), transparent);
        }

        h1 {
            font-family: 'Orbitron', sans-serif;
            font-size: 4rem;
            letter-spacing: 8px;
            margin: 0;
            background: linear-gradient(90deg, var(--accent), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(0, 242, 255, 0.3);
        }

        .container {
            max-width: 1000px;
            margin: -60px auto 100px auto;
            padding: 0 20px;
        }

        .card {
            background: var(--panel);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 242, 255, 0.2);
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            transition: transform 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            border-color: var(--accent);
        }

        .cyan-text { color: var(--accent); font-family: 'Orbitron', sans-serif; font-size: 1.5rem; }

        .btn {
            display: inline-block;
            padding: 15px 35px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            font-family: 'Orbitron', sans-serif;
            letter-spacing: 2px;
            transition: 0.4s;
            margin-top: 20px;
        }

        .main-btn {
            background: linear-gradient(45deg, var(--accent), var(--secondary));
            color: white;
            box-shadow: 0 0 20px rgba(0, 242, 255, 0.4);
        }

        .main-btn:hover {
            box-shadow: 0 0 40px rgba(0, 242, 255, 0.6);
            transform: scale(1.05);
        }

        .git-btn {
            background: transparent;
            border: 2px solid var(--accent);
            color: var(--accent);
        }

        .git-btn:hover {
            background: var(--accent);
            color: black;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }

        .stat-card { text-align: center; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 15px; }

        footer {
            text-align: center;
            padding: 50px;
            font-size: 0.9rem;
            color: #555;
            letter-spacing: 3px;
        }
    </style>
</head>
<body>
    <header>
        <h1>𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓</h1>
        <p style="letter-spacing: 5px; color: var(--accent);">ADVANCED WHATSAPP SYSTEM</p>
    </header>

    <div class="container">
        <div class="card">
            <h2 class="cyan-text">SYSTEM OVERVIEW</h2>
            <p style="font-size: 1.2rem; line-height: 1.8;">${desc}</p>
            <a href="https://wa.me/${conn.user.jid.split('@')[0]}" class="btn main-btn">ACTIVATE SYSTEM</a>
        </div>

        ${githubSection}

        <div class="grid">
            <div class="card stat-card">
                <h3 class="cyan-text">SECURITY</h3>
                <p>Protezione avanzata contro spam e raid.</p>
            </div>
            <div class="card stat-card">
                <h3 class="cyan-text">SPEED</h3>
                <p>Risposta istantanea grazie al core 𝛥𝐗𝐈𝚶𝐍.</p>
            </div>
        </div>
    </div>

    <footer>
        &copy; 2026 AXION CORP. ALL RIGHTS RESERVED.
    </footer>
</body>
</html>`

    const path = `./tmp/Axion_Site.html`
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
    fs.writeFileSync(path, htmlContent)

    await conn.sendMessage(m.chat, { 
        document: fs.readFileSync(path), 
        fileName: `AXION_PORTAL.html`, 
        mimetype: 'text/html',
        caption: `🛸 *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓: Sito Generato!*

Il portale è pronto per essere visualizzato. Scarica il file e aprilo per entrare nell'interfaccia futuristica.`
    }, { quoted: m })

    fs.unlinkSync(path)
}

handler.help = ['creasito <desc | git>']
handler.tags = ['tools']
handler.command = /^(creasito|makesite)$/i
handler.owner = true;

export default handler
