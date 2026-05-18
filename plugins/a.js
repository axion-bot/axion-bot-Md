// by deadly

import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import os from 'os'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*⚠️ 𝐑𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌: Inserisci il testo che devo pronunciare.*\n\n*Esempio:* _${usedPrefix}${command} Ciao a tutti_`)

    const tmpDir = os.tmpdir()
    const fileName = `tts_${Date.now()}`
    const inputPath = path.join(tmpDir, fileName)
    const outputPath = path.join(tmpDir, `${fileName}.mp3`)

    try {
        let ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=it&client=tw-ob`
        const response = await fetch(ttsUrl)
        if (!response.ok) throw new Error()

        const arrayBuffer = await response.arrayBuffer()
        fs.writeFileSync(inputPath, Buffer.from(arrayBuffer))

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${inputPath} -vn -ar 44100 -ac 2 -b:a 128k ${outputPath}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            fileName: 'parla.mp3',
            ptt: false
        }, { quoted: m })

    } catch (e) {
        return m.reply('*❌ 𝐑𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌: Impossibile generare l\'audio in questo momento.*')
    } finally {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
    }
}

handler.help = ['parla']
handler.tags = ['group', 'fun']
handler.command = /^(parla|tts)$/i

handler.group = true

export default handler