// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import { sticker } from '../lib/sticker.js'
import { tmpdir } from 'os'
import { join } from 'path'
import { promises as fs } from 'fs'
import { spawn } from 'child_process'

const S = v => String(v || '')
const MAX_STICKER_SIZE = 1024 * 1024

async function react(m, emoji) {
  try { await m.react(emoji) } catch {}
}

function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args)

    let stderr = ''
    p.stderr.on('data', d => stderr += d.toString())

    p.on('error', reject)

    p.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(stderr || `Errore eseguendo ${cmd}`))
    })
  })
}

async function compressAnimatedSticker(inputBuffer) {
  const base = `sticker_${Date.now()}_${Math.floor(Math.random() * 99999)}`
  const input = join(tmpdir(), `${base}_input`)
  const output = join(tmpdir(), `${base}_output.webp`)

  const attempts = [
    { fps: 10, q: 55, t: 6 },
    { fps: 8, q: 45, t: 5 },
    { fps: 7, q: 38, t: 4 },
    { fps: 6, q: 32, t: 3 }
  ]

  try {
    await fs.writeFile(input, inputBuffer)

    for (const opt of attempts) {
      try {
        await run('ffmpeg', [
          '-y',
          '-i', input,
          '-t', String(opt.t),
          '-vf',
          `fps=${opt.fps},scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=0x00000000`,
          '-loop', '0',
          '-an',
          '-vcodec', 'libwebp',
          '-lossless', '0',
          '-compression_level', '6',
          '-q:v', String(opt.q),
          output
        ])

        const result = await fs.readFile(output)

        if (result.length <= MAX_STICKER_SIZE) {
          return result
        }
      } catch {}
    }

    return await fs.readFile(output).catch(() => null)
  } finally {
    await fs.unlink(input).catch(() => {})
    await fs.unlink(output).catch(() => {})
  }
}

let handler = async (m, { conn, text }) => {
  try {
    await react(m, '⏳')

    let q = m.quoted ? m.quoted : m
    let msg = q.msg || q
    let mime = msg.mimetype || ''

    if (!/image|video|webp/.test(mime)) {
      await react(m, '⚠️')
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧’𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞, 𝐯𝐢𝐝𝐞𝐨 𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*'
      }, { quoted: m })
    }

    let nomeUtente = 'Utente'
    try {
      nomeUtente = await conn.getName(m.sender)
    } catch {}

    let packname = nomeUtente
    let author = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

    if (S(text).trim()) {
      if (text.includes('|')) {
        let [customPack, ...customAuthor] = text.split('|')
        packname = S(customPack).trim() || nomeUtente
        author = S(customAuthor.join('|')).trim() || author
      } else {
        packname = S(text).trim()
        author = ''
      }
    }

    let media = await q.download()

    if (!media) {
      await react(m, '❌')
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐈𝐦𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞 𝐬𝐜𝐚𝐫𝐢𝐜𝐚𝐫𝐞 𝐢𝐥 𝐦𝐞𝐝𝐢𝐚.*'
      }, { quoted: m })
    }

    let stiker = await sticker(media, false, packname, author)

    if (!stiker) {
      await react(m, '❌')
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐂𝐫𝐞𝐚𝐳𝐢𝐨𝐧𝐞 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐧𝐨𝐧 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐚.*'
      }, { quoted: m })
    }

    if (Buffer.isBuffer(stiker) && stiker.length > MAX_STICKER_SIZE) {
      await react(m, '🗜️')

      const compressed = await compressAnimatedSticker(media)

      if (compressed && compressed.length <= MAX_STICKER_SIZE) {
        stiker = compressed
      } else if (compressed) {
        stiker = compressed
      } else {
        await react(m, '❌')
        return conn.sendMessage(m.chat, {
          text: '*⚠️ 𝐍𝐨𝐧 𝐬𝐨𝐧𝐨 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐜𝐨𝐦𝐩𝐫𝐢𝐦𝐞𝐫𝐞 𝐥𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*'
        }, { quoted: m })
      }
    }

    await conn.sendMessage(m.chat, {
      sticker: stiker
    }, { quoted: m })

    await react(m, '✅')

  } catch (e) {
    console.error('Errore sticker.js:', e)
    await react(m, '❌')

    await conn.sendMessage(m.chat, {
      text: `*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐜𝐫𝐞𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥𝐥𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*\n\n\`\`\`${S(e?.message || e).slice(0, 800)}\`\`\``
    }, { quoted: m })
  }
}

handler.help = ['s', 's <nome>', 's <pack|autore>', 'sticker', 'stiker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler