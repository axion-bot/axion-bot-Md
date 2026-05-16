// AntiSpam by Bonzino

import { axionSystem,axionFooter } from '../lib/axionsystem.js'

const spamCache=new Map()

function getMessageText(m){
  return (m.text||
  m.message?.conversation||
  m.message?.extendedTextMessage?.text||
  m.message?.imageMessage?.caption||
  m.message?.videoMessage?.caption||
  m.message?.documentMessage?.caption||
  '').trim()
}

function isViewOnceMessage(msg={}){
  return !!(msg.viewOnceMessage||msg.viewOnceMessageV2||msg.viewOnceMessageV2Extension)
}

function getSpamKey(chat,sender){return `${chat}:${sender}`}

function getSpamState(chat,sender){
  const key=getSpamKey(chat,sender)
  if(!spamCache.has(key))spamCache.set(key,{timestamps:[],lastText:'',repeated:0})
  return spamCache.get(key)
}

function pruneOld(timestamps,windowMs){
  const now=Date.now()
  return timestamps.filter(ts=>now-ts<=windowMs)
}

export async function before(m,{conn,isAdmin,isBotAdmin,isOwner,isROwner}){
  if(!m.isGroup)return false
  if(m.fromMe||m.isBaileys)return true

  const chat=global.db.data.chats[m.chat]||(global.db.data.chats[m.chat]={})
  if(!chat.antispam)return false
  if(isAdmin||isOwner||isROwner)return false

  const msg=m.message||{}
  if(isViewOnceMessage(msg))return false

  const text=getMessageText(m)
  const hasMedia=!!msg.imageMessage||!!msg.videoMessage||!!msg.audioMessage||!!msg.documentMessage||!!msg.stickerMessage
  const state=getSpamState(m.chat,m.sender)
  const now=Date.now()

  state.timestamps.push(now)
  state.timestamps=pruneOld(state.timestamps,8000)

  if(text&&text===state.lastText)state.repeated+=1
  else{
    state.lastText=text
    state.repeated=1
  }

  const floodSpam=state.timestamps.length>=6
  const repeatSpam=!!text&&state.repeated>=4
  const mediaFlood=hasMedia&&state.timestamps.length>=4
  if(!(floodSpam||repeatSpam||mediaFlood))return false

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

  const reason='spam'
  const data=global.addGroupWarn(m.sender,m.chat,reason,'system')
  const warn=data.warn
  const maxWarn=3
  const mention=`@${global.cleanWarnNumber?global.cleanWarnNumber(m.sender):m.sender.split('@')[0]}`

  if(warn>=maxWarn){
    global.resetGroupWarn(m.sender,m.chat)

    try{
      await conn.groupParticipantsUpdate(m.chat,[m.sender],'remove')
    }catch{}

    await axionSystem(conn,m.chat,{
      text:axionFooter(`*❌ 𝐒𝐩𝐚𝐦 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨*

${mention}

*⚠️ 𝐇𝐚𝐢 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝟑/𝟑 𝐰𝐚𝐫𝐧*

*🚫 𝐔𝐭𝐞𝐧𝐭𝐞 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`),
      thumb:'antispam',
      mentions:[m.sender],
      quoted:m
    })

    spamCache.delete(getSpamKey(m.chat,m.sender))
    return true
  }

  await axionSystem(conn,m.chat,{
    text:axionFooter(`*❌ 𝐒𝐩𝐚𝐦 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨*

${mention}

*⚠️ 𝐖𝐚𝐫𝐧:* ${warn}/${maxWarn}

*🚫 𝐀𝐥 𝐭𝐞𝐫𝐳𝐨 𝐰𝐚𝐫𝐧 𝐬𝐚𝐫𝐚𝐢 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*`),
    thumb:'antispam',
    mentions:[m.sender],
    quoted:m
  })

  return true
}