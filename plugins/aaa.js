//by Bonzino

import axios from 'axios'
import * as cheerio from 'cheerio'

const nazioni = [
  { id: '1', nome: 'Stati Uniti 🇺🇸', path: '/en/countries/us' },
  { id: '2', nome: 'Regno Unito 🇬🇧', path: '/en/countries/gb' },
  { id: '3', nome: 'Francia 🇫🇷', path: '/en/countries/fr' },
  { id: '4', nome: 'Svezia 🇸🇪', path: '/en/countries/se' },
  { id: '5', nome: 'Germania 🇩🇪', path: '/en/countries/de' },
  { id: '6', nome: 'Italia 🇮🇹', path: '/en/countries/it' },
  { id: '7', nome: 'Olanda 🇳🇱', path: '/en/countries/nl' },
  { id: '8', nome: 'Spagna 🇪🇸', path: '/en/countries/es' }
]

const BASE_URL = 'https://sms24.me'

const getHeaders = () => {
  const uas = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  ]

  return {
    'User-Agent': uas[Math.floor(Math.random() * uas.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': BASE_URL,
    'Connection': 'keep-alive'
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function isCloudflarePage($) {
  const title = $('title').text().trim().toLowerCase()
  return title.includes('cloudflare') || title.includes('just a moment')
}

function buildMenu(usedPrefix) {
  let menu = '*📡 𝐒𝐘𝐒𝐓𝐄𝐌 𝐕𝐎𝐈𝐏: 𝐃𝐀𝐓𝐀𝐁𝐀𝐒𝐄*\n\n'
  for (const n of nazioni) {
    menu += `*${n.id}* ➜ ${n.nome}\n`
  }
  menu += `\n*💡 𝐔𝐬𝐚:* \`${usedPrefix}voip <id>\``
  return menu
}

function extractNumbers(html) {
  const $ = cheerio.load(html)
  const nums = []

  $('a[href*="/en/numbers/"]').each((_, el) => {
    const txt = $(el).text().trim()
    const n = txt.replace(/\D/g, '')
    if (n.length >= 6 && n.length <= 20) nums.push(n)
  })

  return [...new Set(nums)]
}

function extractSmsLogs(html) {
  const $ = cheerio.load(html)
  const logs = []

  $('.shadow-sm').each((_, el) => {
    const user = $(el).find('a').first().text().trim() || 'SCONOSCIUTO'
    const fullText = $(el).text().replace(/\s+/g, ' ').trim()
    const txt = fullText.split('ago')[1]?.replace('Copy', '').trim() || ''

    if (txt) {
      logs.push({ user, txt })
    }
  })

  return logs
}

async function fetchPage(url) {
  return axios.get(url, {
    headers: getHeaders(),
    timeout: 15000
  })
}

async function fetchNumbersByCountry(naz) {
  const { data } = await fetchPage(`${BASE_URL}${naz.path}`)
  const $ = cheerio.load(data)

  if (isCloudflarePage($)) {
    throw new Error('Cloudflare ha bloccato la richiesta automatica.')
  }

  const nums = extractNumbers(data)
  return shuffle(nums).slice(0, 5)
}

async function fetchSmsByNumber(num) {
  const { data } = await fetchPage(`${BASE_URL}/en/numbers/${num}`)
  const $ = cheerio.load(data)

  if (isCloudflarePage($)) {
    throw new Error('Cloudflare ha bloccato la richiesta automatica.')
  }

  return extractSmsLogs(data)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const cmd = command.toLowerCase()
  const arg = args[0]

  if (cmd === 'voip' && !arg) {
    return m.reply(buildMenu(usedPrefix))
  }

  if (cmd === 'voip' && arg) {
    if (isNaN(arg)) {
      return m.reply('*⚠️ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐈𝐃 𝐯𝐚𝐥𝐢𝐝𝐨.*')
    }

    const naz = nazioni.find(n => n.id === arg)
    if (!naz) {
      return m.reply('*⚠️ 𝐈𝐃 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.*')
    }

    const loading = await conn.sendMessage(m.chat, {
      text: '*📡 𝐒𝐜𝐚𝐧𝐬𝐢𝐨𝐧𝐞 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...*'
    })

    try {
      const final = await fetchNumbersByCountry(naz)

      if (!final.length) {
        return conn.sendMessage(m.chat, {
          text: '*⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨 𝐧𝐞𝐥𝐥𝐚 𝐩𝐚𝐠𝐢𝐧𝐚.*',
          edit: loading.key
        })
      }

      let res = `*📡 𝐍𝐔𝐌𝐄𝐑𝐈 𝐀𝐓𝐓𝐈𝐕𝐈: ${naz.nome.toUpperCase()}*\n\n`
      const buttons = []

      for (const n of final) {
        res += `🔹 \`+${n}\`\n`
        buttons.push({
          buttonId: `${usedPrefix}check ${n}`,
          buttonText: { displayText: `💬 Check +${n}` },
          type: 1
        })
      }

      buttons.push({
        buttonId: `${usedPrefix}voip ${arg}`,
        buttonText: { displayText: '🔄 𝐂𝐚𝐦𝐛𝐢𝐚 𝐧𝐮𝐦𝐞𝐫𝐢' },
        type: 1
      })

      return conn.sendMessage(m.chat, {
        text: res,
        footer: 'Tocca un numero per vedere gli SMS',
        buttons,
        headerType: 1,
        edit: loading.key
      })

    } catch (e) {
      console.error('voip error:', e)

      let msg = '*❌ 𝐄𝐫𝐫𝐨𝐫𝐞*\n\n'
      if (/cloudflare/i.test(e.message)) {
        msg += '𝐂𝐥𝐨𝐮𝐝𝐟𝐥𝐚𝐫𝐞 𝐡𝐚 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨 𝐥𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚.'
      } else if (/timeout/i.test(e.message) || /ETIMEDOUT/i.test(e.message)) {
        msg += '𝐈𝐥 𝐬𝐢𝐭𝐨 𝐧𝐨𝐧 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞 𝐢𝐧 𝐭𝐞𝐦𝐩𝐨.'
      } else {
        msg += e.message || '𝐈𝐦𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐚𝐫𝐞 𝐢 𝐧𝐮𝐦𝐞𝐫𝐢.'
      }

      return conn.sendMessage(m.chat, {
        text: msg,
        edit: loading.key
      })
    }
  }

  if (cmd === 'check') {
    const num = (arg || '').replace(/\D/g, '')

    if (!num || num.length < 6) {
      return m.reply('*⚠️ 𝐍𝐮𝐦𝐞𝐫𝐨 𝐦𝐚𝐧𝐜𝐚𝐧𝐭𝐞 𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.*')
    }

    const loading = await conn.sendMessage(m.chat, {
      text: `*📨 𝐋𝐞𝐭𝐭𝐮𝐫𝐚 𝐒𝐌𝐒:* \`+${num}\``
    })

    try {
      const logs = await fetchSmsByNumber(num)

      if (!logs.length) {
        return conn.sendMessage(m.chat, {
          text: '*⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨. 𝐑𝐢𝐩𝐫𝐨𝐯𝐚 𝐭𝐫𝐚 𝐪𝐮𝐚𝐥𝐜𝐡𝐞 𝐬𝐞𝐜𝐨𝐧𝐝𝐨.*',
          edit: loading.key
        })
      }

      let res = `*📨 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈 𝐑𝐈𝐂𝐄𝐕𝐔𝐓𝐈:* \`+${num}\`\n\n`

      logs.slice(0, 3).forEach(l => {
        res += `👤 *${l.user}*\n💬 ${l.txt}\n\n──────────────\n`
      })

      const btns = [
        {
          buttonId: `${usedPrefix}check ${num}`,
          buttonText: { displayText: '🔄 𝐀𝐠𝐠𝐢𝐨𝐫𝐧𝐚 𝐒𝐌𝐒' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}voip`,
          buttonText: { displayText: '📱 𝐓𝐨𝐫𝐧𝐚 𝐚𝐥 𝐦𝐞𝐧𝐮' },
          type: 1
        }
      ]

      return conn.sendMessage(m.chat, {
        text: res,
        footer: `Aggiornato alle: ${new Date().toLocaleTimeString()}`,
        buttons: btns,
        headerType: 1,
        edit: loading.key
      })

    } catch (e) {
      console.error('check error:', e)

      let msg = '*❌ 𝐄𝐫𝐫𝐨𝐫𝐞*\n\n'
      if (/cloudflare/i.test(e.message)) {
        msg += '𝐂𝐥𝐨𝐮𝐝𝐟𝐥𝐚𝐫𝐞 𝐡𝐚 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨 𝐥𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚.'
      } else if (/timeout/i.test(e.message) || /ETIMEDOUT/i.test(e.message)) {
        msg += '𝐈𝐥 𝐬𝐢𝐭𝐨 𝐧𝐨𝐧 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞 𝐢𝐧 𝐭𝐞𝐦𝐩𝐨.'
      } else {
        msg += e.message || '𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐢𝐥 𝐜𝐚𝐫𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐨 𝐝𝐞𝐠𝐥𝐢 𝐒𝐌𝐒.'
      }

      return conn.sendMessage(m.chat, {
        text: msg,
        edit: loading.key
      })
    }
  }
}

handler.command = /^(voip|check)$/i
handler.tags = ['strumenti']
handler.help = ['voip', 'voip <id>', 'check <numero>']

export default handler