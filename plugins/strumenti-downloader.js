// by Bonzino

import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function editMessage(conn, chatId, key, text) {
  await conn.relayMessage(
    chatId,
    {
      protocolMessage: {
        key,
        type: 14,
        editedMessage: {
          extendedTextMessage: { text }
        }
      }
    },
    {}
  )
}

async function animateDownload(conn, chatId, key) {
  const steps = [
    { dots: '', percent: 0 },
    { dots: '.', percent: 8 },
    { dots: '..', percent: 21 },
    { dots: '...', percent: 39 },
    { dots: '', percent: 57 },
    { dots: '.', percent: 74 },
    { dots: '..', percent: 88 },
    { dots: '...', percent: 95 }
  ]

  for (const step of steps) {
    await editMessage(
      conn,
      chatId,
      key,
      `*𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨${step.dots}* ⏳\n\n*${step.percent}%*`
    )
    await sleep(380)
  }
}

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
  if (!s) return '𝐍/𝐃'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

function formatViews(n) {
  const num = Number(n || 0)
  if (!num) return '𝐍/𝐃'
  return num.toLocaleString('it-IT')
}

function formatUploadDate(date) {
  if (!date || String(date).length !== 8) return '𝐍/𝐃'
  const d = String(date)
  return `${d.slice(6, 8)}/${d.slice(4, 6)}/${d.slice(0, 4)}`
}

function formatBytes(bytes) {
  const n = Number(bytes || 0)
  if (!n) return '𝐍/𝐃'
  const units = ['𝐁', '𝐊𝐁', '𝐌𝐁', '𝐆𝐁']
  let i = 0
  let value = n
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

function cleanText(text = '') {
  return String(text).replace(/\s+/g, ' ').trim()
}

function sanitizeError(msg = '') {
  const text = String(msg)

  if (text.includes('requiring login for access to this content')) {
    return '𝐓𝐢𝐤𝐓𝐨𝐤 𝐫𝐢𝐜𝐡𝐢𝐞𝐝𝐞 𝐥𝐨𝐠𝐢𝐧.'
  }

  if (text.includes('HTTP Error 403: Forbidden')) {
    return '𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨.'
  }

  if (text.includes('Video unavailable')) {
    return '𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐧𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞.'
  }

  if (text.includes('Private video')) {
    return '𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐩𝐫𝐢𝐯𝐚𝐭𝐨.'
  }

  if (text.includes('Sign in to confirm your age')) {
    return '𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐜𝐨𝐧 𝐫𝐞𝐬𝐭𝐫𝐢𝐳𝐢𝐨𝐧𝐞 𝐝𝐢 𝐞𝐭𝐚̀.'
  }

  if (text.includes('ffmpeg') && text.includes('not found')) {
    return '𝐟𝐟𝐦𝐩𝐞𝐠 𝐧𝐨𝐧 𝐢𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐨.'
  }

  if (text.includes('ffprobe') && text.includes('not found')) {
    return '𝐟𝐟𝐩𝐫𝐨𝐛𝐞 𝐧𝐨𝐧 𝐢𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐨.'
  }

  if (text.includes('yt-dlp') && text.includes('not found')) {
    return '𝐲𝐭-𝐝𝐥𝐩 𝐧𝐨𝐧 𝐢𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐨.'
  }

  return text
}

function estimateDownloadTime(info, mode) {
  const secs = Number(info?.durationSeconds || 0)
  const size = Number(info?.filesizeApprox || 0)

  if (mode === 'audio') {
    if (secs >= 1800) return '𝟐-𝟓 𝐦𝐢𝐧'
    if (secs >= 600) return '𝟒𝟎-𝟗𝟎 𝐬𝐞𝐜'
    return '𝟓-𝟑𝟎 𝐬𝐞𝐜'
  }

  if (size >= 200 * 1024 * 1024 || secs >= 1800) return '𝟑-𝟏𝟎 𝐦𝐢𝐧'
  if (size >= 80 * 1024 * 1024 || secs >= 600) return '𝟏-𝟑 𝐦𝐢𝐧'
  if (size >= 25 * 1024 * 1024 || secs >= 180) return '𝟐𝟎-𝟗𝟎 𝐬𝐞𝐜'
  return '𝟓-𝟑𝟎 𝐬𝐞𝐜'
}

function buildLongWarning(info, mode) {
  const secs = Number(info?.durationSeconds || 0)
  const size = Number(info?.filesizeApprox || 0)

  const longByTime = secs >= 600
  const longBySize = size >= 80 * 1024 * 1024

  if (!longByTime && !longBySize) return ''

  return `\n\n⚠️ *𝐀𝐯𝐯𝐢𝐬𝐨:* 𝐪𝐮𝐞𝐬𝐭𝐨 ${mode === 'video' ? '𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝' : '𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐚𝐮𝐝𝐢𝐨'} 𝐩𝐨𝐭𝐫𝐞𝐛𝐛𝐞 𝐫𝐢𝐜𝐡𝐢𝐞𝐝𝐞𝐫𝐞 𝐩𝐢𝐮̀ 𝐭𝐞𝐦𝐩𝐨 𝐝𝐞𝐥 𝐧𝐨𝐫𝐦𝐚𝐥𝐞.`
}

function formatElapsed(ms) {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  if (m > 0) return `${m}𝐦 ${s}𝐬`
  return `${s}𝐬`
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
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath)
    res.data.pipe(writer)
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

async function getMediaInfo(url) {
  if (isTikTokUrl(url)) {
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

        const size = Number(data.size || data.wm_size || 0)

        return {
          title: cleanText(data.title || '𝐍/𝐃'),
          uploader: cleanText(data.author?.nickname || data.author?.unique_id || '𝐍/𝐃'),
          duration: formatDuration(data.duration),
          durationSeconds: Number(data.duration || 0),
          views: formatViews(data.play_count || data.digg_count || 0),
          uploadDate: '𝐍/𝐃',
          thumbnail: data.cover || data.origin_cover || null,
          filesize: formatBytes(size),
          filesizeApprox: size
        }
      } catch {}
    }
  }

  try {
    const { stdout } = await runYtDlp([
      '--dump-single-json',
      '--no-warnings',
      '--no-playlist',
      url
    ])

    const data = JSON.parse(stdout)

    const filesizeApprox = Number(
      data.filesize_approx ||
      data.filesize ||
      data.requested_formats?.reduce((sum, x) => sum + Number(x?.filesize || x?.filesize_approx || 0), 0) ||
      0
    )

    return {
      title: cleanText(data.title || '𝐍/𝐃'),
      uploader: cleanText(data.uploader || data.channel || data.creator || '𝐍/𝐃'),
      duration: formatDuration(data.duration),
      durationSeconds: Number(data.duration || 0),
      views: formatViews(data.view_count),
      uploadDate: formatUploadDate(data.upload_date),
      thumbnail: data.thumbnail || null,
      filesize: formatBytes(filesizeApprox),
      filesizeApprox
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

      const size = Number(data.size || data.wm_size || 0)

      const info = {
        title: cleanText(data.title || '𝐓𝐢𝐤𝐓𝐨𝐤'),
        uploader: cleanText(data.author?.nickname || data.author?.unique_id || '𝐍/𝐃'),
        duration: formatDuration(data.duration),
        durationSeconds: Number(data.duration || 0),
        views: formatViews(data.play_count || data.digg_count || 0),
        uploadDate: '𝐍/𝐃',
        thumbnail: data.cover || data.origin_cover || null,
        filesize: formatBytes(size),
        filesizeApprox: size
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

async function probeVideoCodecs(filePath) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath
  ], { timeout: 30000 })

  let audioCodec = ''
  try {
    const { stdout: audioOut } = await execFileAsync('ffprobe', [
      '-v', 'error',
      '-select_streams', 'a:0',
      '-show_entries', 'stream=codec_name',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ], { timeout: 30000 })
    audioCodec = audioOut.trim().toLowerCase()
  } catch {}

  return {
    video: stdout.trim().toLowerCase(),
    audio: audioCodec
  }
}

function isWhatsAppCompatible(codecs) {
  const videoOk = ['h264'].includes(codecs.video)
  const audioOk = !codecs.audio || ['aac', 'mp3'].includes(codecs.audio)
  return videoOk && audioOk
}

async function downloadVideo(url, tmpDir) {
  const output = path.join(tmpDir, 'video.%(ext)s')

  try {
    await runYtDlp([
      '--no-playlist',
      '--no-warnings',
      '-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b',
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
        throw new Error('𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐡𝐚 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨 𝐢𝐥 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐝𝐞𝐥 𝐯𝐢𝐝𝐞𝐨.')
      }
      throw e2
    }
  }

  const file = fs.readdirSync(tmpDir).find(f =>
    f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.mkv')
  )

  if (!file) throw new Error('𝐕𝐢𝐝𝐞𝐨 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.')

  const rawPath = path.join(tmpDir, file)
  const codecs = await probeVideoCodecs(rawPath)

  if (isWhatsAppCompatible(codecs)) {
    return { filePath: rawPath }
  }

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
      throw new Error('𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐡𝐚 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨 𝐢𝐥 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐝𝐞𝐥𝐥’𝐚𝐮𝐝𝐢𝐨.')
    }
    throw e
  }

  const file = fs.readdirSync(tmpDir).find(f => f.endsWith('.mp3'))
  if (!file) throw new Error('𝐀𝐮𝐝𝐢𝐨 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.')

  return { filePath: path.join(tmpDir, file) }
}

function buildInfoCaption(info, mode) {
  let txt = mode === 'video'
    ? `*𝐕𝐢𝐝𝐞𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨*\n\n`
    : `*𝐀𝐮𝐝𝐢𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨*\n\n`

  txt += `🎬 *𝐓𝐢𝐭𝐨𝐥𝐨:* ${info.title || '𝐍/𝐃'}\n`
  txt += `👤 *𝐀𝐮𝐭𝐨𝐫𝐞:* ${info.uploader || '𝐍/𝐃'}\n`
  txt += `⏱️ *𝐃𝐮𝐫𝐚𝐭𝐚:* ${info.duration || '𝐍/𝐃'}\n`
  txt += `⚖️ *𝐏𝐞𝐬𝐨:* ${info.filesize || '𝐍/𝐃'}\n`
  txt += `👁️ *𝐕𝐢𝐞𝐰𝐬:* ${info.views || '𝐍/𝐃'}\n`
  txt += `📅 *𝐃𝐚𝐭𝐚:* ${info.uploadDate || '𝐍/𝐃'}`

  txt += buildLongWarning(info, mode)

  txt += `\n\n──────────\n\n🕒 *𝐓𝐞𝐦𝐩𝐨 𝐬𝐭𝐢𝐦𝐚𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝:*\n${estimateDownloadTime(info, mode)}`

  return txt
}
}

let handler = async (m, { conn, args, usedPrefix }) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-'))

  try {
    const mode = (args[0] || '').toLowerCase()

    let url = (mode === 'audio' || mode === 'video') ? args[1] : args[0]

    if (!url && m.quoted) {
      const quoted = m.quoted
      url = quoted.text || quoted.caption || ''

      if (!url && quoted.msg) {
        url = quoted.msg?.text || quoted.msg?.caption || ''
      }
    }

    if (url) {
      const match = url.match(/https?:\/\/[^\s]+/)
      url = match ? match[0] : null
    }

    if (!url) {
      return m.reply('*❌️ 𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐥𝐢𝐧𝐤.')
    }

    if (!isValidUrl(url)) {
      return m.reply('*❌️ 𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐋𝐢𝐧𝐤 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.')
    }

    const hasYtDlp = await hasBinary('yt-dlp')
    if (!hasYtDlp && !isTikTokUrl(url)) {
      return m.reply('*❌️ 𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐲𝐭-𝐝𝐥𝐩 𝐧𝐨𝐧 𝐢𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐨.')
    }

    if (mode !== 'audio' && mode !== 'video') {
      const info = await getMediaInfo(url)

      if (!info) {
        return conn.sendMessage(m.chat, {
          text: `*𝐒𝐜𝐞𝐠𝐥𝐢 𝐢𝐥 𝐟𝐨𝐫𝐦𝐚𝐭𝐨*\n\n🔗 ${url}`,
          footer: '',
          buttons: [
            {
              buttonId: `${usedPrefix}download video ${url}`,
              buttonText: { displayText: '🎬 𝐒𝐜𝐚𝐫𝐢𝐜𝐚 𝐯𝐢𝐝𝐞𝐨' },
              type: 1
            },
            {
              buttonId: `${usedPrefix}download audio ${url}`,
              buttonText: { displayText: '🎧 𝐒𝐜𝐚𝐫𝐢𝐜𝐚 𝐚𝐮𝐝𝐢𝐨' },
              type: 1
            }
          ],
          headerType: 1
        }, { quoted: m })
      }

      if (info.thumbnail) {
        return conn.sendMessage(m.chat, {
          image: { url: info.thumbnail },
          caption: `${buildInfoCaption(info, 'video')}\n\n🔗 ${url}`,
          footer: '',
          buttons: [
            {
              buttonId: `${usedPrefix}download video ${url}`,
              buttonText: { displayText: '🎬 𝐒𝐜𝐚𝐫𝐢𝐜𝐚 𝐯𝐢𝐝𝐞𝐨' },
              type: 1
            },
            {
              buttonId: `${usedPrefix}download audio ${url}`,
              buttonText: { displayText: '🎧 𝐒𝐜𝐚𝐫𝐢𝐜𝐚 𝐚𝐮𝐝𝐢𝐨' },
              type: 1
            }
          ],
          headerType: 4
        }, { quoted: m })
      }

      return conn.sendMessage(m.chat, {
        text: `${buildInfoCaption(info, 'video')}\n\n🔗 ${url}`,
        footer: '',
        buttons: [
          {
            buttonId: `${usedPrefix}download video ${url}`,
            buttonText: { displayText: '🎬 𝐒𝐜𝐚𝐫𝐢𝐜𝐚 𝐯𝐢𝐝𝐞𝐨' },
            type: 1
          },
          {
            buttonId: `${usedPrefix}download audio ${url}`,
            buttonText: { displayText: '🎧 𝐒𝐜𝐚𝐫𝐢𝐜𝐚 𝐚𝐮𝐝𝐢𝐨' },
            type: 1
          }
        ],
        headerType: 1
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    })

    const startedAt = Date.now()

    const sent = await conn.sendMessage(m.chat, {
      text: '*𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨* ⏳\n\n*0%*'
    }, { quoted: m })

    const key = sent.key

    await animateDownload(conn, m.chat, key)

    if (mode === 'audio') {
      const result = await downloadAudio(url, tmpDir)
      const elapsed = formatElapsed(Date.now() - startedAt)

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(result.filePath),
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3'
      }, { quoted: m })

      await editMessage(
        conn,
        m.chat,
        key,
        `*𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨* ✅️\n\n🕒 *𝐓𝐞𝐦𝐩𝐨 𝐭𝐫𝐚𝐬𝐜𝐨𝐫𝐬𝐨:* ${elapsed}`
      )
    }

    if (mode === 'video') {
      const result = await downloadVideo(url, tmpDir)
      const elapsed = formatElapsed(Date.now() - startedAt)

      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(result.filePath),
        mimetype: 'video/mp4',
        fileName: 'video.mp4'
      }, { quoted: m })

      await editMessage(
        conn,
        m.chat,
        key,
        `*𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨* ✅️\n\n🕒 *𝐓𝐞𝐦𝐩𝐨 𝐭𝐫𝐚𝐬𝐜𝐨𝐫𝐬𝐨:* ${elapsed}`
      )
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