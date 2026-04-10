// by Bonzino

import { tmpdir } from 'os'
import { join } from 'path'
import { promises as fs } from 'fs'
import { spawn } from 'child_process'

// piccola utility per convertire gli sticker nei formati desiderati.
function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args)

    let stdout = ''
    let stderr = ''

    p.stdout.on('data', d => stdout += d.toString())
    p.stderr.on('data', d => stderr += d.toString())

    p.on('error', reject)

    p.on('close', code => {
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(stderr || stdout || `Errore eseguendo ${cmd}`))
    })
  })
}

// converte sticker normale in PNG.
async function webpToPng(input, output) {
  await run('ffmpeg', [
    '-y',
    '-i', input,
    '-frames:v', '1',
    output
  ])
}

// converte sticker animato in MP4.
async function webpToMp4(input, output) {
  await run('ffmpeg', [
    '-y',
    '-i', input,
    '-movflags', 'faststart',
    '-pix_fmt', 'yuv420p',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    output
  ])
}

// controlla dai metadati se lo sticker è animato.
function getQuotedStickerInfo(q) {
  const msg = q?.msg || q || {}
  const mime = msg.mimetype || ''
  const isAnimated =
    !!msg.isAnimated ||
    !!q?.isAnimated ||
    !!q?.message?.stickerMessage?.isAnimated

  return { mime, isAnimated }
}

let handler = async (m, { conn, command }) => {
  let inputPath
  let outputPath

  try {
    // prende il messaggio quotato
    const q = m.quoted ? m.quoted : null
    const { mime, isAnimated } = getQuotedStickerInfo(q)

    // verifica che sia uno sticker
    if (!q || !/webp/i.test(mime)) {
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*'
      }, { quoted: m })
    }

    // scarica sticker
    const media = await q.download()

    if (!media) {
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐥𝐞𝐭𝐭𝐮𝐫𝐚 𝐝𝐞𝐥𝐥𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*'
      }, { quoted: m })
    }

    // crea file temporaneo
    const base = `toimg_${Date.now()}_${Math.floor(Math.random() * 99999)}`
    inputPath = join(tmpdir(), `${base}.webp`)

    await fs.writeFile(inputPath, media)

    // comandi per sticker statici
    if (/^(toimg|img)$/i.test(command)) {
      if (isAnimated) {
        return conn.sendMessage(m.chat, {
          text: '*⚠️ 𝐐𝐮𝐞𝐬𝐭𝐨 è 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐚𝐧𝐢𝐦𝐚𝐭𝐨. 𝐔𝐬𝐚 `.togif` 𝐨 `.gif`.*'
        }, { quoted: m })
      }

      outputPath = join(tmpdir(), `${base}.png`)
      await webpToPng(inputPath, outputPath)

      const pngBuffer = await fs.readFile(outputPath)

      await conn.sendMessage(m.chat, {
        image: pngBuffer,
        caption:
`*╭━━━━━━━🖼️━━━━━━━╮*
*✦ 𝐂𝐎𝐍𝐕𝐄𝐑𝐒𝐈𝐎𝐍𝐄 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐀 ✦*
*╰━━━━━━━🖼️━━━━━━━╯*`,
        contextInfo: {
          ...(global.rcanal?.contextInfo || {})
        }
      }, { quoted: m })

      return
    }

    // comandi per sticker animati
    if (/^(togif|gif)$/i.test(command)) {
      if (!isAnimated) {
        return conn.sendMessage(m.chat, {
          text: '*⚠️ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐧𝐨𝐧 è 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐚𝐧𝐢𝐦𝐚𝐭𝐨. 𝐔𝐬𝐚 `.toimg` 𝐨 `.img`.*'
        }, { quoted: m })
      }

      outputPath = join(tmpdir(), `${base}.mp4`)
      await webpToMp4(inputPath, outputPath)

      const mp4Buffer = await fs.readFile(outputPath)

      await conn.sendMessage(m.chat, {
        video: mp4Buffer,
        gifPlayback: true,
        caption:
`*╭━━━━━━━🎞️━━━━━━━╮*
*✦ 𝐂𝐎𝐍𝐕𝐄𝐑𝐒𝐈𝐎𝐍𝐄 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐀 ✦*
*╰━━━━━━━🎞️━━━━━━━╯*`,
        contextInfo: {
          ...(global.rcanal?.contextInfo || {})
        }
      }, { quoted: m })

      return
    }

  } catch (e) {
    console.error('Errore conversione sticker:', e)

    await conn.sendMessage(m.chat, {
      text: '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐜𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞.*'
    }, { quoted: m })

  } finally {
    // elimina i file temporanei
    try {
      if (inputPath) await fs.unlink(inputPath)
      if (outputPath) await fs.unlink(outputPath)
    } catch {}
  }
}

handler.help = ['toimg', 'img', 'togif', 'gif']
handler.tags = ['sticker']
handler.command = /^(toimg|img|togif|gif)$/i

export default handler