import fs from 'fs'
import { join } from 'path'
import { exec } from 'child_process'

global.converti = global.converti || {}

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
    q?.message?.videoMessage?.mimetype ||
    q?.message?.documentMessage?.mimetype ||
    ''
  )
}

function detectSourceType(mime = '') {
  if (/^audio\//i.test(mime)) return 'audio'
  if (/^video\//i.test(mime)) return 'video'
  return null
}

function getPanel(type) {
  const isAudio = type === 'audio'
  const title = isAudio ? '𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐈 𝐀𝐔𝐃𝐈𝐎' : '𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐈 𝐕𝐈𝐃𝐄𝐎'

  return `*╭━━━━━━━🔄━━━━━━━╮*
   *✦ ${title} ✦*
*╰━━━━━━━🔄━━━━━━━╯*

*𝐓𝐢𝐩𝐨 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨:* ${isAudio ? '𝐀𝐮𝐝𝐢𝐨' : '𝐕𝐢𝐝𝐞𝐨'}

*𝐍𝐨𝐭𝐚:* 𝐏𝐫𝐞𝐦𝐢 𝐮𝐧 𝐩𝐮𝐥𝐬𝐚𝐧𝐭𝐞 𝐩𝐞𝐫 𝐜𝐨𝐧𝐯𝐞𝐫𝐭𝐢𝐫𝐞 𝐬𝐮𝐛𝐢𝐭𝐨.`
}

function getButtons(prefix, type) {
  if (type === 'audio') {
    return [
      { buttonId: `${prefix}convdo mp3`, buttonText: { displayText: '🎵 𝐌𝐏𝟑' }, type: 1 },
      { buttonId: `${prefix}convdo ogg`, buttonText: { displayText: '🎙️ 𝐎𝐆𝐆' }, type: 1 },
      { buttonId: `${prefix}convdo aac`, buttonText: { displayText: '📀 𝐀𝐀𝐂' }, type: 1 }
    ]
  }

  return [
    { buttonId: `${prefix}convdo mp4`, buttonText: { displayText: '🎬 𝐌𝐏𝟒' }, type: 1 },
      { buttonId: `${prefix}convdo mp3`, buttonText: { displayText: '🎵 𝐌𝐏𝟑' }, type: 1 },
      { buttonId: `${prefix}convdo ogg`, buttonText: { displayText: '🎙️ 𝐎𝐆𝐆' }, type: 1 }
  ]
}

function saveState(sender, type, buffer) {
  global.converti[sender] = { type, buffer }
}

function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    const cmd = String(command || '').toLowerCase()

    if (cmd === 'converti') {
      const q = m.quoted || m
      const mime = getMime(q)
      const type = detectSourceType(mime)

      if (!type) {
        return m.reply('*𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐚𝐮𝐝𝐢𝐨 𝐨 𝐚 𝐮𝐧 𝐯𝐢𝐝𝐞𝐨.')
      }

      const buffer = await q.download()
      saveState(m.sender, type, buffer)

      return conn.sendMessage(m.chat, {
        text: getPanel(type),
        buttons: getButtons(usedPrefix, type),
        headerType: 1
      }, { quoted: m })
    }

    if (cmd === 'convdo') {
      const state = global.converti[m.sender]

      if (!state || !state.type || !state.buffer) {
        return m.reply(`*𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐀𝐩𝐫𝐢 𝐩𝐫𝐢𝐦𝐚 𝐢𝐥 𝐩𝐚𝐧𝐧𝐞𝐥𝐥𝐨 𝐜𝐨𝐧 ${usedPrefix}converti`)
      }

      const { type, buffer } = state
      const action = String(args[0] || '').toLowerCase()

      const allowed = type === 'audio'
        ? ['mp3', 'ogg', 'aac']
        : ['mp4', 'mp3', 'ogg']

      if (!allowed.includes(action)) {
        return m.reply('*𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐂𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐚.')
      }

      await m.react('⏳')

      const tempDir = ensureTempDir()
      const stamp = `${Date.now()}-${Math.floor(Math.random() * 9999)}`
      const inputExt = type === 'audio' ? 'ogg' : 'mp4'
      const input = join(tempDir, `${stamp}-input.${inputExt}`)
      const output = join(tempDir, `${stamp}-output.${action}`)

      try {
        fs.writeFileSync(input, buffer)

        let cmdFfmpeg = ''

        if (type === 'audio' && action === 'mp3') {
          cmdFfmpeg = `ffmpeg -y -i "${input}" -vn -ar 44100 -ac 2 -b:a 192k "${output}"`
        }

        if (type === 'audio' && action === 'ogg') {
          cmdFfmpeg = `ffmpeg -y -i "${input}" -c:a libopus -b:a 128k "${output}"`
        }

        if (type === 'audio' && action === 'aac') {
          cmdFfmpeg = `ffmpeg -y -i "${input}" -c:a aac -b:a 192k "${output}"`
        }

        if (type === 'video' && action === 'mp4') {
          cmdFfmpeg = `ffmpeg -y -i "${input}" -c:v libx264 -c:a aac -movflags +faststart "${output}"`
        }

        if (type === 'video' && action === 'mp3') {
          cmdFfmpeg = `ffmpeg -y -i "${input}" -vn -ar 44100 -ac 2 -b:a 192k "${output}"`
        }

        if (type === 'video' && action === 'ogg') {
          cmdFfmpeg = `ffmpeg -y -i "${input}" -vn -c:a libopus -b:a 128k "${output}"`
        }

        await runCmd(cmdFfmpeg)

        const buff = fs.readFileSync(output)

        if (action === 'mp4') {
          await conn.sendMessage(m.chat, {
            video: buff,
            mimetype: 'video/mp4'
          }, { quoted: m })
        } else if (action === 'ogg') {
          await conn.sendMessage(m.chat, {
            audio: buff,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          }, { quoted: m })
        } else if (action === 'aac') {
          await conn.sendMessage(m.chat, {
            audio: buff,
            mimetype: 'audio/aac'
          }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, {
            audio: buff,
            mimetype: 'audio/mpeg'
          }, { quoted: m })
        }

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
  } catch (e) {
    console.error(e)
    try { await m.react('❌') } catch {}
    return m.reply(`*𝐄𝐫𝐫𝐨𝐫𝐞:* ${e.message}`)
  }
}

handler.help = ['converti', 'convdo']
handler.tags = ['strumenti']
handler.command = /^(converti|convdo)$/i

export default handler