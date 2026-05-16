// infoutente by Bonzino

import { getDevice } from '@realvare/baileys'
import fetch from 'node-fetch'
import fs from 'fs'

const S=v=>String(v||'')
function bare(j=''){return S(j).split('@')[0].split(':')[0]}
function cleanNumber(value=''){return String(value||'').replace(/[^0-9]/g,'')}
function numberToJid(number=''){
  let num=cleanNumber(number)
  if(!num)return null
  if(num.length===10&&num.startsWith('3'))num='39'+num
  if(num.length<5)return null
  return `${num}@s.whatsapp.net`
}
function resolveTargetJid(m,text=''){
  const ctx=m.message?.extendedTextMessage?.contextInfo||{}
  const fromText=numberToJid(text)
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
function getTargetDevice(m,target){
  const quotedSender=m.quoted?.sender||m.quoted?.participant
  const quotedId=m?.quoted?.id||m?.quoted?.key?.id
  if(quotedSender&&quotedId&&bare(quotedSender)===bare(target))return mapDeviceName(getDevice(quotedId))
  if(bare(m.sender)===bare(target))return mapDeviceName(getDevice(m.key?.id||''))
  return '❓ 𝐍𝐨𝐧 𝐫𝐢𝐥𝐞𝐯𝐚𝐛𝐢𝐥𝐞'
}
function mapDeviceName(device){
  switch(String(device||'').toLowerCase()){
    case'ios':return'🍏 𝐢𝐎𝐒'
    case'android':return'📱 𝐀𝐧𝐝𝐫𝐨𝐢𝐝'
    case'web':return'💻 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐖𝐞𝐛'
    case'desktop':return'🖥️ 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐃𝐞𝐬𝐤𝐭𝐨𝐩'
    default:return'❓ 𝐒𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨'
  }
}
function formatDate(ts){
  if(!ts||isNaN(ts))return'𝐍𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞'
  return new Date(ts).toLocaleString('it-IT')
}
function isOwner(jid){
  try{
    const num=bare(jid)
    if(!Array.isArray(global.owner))return false
    return global.owner.map(o=>Array.isArray(o)?o[0]:o).map(v=>bare(v)).includes(num)
  }catch{return false}
}
function cleanJid(jid=''){return String(jid||'').replace(/[^0-9]/g,'')}
function findUserKeyByJid(users,jid){
  const num=cleanJid(jid)
  return Object.keys(users||{}).find(key=>cleanJid(key)===num)||jid
}
function getRole(target,participants=[],user={},chatId){
  if(isOwner(target))return'👑 𝐃𝐢𝐨'
  const targetBare=bare(target)
  const p=participants.find(x=>bare(x.id||x.jid||'')===targetBare)
  if(p?.admin==='superadmin')return'⚜️ 𝐅𝐨𝐧𝐝𝐚𝐭𝐨𝐫𝐞'
  if(p?.admin==='admin')return'🛡️ 𝐀𝐝𝐦𝐢𝐧'
  const isModerator=!!user.moderator&&user.moderatorGroup===chatId
  if(isModerator)return'👮 𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐞'
  return'👤 𝐌𝐞𝐦𝐛𝐫𝐨'
}

let handler=async(m,{conn,text})=>{
  const target=resolveTargetJid(m,text)
  if(!target)return

  global.db.data.users??={}
  const users=global.db.data.users
  const realKey=findUserKeyByJid(users,target)
  const user=users[realKey]||{}
  const chat=global.db.data.chats?.[m.chat]||{}

  const commandCount=user.commandCount||0
  const lastMessage=user.lastMessage?formatDate(user.lastMessage):'𝐍𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞'
  const oggiCount=chat?.classificaGiornaliera?.utenti?.[target]?.conteggio||0
  const totalMessages=user.messages||0
  const nome=await conn.getName(target)
  const jid=target
  const denaro=user.euro||0
  const warn=global.getGroupWarn?global.getGroupWarn(target,m.chat):0
  const muted=!!user.muto
  const device=getTargetDevice(m,target)

  const groupUser=chat?.users?.[target]||{}
  const joinedLabel=groupUser.joinedAt?'𝐄𝐧𝐭𝐫𝐚𝐭𝐚':groupUser.firstMsgAt?'𝐏𝐫𝐢𝐦𝐚 𝐀𝐭𝐭𝐢𝐯𝐢𝐭à':'𝐄𝐧𝐭𝐫𝐚𝐭𝐚'
  const joinedAt=groupUser.joinedAt?formatDate(groupUser.joinedAt):groupUser.firstMsgAt?formatDate(groupUser.firstMsgAt):'𝐍𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞'

  let meta
  try{meta=await conn.groupMetadata(m.chat)}catch{}
  const participants=Array.isArray(meta?.participants)?meta.participants:[]
  const ruolo=getRole(target,participants,user,m.chat)

  let profilo
  try{profilo=await conn.profilePictureUrl(target,'image')}
  catch{profilo=fs.readFileSync('./media/default-avatar.png')}

  let thumbnailBuffer
  try{
    thumbnailBuffer=typeof profilo==='string'
      ? Buffer.from(await(await fetch(profilo)).arrayBuffer())
      : profilo
  }catch{
    thumbnailBuffer=fs.readFileSync('./media/default-avatar.png')
  }

  const textMsg=`╭━━━━━━━📌━━━━━━━╮
✦ 𝐈𝐍𝐅𝐎 𝐔𝐓𝐄𝐍𝐓𝐄 ✦
╰━━━━━━━📌━━━━━━━╯

*👤 𝐍𝐨𝐦𝐞:* ${nome}
*🆔 𝐉𝐈𝐃:* ${jid}
*🛠 𝐑𝐮𝐨𝐥𝐨:* ${ruolo}
*📱 𝐃𝐞𝐯𝐢𝐜𝐞:* ${device}
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢:* ${totalMessages} *(𝐨𝐠𝐠𝐢: ${oggiCount})*
*🕒 𝐔𝐥𝐭𝐢𝐦𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨:* ${lastMessage}
*💸 𝐃𝐞𝐧𝐚𝐫𝐨:* ${denaro}
*🕹 𝐂𝐨𝐦𝐚𝐧𝐝𝐢 𝐮𝐬𝐚𝐭𝐢:* ${commandCount}
*📅 ${joinedLabel}:* ${joinedAt}
*⚠️ 𝐖𝐚𝐫𝐧 𝐠𝐫𝐮𝐩𝐩𝐨:* ${warn}/3
*🔇 𝐌𝐮𝐭𝐚𝐭𝐨:* ${muted?'𝐒𝐢':'𝐍𝐨'}

> 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`

  await conn.sendMessage(m.chat,{
    text:textMsg,
    mentions:[target],
    contextInfo:{
      ...(global.rcanal?.contextInfo||{}),
      mentionedJid:[target],
      externalAdReply:{
        title:nome,
        thumbnail:thumbnailBuffer,
        mediaType:1,
        renderLargerThumbnail:false,
        showAdAttribution:false
      }
    }
  },{quoted:m})
}

handler.help=['infoutente','userinfo','whoami','info']
handler.tags=['info']
handler.command=/^(infoutente|userinfo|whoami|info)$/i
handler.admin=true

export default handler