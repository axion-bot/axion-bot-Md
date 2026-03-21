import os from 'os'
import { performance } from 'perf_hooks'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const uptimeMs = process.uptime() * 1000
    const uptimeStr = clockString(uptimeMs)

    const startTime = performance.now()
    const endTime = performance.now()
    const speed = (endTime - startTime).toFixed(4)

    const botName = "𝐀𝐗𝐈𝐎𝐍 𝐁𝐎𝐓"

    const textMsg = `⟦ 𝙿𝙸𝙽𝙶·𝙱𝙾𝚃 ⟧
│
├─ 🕒 𝚄𝙿𝚃𝙸𝙼𝙴  : ${uptimeStr}
└─ ⚡ 𝙿𝙸𝙽𝙶    : ${speed} ms`

    await conn.sendMessage(m.chat, {
      text: textMsg,
      footer: "𝑷𝑰𝑵𝑮 𝑩𝒀 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓",
      buttons: [
        { buttonId: usedPrefix + "pingm", buttonText: { displayText: "📡 𝐑𝐢𝐟𝐚𝐢 𝐩𝐢𝐧𝐠" }, type: 1 }
      ],
      headerType: 1,

      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: botName,
          body: "𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓",
          sourceUrl: "https://whatsapp.com/channel/0029Vb8MQ3U1CYoMEtU1832d",
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false
        }
      }

    }, { quoted: m })

  } catch (err) {
    console.error("Errore nell'handler:", err)
  }
}

function clockString(ms) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [d, h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(pingm)$/i
handler.premium = false

export default handler