// AntiWhatsApp by Bonzino

import { axionSystem,axionFooter } from '../lib/axionsystem.js'

const whatsappRegex=/(?:chat\.whatsapp\.com\/[0-9A-Za-z]{20,}|whatsapp\.com\/channel\/[0-9A-Za-z]+|wa\.me\/\d+|api\.whatsapp\.com\/send\?phone=\d+|whatsapp:\/\/send\?phone=\d+)/i

function getMessageText(m){
  return m.text||
  m.message?.conversation||
  m.message?.extendedTextMessage?.text||
  m.message?.imageMessage?.caption||
  m.message?.videoMessage?.caption||
  m.message?.documentMessage?.caption||
  ''
}

export async function before(m,{isAdmin,isModerator,isBotAdmin,conn}){
  if(m.isBaileys||m.fromMe)return true
  if(!m.isGroup)return false

  const chat=global.db.data.chats[m.chat]
  if(!chat?.antiWhatsapp)return false
  if(isAdmin||isModerator)return false

  const text=getMessageText(m)
  if(!text||!whatsappRegex.test(text))return false

  const reason='whatsapp'
  const data=global.addGroupWarn(m.sender,m.chat,reason,'system')
  const warnLimit=3
  const warnCount=data.warn
  const mention=`@${global.cleanWarnNumber?global.cleanWarnNumber(m.sender):m.sender.split('@')[0]}`

  if(isBotAdmin){
    try{
      await conn.sendMessage(m.chat,{
        delete:{
          remoteJid:m.chat,
          fromMe:false,
          id:m.key.id,
          participant:m.key.participant||m.sender
        }
      })
    }catch{}
  }

  if(warnCount<warnLimit){
    await axionSystem(conn,m.chat,{
      text:axionFooter(`*❌ 𝐋𝐢𝐧𝐤 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨*

${mention}

*⚠️ 𝐖𝐚𝐫𝐧:* ${warnCount}/${warnLimit}

*🚫 𝐀𝐥 𝐭𝐞𝐫𝐳𝐨 𝐰𝐚𝐫𝐧 𝐬𝐚𝐫𝐚𝐢 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`),
      thumb:'antiwhatsapp',
      mentions:[m.sender],
      quoted:m
    })
    return true
  }

  global.resetGroupWarn(m.sender,m.chat)

  if(isBotAdmin){
    try{
      await conn.groupParticipantsUpdate(m.chat,[m.sender],'remove')
    }catch{}
  }

  await axionSystem(conn,m.chat,{
    text:axionFooter(isBotAdmin?`*⛔️ 𝐋𝐢𝐦𝐢𝐭𝐞 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨*

${mention}

*📊 𝐖𝐚𝐫𝐧:* 3/3

*🚫 𝐔𝐭𝐞𝐧𝐭𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`:`*⛔️ 𝐋𝐢𝐦𝐢𝐭𝐞 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨*

${mention}

*📊 𝐖𝐚𝐫𝐧:* 3/3

*⚠️ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐥’𝐮𝐭𝐞𝐧𝐭𝐞 𝐩𝐞𝐫𝐜𝐡𝐞́ 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐚𝐝𝐦𝐢𝐧*`),
    thumb:'antiwhatsapp',
    mentions:[m.sender],
    quoted:m
  })

  return true
}