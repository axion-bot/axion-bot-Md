// delfile by Bonzino

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!args[0]) {
throw `*🗑️ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐟𝐢𝐥𝐞*

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

fs.unlinkSync(filePath)

await conn.reply(m.chat,
`*✅ 𝐅𝐢𝐥𝐞 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐨*

*📄 𝐅𝐢𝐥𝐞:*
*${file}*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
m)
}

handler.help = ['delfile <nome>']
handler.tags = ['owner']
handler.command = ['delfile', 'rmfile', 'deletefile']
handler.owner = true

export default handler