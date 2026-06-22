// antiviewonce by Bonzino

import { axionSystem, axionFooter } from '../lib/axionsystem.js'

let HOOKED=false
const SEEN=new Set()

const isViewOnce=m=>!!(m?.key?.isViewOnce||m?.isViewOnce||m?.message?.viewOnceMessage||m?.message?.viewOnceMessageV2||m?.message?.viewOnceMessageV2Extension)

function ensureHook(conn){
if(HOOKED)return
HOOKED=true

conn.ev.on('messages.upsert',async({messages=[]})=>{
for(const msg of messages){
if(!isViewOnce(msg))continue

const sender=msg?.key?.participant||msg?.participant
const chatId=msg?.key?.remoteJid
if(!sender||!chatId?.endsWith('@g.us'))continue

const timestamp=Math.floor(Number(msg?.messageTimestamp||0))
const dedupKey=`${sender}_${timestamp}`

if(SEEN.has(dedupKey))continue
SEEN.add(dedupKey)
if(SEEN.size>5000)SEEN.clear()

global.db.data.chats ||= {}
global.db.data.chats[chatId] ||= {}

const chat=global.db.data.chats[chatId]
if(!chat.antiviewonce)continue

const warns=global.addGroupWarn(sender,chatId,'antiviewonce','system').warn
const mention=sender.split('@')[0]

try{await conn.sendMessage(chatId,{delete:msg.key})}catch{}

if(warns<3){
try{
await axionSystem(conn,chatId,{
text:axionFooter(`*❌ 𝐕𝐢𝐞𝐰 𝐎𝐧𝐜𝐞 𝐍𝐨𝐧 𝐂𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨*\n\n*@${mention}*\n\n*⚠️ 𝐖𝐚𝐫𝐧:* *${warns}/3*\n\n*📸 𝐈𝐧𝐯𝐢𝐚 𝐢𝐥 𝐦𝐞𝐝𝐢𝐚 𝐢𝐧 𝐦𝐨𝐝𝐚𝐥𝐢𝐭𝐚̀ 𝐧𝐨𝐫𝐦𝐚𝐥𝐞*`),
thumb:'antiviewonce',
mentions:[sender]
})
}catch{}
continue
}

global.resetGroupWarn(sender,chatId)

try{
await axionSystem(conn,chatId,{
text:axionFooter(`*🚫 𝐔𝐭𝐞𝐧𝐭𝐞 𝐄𝐬𝐩𝐮𝐥𝐬𝐨*\n\n*@${mention}*\n\n*⚠️ 𝐑𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐢 𝟑 𝐖𝐚𝐫𝐧 𝐀𝐧𝐭𝐢𝐕𝐢𝐞𝐰𝐎𝐧𝐜𝐞*`),
thumb:'antiviewonce',
mentions:[sender]
})
}catch{}

try{
await conn.groupParticipantsUpdate(chatId,[sender],'remove')
}catch{}
}
})
}

let handler=m=>m

handler.before=async function(m,{conn}){
ensureHook(conn)
return false
}

handler.group=true
handler.botAdmin=true

export default handler