// by Bonzino

import axios from 'axios'

const API_KEY = '2d61a72574c11c4f36173b627f8cb177'

const S = v => String(v || '')

function buildContextMsg(title) {
  return {
    key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'CTX' },
    message: {
      locationMessage: {
        name: title
      }
    },
    participant: '0@s.whatsapp.net'
  }
}

function getBody(m) {
  return (
    m?.message?.extendedTextMessage?.text ||
    m?.message?.conversation ||
    m?.text ||
    ''
  ).trim()
}

let handler = async (m, { conn, text }) => {
  const chat = m.chat || m.key?.remoteJid
  if (!chat) return

  let city = S(text).trim()

  if (!city) {
    const body = getBody(m)
    city = body.replace(/^\.(?:meteo)\s*/i, '').trim()
  }

  if (!city) {
    const q = buildContextMsg('𝐌𝐄𝐓𝐄𝐎')
    await conn.sendMessage(chat, {
      text: '𝐃𝐞𝐯𝐢 𝐢𝐧𝐬𝐞𝐫𝐢𝐫𝐞 𝐮𝐧𝐚 𝐜𝐢𝐭𝐭à.\n\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨:\n`.meteo Roma`'
    }, { quoted: q })
    return
  }

  try {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=it`
    const res = await axios.get(url)
    const d = res.data

    const msg = `*╭━━━━━━━☁️━━━━━━━╮*
*✦ 𝐌𝐄𝐓𝐄𝐎 ✦*
*╰━━━━━━━☁️━━━━━━━╯*

*📍 𝐋𝐨𝐜𝐚𝐥𝐢𝐭à:* ${d.name}, ${d.sys?.country || '-'}
*🌡 𝐓𝐞𝐦𝐩𝐞𝐫𝐚𝐭𝐮𝐫𝐚:* ${Math.round(d.main.temp)}°C
*🌡 𝐏𝐞𝐫𝐜𝐞𝐩𝐢𝐭𝐚:* ${Math.round(d.main.feels_like)}°C
*🔺 𝐌𝐢𝐧 / 𝐌𝐚𝐱:* ${Math.round(d.main.temp_min)}°C • ${Math.round(d.main.temp_max)}°C
*💧 𝐔𝐦𝐢𝐝𝐢𝐭à:* ${d.main.humidity}%
*☁ 𝐂𝐨𝐧𝐝𝐢𝐳𝐢𝐨𝐧𝐢:* ${d.weather?.[0]?.main || '-'}
*🌫 𝐃𝐞𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞:* ${d.weather?.[0]?.description || '-'}
*💨 𝐕𝐞𝐧𝐭𝐨:* ${d.wind?.speed ?? 0} m/s
*🔽 𝐏𝐫𝐞𝐬𝐬𝐢𝐨𝐧𝐞:* ${d.main.pressure} hPa

> 𝐃𝐞𝐯 𝐛𝐲 𝐁𝐨𝐧𝐳𝐢𝐧𝐨`

    await conn.sendMessage(chat, {
      text: msg,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 1,
        externalAdReply: {
          title: '𝐌𝐞𝐭𝐞𝐨 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐨 ☀️',
          body: '',
          showAdAttribution: false
        }
      }
    }, { quoted: m })

  } catch (e) {
    const q = buildContextMsg('𝐌𝐄𝐓𝐄𝐎')

    if (e?.response?.status === 404) {
      await conn.sendMessage(chat, {
        text: '𝐂𝐢𝐭𝐭à 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐚. 𝐂𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐚 𝐥𝐚 𝐬𝐜𝐫𝐢𝐭𝐭𝐮𝐫𝐚.'
      }, { quoted: q })
    } else {
      await conn.sendMessage(chat, {
        text: '𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐨 𝐝𝐞𝐢 𝐝𝐚𝐭𝐢. 𝐑𝐢𝐩𝐫𝐨𝐯𝐚.'
      }, { quoted: q })
    }
  }
}

handler.command = ['meteo']
handler.help = ['meteo <città>']
handler.tags = ['tools']

export default handler