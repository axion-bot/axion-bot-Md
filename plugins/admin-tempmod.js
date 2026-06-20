// tempmod by Bonzino

function ensureTempMods(chat){
global.db.data.chats ||= {}
global.db.data.chats[chat] ||= {}
global.db.data.chats[chat].tempMods ||= {}
return global.db.data.chats[chat].tempMods
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

let handler=async(m,{conn,args,command,isAdmin})=>{

if(!m.isGroup)return
if(!isAdmin)return

if(['tempmod','tmod'].includes(command)){

const who=
m.mentionedJid?.[0]||
m.quoted?.sender||
''

if(!who){
return m.reply('*❌ 𝐓𝐚𝐠𝐠𝐚 𝐨 𝐪𝐮𝐨𝐭𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞*')
}

let user=global.db.data.users[who]||(global.db.data.users[who]={})

if(user.moderator&&user.moderatorGroup===m.chat){
return m.reply(
'*❌ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐦𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐞.*'
)
}

const tempMods=ensureTempMods(m.chat)

if(tempMods[who]){
return m.reply(
'*❌ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐡𝐚 𝐠𝐢à 𝐮𝐧 𝐦𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐞 𝐭𝐞𝐦𝐩𝐨𝐫𝐚𝐧𝐞𝐨 𝐚𝐭𝐭𝐢𝐯𝐨.*'
)
}

const tempo=args.find(v=>/^\d+(m|h|g)$/i.test(v))

if(!tempo){
return m.reply('*❌ 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:* *.tempmod @utente 1h*')
}

const durata=parseDuration(tempo)

if(!durata){
return m.reply('*❌ 𝐅𝐨𝐫𝐦𝐚𝐭𝐨 𝐯𝐚𝐥𝐢𝐝𝐨:* *30m, 1h, 2g*')
}

user.moderator=true
user.moderatorGroup=m.chat

tempMods[who]={
expiresAt:Date.now()+durata,
by:m.sender
}

return conn.sendMessage(m.chat,{
text:`*𝐌𝐎𝐃𝐄𝐑𝐀𝐓𝐎𝐑𝐄 𝐓𝐄𝐌𝐏𝐎𝐑𝐀𝐍𝐄𝐎 𝐈𝐌𝐏𝐎𝐒𝐓𝐀𝐓𝐎 ✅️*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${who.split('@')[0]}
*⏳ 𝐃𝐮𝐫𝐚𝐭𝐚:* ${tempo}
*👮 𝐄𝐬𝐞𝐠𝐮𝐢𝐭𝐨 𝐝𝐚:* @${m.sender.split('@')[0]}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
mentions:[who,m.sender]
},{quoted:m})
}

if(command==='rtmod'){

const who=
m.mentionedJid?.[0]||
m.quoted?.sender||
''

if(!who){
return m.reply('*❌ 𝐓𝐚𝐠𝐠𝐚 𝐨 𝐪𝐮𝐨𝐭𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞*')
}

const tempMods=ensureTempMods(m.chat)

if(!tempMods[who]){
return m.reply('*❌ 𝐔𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐞 𝐧𝐞𝐢 𝐓𝐞𝐦𝐩𝐌𝐨𝐝*')
}

let user=global.db.data.users[who]

if(user){
user.moderator=false
delete user.moderatorGroup
}

delete tempMods[who]

return conn.sendMessage(m.chat,{
text:`*𝐌𝐎𝐃𝐄𝐑𝐀𝐓𝐎𝐑𝐄 𝐓𝐄𝐌𝐏𝐎𝐑𝐀𝐍𝐄𝐎 𝐑𝐈𝐌𝐎𝐒𝐒𝐎 ❌️*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${who.split('@')[0]}
*👮 𝐄𝐒𝐄𝐆𝐔𝐈𝐓𝐎 𝐃𝐀:* @${m.sender.split('@')[0]}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
mentions:[who,m.sender]
},{quoted:m})
}
}

handler.before=async function(m){

if(!m.isGroup)return false

const tempMods=
global.db.data.chats?.[m.chat]?.tempMods

if(!tempMods)return false

for(const jid of Object.keys(tempMods)){

const data=tempMods[jid]

if(Date.now()<data.expiresAt)continue

let user=global.db.data.users[jid]

if(user){
user.moderator=false
delete user.moderatorGroup
}

delete tempMods[jid]

await this.sendMessage(m.chat,{
text:`*⌛️ 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${jid.split('@')[0]}

*🔻 𝐈 𝐏𝐄𝐑𝐌𝐄𝐒𝐒𝐈 𝐃𝐈 𝐌𝐎𝐃𝐄𝐑𝐀𝐓𝐎𝐑𝐄 𝐒𝐎𝐍𝐎 𝐒𝐓𝐀𝐓𝐈 𝐑𝐈𝐌𝐎𝐒𝐒𝐈 𝐀𝐔𝐓𝐎𝐌𝐀𝐓𝐈𝐂𝐀𝐌𝐄𝐍𝐓𝐄.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
mentions:[jid]
})
}

return false
}

handler.help=['tempmod','tmod','rtmod']
handler.tags=['admin']
handler.command=/^(tempmod|tmod|rtmod)$/i
handler.admin=true
handler.group=true

export default handler