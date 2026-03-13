let handler = async (m, { conn, usedPrefix, command }) => {
    let user = m.sender
    if (!global.db.data.users[user]) global.db.data.users[user] = {}
    let u = global.db.data.users[user]
    if (!u.euro) u.euro = 0
    if (!u.level) u.level = 1
    if (!u.xp) u.xp = 0

    // Lavori
    const jobs = [
        {nome:'🍔 Cameriere', min:50, max:100},
        {nome:'💻 Freelance', min:100, max:200},
        {nome:'🧹 Pulizie', min:30, max:60},
        {nome:'🚗 Corriere', min:80, max:160},
        {nome:'🛠️ Manovale', min:60, max:120}
    ]

    const job = random(jobs)
    let basePaga = randomNum(job.min, job.max)

    // Mini-story eventi
    const events = [
        {txt:`Il cliente ti chiede qualcosa di speciale. Che fai?`, options:['Accetti','Ignori'], bonus:[10,0]},
        {txt:`C'è traffico durante la consegna. Come procedi?`, options:['Forza il passo','Aspetti pazientemente'], bonus:[20,5]},
        {txt:`Trovi un oggetto smarrito. Lo restituisci?`, options:['Sì','No'], bonus:[15,0]},
        {txt:`Un collega ti chiede aiuto. Aiuti?`, options:['Aiuto','Rifiuto'], bonus:[10,0]},
    ]

    let total = basePaga
    await conn.sendMessage(m.chat, { text: `💼 Hai iniziato a lavorare come *${job.nome}*.\nGuadagno base: ${basePaga}€` }, { quoted:m })

    // scegli 2 eventi casuali
    let chosenEvents = shuffle(events).slice(0,2)

    for (let ev of chosenEvents){
        let buttons = ev.options.map((o,i)=>({buttonId:`work_choice_${i}`, buttonText:{displayText:o}, type:1}))
        await conn.sendMessage(m.chat,{
            text: ev.txt,
            buttons,
            headerType:1
        })

        // Attesa risposta con promise
        let choice = await new Promise(resolve => {
            let handlerChoice = async (msg) => {
                if(msg.sender !== user) return
                let id = parseInt(msg.text.replace(/\D/g,''))
                if(isNaN(id)) id = 0
                resolve(id)
                conn.removeListener('message', handlerChoice)
            }
            conn.on('message', handlerChoice)
        })

        total += ev.bonus[choice] || 0
        await conn.sendMessage(m.chat, { text:`Hai scelto: *${ev.options[choice]}*. Guadagno extra: ${ev.bonus[choice] || 0}€` })
    }

    // Aggiorna saldo e XP
    u.euro += total
    let xpGain = randomNum(5,15)
    u.xp += xpGain
    let lvlUp = false
    if(u.xp >= u.level*100){
        u.level += 1
        u.xp = 0
        lvlUp = true
    }

    await conn.sendMessage(m.chat,{ text:
        `✅ Turno completato come *${job.nome}*\n` +
        `💰 Guadagno totale: ${total}€\n` +
        `💶 Saldo attuale: ${u.euro}€\n` +
        `🏅 Livello: ${u.level} (XP: ${u.xp}/${u.level*100})` +
        (lvlUp ? `\n🎉 Complimenti! Sei salito di livello!` : '')
    })
}

handler.command = /^work|lavora$/i
export default handler

// Funzioni helper
function random(arr){ return arr[Math.floor(Math.random()*arr.length)] }
function randomNum(min,max){ return Math.floor(Math.random()*(max-min+1))+min }
function shuffle(arr){ return arr.sort(()=>0.5-Math.random()) }