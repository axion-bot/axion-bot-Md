import fs from 'fs'
import { join } from 'path'
import { exec } from 'child_process'

global.audiofx = global.audiofx || {}

const LEVELS = {
  basso: 25,
  medio: 50,
  alto: 75,
  massimo: 100
}

const EFFECTS = {
  eco: {
    label: '𝐄𝐜𝐨',
    description: 'Riverbero morbido e spaziale',
    build: (i) => ({
      type: 'af',
      value: `aecho=0.8:0.9:${200 + i * 10}:${(i / 100).toFixed(2)}`
    })
  },

  basso: {
    label: '𝐁𝐚𝐬𝐬𝐨',
    description: 'Rinforza le frequenze basse',
    build: (i) => ({
      type: 'af',
      value: `equalizer=f=94:width_type=o:width=2:g=${Math.max(4, Math.round(i / 3))}`
    })
  },

  acuto: {
    label: '𝐀𝐜𝐮𝐭𝐨',
    description: 'Enfatizza le frequenze alte',
    build: (i) => ({
      type: 'af',
      value: `highpass=f=${300 + i * 8}`
    })
  },

  grave: {
    label: '𝐆𝐫𝐚𝐯𝐞',
    description: 'Taglia le alte e rende il suono più cupo',
    build: (i) => ({
      type: 'af',
      value: `lowpass=f=${900 - Math.min(500, i * 4)}`
    })
  },

  radio: {
    label: '𝐑𝐚𝐝𝐢𝐨',
    description: 'Effetto radio compresso',
    build: (i) => ({
      type: 'af',
      value: `bandpass=f=${1200 + i * 5}:width_type=h,highpass=f=200,lowpass=f=${2600 + i * 4}`
    })
  },

  telefono: {
    label: '𝐓𝐞𝐥𝐞𝐟𝐨𝐧𝐨',
    description: 'Voce stretta tipo chiamata',
    build: (i) => ({
      type: 'af',
      value: `highpass=f=${700 + i},lowpass=f=${3000 - Math.min(800, i * 4)}`
    })
  },

  robot: {
    label: '𝐑𝐨𝐛𝐨𝐭',
    description: 'Voce metallica artificiale',
    build: (i) => ({
      type: 'filter_complex',
      value: `afftfilt=real='hypot(re,im)*sin(${Math.max(0.2, i / 100)})':imag='hypot(re,im)*cos(${Math.max(0.2, i / 100)})':win_size=512:overlap=0.75`
    })
  },

  alien: {
    label: '𝐀𝐥𝐢𝐞𝐧',
    description: 'Voce alterata e spaziale',
    build: (i) => {
      const rate = (1.15 + i / 120).toFixed(2)
      const tempo = (0.85 - Math.min(0.2, i / 1000)).toFixed(2)
      const echo = (0.2 + i / 250).toFixed(2)
      return {
        type: 'af',
        value: `asetrate=44100*${rate},atempo=${tempo},aecho=0.8:0.8:50:${echo}`
      }
    }
  },

  demone: {
    label: '𝐃𝐞𝐦𝐨𝐧𝐞',
    description: 'Voce bassa e distorta',
    build: (i) => {
      const rate = (0.9 - Math.min(0.35, i / 250)).toFixed(2)
      const crush = (0.05 + i / 2000).toFixed(3)
      return {
        type: 'af',
        value: `asetrate=44100*${rate},acrusher=${crush}:1:64:0:log`
      }
    }
  },

  vinile: {
    label: '𝐕𝐢𝐧𝐢𝐥𝐞',
    description: 'Timbro vintage più caldo',
    build: (i) => ({
      type: 'af',
      value: `aresample=48000,asetrate=48000*${(0.88 - Math.min(0.18, i / 400)).toFixed(2)}`
    })
  },

  nightcore: {
    label: '𝐍𝐢𝐠𝐡𝐭𝐜𝐨𝐫𝐞',
    description: 'Voce più veloce e alta',
    build: (i) => {
      const mult = (1.08 + i / 500).toFixed(2)
      return {
        type: 'af',
        value: `atempo=${(1.0 + i / 500).toFixed(2)},asetrate=44100*${mult}`
      }
    }
  },

  vibrato: {
    label: '𝐕𝐢𝐛𝐫𝐚𝐭𝐨',
    description: 'Oscillazione ritmica della voce',
    build: (i) => ({
      type: 'af',
      value: `vibrato=f=${(4 + i / 20).toFixed(1)}:d=${(0.2 + i / 200).toFixed(2)}`
    })
  },

  tremolo: {
    label: '𝐓𝐫𝐞𝐦𝐨𝐥𝐨',
    description: 'Pulsazione regolare del volume',
    build: (i) => ({
      type: 'af',
      value: `tremolo=f=${(4 + i / 15).toFixed(1)}:d=${(0.3 + i / 150).toFixed(2)}`
    })
  },

  inverso: {
    label: '𝐈𝐧𝐯𝐞𝐫𝐬𝐨',
    description: 'Riproduzione al contrario',
    build: () => ({
      type: 'filter_complex',
      value: 'areverse'
    })
  },

  chipmunks: {
    label: '𝐂𝐡𝐢𝐩𝐦𝐮𝐧𝐤𝐬',
    description: 'Voce super acuta stile scoiattolo',
    build: (i) => {
      const rate = (1.35 + i / 200).toFixed(2)
      const tempo = (0.88 - Math.min(0.18, i / 1000)).toFixed(2)
      return {
        type: 'af',
        value: `asetrate=44100*${rate},atempo=${tempo}`
      }
    }
  },

  earrape: {
    label: '𝐄𝐚𝐫𝐫𝐚𝐩𝐞',
    description: 'Volume estremo e aggressivo',
    build: (i) => ({
      type: 'af',
      value: `volume=${(2 + i / 8).toFixed(1)},alimiter=limit=0.95`
    })
  },

  distorto: {
    label: '𝐃𝐢𝐬𝐭𝐨𝐫𝐭𝐨',
    description: 'Voce sporca e aggressiva',
    build: (i) => {
      const crush = (0.03 + i / 1800).toFixed(3)
      return {
        type: 'af',
        value: `acrusher=${crush}:1:64:0:log,firequalizer=gain_entry='entry(0,12);entry(250,0);entry(4000,12)'`
      }
    }
  },

  '8d': {
    label: '𝐄𝐢𝐠𝐡𝐭 𝐃',
    description: 'Effetto stereo in movimento',
    build: (i) => ({
      type: 'af',
      value: `apulsator=hz=${(0.05 + i / 2000).toFixed(3)}`
    })
  },

  flanger: {
    label: '𝐅𝐥𝐚𝐧𝐠𝐞𝐫',
    description: 'Modulazione metallica oscillante',
    build: (i) => ({
      type: 'af',
      value: `flanger=delay=${10 + Math.round(i / 5)}:depth=${(0.1 + i / 500).toFixed(2)}`
    })
  },

  coro: {
    label: '𝐂𝐨𝐫𝐨',
    description: 'Voce sdoppiata tipo chorus',
    build: (i) => ({
      type: 'af',
      value: `chorus=0.7:0.9:${40 + Math.round(i / 2)}:0.4:0.25:2`
    })
  },

  sottacqua: {
    label: '𝐒𝐨𝐭𝐭𝐚𝐜𝐪𝐮𝐚',
    description: 'Suono ovattato e profondo',
    build: (i) => ({
      type: 'af',
      value: `asetrate=44100*${(0.75 - Math.min(0.2, i / 500)).toFixed(2)},atempo=${(1.2 + i / 400).toFixed(2)},lowpass=f=${400 - Math.min(150, i)}`
    })
  },

  metallico: {
    label: '𝐌𝐞𝐭𝐚𝐥𝐥𝐢𝐜𝐨',
    description: 'Risonanza metallica corta',
    build: (i) => ({
      type: 'af',
      value: `aecho=0.8:0.88:${5 + Math.round(i / 8)}:${(0.3 + i / 200).toFixed(2)}`
    })
  },

  profondo: {
    label: '𝐏𝐫𝐨𝐟𝐨𝐧𝐝𝐨',
    description: 'Voce più scura e lenta',
    build: (i) => {
      const rate = (0.9 - Math.min(0.25, i / 350)).toFixed(2)
      const tempo = (1.05 + i / 500).toFixed(2)
      return {
        type: 'af',
        value: `asetrate=44500*${rate},atempo=${tempo}`
      }
    }
  },

  lento: {
    label: '𝐋𝐞𝐧𝐭𝐨',
    description: 'Rallenta la voce',
    build: (i) => ({
      type: 'af',
      value: `atempo=${Math.max(0.55, 1 - i / 200).toFixed(2)}`
    })
  },

  veloce: {
    label: '𝐕𝐞𝐥𝐨𝐜𝐞',
    description: 'Accelera la voce',
    build: (i) => ({
      type: 'af',
      value: `atempo=${(1 + i / 100).toFixed(2)}`
    })
  },

  cristallino: {
    label: '𝐂𝐫𝐢𝐬𝐭𝐚𝐥𝐥𝐢𝐧𝐨',
    description: 'Voce più nitida e brillante',
    build: (i) => ({
      type: 'af',
      value: `crystalizer=i=${Math.max(2, Math.round(i / 12))}`
    })
  }
}

function getBar(intensity = 50) {
  const total = 10
  const filled = Math.max(0, Math.min(total, Math.round(intensity / 10)))
  return '🟩'.repeat(filled) + '⬜'.repeat(total - filled)
}

function getLevelName(intensity = 50) {
  if (intensity <= 25) return '𝐁𝐚𝐬𝐬𝐨'
  if (intensity <= 50) return '𝐌𝐞𝐝𝐢𝐨'
  if (intensity <= 75) return '𝐀𝐥𝐭𝐨'
  return '𝐌𝐚𝐬𝐬𝐢𝐦𝐨'
}

function getPanel(effectKey, intensity) {
  const effect = EFFECTS[effectKey]
  return `*╭━━━━━━━🎛️━━━━━━━╮*
   *✦ 𝐀𝐔𝐃𝐈𝐎 𝐅𝐗 ✦*
*╰━━━━━━━🎛️━━━━━━━╯*

*𝐄𝐟𝐟𝐞𝐭𝐭𝐨:* ${effect.label}
*𝐃𝐞𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞:* ${effect.description}
*𝐈𝐧𝐭𝐞𝐧𝐬𝐢𝐭à:* ${intensity}%
*𝐋𝐢𝐯𝐞𝐥𝐥𝐨:* ${getLevelName(intensity)}
*𝐁𝐚𝐫𝐫𝐚:* ${getBar(intensity)}

*𝐍𝐨𝐭𝐚:* 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐚𝐮𝐝𝐢𝐨 𝐞 𝐮𝐬𝐚 𝐪𝐮𝐞𝐬𝐭𝐨 𝐩𝐚𝐧𝐧𝐞𝐥𝐥𝐨.`
}

function getMenu(prefix) {
  const names = Object.keys(EFFECTS)
    .map(k => `• ${k}`)
    .join('\n')

  return `*╭━━━━━━━🎵━━━━━━━╮*
   *✦ 𝐄𝐅𝐅𝐄𝐓𝐓𝐈 𝐀𝐔𝐃𝐈𝐎 ✦*
*╰━━━━━━━🎵━━━━━━━╯*

*𝐔𝐬𝐨:* ${prefix}fx nomeeffetto

*𝐄𝐬𝐞𝐦𝐩𝐢:*
${prefix}fx eco
${prefix}fx robot
${prefix}fx alien

*𝐄𝐟𝐟𝐞𝐭𝐭𝐢:*
${names}`
}

function getButtons(prefix, effectKey) {
  return [
    { buttonId: `${prefix}fxset ${effectKey} basso`, buttonText: { displayText: '🔹 Basso' }, type: 1 },
    { buttonId: `${prefix}fxset ${effectKey} medio`, buttonText: { displayText: '🔸 Medio' }, type: 1 },
    { buttonId: `${prefix}fxset ${effectKey} alto`, buttonText: { displayText: '🟠 Alto' }, type: 1 },
    { buttonId: `${prefix}fxset ${effectKey} massimo`, buttonText: { displayText: '🔴 Massimo' }, type: 1 },
    { buttonId: `${prefix}fxapply`, buttonText: { displayText: '✅ Applica' }, type: 1 },
    { buttonId: `${prefix}fxreset`, buttonText: { displayText: '❌ Reset' }, type: 1 }
  ]
}

function ensureTempDir() {
  const dir = join(process.cwd(), 'temp')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function safeUnlink(file) {
  try {
    if (file && fs.existsSync(file)) fs.unlinkSync(file)
  } catch {}
}

function getMime(q) {
  return (
    q?.mimetype ||
    q?.msg?.mimetype ||
    q?.message?.audioMessage?.mimetype ||
    q?.message?.documentMessage?.mimetype ||
    ''
  )
}

function runFfmpeg(input, output, effectConfig) {
  return new Promise((resolve, reject) => {
    const cmd =
      effectConfig.type === 'filter_complex'
        ? `ffmpeg -y -i "${input}" -filter_complex "${effectConfig.value}" -c:a libopus -b:a 128k "${output}"`
        : `ffmpeg -y -i "${input}" -af "${effectConfig.value}" -c:a libopus -b:a 128k "${output}"`

    exec(cmd, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function saveState(sender, effect, intensity, sourceBuffer) {
  global.audiofx[sender] = {
    effect,
    intensity,
    sourceBuffer: sourceBuffer || null
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const cmd = String(command || '').toLowerCase()

    if (cmd === 'effetti') {
      return m.reply(getMenu(usedPrefix))
    }

    if (EFFECTS[cmd]) {
      const q = m.quoted || m
      const mime = getMime(q)

      if (!/audio/.test(mime)) {
        return m.reply('*𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐚𝐮𝐝𝐢𝐨 𝐨 𝐚 𝐮𝐧𝐚 𝐧𝐨𝐭𝐚 𝐯𝐨𝐜𝐚𝐥𝐞 𝐩𝐫𝐢𝐦𝐚 𝐝𝐢 𝐬𝐜𝐞𝐠𝐥𝐢𝐞𝐫𝐞 𝐥’𝐞𝐟𝐟𝐞𝐭𝐭𝐨.')
      }

      const inputBuffer = await q.download()
      saveState(m.sender, cmd, 50, inputBuffer)

      return conn.sendMessage(m.chat, {
        text: getPanel(cmd, 50),
        buttons: getButtons(usedPrefix, cmd),
        headerType: 1
      }, { quoted: m })
    }

    if (cmd === 'fx') {
      const effectKey = String(args[0] || '').toLowerCase()

      if (!effectKey) {
        return m.reply(getMenu(usedPrefix))
      }

      if (!EFFECTS[effectKey]) {
        return m.reply(`*𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐄𝐟𝐟𝐞𝐭𝐭𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.\n\n*𝐔𝐬𝐚:* ${usedPrefix}effetti`)
      }

      const q = m.quoted || m
      const mime = getMime(q)

      if (!/audio/.test(mime)) {
        return m.reply('*𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐚𝐮𝐝𝐢𝐨 𝐨 𝐚 𝐮𝐧𝐚 𝐧𝐨𝐭𝐚 𝐯𝐨𝐜𝐚𝐥𝐞 𝐩𝐫𝐢𝐦𝐚 𝐝𝐢 𝐚𝐩𝐫𝐢𝐫𝐞 𝐢𝐥 𝐩𝐚𝐧𝐧𝐞𝐥𝐥𝐨.')
      }

      const inputBuffer = await q.download()
      saveState(m.sender, effectKey, 50, inputBuffer)

      return conn.sendMessage(m.chat, {
        text: getPanel(effectKey, 50),
        buttons: getButtons(usedPrefix, effectKey),
        headerType: 1
      }, { quoted: m })
    }

    if (cmd === 'fxset') {
      const effectKey = String(args[0] || '').toLowerCase()
      const levelKey = String(args[1] || '').toLowerCase()

      if (!EFFECTS[effectKey]) {
        return m.reply('*𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐄𝐟𝐟𝐞𝐭𝐭𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.')
      }

      if (!(levelKey in LEVELS)) {
        return m.reply('*𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐋𝐢𝐯𝐞𝐥𝐥𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.\n\n*𝐔𝐬𝐚:* basso, medio, alto, massimo')
      }

      const state = global.audiofx[m.sender]
      if (!state || state.effect !== effectKey || !state.sourceBuffer) {
        return m.reply(`*𝐍𝐨𝐭𝐚:* 𝐀𝐩𝐫𝐢 𝐩𝐫𝐢𝐦𝐚 𝐮𝐧 𝐞𝐟𝐟𝐞𝐭𝐭𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐧𝐝𝐨 𝐚 𝐮𝐧 𝐚𝐮𝐝𝐢𝐨 𝐜𝐨𝐧 ${usedPrefix}fx ${effectKey}`)
      }

      const intensity = LEVELS[levelKey]
      saveState(m.sender, effectKey, intensity, state.sourceBuffer)

      return conn.sendMessage(m.chat, {
        text: getPanel(effectKey, intensity),
        buttons: getButtons(usedPrefix, effectKey),
        headerType: 1
      }, { quoted: m })
    }

    if (cmd === 'fxapply') {
      const state = global.audiofx[m.sender]
      if (!state || !state.effect || !state.sourceBuffer) {
        return m.reply(`*𝐍𝐨𝐭𝐚:* 𝐀𝐩𝐫𝐢 𝐩𝐫𝐢𝐦𝐚 𝐮𝐧 𝐞𝐟𝐟𝐞𝐭𝐭𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐧𝐝𝐨 𝐚 𝐮𝐧 𝐚𝐮𝐝𝐢𝐨 𝐜𝐨𝐧 ${usedPrefix}fx nomeeffetto`)
      }

      await m.react('⏳')

      const tempDir = ensureTempDir()
      const stamp = `${Date.now()}-${Math.floor(Math.random() * 9999)}`
      const input = join(tempDir, `${stamp}-input.ogg`)
      const output = join(tempDir, `${stamp}-output.ogg`)

      try {
        fs.writeFileSync(input, state.sourceBuffer)

        const effectConfig = EFFECTS[state.effect].build(state.intensity)
        await runFfmpeg(input, output, effectConfig)

        const buff = fs.readFileSync(output)

        await conn.sendMessage(
          m.chat,
          {
            audio: buff,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          },
          { quoted: m }
        )

        await m.react('✅')
      } catch (e) {
        console.error(e)
        await m.react('❌')
        await m.reply(`*𝐄𝐫𝐫𝐨𝐫𝐞:* ${e.message}`)
      } finally {
        safeUnlink(input)
        safeUnlink(output)
      }

      return
    }

    if (cmd === 'fxreset') {
      if (!global.audiofx[m.sender]) {
        return m.reply('*𝐍𝐨𝐭𝐚:* 𝐍𝐞𝐬𝐬𝐮𝐧 𝐩𝐚𝐧𝐧𝐞𝐥𝐥𝐨 𝐚𝐭𝐭𝐢𝐯𝐨 𝐝𝐚 𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐫𝐞.')
      }

      delete global.audiofx[m.sender]
      return m.reply('*✅ 𝐑𝐞𝐬𝐞𝐭 𝐞𝐟𝐟𝐞𝐭𝐭𝐮𝐚𝐭𝐨.*\n\n𝐎𝐫𝐚 𝐩𝐮𝐨𝐢 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞 𝐚 𝐮𝐧 𝐧𝐮𝐨𝐯𝐨 𝐚𝐮𝐝𝐢𝐨 𝐞 𝐫𝐢𝐚𝐩𝐫𝐢𝐫𝐞 𝐢𝐥 𝐩𝐚𝐧𝐧𝐞𝐥𝐥𝐨.')
    }
  } catch (e) {
    console.error(e)
    try { await m.react('❌') } catch {}
    return m.reply(`*𝐄𝐫𝐫𝐨𝐫𝐞:* ${e.message}`)
  }
}

handler.help = ['effetti', 'fx', 'fxset', 'fxapply', 'fxreset']
handler.tags = ['strumenti']
handler.command = /^(effetti|fx|fxset|fxapply|fxreset|eco|basso|acuto|grave|radio|telefono|robot|alien|demone|vinile|nightcore|vibrato|tremolo|inverso|chipmunks|earrape|distorto|8d|flanger|coro|sottacqua|metallico|profondo|lento|veloce|cristallino)$/i

export default handler