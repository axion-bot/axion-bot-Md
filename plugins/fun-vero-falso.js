//by Bonzino

const videos = {
  vero: 'https://files.catbox.moe/6zx6x3.mp4',
  falso: 'https://files.catbox.moe/3dnfl0.mp4'
}

let handler = async (m, { conn, text }) => {
  try {
    // ⏳ reazione loading
    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    })

    const isTrue = Math.random() < 0.5
    const video = isTrue ? videos.vero : videos.falso
    const resultText = isTrue ? '*✅ 𝐕: 𝐕𝐄𝐑𝐎*' : '*❌ 𝐕: 𝐅𝐀𝐋𝐒𝐎*'

    //  delay 
    await new Promise(r => setTimeout(r, 1500))

    const caption = text?.trim()
      ? `*🧠 𝐕𝐞𝐫𝐨 𝐨 𝐟𝐚𝐥𝐬𝐨?*\n\n*${text.trim()}*\n\n${resultText}`
      : resultText

    await conn.sendMessage(
      m.chat,
      {
        video: { url: video },
        caption,
        ptv: true
      },
      { quoted: m }
    )

    // reazionr
    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('vof error:', e)
    throw new Error(`❌ 𝐄𝐫𝐫𝐨𝐫𝐞\n\n${e.message || e}`)
  }
}

handler.command = /^(vof|veroofalso|verofalso|veroefalso)$/i
handler.tags = ['giochi']
handler.help = ['vof', 'vof <testo>']

export default handler