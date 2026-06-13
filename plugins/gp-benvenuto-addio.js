// welcome-goodbye by Bonzino & Deadly

import { WAMessageStubType } from '@realvare/baileys'

let handler = m => m

const codaBenvenuti = {}
const LIMITE_BENVENUTI_SINGOLI = 7
const RITARDO_BENVENUTO = 3500
const TEMPO_RAGGRUPPAMENTO = 5000

const sleep = ms => new Promise(r => setTimeout(r, ms))
const getCard = async () => await import(`../lib/cards/welcome-card.js?update=${Date.now()}`)
const numero = jid => '+' + String(jid || '').split('@')[0]

const getNameSafe = (conn, jid) => {
try {
let name = conn.getName(jid)
name = String(name || '').trim()
if (!name || name === jid || name.includes('@s.whatsapp.net') || /^\+?\d+$/.test(name.replace(/\s+/g, ''))) return numero(jid)
name = name.replace(/@\w+/g, '').trim()
return name || numero(jid)
} catch {
return numero(jid)
}
}

async function getMetaSafe(conn, chatId, groupMetadata = null) {
try {
const meta = groupMetadata?.subject ? groupMetadata : await conn.groupMetadata(chatId)
return {
name: meta?.subject || 'Gruppo',
members: Array.isArray(meta?.participants) ? meta.participants.length : 0
}
} catch {
return { name: 'Gruppo', members: 0 }
}
}

function ottieniCoda(chat) {
codaBenvenuti[chat] ||= { utenti: new Set(), timer: null, gruppo: 'Gruppo', members: 0 }
return codaBenvenuti[chat]
}

async function inviaBenvenuti(chatId, conn) {
const dati = codaBenvenuti[chatId]
if (!dati) return

const utenti = [...dati.utenti]
const gruppo = dati.gruppo || 'Gruppo'
const members = dati.members || 0

delete codaBenvenuti[chatId]
if (!utenti.length) return

const { createWelcomeCard } = await getCard()

if (utenti.length > 1) {
await conn.sendMessage(chatId,{
text:`*👋 𝐁𝐄𝐍𝐕𝐄𝐍𝐔𝐓𝐈 𝐍𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎!*

*𝐏𝐞𝐫 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐚𝐫𝐯𝐢 𝐢𝐧𝐯𝐢𝐚𝐭𝐞:*

• *📷 𝐟𝐨𝐭𝐨 𝟏 𝐯𝐢𝐬𝐮𝐚𝐥*
• *🎂 𝐋𝐚 𝐯𝐨𝐬𝐭𝐫𝐚 𝐞𝐭à*
• *📍 𝐋𝐚 𝐯𝐨𝐬𝐭𝐫𝐚 𝐩𝐫𝐨𝐯𝐞𝐧𝐢𝐞𝐧𝐳𝐚*

*🤝 𝐁𝐮𝐨𝐧𝐚 𝐩𝐞𝐫𝐦𝐚𝐧𝐞𝐧𝐳𝐚!*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
})

return
}

for (let i = 0; i < utenti.length; i++) {
const jid = utenti[i]
if (i !== 0) await sleep(RITARDO_BENVENUTO)

const name = getNameSafe(conn, jid)

const card = await createWelcomeCard({
conn,
jid,
username: name,
group: gruppo,
members,
type: 'benvenuto!'
})

await conn.sendMessage(chatId,{
image: card,
mentions: [jid]
})
}
}

handler.before = async function (m, { conn, groupMetadata }) {
if (!m.isGroup || !m.messageStubType) return false

const chat = global.db?.data?.chats?.[m.chat]
if (!chat || (!chat.welcome && !chat.goodbye)) return false

const isAdd = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD
const isRemove =
m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE

if (!isAdd && !isRemove) return false

const whos = Array.isArray(m.messageStubParameters) ? m.messageStubParameters : []
if (!whos.length) return false

const jids = whos.map(w => conn.decodeJid(w)).filter(Boolean)
if (!jids.length) return false

const meta = await getMetaSafe(conn, m.chat, groupMetadata)
const groupName = meta.name
const members = isAdd ? meta.members : Math.max(0, meta.members - jids.length)

if (isAdd && chat.welcome) {
const coda = ottieniCoda(m.chat)

for (const jid of jids) {
coda.utenti.add(jid)
}

coda.gruppo = groupName
coda.members = members

if (coda.timer) clearTimeout(coda.timer)
coda.timer = setTimeout(() => inviaBenvenuti(m.chat, conn).catch(console.error), TEMPO_RAGGRUPPAMENTO)

return true
}

if (isRemove && chat.goodbye) {
const { createWelcomeCard } = await getCard()

for (let i = 0; i < jids.length; i++) {
const jid = jids[i]
if (i !== 0) await sleep(1200)

const name = getNameSafe(conn, jid)

const card = await createWelcomeCard({
conn,
jid,
username: name,
group: groupName,
members,
type: 'addio!'
})

await conn.sendMessage(m.chat, { image: card, mentions: [jid] }, { quoted: m })
}

return true
}

return false
}

export default handler