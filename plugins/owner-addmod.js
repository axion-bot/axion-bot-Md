const handler = async (m, { conn, text }) => {

if (!m.isGroup)
return m.reply('❌ Questo comando funziona solo nei gruppi.')

let who = m.mentionedJid?.[0] || m.quoted?.sender || ''

if (!who && text) {
let number = text.replace(/\D/g, '')
if (number.length >= 8) who = number + '@s.whatsapp.net'
}

if (!who)
return m.reply('❌ Devi taggare o rispondere all’utente.')

let user = global.db.data.users[who] || (global.db.data.users[who] = {})

if (user.premium && user.premiumGroup === m.chat) {
return m.reply(`@${who.split('@')[0]} è già moderatore.`, null, { mentions: [who] })
}

user.premium = true
user.premiumGroup = m.chat

let thumbnail = null

try {
const pp = await conn.profilePictureUrl(who, 'image')
const res = await fetch(pp)
thumbnail = Buffer.from(await res.arrayBuffer())
} catch {}

await conn.sendMessage(m.chat, {
text: `@${who.split('@')[0]} ora è moderatore di questo gruppo.`,
contextInfo: {
mentionedJid: [who],
externalAdReply: {
title: '🛡️ Moderatore aggiunto',
thumbnail: thumbnail
}
}
}, { quoted: m })

}

handler.help = ['addmod @user']
handler.tags = ['group']
handler.command = ['addmod']
handler.group = true
handler.rowner = true

export default handler