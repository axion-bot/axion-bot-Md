// bonk finale su template video

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { spawn } from 'child_process'

const TEMPLATE = './media/bonk.mp4'
const TMP = './tmp_bonk_video'
const OUT = './tmp_bonk_video/out.mp4'

// posizione testa (già calibrata)
const HEAD_X = 180
const HEAD_Y = 260
const SIZE = 120

function resolveTarget(m, text = '') {
  const digits = text.replace(/\D/g, '')
  if (digits.length >= 7) return digits + '@s.whatsapp.net'
  if (m.mentionedJid?.length) return m.mentionedJid[0]
  if (m.quoted) return m.quoted.sender
  return m.sender
}

async function fetchAvatar(url) {
  const res = await fetch(url)
  return Buffer.from(await res.arrayBuffer())
}

function run(cmd, args) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args)
    p.on('close', res)
    p.on('error', rej)
  })
}

let handler = async (m, { conn, text }) => {
  try {
    const who = resolveTarget(m, text)
    let pfp

    try {
      pfp = await conn.profilePictureUrl(who, 'image')
    } catch {
      return conn.reply(m.chat, '⚠️ Nessuna foto profilo', m)
    }

    if (!fs.existsSync(TMP)) fs.mkdirSync(TMP)

    // 1. estrai frame
    await run('ffmpeg', [
      '-y',
      '-i', TEMPLATE,
      `${TMP}/frame_%03d.png`
    ])

    // 2. scarica avatar
    const avatar = await fetchAvatar(pfp)
    fs.writeFileSync(`${TMP}/avatar.png`, avatar)

    // 3. overlay avatar su tutti i frame
    const frames = fs.readdirSync(TMP).filter(f => f.startsWith('frame_'))

    for (const f of frames) {
      await run('ffmpeg', [
        '-y',
        '-i', `${TMP}/${f}`,
        '-i', `${TMP}/avatar.png`,
        '-filter_complex',
        `overlay=${HEAD_X}:${HEAD_Y}:enable='between(t,0,10)'`,
        `${TMP}/out_${f}`
      ])
    }

    // 4. ricrea video
    await run('ffmpeg', [
      '-y',
      '-framerate', '10',
      '-i', `${TMP}/out_frame_%03d.png`,
      '-pix_fmt', 'yuv420p',
      OUT
    ])

    await conn.sendMessage(
      m.chat,
      {
        video: fs.readFileSync(OUT),
        caption: '*🔨 𝐁𝐨𝐧𝐤!*'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `Errore:\n${e.message}`, m)
  }
}

handler.command = ['bonk2']
handler.tags = ['fun']
handler.help = ['bonk2 @utente']

export default handler