let handler = async (m, { conn, command, usedPrefix }) => {
    if (!global.gare) global.gare = {}
    if (!global.db.data.users) global.db.data.users = {}

    let chat = m.chat
    const quota = 50

    const macchine = [
        { name: "Fiat Panda 🚗", speed: 60, rarity: "Comune" },
        { name: "BMW M3 🔵", speed: 85, rarity: "Comune" },
        { name: "Tesla Model S ⚡", speed: 90, rarity: "Rara" },
        { name: "Lamborghini 🟡", speed: 95, rarity: "Epica" },
        { name: "Ferrari 🔴", speed: 97, rarity: "Epica" },
        { name: "Bugatti ⚫", speed: 100, rarity: "Leggendaria" }
    ]

    const eventi = [
        { text: u => `🚓 @${u} inseguito dalla polizia`, effect: p => p.performance -= 30 },
        { text: u => `💥 @${u} incidente devastante`, effect: p => p.performance -= 40 },
        { text: u => `⚡ @${u} usa il NITRO`, effect: p => p.performance += 30 },
        { text: u => `🔥 @${u} drift perfetto`, effect: p => p.performance += 20 },
        { text: u => `🛢️ @${u} scivola sull’olio`, effect: p => p.performance -= 20 }
    ]

    if (command === 'gara') {
        if (global.gare[chat]) return m.reply("🚫 Gara già attiva")

        global.gare[chat] = {
            players: [],
            started: false,
            lastResults: []
        }

        await conn.sendMessage(chat, {
            text: `╭━━━━━━━🏁━━━━━━━╮
✦ 𝐆𝐀𝐑𝐀 𝐈𝐋𝐋𝐄𝐆𝐀𝐋𝐄 ✦
╰━━━━━━━🏁━━━━━━━╯

📢 Una gara è iniziata!

💸 Quota ingresso: ${quota}€

👥 Partecipanti:
┌──────────────
│ Nessuno
└──────────────

⏳ 30 secondi per entrare
👉 ${usedPrefix}entragara`
        })

        setTimeout(() => startRace(conn, chat, quota, macchine, eventi), 30000)
    }

    if (command === 'entragara') {
        let gara = global.gare[chat]
        if (!gara) return m.reply("❌ Nessuna gara attiva")
        if (gara.started) return m.reply("⏳ Gara già iniziata")

        let user = m.sender

        if (!global.db.data.users[user]) {
            global.db.data.users[user] = { euro: 0 }
        }

        let u = global.db.data.users[user]

        if (u.euro < quota) {
            return m.reply(`❌ Non hai abbastanza soldi

💸 Quota: ${quota}€
💼 Hai: ${u.euro}€`)
        }

        if (gara.players.includes(user)) {
            return m.reply("⚠️ Sei già dentro")
        }

        u.euro -= quota
        gara.players.push(user)

        let lista = gara.players.map((u, i) => `${i + 1}. @${u.split("@")[0]}`).join("\n")
        let jackpot = gara.players.length * quota

        await conn.sendMessage(chat, {
            text: `🏎️ 𝐏𝐀𝐑𝐓𝐄𝐂𝐈𝐏𝐀𝐍𝐓𝐈

┌──────────────
${lista}
└──────────────

💰 Jackpot: ${jackpot}€`,
            mentions: gara.players
        })
    }
}

async function startRace(conn, chat, quota, macchine, eventi) {
    let gara = global.gare[chat]
    if (!gara) return

    if (gara.players.length < 2) {
        delete global.gare[chat]
        return conn.sendMessage(chat, { text: "❌ Gara annullata (pochi giocatori)" })
    }

    gara.started = true

    let risultati = []
    let eventiLog = []

    for (let p of gara.players) {
        let car = macchine[Math.floor(Math.random() * macchine.length)]
        let performance = car.speed + Math.random() * 30

        let data = { id: p, car, performance }

        if (Math.random() < 0.6) {
            let ev = eventi[Math.floor(Math.random() * eventi.length)]
            ev.effect(data)
            eventiLog.push(ev.text(p.split("@")[0]))
        }

        risultati.push(data)
    }

    risultati.sort((a, b) => b.performance - a.performance)

    gara.lastResults = risultati

    let classifica = risultati.map((r, i) => {
        let pos = ["🥇", "🥈", "🥉"][i] || `#${i + 1}`
        return `${pos} @${r.id.split("@")[0]}
   🚗 ${r.car.name}
   ✦ ${r.car.rarity}`
    }).join("\n\n")

    let eventiTxt = eventiLog.length ? eventiLog.join("\n") : "😶 Nessun evento"

    let jackpot = risultati.length * quota
    let bonus = Math.floor(Math.random() * 1000)
    let premioTot = jackpot + bonus

    let premi = [
        Math.floor(premioTot * 0.6),
        Math.floor(premioTot * 0.25),
        Math.floor(premioTot * 0.15)
    ]

    risultati.slice(0, 3).forEach((r, i) => {
        if (!global.db.data.users[r.id]) global.db.data.users[r.id] = { euro: 0 }
        global.db.data.users[r.id].euro += premi[i] || 0
    })

    let testo = `╭━━━━━━━🏁━━━━━━━╮
✦ 𝐑𝐈𝐒𝐔𝐋𝐓𝐀𝐓𝐈 𝐆𝐀𝐑𝐀 ✦
╰━━━━━━━🏁━━━━━━━╯

🎭 Eventi:
${eventiTxt}

📊 Classifica:
┌──────────────
${classifica}
└──────────────

💰 Jackpot: ${jackpot}€
🎁 Bonus: ${bonus}€

🏆 Premi:
🥇 ${premi[0]}€
🥈 ${premi[1]}€
🥉 ${premi[2]}€`

    await conn.sendMessage(chat, {
        text: testo,
        mentions: risultati.map(r => r.id)
    })

    setTimeout(async () => {
        let gara = global.gare[chat]
        if (!gara || !gara.lastResults) return

        let top = gara.lastResults.slice(0, 3)

        let podio = top.map((r, i) => {
            let pos = ["🥇", "🥈", "🥉"][i]
            return `${pos} @${r.id.split("@")[0]}`
        }).join("\n")

        let testoPodio = `╭━━━━━━━🏆━━━━━━━╮
✦ 𝐏𝐎𝐃𝐈𝐎 𝐔𝐅𝐅𝐈𝐂𝐈𝐀𝐋𝐄 ✦
╰━━━━━━━🏆━━━━━━━╯

${podio}

🎉 Complimenti ai vincitori!`

        await conn.sendMessage(chat, {
            text: testoPodio,
            mentions: top.map(r => r.id)
        })

        delete global.gare[chat]

    }, 90000)
}

handler.command = /^(gara|entragara)$/i
export default handler