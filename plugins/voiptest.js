//by Bonzino

import axios from 'axios'
import fs from 'fs'
import path from 'path'
import 'dotenv/config'

function getEnvValue(name) {
  try {
    const envPath = path.join(process.cwd(), '.env')
    const env = fs.readFileSync(envPath, 'utf8')

    const line = env
      .split('\n')
      .find(v => v.trim().startsWith(name + '='))

    if (!line) return null

    return line
      .slice(name.length + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
  } catch {
    return null
  }
}
const USER_BASE = 'https://5sim.net/v1/user'
const GUEST_BASE = 'https://5sim.net/v1/guest'
const PAGE_SIZE = 3

const AUTO_TRIES = 3
const AUTO_POLL_EVERY = 8000
const AUTO_MAX_WAIT = 30000

const guestHeaders = {
  Accept: 'application/json'
}

if (!global.voip5Sessions) global.voip5Sessions = {}

function fmtMoney(n) {
  return Number(n || 0).toFixed(2)
}

function prettyCountry(name = '') {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function parseCountries(data) {
  const root = data?.whatsapp || {}
  const result = []

  for (const [country, operators] of Object.entries(root)) {
    let count = 0
    let minCost = Infinity

    for (const [, info] of Object.entries(operators || {})) {
      const c = Number(info?.count || 0)
      const cost = Number(info?.cost || 0)

      count += c
      if (c > 0 && cost > 0 && cost < minCost) minCost = cost
    }

    if (count > 0 && Number.isFinite(minCost)) {
      result.push({
        key: country,
        name: prettyCountry(country),
        count,
        cost: minCost
      })
    }
  }

  return result.sort((a, b) => a.cost - b.cost || b.count - a.count)
}

function getPageItems(items, page, size = PAGE_SIZE) {
  const start = page * size
  return items.slice(start, start + size)
}

function getTotalPages(items, size = PAGE_SIZE) {
  return Math.max(1, Math.ceil(items.length / size))
}

function buildCountryPage(session, usedPrefix) {
  const totalPages = getTotalPages(session.countries)
  const page = Math.min(Math.max(session.page || 0, 0), totalPages - 1)
  const items = getPageItems(session.countries, page)

  let txt = `*📡 𝐒𝐘𝐒𝐓𝐄𝐌 𝐕𝐎𝐈𝐏*\n\n`
  txt += `*🌍 𝐏𝐚𝐠𝐢𝐧𝐚:* \`${page + 1}/${totalPages}\`\n\n`

  items.forEach((c, i) => {
    txt += `*${i + 1}* ➜ ${c.name}\n`
    txt += `💰 \`$${fmtMoney(c.cost)}\` • 📦 \`${c.count}\`\n\n`
  })

  const buttons = items.map((c, i) => ({
    buttonId: `${usedPrefix}voip ${i + 1}`,
    buttonText: { displayText: `${i + 1}. ${c.name}` },
    type: 1
  }))

  if (totalPages > 1) {
    if (page > 0) {
      buttons.push({
        buttonId: `${usedPrefix}voip prev`,
        buttonText: { displayText: '⬅️ Prev' },
        type: 1
      })
    }

    if (page < totalPages - 1) {
      buttons.push({
        buttonId: `${usedPrefix}voip page_next`,
        buttonText: { displayText: '➡️ Next' },
        type: 1
      })
    }
  }

  return {
    text: txt.trim(),
    buttons
  }
}

async function getProfile(API_KEY) {
  const { data } = await axios.get(`${USER_BASE}/profile`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: 'application/json'
    },
    timeout: 15000
  })
  return data
}

async function getCountries() {
  const { data } = await axios.get(`${GUEST_BASE}/prices?product=whatsapp`, {
    headers: guestHeaders,
    timeout: 20000
  })
  return parseCountries(data)
}

async function buy(country, API_KEY) {
  const { data } = await axios.get(
    `${USER_BASE}/buy/activation/${country}/any/whatsapp`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json'
      },
      timeout: 20000
    }
  )
  return data
}

async function check(id, API_KEY) {
  const { data } = await axios.get(
    `${USER_BASE}/check/${id}`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json'
      },
      timeout: 20000
    }
  )
  return data
}

async function cancel(id, API_KEY) {
  const { data } = await axios.get(
    `${USER_BASE}/cancel/${id}`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json'
      },
      timeout: 15000
    }
  )
  return data
}

function getSession(user) {
  if (!global.voip5Sessions[user]) {
    global.voip5Sessions[user] = {
      countries: [],
      page: 0,
      selected: null,
      order: null,
      autoRunning: false
    }
  }
  return global.voip5Sessions[user]
}

async function buyAndSave(session, countryKey, API_KEY) {
  const data = await buy(countryKey, API_KEY)
  session.order = {
    id: data.id,
    phone: data.phone
  }
  return data
}

async function autoCycle(conn, chat, m, session, API_KEY) {
  session.autoRunning = true

  try {
    for (let attempt = 1; attempt <= AUTO_TRIES; attempt++) {
      if (!session.selected) throw new Error('Nessun paese selezionato.')

      if (!session.order?.id) {
        await buyAndSave(session, session.selected.key, API_KEY)
      }

      await conn.sendMessage(chat, {
        text:
          `*🔄 𝐓𝐄𝐍𝐓𝐀𝐓𝐈𝐕𝐎 ${attempt}/${AUTO_TRIES}*\n\n` +
          `🌍 ${session.selected.name}\n` +
          `📲 \`${session.order.phone}\`\n\n` +
          `*⏳ 𝐀𝐭𝐭𝐞𝐧𝐝𝐨 𝐥'𝐒𝐌𝐒...*`
      }, { quoted: m })

      const started = Date.now()
      let found = null

      while (Date.now() - started < AUTO_MAX_WAIT) {
        const data = await check(session.order.id, API_KEY)

        if (data.sms?.length) {
          found = data.sms[0]
          break
        }

        await sleep(AUTO_POLL_EVERY)
      }

      if (found) {
        let txt = `*✅ 𝐒𝐌𝐒 𝐑𝐈𝐂𝐄𝐕𝐔𝐓𝐎*\n\n`
        txt += `🌍 ${session.selected.name}\n`
        txt += `📲 \`${session.order.phone}\`\n`
        txt += `💬 ${found.code || found.text || 'N/D'}`

        session.autoRunning = false
        return conn.sendMessage(chat, { text: txt }, { quoted: m })
      }

      if (session.order?.id) {
        await cancel(session.order.id, API_KEY).catch(() => {})
        session.order = null
      }

      if (attempt < AUTO_TRIES) {
        const nextData = await buyAndSave(session, session.selected.key, API_KEY)

        await conn.sendMessage(chat, {
          text:
            `*⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐒𝐌𝐒 𝐫𝐢𝐜𝐞𝐯𝐮𝐭𝐨.*\n\n` +
            `*🔄 𝐂𝐚𝐦𝐛𝐢𝐨 𝐧𝐮𝐦𝐞𝐫𝐨...*\n` +
            `📲 \`${nextData.phone}\``
        }, { quoted: m })
      }
    }

    session.autoRunning = false
    return conn.sendMessage(chat, {
      text: '*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun SMS ricevuto dopo vari tentativi.'
    }, { quoted: m })

  } catch (e) {
    session.autoRunning = false
    throw e
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const API_KEY = getEnvValue('FIVESIM_KEY')

    if (!API_KEY) {
      return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* API key mancante.')
    }

    const cmd = command.toLowerCase()
    const user = m.sender
    const input = (args[0] || '').toLowerCase()
    const session = getSession(user)

    if (cmd === 'saldo') {
      const data = await getProfile(API_KEY)

      let txt = `*✅ 𝐒𝐀𝐋𝐃𝐎*\n\n`
      txt += `💰 *Balance:* \`$${fmtMoney(data.balance)}\`\n`
      txt += `🧊 *Frozen:* \`$${fmtMoney(data.frozen_balance)}\`\n`
      txt += `⭐ *Rating:* \`${data.rating ?? 'N/D'}\``

      return m.reply(txt)
    }

    if (cmd === 'voip' && !input) {
      const countries = await getCountries()

      if (!countries.length) {
        return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun paese disponibile.')
      }

      session.countries = countries
      session.page = 0
      session.selected = null
      session.order = null
      session.autoRunning = false

      const pageData = buildCountryPage(session, usedPrefix)

      return conn.sendMessage(m.chat, {
        text: pageData.text,
        footer: 'Seleziona un paese',
        buttons: pageData.buttons.slice(0, 5),
        headerType: 1
      })
    }

    if (cmd === 'voip' && input === 'prev') {
      if (!session.countries?.length) {
        return m.reply(`*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Apri prima il menu con \`${usedPrefix}voip\`.`)
      }

      session.page = Math.max(0, (session.page || 0) - 1)
      const pageData = buildCountryPage(session, usedPrefix)

      return conn.sendMessage(m.chat, {
        text: pageData.text,
        footer: 'Seleziona un paese',
        buttons: pageData.buttons.slice(0, 5),
        headerType: 1
      })
    }

    if (cmd === 'voip' && input === 'page_next') {
      if (!session.countries?.length) {
        return m.reply(`*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Apri prima il menu con \`${usedPrefix}voip\`.`)
      }

      const totalPages = getTotalPages(session.countries)
      session.page = Math.min(totalPages - 1, (session.page || 0) + 1)
      const pageData = buildCountryPage(session, usedPrefix)

      return conn.sendMessage(m.chat, {
        text: pageData.text,
        footer: 'Seleziona un paese',
        buttons: pageData.buttons.slice(0, 5),
        headerType: 1
      })
    }

    if (cmd === 'voip' && !isNaN(input)) {
      if (!session.countries?.length) {
        return m.reply(`*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Apri prima il menu con \`${usedPrefix}voip\`.`)
      }

      const pageItems = getPageItems(session.countries, session.page || 0)
      const country = pageItems[Number(input) - 1]

      if (!country) {
        return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Paese non valido.')
      }

      const { key } = await conn.sendMessage(m.chat, {
        text: '📡 *✅ 𝐒𝐂𝐀𝐍𝐒𝐈𝐎𝐍𝐄 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎...*'
      })

      const data = await buyAndSave(session, country.key, API_KEY)
      session.selected = country

      return conn.sendMessage(m.chat, {
        text:
          `*✅ 𝐍𝐔𝐌𝐄𝐑𝐎 𝐀𝐓𝐓𝐈𝐕𝐎*\n\n` +
          `🌍 ${country.name}\n` +
          `📲 \`${data.phone}\``,
        buttons: [
          { buttonId: `${usedPrefix}voip next`, buttonText: { displayText: '🔄 Cambia Numero' }, type: 1 },
          { buttonId: `${usedPrefix}voip sms`, buttonText: { displayText: '📩 Controlla SMS' }, type: 1 },
          { buttonId: `${usedPrefix}voip auto`, buttonText: { displayText: '🤖 Auto' }, type: 1 }
        ],
        headerType: 1,
        edit: key
      })
    }

    if (cmd === 'voip' && input === 'next') {
      if (!session.selected) {
        return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Seleziona prima un paese.')
      }

      if (session.order?.id) {
        await cancel(session.order.id, API_KEY).catch(() => {})
      }

      const data = await buyAndSave(session, session.selected.key, API_KEY)

      return conn.sendMessage(m.chat, {
        text:
          `*✅ 𝐍𝐔𝐎𝐕𝐎 𝐍𝐔𝐌𝐄𝐑𝐎*\n\n` +
          `🌍 ${session.selected.name}\n` +
          `📲 \`${data.phone}\``,
        buttons: [
          { buttonId: `${usedPrefix}voip next`, buttonText: { displayText: '🔄 Cambia Numero' }, type: 1 },
          { buttonId: `${usedPrefix}voip sms`, buttonText: { displayText: '📩 Controlla SMS' }, type: 1 },
          { buttonId: `${usedPrefix}voip auto`, buttonText: { displayText: '🤖 Auto' }, type: 1 }
        ],
        headerType: 1
      })
    }

    if (cmd === 'voip' && input === 'sms') {
      if (!session.order?.id) {
        return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessuna sessione attiva.')
      }

      const data = await check(session.order.id, API_KEY)

      if (!data.sms?.length) {
        return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun SMS.')
      }

      let txt = `*✅ 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈 𝐑𝐈𝐂𝐄𝐕𝐔𝐓𝐈:* \`${session.order.phone}\`\n\n`

      data.sms.slice(0, 5).forEach(x => {
        txt += `💬 ${x.code || x.text || 'N/D'}\n`
      })

      return m.reply(txt)
    }

    if (cmd === 'voip' && input === 'auto') {
      if (!session.selected) {
        return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Seleziona prima un paese.')
      }

      if (session.autoRunning) {
        return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Modalità auto già in esecuzione.')
      }

      if (!session.order?.id) {
        await buyAndSave(session, session.selected.key, API_KEY)
      }

      return autoCycle(conn, m.chat, m, session, API_KEY)
    }

    if (cmd === 'voip' && input === 'stop') {
      if (!session.order?.id) {
        return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun ordine.')
      }

      await cancel(session.order.id, API_KEY)
      session.order = null
      session.autoRunning = false

      return m.reply('*✅ 𝐎𝐫𝐝𝐢𝐧𝐞 𝐚𝐧𝐧𝐮𝐥𝐥𝐚𝐭𝐨.*')
    }

  } catch (e) {
    console.error('voip/saldo error:', e?.response?.data || e)
    return m.reply(`*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* ${e?.response?.data?.message || e?.response?.data?.error || e.message || e}`)
  }
}

handler.command = /^(voip2|saldo)$/i
handler.tags = ['strumenti']
handler.help = ['voip', 'saldo']

export default handler