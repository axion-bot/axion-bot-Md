// infoutente by Bonzino
import{getDevice}from'@realvare/baileys'
import fetch from'node-fetch'
import fs from'fs'

const S=v=>String(v||''),bare=j=>S(j).split('@')[0].split(':')[0],cleanNumber=v=>String(v||'').replace(/[^0-9]/g,'')
const numberToJid=n=>{let num=cleanNumber(n);if(!num)return null;if(num.length===10&&num.startsWith('3'))num='39'+num;if(num.length<5)return null;return`${num}@s.whatsapp.net`}
function resolveTargetJid(m,text=''){
const ctx=m.message?.extendedTextMessage?.contextInfo||{},fromText=numberToJid(text)
if(fromText)return fromText
if(String(text||'').endsWith('@s.whatsapp.net'))return String(text).trim()
if(String(text||'').endsWith('@c.us'))return String(text).replace('@c.us','@s.whatsapp.net').trim()
if(Array.isArray(m.mentionedJid)&&m.mentionedJid.length)return m.mentionedJid[0]
if(Array.isArray(ctx.mentionedJid)&&ctx.mentionedJid.length)return ctx.mentionedJid[0]
if(m.quoted?.sender)return m.quoted.sender
if(m.quoted?.participant)return m.quoted.participant
if(ctx.participant)return ctx.participant
return m.sender||m.key?.participant||m.participant||null
}
const mapDeviceName=d=>({ios:'🍏 𝐢𝐎𝐒',android:'📱 𝐀𝐧𝐝𝐫𝐨𝐢𝐝',web:'💻 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐖𝐞𝐛',desktop:'🖥️ 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐃𝐞𝐬𝐤𝐭𝐨𝐩'}[String(d||'').toLowerCase()]||'❓ 𝐒𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨')
function getTargetDevice(m,target){
const qs=m.quoted?.sender||m.quoted?.participant,qi=m?.quoted?.id||m?.quoted?.key?.id
if(qs&&qi&&bare(qs)===bare(target))return mapDeviceName(getDevice(qi))
if(bare(m.sender)===bare(target))return mapDeviceName(getDevice(m.key?.id||''))
return'❓ 𝐍𝐨𝐧 𝐫𝐢𝐥𝐞𝐯𝐚𝐛𝐢𝐥𝐞'
}
const formatDate=ts=>(!ts||isNaN(ts))?'𝐍𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞':new Date(ts).toLocaleString('it-IT')
const isOwner=jid=>{try{let num=bare(jid);return Array.isArray(global.owner)&&global.owner.map(o=>Array.isArray(o)?o[0]:o).map(v=>bare(v)).includes(num)}catch{return false}}
const cleanJid=jid=>String(jid||'').replace(/[^0-9]/g,''),findUserKeyByJid=(users,jid)=>Object.keys(users||{}).find(k=>cleanJid(k)===cleanJid(jid))||jid
function getRole(target,participants=[],user={},chatId){
if(isOwner(target))return'👑 𝐃𝐢𝐨'
const p=participants.find(x=>bare(x.id||x.jid||'')===bare(target))
if(p?.admin==='superadmin')return'⚜️ 𝐅𝐨𝐧𝐝𝐚𝐭𝐨𝐫𝐞'
if(p?.admin==='admin')return'🛡️ 𝐀𝐝𝐦𝐢𝐧'
if(!!user.moderator&&user.moderatorGroup===chatId)return'👮 𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐞'
return'👤 𝐌𝐞𝐦𝐛𝐫𝐨'
}

let handler=async(m,{conn,text})=>{
const target=resolveTargetJid(m,text);if(!target)return
global.db.data.users??={}
const users=global.db.data.users,realKey=findUserKeyByJid(users,target),user=users[realKey]||{},chat=global.db.data.chats?.[m.chat]||{},today=new Date().toLocaleDateString('it-IT',{timeZone:'Europe/Rome'})
const todayMessages=user.todayMessagesDate===today?user.todayMessages||0:0,todayGroupMessages=chat?.classificaGiornaliera?.utenti?.[target]?.conteggio||0,globalMessages=user.messages||0,groupMessages=chat?.classificaTotale?.utenti?.[target]?.conteggio||0
const fmt=n=>new Intl.NumberFormat('it-IT').format(n||0)
const commandCount=user.commandCount||0,lastMessage=user.lastMessage?formatDate(user.lastMessage):'𝐍𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞',nome=await conn.getName(target),jid=target,denaro=user.euro||0,warn=global.getGroupWarn?global.getGroupWarn(target,m.chat):0,muted=!!user.muto,device=getTargetDevice(m,target)
const groupUser=chat?.users?.[target]||{},joinedLabel=groupUser.joinedAt?'𝐄𝐧𝐭𝐫𝐚𝐭𝐚':groupUser.firstMsgAt?'𝐏𝐫𝐢𝐦𝐚 𝐀𝐭𝐭𝐢𝐯𝐢𝐭à':'𝐄𝐧𝐭𝐫𝐚𝐭𝐚',joinedAt=groupUser.joinedAt?formatDate(groupUser.joinedAt):groupUser.firstMsgAt?formatDate(groupUser.firstMsgAt):'𝐍𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞'
let meta;try{meta=await conn.groupMetadata(m.chat)}catch{}
const participants=Array.isArray(meta?.participants)?meta.participants:[],ruolo=getRole(target,participants,user,m.chat)
let profilo;try{profilo=await conn.profilePictureUrl(target,'image')}catch{profilo=fs.readFileSync('./media/default-avatar.png')}
let thumbnailBuffer;try{thumbnailBuffer=typeof profilo==='string'?Buffer.from(await(await fetch(profilo)).arrayBuffer()):profilo}catch{thumbnailBuffer=fs.readFileSync('./media/default-avatar.png')}
const textMsg=`
*👤 𝐍𝐨𝐦𝐞:* ${nome}
*🆔 𝐉𝐈𝐃:* ${jid}
*🛠 𝐑𝐮𝐨𝐥𝐨:* ${ruolo}
*📱 𝐃𝐞𝐯𝐢𝐜𝐞:* ${device}

*📊 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐇𝐄*

*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐎𝐠𝐠𝐢:* ${fmt(todayMessages)}
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐎𝐠𝐠𝐢 𝐆𝐫𝐮𝐩𝐩𝐨:* ${fmt(todayGroupMessages)}
*🌐 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐓𝐨𝐭𝐚𝐥𝐢:* ${fmt(globalMessages)}
*🌐 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐓𝐨𝐭𝐚𝐥𝐢 𝐆𝐫𝐮𝐩𝐩𝐨:* ${fmt(groupMessages)}

*🕒 𝐔𝐥𝐭𝐢𝐦𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨:* ${lastMessage}
*💸 𝐃𝐞𝐧𝐚𝐫𝐨:* ${fmt(denaro)}€
*🕹 𝐂𝐨𝐦𝐚𝐧𝐝𝐢 𝐔𝐬𝐚𝐭𝐢:* ${fmt(commandCount)}
*📅 ${joinedLabel}:* ${joinedAt}
*⚠️ 𝐖𝐚𝐫𝐧 𝐆𝐫𝐮𝐩𝐩𝐨:* ${warn}/3
*🔇 𝐌𝐮𝐭𝐚𝐭𝐨:* ${muted?'𝐒𝐢':'𝐍𝐨'}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
await conn.sendMessage(m.chat,{text:textMsg,mentions:[target],contextInfo:{...(global.rcanal?.contextInfo||{}),mentionedJid:[target],externalAdReply:{title:nome,thumbnail:thumbnailBuffer,mediaType:1,renderLargerThumbnail:false,showAdAttribution:false}}},{quoted:m})
}
handler.help=['infoutente','userinfo','whoami','info']
handler.tags=['info']
handler.command=/^(infoutente|userinfo|whoami|info)$/i
handler.admin=true
export default handler