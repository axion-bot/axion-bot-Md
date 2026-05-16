// Plugin AntiVoip by Bonzino

import { axionSystem,axionFooter } from '../lib/axionsystem.js'

let handler=m=>m

handler.before=async function(m,{conn,isAdmin,isBotAdmin,isOwner}){
  if(!m.isGroup)return false

  const chat=global.db.data.chats[m.chat]
  if(!chat?.antivoip)return false
  if(!isBotAdmin)return false
  if(isAdmin||isOwner||m.fromMe)return false
  if(!m.sender)return false

  const decodedSender=decodeJid(conn,m.sender)
  const decodedBotJid=decodeJid(conn,conn.user?.jid||conn.user?.id||'')
  if(decodedSender===decodedBotJid)return false

  const senderNumber=getNumber(decodedSender)
  const domain=getDomain(decodedSender)

  if(domain==='lid')return false
  if(!senderNumber)return false

  if(!senderNumber.startsWith('39')){
    const utente=formatPhoneNumber(senderNumber,true)

    await axionSystem(conn,m.chat,{
      text:axionFooter(`*⚠️ ${utente}, 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐬𝐨𝐧𝐨 𝐚𝐦𝐦𝐞𝐬𝐬𝐢 𝐬𝐨𝐥𝐨 𝐧𝐮𝐦𝐞𝐫𝐢 𝐢𝐭𝐚𝐥𝐢𝐚𝐧𝐢.*

*✅️ 𝐔𝐭𝐞𝐧𝐭𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐦𝐞𝐧𝐭𝐞.*`),
      thumb:'antivoip',
      mentions:[decodedSender],
      quoted:m
    })

    await conn.groupParticipantsUpdate(m.chat,[m.sender],'remove')
  }

  return false
}

function decodeJid(conn,jid=''){
  return conn.decodeJid?conn.decodeJid(jid):String(jid||'')
}

function getNumber(jid=''){
  return String(jid||'').split('@')[0].split(':')[0].replace(/[^0-9]/g,'')
}

function getDomain(jid=''){
  return String(jid||'').split('@')[1]||''
}

function formatPhoneNumber(number,includeAt=false){
  if(!number||number==='?'||number==='sconosciuto')return includeAt?'@Sconosciuto':'Sconosciuto'
  if(String(number).startsWith('lid_'))return includeAt?'@[ID nascosto]':'[ID nascosto]'
  return includeAt?'@'+number:number
}

export default handler