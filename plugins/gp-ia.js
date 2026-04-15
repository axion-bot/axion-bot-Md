// by deadly

import fetch from 'node-fetch'

const chatHistory = new Map()
const aiMessageIds = new Set()

const config = {
    name: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    model: 'openai',
    historyLimit: 15
}

const sys = (name) => `Sei ${config.name}, un assistente avanzato integrato in un bot WhatsApp.

Parla con ${name} in modo naturale, intelligente e credibile.

Comprendi il contesto, adatta automaticamente stile, tono, lunghezza e formato della risposta in base alla richiesta.

Se serve essere breve, sii breve.
Se serve essere dettagliato, sii dettagliato.
Se serve ragionare, ragiona.
Se serve scrivere codice, scrivi codice corretto e completo.

Mantieni continuità con la conversazione precedente ed evita risposte fredde, artificiali o ripetitive.

Rispondi sempre nel modo più utile, avanzato e realistico possibile.`

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

function trimHistory(hist) {
    const max = config.historyLimit * 2
    if (hist.length > max) return hist.slice(-max)
    return hist
}

let handler = async (m, { conn, text, command }) => {
    const chatId = m.chat
    const name = await conn.getName(m.sender) || 'User'
    const isNewSession = /^(ia|gpt|axion)$/i.test(command)

    if (!text || !text.trim()) return

    if (!chatHistory.has(chatId) || isNewSession) {
        chatHistory.set(chatId, [])
    }

    let hist = chatHistory.get(chatId)

    await conn.sendMessage(m.chat, {
        react: { text: '⏳', key: m.key }
    })

    try {
        const msgs = [
            { role: 'system', content: sys(name) },
            ...hist,
            { role: 'user', content: text.trim() }
        ]

        const out = await call(msgs)

        hist.push({ role: 'user', content: text.trim() })
        hist.push({ role: 'assistant', content: out })
        hist = trimHistory(hist)
        chatHistory.set(chatId, hist)

        const sent = await conn.sendMessage(m.chat, {
            text: out.trim()
        }, { quoted: m })

        if (sent?.key?.id) {
            aiMessageIds.add(sent.key.id)
        }

        await conn.sendMessage(m.chat, {
            react: { text: '✅️', key: m.key }
        })

    } catch (e) {
        await conn.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })
        m.reply(`[ERROR]: ${e.message}`)
    }
}

handler.help = ['ia']
handler.tags = ['main']
handler.command = /^(ia|gpt|axion)$/i

handler.before = async (m, { conn }) => {
    if (m.fromMe) return
    if (!m.quoted) return

    const text = (m.text || m.message?.extendedTextMessage?.text || '').trim()
    if (!text) return

    if (/^[./#!$]/.test(text)) return

    const quotedId = m.quoted?.id || m.quoted?.key?.id
    if (!quotedId) return

    if (!aiMessageIds.has(quotedId)) return

    return handler(m, {
        conn,
        text,
        command: 'reply'
    })
}

export default handler