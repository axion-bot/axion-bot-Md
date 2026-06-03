// Anti-Gore by Bonzino

import { downloadContentFromMessage } from '@realvare/baileys'
import crypto from 'crypto'
import fetch from 'node-fetch'
import { axionSystem,axionFooter } from '../lib/axionsystem.js'

const OPENAI_MODERATION_MODEL='omni-moderation-latest'

let handler=m=>m

handler.before=async function(m,{conn,isAdmin,isOwner,isBotAdmin,isROwner}){
  if(m.isBaileys&&m.fromMe)return true
  if(!m.isGroup)return false
  if(!m.message)return true

  const chat=global.db.data.chats[m.chat]||{}
  if(!chat.antigore)return true
  if(isAdmin||isOwner||isROwner||m.fromMe)return true
  if(!global.db.data.goreCache)global.db.data.goreCache={}

  const isMedia=m.message.imageMessage||m.message.videoMessage||m.message.stickerMessage
  if(!isMedia)return true

  try{
    let mediaBuffer,mimeType
    const quoted=m.message.extendedTextMessage?.contextInfo?.quotedMessage
    const msg=quoted?(quoted.imageMessage||quoted.videoMessage||quoted.stickerMessage):(m.message.imageMessage||m.message.videoMessage||m.message.stickerMessage)
    if(!msg)return true

    let type
    const isStickerMsg=!!(quoted?.stickerMessage||m.message.stickerMessage||msg.mimetype==='image/webp')
    if(isStickerMsg)type='sticker'
    else if(msg.mimetype?.includes('video'))type='video'
    else if(msg.mimetype?.includes('image'))type='image'
    else return true

    if(type==='video'){
      if(msg.jpegThumbnail)mediaBuffer=Buffer.from(msg.jpegThumbnail)
      else return true
      mimeType='image/jpeg'
    }else{
      const stream=await downloadContentFromMessage(msg,type)
      mediaBuffer=Buffer.from([])
      for await(const chunk of stream)mediaBuffer=Buffer.concat([mediaBuffer,chunk])
      mimeType=type==='sticker'?'image/webp':(msg.mimetype||'image/jpeg')
    }

    const fileHash=crypto.createHash('md5').update(mediaBuffer).digest('hex')
    if(global.db.data.goreCache[fileHash]===true)return await punishUser(conn,m,isBotAdmin,'𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐠𝐫𝐚𝐟𝐢𝐜𝐨 𝐠𝐢à 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨')
    if(global.db.data.goreCache[fileHash]===false)return true

    const result=await moderateImage(mediaBuffer,mimeType)
    const s=result?.category_scores||{}
    const violence=Number(s.violence||0)
    const graphic=Number(s['violence/graphic']||0)
    const isHighRisk=graphic>0.10||violence>0.35

    global.db.data.goreCache[fileHash]=isHighRisk

    if(isHighRisk)return await punishUser(conn,m,isBotAdmin,'𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐠𝐫𝐚𝐟𝐢𝐜𝐨 / 𝐯𝐢𝐨𝐥𝐞𝐧𝐭𝐨 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨')
  }catch(e){
    console.error('Errore antigore:',e)
    return true
  }

  return true
}

function getOpenAIKey(){
  return process.env.OPENAI_API_KEY||global.OPENAI_API_KEY||global.openaiApiKey
}

async function moderateImage(buffer,mimeType){
  const key=getOpenAIKey()
  if(!key)throw new Error('OPENAI_API_KEY_ASSENTE')
  const b64=buffer.toString('base64')
  const res=await fetch('https://api.openai.com/v1/moderations',{
    method:'POST',
    headers:{
      Authorization:`Bearer ${key}`,
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      model:OPENAI_MODERATION_MODEL,
      input:[{
        type:'image_url',
        image_url:{url:`data:${mimeType};base64,${b64}`}
      }]
    })
  })
  const data=await res.json().catch(()=>null)
  if(!res.ok)throw new Error(data?.error?.message||`OPENAI_MODERATION_${res.status}`)
  return data?.results?.[0]||null
}

async function punishUser(conn,m,isBotAdmin,reason){
  const data=global.addGroupWarn(m.sender,m.chat,'antigore','system')
  const warn=data.warn
  const senderTag=global.cleanWarnNumber?global.cleanWarnNumber(m.sender):m.sender.split('@')[0]

  try{
    await conn.sendMessage(m.chat,{delete:m.key})
  }catch{}

  if(warn<3){
    await axionSystem(conn,m.chat,{
      text:axionFooter(`*@${senderTag}*

*⚠️ ${reason}*

*📌 𝐀𝐯𝐯𝐢𝐬𝐨:* *${warn}/3*`),
      thumb:'antigore',
      mentions:[m.sender],
      quoted:m
    })
    return false
  }

  global.resetGroupWarn(m.sender,m.chat)

  if(!isBotAdmin){
    await axionSystem(conn,m.chat,{
      text:axionFooter(`*@${senderTag}*

*⚠️ 𝐇𝐚 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 𝟑/𝟑 𝐚𝐯𝐯𝐢𝐬𝐢*

*❌ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐥𝐨: 𝐢𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 è 𝐚𝐝𝐦𝐢𝐧*`),
      thumb:'antigore',
      mentions:[m.sender],
      quoted:m
    })
    return false
  }

  await axionSystem(conn,m.chat,{
    text:axionFooter(`*@${senderTag}*

*⛔️ 𝐑𝐢𝐦𝐨𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*

*📌 𝐌𝐨𝐭𝐢𝐯𝐨:* *𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐢 𝐠𝐫𝐚𝐟𝐢𝐜𝐢 / 𝐯𝐢𝐨𝐥𝐞𝐧𝐭𝐢*`),
    thumb:'antigore',
    mentions:[m.sender],
    quoted:m
  })

  await conn.groupParticipantsUpdate(m.chat,[m.sender],'remove')
  return false
}

export default handler