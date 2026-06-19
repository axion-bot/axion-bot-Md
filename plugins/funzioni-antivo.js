// antiviewonce by Bonzino

import { axionSystem, axionFooter } from '../lib/axionsystem.js'

const truthy=v=>v===true||v==='1'||v===1||v==='true'

let HOOKED=false

function unwrap(n){
return(
n?.message||
n?.viewOnceMessage?.message||
n?.viewOnceMessageV2?.message||
n?.viewOnceMessageV2Extension?.message||
n
)
}

function deepFindMedia(n){
if(!n||typeof n!=='object')return{kind:null,content:null}

const base=unwrap(n)

const pick=k=>base?.[k]
?{kind:k,content:base[k]}
:null

return pick('imageMessage')||
pick('videoMessage')||
{kind:null,content:null}
}

function isVO(msg){
const raw=msg?.message||msg?.msg||{}

const wrapped=!!(
raw.viewOnceMessage||
raw.viewOnceMessageV2||
raw.viewOnceMessageV2Extension
)

const {content}=deepFindMedia(raw)

const byContent=
truthy(content?.viewOnce)||
truthy(content?.contextInfo?.viewOnce)||
truthy(content?.contextInfo?.isViewOnce)

const byRaw=
truthy(raw?.viewOnce)||
truthy(raw?.messageContextInfo?.viewOnce)

return wrapped||byContent||byRaw
}

function ensureHook(conn){
if(HOOKED)return

console.log('[ANTIVO] HOOK CARICATO')

conn.ev.on('messages.upsert',async({messages=[]})=>{

console.log('[ANTIVO] UPSERT',messages.length)

for(const msg of messages){

const type=Object.keys(msg?.message||{})[0]||'unknown'

console.log('[ANTIVO] TYPE=',type)

if(
type==='imageMessage'||
type==='videoMessage'||
type==='viewOnceMessage'||
type==='viewOnceMessageV2'||
type==='viewOnceMessageV2Extension'
){
console.log('[ANTIVO RAW]')
console.dir(msg,{depth:10})
}

if(!isVO(msg))continue

console.log('[ANTIVO] VIEWONCE RILEVATO')

const chatId=msg?.key?.remoteJid
if(!chatId?.endsWith('@g.us'))continue

const chat=global.db.data.chats[chatId]||(global.db.data.chats[chatId]={})

console.log('[ANTIVO] CHAT=',chatId)
console.log('[ANTIVO] ENABLED=',chat.antiviewonce)

if(!chat.antiviewonce)continue

const sender=
msg?.key?.participant||
msg?.participant||
'utente'

try{
console.log('[ANTIVO] DELETE')

await conn.sendMessage(chatId,{
delete:msg.key
})

}catch(e){
console.log('[ANTIVO DELETE ERROR]')
console.error(e)
}

try{

await axionSystem(conn,chatId,{
text:axionFooter(`*❌ 𝐕𝐢𝐞𝐰 𝐎𝐧𝐜𝐞 𝐧𝐨𝐧 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨*

*@${sender.split('@')[0]}*

*📸 𝐈𝐧𝐯𝐢𝐚 𝐢𝐥 𝐦𝐞𝐝𝐢𝐚 𝐢𝐧 𝐦𝐨𝐝𝐚𝐥𝐢𝐭𝐚̀ 𝐧𝐨𝐫𝐦𝐚𝐥𝐞*`),
thumb:'antiviewonce',
mentions:[sender]
})

console.log('[ANTIVO] AVVISO INVIATO')

}catch(e){
console.log('[ANTIVO MESSAGE ERROR]')
console.error(e)
}

}
})

conn.ev.on('messages.update',async(updates=[])=>{

console.log('[ANTIVO] UPDATE',updates.length)

for(const u of updates){

const full=u?.update?.message
if(!full)continue

const packed={
key:u.key,
message:full
}

if(!isVO(packed))continue

console.log('[ANTIVO] VIEWONCE UPDATE')

const chatId=u?.key?.remoteJid
if(!chatId?.endsWith('@g.us'))continue

const chat=global.db.data.chats[chatId]||(global.db.data.chats[chatId]={})

if(!chat.antiviewonce)continue

try{
await conn.sendMessage(chatId,{
delete:u.key
})
}catch(e){
console.error(e)
}

}
})

HOOKED=true
}

const handler=async(m,{conn})=>{
ensureHook(conn)
return false
}

handler.all=true

export default handler