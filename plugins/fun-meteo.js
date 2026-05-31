// by elixir

import axios from "axios"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import puppeteer from "puppeteer"


const cache = new Map()
const CACHE_TTL = 15 * 60 * 1000
const CACHE_MAX_SIZE = 50 
const CACHE_CLEANUP_INTERVAL = 30 * 60 * 1000


setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) cache.delete(key)
  }
}, CACHE_CLEANUP_INTERVAL)

function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) { cache.delete(key); return null }
  entry.hits = (entry.hits || 0) + 1
  return entry
}

function setCache(key, data) {

  if (cache.size >= CACHE_MAX_SIZE) {
    const oldestKey = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
    cache.delete(oldestKey)
  }
  cache.set(key, { ...data, timestamp: Date.now(), hits: 0 })
}


let handler = async (m, { conn, args }) => {


  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Questo comando è disponibile solo nei gruppi.', m)
  }

  if (!args[0]) {
    return m.reply(`┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ᴍᴇᴛᴇᴏ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🌦️ *Comando:* !meteo
 │ ⚙️ *Modulo:* Strumenti
 │ ⚠️ *Status:* Istruzioni
 └───────────────────
*Utilizzo:* !meteo <città>

*Esempi:*
  !meteo Roma
  !meteo Milano
  !meteo New York

_☣️ Previsioni in tempo reale, 100% gratis._`)
  }

  const city = args.join(' ')
  const cityKey = city.toLowerCase().trim()


  const cached = getCached(cityKey)
  if (cached) {
    await conn.sendMessage(m.chat, {
      image: cached.imageBuffer,
      caption: cached.caption
    }, { quoted: m })
    return
  }

  const loading = await m.reply(`🔍 \`Cerco il meteo di "${city}"...\``)

  try {

    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=it`,
      { timeout: 8000 }
    )

    if (!geoRes.data.results?.[0]) {
      await conn.sendMessage(m.chat, { delete: loading.key })
      return m.reply(`┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ᴍᴇᴛᴇᴏ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
❌ *Città non trovata.*
_Prova con un nome più specifico._
*Esempio:* !meteo Roma, Italia`)
    }

    const location = geoRes.data.results[0]
    const { latitude, longitude } = location


    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,` +
      `surface_pressure,wind_speed_10m,wind_direction_10m,is_day` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&hourly=temperature_2m,weather_code,precipitation_probability` +
      `&timezone=auto&forecast_days=7`,
      { timeout: 8000 }
    )

    const { current, daily, hourly } = weatherRes.data

    let backgroundImageBase64 = null
    try {
      const searchTerm = encodeURIComponent(location.name.split(',')[0])
      const imgRes = await axios.get(
        `https://source.unsplash.com/800x1200/?${searchTerm},city,landscape`,
        { responseType: 'arraybuffer', timeout: 8000 }
      )
      const contentType = imgRes.headers['content-type'] || 'image/jpeg'
      backgroundImageBase64 = `data:${contentType};base64,${Buffer.from(imgRes.data).toString('base64')}`
    } catch {
      backgroundImageBase64 = null 
    }

    const weatherData = {
      location: location.name,
      country: location.country || '',
      current,
      daily,
      hourly,
      backgroundImageBase64,
      weatherColors: getWeatherColorScheme(current.weather_code, current.is_day)
    }

    const imageBuffer = await generateWeatherImage(weatherData)

   
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
    const weekForecast = Array.from({ length: 5 }, (_, i) => {
      const idx = i + 1
      const date = new Date(daily.time[idx])
      const day = weekDays[date.getDay()]
      const max = Math.round(daily.temperature_2m_max[idx])
      const min = Math.round(daily.temperature_2m_min[idx])
      const icon = getWeatherIcon(daily.weather_code[idx])
      return `│ ${icon} *${day}* — ↑${max}° ↓${min}° (💧${daily.precipitation_probability_max[idx]}%)`
    }).join('\n')

    const caption = `ㅤㅤ⋆｡˚『 🌦️╭ \`METEO\` ╯ 』˚｡⋆
╭
│
├⭓ ⋆⭒─ׄ─ׅ⊱ \`${location.name}\` ⊰
│
*│ ➤* 『🌡️』 *${Math.round(current.temperature_2m)}°C* - *${getWeatherText(current.weather_code)}*
*│ ➤* 『🌡️』 \`Percepita:\` *${Math.round(current.apparent_temperature)}°C*
*│ ➤* 『💨』 \`Vento:\` *${Math.round(current.wind_speed_10m)} km/h ${getWindDirection(current.wind_direction_10m)}*
*│ ➤* 『💧』 \`Umidità:\` *${current.relative_humidity_2m}%*
*│ ➤* 『📊』 \`Pressione:\` *${Math.round(current.surface_pressure)}hPa*
*│ ➤* 『🌧️』 \`Precipitazioni:\` *${current.precipitation}mm*
│
├⭓ ⋆⭒ \`PROSSIMI 5 GIORNI\` ⭒
│
${weekForecast}
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

   
    setCache(cityKey, { imageBuffer, caption })

    await conn.sendMessage(m.chat, { image: imageBuffer, caption }, { quoted: m })
    await conn.sendMessage(m.chat, { delete: loading.key })

  } catch (e) {
    await conn.sendMessage(m.chat, { delete: loading.key }).catch(() => {})


    let errorMsg = `┏━━━━━━━━━━━━━━━━━━━━┓
 💉 ᴇʟɪxɪʀ - ᴇʀʀᴏʀᴇ 💉
┗━━━━━━━━━━━━━━━━━━━━┛
`
    if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
      errorMsg += '⏱️ *Timeout:* Il server meteo non risponde.\n_Riprova tra qualche secondo._'
    } else if (e.response?.status === 429) {
      errorMsg += '🚫 *Troppe richieste:* Limite API raggiunto.\n_Riprova tra qualche minuto._'
    } else if (e.message?.includes('Città non trovata')) {
      errorMsg += '❌ *Città non trovata.*\n_Prova con un nome più specifico._'
    } else if (e.message?.includes('browser')) {
      errorMsg += '🖥️ *Errore browser:* Puppeteer non disponibile.\n_Contatta il dev._'
    } else {
      errorMsg += `☣️ *Errore imprevisto.*\n_\`${e.message?.slice(0, 60)}\`_`
    }

    console.error('[Meteo Plugin] Errore:', e.message)
    m.reply(errorMsg)
  }
}


async function generateWeatherImage(weatherData) {
  let browser
  try {
    const htmlContent = renderToStaticMarkup(React.createElement(WeatherCard, { weatherData }))
    const fullHtml = createFullHtmlTemplate(htmlContent, weatherData)

 
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      })
    } catch (e) {
      throw new Error('browser non disponibile: ' + e.message)
    }

    const page = await browser.newPage()
    await page.setViewport({ width: 800, height: 1200, deviceScaleFactor: 2 })
    await page.setContent(fullHtml, { waitUntil: 'networkidle0', timeout: 15000 })

    return await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 800, height: 1200 } })
  } finally {
    if (browser) await browser.close()
  }
}


function createFullHtmlTemplate(componentHtml, weatherData) {
  const { weatherColors } = weatherData
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; width: 800px; height: 1200px; overflow: hidden; }
    .weather-container { width: 100%; height: 100%; position: relative; background: linear-gradient(to bottom, ${weatherColors.background.primary}, ${weatherColors.background.secondary}); overflow: hidden; }
    .background-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; filter: brightness(0.4) blur(2px); z-index: 1; }
    .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, ${weatherColors.overlay.primary}, ${weatherColors.overlay.secondary}); z-index: 2; }
    .content { position: relative; z-index: 3; padding: 50px; display: flex; flex-direction: column; color: ${weatherColors.text.primary}; height: 100%; }
    .location-title { font-size: 48px; font-weight: bold; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.7); }
    .current-weather { display: flex; align-items: center; margin-bottom: 30px; }
    .temperature { font-size: 120px; font-weight: bold; color: ${weatherColors.temperature.main}; text-shadow: 3px 3px 6px rgba(0,0,0,0.7); }
    .weather-info { margin-left: 20px; }
    .weather-icon { font-size: 50px; }
    .weather-description { font-size: 24px; }
    .min-max { font-size: 18px; color: ${weatherColors.text.secondary}; }
    .details-grid { background: ${weatherColors.cards.background}; border: 1px solid ${weatherColors.cards.border}; border-radius: 15px; padding: 25px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; backdrop-filter: blur(10px); }
    .detail-item { display: flex; align-items: center; gap: 10px; }
    .detail-icon { font-size: 24px; }
    .detail-label { font-size: 14px; color: ${weatherColors.text.secondary}; }
    .detail-value { font-size: 16px; font-weight: bold; }
    .forecast-section { background: ${weatherColors.cards.background}; border: 1px solid ${weatherColors.cards.border}; border-radius: 15px; padding: 20px; margin-bottom: 20px; backdrop-filter: blur(10px); }
    .forecast-title { font-size: 20px; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid ${weatherColors.cards.border}; padding-bottom: 8px; }
    .forecast-grid { display: flex; justify-content: space-between; }
    .forecast-item { text-align: center; flex: 1; }
    .forecast-time { font-size: 14px; font-weight: bold; margin-bottom: 8px; }
    .forecast-icon { font-size: 28px; margin-bottom: 8px; }
    .forecast-temp { font-size: 16px; font-weight: bold; }
    .forecast-prob { font-size: 14px; color: ${weatherColors.text.secondary}; }
  </style>
</head>
<body>${componentHtml}</body>
</html>`
}


const WeatherCard = ({ weatherData }) => {
  const { location, country, current, daily, hourly, backgroundImageBase64 } = weatherData

  const now = new Date()
  const currentHour = now.getHours()
  const startIndex = hourly.time.findIndex(t => new Date(t).getHours() >= currentHour + 1)
  const nextHours = hourly.time.slice(startIndex, startIndex + 5).map((time, i) => ({
    time,
    temperature: hourly.temperature_2m[startIndex + i],
    weatherCode: hourly.weather_code[startIndex + i],
    precipitationProbability: hourly.precipitation_probability[startIndex + i]
  }))

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

  return React.createElement('div', { className: 'weather-container' }, [
    backgroundImageBase64 && React.createElement('div', {
      key: 'bg', className: 'background-image',
      style: { backgroundImage: `url(${backgroundImageBase64})` }
    }),
    React.createElement('div', { key: 'overlay', className: 'overlay' }),
    React.createElement('div', { key: 'content', className: 'content' }, [
      React.createElement('h1', { key: 'title', className: 'location-title' }, `${location}${country ? ', ' + country : ''}`),
      React.createElement('div', { key: 'current', className: 'current-weather' }, [
        React.createElement('span', { key: 'temp', className: 'temperature' }, `${Math.round(current.temperature_2m)}°`),
        React.createElement('div', { key: 'info', className: 'weather-info' }, [
          React.createElement('span', { key: 'icon', className: 'weather-icon' }, getWeatherIcon(current.weather_code)),
          React.createElement('p', { key: 'desc', className: 'weather-description' }, getWeatherText(current.weather_code)),
          React.createElement('p', { key: 'minmax', className: 'min-max' }, `↑${Math.round(daily.temperature_2m_max[0])}° ↓${Math.round(daily.temperature_2m_min[0])}°`)
        ])
      ]),
      React.createElement('div', { key: 'details', className: 'details-grid' }, [
        detail('perc', '🌡️', 'Percepita', `${Math.round(current.apparent_temperature)}°C`),
        detail('vento', '💨', 'Vento', `${Math.round(current.wind_speed_10m)} km/h (${getWindDirection(current.wind_direction_10m)})`),
        detail('umid', '💧', 'Umidità', `${current.relative_humidity_2m}%`),
        detail('prec', '🌧️', 'Precipitazioni', `${current.precipitation}mm`),
        detail('press', '📊', 'Pressione', `${Math.round(current.surface_pressure)}hPa`),
        detail('pioggia', '☔', 'Prob. Pioggia', `${daily.precipitation_probability_max[0]}%`)
      ]),
      nextHours.length > 0 && React.createElement('div', { key: 'hourly', className: 'forecast-section' }, [
        React.createElement('h3', { key: 'ht', className: 'forecast-title' }, '🕐 Prossime ore'),
        React.createElement('div', { key: 'hg', className: 'forecast-grid' },
          nextHours.map(h => React.createElement('div', { key: h.time, className: 'forecast-item' }, [
            React.createElement('p', { key: 't', className: 'forecast-time' }, formatHour(h.time)),
            React.createElement('p', { key: 'i', className: 'forecast-icon' }, getWeatherIcon(h.weatherCode)),
            React.createElement('p', { key: 'temp', className: 'forecast-temp' }, `${Math.round(h.temperature)}°`),
            React.createElement('p', { key: 'p', className: 'forecast-prob' }, `${h.precipitationProbability}%`)
          ]))
        )
      ]),
      React.createElement('div', { key: 'daily', className: 'forecast-section' }, [
        React.createElement('h3', { key: 'dt', className: 'forecast-title' }, '📅 Prossimi 5 giorni'),
        React.createElement('div', { key: 'dg', className: 'forecast-grid' },
          Array.from({ length: 5 }, (_, i) => {
            const idx = i + 1
            const date = new Date(daily.time[idx])
            return React.createElement('div', { key: daily.time[idx], className: 'forecast-item' }, [
              React.createElement('p', { key: 'd', className: 'forecast-time' }, weekDays[date.getDay()]),
              React.createElement('p', { key: 'i', className: 'forecast-icon' }, getWeatherIcon(daily.weather_code[idx])),
              React.createElement('p', { key: 'max', className: 'forecast-temp' }, `${Math.round(daily.temperature_2m_max[idx])}°`),
              React.createElement('p', { key: 'min', className: 'forecast-prob' }, `${Math.round(daily.temperature_2m_min[idx])}°`)
            ])
          })
        )
      ])
    ])
  ])
}

function detail(key, icon, label, value) {
  return React.createElement('div', { key, className: 'detail-item' }, [
    React.createElement('span', { key: 'i', className: 'detail-icon' }, icon),
    React.createElement('div', { key: 'info' }, [
      React.createElement('p', { key: 'l', className: 'detail-label' }, label),
      React.createElement('p', { key: 'v', className: 'detail-value' }, value)
    ])
  ])
}


function getWeatherIcon(code) {
  if (code <= 1) return '☀️'
  if (code === 2) return '⛅'
  if (code === 3) return '☁️'
  if (code >= 45 && code <= 48) return '🌫️'
  if (code >= 51 && code <= 55) return '🌦️'
  if (code >= 61 && code <= 65) return '🌧️'
  if (code >= 66 && code <= 67) return '🌨️'
  if (code >= 71 && code <= 77) return '❄️'
  if (code >= 80 && code <= 82) return '🌦️'
  if (code >= 85 && code <= 86) return '🌨️'
  if (code >= 95) return '⛈️'
  return '⛅'
}

function getWeatherText(code) {
  const map = {
    0: 'Sereno', 1: 'Prevalentemente sereno', 2: 'Parzialmente nuvoloso', 3: 'Nuvoloso',
    45: 'Nebbia', 48: 'Nebbia con brina',
    51: 'Pioggerella debole', 53: 'Pioggerella moderata', 55: 'Pioggerella intensa',
    61: 'Pioggia debole', 63: 'Pioggia moderata', 65: 'Pioggia forte',
    66: 'Pioggia gelata debole', 67: 'Pioggia gelata forte',
    71: 'Nevicata debole', 73: 'Nevicata moderata', 75: 'Nevicata intensa', 77: 'Granelli di neve',
    80: 'Rovescio debole', 81: 'Rovescio moderato', 82: 'Rovescio violento',
    85: 'Rovescio di neve debole', 86: 'Rovescio di neve forte',
    95: 'Temporale', 96: 'Temporale con grandine', 99: 'Temporale con grandine forte'
  }
  return map[code] || 'Misto'
}

function getWindDirection(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO']
  return dirs[Math.round(deg / 22.5) % 16]
}

function formatHour(isoString) {
  return new Date(isoString).getHours().toString().padStart(2, '0') + ':00'
}

function getWeatherColorScheme(code, isDay) {
  const day = isDay === 1
  if (code <= 1) return day
    ? { background: { primary: '#4A90E2', secondary: '#7BB3F0' }, overlay: { primary: 'rgba(0,0,0,0.2)', secondary: 'rgba(0,0,0,0.4)' }, temperature: { main: '#fff' }, text: { primary: '#fff', secondary: '#E8F4FD' }, cards: { background: 'rgba(255,255,255,0.2)', border: 'rgba(255,255,255,0.3)' } }
    : { background: { primary: '#1A237E', secondary: '#303F9F' }, overlay: { primary: 'rgba(0,0,0,0.3)', secondary: 'rgba(0,0,0,0.5)' }, temperature: { main: '#fff' }, text: { primary: '#fff', secondary: '#BBDEFB' }, cards: { background: 'rgba(255,255,255,0.15)', border: 'rgba(255,255,255,0.25)' } }
  if (code <= 48) return { background: { primary: '#546E7A', secondary: '#78909C' }, overlay: { primary: 'rgba(0,0,0,0.3)', secondary: 'rgba(0,0,0,0.5)' }, temperature: { main: '#fff' }, text: { primary: '#fff', secondary: '#ECEFF1' }, cards: { background: 'rgba(255,255,255,0.18)', border: 'rgba(255,255,255,0.3)' } }
  if (code <= 67 || (code >= 80 && code <= 82)) return { background: { primary: '#1976D2', secondary: '#42A5F5' }, overlay: { primary: 'rgba(0,0,0,0.3)', secondary: 'rgba(0,0,0,0.5)' }, temperature: { main: '#fff' }, text: { primary: '#fff', secondary: '#E3F2FD' }, cards: { background: 'rgba(255,255,255,0.2)', border: 'rgba(255,255,255,0.3)' } }
  if (code <= 77 || (code >= 85 && code <= 86)) return { background: { primary: '#90A4AE', secondary: '#B0BEC5' }, overlay: { primary: 'rgba(0,0,0,0.2)', secondary: 'rgba(0,0,0,0.4)' }, temperature: { main: '#fff' }, text: { primary: '#fff', secondary: '#F5F5F5' }, cards: { background: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.35)' } }
  return { background: { primary: '#37474F', secondary: '#546E7A' }, overlay: { primary: 'rgba(0,0,0,0.5)', secondary: 'rgba(0,0,0,0.7)' }, temperature: { main: '#fff' }, text: { primary: '#fff', secondary: '#ECEFF1' }, cards: { background: 'rgba(255,255,255,0.18)', border: 'rgba(255,255,255,0.3)' } }
}


handler.help = ['meteo <città>']
handler.tags = ['strumenti']
handler.command = ['meteo', 'clima', 'weather']

handler.group = true
handler.private = false
handler.owner = false
handler.admin = false
handler.botAdmin = false

export default handler
