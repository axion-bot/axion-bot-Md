// getfile by Bonzino

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!args[0]) {
throw `*📄 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐟𝐢𝐥𝐞*

*💡 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix + command} logo*`
}

const mediaDir = path.join(process.cwd(), 'media')

if (!fs.existsSync(mediaDir)) {
throw '*❌ 𝐋𝐚 𝐜𝐚𝐫𝐭𝐞𝐥𝐥𝐚 media 𝐧𝐨𝐧 𝐞𝐬𝐢𝐬𝐭𝐞*'
}

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

await conn.sendFile(
m.chat,
filePath,
file,
`*📄 𝐅𝐢𝐥𝐞 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐨*

*${file}*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
m
)
}

handler.help = ['getfile <nome>']
handler.tags = ['owner']
handler.command = ['getfile', 'file', 'sendfile']
handler.owner = true

export default handler