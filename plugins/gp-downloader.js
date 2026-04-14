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

function isTikTokUrl(url) {
  return url.includes('tiktok.com') || url.includes('vm.tiktok.com')
}

function isYouTubeUrl(url) {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

function formatDuration(seconds) {
  const s = Number(seconds || 0)
  if (!s) return 'N/D'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

function formatViews(n) {
  const num = Number(n || 0)
  if (!num) return 'N/D'
  return num.toLocaleString('it-IT')
}

function formatUploadDate(date) {
  if (!date || String(date).length !== 8) return 'N/D'
  const d = String(date)
  return `${d.slice(6, 8)}/${d.slice(4, 6)}/${d.slice(0, 4)}`
}

function cleanText(text = '') {
  return String(text).replace(/\s+/g, ' ').trim()
}

function sanitizeError(msg = '') {
  const text = String(msg)

  if (text.includes('requiring login for access to this content')) {
    return 'TikTok richiede login per questo contenuto.'
  }

  if (text.includes('HTTP Error 403: Forbidden')) {
    return 'Download bloccato dal sito sorgente.'
  }

  if (text.includes('Video unavailable')) {
    return 'Contenuto non disponibile.'
  }

  if (text.includes('Private video')) {
    return 'Contenuto privato.'
  }

  if (text.includes('Sign in to confirm your age')) {
    return 'Contenuto con restrizione di età.'
  }

  if (text.includes('ffmpeg') && text.includes('not found')) {
    return 'ffmpeg non installato.'
  }

  if (text.includes('yt-dlp') && text.includes('not found')) {
    return 'yt-dlp non installato.'
  }

  return text
}

async function hasBinary(bin) {
  try {
    await execFileAsync(bin, ['--version'], { timeout: 10000 })
    return true
  } catch {
    return false
  }
}

async function runYtDlp(args) {
  return execFileAsync('yt-dlp', args, {
    timeout: 180000,
    maxBuffer: 1024 * 1024 * 20
  })
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

async function getYtInfo(url) {
  try {
    const { stdout } = await runYtDlp([
      '--dump-single-json',
      '--no-warnings',
      '--no-playlist',
      url
    ])

    const data = JSON.parse(stdout)

    return {
      title: cleanText(data.title || 'N/D'),
      uploader: cleanText(data.uploader || data.channel || data.creator || 'N/D'),
      duration: formatDuration(data.duration),
      views: formatViews(data.view_count),
      uploadDate: formatUploadDate(data.upload_date),
      thumbnail: data.thumbnail || null
    }
  } catch {
    return null
  }
}

async function tiktokFallback(url, mode, tmpDir) {
  const endpoints = [
    `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
    `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
  ]

  for (const endpoint of endpoints) {
    try {
      const res = await axios.get(endpoint, {
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })

      const data = res.data?.data
      if (!data) continue

      const info = {
        title: cleanText(data.title || 'TikTok'),
        uploader: cleanText(data.author?.nickname || data.author?.unique_id || 'N/D'),
        duration: formatDuration(data.duration),
        views: formatViews(data.play_count || data.digg_count || 0),
        uploadDate: 'N/D',
        thumbnail: data.cover || data.origin_cover || null
      }

      if (mode === 'video') {
        const mediaUrl = data.play || data.wmplay
        if (!mediaUrl) continue

        const filePath = path.join(tmpDir, 'video.mp4')
        await saveStreamToFile(mediaUrl, filePath)
        return { filePath, info }
      }

      const audioUrl = data.music
      if (!audioUrl) continue

      const filePath = path.join(tmpDir, 'audio.mp3')
      await saveStreamToFile(audioUrl, filePath)
      return { filePath, info }
    } catch {}
  }

  throw new Error('Fallback TikTok fallito.')
}

async function convertToMp4(inputPath, tmpDir) {
  const outputPath = path.join(tmpDir, 'final.mp4')

  await execFileAsync('ffmpeg', [
    '-y',
    '-i', inputPath,
    '-vf', 'scale=720:-2',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    outputPath
  ], {
    timeout: 600000,
    maxBuffer: 1024 * 1024 * 20
  })

  return outputPath
}

async function downloadVideo(url, tmpDir) {
  const output = path.join(tmpDir, 'video.%(ext)s')

  try {
    await runYtDlp([
      '--no-playlist',
      '--no-warnings',
      '-f', 'bv*+ba/b',
      '--merge-output-format', 'mp4',
      '-o', output,
      url
    ])
  } catch {
    try {
      await runYtDlp([
        '--no-playlist',
        '--no-warnings',
        '-f', 'best[ext=mp4]/best',
        '--merge-output-format', 'mp4',
        '-o', output,
        url
      ])
    } catch (e2) {
      if (isTikTokUrl(url)) {
        return await tiktokFallback(url, 'video', tmpDir)
      }

      if (isYouTubeUrl(url)) {
        throw new Error('YouTube ha bloccato il download del video.')
      }

      throw e2
    }
  }

  const file = fs.readdirSync(tmpDir).find(f =>
    f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.mkv')
  )

  if (!file) throw new Error('Video non trovato.')

  const rawPath = path.join(tmpDir, file)
  const filePath = await convertToMp4(rawPath, tmpDir)

  return { filePath }
}

async function downloadAudio(url, tmpDir) {
  const output = path.join(tmpDir, 'audio.%(ext)s')

  try {
    await runYtDlp([
      '--no-playlist',
      '--no-warnings',
      '-f', 'bestaudio',
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '-o', output,
      url
    ])
  } catch (e) {
    if (isTikTokUrl(url)) {
      return await tiktokFallback(url, 'audio', tmpDir)
    }

    if (isYouTubeUrl(url)) {
      throw new Error('YouTube ha bloccato il download dell’audio.')
    }

    throw e
  }

  const file = fs.readdirSync(tmpDir).find(f => f.endsWith('.mp3'))
  if (!file) throw new Error('Audio non trovato.')

  return {
    filePath: path.join(tmpDir, file)
  }
}

function buildInfoCaption(info, mode) {
  let txt = mode === 'video'
    ? `*✅ 𝐕𝐈𝐃𝐄𝐎 𝐓𝐑𝐎𝐕𝐀𝐓𝐎*\n\n`
    : `*✅ 𝐀𝐔𝐃𝐈𝐎 𝐓𝐑𝐎𝐕𝐀𝐓𝐎*\n\n`

  txt += `🎬 *Titolo:* ${info.title || 'N/D'}\n`
  txt += `👤 *Autore:* ${info.uploader || 'N/D'}\n`
  txt += `⏱️ *Durata:* ${info.duration || 'N/D'}\n`
  txt += `👁️ *Views:* ${info.views || 'N/D'}\n`
  txt += `📅 *Data:* ${info.uploadDate || 'N/D'}`

  return txt
}

let handler = async (m, { conn, args, usedPrefix }) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-'))

  try {
    const mode = (args[0] || '').toLowerCase()
    const url = (mode === 'audio' || mode === 'video') ? args[1] : args[0]

    if (!url) {
      return m.reply('*❌️ 𝐄𝐫𝐫𝐨𝐫𝐞:* Inserisci un link.')
    }

    if (!isValidUrl(url)) {
      return m.reply('*❌️ 𝐄𝐫𝐫𝐨𝐫𝐞:* Link non valido.')
    }

    const hasYtDlp = await hasBinary('yt-dlp')
    if (!hasYtDlp && !isTikTokUrl(url)) {
      return m.reply('*❌️ 𝐄𝐫𝐫𝐨𝐫𝐞:* yt-dlp non installato.')
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

    let info = null

    try {
      info = await getYtInfo(url)
    } catch {}

    if (mode === 'audio') {
      if (info) {
        await m.reply(buildInfoCaption(info, 'audio'))
      }

      const result = await downloadAudio(url, tmpDir)
      const finalInfo = result.info || info

      if (!info && finalInfo) {
        await m.reply(buildInfoCaption(finalInfo, 'audio'))
      }

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(result.filePath),
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3'
      }, { quoted: m })
    }

    if (mode === 'video') {
      if (info) {
        if (info.thumbnail) {
          try {
            await conn.sendMessage(m.chat, {
              image: { url: info.thumbnail },
              caption: buildInfoCaption(info, 'video')
            }, { quoted: m })
          } catch {
            await m.reply(buildInfoCaption(info, 'video'))
          }
        } else {
          await m.reply(buildInfoCaption(info, 'video'))
        }
      }

      const result = await downloadVideo(url, tmpDir)
      const finalInfo = result.info || info

      if (!info && finalInfo) {
        if (finalInfo.thumbnail) {
          try {
            await conn.sendMessage(m.chat, {
              image: { url: finalInfo.thumbnail },
              caption: buildInfoCaption(finalInfo, 'video')
            }, { quoted: m })
          } catch {
            await m.reply(buildInfoCaption(finalInfo, 'video'))
          }
        } else {
          await m.reply(buildInfoCaption(finalInfo, 'video'))
        }
      }

      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(result.filePath),
        mimetype: 'video/mp4',
        fileName: 'video.mp4'
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('download error:', e)
    return m.reply(`*❌️ 𝐄𝐫𝐫𝐨𝐫𝐞:* ${sanitizeError(e.message || String(e))}`)
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