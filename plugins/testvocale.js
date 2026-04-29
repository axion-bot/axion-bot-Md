// test-vocale.js
// Test vocale PTT diretto da URL

import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

let handler = async (m, { conn }) => {
  const tmpDir = path.join(process.cwd(), 'temp')

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true })
  }

  const stamp = Date.now()
  const audioPath = path.join(tmpDir, `test_${stamp}.mp3`)
  const voicePath = path.join(tmpDir, `test_${stamp}.opus`)

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🎤',
        key: m.key
      }
    })

    const testUrl = 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/test/sample.m4a'

    const response = await axios.get(testUrl, {
      responseType: 'arraybuffer',
      timeout: 20000
    })

    fs.writeFileSync(audioPath, Buffer.from(response.data))

    execSync(
      `ffmpeg -y -i "${audioPath}" -vn -acodec libopus -ar 48000 -ac 1 -b:a 32k -application voip "${voicePath}"`
    )

    await conn.sendMessage(m.chat, {
      audio: { url: voicePath },
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    })

  } catch (e) {
    console.error(e)

    await conn.reply(
      m.chat,
      `*❌ Errore test vocale:*\n\`\`\`${e.message}\`\`\``,
      m
    )
  } finally {
    try { if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath) } catch {}
    try { if (fs.existsSync(voicePath)) fs.unlinkSync(voicePath) } catch {}
  }
}

handler.help = ['testvocale']
handler.tags = ['test']
handler.command = ['testvocale']
handler.owner = true

export default handler