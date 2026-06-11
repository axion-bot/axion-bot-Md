// gruppi by Bonzino

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var handler = async (m, { conn, text, command, isOwner, usedPrefix }) => {
if (!isOwner) return

let groups = Object.values(await conn.groupFetchAllParticipating())

if (command === 'gruppi') {
if (!groups.length) {
return conn.reply(m.chat,
`*⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐠𝐫𝐮𝐩𝐩𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`, m)
}

let txt = `*🏢 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐆𝐑𝐔𝐏𝐏𝐈*

*⚡ 𝐔𝐬𝐨:*
*${usedPrefix}esci <numeri> si/no*

*⚡ 𝐄𝐬𝐞𝐦𝐩𝐢:*
*${usedPrefix}esci 2 no*
*${usedPrefix}esci 1 3 5 si*

*📢 𝐒𝐈:* 𝐢𝐧𝐯𝐢𝐚 5 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐜𝐨𝐧 𝐭𝐚𝐠 𝐠𝐥𝐨𝐛𝐚𝐥𝐞 𝐩𝐫𝐢𝐦𝐚 𝐝𝐢 𝐮𝐬𝐜𝐢𝐫𝐞.
*🔇 𝐍𝐎:* 𝐞𝐬𝐜𝐞 𝐬𝐞𝐧𝐳𝐚 𝐬𝐩𝐚𝐦.

`

groups.forEach((g, i) => {
txt += `*${i + 1}.* *${g.subject || 'Senza nome'}*
*👥 𝐌𝐞𝐦𝐛𝐫𝐢:* *${g.participants?.length || 0}*
*🆔 𝐈𝐃:* \`${g.id}\`

`
})

txt += `> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

return conn.reply(m.chat, txt.trim(), m)
}

if (command === 'esci') {
let args = String(text || '').trim().split(/\s+/).filter(Boolean)
let spamArg = args[args.length - 1]?.toLowerCase()
let spam = spamArg === 'si' ? 'si' : 'no'

if (spamArg === 'si' || spamArg === 'no') args.pop()

let indexes = [...new Set(args.map(v => parseInt(v)).filter(v => !isNaN(v) && v >= 1 && v <= groups.length))]

if (!indexes.length) {
return conn.reply(m.chat,
`*⚠️ 𝐅𝐨𝐫𝐦𝐚𝐭𝐨 𝐞𝐫𝐫𝐚𝐭𝐨.*

*⚡ 𝐔𝐬𝐨:*
*${usedPrefix}esci <numeri> si/no*

*⚡ 𝐄𝐬𝐞𝐦𝐩𝐢:*
*${usedPrefix}esci 2 no*
*${usedPrefix}esci 1 3 5 si*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`, m)
}

let risultati = []

for (let n of indexes) {
let targetGroup = groups[n - 1]
if (!targetGroup) continue

try {
let participants = (targetGroup.participants || []).map(u => conn.decodeJid(u.id)).filter(Boolean)

if (spam === 'si') {
for (let i = 0; i < 5; i++) {
await conn.sendMessage(targetGroup.id, {
text: `*📢 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀 𝐃𝐈 𝐔𝐒𝐂𝐈𝐓𝐀*

*𝐄𝐧𝐭𝐫𝐚 𝐧𝐞𝐥 𝐜𝐚𝐧𝐚𝐥𝐞 𝐮𝐟𝐟𝐢𝐜𝐢𝐚𝐥𝐞:*

https://whatsapp.com/channel/0029Vb8MQ3U1CYoMEtU1832d

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
mentions: participants
})
await delay(500)
}
}

await conn.reply(targetGroup.id,
`*👋 𝐀𝐱𝐢𝐨𝐧 𝐬𝐭𝐚 𝐮𝐬𝐜𝐞𝐧𝐝𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`)

await delay(500)
await conn.groupLeave(targetGroup.id)

risultati.push(`*✅ ${n}.* *${targetGroup.subject || 'Senza nome'}*`)
await delay(1000)
} catch (e) {
console.error(e)
risultati.push(`*❌ ${n}.* *${targetGroup.subject || 'Senza nome'}*`)
}
}

return conn.reply(m.chat,
`*🏢 𝐎𝐏𝐄𝐑𝐀𝐙𝐈𝐎𝐍𝐄 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀*

*📢 𝐒𝐩𝐚𝐦:* *${spam.toUpperCase()}*

${risultati.join('\n')}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`, m)
}
}

handler.command = ['gruppi', 'esci']
handler.owner = true

export default handler