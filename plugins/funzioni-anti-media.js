// antimedia by Bonzino

import { axionSystem,axionFooter } from '../lib/axionsystem.js'

let handler=m=>m

handler.before=async(m,{conn,isAdmin,isBotAdmin,isOwner,isROwner})=>{
  if(!m.isGroup)return false
  if(m.fromMe)return false
  if(isAdmin||isOwner||isROwner)return false

  const chat=global.db.data.chats[m.chat]||(global.db.data.chats[m.chat]={})
  if(!chat.antimedia)return false

  const msg=m.message||{}
  const viewOnceContainer=msg.viewOnceMessage||msg.viewOnceMessageV2||msg.viewOnceMessageV2Extension||null
  const innerMessage=viewOnceContainer?.message||msg
  const type=Object.keys(innerMessage||{})[0]||''
  const isViewOnce=!!viewOnceContainer
  const isBlockedMedia=['imageMessage','videoMessage'].includes(type)&&!isViewOnce
  if(!isBlockedMedia)return false

  try{
    await conn.sendMessage(m.chat,{delete:m.key})
  }catch{}

  const reason='media normale non consentito'
  const data=global.addGroupWarn(m.sender,m.chat,reason,'system')
  const warn=data.warn
  const maxWarn=3
  const mention=`@${global.cleanWarnNumber?global.cleanWarnNumber(m.sender):m.sender.split('@')[0]}`

  if(warn>=maxWarn){
    global.resetGroupWarn(m.sender,m.chat)

    if(isBotAdmin){
      try{
        await conn.groupParticipantsUpdate(m.chat,[m.sender],'remove')
      }catch{}

      await axionSystem(conn,m.chat,{
        text:axionFooter(`*❌ 𝐌𝐞𝐝𝐢𝐚 𝐧𝐨𝐫𝐦𝐚𝐥𝐞 𝐧𝐨𝐧 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨*

${mention}

*⚠️ 𝐇𝐚𝐢 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝟑/𝟑 𝐰𝐚𝐫𝐧*

*🚫 𝐔𝐭𝐞𝐧𝐭𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`),
        thumb:'antimedia',
        mentions:[m.sender],
        quoted:m
      })
    }else{
      await axionSystem(conn,m.chat,{
        text:axionFooter(`*❌ 𝐌𝐞𝐝𝐢𝐚 𝐧𝐨𝐫𝐦𝐚𝐥𝐞 𝐧𝐨𝐧 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨*

${mention}

*⚠️ 𝐇𝐚𝐢 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝟑/𝟑 𝐰𝐚𝐫𝐧*

*⛔️ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐭𝐢 𝐩𝐞𝐫𝐜𝐡𝐞́ 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐚𝐝𝐦𝐢𝐧*`),
        thumb:'antimedia',
        mentions:[m.sender],
        quoted:m
      })
    }
    return true
  }

  await axionSystem(conn,m.chat,{
    text:axionFooter(`*❌ 𝐌𝐞𝐝𝐢𝐚 𝐧𝐨𝐫𝐦𝐚𝐥𝐞 𝐧𝐨𝐧 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨*

${mention}

*⚠️ 𝐖𝐚𝐫𝐧:* ${warn}/${maxWarn}

*‼️ 𝐀𝐥 𝐭𝐞𝐫𝐳𝐨 𝐰𝐚𝐫𝐧 𝐬𝐚𝐫𝐚𝐢 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`),
    thumb:'antimedia',
    mentions:[m.sender],
    quoted:m
  })

  return true
}

export default handler