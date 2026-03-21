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
    label: 'Eco',
    description: 'Riverbero morbido e spaziale',
    build: (i) => ({
      type: 'af',
      value: `aecho=0.8:0.9:${200 + i * 10}:${(i / 100).toFixed(2)}`
    })
  },

  basso: {
    label: 'Basso',
    description: 'Rinforza le frequenze basse',
    build: (i) => ({
      type: 'af',
      value: `equalizer=f=94:width_type=o:width=2:g=${Math.max(4, Math.round(i / 3))}`
    })
  },

  acuto: {
    label: 'Acuto',
    description: 'Enfatizza le frequenze alte',
    build: (i) => ({
      type: 'af',
      value: `highpass=f=${300 + i * 8}`
    })
  },

  grave: {
    label: 'Grave',
    description: 'Taglia le alte e rende il suono più cupo',
    build: (i) => ({
      type: 'af',
      value: `lowpass=f=${900 - Math.min(500, i * 4)}`
    })
  },

  radio: {
    label: 'Radio',
    description: 'Effetto radio compresso',
    build: (i) => ({
      type: 'af',
      value: `bandpass=f=${1200 + i * 5}:width_type=h,highpass=f=200,lowpass=f=${2600 + i * 4}`
    })
  },

  telefono: {
    label: 'Telefono',
    description: 'Voce stretta tipo chiamata',
    build: (i) => ({
      type: 'af',
      value: `highpass=f=${700 + i},lowpass=f=${3000 - Math.min(800, i * 4)}`
    })
  },

  robot: {
    label: 'Robot',
    description: 'Voce metallica artificiale',
    build: (i) => ({
      type: 'filter_complex',
      value: `afftfilt=real='hypot(re,im)*sin(${Math.max(0.2, i / 100)})':imag='hypot(re,im)*cos(${Math.max(0.2, i / 100)})':win_size=512:overlap=0.75`
    })
  },

  alien: {
    label: 'Alien',
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
    label: 'Demone',
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
    label: 'Vinile',
    description: 'Timbro vintage più caldo',
    build: (i) => ({
      type: 'af',
      value: `aresample=48000,asetrate=48000*${(0.88 - Math.min(0.18, i / 400)).toFixed(2)}`
    })
  },

  nightcore: {
    label: 'Nightcore',
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
    label: 'Vibrato',
    description: 'Oscillazione ritmica della voce',
    build: (i) => ({
      type: 'af',
      value: `vibrato=f=${(4 + i / 20).toFixed(1)}:d=${(0.2 + i / 200).toFixed(2)}`
    })
  },

  tremolo: {
    label: 'Tremolo',
    description: 'Pulsazione regolare del volume',
    build: (i) => ({
      type: 'af',
      value: `tremolo=f=${(4 + i / 15).toFixed(1)}:d=${(0.3 + i / 150).toFixed(2)}`
    })
  },

  inverso: {
    label: 'Inverso',
    description: 'Riproduzione al contrario',
    build: () => ({
      type: 'filter_complex',
      value: `areverse`
    })
  }
}

function getBar(intensity = 50) {
  const total = 10
  const filled = Math.max(0, Math.min(total, Math.round(intensity / 10)))
  return '▰'.repeat(filled) + '▱'.repeat(total - filled)
}

function getLevelName(intensity = 50) {
  if (intensity <= 25) return 'Basso'
  if (intensity <= 50) return 'Medio'
  if (intensity <= 75) return 'Alto'
  return 'Massimo'
}

function getPanel(effectKey, intensity) {
  const effect = EFFECTS[effectKey]
  return `*╭━━━━━━━🎛️━━━━━━━╮*
   *✦ 𝐀𝐔𝐃𝐈𝐎 𝐅𝐗 ✦*
*╰━━━━━━━🎛️━━━━━━━╯*

*🎚️ 𝐄𝐟𝐟𝐞𝐭𝐭𝐨:* ${effect.label}
*📖 𝐃𝐞𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞:* ${effect.description}
*⚡ 𝐈𝐧𝐭𝐞𝐧𝐬𝐢𝐭à:* ${intensity}%
*🎛️ 𝐋𝐢𝐯𝐞𝐥𝐥𝐨:* ${getLevelName(intensity)}
*📊 ${getBar(intensity)}*

*📌 Rispondi a un audio e premi Applica.*`
}

function getMenu(prefix) {
  const names = Object.keys(EFFECTS)
    .map(k => `*• ${k}*`)
    .join('\n')

  return `*╭━━━━━━━🎵━━━━━━━╮*
   *✦ 𝐄𝐅𝐅𝐄𝐓𝐓𝐈 𝐀𝐔𝐃𝐈𝐎 ✦*
*╰━━━━━━━🎵━━━━━━━╯*

*Usa:* \`${prefix}fx nomeeffetto\`

*Esempi:*
\`${prefix}fx eco\`
\`${prefix}fx robot\`
\`${prefix}fx alien\`

*Effetti disponibili:*
${names}`
}

function getButtons(prefix, effectKey) {
  return [
    { buttonId: `${prefix}fxset ${effectKey} basso`, buttonText: { displayText: '🔹 Basso' }, type: 1 },
    { buttonId: `${prefix}fxset ${effectKey} medio`, buttonText: { displayText: '🔸 Medio' }, type: 1 },
    { buttonId: `${prefix}fxset ${effectKey} alto`, buttonText: { displayText: '🟠 Alto' }, type: 1 },
    { buttonId: `${prefix}fxset ${effectKey} massimo`, buttonText: { displayText: '🔴 Massimo' }, type: 1 },
    { buttonId: `${prefix}fxapply`, buttonText: { displayText: '✅ Applica' }, type: 1 }
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
    ''
  )
}

function runFfmpeg(input, output, effectConfig) {
  return new Promise((resolve, reject) => {
    const cmd =
      effectConfig.type === 'filter_complex'
        ? `ffmpeg -y -i "${input}" -filter_complex "${effectConfig.value}" "${output}"`
        : `ffmpeg -y -i "${input}" -af "${effectConfig.value}" "${output}"`

    exec(cmd, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const cmd = String(command || '').toLowerCase()

    // compatibilità: .eco .robot .alien ecc.
    if (EFFECTS[cmd]) {
      global.audiofx[m.sender] = {
        effect: cmd,
        intensity: 50
      }

      return conn.sendMessage(m.chat, {
        text: getPanel(cmd, 50),
        buttons: getButtons(usedPrefix, cmd),
        headerType: 1
      }, { quoted: m })
    }

    if (cmd === 'effetti') {
      return m.reply(getMenu(usedPrefix))
    }

    if (cmd === 'fx') {
      const effectKey = String(args[0] || '').toLowerCase()

      if (!effectKey) {
        return m.reply(getMenu(usedPrefix))
      }

      if (!EFFECTS[effectKey]) {
        return m.reply(`*❌ Effetto non valido.*\n\nUsa *${usedPrefix}effetti* per vedere la lista.`)
      }

      global.audiofx[m.sender] = {
        effect: effectKey,
        intensity: 50
      }

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
        return m.reply(`*❌ Effetto non valido.*`)
      }

      if (!(levelKey in LEVELS)) {
        return m.reply(`*❌ Livello non valido.* Usa: *basso, medio, alto, massimo*`)
      }

      const intensity = LEVELS[levelKey]

      global.audiofx[m.sender] = {
        effect: effectKey,
        intensity
      }

      return conn.sendMessage(m.chat, {
        text: getPanel(effectKey, intensity),
        buttons: getButtons(usedPrefix, effectKey),
        headerType: 1
      }, { quoted: m })
    }

    if (cmd === 'fxapply') {
      const state = global.audiofx[m.sender]
      if (!state) {
        return m.reply(`*⚠️ Apri prima un effetto con* *${usedPrefix}fx nomeeffetto*`)
      }

      const q = m.quoted || m
      const mime = getMime(q)

      if (!/audio/.test(mime)) {
        return m.reply('*❌ Rispondi a un audio o a una nota vocale.*')
      }

      await m.react('⏳')

      const tempDir = ensureTempDir()
      const input = await q.download(true)
      const output = join(tempDir, `${Date.now()}-${Math.floor(Math.random() * 9999)}.mp3`)

      try {
        const effectConfig = EFFECTS[state.effect].build(state.intensity)
        await runFfmpeg(input, output, effectConfig)

        const buff = fs.readFileSync(output)

        await conn.sendFile(
          m.chat,
          buff,
          `${state.effect}.mp3`,
          null,
          m,
          true,
          {
            type: 'audioMessage',
            ptt: true
          }
        )

        await m.react('✅')
      } catch (e) {
        console.error(e)
        await m.react('❌')
        await m.reply(`*❌ Errore:* ${e.message}`)
      } finally {
        safeUnlink(input)
        safeUnlink(output)
      }

      return
    }
  } catch (e) {
    console.error(e)
    try { await m.react('❌') } catch {}
    return m.reply(`*❌ Errore:* ${e.message}`)
  }
}

handler.help = ['effetti', 'fx', 'fxset', 'fxapplica']
handler.tags = ['strumenti']
handler.command = /^(effetti|fx|fxset|fxapplica|eco|basso|acuto|grave|radio|telefono|robot|alien|demone|vinile|nightcore|vibrato|tremolo|inverso)$/i

export default handler