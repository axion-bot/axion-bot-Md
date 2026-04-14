//by Bonzino

import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
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

async function tiktokFallback(url) {
  const { data } = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, {
    timeout: 30000
  })

  const videoUrl = data?.video?.noWatermark || data?.video?.watermark || data?.video
  const audioUrl = data?.music || data?.audio

  return { videoUrl, audioUrl }
}

async function saveStreamToFile(url, filePath) {
  const res = await axios.get(url, {
    responseType: 'stream',
    timeout: 60000,
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  })

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath)
    res.data.pipe(writer)
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

async function downloadVideo(url, tmpDir) {
  const output = path.join(tmpDir, 'video.%(ext)s')

  try {
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
  } catch (e) {
    if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) {
      const { videoUrl } = await tiktokFallback(url)
      if (!videoUrl) throw new Error('TikTok fallback fallito.')

      const filePath = path.join(tmpDir, 'video.mp4')
      await saveStreamToFile(videoUrl, filePath)
      return filePath
    }

    throw e
  }

  const file = fs.readdirSync(tmpDir).find(f => f.endsWith('.mp4'))
  if (!file) throw new Error('Video non trovato.')
  return path.join(tmpDir, file)
}

async function downloadAudio(url, tmpDir) {
  const output = path.join(tmpDir, 'audio.%(ext)s')

  try {
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
  } catch (e) {
    if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) {
      const { audioUrl } = await tiktokFallback(url)
      if (!audioUrl) throw new Error('Audio TikTok non trovato.')

      const filePath = path.join(tmpDir, 'audio.mp3')
      await saveStreamToFile(audioUrl, filePath)
      return filePath
    }

    throw e
  }

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
    if (!hasYtDlp && !(url.includes('tiktok.com') || url.includes('vm.tiktok.com'))) {
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
    return m.reply(`*❌️ 𝐄𝐫𝐫𝐨𝐫𝐞:* ${e.message || e}`)
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