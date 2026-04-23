// by Bonzino

import { tmpdir } from 'os'
import { join } from 'path'
import { promises as fs } from 'fs'
import { spawn } from 'child_process'

const BIN_CACHE = new Map()

function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      windowsHide: true,
      shell: false
    })

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

async function resolveBinary(name, candidates, probeArgs = ['-version']) {
  if (BIN_CACHE.has(name)) return BIN_CACHE.get(name)

  let lastError

  for (const cmd of candidates) {
    try {
      await run(cmd, probeArgs)
      BIN_CACHE.set(name, cmd)
      return cmd
    } catch (e) {
      lastError = e
    }
  }

  throw lastError || new Error(`Binario non trovato: ${name}`)
}

async function getDwebp() {
  return resolveBinary('dwebp', ['dwebp'])
}

async function getFfmpeg() {
  return resolveBinary('ffmpeg', ['ffmpeg'])
}

async function getMagickOrConvert() {
  try {
    return await resolveBinary('magick', ['magick'])
  } catch {}

  if (process.platform !== 'win32') {
    return resolveBinary('convert', ['convert'])
  }

  throw new Error('ImageMagick non trovato')
}

async function webpToPng(input, output) {
  const dwebp = await getDwebp()

  try {
    await run(dwebp, [input, '-o', output])
    return { usedFallback: false }
  } catch (e) {
    const msg = String(e?.message || e || '')
    if (!/animated webp|unsupported_feature|animated/i.test(msg)) {
      throw e
    }
  }

  const magick = await getMagickOrConvert()
  await run(magick, [`${input}[0]`, output])

  return { usedFallback: true }
}

async function webpToGif(input, output) {
  const bin = await getMagickOrConvert()
  await run(bin, [input, output])
}

async function gifToMp4(input, output) {
  const ffmpeg = await getFfmpeg()

  await run(ffmpeg, [
    '-y',
    '-i', input,
    '-movflags', 'faststart',
    '-pix_fmt', 'yuv420p',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-an',
    output
  ])
}

function getQuotedStickerInfo(q) {
  const msg = q?.msg || q || {}
  const mime = msg.mimetype || ''
  const isAnimated =
    !!msg.isAnimated ||
    !!q?.isAnimated ||
    !!q?.message?.stickerMessage?.isAnimated

  return { mime, isAnimated }
}

function getInstallHint() {
  if (process.platform === 'win32') {
    return 'Installa dwebp/libwebp, ffmpeg e ImageMagick e aggiungili al PATH.'
  }

  return 'Installa dwebp (libwebp), ffmpeg e ImageMagick e aggiungili al PATH.'
}

let handler = async (m, { conn, command }) => {
  let inputPath
  let outputPath
  let gifPath

  const react = async emoji => {
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: emoji,
          key: m.key
        }
      })
    } catch {}
  }

  try {
    const q = m.quoted ? m.quoted : null
    const { mime, isAnimated } = getQuotedStickerInfo(q)

    if (!q || !/webp/i.test(mime)) {
      await react('⚠️')
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*'
      }, { quoted: m })
    }

    await react('⏳')

    const media = await q.download()

    if (!media) {
      await react('❌')
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐥𝐞𝐭𝐭𝐮𝐫𝐚 𝐝𝐞𝐥𝐥𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*'
      }, { quoted: m })
    }

    const base = `sticker_${Date.now()}_${Math.floor(Math.random() * 99999)}`
    inputPath = join(tmpdir(), `${base}.webp`)
    await fs.writeFile(inputPath, media)

    if (/^(toimg|img)$/i.test(command)) {
      outputPath = join(tmpdir(), `${base}.png`)

      try {
        const { usedFallback } = await webpToPng(inputPath, outputPath)
        const pngBuffer = await fs.readFile(outputPath)

        await react(usedFallback ? '⚠️' : '✅')

        await conn.sendMessage(m.chat, {
          image: pngBuffer,
          caption: usedFallback
            ? '*𝐜𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚 ✅*\n
            : '*𝐜𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚 ✅*',
          contextInfo: {
            ...(global.rcanal?.contextInfo || {})
          }
        }, { quoted: m })

        return
      } catch (e) {
        if (isAnimated) {
          await react('⚠️')
          return conn.sendMessage(m.chat, {
            text: '*⚠️ 𝐐𝐮𝐞𝐬𝐭𝐨 è 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐚𝐧𝐢𝐦𝐚𝐭𝐨. 𝐔𝐬𝐚 `.togif` 𝐨 `.gif`.*'
          }, { quoted: m })
        }
        throw e
      }
    }

    if (/^(togif|gif)$/i.test(command)) {
      if (!isAnimated) {
        await react('⚠️')
        return conn.sendMessage(m.chat, {
          text: '*⚠️ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐧𝐨𝐧 è 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐚𝐧𝐢𝐦𝐚𝐭𝐨. 𝐔𝐬𝐚 `.toimg` 𝐨 `.img`.*'
        }, { quoted: m })
      }

      gifPath = join(tmpdir(), `${base}.gif`)
      outputPath = join(tmpdir(), `${base}.mp4`)

      await webpToGif(inputPath, gifPath)
      await gifToMp4(gifPath, outputPath)

      const mp4Buffer = await fs.readFile(outputPath)

      await react('✅')

      await conn.sendMessage(m.chat, {
        video: mp4Buffer,
        gifPlayback: true,
        caption: '*𝐜𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚 ✅*',
        contextInfo: {
          ...(global.rcanal?.contextInfo || {})
        }
      }, { quoted: m })

      return
    }

  } catch (e) {
    console.error('Errore conversione sticker:', e)

    const rawErr = String(e?.message || e || '')
    const extraHint =
      /not found|enoent|imagemagick|ffmpeg|dwebp/i.test(rawErr)
        ? `\n\n*💡 ${getInstallHint()}*`
        : ''

    const err = rawErr.split('\n').slice(-10).join('\n').slice(0, 1000)

    await react('❌')

    await conn.sendMessage(m.chat, {
      text: `*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐜𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞.*\n\n\`\`\`${err || 'Errore sconosciuto'}\`\`\`${extraHint}`
    }, { quoted: m })
  } finally {
    try {
      if (inputPath) await fs.unlink(inputPath)
      if (gifPath) await fs.unlink(gifPath)
      if (outputPath) await fs.unlink(outputPath)
    } catch {}
  }
}

handler.help = ['toimg', 'img', 'togif', 'gif']
handler.tags = ['sticker']
handler.command = /^(toimg|img|togif|gif)$/i

export default handler