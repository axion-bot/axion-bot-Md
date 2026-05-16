import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@realvare/baileys'
import pino from 'pino'
import fs from 'fs'
import { smsg } from '../lib/simple.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`🌀 *𝛥𝐗𝐈𝚶𝐍 𝐂𝐎𝐍𝐍𝐄𝐂𝐓* 🌀\n\nInserisci il numero dopo il comando.\nEsempio: *${usedPrefix + command} 39333xxxxxxx*`)

    let phoneNumber = text.replace(/[^0-9]/g, '')
    if (phoneNumber.length < 10) return m.reply('❌ 𝐍𝐮𝐦𝐞𝐫𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.')

    await m.reply('⏳ *𝐆𝐞𝐧𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 𝐂𝐨𝐝𝐞...*')

    let authFolder = `./temp_sessions/${phoneNumber}`
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, { recursive: true })

    const { state, saveCreds } = await useMultiFileAuthState(authFolder)
    const { version } = await fetchLatestBaileysVersion()

    try {
        let socket = makeWASocket({
            version,
            printQRInTerminal: false,
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: Browsers.ubuntu('Chrome'),
            getMessage: async (key) => { return { noCondition: true } }
        })

        if (!socket.authState.creds.registered) {
            setTimeout(async () => {
                let code = await socket.requestPairingCode(phoneNumber)
                let message = `🧬 *𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌 𝐂𝐎𝐍𝐍𝐄𝐂𝐓* 🧬\n\n`
                message += `👤 **𝐔𝐭𝐞𝐧𝐭𝐞:** +${phoneNumber}\n`
                message += `🔑 **𝐏𝐚𝐢𝐫𝐢𝐧𝐠 𝐂𝐨𝐝𝐞:** \`${code}\`\n\n`
                message += `> Inserisci il codice su WhatsApp per attivare i plugin di **𝛥𝐗𝐈𝚶𝐍** su questo numero.`
                await conn.sendMessage(m.chat, { text: message }, { quoted: m })
            }, 3000)
        }

        socket.ev.on('creds.update', saveCreds)

        socket.ev.on('messages.upsert', async chatUpdate => {
            try {
                let mek = chatUpdate.messages[0]
                if (!mek.message) return
                let m2 = smsg(socket, mek, null)
                if (global.handler) global.handler(socket, m2) 
            } catch (e) {
                console.error(e)
            }
        })

        socket.ev.on('connection.update', async (update) => {
            const { connection } = update
            if (connection === 'open') {
                await conn.sendMessage(m.chat, { text: `✅ *𝛥𝐗𝐈𝚶𝐍 𝐁𝐎𝐓 𝐀𝐓𝐓𝐈𝐕𝐎!*\n\nIl numero +${phoneNumber} è ora sincronizzato con il sistema centrale.` })
            }
        })

    } catch (error) {
        console.error(error)
        m.reply('❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐢 𝐬𝐢𝐧𝐜𝐫𝐨𝐧𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞.')
    }
}

handler.help = ['connettibot']
handler.tags = ['main']
handler.command = /^(connettibot)$/i

export default handler