// warn-unwarn by Bonzino

import { getThumbBuffer } from '../lib/thumb.js'
import { createFakeContact } from '../lib/fakecontact.js'

let handler=async(m,{conn,command,text,usedPrefix})=>{
  const chatId=m.chat
  const botNumber=conn.user.jid
  const cleanJid=jid=>String(jid||'').replace(/[^0-9]/g,'')
  const box=body=>`${body}

> *𝛥𝐗𝐈𝐎𝐍 𝚩𝚯𝐓*`

  const thumb=await getThumbBuffer('warn')
  const fakeContact=await createFakeContact(m,conn)
  const contextInfo={externalAdReply:{title:'ㅤㅤㅤ𝚫𝐗𝐈𝐎𝐍 • 𝐒𝐘𝐒𝐓𝐄𝐌',thumbnail:thumb,mediaType:1,renderLargerThumbnail:false,showAdAttribution:false}}

  const warnButtons=jid=>[
    {buttonId:`${usedPrefix}listawarn`,buttonText:{displayText:'📋 Lista Warn'},type:1},
    {buttonId:`${usedPrefix}unwarn ${cleanJid(jid)}`,buttonText:{displayText:'✅ Rimuovi 1 Warn'},type:1},
    {buttonId:`${usedPrefix}unwarnall ${cleanJid(jid)}`,buttonText:{displayText:'🧹 Azzera Warn'},type:1}
  ]

  const unwarnButtons=jid=>[
    {buttonId:`${usedPrefix}listawarn`,buttonText:{displayText:'📋 Lista Warn'},type:1},
    {buttonId:`${usedPrefix}warn ${cleanJid(jid)}`,buttonText:{displayText:'⚠️ Aggiungi Warn'},type:1}
  ]

  const protectedOwners=(global.owner||[]).map(v=>{
    const number=Array.isArray(v)?v[0]:v
    return String(number).replace(/[^0-9]/g,'')+'@s.whatsapp.net'
  })

  let mentionedJid=m.mentionedJid?.[0]
  let reason=''

  if(!mentionedJid&&m.quoted?.sender&&cleanJid(m.quoted.sender)!==cleanJid(botNumber))mentionedJid=m.quoted.sender

  if(text){
    const parts=text.trim().split(/\s+/)
    const firstArg=parts[0]
    const number=firstArg?.replace(/[^0-9]/g,'')
    if(firstArg?.endsWith('@s.whatsapp.net')||firstArg?.endsWith('@c.us')){
      mentionedJid=firstArg
      reason=parts.slice(1).join(' ')
    }else if(number&&number.length>=8&&number.length<=15){
      mentionedJid=number+'@s.whatsapp.net'
      reason=parts.slice(1).join(' ')
    }else if(mentionedJid){
      reason=text.replace(/@\d+/g,'').replace(/[^a-zA-Z0-9À-ÿ\s]/g,' ').trim()
    }
  }

  if(!mentionedJid){
    return conn.reply(chatId,box(`*⚠️ 𝐔𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.*

*📌 𝐄𝐬𝐞𝐦𝐩𝐢:*
*${usedPrefix}${command} @utente spam*
*${usedPrefix}${command} 393123456789 spam*`),m)
  }

  const groupMetadata=await conn.groupMetadata(chatId)
  const participants=groupMetadata.participants||[]
  const targetNumber=cleanJid(mentionedJid)
  const targetParticipant=participants.find(p=>cleanJid(p.id||p.jid||p.lid)===targetNumber)
  const displayJid=targetParticipant?.jid||targetParticipant?.id||mentionedJid
  const targetIsAdmin=!!targetParticipant?.admin

  const protectedReason=cleanJid(mentionedJid)===cleanJid(botNumber)
    ?'🤖 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐰𝐚𝐫𝐧𝐚𝐫𝐞 𝐢𝐥 𝐛𝐨𝐭.'
    :protectedOwners.some(owner=>cleanJid(owner)===cleanJid(mentionedJid))
      ?'👑 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐰𝐚𝐫𝐧𝐚𝐫𝐞 𝐃𝐢𝐨.'
      :targetIsAdmin
        ?'🛡 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐰𝐚𝐫𝐧𝐚𝐫𝐞 𝐮𝐧 𝐚𝐝𝐦𝐢𝐧.'
        :null

  if(protectedReason)return conn.reply(chatId,box(`*${protectedReason}*`),m)

  const tag='@'+cleanJid(displayJid)
  const reasonText=reason?.trim()?reason.trim():'𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐨𝐭𝐢𝐯𝐨 𝐬𝐩𝐞𝐜𝐢𝐟𝐢𝐜𝐚𝐭𝐨'

  if(command==='warn'){
    const data=global.addGroupWarn(displayJid,chatId,reasonText,m.sender)
    const warn=data.warn

    if(warn>=3){
      global.resetGroupWarn(displayJid,chatId)
      await conn.groupParticipantsUpdate(chatId,[displayJid],'remove')
      return conn.sendMessage(chatId,{
        text:box(`*🚨 𝐔𝐭𝐞𝐧𝐭𝐞 𝐞𝐬𝐩𝐮𝐥𝐬𝐨*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}
*❓ 𝐌𝐨𝐭𝐢𝐯𝐨:* *${reasonText}*
*📊 𝐖𝐚𝐫𝐧:* *𝟑/𝟑*

*🚫 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐬𝐭𝐚𝐭𝐨 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*`),
        mentions:[displayJid],
        buttons:[{buttonId:`${usedPrefix}listawarn`,buttonText:{displayText:'📋 Lista Warn'},type:1}],
        headerType:1,
        contextInfo
      },{quoted:fakeContact})
    }

    return conn.sendMessage(chatId,{
      text:box(`*⚠️ 𝐖𝐀𝐑𝐍*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}
*❓ 𝐌𝐨𝐭𝐢𝐯𝐨:* *${reasonText}*
*📊 𝐒𝐭𝐚𝐭𝐨:* *${warn}/𝟑 𝐰𝐚𝐫𝐧*

*⚠️ 𝐀𝐥 𝐭𝐞𝐫𝐳𝐨 𝐰𝐚𝐫𝐧 𝐥’𝐮𝐭𝐞𝐧𝐭𝐞 𝐯𝐞𝐫𝐫à 𝐫𝐢𝐦𝐨𝐬𝐬𝐨.*`),
      mentions:[displayJid],
      buttons:warnButtons(displayJid),
      headerType:1,
      contextInfo
    },{quoted:fakeContact})
  }

  if(command==='unwarn'){
    const current=global.getGroupWarn(displayJid,chatId)
    if(current<=0)return conn.reply(chatId,box(`*⚠️ 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐡𝐚 𝐰𝐚𝐫𝐧 𝐝𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞.*`),m)

    const data=global.removeGroupWarn(displayJid,chatId)
    return conn.sendMessage(chatId,{
      text:box(`*✅ 𝐖𝐀𝐑𝐍 𝐑𝐈𝐌𝐎𝐒𝐒𝐎*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}
*📊 𝐒𝐭𝐚𝐭𝐨:* *${data.warn}/𝟑 𝐰𝐚𝐫𝐧*`),
      mentions:[displayJid],
      buttons:unwarnButtons(displayJid),
      headerType:1,
      contextInfo
    },{quoted:fakeContact})
  }
}

handler.command=/^(warn|unwarn)$/i
handler.group=true
handler.botAdmin=true
handler.admin=true

export default handler