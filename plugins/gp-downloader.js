//by Bonzino

import fs from 'fs'
import path from 'path'
import os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

function isValidUrl(text) {
  try {
    const url = new URL(text)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

async function hasBinary(bin) {
  try {
    await execFileAsync(bin, ['--version'], { timeout: 10000 })
    return true
  } catch {
    return false
  }
}

async function downloadVideo(url, tmpDir) {
  const output = path.join(tmpDir, 'video.%(ext)s')

  await execFileAsync('yt-dlp', [
    '--no-playlist',
    '--no-warnings',
    '-f', 'bv*+ba/b',
    '--merge-output-format', 'mp4',
    '-o', output,
    url
  ], {
    timeout: 180000,
    maxBuffer: 1024 * 1024 * 10
  })

  const file = fs.readdirSync(tmpDir).find(f => f.endsWith('.mp4'))
  if (!file) throw new Error('Video non trovato.')
  return path.join(tmpDir, file)
}

async function downloadAudio(url, tmpDir) {
  const output = path.join(tmpDir, 'audio.%(ext)s')

  await execFileAsync('yt-dlp', [
    '--no-playlist',
    '--no-warnings',
    '-f', 'bestaudio',
    '--extract-audio',
    '--audio-format', 'mp3',
    '--audio-quality', '0',
    '-o', output,
    url
  ], {
    timeout: 180000,
    maxBuffer: 1024 * 1024 * 10
  })

  const file = fs.readdirSync(tmpDir).find(f => f.endsWith('.mp3'))
  if (!file) throw new Error('Audio non trovato.')
  return path.join(tmpDir, file)
}

let handler = async (m, { conn, args, usedPrefix }) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-'))

  try {
    const mode = (args[0] || '').toLowerCase()
    const url = (mode === 'audio' || mode === 'video') ? args[1] : args[0]

    if (!url) {
      return m.reply('*⚠️ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐥𝐢𝐧𝐤.*')
    }

    if (!isValidUrl(url)) {
      return m.reply('*⚠️ 𝐋𝐢𝐧𝐤 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.*')
    }

    const hasYtDlp = await hasBinary('yt-dlp')
    if (!hasYtDlp) {
      return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* yt-dlp non installato.')
    }

    if (mode !== 'audio' && mode !== 'video') {
      return conn.sendMessage(m.chat, {
        text: `*✅ 𝐒𝐂𝐄𝐆𝐋𝐈 𝐈𝐋 𝐅𝐎𝐑𝐌𝐀𝐓𝐎*\n\n🔗 ${url}`,
        footer: '',
        buttons: [
          {
            buttonId: `${usedPrefix}download video ${url}`,
            buttonText: { displayText: '🎬 𝐕𝐈𝐃𝐄𝐎' },
            type: 1
          },
          {
            buttonId: `${usedPrefix}download audio ${url}`,
            buttonText: { displayText: '🎧 𝐀𝐔𝐃𝐈𝐎' },
            type: 1
          }
        ],
        headerType: 1
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    })

    let filePath

    if (mode === 'audio') {
      filePath = await downloadAudio(url, tmpDir)

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3'
      }, { quoted: m })
    }

    if (mode === 'video') {
      filePath = await downloadVideo(url, tmpDir)

      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(filePath),
        mimetype: 'video/mp4',
        fileName: 'video.mp4',
        caption: '*✅ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐎*'
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('download error:', e)
    return m.reply(`*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* ${e.message || e}`)
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch {}
  }
}

handler.command = /^(download|dw)$/i
handler.tags = ['download']
handler.help = ['download', 'dw']

export default handler