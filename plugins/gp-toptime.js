const TZ = "Europe/Rome"

let handler = async (m, { conn }) => {
    if (!m.isGroup) return conn.reply(m.chat, "Questo comando funziona solo nei gruppi.", m)

    const today = getTodayKey()
    initDay(today)

    const chatData = global.db.data.toptimeDaily.days[today].chats[m.chat] || {}

    // Ordiniamo i dati per tempo
    const top = Object.entries(chatData)
        .sort((a, b) => b[1].time - a[1].time)
        .slice(0, 5)

    if (top.length === 0) return conn.reply(m.chat, "Nessun dato temporale registrato oggi.", m)

    // Formattazione
    const { text, mentions } = formatTopTimeText(top, today)

    // Invio con bottone
    await conn.sendMessage(m.chat, {
        text: text,
        mentions: mentions,
        footer: 'Clicca sotto per la classifica estesa',
        buttons: [{ buttonId: '.top10time', buttonText: { displayText: '📊 Mostra Top 10' }, type: 1 }],
        headerType: 1
    }, { quoted: m })
}

handler.before = async function (m, { conn }) {
    try {
        if (!m.message || m.isBaileys || m.fromMe || !m.isGroup) return

        const today = getTodayKey()
        initDay(today)

        const dayObj = global.db.data.toptimeDaily.days[today]
        if (!dayObj.chats[m.chat]) dayObj.chats[m.chat] = {}

        // --- FIX PER L'ERRORE NEL TERMINALE ---
        if (!dayObj.chats[m.chat][m.sender]) {
            dayObj.chats[m.chat][m.sender] = { time: 0, lastSeen: Date.now() }
        }

        const chatData = dayObj.chats[m.chat][m.sender]
        const now = Date.now()
        const diff = Math.min(now - chatData.lastSeen, 300000) 

        chatData.time += (diff > 0 ? diff : 0)
        chatData.lastSeen = now
        // --------------------------------------

        // Risposta al bottone
        if (m.text === '.top10' || m.message?.buttonsResponseMessage?.selectedButtonId === '.top10time') {
            const top10 = Object.entries(dayObj.chats[m.chat])
                .sort((a, b) => b[1].time - a[1].time)
                .slice(0, 10)

            let text = "🏆 *TOP 10 ATTIVITÀ (TEMPO) OGGI*\n\n"
            top10.forEach((u, i) => {
                const h = Math.floor(u[1].time / 3600000)
                const m_ = Math.floor((u[1].time % 3600000) / 60000)
                text += `${i + 1}. @${u[0].split('@')[0]} — *${h}h ${m_}m*\n`
            })
            await conn.sendMessage(m.chat, { text, mentions: top10.map(u => u[0]) }, { quoted: m })
        }
    } catch (e) {
        console.error("Errore toptime.before:", e)
    }
}

function initDay(today) {
    if (!global.db.data.toptimeDaily) global.db.data.toptimeDaily = { days: {} }
    if (!global.db.data.toptimeDaily.days[today]) global.db.data.toptimeDaily.days[today] = { chats: {} }
}

function formatTopTimeText(top, today) {
    const medals = ["🥇", "🥈", "🥉", "🏅", "🎖"]
    const mentions = top.map(([jid]) => jid)
    let text = `🏆 *TOP 5 ATTIVITÀ (TEMPO) OGGI*\n📅 ${today}\n\n`
    top.forEach(([jid, data], i) => {
        const h = Math.floor(data.time / 3600000)
        const m_ = Math.floor((data.time % 3600000) / 60000)
        text += `${medals[i]} @${jid.split("@")[0]} — *${h}h ${m_}m*\n`
    })
    return { text: text.trim(), mentions }
}

function getRomeNowParts() {
    const parts = new Intl.DateTimeFormat("it-IT", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date())
    const obj = {}
    for (const p of parts) if (p.type !== "literal") obj[p.type] = p.value
    return obj
}

function getTodayKey() {
    const p = getRomeNowParts()
    return `${p.year}-${p.month}-${p.day}`
}

handler.command = /^(toptime)$/i
export default handler