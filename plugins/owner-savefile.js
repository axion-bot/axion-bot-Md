// save by Bonzino

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
let q = m.quoted || m
let mime = q.mimetype || ''

if (!mime) {
throw `*📁 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐦𝐞𝐝𝐢𝐚*

*📌 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix + command} logo*`
}

if (!args[0]) {
throw `*✏️ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐧𝐨𝐦𝐞 𝐟𝐢𝐥𝐞*

*📌 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix + command} logo*`
}

let nome = args.join('_').trim()

if (!/^[a-zA-Z0-9_-]+$/.test(nome)) {
throw '*❌ 𝐔𝐬𝐚 𝐬𝐨𝐥𝐨 𝐥𝐞𝐭𝐭𝐞𝐫𝐞, 𝐧𝐮𝐦𝐞𝐫𝐢, - 𝐞 _*'
}

let buffer = await q.download()

if (!buffer) throw '*❌ 𝐈𝐦𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞 𝐬𝐜𝐚𝐫𝐢𝐜𝐚𝐫𝐞 𝐢𝐥 𝐦𝐞𝐝𝐢𝐚*'

let ext = mime.split('/')[1]?.split(';')[0] || 'bin'

if (/jpeg|jpg/i.test(ext)) ext = 'jpg'
if (/png/i.test(ext)) ext = 'png'
if (/webp/i.test(ext)) ext = 'webp'
if (/mpeg/i.test(ext)) ext = 'mp3'
if (/ogg/i.test(ext)) ext = 'ogg'
if (/mp4/i.test(ext)) ext = 'mp4'
if (/quicktime/i.test(ext)) ext = 'mov'

const mediaDir = path.join(process.cwd(), 'media')

if (!fs.existsSync(mediaDir)) {
fs.mkdirSync(mediaDir, { recursive: true })
}

const fileName = `${nome}.${ext}`
const filePath = path.join(mediaDir, fileName)

if (fs.existsSync(filePath)) {
throw `*⚠️ 𝐄𝐬𝐢𝐬𝐭𝐞 𝐠𝐢𝐚̀ 𝐮𝐧 𝐟𝐢𝐥𝐞 𝐜𝐨𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐧𝐨𝐦𝐞*

*📄 𝐅𝐢𝐥𝐞:* ${fileName}

*✏️ 𝐒𝐜𝐞𝐠𝐥𝐢 𝐮𝐧 𝐚𝐥𝐭𝐫𝐨 𝐧𝐨𝐦𝐞.*`
}

fs.writeFileSync(filePath, buffer)

await conn.reply(m.chat,
`*✅ 𝐌𝐞𝐝𝐢𝐚 𝐬𝐚𝐥𝐯𝐚𝐭𝐨 𝐜𝐨𝐫𝐫𝐞𝐭𝐭𝐚𝐦𝐞𝐧𝐭𝐞*

*📄 𝐅𝐢𝐥𝐞:*
*${fileName}*

*📂 𝐏𝐞𝐫𝐜𝐨𝐫𝐬𝐨:*
\`${filePath}\`

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
m)
}

handler.help = ['save <nome>']
handler.tags = ['owner']
handler.command = ['save']
handler.owner = true

export default handler