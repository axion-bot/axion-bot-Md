global.curriculumGame = global.curriculumGame || {}

const random = (arr) => arr[Math.floor(Math.random() * arr.length)]

// 💼 LAVORI
const lavori = [
    { nome: "Web Developer", paga: 2500 },
    { nome: "Data Scientist", paga: 3000 },
    { nome: "Graphic Designer", paga: 1800 },
    { nome: "Marketing Specialist", paga: 2100 },
    { nome: "AI Engineer", paga: 3500 }
]

// 🏢 AZIENDE
const aziende = [
    { nome: "Google", reputazione: 90, bonus: 1.3 },
    { nome: "Meta", reputazione: 80, bonus: 1.2 },
    { nome: "Amazon", reputazione: 75, bonus: 1.15 },
    { nome: "Tesla", reputazione: 85, bonus: 1.25 },
    { nome: "OpenAI", reputazione: 95, bonus: 1.4 },
    { nome: "Startup SRL", reputazione: 60, bonus: 1.1 }
]

// 🎲 EVENTI
const eventi = [
    { testo: "🎉 Bonus ricevuto!", effetto: (u) => u.euro += 500 },
    { testo: "😓 Errore costoso...", effetto: (u) => u.euro -= 300 },
    { testo: "🚀 Promozione!", effetto: (u) => u.euro += 1000 },
    { testo: "💀 Licenziato!", effetto: (u) => { u.lavoro = null; u.azienda = null } },
    { testo: "😌 Giornata tranquilla.", effetto: (u) => {} }
]

// 🧠 DATI CV
const skillList = ["JavaScript","Python","UI/UX","AI","Marketing","SEO","Data Analysis"]
const lingue = ["Italiano","Inglese","Spagnolo","Francese"]
const certificazioni = ["Google Certified","AWS","Meta Ads","Azure","OpenAI Expert"]
const livelliExp = ["Junior","Mid","Senior","Esperto"]

// 🔘 BOTTONI
const buttons = (prefix) => [
    { buttonId: `${prefix}cercalavoro`, buttonText: { displayText: '💼 Cerca Lavoro' }, type: 1 },
    { buttonId: `${prefix}profilowork`, buttonText: { displayText: '👤 Profilo' }, type: 1 }
]

let handler = async (m, { conn, command, usedPrefix }) => {
    const chat = m.chat
    const user = m.sender
    const nome = await conn.getName(user)

    global.curriculumGame[chat] = global.curriculumGame[chat] || {}

    let u = global.db.data.users[user]
    if (!u.euro) u.euro = 0
    if (!u.lavoro) u.lavoro = null
    if (!u.azienda) u.azienda = null
    if (!u.reputazioneAzienda) u.reputazioneAzienda = 0

    // 📄 CURRICULUM
    if (command === "curriculum") {

        let skills = Array.from({ length: 3 }, () => random(skillList)).join(", ")
        let lingua = random(lingue)
        let cert = random(certificazioni)
        let exp = random(livelliExp)

        let txt = `╔═══ 📄 *CURRICULUM VITAE* ═══╗

👤 ${nome}

💼 Ruolo: ${random(lavori).nome}
📊 Livello: ${exp}

🧠 Competenze:
→ ${skills}

🌍 Lingue:
→ ${lingua}

🏆 Certificazioni:
→ ${cert}

🎯 Obiettivo:
→ Guadagnare sempre di più 💸

━━━━━━━━━━━━━━━━━━

╚══════════════════════╝`

        return await conn.sendMessage(chat, {
            text: txt,
            footer: "Scegli cosa fare",
            buttons: buttons(usedPrefix),
            headerType: 1
        }, { quoted: m })
    }

    // 💼 CERCA LAVORO
    if (command === "cercalavoro") {
        let lista = []
        let used = new Set()

        let txt = `╔═══ 💼 *OFFERTE DI LAVORO* ═══╗

_Rispondi con 1-5_

`

        let i = 1
        while (used.size < 5) {
            let job = random(lavori)
            if (!used.has(job.nome)) {
                used.add(job.nome)

                let az = random(aziende)
                let paga = Math.floor(job.paga * az.bonus)

                lista.push({
                    ...job,
                    azienda: az.nome,
                    reputazione: az.reputazione,
                    pagaFinale: paga
                })

                txt += `┌─ *${i}. ${job.nome}*
│ 🏢 ${az.nome}
│ ⭐ ${az.reputazione}/100
│ 💰 ${paga}€
└──────────\n\n`

                i++
            }
        }

        global.curriculumGame[chat][user] = { proposte: lista }

        return conn.reply(chat, txt, m)
    }

    // 👤 PROFILO
    if (command === "profilowork") {
        let txt = `╔═══ 👤 *PROFILO LAVORO* ═══╗

💼 ${u.lavoro || "Disoccupato"}
🏢 ${u.azienda || "-"}
⭐ ${u.reputazioneAzienda}/100

💰 ${u.euro}€

╚══════════════════════╝`

        return conn.reply(chat, txt, m)
    }
}

// 🎯 SCELTA
handler.before = async (m, { conn }) => {
    const chat = m.chat
    const user = m.sender

    if (!global.curriculumGame?.[chat]?.[user]) return
    if (!/^[1-5]$/.test(m.text)) return

    let u = global.db.data.users[user]
    const scelta = global.curriculumGame[chat][user].proposte[m.text - 1]
    const nome = await conn.getName(user)

    u.lavoro = scelta.nome
    u.azienda = scelta.azienda
    u.reputazioneAzienda = scelta.reputazione
    u.euro += scelta.pagaFinale

    // 🎲 EVENTO
    let evento
    if (u.reputazioneAzienda >= 85) {
        evento = random([eventi[0], eventi[2], eventi[4]])
    } else if (u.reputazioneAzienda >= 70) {
        evento = random(eventi)
    } else {
        evento = random([eventi[1], eventi[3], eventi[4]])
    }

    evento.effetto(u)

    let txt = `╔═══ 🎮 *CARRIERA* ═══╗

👤 ${nome}
💼 ${u.lavoro || "Disoccupato"}
🏢 ${u.azienda || "-"}

⭐ ${u.reputazioneAzienda}/100
💰 ${u.euro}€

━━━━━━━━━━━━━━
🎲 ${evento.testo}

╚══════════════════╝`

    await conn.reply(chat, txt, m)

    delete global.curriculumGame[chat][user]
}

handler.command = /^(curriculum|cercalavoro|profilowork)$/i
export default handler