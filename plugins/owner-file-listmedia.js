// listmedia by Bonzino

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
const mediaDir = path.join(process.cwd(), 'media')

if (!fs.existsSync(mediaDir)) {
throw '*❌ 𝐋𝐚 𝐜𝐚𝐫𝐭𝐞𝐥𝐥𝐚 media 𝐧𝐨𝐧 𝐞𝐬𝐢𝐬𝐭𝐞*'
}

const files = fs.readdirSync(mediaDir)

if (!files.length) {
throw '*📂 𝐋𝐚 𝐜𝐚𝐫𝐭𝐞𝐥𝐥𝐚 media 𝐞̀ 𝐯𝐮𝐨𝐭𝐚*'
}

const list = files
.sort((a, b) => a.localeCompare(b))
.map((file, i) => {
const fullPath = path.join(mediaDir, file)
const isDir = fs.statSync(fullPath).isDirectory()
return `*${i + 1}.* ${isDir ? '📂 [DIR]' : '📄'} ${file}`
})
.join('\n')

await conn.reply(
m.chat,
`*📂 𝐅𝐢𝐥𝐞 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐢 𝐢𝐧 media*

${list}

*📊 𝐓𝐨𝐭𝐚𝐥𝐞:* ${files.length}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
m
)
}

handler.help = ['listmedia']
handler.tags = ['owner']
handler.command = ['media', 'listmedia', 'listamedia', 'medialist']
handler.owner = true

export default handler