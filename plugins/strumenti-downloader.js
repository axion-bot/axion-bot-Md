// by Bonzino - <Universal downloader>

import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { execFile, spawn } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const sleep = ms => new Promise(r => setTimeout(r, ms))

// Config

const DOWNLOAD_CONFIG = {
  MAX_CONCURRENT: Number(process.env.DW_MAX_CONCURRENT || 2),
  ONE_JOB_PER_CHAT: true,

  MAX_VIDEO_MB: Number(process.env.DW_MAX_VIDEO_MB || 1000),
  MAX_AUDIO_MB: Number(process.env.DW_MAX_AUDIO_MB || 1000),

  MAX_VIDEO_SECONDS: Number(process.env.DW_MAX_VIDEO_SECONDS || 60 * 60), // 1h
  MAX_AUDIO_SECONDS: Number(process.env.DW_MAX_AUDIO_SECONDS || 2 * 60 * 60), // 2h

  TMP_PREFIX: 'dw-',
  AXIOS_TIMEOUT: 60000,
  YTDLP_TIMEOUT: 1000 * 60 * 20,
  FFMPEG_TIMEOUT: 1000 * 60 * 30,
  COOKIES_PATH: process.env.YTDLP_COOKIES_PATH || '',
  EXTRACTOR_ARGS: process.env.YTDLP_EXTRACTOR_ARGS || '',
  EXTERNAL_DOWNLOADER: process.env.YTDLP_EXTERNAL_DOWNLOADER || '',

  USER_AGENT: 'Mozilla/5.0',

  ALLOW_TIKTOK_FALLBACK: true,
  ALLOW_DIRECT_MEDIA: true
}

// Sistema coda per utenti

if (!globalThis.__axionDownloadQueue) {
  globalThis.__axionDownloadQueue = {
    running: 0,
    jobs: [],
    chatLocks: new Set()
  }
}

const queueState = globalThis.__axionDownloadQueue

function enqueueJob(job) {
  return new Promise((resolve, reject) => {
    queueState.jobs.push({ job, resolve, reject })
    processQueue()
  })
}

async function processQueue() {
  if (queueState.running >= DOWNLOAD_CONFIG.MAX_CONCURRENT) return
  if (!queueState.jobs.length) return

  const nextIndex = queueState.jobs.findIndex(item => {
    if (!DOWNLOAD_CONFIG.ONE_JOB_PER_CHAT) return true
    return !queueState.chatLocks.has(item.job.chatId)
  })

  if (nextIndex === -1) return

  const [{ job, resolve, reject }] = queueState.jobs.splice(nextIndex, 1)

  queueState.running++
  if (DOWNLOAD_CONFIG.ONE_JOB_PER_CHAT) queueState.chatLocks.add(job.chatId)

  try {
    const result = await job.run()
    resolve(result)
  } catch (e) {
    reject(e)
  } finally {
    queueState.running--
    if (DOWNLOAD_CONFIG.ONE_JOB_PER_CHAT) queueState.chatLocks.delete(job.chatId)
    processQueue()
  }
}

function getQueuePosition(chatId) {
  if (!DOWNLOAD_CONFIG.ONE_JOB_PER_CHAT) return queueState.jobs.length + 1

  const ahead = queueState.jobs.filter(item => item.job.chatId !== chatId).length
  return ahead + queueState.running + 1
}

// Interfaccia

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

async function setReaction(conn, chatId, key, emoji) {
  try {
    await conn.sendMessage(chatId, {
      react: { text: emoji, key }
    })
  } catch {}
}

async function animateProgress(conn, chatId, key, state) {
  let lastSignature = ''
  let dotsIndex = 0
  const dotsFrames = ['', '.', '..', '...']

  while (!state.done) {
    let percent = Number(state.percent || 0)
    if (!Number.isFinite(percent) || percent < 0) percent = 0
    if (percent > 99) percent = 99

    const dots = dotsFrames[dotsIndex % dotsFrames.length]
    dotsIndex++

    let title = '𝐄𝐥𝐚𝐛𝐨𝐫𝐚𝐳𝐢𝐨𝐧𝐞'
    let emoji = '⏳'

    if (state.phase === 'analyzing') {
      title = '𝐀𝐧𝐚𝐥𝐢𝐬𝐢 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨'
      emoji = '🔎'
    } else if (state.phase === 'queued') {
      title = '𝐈𝐧 𝐜𝐨𝐝𝐚'
      emoji = '🕒'
    } else if (state.phase === 'downloading') {
      title = '𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨'
    } else if (state.phase === 'converting') {
      title = '𝐂𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨'
      emoji = '🔄'
    } else if (state.phase === 'uploading') {
      title = '𝐈𝐧𝐯𝐢𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨''
    }

    let body = `*${title}${dots}* ${emoji}\n\n*${percent}%*`

    if (state.note) {
      body += `\n\n${state.note}`
    }

    const signature = `${state.phase}|${percent}|${state.note || ''}|${dotsIndex % dotsFrames.length}|${state.forceRender ? '1' : '0'}`

    if (signature !== lastSignature || state.forceRender) {
      state.forceRender = false
      await editMessage(conn, chatId, key, body)
      lastSignature = signature
    }

    await sleep(state.phase === 'converting' ? 1200 : 900)
  }

  await editMessage(
    conn,
    chatId,
    key,
    `*𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨* ✅\n\n*100%*`
  )
}

//Helpers

function cleanText(text = '') {
  return String(text).replace(/\s+/g, ' ').trim()
}

function isValidUrl(text) {
  try {
    const url = new URL(text)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function extractUrl(text = '') {
  const match = String(text).match(/https?:\/\/[^\s]+/i)
  return match ? match[0] : null
}

function isTikTokUrl(url = '') {
  return url.includes('tiktok.com') || url.includes('vm.tiktok.com')
}

function isYouTubeUrl(url = '') {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

function isInstagramUrl(url = '') {
  return url.includes('instagram.com')
}

function isFacebookUrl(url = '') {
  return url.includes('facebook.com') || url.includes('fb.watch')
}

function isTwitterUrl(url = '') {
  return url.includes('twitter.com') || url.includes('x.com')
}

function isDirectMediaUrl(url = '') {
  const clean = url.split('?')[0].toLowerCase()
  return [
    '.mp4', '.m4v', '.mov', '.webm', '.mkv',
    '.mp3', '.m4a', '.aac', '.wav', '.ogg', '.opus'
  ].some(ext => clean.endsWith(ext))
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
  const units = ['𝐁', '𝐊𝐁', '𝐌𝐁', '𝐆𝐁', '𝐓𝐁']
  let i = 0
  let value = n
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

function formatElapsed(ms) {
  const total = Math.max(0, Math.round(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}𝐡 ${m}𝐦 ${s}𝐬`
  if (m > 0) return `${m}𝐦 ${s}𝐬`
  return `${s}𝐬`
}

function sanitizeError(msg = '') {
  const text = String(msg || '')

  if (text.includes('requiring login for access to this content')) return '𝐈𝐥 𝐜𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐝𝐞 𝐥𝐨𝐠𝐢𝐧.'
  if (text.includes('HTTP Error 403: Forbidden')) return '𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨 𝐨 𝐧𝐞𝐠𝐚𝐭𝐨.'
  if (text.includes('Video unavailable')) return '𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐧𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞.'
  if (text.includes('Private video')) return '𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐩𝐫𝐢𝐯𝐚𝐭𝐨.'
  if (text.includes('Sign in to confirm your age')) return '𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐜𝐨𝐧 𝐫𝐞𝐬𝐭𝐫𝐢𝐳𝐢𝐨𝐧𝐢 𝐝𝐢 𝐞𝐭𝐚̀.'
  if (text.includes('ffmpeg') && text.includes('not found')) return '𝐟𝐟𝐦𝐩𝐞𝐠 𝐧𝐨𝐧 𝐢𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐨.'
  if (text.includes('ffprobe') && text.includes('not found')) return '𝐟𝐟𝐩𝐫𝐨𝐛𝐞 𝐧𝐨𝐧 𝐢𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐨.'
  if (text.includes('yt-dlp') && text.includes('not found')) return '𝐲𝐭-𝐝𝐥𝐩 𝐧𝐨𝐧 𝐢𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐨.'
  if (text.includes('Requested format is not available')) return '𝐅𝐨𝐫𝐦𝐚𝐭𝐨 𝐧𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞.'
  if (text.includes('Unsupported URL')) return '𝐒𝐢𝐭𝐨 𝐨 𝐥𝐢𝐧𝐤 𝐧𝐨𝐧 𝐬𝐮𝐩𝐩𝐨𝐫𝐭𝐚𝐭𝐨.'
  if (text.includes('File too large')) return '𝐅𝐢𝐥𝐞 𝐭𝐫𝐨𝐩𝐩𝐨 𝐠𝐫𝐚𝐧𝐝𝐞 𝐩𝐞𝐫 𝐞𝐬𝐬𝐞𝐫𝐞 𝐢𝐧𝐯𝐢𝐚𝐭𝐨.'

  return text || '𝐄𝐫𝐫𝐨𝐫𝐞 𝐬𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨.'
}

function getSourceLabel(url = '') {
  if (isYouTubeUrl(url)) return '𝐘𝐨𝐮𝐓𝐮𝐛𝐞'
  if (isTikTokUrl(url)) return '𝐓𝐢𝐤𝐓𝐨𝐤'
  if (isInstagramUrl(url)) return '𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦'
  if (isFacebookUrl(url)) return '𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤'
  if (isTwitterUrl(url)) return '𝐗/𝐓𝐰𝐢𝐭𝐭𝐞𝐫'
  if (isDirectMediaUrl(url)) return '𝐃𝐢𝐫𝐞𝐜𝐭 𝐌𝐞𝐝𝐢𝐚'
  return '𝐒𝐨𝐫𝐠𝐞𝐧𝐭𝐞 𝐠𝐞𝐧𝐞𝐫𝐢𝐜𝐚'
}

function estimateDownloadTime(info, mode) {
  const secs = Number(info?.durationSeconds || 0)
  const size = Number(info?.filesizeApprox || 0)

  if (mode === 'audio') {
    if (size >= 100 * 1024 * 1024 || secs >= 5400) return '𝟑-𝟏𝟎 𝐦𝐢𝐧'
    if (size >= 25 * 1024 * 1024 || secs >= 1800) return '𝟏-𝟑 𝐦𝐢𝐧'
    return '𝟓-𝟒𝟎 𝐬𝐞𝐜'
  }

  if (size >= 400 * 1024 * 1024 || secs >= 7200) return '𝟓-𝟏𝟓 𝐦𝐢𝐧'
  if (size >= 120 * 1024 * 1024 || secs >= 1800) return '𝟐-𝟔 𝐦𝐢𝐧'
  if (size >= 40 * 1024 * 1024 || secs >= 300) return '𝟑𝟎-𝟏𝟐𝟎 𝐬𝐞𝐜'
  return '𝟓-𝟒𝟎 𝐬𝐞𝐜'
}

function buildLongWarning(info, mode) {
  const secs = Number(info?.durationSeconds || 0)
  const size = Number(info?.filesizeApprox || 0)
  const longByTime = mode === 'audio' ? secs >= 1800 : secs >= 600
  const longBySize = mode === 'audio' ? size >= 25 * 1024 * 1024 : size >= 80 * 1024 * 1024

  if (!longByTime && !longBySize) return ''
  return `\n\n⚠️ *𝐀𝐯𝐯𝐢𝐬𝐨:* 𝐪𝐮𝐞𝐬𝐭𝐨 ${mode === 'video' ? '𝐯𝐢𝐝𝐞𝐨' : '𝐚𝐮𝐝𝐢𝐨'} 𝐩𝐨𝐭𝐫𝐞𝐛𝐛𝐞 𝐫𝐢𝐜𝐡𝐢𝐞𝐝𝐞𝐫𝐞 𝐩𝐢𝐮̀ 𝐭𝐞𝐦𝐩𝐨 𝐝𝐞𝐥 𝐧𝐨𝐫𝐦𝐚𝐥𝐞.`
}

function buildInfoCaption(info, mode, url) {
  let txt = mode === 'video'
    ? `*𝐕𝐢𝐝𝐞𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨✅️*\n\n`
    : `*𝐀𝐮𝐝𝐢𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨✅️*\n\n`

  txt += `🌐 *𝐒𝐨𝐫𝐠𝐞𝐧𝐭𝐞:* ${getSourceLabel(url)}\n`
  txt += `🎬 *𝐓𝐢𝐭𝐨𝐥𝐨:* ${info.title || '𝐍/𝐃'}\n`
  txt += `👤 *𝐀𝐮𝐭𝐨𝐫𝐞:* ${info.uploader || '𝐍/𝐃'}\n`
  txt += `⏱️ *𝐃𝐮𝐫𝐚𝐭𝐚:* ${info.duration || '𝐍/𝐃'}\n`
  txt += `⚖️ *𝐏𝐞𝐬𝐨:* ${info.filesize || '𝐍/𝐃'}\n`
  txt += `👁️ *𝐕𝐢𝐞𝐰𝐬:* ${info.views || '𝐍/𝐃'}\n`
  txt += `📅 *𝐃𝐚𝐭𝐚:* ${info.uploadDate || '𝐍/𝐃'}`

  txt += buildLongWarning(info, mode)
  txt += `\n\n──────────\n\n🕒 *𝐓𝐞𝐦𝐩𝐨 𝐬𝐭𝐢𝐦𝐚𝐭𝐨:*\n${estimateDownloadTime(info, mode)}`
  txt += `\n\n> 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'`

return txt
}

function bytesFromMb(mb) {
  return Number(mb || 0) * 1024 * 1024
}

function assertMediaWithinLimits(info, mode) {
  const secs = Number(info?.durationSeconds || 0)
  const size = Number(info?.filesizeApprox || 0)

  if (mode === 'video') {
    if (secs && secs > DOWNLOAD_CONFIG.MAX_VIDEO_SECONDS) {
      throw new Error(`𝐕𝐢𝐝𝐞𝐨 𝐭𝐫𝐨𝐩𝐩𝐨 𝐥𝐮𝐧𝐠𝐨. 𝐋𝐢𝐦𝐢𝐭𝐞: ${formatDuration(DOWNLOAD_CONFIG.MAX_VIDEO_SECONDS)}.`)
    }
    if (size && size > bytesFromMb(DOWNLOAD_CONFIG.MAX_VIDEO_MB)) {
      throw new Error(`𝐕𝐢𝐝𝐞𝐨 𝐭𝐫𝐨𝐩𝐩𝐨 𝐩𝐞𝐬𝐚𝐧𝐭𝐞. 𝐋𝐢𝐦𝐢𝐭𝐞: ${DOWNLOAD_CONFIG.MAX_VIDEO_MB}𝐌𝐁.`)
    }
  }

  if (mode === 'audio') {
    if (secs && secs > DOWNLOAD_CONFIG.MAX_AUDIO_SECONDS) {
      throw new Error(`𝐀𝐮𝐝𝐢𝐨 𝐭𝐫𝐨𝐩𝐩𝐨 𝐥𝐮𝐧𝐠𝐨. 𝐋𝐢𝐦𝐢𝐭𝐞: ${formatDuration(DOWNLOAD_CONFIG.MAX_AUDIO_SECONDS)}.`)
    }
    if (size && size > bytesFromMb(DOWNLOAD_CONFIG.MAX_AUDIO_MB)) {
      throw new Error(`𝐀𝐮𝐝𝐢𝐨 𝐭𝐫𝐨𝐩𝐩𝐨 𝐩𝐞𝐬𝐚𝐧𝐭𝐞. 𝐋𝐢𝐦𝐢𝐭𝐞: ${DOWNLOAD_CONFIG.MAX_AUDIO_MB}𝐌𝐁.`)
    }
  }
}

// Check generali

async function hasBinary(bin) {
  try {
    await execFileAsync(bin, ['--version'], { timeout: 10000 })
    return true
  } catch {
    return false
  }
}

function getYtDlpBaseArgs() {
  const args = []

  if (DOWNLOAD_CONFIG.COOKIES_PATH && fs.existsSync(DOWNLOAD_CONFIG.COOKIES_PATH)) {
    args.push('--cookies', DOWNLOAD_CONFIG.COOKIES_PATH)
  }

  if (DOWNLOAD_CONFIG.EXTRACTOR_ARGS) {
    args.push('--extractor-args', DOWNLOAD_CONFIG.EXTRACTOR_ARGS)
  }

  if (DOWNLOAD_CONFIG.EXTERNAL_DOWNLOADER) {
    args.push('--downloader', DOWNLOAD_CONFIG.EXTERNAL_DOWNLOADER)
  }

  return args
}

async function runYtDlp(args) {
  return execFileAsync('yt-dlp', [...getYtDlpBaseArgs(), ...args], {
    timeout: DOWNLOAD_CONFIG.YTDLP_TIMEOUT,
    maxBuffer: 1024 * 1024 * 30
  })
}

// Avanzamento Parser

function extractYtDlpPercent(text = '') {
  const clean = String(text).replace(/\r/g, '\n')
  const lines = clean.split('\n')
  let last = null

  for (const line of lines) {
    const match = line.match(/(\d+(?:\.\d+)?)%/)
    if (match) {
      const value = Math.floor(Number(match[1]))
      if (Number.isFinite(value)) last = value
    }
  }

  return last
}

async function runYtDlpWithProgress(args, onProgress, onNote) {
  return await new Promise((resolve, reject) => {
    const child = spawn('yt-dlp', [...getYtDlpBaseArgs(), ...args], {
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    const handleChunk = chunk => {
      const text = chunk.toString()
      const percent = extractYtDlpPercent(text)

      if (percent != null && typeof onProgress === 'function') {
        onProgress(percent)
      }

      if (typeof onNote === 'function') {
        if (/Downloading webpage/i.test(text)) onNote('*🌐 𝐑𝐢𝐬𝐨𝐥𝐮𝐳𝐢𝐨𝐧𝐞 𝐬𝐨𝐫𝐠𝐞𝐧𝐭𝐞...*')
        else if (/Merging formats/i.test(text)) onNote('*🔗 𝐔𝐧𝐢𝐨𝐧𝐞 𝐟𝐥𝐮𝐬𝐬𝐢...*')
        else if (/Extracting audio/i.test(text)) onNote('*🎧 𝐄𝐬𝐭𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐚𝐮𝐝𝐢𝐨...*')
      }
    }

    child.stdout.on('data', chunk => {
      const text = chunk.toString()
      stdout += text
      handleChunk(chunk)
    })

    child.stderr.on('data', chunk => {
      const text = chunk.toString()
      stderr += text
      handleChunk(chunk)
    })

    child.on('error', reject)

    child.on('close', code => {
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(stderr || stdout || `yt-dlp exited with code ${code}`))
    })
  })
}

async function getMediaDurationSeconds(filePath) {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ], { timeout: 30000 })

    const value = Number(parseFloat(String(stdout).trim()))
    return Number.isFinite(value) ? value : 0
  } catch {
    return 0
  }
}

async function runFfmpegConvertWithProgress(inputPath, outputPath, onProgress, totalSeconds = 0) {
  return await new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-i', inputPath,
      '-vf', 'scale=720:-2',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-progress', 'pipe:1',
      '-nostats',
      outputPath
    ]

    const child = spawn('ffmpeg', args, {
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', chunk => {
      const text = chunk.toString()
      stdout += text

      const lines = text.replace(/\r/g, '\n').split('\n')
      for (const line of lines) {
        const match = line.match(/^out_time_ms=(\d+)$/)
        if (match && totalSeconds > 0 && typeof onProgress === 'function') {
          const ms = Number(match[1])
          const secs = ms / 1000000
          const ratio = Math.max(0, Math.min(1, secs / totalSeconds))
          const percent = 97 + Math.floor(ratio * 2) // 97-99
          onProgress(percent > 99 ? 99 : percent)
        }
      }
    })

    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })

    child.on('error', reject)

    child.on('close', code => {
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(stderr || stdout || `ffmpeg exited with code ${code}`))
    })
  })
}

//Link diretti

async function getDirectMediaInfo(url) {
  try {
    const res = await axios.head(url, {
      timeout: 30000,
      headers: { 'User-Agent': DOWNLOAD_CONFIG.USER_AGENT },
      maxRedirects: 5,
      validateStatus: () => true
    })

    const headers = res.headers || {}
    const size = Number(headers['content-length'] || 0)
    const contentType = String(headers['content-type'] || '').toLowerCase()

    return {
      title: cleanText(decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'Direct Media')),
      uploader: '𝐍/𝐃',
      duration: '𝐍/𝐃',
      durationSeconds: 0,
      views: '𝐍/𝐃',
      uploadDate: '𝐍/𝐃',
      thumbnail: null,
      filesize: formatBytes(size),
      filesizeApprox: size,
      contentType
    }
  } catch {
    return {
      title: cleanText(decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'Direct Media')),
      uploader: '𝐍/𝐃',
      duration: '𝐍/𝐃',
      durationSeconds: 0,
      views: '𝐍/𝐃',
      uploadDate: '𝐍/𝐃',
      thumbnail: null,
      filesize: '𝐍/𝐃',
      filesizeApprox: 0,
      contentType: ''
    }
  }
}

async function saveStreamToFile(url, filePath, onProgress = null) {
  const res = await axios.get(url, {
    responseType: 'stream',
    timeout: DOWNLOAD_CONFIG.AXIOS_TIMEOUT,
    headers: { 'User-Agent': DOWNLOAD_CONFIG.USER_AGENT }
  })

  const total = Number(res.headers['content-length'] || 0)

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath)
    let downloaded = 0

    res.data.on('data', chunk => {
      downloaded += chunk.length
      if (total > 0 && typeof onProgress === 'function') {
        const pct = Math.floor((downloaded / total) * 100)
        onProgress(pct > 95 ? 95 : pct)
      }
    })

    res.data.pipe(writer)
    writer.on('finish', resolve)
    writer.on('error', reject)
    res.data.on('error', reject)
  })
}

async function downloadDirectMedia(url, mode, tmpDir, onProgress = null) {
  const clean = url.split('?')[0].toLowerCase()
  const isAudio = ['.mp3', '.m4a', '.aac', '.wav', '.ogg', '.opus'].some(ext => clean.endsWith(ext))
  const isVideo = ['.mp4', '.m4v', '.mov', '.webm', '.mkv'].some(ext => clean.endsWith(ext))

  if (mode === 'audio' && !isAudio) {
    throw new Error('𝐈𝐥 𝐥𝐢𝐧𝐤 𝐧𝐨𝐧 𝐩𝐮𝐧𝐭𝐚 𝐚 𝐮𝐧 𝐚𝐮𝐝𝐢𝐨 𝐝𝐢𝐫𝐞𝐭𝐭𝐨.')
  }

  if (mode === 'video' && !isVideo) {
    throw new Error('𝐈𝐥 𝐥𝐢𝐧𝐤 𝐧𝐨𝐧 𝐩𝐮𝐧𝐭𝐚 𝐚 𝐮𝐧 𝐯𝐢𝐝𝐞𝐨 𝐝𝐢𝐫𝐞𝐭𝐭𝐨.')
  }

  const ext = path.extname(clean) || (mode === 'audio' ? '.mp3' : '.mp4')
  const filePath = path.join(tmpDir, `${mode}${ext}`)

  await saveStreamToFile(url, filePath, onProgress)
  return { filePath }
}

//Analisi contenuti

async function getMediaInfo(url) {
  if (DOWNLOAD_CONFIG.ALLOW_DIRECT_MEDIA && isDirectMediaUrl(url)) {
    return await getDirectMediaInfo(url)
  }

  if (isTikTokUrl(url) && DOWNLOAD_CONFIG.ALLOW_TIKTOK_FALLBACK) {
    const endpoints = [
      `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
      `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
    ]

    for (const endpoint of endpoints) {
      try {
        const res = await axios.get(endpoint, {
          timeout: 30000,
          headers: { 'User-Agent': DOWNLOAD_CONFIG.USER_AGENT }
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

// Fallback x tiktok

async function tiktokFallback(url, mode, tmpDir, onProgress = null) {
  const endpoints = [
    `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
    `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
  ]

  for (const endpoint of endpoints) {
    try {
      const res = await axios.get(endpoint, {
        timeout: 30000,
        headers: { 'User-Agent': DOWNLOAD_CONFIG.USER_AGENT }
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
        await saveStreamToFile(mediaUrl, filePath, p => {
          if (typeof onProgress === 'function') onProgress(p > 95 ? 95 : p)
        })
        return { filePath, info }
      }

      const audioUrl = data.music
      if (!audioUrl) continue

      const filePath = path.join(tmpDir, 'audio.mp3')
      await saveStreamToFile(audioUrl, filePath, p => {
        if (typeof onProgress === 'function') onProgress(p > 95 ? 95 : p)
      })
      return { filePath, info }
    } catch {}
  }

  throw new Error('Fallback TikTok fallito.')
}

//Conversione media per compatibilità 

async function probeVideoCodecs(filePath) {
  try {
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
  } catch {
    return {
      video: '',
      audio: ''
    }
  }
}

function isWhatsAppCompatible(codecs) {
  const videoOk = ['h264'].includes(codecs.video)
  const audioOk = !codecs.audio || ['aac', 'mp3'].includes(codecs.audio)
  return videoOk && audioOk
}

async function convertToMp4(inputPath, tmpDir, onProgress = null) {
  const outputPath = path.join(tmpDir, 'final.mp4')
  const totalSeconds = await getMediaDurationSeconds(inputPath)

  await runFfmpegConvertWithProgress(
    inputPath,
    outputPath,
    onProgress,
    totalSeconds
  )

  return outputPath
}

//Downloaders

async function downloadVideo(url, tmpDir, onProgress = null, onPhaseChange = null, onNote = null) {
  if (DOWNLOAD_CONFIG.ALLOW_DIRECT_MEDIA && isDirectMediaUrl(url)) {
    return await downloadDirectMedia(url, 'video', tmpDir, onProgress)
  }

  const output = path.join(tmpDir, 'video.%(ext)s')

  try {
    await runYtDlpWithProgress([
      '--no-playlist',
      '--progress',
      '--newline',
      '--no-warnings',
      '-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b',
      '--merge-output-format', 'mp4',
      '-o', output,
      url
    ], onProgress, onNote)
  } catch {
    try {
      await runYtDlpWithProgress([
        '--no-playlist',
        '--progress',
        '--newline',
        '--no-warnings',
        '-f', 'best[ext=mp4]/best',
        '--merge-output-format', 'mp4',
        '-o', output,
        url
      ], onProgress, onNote)
    } catch (e2) {
      if (isTikTokUrl(url) && DOWNLOAD_CONFIG.ALLOW_TIKTOK_FALLBACK) {
        if (typeof onProgress === 'function') onProgress(25)
        return await tiktokFallback(url, 'video', tmpDir, onProgress)
      }
      throw e2
    }
  }

  const file = fs.readdirSync(tmpDir).find(f =>
    f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.mkv') || f.endsWith('.mov')
  )

  if (!file) throw new Error('𝐕𝐢𝐝𝐞𝐨 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.')

  const rawPath = path.join(tmpDir, file)
  const codecs = await probeVideoCodecs(rawPath)

  if (typeof onProgress === 'function') onProgress(96)

  if (isWhatsAppCompatible(codecs)) {
    return { filePath: rawPath }
  }

  if (typeof onPhaseChange === 'function') onPhaseChange('converting')
  if (typeof onNote === 'function') onNote('🎞️ 𝐀𝐝𝐚𝐭𝐭𝐚𝐦𝐞𝐧𝐭𝐨 𝐟𝐨𝐫𝐦𝐚𝐭𝐨 𝐩𝐞𝐫 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩...')
  if (typeof onProgress === 'function') onProgress(97)

  const filePath = await convertToMp4(rawPath, tmpDir, onProgress)
  if (typeof onProgress === 'function') onProgress(99)

  return { filePath }
}

async function downloadAudio(url, tmpDir, onProgress = null, onNote = null) {
  if (DOWNLOAD_CONFIG.ALLOW_DIRECT_MEDIA && isDirectMediaUrl(url)) {
    return await downloadDirectMedia(url, 'audio', tmpDir, onProgress)
  }

  const output = path.join(tmpDir, 'audio.%(ext)s')

  try {
    await runYtDlpWithProgress([
      '--no-playlist',
      '--progress',
      '--newline',
      '--no-warnings',
      '-f', 'bestaudio',
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '-o', output,
      url
    ], onProgress, onNote)
  } catch (e) {
    if (isTikTokUrl(url) && DOWNLOAD_CONFIG.ALLOW_TIKTOK_FALLBACK) {
      if (typeof onProgress === 'function') onProgress(25)
      return await tiktokFallback(url, 'audio', tmpDir, onProgress)
    }
    throw e
  }

  const file = fs.readdirSync(tmpDir).find(f =>
    f.endsWith('.mp3') || f.endsWith('.m4a') || f.endsWith('.aac') ||
    f.endsWith('.wav') || f.endsWith('.ogg') || f.endsWith('.opus')
  )

  if (!file) throw new Error('𝐀𝐮𝐝𝐢𝐨 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.')

  if (typeof onProgress === 'function') onProgress(100)

  return { filePath: path.join(tmpDir, file) }
}

//Handler principale

let handler = async (m, { conn, args, usedPrefix }) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), DOWNLOAD_CONFIG.TMP_PREFIX))

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

    if (url) url = extractUrl(url)

    if (!url) {
      return m.reply(`*⚠️ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐥𝐢𝐧𝐤 𝐯𝐚𝐥𝐢𝐝𝐨.*`)
    }

    if (!isValidUrl(url)) {
      return m.reply('*❌ 𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐋𝐢𝐧𝐤 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.')
    }

    await setReaction(conn, m.chat, m.key, '🔎')

    const hasYtDlpOk = await hasBinary('yt-dlp')

    if (
      !hasYtDlpOk &&
      !(DOWNLOAD_CONFIG.ALLOW_DIRECT_MEDIA && isDirectMediaUrl(url)) &&
      !(DOWNLOAD_CONFIG.ALLOW_TIKTOK_FALLBACK && isTikTokUrl(url))
    ) {
      await setReaction(conn, m.chat, m.key, '❌')
      return m.reply('*❌ 𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐲𝐭-𝐝𝐥𝐩 𝐧𝐨𝐧 𝐢𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐨.')
    }

    if (mode !== 'audio' && mode !== 'video') {
      const info = await getMediaInfo(url)

      await setReaction(conn, m.chat, m.key, '✅️')

      if (!info) {
        return conn.sendMessage(m.chat, {
          text: `*𝐒𝐜𝐞𝐠𝐥𝐢 𝐢𝐥 𝐟𝐨𝐫𝐦𝐚𝐭𝐨*\n\n🌐 *𝐒𝐨𝐫𝐠𝐞𝐧𝐭𝐞:* ${getSourceLabel(url)}\n🔗 ${url}`,
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

      let videoError = null
      let audioError = null

      try { assertMediaWithinLimits(info, 'video') } catch (e) { videoError = e.message }
      try { assertMediaWithinLimits(info, 'audio') } catch (e) { audioError = e.message }

      let extra = ''
      if (videoError) extra += `\n\n⚠️ *𝐕𝐢𝐝𝐞𝐨:* ${videoError}`
      if (audioError) extra += `\n\n⚠️ *𝐀𝐮𝐝𝐢𝐨:* ${audioError}`

      const caption = `${buildInfoCaption(info, 'video', url)}${extra}\n\n🔗 ${url}`

      const buttons = []
      if (!videoError) {
        buttons.push({
          buttonId: `${usedPrefix}download video ${url}`,
          buttonText: { displayText: '🎬 𝐒𝐜𝐚𝐫𝐢𝐜𝐚 𝐯𝐢𝐝𝐞𝐨' },
          type: 1
        })
      }
      if (!audioError) {
        buttons.push({
          buttonId: `${usedPrefix}download audio ${url}`,
          buttonText: { displayText: '🎧 𝐒𝐜𝐚𝐫𝐢𝐜𝐚 𝐚𝐮𝐝𝐢𝐨' },
          type: 1
        })
      }

      if (!buttons.length) {
        return m.reply(`*❌ 𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐟𝐮𝐨𝐫𝐢 𝐥𝐢𝐦𝐢𝐭𝐢.*\n\n${videoError || audioError}`)
      }

      if (info.thumbnail) {
        return conn.sendMessage(m.chat, {
          image: { url: info.thumbnail },
          caption,
          footer: '',
          buttons,
          headerType: 4
        }, { quoted: m })
      }

      return conn.sendMessage(m.chat, {
        text: caption,
        footer: '',
        buttons,
        headerType: 1
      }, { quoted: m })
    }

    const previewInfo = await getMediaInfo(url)
    if (previewInfo) {
      assertMediaWithinLimits(previewInfo, mode)
    }

    const queuePosition = getQueuePosition(m.chat)

    await setReaction(conn, m.chat, m.key, queuePosition > 1 ? '🕒' : '⏳')

    const sent = await conn.sendMessage(m.chat, {
      text: queuePosition > 1
        ? `*𝐈𝐧 𝐜𝐨𝐝𝐚* 🕒\n\n*𝐏𝐨𝐬𝐢𝐳𝐢𝐨𝐧𝐞:* ${queuePosition}`
        : '*𝐏𝐫𝐞𝐩𝐚𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝* ⏳\n\n*0%*'
    }, { quoted: m })

    const state = {
      done: false,
      percent: 0,
      phase: queuePosition > 1 ? 'queued' : 'analyzing',
      note: queuePosition > 1 ? '*𝐈𝐧 𝐚𝐭𝐭𝐞𝐬𝐚 𝐝𝐞𝐥 𝐭𝐮𝐨 𝐭𝐮𝐫𝐧𝐨...' : '🔎 𝐀𝐧𝐚𝐥𝐢𝐬𝐢 𝐝𝐞𝐥 𝐥𝐢𝐧𝐤...*',
      forceRender: true
    }

    const key = sent.key
    const startedAt = Date.now()
    const animationPromise = animateProgress(conn, m.chat, key, state)

    const result = await enqueueJob({
      chatId: m.chat,
      run: async () => {
        state.phase = 'downloading'
        state.note = `🌐 ${getSourceLabel(url)}`
        state.forceRender = true

        let result
        if (mode === 'audio') {
          result = await downloadAudio(
            url,
            tmpDir,
            percent => {
              if (percent > state.percent) state.percent = percent
            },
            note => {
              state.note = note
              state.forceRender = true
            }
          )
        } else {
          result = await downloadVideo(
            url,
            tmpDir,
            percent => {
              if (percent > state.percent) state.percent = percent
            },
            phase => {
              state.phase = phase
              state.forceRender = true
            },
            note => {
              state.note = note
              state.forceRender = true
            }
          )
        }

        return result
      }
    })

    const stats = fs.statSync(result.filePath)
    const maxBytes = mode === 'audio'
      ? bytesFromMb(DOWNLOAD_CONFIG.MAX_AUDIO_MB)
      : bytesFromMb(DOWNLOAD_CONFIG.MAX_VIDEO_MB)

    if (stats.size > maxBytes) {
      throw new Error(`${mode === 'audio' ? '𝐀𝐮𝐝𝐢𝐨' : '𝐕𝐢𝐝𝐞𝐨'} 𝐭𝐫𝐨𝐩𝐩𝐨 𝐩𝐞𝐬𝐚𝐧𝐭𝐞 𝐝𝐨𝐩𝐨 𝐥𝐚 𝐜𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞. 𝐋𝐢𝐦𝐢𝐭𝐞: ${mode === 'audio' ? DOWNLOAD_CONFIG.MAX_AUDIO_MB : DOWNLOAD_CONFIG.MAX_VIDEO_MB}𝐌𝐁.`)
    }

    state.phase = 'uploading'
    state.note = `📦 ${formatBytes(stats.size)}`
    state.percent = 99
    state.forceRender = true

    await setReaction(conn, m.chat, m.key, '📤')

    if (mode === 'audio') {
      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(result.filePath),
        mimetype: 'audio/mpeg',
        fileName: path.basename(result.filePath).endsWith('.mp3') ? path.basename(result.filePath) : 'audio.mp3'
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(result.filePath),
        mimetype: 'video/mp4',
        fileName: path.basename(result.filePath).endsWith('.mp4') ? path.basename(result.filePath) : 'video.mp4'
      }, { quoted: m })
    }

    state.done = true
    await animationPromise

    const elapsed = formatElapsed(Date.now() - startedAt)

await editMessage(
  conn,
  m.chat,
  key,
  `*𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨* ✅

🕒 *𝐓𝐞𝐦𝐩𝐨 𝐭𝐫𝐚𝐬𝐜𝐨𝐫𝐬𝐨:* ${elapsed}
📦 *𝐏𝐞𝐬𝐨:* ${formatBytes(stats.size)}

> 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'`
)

    await setReaction(conn, m.chat, m.key, '✅')

  } catch (e) {
    console.error('download error:', e)

    try {
      await setReaction(conn, m.chat, m.key, '❌')
    } catch {}

    return m.reply(`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞:* ${sanitizeError(e.message || String(e))}`)
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch {}
  }
}

handler.command = /^(download|dw|scarica)$/i
handler.tags = ['download']
handler.help = ['download', 'dw']

export default handler
