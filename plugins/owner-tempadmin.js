// tempadmin by Bonzino
function ensureTempAdmins(chat){
global.db.data.chats ||= {}
global.db.data.chats[chat] ||= {}
global.db.data.chats[chat].tempAdmins ||= {}
return global.db.data.chats[chat].tempAdmins
}

function parseDuration(txt=''){
const m=txt.toLowerCase().match(/^(\d+)(m|h|g)$/)
if(!m)return null
const n=Number(m[1])
const t=m[2]
if(t==='m')return n*60*1000
if(t==='h')return n*60*60*1000
if(t==='g')return n*24*60*60*1000
return null
}

let handler=async(m,{conn,args,command,isOwner})=>{

if(!m.isGroup)return
if(!isOwner)return

if(['tempadmin','tadmin'].includes(command)){

const who=
m.mentionedJid?.[0]||
(m.quoted?m.quoted.sender:null)

if(!who){
return m.reply('*❌ 𝐓𝐚𝐠𝐠𝐚 𝐨 𝐪𝐮𝐨𝐭𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞*')
}

const metadata=await conn.groupMetadata(m.chat)

const participant=metadata.participants.find(
p=>p.id===who || p.jid===who
)

if(participant?.admin){
return m.reply(
'*❌ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐚𝐦𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐞.*'
)
}

const tempAdmins=ensureTempAdmins(m.chat)

if(tempAdmins[who]){
return m.reply(
'*❌ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐡𝐚 𝐠𝐢à 𝐮𝐧 𝐚𝐝𝐦𝐢𝐧 𝐭𝐞𝐦𝐩𝐨𝐫𝐚𝐧𝐞𝐨 𝐚𝐭𝐭𝐢𝐯𝐨.*'
)
}

const tempo=args.find(v=>/^\d+(m|h|g)$/i.test(v))

if(!tempo){
return m.reply('*❌ 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:* *.tempadmin @utente 1h*')
}

const durata=parseDuration(tempo)

if(!durata){
return m.reply('*❌ 𝐅𝐨𝐫𝐦𝐚𝐭𝐨 𝐯𝐚𝐥𝐢𝐝𝐨:* *30m, 1h, 2g*')
}

try{
await conn.groupParticipantsUpdate(
m.chat,
[who],
'promote'
)
}catch(e){
return m.reply(`*❌ ${e?.message||e}*`)
}

tempAdmins[who]={
expiresAt:Date.now()+durata,
by:m.sender
}

return conn.sendMessage(m.chat,{
text:`*𝐀𝐃𝐌𝐈𝐍 𝐓𝐄𝐌𝐏𝐎𝐑𝐀𝐍𝐄𝐎 𝐈𝐌𝐏𝐎𝐒𝐓𝐀𝐓𝐎 ✅️*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${who.split('@')[0]}
*⏳ 𝐃𝐮𝐫𝐚𝐭𝐚:* ${tempo}
*👮 𝐄𝐬𝐞𝐠𝐮𝐢𝐭𝐨 𝐝𝐚:* @${m.sender.split('@')[0]}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
mentions:[who,m.sender]
},{quoted:m})
}

if(command==='rtadmin'){

const who=
m.mentionedJid?.[0]||
(m.quoted?m.quoted.sender:null)

if(!who){
return m.reply('*❌ 𝐓𝐚𝐠𝐠𝐚 𝐨 𝐪𝐮𝐨𝐭𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞*')
}

const tempAdmins=ensureTempAdmins(m.chat)

if(!tempAdmins[who]){
return m.reply('*❌ 𝐔𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐞 𝐧𝐞𝐢 𝐓𝐞𝐦𝐩𝐀𝐝𝐦𝐢𝐧*')
}

try{
await conn.groupParticipantsUpdate(
m.chat,
[who],
'demote'
)
}catch{}

delete tempAdmins[who]

return conn.sendMessage(m.chat,{
text:`*𝐀𝐃𝐌𝐈𝐍 𝐓𝐄𝐌𝐏𝐎𝐑𝐀𝐍𝐄𝐎 𝐑𝐈𝐌𝐎𝐒𝐒𝐎 ❌️*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${who.split('@')[0]}
*👮 𝐄𝐬𝐞𝐠𝐮𝐢𝐭𝐨 𝐝𝐚:* @${m.sender.split('@')[0]}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
mentions:[who,m.sender]
},{quoted:m})
}
}

handler.before=async function(m,{conn}){

if(!m.isGroup)return false

const tempAdmins=
global.db.data.chats?.[m.chat]?.tempAdmins

if(!tempAdmins)return false

for(const jid of Object.keys(tempAdmins)){

const data=tempAdmins[jid]

if(Date.now()<data.expiresAt)continue

try{
await conn.groupParticipantsUpdate(
m.chat,
[jid],
'demote'
)

await conn.sendMessage(m.chat,{
text:`*⌛️ 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${jid.split('@')[0]}

*🔻 𝐈 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢 𝐝𝐢 𝐚𝐦𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐞 𝐬𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐫𝐢𝐦𝐨𝐬𝐬𝐢 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐞.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
mentions:[jid]
})
}catch{}

delete tempAdmins[jid]
}

return false
}

handler.help=['tempadmin','deltempadmin']
handler.tags=['owner']
handler.command=/^(tempadmin|tadmin|rtadmin)$/i
handler.owner=true
handler.group=true

export default handler