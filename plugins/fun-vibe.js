const userMessages = {}

const handler = async (m, { conn, text }) => {

let target =
  m.mentionedJid?.[0] ||
  m.quoted?.sender ||
  m.sender

let msgs = userMessages[target] || []

if (msgs.length === 0) {
return m.reply("Non ho ancora abbastanza messaggi da analizzare.")
}

let score = 0
let polemico = 0
let positivo = 0
let neutro = 0

const negativeWords = ["stupido","idiota","zitto","ma stai","che dici","boh","bah","ridicolo"]
const positiveWords = ["grazie","perfetto","bella","ok","bravo","grande","top","lol"]

msgs.forEach(msg => {

let t = msg.toLowerCase()

if (negativeWords.some(w => t.includes(w))) {
score -= 2
polemico++
}
else if (positiveWords.some(w => t.includes(w))) {
score += 2
positivo++
}
else {
neutro++
}

})

let vibe = "😐 Neutrale"

if (score >= 5) vibe = "✨ Positiva"
if (score <= -5) vibe = "⚠️ Polemica"

let karma = Math.max(-10, Math.min(10, score))

let tag = `@${target.split("@")[0]}`

await conn.sendMessage(m.chat,{
text:`╭───〔 🔎 ANALISI VIBE 〕───╮

👤 Utente: ${tag}

🧠 Vibe rilevata:
${vibe}

⭐ Karma:
${karma}/10

📊 Statistiche messaggi
• Positivi: ${positivo}
• Neutri: ${neutro}
• Polemici: ${polemico}

💡 Suggerimento:
${karma <= -5 ? "L'utente sembra un po' polemico oggi." : "Conversazione normale."}

╰────────────────╯`,
mentions:[target]
})

}

handler.help = ["vibe"]
handler.tags = ["fun"]
handler.command = /^vibe$/i

export default handler



// TRACKER MESSAGGI

export function before(m) {

if (!m.text) return

if (!userMessages[m.sender]) userMessages[m.sender] = []

userMessages[m.sender].push(m.text)

if (userMessages[m.sender].length > 30) {
userMessages[m.sender].shift()
}

}