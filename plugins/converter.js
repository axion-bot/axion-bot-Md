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

function getPanel(type, currentAction = null) {
  const isAudio = type === 'audio'
  const title = isAudio ? '𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐈 𝐀𝐔𝐃𝐈𝐎' : '𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐈 𝐕𝐈𝐃𝐄𝐎'

  let options = ''
  if (isAudio) {
    options =
`*𝐅𝐨𝐫𝐦𝐚𝐭𝐢 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐢:*
• mp3
• ogg
• aac`
  } else {
    options =
`*𝐅𝐨𝐫𝐦𝐚𝐭𝐢 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐢:*
• mp4
• mp3
• ogg`
  }

  return `*╭━━━━━━━🔄━━━━━━━╮*
   *✦ ${title} ✦*
*╰━━━━━━━🔄━━━━━━━╯*

*𝐓𝐢𝐩𝐨 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨:* ${isAudio ? '𝐀𝐮𝐝𝐢𝐨' : '𝐕𝐢𝐝𝐞𝐨'}
*𝐒𝐞𝐥𝐞𝐳𝐢𝐨𝐧𝐞:* ${currentAction ? currentAction : '𝐍𝐞𝐬𝐬𝐮𝐧𝐚'}

${options}

*𝐍𝐨𝐭𝐚:* 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐟𝐢𝐥𝐞 𝐞 𝐮𝐬𝐚 𝐢𝐥 𝐩𝐚𝐧𝐧𝐞𝐥𝐥𝐨.`
}

function getButtons(prefix, type) {
  if (type === 'audio') {
    return [
      { buttonId: `${prefix}convset mp3`, buttonText: { displayText: '🎵 𝐌𝐏𝟑' }, type: 1 },
      { buttonId: `${prefix}convset ogg`, buttonText: { displayText: '🎙️ 𝐎𝐆𝐆' }, type: 1 },
      { buttonId: `${prefix}convset aac`, buttonText: { displayText: '📀 𝐀𝐀𝐂' }, type: 1 },
      { buttonId: `${prefix}convapply`, buttonText: { displayText: '✅ 𝐀𝐩𝐩𝐥𝐢𝐜𝐚' }, type: 1 },
      { buttonId: `${prefix}convreset`, buttonText: { displayText: '❌ 𝐑𝐞𝐬𝐞𝐭' }, type: 1 }
    ]
  }

  return [
    { buttonId: `${prefix}convset mp4`, buttonText: { displayText: '🎬 𝐌𝐏𝟒' }, type: 1 },
    { buttonId: `${prefix}convset mp3`, buttonText: { displayText: '🎵 𝐌𝐏𝟑' }, type: 1 },
    { buttonId: `${prefix}convset ogg`, buttonText: { displayText: '🎙️ 𝐎𝐆𝐆' }, type: 1 },
    { buttonId: `${prefix}convapply`, buttonText: { displayText: '✅ 𝐀𝐩𝐩𝐥𝐢𝐜𝐚' }, type: 1 },
    { buttonId: `${prefix}convreset`, buttonText: { displayText: '❌ 𝐑𝐞𝐬𝐞𝐭' }, type: 1 }
  ]
}

function saveState(sender, sourceType, sourceBuffer, action = null) {
  global.converti[sender] = {
    sourceType,
    sourceBuffer,
    action
  }
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
      const sourceType = detectSourceType(mime)

      if (!sourceType) {
        return m.reply('*𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐚𝐮𝐝𝐢𝐨 𝐨 𝐚 𝐮𝐧 𝐯𝐢𝐝𝐞𝐨.')
      }

      const buffer = await q.download()
      saveState(m.sender, sourceType, buffer, null)

      return conn.sendMessage(m.chat, {
        text: getPanel(sourceType),
        buttons: getButtons(usedPrefix, sourceType),
        headerType: 1
      }, { quoted: m })
    }

    if (cmd === 'convset') {
      const state = global.converti[m.sender]
      if (!state || !state.sourceType || !state.sourceBuffer) {
        return m.reply(`*𝐍𝐨𝐭𝐚:* 𝐀𝐩𝐫𝐢 𝐩𝐫𝐢𝐦𝐚 𝐢𝐥 𝐩𝐚𝐧𝐧𝐞𝐥𝐥𝐨 𝐜𝐨𝐧 ${usedPrefix}converti`)
      }

      const action = String(args[0] || '').toLowerCase()
      const allowed = state.sourceType === 'audio'
        ? ['mp3', 'ogg', 'aac']
        : ['mp4', 'mp3', 'ogg']

      if (!allowed.includes(action)) {
        return m.reply('*𝐄𝐫𝐫𝐨𝐫𝐞:* 𝐂𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐚.')
      }

      saveState(m.sender, state.sourceType, state.sourceBuffer, action)

      return conn.sendMessage(m.chat, {
        text: getPanel(state.sourceType, action.toUpperCase()),
        buttons: getButtons(usedPrefix, state.sourceType),
        headerType: 1
      }, { quoted: m })
    }

    if (cmd === 'convapply') {
      const state = global.converti[m.sender]
      if (!state || !state.sourceType || !state.sourceBuffer || !state.action) {
        return m.reply(`*𝐍𝐨𝐭𝐚:* 𝐀𝐩𝐫𝐢 𝐩𝐫𝐢𝐦𝐚 𝐢𝐥 𝐩𝐚𝐧𝐧𝐞𝐥𝐥𝐨 𝐜𝐨𝐧 ${usedPrefix}converti 𝐞 𝐬𝐞𝐥𝐞𝐳𝐢𝐨𝐧𝐚 𝐮𝐧 𝐟𝐨𝐫𝐦𝐚𝐭𝐨.`)
      }

      await m.react('⏳')

      const tempDir = ensureTempDir()
      const stamp = `${Date.now()}-${Math.floor(Math.random() * 9999)}`
      const inputExt = state.sourceType === 'audio' ? 'ogg' : 'mp4'
      const input = join(tempDir, `${stamp}-input.${inputExt}`)
      const output = join(tempDir, `${stamp}-output.${state.action}`)

      try {
        fs.writeFileSync(input, state.sourceBuffer)

        let cmdFfmpeg = ''

        if (state.sourceType === 'audio' && state.action === 'mp3') {
          cmdFfmpeg = `ffmpeg -y -i "${input}" -vn -ar 44100 -ac 2 -b:a 192k "${output}"`
        }

        if (state.sourceType === 'audio' && state.action === 'ogg') {
          cmdFfmpeg = `ffmpeg -y -i "${input}" -c:a libopus -b:a 128k "${output}"`
        }

        if (state.sourceType === 'audio' && state.action === 'aac') {
          cmdFfmpeg = `ffmpeg -y -i "${input}" -c:a aac -b:a 192k "${output}"`
        }

        if (state.sourceType === 'video' && state.action === 'mp4') {
          cmdFfmpeg = `ffmpeg -y -i "${input}" -c:v libx264 -c:a aac -movflags +faststart "${output}"`
        }

        if (state.sourceType === 'video' && state.action === 'mp3') {
          cmdFfmpeg = `ffmpeg -y -i "${input}" -vn -ar 44100 -ac 2 -b:a 192k "${output}"`
        }

        if (state.sourceType === 'video' && state.action === 'ogg') {
          cmdFfmpeg = `ffmpeg -y -i "${input}" -vn -c:a libopus -b:a 128k "${output}"`
        }

        await runCmd(cmdFfmpeg)

        const buff = fs.readFileSync(output)

        if (state.action === 'mp4') {
          await conn.sendMessage(m.chat, {
            video: buff,
            mimetype: 'video/mp4'
          }, { quoted: m })
        } else if (state.action === 'ogg') {
          await conn.sendMessage(m.chat, {
            audio: buff,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          }, { quoted: m })
        } else if (state.action === 'aac') {
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

    if (cmd === 'convreset') {
      if (!global.converti[m.sender]) {
        return m.reply('*𝐍𝐨𝐭𝐚:* 𝐍𝐞𝐬𝐬𝐮𝐧 𝐩𝐚𝐧𝐧𝐞𝐥𝐥𝐨 𝐚𝐭𝐭𝐢𝐯𝐨 𝐝𝐚 𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐫𝐞.')
      }

      delete global.converti[m.sender]
      return m.reply('*✅ 𝐑𝐞𝐬𝐞𝐭 𝐞𝐟𝐟𝐞𝐭𝐭𝐮𝐚𝐭𝐨.*')
    }
  } catch (e) {
    console.error(e)
    try { await m.react('❌') } catch {}
    return m.reply(`*𝐄𝐫𝐫𝐨𝐫𝐞:* ${e.message}`)
  }
}

handler.help = ['converti', 'convset', 'convapply', 'convreset']
handler.tags = ['strumenti']
handler.command = /^(converti|converter|convset|convapply|convreset)$/i

export default handler