let handler = async (m, { conn, command, usedPrefix }) => {
    if (!global.gare) global.gare = {}
    if (!global.db.data.users) global.db.data.users = {}

    let chat = m.chat
    const quota = 50

    const macchine = [
        { name: "Fiat Panda 🚗", speed: 60 },
        { name: "BMW M3 🔵", speed: 85 },
        { name: "Tesla ⚡", speed: 90 },
        { name: "Lamborghini 🟡", speed: 95 },
        { name: "Ferrari 🔴", speed: 97 },
        { name: "Bugatti ⚫", speed: 100 }
    ]

    const eventi = [
        "🚓 inseguito dalla polizia",
        "💥 incidente",
        "⚡ usa il nitro",
        "🔥 drift perfetto",
        "🛢️ perde controllo"
    ]

    if (command === 'gara') {
        if (global.gare[chat]) return m.reply("🚫 Gara già attiva")

        global.gare[chat] = {
            players: [],
            started: false
        }

        await conn.sendMessage(chat, {
            text: `🏁 GARA ILLEGALE

💸 Quota: ${quota}€
⏳ 30s per entrare
👉 ${usedPrefix}entragara`
        })

        setTimeout(() => startRace(conn, chat, quota, macchine, eventi), 30000)
    }

    if (command === 'entragara') {
        let gara = global.gare[chat]
        if (!gara) return m.reply("❌ Nessuna gara")
        if (gara.started) return m.reply("⏳ Già iniziata")

        let user = m.sender
        if (!global.db.data.users[user]) global.db.data.users[user] = { euro: 0 }

        let u = global.db.data.users[user]
        if (u.euro < quota) return m.reply("❌ Soldi insufficienti")

        if (gara.players.includes(user)) return m.reply("⚠️ Sei già dentro")

        u.euro -= quota
        gara.players.push(user)

        await conn.sendMessage(chat, {
            text: `🏎️ @${user.split("@")[0]} si unisce alla gara!`,
            mentions: [user]
        })
    }
}

async function startRace(conn, chat, quota, macchine, eventi) {
    let gara = global.gare[chat]
    if (!gara) return

    if (gara.players.length < 2) {
        delete global.gare[chat]
        return conn.sendMessage(chat, { text: "❌ Gara annullata" })
    }

    gara.started = true

    let racers = gara.players.map(p => {
        let car = macchine[Math.floor(Math.random() * macchine.length)]
        return {
            id: p,
            car,
            score: car.speed + Math.random() * 20
        }
    })

    let interval = setInterval(async () => {
        racers.forEach(r => {
            r.score += Math.random() * 15
        })

        racers.sort((a, b) => b.score - a.score)

        let i = Math.floor(Math.random() * (racers.length - 1))
        let a = racers[i]
        let b = racers[i + 1]

        let sorpasso = Math.random() < 0.5

        let msg = ""

        if (sorpasso) {
            a.score += 20
            msg = `🔄 @${a.id.split("@")[0]} supera @${b.id.split("@")[0]}!`
        } else {
            let ev = eventi[Math.floor(Math.random() * eventi.length)]
            let p = racers[Math.floor(Math.random() * racers.length)]
            msg = `🎭 @${p.id.split("@")[0]} → ${ev}`
        }

        let top3 = racers.slice(0, 3).map((r, i) => {
            let pos = ["🥇", "🥈", "🥉"][i]
            return `${pos} @${r.id.split("@")[0]}`
        }).join("\n")

        await conn.sendMessage(chat, {
            text: `🏁 GARA LIVE

${msg}

📊 Top 3:
${top3}`,
            mentions: racers.map(r => r.id)
        })

    }, 15000)

    setTimeout(async () => {
        clearInterval(interval)

        racers.sort((a, b) => b.score - a.score)

        let jackpot = racers.length * quota
        let bonus = Math.floor(Math.random() * 1000)
        let totale = jackpot + bonus

        let premi = [
            Math.floor(totale * 0.6),
            Math.floor(totale * 0.25),
            Math.floor(totale * 0.15)
        ]

        racers.slice(0, 3).forEach((r, i) => {
            if (!global.db.data.users[r.id]) global.db.data.users[r.id] = { euro: 0 }
            global.db.data.users[r.id].euro += premi[i] || 0
        })

        await conn.sendMessage(chat, {
            text: `🏁 FINE GARA`,
        })

        setTimeout(async () => {
            let podio = racers.slice(0, 3).map((r, i) => {
                let pos = ["🥇", "🥈", "🥉"][i]
                return `${pos} @${r.id.split("@")[0]}
🚗 ${r.car.name}
💸 ${premi[i]}€`
            }).join("\n\n")

            await conn.sendMessage(chat, {
                text: `🏆 PODIO FINALE

${podio}`,
                mentions: racers.slice(0, 3).map(r => r.id)
            })

            delete global.gare[chat]

        }, 5000)

    }, 90000)
}

handler.command = /^(gara|entragara)$/i
export default handler