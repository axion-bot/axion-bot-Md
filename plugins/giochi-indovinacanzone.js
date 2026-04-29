/*Plugin originale: https://github.com/realvare/varebot
edit by Bonzino */

import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const activeGames = new Map()
const pendingMode = new Map()

const FOOTER = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
const GAME_TIME = 30
const TICK_TIME = 5
const REWARD_MIN = 50
const REWARD_MAX = 149
const REWARD_EXP = 500
const CACHE_PATH = path.join(process.cwd(), 'media/database/indovinacanzone_cache.json')
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000

const GENRES = [
  // RAP / TRAP ITALIA
  'rap italiano',
  'trap italiana',
  'drill italiana',
  'hip hop italiano',
  'urban italiano',

  // RAP / TRAP USA / GLOBAL
  'rap usa',
  'trap usa',
  'drill usa',
  'uk drill',
  'hip hop',
  'trap',
  'rap',
  'boom bap',
  'gangsta rap',
  'melodic rap',

  // POP
  'pop',
  'pop italiano',
  'dance pop',
  'electropop',
  'indie pop',
  'synth pop',
  'kpop',
  'jpop',

  // ROCK / METAL
  'rock',
  'rock italiano',
  'alternative rock',
  'indie rock',
  'punk rock',
  'hard rock',
  'classic rock',
  'metal',
  'heavy metal',
  'metalcore',
  'nu metal',
  'death metal',

  // ELETTRONICA
  'house',
  'deep house',
  'tech house',
  'techno',
  'hard techno',
  'minimal techno',
  'rave',
  'edm',
  'electronic',
  'dance',
  'trance',
  'dubstep',
  'drum and bass',
  'dnb',
  'future bass',
  'hardstyle',

  // LATIN / REGGAETON
  'latin',
  'reggaeton',
  'latin trap',
  'bachata',
  'salsa',
  'dancehall',
  'dembow',

  // R&B / SOUL
  'rnb',
  'r&b',
  'soul',
  'neo soul',
  'funk',

  // JAZZ / BLUES
  'jazz',
  'smooth jazz',
  'blues',
  'swing',

  // CLASSICA
  'classica',
  'orchestra',
  'piano',
  'instrumental',
  'soundtrack',

  // REGGAE
  'reggae',
  'dub',
  'ska',

  // INDIE / ALTERNATIVE
  'indie',
  'alternative',
  'lofi',
  'bedroom pop',

  // AFRO / WORLD
  'afrobeats',
  'world music',

  // COUNTRY / FOLK
  'country',
  'folk',
  'acoustic',
]

const S = v => String(v || '')

function withFooter(text) {
  return `${text}\n\n> ${FOOTER}`
}

function normalize(str) {
  if (!str) return ''

  str = S(str)
    .split(/\s*[\(\[{](?:feat|ft|featuring).*$/i)[0]
    .split(/\s*(?:feat|ft|featuring)\.?\s+.*$/i)[0]

  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function similarity(str1, str2) {
  const words1 = str1.split(' ').filter(Boolean)
  const words2 = str2.split(' ').filter(Boolean)

  if (!words1.length || !words2.length) return 0

  const matches = words1.filter(word =>
    words2.some(w2 => w2.includes(word) || word.includes(w2))
  )

  return matches.length / Math.max(words1.length, words2.length)
}

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: emoji,
        key: m.key
      }
    })
  } catch {}
}

function ensureCacheDir() {
  const dir = path.dirname(CACHE_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readCache() {
  try {
    ensureCacheDir()
    if (!fs.existsSync(CACHE_PATH)) {
      const base = { updatedAt: 0, cache: {} }
      fs.writeFileSync(CACHE_PATH, JSON.stringify(base, null, 2))
      return base
    }

    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
  } catch {
    return { updatedAt: 0, cache: {} }
  }
}

function writeCache(data) {
  try {
    ensureCacheDir()
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2))
  } catch {}
}

function cacheKey(mode, value = '') {
  return `${mode}:${normalize(value) || 'random'}`
}

function isCacheFresh(item) {
  return item?.updatedAt &&
    Date.now() - item.updatedAt < CACHE_MAX_AGE &&
    Array.isArray(item.tracks) &&
    item.tracks.length
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function detectModeFromInput(input) {
  const raw = S(input).trim()
  const parts = raw.split(/\s+/).filter(Boolean)
  const first = normalize(parts[0])

  if (!raw) return { mode: 'menu', value: '' }

  if (GENRES.includes(first)) {
    const rest = parts.slice(1).join(' ').trim()
    if (rest) return { mode: 'genre_artist', genre: first, artist: rest, value: `${first} ${rest}` }
    return { mode: 'genre', genre: first, value: first }
  }

  return { mode: 'artist', artist: raw, value: raw }
}

async function searchApple(query, forcedGenre = '') {
  const { data } = await axios.get('https://itunes.apple.com/search', {
    params: {
      term: query,
      country: 'IT',
      media: 'music',
      limit: 35
    },
    timeout: 20000
  })

  return (data?.results || [])
    .filter(t => t.previewUrl && t.trackName && t.artistName && t.artworkUrl100)
    .map(t => ({
      title: t.trackName,
      artist: t.artistName,
      genre: forcedGenre || t.primaryGenreName || 'N/D',
      preview: t.previewUrl,
      artwork: t.artworkUrl100.replace('100x100bb', '600x600bb'),
      source: 'Apple Music',
      url: t.trackViewUrl || 'https://music.apple.com'
    }))
}

async function searchDeezer(query, forcedGenre = '') {
  try {
    const { data } = await axios.get('https://api.deezer.com/search', {
      params: {
        q: query,
        limit: 35
      },
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    return (data?.data || [])
      .filter(t =>
        t.preview &&
        t.title &&
        t.artist?.name &&
        t.album?.cover_big
      )
      .map(t => ({
        title: t.title,
        artist: t.artist.name,
        genre: forcedGenre || 'N/D',
        preview: t.preview,
        artwork: t.album.cover_big,
        source: 'Deezer',
        url: t.link || 'https://www.deezer.com'
      }))
  } catch {
    return []
  }
}

async function searchTracksOnline(mode, value = '', genre = '', artist = '') {
  let queries = []

  if (mode === 'random') {
    queries = ['top hits italy', 'rap italiano', 'trap italiana', 'pop italiano', 'techno', 'house music', 'jazz']
  } else if (mode === 'genre') {
    queries = [`${genre} music`, `${genre} hits`, `${genre} italy`]
  } else if (mode === 'artist') {
    queries = [artist]
  } else if (mode === 'genre_artist') {
    queries = [`${artist} ${genre}`, artist]
  }

  let results = []

  for (const q of queries) {
    try { results.push(...await searchDeezer(q, genre || '')) } catch {}
    try { results.push(...await searchApple(q, genre || '')) } catch {}
  }

  const seen = new Set()

  results = results.filter(t => {
    const key = normalize(`${t.artist} ${t.title}`)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

if ((mode === 'artist' || mode === 'genre_artist') && artist) {
  const a = normalize(artist)

  let filtered = results.filter(t => {
    const artistName = normalize(t.artist)

    return (
      artistName.includes(a) ||
      a.includes(artistName) ||
      a.split(' ').every(word => artistName.includes(word))
    )
  })

  if (filtered.length) results = filtered
}

  if (!results.length) throw new Error('track_not_found')
  return results
}

async function getTrack(mode = 'random', value = '', genre = '', artist = '') {
  const db = readCache()
  const key = cacheKey(mode, value)

  if (isCacheFresh(db.cache[key])) {
    return pickRandom(db.cache[key].tracks)
  }

  const tracks = await searchTracksOnline(mode, value, genre, artist)

  db.cache[key] = {
    updatedAt: Date.now(),
    tracks
  }

  db.updatedAt = Date.now()
  writeCache(db)

  return pickRandom(tracks)
}

function modeButtons() {
  return [
    { buttonId: '.ic_random', buttonText: { displayText: '🎲 Casuale' }, type: 1 },
    { buttonId: '.ic_genre', buttonText: { displayText: '🎼 Genere' }, type: 1 },
    { buttonId: '.ic_artist', buttonText: { displayText: '👤 Artista' }, type: 1 }
  ]
}

function replayButtons() {
  return [
    { buttonId: '.ic', buttonText: { displayText: '🔁 Rigioca' }, type: 1 }
  ]
}

function cancelButtons() {
  return [
    { buttonId: '.ic', buttonText: { displayText: '↩️ Indietro' }, type: 1 }
  ]
}

function buildModeMessage() {
  return `*╭━━━━━━━🎵━━━━━━━╮*
*✦ 𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀 𝐋𝐀 𝐂𝐀𝐍𝐙𝐎𝐍𝐄 ✦*
*╰━━━━━━━🎵━━━━━━━╯*

*🎮 𝐒𝐜𝐞𝐠𝐥𝐢 𝐥𝐚 𝐦𝐨𝐝𝐚𝐥𝐢𝐭𝐚̀:*

*🎲 𝐂𝐚𝐬𝐮𝐚𝐥𝐞:* *𝐜𝐞𝐫𝐜𝐚 𝐝𝐚 𝐩𝐢𝐮̀ 𝐠𝐞𝐧𝐞𝐫𝐢.*
*🎼 𝐆𝐞𝐧𝐞𝐫𝐞:* *𝐬𝐜𝐞𝐠𝐥𝐢 𝐫𝐚𝐩, 𝐭𝐫𝐚𝐩, 𝐩𝐨𝐩, 𝐭𝐞𝐜𝐡𝐧𝐨...*
*👤 𝐀𝐫𝐭𝐢𝐬𝐭𝐚:* *𝐬𝐜𝐞𝐠𝐥𝐢 𝐮𝐧 𝐚𝐫𝐭𝐢𝐬𝐭𝐚.*`
}

function buildPromptMessage(type) {
  const label = type === 'genre' ? '𝐆𝐄𝐍𝐄𝐑𝐄' : '𝐀𝐑𝐓𝐈𝐒𝐓𝐀'
  const example = type === 'genre' ? 'trap' : 'Sfera Ebbasta'

  return `*╭━━━━━━━🔎━━━━━━━╮*
*✦ 𝐒𝐂𝐄𝐋𝐓𝐀 ${label} ✦*
*╰━━━━━━━🔎━━━━━━━╯*

*𝐒𝐜𝐫𝐢𝐯𝐢 𝐨𝐫𝐚 𝐢𝐥 ${type === 'genre' ? '𝐠𝐞𝐧𝐞𝐫𝐞' : '𝐧𝐨𝐦𝐞 𝐝𝐞𝐥𝐥’𝐚𝐫𝐭𝐢𝐬𝐭𝐚'}.*

*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:* *${example}*`
}

function buildStartMessage(track, timeLeft, modeLabel) {
  return withFooter(`*╭━━━━━━━🎵━━━━━━━╮*
*✦ 𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀 𝐋𝐀 𝐂𝐀𝐍𝐙𝐎𝐍𝐄 ✦*
*╰━━━━━━━🎵━━━━━━━╯*

*🎯 𝐌𝐨𝐝𝐚𝐥𝐢𝐭𝐚̀:* *${modeLabel}*
*⏱️ 𝐓𝐞𝐦𝐩𝐨:* *${timeLeft} 𝐬𝐞𝐜𝐨𝐧𝐝𝐢*
*🎼 𝐆𝐞𝐧𝐞𝐫𝐞:* *${track.genre || 'N/D'}*
*👤 𝐀𝐫𝐭𝐢𝐬𝐭𝐚:* *${track.artist}*

*🎧 𝐀𝐬𝐜𝐨𝐥𝐭𝐚 𝐥’𝐚𝐧𝐭𝐞𝐩𝐫𝐢𝐦𝐚 𝐞 𝐬𝐜𝐫𝐢𝐯𝐢 𝐢𝐥 𝐭𝐢𝐭𝐨𝐥𝐨.*`)
}

function finalContext(track) {
  return {
    externalAdReply: {
      title: track.title,
      body: `${track.artist} • ${track.genre || 'N/D'} • ${track.source || 'Music'}`,
      thumbnailUrl: track.artwork,
      sourceUrl: track.url || 'https://music.apple.com',
      mediaType: 1,
      renderLargerThumbnail: true
    }
  }
}

function buildEndMessage(track) {
  return `*╭━━━━━━━⏱️━━━━━━━╮*
*✦ 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎 ✦*
*╰━━━━━━━⏱️━━━━━━━╯*

*❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐨 𝐡𝐚 𝐢𝐧𝐝𝐨𝐯𝐢𝐧𝐚𝐭𝐨.*

*🎵 𝐓𝐢𝐭𝐨𝐥𝐨:* *${track.title}*
*👤 𝐀𝐫𝐭𝐢𝐬𝐭𝐚:* *${track.artist}*
*🎼 𝐆𝐞𝐧𝐞𝐫𝐞:* *${track.genre || 'N/D'}*
*📡 𝐅𝐨𝐧𝐭𝐞:* *${track.source || 'N/D'}*`
}

function buildWinMessage(track, reward, exp, user) {
  return `*╭━━━━━━━✅━━━━━━━╮*
*✦ 𝐑𝐈𝐒𝐏𝐎𝐒𝐓𝐀 𝐂𝐎𝐑𝐑𝐄𝐓𝐓𝐀 ✦*
*╰━━━━━━━✅━━━━━━━╯*

*🏆 𝐕𝐢𝐧𝐜𝐢𝐭𝐨𝐫𝐞:* *@${user.split('@')[0]}*

*🎵 𝐓𝐢𝐭𝐨𝐥𝐨:* *${track.title}*
*👤 𝐀𝐫𝐭𝐢𝐬𝐭𝐚:* *${track.artist}*
*🎼 𝐆𝐞𝐧𝐞𝐫𝐞:* *${track.genre || 'N/D'}*
*📡 𝐅𝐨𝐧𝐭𝐞:* *${track.source || 'N/D'}*

*🎁 𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚:*
*💶 +${reward} euro*
*✨ +${exp} exp*`
}
 
async function editGameMessage(conn, chat, key, text) {
  try {
    await conn.sendMessage(chat, {
      text,
      edit: key
    })
  } catch {}
}

async function startGame(m, conn, options = {}) {
  const chat = m.chat

  if (activeGames.has(chat)) {
    await react(conn, m, '⚠️')
    return conn.reply(
      m.chat,
      withFooter(`*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐏𝐀𝐑𝐓𝐈𝐓𝐀 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*𝐂’𝐞̀ 𝐠𝐢𝐚̀ 𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐭𝐭𝐢𝐯𝐚 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨.*`),
      m
    )
  }

  let audioPath = null
  let voicePath = null

  try {
    await react(conn, m, '🎵')

    const mode = options.mode || 'random'
    const genre = options.genre || ''
    const artist = options.artist || ''
    const value = options.value || genre || artist || 'random'

    const modeLabel =
      mode === 'genre' ? `genere: ${genre}` :
      mode === 'artist' ? `artista: ${artist}` :
      mode === 'genre_artist' ? `${genre} + ${artist}` :
      'casuale'

    const track = await getTrack(mode, value, genre, artist)

    const audioResponse = await axios.get(track.preview, {
      responseType: 'arraybuffer',
      timeout: 25000
    })

    const tmpDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const stamp = Date.now()
    audioPath = path.join(tmpDir, `song_${stamp}.m4a`)
    voicePath = path.join(tmpDir, `song_${stamp}.ogg`)

    fs.writeFileSync(audioPath, Buffer.from(audioResponse.data))
    
execSync(
  `ffmpeg -y -i "${audioPath}" -vn -ar 48000 -ac 1 -c:a libopus -b:a 32k -application voip -f ogg "${voicePath}"`
)

    const gameMsg = await conn.sendMessage(m.chat, {
      text: buildStartMessage(track, GAME_TIME, modeLabel)
    }, { quoted: m })

    const game = {
      track,
      timeLeft: GAME_TIME,
      messageKey: gameMsg?.key,
      interval: null,
      modeLabel
    }

    activeGames.set(chat, game)

await conn.sendMessage(m.chat, {
  audio: fs.readFileSync(voicePath),
  mimetype: 'audio/ogg; codecs=opus',
  ptt: true
}, { quoted: m })

    game.interval = setInterval(async () => {
      try {
        game.timeLeft -= TICK_TIME

        if (game.timeLeft > 0) {
          await editGameMessage(
            conn,
            chat,
            game.messageKey,
            buildStartMessage(track, game.timeLeft, modeLabel)
          )
          return
        }

        clearInterval(game.interval)
        activeGames.delete(chat)

        await editGameMessage(
          conn,
          chat,
          game.messageKey,
          buildStartMessage(track, 0, modeLabel)
        )

        await conn.sendMessage(m.chat, {
          text: buildEndMessage(track),
          footer: FOOTER,
          buttons: replayButtons(),
          headerType: 1,
          contextInfo: {
  externalAdReply: {
    title: track.title,
    body: `${track.artist} • ${track.genre || 'N/D'} • ${track.source || 'Music'}`,
    mediaType: 1,
    renderLargerThumbnail: true,
    showAdAttribution: false,
    thumbnailUrl: track.artwork,
    sourceUrl: track.url || 'https://music.apple.com'
  }
}
        }).catch(() => {})
      } catch (e) {
        console.error('Errore countdown:', e?.message || e)
      }
    }, TICK_TIME * 1000)

  } catch (e) {
    console.error('Errore indovina canzone:', e?.message || e)
    activeGames.delete(chat)
    await react(conn, m, '❌')

    return conn.reply(
      m.chat,
      withFooter(`*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐄𝐑𝐑𝐎𝐑𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥’𝐚𝐯𝐯𝐢𝐨 𝐝𝐞𝐥 𝐠𝐢𝐨𝐜𝐨.*

\`\`\`
${S(e?.message || e).slice(0, 1000)}
\`\`\``),
      m
    )
} finally {
    try { if (audioPath) fs.unlinkSync(audioPath) } catch {}
    try { if (voicePath) fs.unlinkSync(voicePath) } catch {}
  }
}

let handler = async (m, { conn, text, command }) => {

  const chat = m.chat
  const input = S(text).trim()

  if (command === 'ic_random') {
    pendingMode.delete(chat)
    return startGame(m, conn, { mode: 'random', value: 'random' })
  }

  if (command === 'ic_genre') {
    pendingMode.set(chat, { type: 'genre', user: m.sender, createdAt: Date.now() })

    return conn.sendMessage(m.chat, {
      text: buildPromptMessage('genre'),
      footer: FOOTER,
      buttons: cancelButtons(),
      headerType: 1
    }, { quoted: m })
  }

  if (command === 'ic_artist') {
    pendingMode.set(chat, { type: 'artist', user: m.sender, createdAt: Date.now() })

    return conn.sendMessage(m.chat, {
      text: buildPromptMessage('artist'),
      footer: FOOTER,
      buttons: cancelButtons(),
      headerType: 1
    }, { quoted: m })
  }

  if (input) {
    const detected = detectModeFromInput(input)

    if (detected.mode === 'genre') {
      return startGame(m, conn, {
        mode: 'genre',
        genre: detected.genre,
        value: detected.value
      })
    }

    if (detected.mode === 'genre_artist') {
      return startGame(m, conn, {
        mode: 'genre_artist',
        genre: detected.genre,
        artist: detected.artist,
        value: detected.value
      })
    }

    if (detected.mode === 'artist') {
      return startGame(m, conn, {
        mode: 'artist',
        artist: detected.artist,
        value: detected.value
      })
    }
  }

  return conn.sendMessage(m.chat, {
    text: buildModeMessage(),
    footer: FOOTER,
    buttons: modeButtons(),
    headerType: 1
  }, { quoted: m })
}

handler.before = async (m, { conn }) => {
  const chat = m.chat

  if (pendingMode.has(chat) && !activeGames.has(chat)) {
    const pending = pendingMode.get(chat)
    const input = S(m.text).trim()

    if (Date.now() - pending.createdAt > 60000) {
      pendingMode.delete(chat)
      return
    }

    if (!input || input.startsWith('.')) return

    pendingMode.delete(chat)

    if (pending.type === 'genre') {
      const genre = normalize(input)
      return startGame(m, conn, {
        mode: 'genre',
        genre,
        value: genre
      })
    }

    if (pending.type === 'artist') {
      return startGame(m, conn, {
        mode: 'artist',
        artist: input,
        value: input
      })
    }
  }

  if (!activeGames.has(chat)) return

  const game = activeGames.get(chat)
  const userAnswer = normalize(m.text || '')
  const correctAnswer = normalize(game.track.title)

  if (!userAnswer || userAnswer.length < 2) return

  const similarityScore = similarity(userAnswer, correctAnswer)

  const isCorrect =
    userAnswer.length > 1 &&
    (
      userAnswer === correctAnswer ||
      (correctAnswer.includes(userAnswer) && userAnswer.length > correctAnswer.length * 0.5) ||
      (userAnswer.includes(correctAnswer) && userAnswer.length < correctAnswer.length * 1.5) ||
      similarityScore >= 0.7
    )

  if (isCorrect) {
    clearInterval(game.interval)
    activeGames.delete(chat)

    await editGameMessage(
      conn,
      chat,
      game.messageKey,
      buildStartMessage(game.track, game.timeLeft, game.modeLabel)
    )

    const reward = Math.floor(Math.random() * (REWARD_MAX - REWARD_MIN + 1)) + REWARD_MIN
    const exp = REWARD_EXP

    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}

    global.db.data.users[m.sender].euro =
      (global.db.data.users[m.sender].euro || 0) + reward

    global.db.data.users[m.sender].exp =
      (global.db.data.users[m.sender].exp || 0) + exp

    await react(conn, m, '✅')

    await conn.sendMessage(m.chat, {
      text: buildWinMessage(game.track, reward, exp, m.sender),
      mentions: [m.sender],
      footer: FOOTER,
      buttons: replayButtons(),
      headerType: 1,
      contextInfo: {
  externalAdReply: {
    title: game.track.title,
    body: `${game.track.artist} • ${game.track.genre || 'N/D'} • ${game.track.source || 'Music'}`,
    mediaType: 1,
    renderLargerThumbnail: true,
    showAdAttribution: false,
    thumbnailUrl: game.track.artwork,
    sourceUrl: game.track.url || 'https://music.apple.com'
  }
}
    }, { quoted: m }).catch(() => {})

  } else if (similarityScore >= 0.3) {
    await react(conn, m, '❌')
    await conn.reply(
      m.chat,
      withFooter(`*👀 𝐂𝐢 𝐬𝐞𝐢 𝐪𝐮𝐚𝐬𝐢! 𝐑𝐢𝐩𝐫𝐨𝐯𝐚...*`),
      m
    )
  }
}

handler.help = [
  'indovinacanzone',
  'indovinacanzone <genere>',
  'indovinacanzone <artista>',
  'indovinacanzone <genere> <artista>'
]

handler.tags = ['giochi']
handler.command = ['indovinacanzone', 'ic', 'ic_random', 'ic_genre', 'ic_artist']
handler.group = true

export default handler