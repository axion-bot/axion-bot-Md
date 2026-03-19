//Plugin fatto da Luxifer
let handler = async () => {}

handler.before = async function (m, { conn }) {
  try {
    if (!m.message) return
    if (m.isBaileys) return
    if (m.fromMe) return
    if (!m.isGroup) return

    const botJid = conn.user?.jid
    if (!botJid) return

    const textRaw = (m.text || "").trim()
    if (!textRaw) return

    // ✅ prende il prefisso dal messaggio (di solito ".")
    const prefix = getPrefix(textRaw) || "."

    // ✅ menzione robusta
    const mentioned = getMentionedJids(m)
    const isMentioned = mentioned.includes(botJid)
    if (!isMentioned) return

    const text = textRaw.toLowerCase()
    const wantIntro =
      text.includes("presentati") ||
      text.includes("chi sei") ||
      text.includes("info") ||
      text.includes("funzioni") ||
      text.includes("comandi")

    if (!wantIntro) return

    const botName = global.db?.data?.nomedelbot || "𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓"

    // ✍️ Modifica qui le funzioni reali del tuo bot
    const features = [
      `📋 Menu: *${prefix} *`,
    ]

    const introText = `
⟦ 𝐈𝐍𝐅𝐎 𝐁𝐎𝐓 ⟧

👋 Ciao! Sono *${botName}* 🤖
Sono un bot per gruppi WhatsApp:  offro una maggiore sicurezza al gruppo e a intrattenere la chat

📌  Premi il bottone sotto e ti fornirò tutti i miei comandi. 
`.trim()

    await conn.sendMessage(m.chat, {
      text: introText,
      footer: "PRESENTAZIONE 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓",
      buttons: [
        { buttonId: `${prefix}menu`, buttonText: { displayText: "📋 𝐌𝐞𝐧𝐮" }, type: 1 },
      ],
      headerType: 1
    }, { quoted: m })

  } catch (e) {
    console.error("Errore presentazione:", e)
  }
}

function getPrefix(text) {
  // prende il primo carattere se è un prefisso classico
  const c = (text || "")[0]
  if ([".", "!", "/", "#"].includes(c)) return c
  return null
}

function getMentionedJids(m) {
  const a = m.mentionedJid || []
  const b = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
  return [...new Set([...a, ...b])]
}

export default handler