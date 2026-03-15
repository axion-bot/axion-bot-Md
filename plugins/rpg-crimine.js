let handler = async (m, { conn, usedPrefix, command, args }) => {
    let user = m.sender
    if (!global.db.data.users[user]) global.db.data.users[user] = { euro: 0, lastCrime: 0, isJailed: false, jailTime: 0 }
    let u = global.db.data.users[user]

    const cauzionePrezzo = 5000 // Prezzo per uscire subito

    // --- CONTROLLO STATO PRIGIONE ---
    if (u.isJailed && command !== 'evadi' && command !== 'cauzione') {
        let tempoRimanente = u.jailTime - new Date()
        if (tempoRimanente > 0) {
            let minuti = Math.ceil(tempoRimanente / 60000)
            return conn.reply(m.chat, `🔒 *SEI IN CELLA!* 🔒\nTi restano ancora *${minuti} minuti*.\n\nUsa i bottoni dell'ultimo messaggio per tentare l'evasione o pagare la cauzione!`, m)
        } else {
            u.isJailed = false 
            u.jailTime = 0
        }
    }

    // --- LOGICA 💰 CAUZIONE ---
    if (command === 'cauzione') {
        if (!u.isJailed) return m.reply("Libero come un fringuello! Non hai bisogno di cauzioni.")
        if (u.euro < cauzionePrezzo) return m.reply(`❌ Non hai abbastanza soldi! La cauzione costa **${cauzionePrezzo}€**, tu hai solo **${u.euro}€**.`)

        u.euro -= cauzionePrezzo
        u.isJailed = false
        u.jailTime = 0
        return m.reply(`⚖️ *LIBERTÀ ACQUISTATA!*\nHai pagato **${cauzionePrezzo}€** agli avvocati e sei uscito pulito. Non farti beccare di nuovo!`)
    }

    // --- LOGICA 🏃‍♂️ EVASIONE ---
    if (command === 'evadi') {
        if (!u.isJailed) return 
        const successoEvasione = Math.random() < 0.3 
        if (successoEvasione) {
            u.isJailed = false
            u.jailTime = 0
            return m.reply("🏃‍♂️💨 *COLPO DI GENIO!* Sei scappato dalle fogne. Sei di nuovo libero!")
        } else {
            u.jailTime += 600000 // Aggiunge 10 minuti
            return m.reply("👮‍♂️ *PRESO!* Le guardie ti hanno randellato. Altri 10 minuti di isolamento aggiunti!")
        }
    }

    // --- CONFIGURAZIONE CRIMINI ---
    const crimes = [
        { name: "Rapina in banca 🏦", rate: 0.35, reward: [1500, 3000] },
        { name: "Furto in villa 🏠", rate: 0.50, reward: [600, 1200] },
        { name: "Scippo 💨", rate: 0.75, reward: [150, 400] }
    ]

    const crime = crimes[Math.floor(Math.random() * crimes.length)]
    const success = Math.random() < crime.rate
    const amount = Math.floor(Math.random() * (crime.reward[1] - crime.reward[0] + 1)) + crime.reward[0]

    if (success) {
        u.euro += amount
        await conn.sendMessage(m.chat, {
            text: `🕶️ *MISSIONE COMPIUTA!*\nHai fatto: ${crime.name}\n💶 Bottino: +${amount}€\n💰 Saldo: ${u.euro}€`,
            buttons: [{ buttonId: `${usedPrefix}crimine`, buttonText: { displayText: '🔁 Altro colpo' }, type: 1 }],
            headerType: 1
        }, { quoted: m })
    } else {
        // --- ARRESTO ---
        u.isJailed = true
        u.jailTime = new Date() * 1 + 300000 // 5 Minuti

        const txtFail = `🚔 *MANETTE AI POLSI!*\nIl colpo "${crime.name}" è fallito miseramente.\n\n⏳ *Pena:* 5 Minuti di cella\n💰 *Cauzione:* ${cauzionePrezzo}€`

        const jailButtons = [
            { buttonId: `${usedPrefix}evadi`, buttonText: { displayText: '🏃‍♂️ Tenta Evasione (30%)' }, type: 1 },
            { buttonId: `${usedPrefix}cauzione`, buttonText: { displayText: `⚖️ Paga Cauzione (${cauzionePrezzo}€)` }, type: 1 }
        ]

        await conn.sendMessage(m.chat, {
            text: txtFail,
            buttons: jailButtons,
            headerType: 1
        }, { quoted: m })
    }
}

handler.command = /^(crimine|evadi|cauzione)$/i
export default handler