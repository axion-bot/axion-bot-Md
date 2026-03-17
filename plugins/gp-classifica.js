// TOP MESSAGGI // Plugin basato sulla struttura del tuo toptime
const TZ = "Europe/Rome"

let handler = async (m, { conn }) => {
    if (!m.isGroup) return conn.reply(m.chat, "Questo comando funziona solo nei gruppi.", m)

    const today = getTodayKey()
    initDay(today)

    const chatData = global.db.data.topmsgDaily.days[today].chats[m.chat] || {}
    
    // Ordiniamo per numero di messaggi (count)
    const top = Object.entries(chatData)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)

    if (top.length === 0) return conn.reply(m.chat, "Nessun messaggio registrato oggi.", m)

    const { text, mentions } = formatTopMsgText(top, today)

    // Invio con bottone
    await conn.sendMessage(m.chat, {
        text: text,
        mentions: mentions,
        footer: 'Clicca sotto per la classifica estesa',
        buttons: [{ buttonId: '.topmsg10', buttonText: { displayText: '📊 Mostra Top 10' }, type: 1 }],
        headerType: 1
    }, { quoted: m })
}

handler.before = async function (m, { conn }) {
    try {
        if (!m.message || m.isBaileys || m.fromMe || !m.isGroup) return

        const today = getTodayKey()
        initDay(today)

        const dayObj = global.db.data.topmsgDaily.days[today]
        if (!dayObj.chats[m.chat]) dayObj.chats[m.chat] = {}
        
        // Incrementa il conteggio dei messaggi
        if (!dayObj.chats[m.chat][m.sender]) {
            dayObj.chats[m.chat][m.sender] = { count: 0 }
        }
        dayObj.chats[m.chat][m.sender].count += 1

        // Risposta al bottone
        if (m.text === '.topmsg10' || m.message?.buttonsResponseMessage?.selectedButtonId === '.topmsg10') {
            const top10 = Object.entries(dayObj.chats[m.chat])
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 10)

            let text = "🏆 *TOP 10 ATTIVITÀ (MESSAGGI) OGGI*\n\n"
            top10.forEach((u, i) => {
                text += `${i + 1}. @${u[0].split('@')[0]} — *${u[1].count} messaggi*\n`
            })
            await conn.sendMessage(m.chat, { text, mentions: top10.map(u => u[0]) }, { quoted: m })
        }
    } catch (e) {
        console.error("Errore topmsg.before:", e)
    }
}

function initDay(today) {
    if (!global.db.data.topmsgDaily) global.db.data.topmsgDaily = { days: {} }
    if (!global.db.data.topmsgDaily.days[today]) global.db.data.topmsgDaily.days[today] = { chats: {} }
}

function formatTopMsgText(top, today) {
    const medals = ["🥇", "🥈", "🥉", "🏅", "🎖"]
    const mentions = top.map(([jid]) => jid)
    let text = `🏆 *TOP 5 ATTIVITÀ (MESSAGGI) OGGI*\n📅 ${today}\n\n`
    top.forEach(([jid, data], i) => {
        text += `${medals[i]} @${jid.split("@")[0]} — *${data.count} messaggi*\n`
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

handler.command = /^(top)$/i
export default handler
