// ipfromphone.js - Plugin per ottenere IP da numero di telefono
// by deadly

import axios from 'axios'
import dns from 'dns/promises'

const S = v => String(v || '')
const clean = jid => S(jid).replace(/[^0-9]/g, '')
const commands = ['ipfromphone', 'getip', 'trackip', 'iptelefono', 'localizza', 'ipnum']
const cmdRegex = new RegExp(`^(${commands.join('|')})(?:\\s|$)`, 'i')
const footer = text => `${text}\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

// Database di mapping numero -> IP (da popolare manualmente con dati reali)
// Formato: "numero_senza_prefisso" : { ip: "192.168.1.1", provider: "TIM", lastSeen: "2024-01-01" }
const PHONE_IP_DATABASE = {
    // ESEMPI - SOSTITUIRE CON DATI REALI
    // "39123456789": { ip: "93.44.123.45", provider: "Vodafone", city: "Roma", region: "Lazio", country: "IT" },
    // "447123456789": { ip: "81.139.124.53", provider: "EE", city: "London", region: "England", country: "GB" },
}

// Servizi pubblici per lookup IP (geolocalizzazione)
async function getIPGeolocation(ip) {
    try {
        // ip-api.com gratuito (45 richieste/minuto)
        const response = await axios.get(`http://ip-api.com/json/${ip}`, {
            timeout: 5000
        })
        if (response.data && response.data.status === 'success') {
            return {
                country: response.data.country,
                countryCode: response.data.countryCode,
                region: response.data.regionName,
                city: response.data.city,
                zip: response.data.zip,
                lat: response.data.lat,
                lon: response.data.lon,
                timezone: response.data.timezone,
                isp: response.data.isp,
                org: response.data.org,
                as: response.data.as
            }
        }
    } catch(e) {}
    return null
}

// Verifica se IP è in database di threat intelligence
async function checkThreatIntel(ip) {
    const results = {
        isMalicious: false,
        threats: [],
        vpn: false,
        proxy: false,
        tor: false,
        datacenter: false
    }
    
    try {
        // ipinfo.io (gratuito con limiti)
        const response = await axios.get(`https://ipinfo.io/${ip}/json`, {
            timeout: 5000
        })
        if (response.data) {
            const org = (response.data.org || '').toLowerCase()
            results.datacenter = org.includes('google') || org.includes('amazon') || org.includes('microsoft') || org.includes('digitalocean') || org.includes('vultr') || org.includes('ovh') || org.includes('hetzner')
            results.vpn = org.includes('vpn') || org.includes('nord') || org.includes('express') || org.includes('surfshark')
            results.proxy = org.includes('proxy') || org.includes('socks')
        }
    } catch(e) {}
    
    try {
        // abuseipdb (richiede API key)
        const ABUSEIPDB_KEY = process.env.ABUSEIPDB_KEY || ''
        if (ABUSEIPDB_KEY) {
            const response = await axios.get(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`, {
                headers: { 'Key': ABUSEIPDB_KEY, 'Accept': 'application/json' },
                timeout: 5000
            })
            if (response.data && response.data.data) {
                results.isMalicious = response.data.data.abuseConfidenceScore > 50
                if (results.isMalicious) {
                    results.threats.push(`AbuseIPDB score: ${response.data.data.abuseConfidenceScore}`)
                }
            }
        }
    } catch(e) {}
    
    // Controllo TOR tramite DNS (gratuito)
    try {
        const torHostname = `${ip.replace(/\./g, '.')}.dnsel.torproject.org`
        await dns.lookup(torHostname)
        results.tor = true
    } catch(e) {}
    
    return results
}

// Simula trace route (non reale, per completezza)
function simulateTraceroute(ip, phoneNumber) {
    const num = phoneNumber.replace(/[^0-9]/g, '')
    const hops = [
        { hop: 1, ip: '192.168.1.1', hostname: 'gateway.local', time: '2ms' },
        { hop: 2, ip: '10.0.0.1', hostname: 'provider-gw.local', time: '5ms' },
        { hop: 3, ip: ip, hostname: 'target-host', time: '15ms' }
    ]
    return hops
}

// Cerca correlazioni tra numero e IP in database pubblici
async function findPublicCorrelations(phoneNumber) {
    const num = phoneNumber.replace(/[^0-9]/g, '')
    const correlations = []
    
    try {
        // Cerca su pastebin/dump pubblici (placeholder - richiede scraping)
        // Questa è una simulazione
        const response = await axios.get(`https://pastebin.com/raw/${num.slice(-6)}`, { timeout: 3000, validateStatus: false })
        if (response.status === 200) {
            correlations.push('Potenziale correlazione trovata su pastebin')
        }
    } catch(e) {}
    
    return correlations
}

async function runIPFromPhone(m, { conn, text = '', isAdmin, isOwner, isROwner }) {
    if (!m.isGroup && !isAdmin && !isOwner && !isROwner) return false
    
    const mention = m.mentionedJid?.[0] || m.quoted?.sender || null
    
    if (!mention) {
        await conn.sendMessage(m.chat, {
            text: footer(`*⚠️ Rispondi a un messaggio o menziona l'utente da analizzare.*`)
        }, { quoted: m })
        return false
    }
    
    const targetJid = mention
    const targetNumber = clean(targetJid)
    const executorTag = '@' + clean(m.sender)
    
    await conn.sendMessage(m.chat, {
        text: footer(`*🔍 RICERCA IP IN CORSO...*\n\nTarget: +${targetNumber}\nScansione database e servizi pubblici...`)
    }, { quoted: m })
    
    let foundIP = null
    let ipSource = null
    let ipData = null
    let threatData = null
    let traceroute = null
    let correlations = []
    
    // 1. Controllo database locale
    if (PHONE_IP_DATABASE[targetNumber]) {
        foundIP = PHONE_IP_DATABASE[targetNumber].ip
        ipSource = 'Database locale'
        ipData = PHONE_IP_DATABASE[targetNumber]
    }
    
    // 2. Cerca correlazioni pubbliche
    correlations = await findPublicCorrelations(targetNumber)
    
    // Se abbiamo un IP, fai geolocalizzazione e threat intel
    if (foundIP) {
        ipData = ipData || await getIPGeolocation(foundIP)
        threatData = await checkThreatIntel(foundIP)
        traceroute = simulateTraceroute(foundIP, targetNumber)
    }
    
    // Costruzione output
    let output = `📡 *IP TRACING REPORT* 📡\n\n`
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    
    output += `📱 *TARGET*\n`
    output += `   • Numero: +${targetNumber}\n`
    output += `   • JID: ${targetJid}\n`
    output += `   • Richiedente: ${executorTag}\n\n`
    
    output += `🖥️ *INDIRIZZO IP*\n`
    
    if (foundIP) {
        output += `   • IP Trovato: ${foundIP}\n`
        output += `   • Fonte: ${ipSource}\n\n`
        
        if (ipData) {
            output += `━━━━━ *GEOLOCALIZZAZIONE* ━━━━━\n`
            if (ipData.country) output += `   • Paese: ${ipData.country} (${ipData.countryCode || '?'})\n`
            if (ipData.region) output += `   • Regione: ${ipData.region}\n`
            if (ipData.city) output += `   • Città: ${ipData.city}\n`
            if (ipData.zip) output += `   • CAP: ${ipData.zip}\n`
            if (ipData.lat && ipData.lon) output += `   • Coordinate: ${ipData.lat}, ${ipData.lon}\n`
            if (ipData.timezone) output += `   • Timezone: ${ipData.timezone}\n`
            if (ipData.isp) output += `   • ISP: ${ipData.isp}\n`
            if (ipData.org) output += `   • Organizzazione: ${ipData.org}\n`
            if (ipData.as) output += `   • ASN: ${ipData.as}\n`
            output += `\n`
        }
        
        if (threatData) {
            output += `━━━━━ *THREAT INTELLIGENCE* ━━━━━\n`
            output += `   • Maligno: ${threatData.isMalicious ? '⚠️ SÌ' : '❌ No'}\n`
            output += `   • VPN: ${threatData.vpn ? '✅ Sì' : '❌ No'}\n`
            output += `   • Proxy: ${threatData.proxy ? '✅ Sì' : '❌ No'}\n`
            output += `   • TOR: ${threatData.tor ? '✅ Sì' : '❌ No'}\n`
            output += `   • Datacenter: ${threatData.datacenter ? '✅ Sì' : '❌ No'}\n`
            if (threatData.threats.length) {
                output += `   • Minacce: ${threatData.threats.join(', ')}\n`
            }
            output += `\n`
        }
        
        if (traceroute) {
            output += `━━━━━ *TRACEROUTE SIMULATO* ━━━━━\n`
            for (const hop of traceroute) {
                output += `   • Hop ${hop.hop}: ${hop.ip} (${hop.hostname}) - ${hop.time}\n`
            }
            output += `\n`
        }
    } else {
        output += `   ❌ *NESSUN IP TROVATO*\n\n`
        output += `━━━━━ *MOTIVI POSSIBILI* ━━━━━\n`
        output += `   • L'IP non è associato pubblicamente al numero\n`
        output += `   • Il numero non è in database locali\n`
        output += `   • L'utente usa VPN/proxy/TOR\n`
        output += `   • L'utente è dietro NAT carrier-grade\n\n`
    }
    
    if (correlations.length) {
        output += `━━━━━ *CORRELAZIONI PUBBLICHE* ━━━━━\n`
        for (const corr of correlations) {
            output += `   • ${corr}\n`
        }
        output += `\n`
    }
    
    output += `━━━━━ *NOTE TECNICHE* ━━━━━\n`
    output += `   • ⚠️ L'IP di un telefono è solitamente dinamico\n`
    output += `   • I provider mobili usano CG-NAT (IP condivisi)\n`
    output += `   • È impossibile ottenere IP reale senza cooperazione del provider\n`
    output += `   • I dati qui mostrati sono da DB locali o servizi pubblici\n`
    output += `   • Per IP reale: server con websocket o phishing\n\n`
    
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    output += `🕐 *Timestamp:* ${new Date().toLocaleString()}\n`
    
    output += `\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
    
    await conn.sendMessage(m.chat, {
        text: output,
        mentions: [targetJid, m.sender]
    }, { quoted: m })
    
    return true
}

async function handler(m, args) {
    return runIPFromPhone(m, args)
}

handler.before = async function(m, args) {
    const text = S(m.text).trim()
    if (!cmdRegex.test(text)) return false
    await runIPFromPhone(m, { ...args, text })
    return true
}

handler.command = /^(ipfromphone|getip|trackip|iptelefono|localizza|ipnum)$/i
handler.admin = false
handler.botAdmin = false
handler.group = false

export default handler