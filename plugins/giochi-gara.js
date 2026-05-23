let handler = async (m, { conn, command, usedPrefix }) => {

    if (!global.gare) global.gare = {}
    if (!global.db.data.users) global.db.data.users = {}

    const chat = m.chat
    const quota = 150

    const mappe = [
        {
            name: "🌆 Tokyo Drift",
            bonus: "Drift Boost"
        },
        {
            name: "🌧️ Porto Industriale",
            bonus: "Alta difficoltà"
        },
        {
            name: "🛣️ Autostrada Fantasma",
            bonus: "Velocità massima"
        },
        {
            name: "🌉 Ponte Metropolitano",
            bonus: "Nitro Boost"
        },
        {
            name: "🌵 Deserto Nero",
            bonus: "Poca visibilità"
        },
        {
            name: "🏙️ Downtown Chaos",
            bonus: "Traffico intenso"
        }
    ]

    const meteo = [
        "☀️ Sole",
        "🌧️ Pioggia",
        "🌫️ Nebbia",
        "⛈️ Tempesta",
        "❄️ Grandine"
    ]

    const cars = [
        {
            name: "Fiat Panda 🚗",
            speed: 60,
            hp: 120,
            fuel: 100,
            rarity: "Comune",
            passive: "🛠️ Consumo ridotto"
        },
        {
            name: "BMW M4 🔵",
            speed: 88,
            hp: 140,
            fuel: 100,
            rarity: "Rara",
            passive: "💨 Drift perfetto"
        },
        {
            name: "Nissan GTR 🏎️",
            speed: 92,
            hp: 150,
            fuel: 100,
            rarity: "Epica",
            passive: "⚡ Nitro potenziato"
        },
        {
            name: "Tesla Plaid ⚡",
            speed: 95,
            hp: 145,
            fuel: 100,
            rarity: "Epica",
            passive: "🔋 Accelerazione folle"
        },
        {
            name: "Ferrari SF90 🔴",
            speed: 100,
            hp: 170,
            fuel: 100,
            rarity: "Leggendaria",
            passive: "🔥 Dominio assoluto"
        },
        {
            name: "Bugatti Chiron ⚫",
            speed: 110,
            hp: 190,
            fuel: 100,
            rarity: "MITICA",
            passive: "👑 Re della strada"
        }
    ]

    if (command === "gara") {

        if (global.gare[chat])
            return m.reply("🚫 Una gara è già attiva!")

        const mappa = mappe[Math.floor(Math.random() * mappe.length)]
        const clima = meteo[Math.floor(Math.random() * meteo.length)]

        global.gare[chat] = {
            players: [],
            started: false,
            mappa,
            clima
        }

        await conn.sendMessage(chat, {
            text: `
╔══════════🏁══════════╗
      STREET RACE
╚══════════🏁══════════╝

🌍 MAPPA
${mappa.name}

✨ BONUS MAPPA
${mappa.bonus}

🌦️ METEO
${clima}

💸 QUOTA
${quota}€

🚓 Gara clandestina rilevata...

⏳ Partenza tra 30 secondi

👉 ${usedPrefix}entragara
`
        })

        setTimeout(() => {
            startRace(conn, chat, quota)
        }, 30000)
    }

    if (command === "entragara") {

        let gara = global.gare[chat]

        if (!gara)
            return m.reply("❌ Nessuna gara attiva")

        if (gara.started)
            return m.reply("🏁 Gara già iniziata")

        let user = m.sender

        if (!global.db.data.users[user]) {

            global.db.data.users[user] = {
                euro: 1000,
                xp: 0,
                livello: 1,
                rank: "🚗 Rookie"
            }
        }

        let data = global.db.data.users[user]

        if (data.euro < quota)
            return m.reply("💸 Non hai abbastanza soldi!")

        if (gara.players.find(p => p.id === user))
            return m.reply("⚠️ Sei già dentro!")

        data.euro -= quota

        let car = cars[Math.floor(Math.random() * cars.length)]

        gara.players.push({
            id: user,
            car,
            hp: car.hp,
            fuel: car.fuel,
            nitro: 2,
            turbo: 1,
            shield: 1,
            distance: 0,
            drift: 0,
            moneyLoot: 0,
            status: "🔥 Motore acceso",
            eliminated: false,
            arrested: false
        })

        await conn.sendMessage(chat, {
            text: `
🏎️ @${user.split("@")[0]} entra nella gara!

🚗 AUTO
${car.name}

✨ RARITÀ
${car.rarity}

⚙️ PASSIVA
${car.passive}

⛽ Fuel: ${car.fuel}%
🔧 HP: ${car.hp}%

🎖️ Rank:
${data.rank}

🔥 Le strade tremano...
`,
            mentions: [user]
        })
    }
}

async function startRace(conn, chat, quota) {

    const gara = global.gare[chat]

    if (!gara) return

    if (gara.players.length < 2) {

        delete global.gare[chat]

        return conn.sendMessage(chat, {
            text: "❌ Gara annullata"
        })
    }

    gara.started = true

    const eventi = [
        "⚡ attiva il NITRO!",
        "🔥 drift illegale!",
        "🚓 inseguito dalla polizia!",
        "💥 incidente violento!",
        "💨 sorpasso assurdo!",
        "😈 provoca gli avversari!",
        "🛢️ perde il controllo!",
        "🚧 evita traffico!",
        "🔧 cambio perfetto!",
        "👑 domina il rettilineo!",
        "🧨 esplosione vicino alla pista!",
        "🚁 elicottero della polizia sopra la gara!",
        "💰 trova soldi sulla strada!",
        "🎁 trova una lootbox segreta!"
    ]

    await conn.sendMessage(chat, {
        text: `
🚦 PREPARATEVI...

3️⃣
2️⃣
1️⃣

🏁 VIAAAAAAAAAAA!!!
`
    })

    const interval = setInterval(async () => {

        let vivi = gara.players.filter(p => !p.eliminated)

        vivi.forEach(r => {

            let speedBoost = Math.floor(Math.random() * 35)

            if (r.nitro > 0 && Math.random() < 0.15) {

                r.nitro--

                speedBoost += 60

                r.status = "⚡ NITRO MASSIMO!"
            }

            if (r.turbo > 0 && Math.random() < 0.10) {

                r.turbo--

                speedBoost += 90

                r.status = "🔥 TURBO ATTIVATO!"
            }

            r.distance += r.car.speed + speedBoost

            if (Math.random() < 0.15) {

                r.drift += 1

                r.distance += 50

                r.status = "💨 DRIFT PERFETTO!"
            }

            r.fuel -= Math.floor(Math.random() * 10)

            if (Math.random() < 0.30) {

                let evento = eventi[Math.floor(Math.random() * eventi.length)]

                r.status = evento

                if (evento.includes("soldi")) {

                    let found = Math.floor(Math.random() * 1000)

                    r.moneyLoot += found
                }

                if (evento.includes("lootbox")) {

                    r.hp += 20
                    r.fuel += 20
                }

                if (evento.includes("incidente")) {

                    let dmg = Math.floor(Math.random() * 40)

                    if (r.shield > 0) {

                        r.shield--

                        r.status = "🛡️ SCUDO ATTIVATO!"
                    } else {

                        r.hp -= dmg
                    }
                }

                if (evento.includes("polizia")) {

                    if (Math.random() < 0.25) {

                        r.eliminated = true
                        r.arrested = true
                        r.status = "🚓 ARRESTATO"
                    }
                }
            }

            if (r.hp <= 0) {

                r.eliminated = true
                r.status = "💥 AUTO DISTRUTTA"
            }

            if (r.fuel <= 0) {

                r.eliminated = true
                r.status = "⛽ CARBURANTE FINITO"
            }
        })

        vivi = vivi
            .filter(v => !v.eliminated)
            .sort((a, b) => b.distance - a.distance)

        const commenti = [
            "🔥 VELOCITÀ DISUMANE!",
            "🚨 LA POLIZIA STA CHIUDENDO LE STRADE!",
            "😱 INCIDENTI OVUNQUE!",
            "💨 SORPASSI CLAMOROSI!",
            "⚡ NITRO A MANETTA!",
            "🏎️ QUESTA GARA È ILLEGALE!",
            "🚁 ELICOTTERI IN ARRIVO!",
            "💥 CAOS TOTALE!"
        ]

        const hype = commenti[Math.floor(Math.random() * commenti.length)]

        let board = vivi.map((r, i) => {

            let pos = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣"][i] || "🏁"

            let hpBar =
                "🟥".repeat(Math.max(1, Math.floor(r.hp / 20)))

            let fuelBar =
                "🟩".repeat(Math.max(1, Math.floor(r.fuel / 20)))

            return `
${pos} @${r.id.split("@")[0]}

🚗 ${r.car.name}

📍 ${Math.floor(r.distance)}m

🔧 HP
${hpBar}

⛽ FUEL
${fuelBar}

💰 Loot: ${r.moneyLoot}€

🎯 Drift: ${r.drift}

${r.status}
`
        }).join("\n")

        await conn.sendMessage(chat, {
            text: `
🏁 GARA LIVE

${hype}

${board}
`,
            mentions: vivi.map(v => v.id)
        })

    }, 10000)

    setTimeout(async () => {

        clearInterval(interval)

        let finali = gara.players
            .filter(p => !p.eliminated)
            .sort((a, b) => b.distance - a.distance)

        if (finali.length < 1) {

            delete global.gare[chat]

            return conn.sendMessage(chat, {
                text: `
💀 NESSUN SOPRAVVISSUTO

🚓 La polizia ha fermato tutti...
`
            })
        }

        let jackpot = quota * gara.players.length
        let bonus = Math.floor(Math.random() * 10000)

        let totale = jackpot + bonus

        let premi = [
            Math.floor(totale * 0.60),
            Math.floor(totale * 0.25),
            Math.floor(totale * 0.15)
        ]

        finali.slice(0, 3).forEach((r, i) => {

            let user = global.db.data.users[r.id]

            user.euro += premi[i] + r.moneyLoot
            user.xp += 100 * (3 - i)

            if (user.xp >= 500)
                user.rank = "🔥 Street Racer"

            if (user.xp >= 1500)
                user.rank = "👑 Underground King"

            if (user.xp >= 3000)
                user.rank = "☠️ STREET GOD"
        })

        let mvp = [...finali]
            .sort((a, b) => b.drift - a.drift)[0]

        let podio = finali.slice(0, 3).map((r, i) => {

            let pos = ["🥇", "🥈", "🥉"][i]

            let user = global.db.data.users[r.id]

            return `
${pos} @${r.id.split("@")[0]}

🚗 ${r.car.name}
📍 ${Math.floor(r.distance)}m

💸 Premio:
${premi[i]}€

🎖️ Rank:
${user.rank}

🎯 Drift:
${r.drift}
`
        }).join("\n")

        await conn.sendMessage(chat, {
            text: `
╔════════🏆════════╗
      FINE GARA
╚════════🏆════════╝

${podio}

👑 MVP DELLA GARA
@${mvp.id.split("@")[0]}

💨 Drift totali:
${mvp.drift}

💰 Jackpot:
${totale}€

🚓 Le sirene si avvicinano...

🔥 Le strade ricorderanno questa notte.
`,
            mentions: finali.map(f => f.id)
        })

        delete global.gare[chat]

    }, 90000)
}

handler.command = /^(gara|entragara)$/i

export default handler