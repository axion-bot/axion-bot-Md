// gp-topnerds by Bonzino

const MAX_DELTA_MS=5*60*1000
const RESET_MS=24*60*60*1000
const formatNumber=n=>new Intl.NumberFormat('it-IT').format(n||0)
function formatTempo(ms){
const min=Math.floor(ms/60000),h=Math.floor(min/60),m=min%60
if(h>0)return`${h}𝐡 ${m}𝐦`
return`${m}𝐦`
}
function ensureChat(chat){
const now=Date.now()
chat.topNerds??={startedAt:now,users:{}}
if(!chat.topNerds.startedAt||now-chat.topNerds.startedAt>=RESET_MS)chat.topNerds={startedAt:now,users:{}}
return chat.topNerds
}
function ensureUser(chat,jid){
const data=ensureChat(chat)
data.users[jid]??={messages:0,totalActiveMs:0,lastMsgAt:0}
return data.users[jid]
}
let handler=async(m,{conn})=>{
const chat=global.db.data.chats[m.chat]||(global.db.data.chats[m.chat]={})
const data=ensureChat(chat)
const top=Object.entries(data.users||{}).filter(([_,v])=>(v.totalActiveMs||0)>0).sort((a,b)=>(b[1].totalActiveMs||0)-(a[1].totalActiveMs||0)).slice(0,5)

if(!top.length)return m.reply('*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐝𝐚𝐭𝐨 𝐝𝐢 𝐚𝐭𝐭𝐢𝐯𝐢𝐭à 𝐭𝐫𝐨𝐯𝐚𝐭𝐨 𝐧𝐞𝐥𝐥𝐞 𝐮𝐥𝐭𝐢𝐦𝐞 𝟐𝟒 𝐨𝐫𝐞.*')

let mentions=top.map(([jid])=>jid)
let testo=`*🤓 𝐓𝐎𝐏 𝐍𝐄𝐑𝐃𝐒*

*👤 𝐓𝐨𝐩:* *${formatNumber(top.length)}*

`

top.forEach(([jid,v],i)=>{
testo+=`*${i+1}.* @${jid.split('@')[0]} — *${formatTempo(v.totalActiveMs||0)}*\n`
})
testo+=`\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
await conn.sendMessage(m.chat,{text:testo,mentions},{quoted:m})
}
handler.before=async function(m){
if(!m||!m.chat||!m.sender||!m.isGroup||m.fromMe||m.isBaileys)return
const chat=global.db.data.chats[m.chat]||(global.db.data.chats[m.chat]={})
const u=ensureUser(chat,m.sender)
const now=Date.now()
if(u.lastMsgAt){
const diff=now-u.lastMsgAt
if(diff>0&&diff<=MAX_DELTA_MS)u.totalActiveMs+=diff
}
u.lastMsgAt=now
u.messages=(u.messages||0)+1
}

handler.help=['topnerds']
handler.tags=['group']
handler.command=/^(topnerds)$/i
handler.group=true

export default handler