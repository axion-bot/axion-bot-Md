// fileinfo by Bonzino

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!args[0]) {
throw `*📄 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐟𝐢𝐥𝐞*

*💡 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix + command} logo*`
}

const mediaDir = path.join(process.cwd(), 'media')

const query = args.join(' ').trim().toLowerCase()

const files = fs.readdirSync(mediaDir)

const file = files.find(v =>
v.toLowerCase() === query ||
v.toLowerCase().startsWith(query + '.')
)

if (!file) {
throw `*❌ 𝐅𝐢𝐥𝐞 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐨*

*🔎 𝐑𝐢𝐜𝐞𝐫𝐜𝐚:* ${query}`
}

const filePath = path.join(mediaDir, file)
const stat = fs.statSync(filePath)

const sizeKB = (stat.size / 1024).toFixed(2)

await conn.reply(m.chat,
`*📄 𝐈𝐧𝐟𝐨 𝐅𝐢𝐥𝐞*

*𝐍𝐨𝐦𝐞:*
*${file}*

*📦 𝐃𝐢𝐦𝐞𝐧𝐬𝐢𝐨𝐧𝐞:*
*${sizeKB} KB*

*📅 𝐂𝐫𝐞𝐚𝐭𝐨:*
*${stat.birthtime.toLocaleString('it-IT')}*

*📂 𝐏𝐞𝐫𝐜𝐨𝐫𝐬𝐨:*
\`${filePath}\`

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
m)
}

handler.help = ['fileinfo <nome>']
handler.tags = ['owner']
handler.command = ['fileinfo', 'infofile', 'statfile']
handler.owner = true

export default handler