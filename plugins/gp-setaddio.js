// group-setaddio by Bonzino

let handler = async (m, { conn, text, command, isAdmin, isOwner, isROwner, usedPrefix }) => {

const extractGroupId = str => {
const match = String(str || '').match(/(?:^|\s)(\d{10,}@g\.us)(?=$|\s)/i)
return match ? match[1] : null
}

if (!isAdmin && !isOwner && !isROwner && !m.fromMe)
return m.reply('*❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐨𝐰𝐧𝐞𝐫.*')

let target = null
let messageText = String(text || '').trim()

const groupId = extractGroupId(messageText)

if (groupId) {
target = groupId
messageText = messageText.replace(groupId, '').trim()
} else if (m.isGroup) {
target = m.chat
}

if (!target) {
return m.reply(
`*⚠️ 𝐃𝐞𝐯𝐢 𝐢𝐧𝐝𝐢𝐜𝐚𝐫𝐞 𝐮𝐧 𝐠𝐫𝐮𝐩𝐩𝐨.*

*📌 𝐄𝐬𝐞𝐦𝐩𝐢:*
*${usedPrefix}setaddio Ciao @user*
*${usedPrefix}setaddio 1203630xxxxxxxx@g.us Ciao @user*
*${usedPrefix}addio 1203630xxxxxxxx@g.us*
*${usedPrefix}deladdio 1203630xxxxxxxx@g.us*`
)
}

global.db.data.chats[target] ||= {}
const chat = global.db.data.chats[target]

if (command === 'setaddio') {

if (!messageText)
return m.reply(
`*⚠️ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨.*

*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*

*.setaddio*

*👋 𝐂𝐢𝐚𝐨 @user*`
)

chat.goodbyeCustom = messageText

return m.reply(
`*✅ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐢 𝐚𝐝𝐝𝐢𝐨 𝐬𝐚𝐥𝐯𝐚𝐭𝐨.*

*📄 𝐀𝐧𝐭𝐞𝐩𝐫𝐢𝐦𝐚:*

${messageText}`
)
}

if (command === 'addio') {

if (!chat.goodbyeCustom)
return m.reply('*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐢 𝐚𝐝𝐝𝐢𝐨 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨.*')

return m.reply(
`*📄 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞:*

${chat.goodbyeCustom}`
)
}

if (command === 'deladdio') {

delete chat.goodbyeCustom

return m.reply('*✅ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐢 𝐚𝐝𝐝𝐢𝐨 𝐫𝐢𝐦𝐨𝐬𝐬𝐨.*')
}
}

handler.help = ['setaddio','addio','deladdio']
handler.tags = ['group']
handler.command = /^(setaddio|addio|deladdio)$/i
handler.group = false

export default handler