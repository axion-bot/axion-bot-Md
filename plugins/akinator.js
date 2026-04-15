
import fs from "fs"
import path from "path"
import akinator from "akinatorjs"

const sessions = new Map()

let handler = async (m, { conn }) => {
  const chatId = m.chat

  // Existing text response during a session
  if (sessions.has(chatId) && !m.text.toLowerCase().startsWith(".akinator")) {
    const session = sessions.get(chatId)
    const answer = m.text.trim().toLowerCase()
    const res = await session.ask(answer)
    if (res.done) {
      await conn.sendMessage(
        chatId,
        {
          text: `Penso che tu pensassi a ${res.answer} con ${res.rate}% di probabilità.`,
        },
      )
      sessions.delete(chatId)
    } else {
      await conn.sendMessage(
        chatId,
        {
          text: `Domanda: ${res.question}\nRispondi:\n${res.answers
            .map((a, i) => `${i + 1}. ${a}`)
            .join("\n")}`,
        },
      )
    }
    return
  }

  // Start a new Akinator game
  if (!m.text.toLowerCase().includes(".akinator")) return

  const akin = new Akinator()
  await akin.start()
  const first = await akin.question
  await conn.sendMessage(
    chatId,
    {
      text: `Domanda: ${first.question}\nRispondi:\n${first.answers
        .map((a, i) => `${i + 1}. ${a}`)
        .join("\n")}`,
    },
  )
  sessions.set(chatId, akin)
}

handler.help = ["akinator"]
handler.tags = ["fun"]
handler.command = ["akinator"]

export default handler