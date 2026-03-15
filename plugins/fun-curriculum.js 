// Plugin fatto da deadly

global.curriculumGame = global.curriculumGame || {}

const random = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// 📝 LISTE
const lavori = [
    { nome: "Web Developer", desc: "💻 Crea siti e applicazioni web", paga: 2500 },
    { nome: "Data Scientist", desc: "📊 Analizza dati e crea insight", paga: 3000 },
    { nome: "Graphic Designer", desc: "🎨 Disegna loghi e grafiche", paga: 1800 },
    { nome: "Marketing Specialist", desc: "📈 Promuove brand e prodotti", paga: 2100 },
    { nome: "Social Media Manager", desc: "📱 Gestisce profili e community", paga: 1600 },
    { nome: "AI Engineer", desc: "🤖 Sviluppa algoritmi e AI", paga: 3500 },
    { nome: "Game Designer", desc: "🎮 Crea giochi e mondi virtuali", paga: 2200 }
]

const aziende = ["Google", "Meta", "Amazon", "Tesla", "OpenAI", "Microsoft", "Netflix", "Startup Innovativa SRL"]
const studi = ["Laurea in Informatica", "Laurea in Economia", "Diploma Tecnico Informatico", "Master in Marketing Digitale", "Laurea in Ingegneria"]

const jobButtons = (prefix) => [
    { buttonId: `${prefix}curriculum`, buttonText: { displayText: '📄 Rigenera Curriculum' }, type: 1 },
    { buttonId: `${prefix}cercalavoro`, buttonText: { displayText: '💼 Cerca Lavoro' }, type: 1 }
];

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const chat = m.chat
    const user = m.sender

    // Inizializza sessione se non esiste
    global.curriculumGame[chat] = global.curriculumGame[chat] || {}

    // --- COMANDO CERCA LAVORO ---
    if (command === 'cercalavoro') {
        let listaProposte = []
        let reply = '💼 *OFFERTE DI LAVORO DISPONIBILI*\n\n'
        reply += '_Rispondi con il numero (es. 1) per accettare!_\n\n'

        let used = new Set()
        while (used.size < 5) {
            let job = random(lavori)
            if (!used.has(job.nome)) {
                used.add(job.nome)
                listaProposte.push(job)
                reply += `*${used.size}.* ${job.nome}\n`
                reply += `   └ ${job.desc}\n`
                reply += `   💰 Stipendio: *${job.paga}€*\n\n`
            }
        }

        // Salviamo le proposte correnti per questa chat/utente
        global.curriculumGame[chat][user] = { proposte: listaProposte, timestamp: Date.now() }

        return await conn.sendMessage(chat, {
            text: reply,
            footer: 'Scrivi un numero o usa i bottoni',
            buttons: jobButtons(usedPrefix),
            headerType: 1
        }, { quoted: m })
    }

    // --- COMANDO CURRICULUM (Generico) ---
    const nome = await conn.getName(user)
    const lavoro = random(lavori).nome
    const azienda = random(aziende)
    const studio = random(studi)
    const esperienza = randomNum(1, 15)

    const cvText = `📄 *CURRICULUM VITAE*
👤 *Candidato*: ${nome}
💼 *Ruolo attuale*: ${lavoro}
🏢 *Azienda*: ${azienda}
📅 *Esperienza*: ${esperienza} anni
🎓 *Formazione*: ${studio}

> 𝐍𝚵𝑿𝐒𝐔𝐒 𝚩𝚯𝐓`

    await conn.sendMessage(chat, {
        text: cvText,
        buttons: jobButtons(usedPrefix),
        headerType: 1
    }, { quoted: m })
}

// --- LOGICA DI RISPOSTA AL NUMERO (BEFORE) ---
handler.before = async (m, { conn, usedPrefix }) => {
    const chat = m.chat
    const user = m.sender

    // Controlliamo se l'utente ha una ricerca attiva
    if (!global.curriculumGame?.[chat]?.[user]) return

    const session = global.curriculumGame[chat][user]
    const input = m.text?.trim()

    // Se l'input è un numero tra 1 e la lunghezza delle proposte
    if (/^[1-5]$/.test(input)) {
        const scelta = session.proposte[parseInt(input) - 1]
        const nomeUser = await conn.getName(user)

        // Ricordiamo il fatto dei passi richiesto nelle istruzioni!
        const kmMessaggio = `\n\n🚶 *Speriamo che non vieni licenziato 😅`

        const conferma = `🥳 *CONGRATULAZIONI ${nomeUser.toUpperCase()}!*\n\n` +
            `Hai accettato il lavoro come *${scelta.nome}*.\n` +
            `Preparati, inizierai domani mattina presso la tua nuova sede!\n\n` +
            `💶 Stipendio pattuito: *${scelta.paga}€/mese*` + 
            kmMessaggio

        await conn.reply(chat, conferma, m)

        // Puliamo la sessione dopo l'assunzione
        delete global.curriculumGame[chat][user]
    }
}

handler.help = ['curriculum', 'cercalavoro']
handler.tags = ['fun']
handler.command = /^(curriculum|cercalavoro)$/i

export default handler