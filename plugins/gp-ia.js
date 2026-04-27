import fetch from 'node-fetch'

const chatHistory = new Map()

const config = {
    name: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    model: 'openai',
    historyLimit: 15
}

const sys = (name) => `Sei ${config.name}.
Rispondi a ${name} seguendo fedelmente lo stile e la struttura degli esempi ricevuti.

REGOLE:
1. Se ricevi codice o strutture tecniche, rispondi SOLTANTO con il codice aggiornato.
2. NON aggiungere testo descrittivo, saluti o spiegazioni.
3. Se ricevi testo normale, sii sintetico e diretto.
4. Mantieni esattamente la logica e il formato che vedi nei messaggi precedenti.`

async function call(messages) {
    try {
        const res = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model: config.model,
                seed: Math.floor(Math.random() * 999999)
            })
        })
        return await res.text()
    } catch (e) {
        throw new Error('CORE_OFFLINE')
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) return 

    const chatId = m.chat
    const name = conn.getName(m.sender) || 'User'
    const isImageRequest = /image|foto|genera|disegna/i.test(text)

    if (isImageRequest) {
        try {
            await m.react('🎨')
            const imgUrl = `https://pollinations.ai/p/${encodeURIComponent(text)}?width=1080&height=1080&seed=${Math.floor(Math.random() * 99999)}`
            
            const response = await fetch(imgUrl)
            const buffer = await response.buffer()

            await conn.sendMessage(m.chat, { 
                image: buffer, 
                caption: `🌌 *Risultato per:* ${text}` 
            }, { quoted: m })
            
            await m.react('✨')
            return
        } catch (e) {
            await m.react('❌')
            return m.reply(`[ERROR_IMG]: ${e.message}`)
        }
    }

    if (!chatHistory.has(chatId)) chatHistory.set(chatId, [])
    let hist = chatHistory.get(chatId)

    try {
        await m.react('🪐')
        
        const msgs = [
            { role: 'system', content: sys(name) },
            ...hist,
            { role: 'user', content: text }
        ]

        const out = await call(msgs)

        hist.push({ role: 'user', content: text })
        hist.push({ role: 'assistant', content: out })
        if (hist.length > config.historyLimit) {
            hist.shift()
            hist.shift()
        }

        await conn.sendMessage(m.chat, { text: out.trim() }, { quoted: m })
        await m.react('🌌')

    } catch (e) {
        await m.react('❌')
        m.reply(`[ERROR]: ${e.message}`)
    }
}

handler.help = ['ia']
handler.tags = ['main']
handler.command = /^(ia|gpt)$/i

export default handler
