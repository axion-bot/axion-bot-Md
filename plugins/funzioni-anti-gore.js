// Anti-Gore by Bonzino

import { downloadContentFromMessage } from '@realvare/baileys'
import crypto from 'crypto'
import fetch from 'node-fetch'
import FormData from 'form-data'
import { axionSystem,axionFooter } from '../lib/axionsystem.js'

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
    let mediaBuffer,mimeType,fileName
    const quoted=m.message.extendedTextMessage?.contextInfo?.quotedMessage
    const msg=quoted?(quoted.imageMessage||quoted.videoMessage||quoted.stickerMessage):(m.message.imageMessage||m.message.videoMessage||m.message.stickerMessage)
    if(!msg)return true

    let type
    if(msg.mimetype?.includes('video'))type='video'
    else if(msg.mimetype?.includes('sticker'))type='sticker'
    else if(msg.mimetype?.includes('image'))type='image'
    else return true

    const stream=await downloadContentFromMessage(msg,type)
    mediaBuffer=Buffer.from([])
    for await(const chunk of stream)mediaBuffer=Buffer.concat([mediaBuffer,chunk])

    const fileHash=crypto.createHash('md5').update(mediaBuffer).digest('hex')
    if(global.db.data.goreCache[fileHash]===true)return await punishUser(conn,m,isBotAdmin,'𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐠𝐫𝐚𝐟𝐢𝐜𝐨 𝐠𝐢à 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨')
    if(global.db.data.goreCache[fileHash]===false)return true

    if(type==='video'){
      mimeType='video/mp4'
      fileName='media.mp4'
      if(mediaBuffer.length>10*1024*1024)return true
    }else if(type==='sticker'){
      mimeType='image/webp'
      fileName='media.webp'
    }else{
      mimeType=msg.mimetype||'image/jpeg'
      fileName='media.jpg'
    }

    const SIGHTENGINE_USER=global.APIKeys.sightengine_user
    const SIGHTENGINE_SECRET=global.APIKeys.sightengine_secret
    if(!SIGHTENGINE_USER||!SIGHTENGINE_SECRET)return true

    const apiUrl=type==='video'
      ?'https://api.sightengine.com/1.0/video/check-sync.json'
      :'https://api.sightengine.com/1.0/check.json'

    const formData=new FormData()
    formData.append('media',mediaBuffer,{filename:fileName,contentType:mimeType})
    formData.append('models','gore-2.0,violence')
    formData.append('api_user',SIGHTENGINE_USER)
    formData.append('api_secret',SIGHTENGINE_SECRET)

    const response=await fetch(apiUrl,{method:'POST',body:formData})
    const result=await response.json()

    if(result.status!=='success'){
      console.log('Errore API SightEngine antigore:',result)
      return true
    }

    let goreProb=0,violenceProb=0,seriousInjury=0,veryBloody=0,corpse=0,skull=0,bodyOrgan=0,firearmThreat=0,physicalViolence=0

    if(type==='video'){
      const frames=result.data?.frames||[]
      goreProb=Math.max(...frames.map(f=>f.gore?.prob||0),0)
      violenceProb=Math.max(...frames.map(f=>f.violence?.prob||0),0)
      seriousInjury=Math.max(...frames.map(f=>f.gore?.classes?.serious_injury||0),0)
      veryBloody=Math.max(...frames.map(f=>f.gore?.classes?.very_bloody||0),0)
      corpse=Math.max(...frames.map(f=>f.gore?.classes?.corpse||0),0)
      skull=Math.max(...frames.map(f=>f.gore?.classes?.skull||0),0)
      bodyOrgan=Math.max(...frames.map(f=>f.gore?.classes?.body_organ||0),0)
      firearmThreat=Math.max(...frames.map(f=>f.violence?.classes?.firearm_threat||0),0)
      physicalViolence=Math.max(...frames.map(f=>f.violence?.classes?.physical_violence||0),0)
    }else{
      goreProb=result.gore?.prob||0
      violenceProb=result.violence?.prob||0
      seriousInjury=result.gore?.classes?.serious_injury||0
      veryBloody=result.gore?.classes?.very_bloody||0
      corpse=result.gore?.classes?.corpse||0
      skull=result.gore?.classes?.skull||0
      bodyOrgan=result.gore?.classes?.body_organ||0
      firearmThreat=result.violence?.classes?.firearm_threat||0
      physicalViolence=result.violence?.classes?.physical_violence||0
    }

    const isHighRisk=goreProb>0.45||violenceProb>0.75||seriousInjury>0.35||veryBloody>0.35||corpse>0.25||skull>0.30||bodyOrgan>0.20||firearmThreat>0.85||physicalViolence>0.85
    global.db.data.goreCache[fileHash]=isHighRisk

    if(isHighRisk)return await punishUser(conn,m,isBotAdmin,'𝐂𝐨𝐧𝐭𝐞𝐧𝐮𝐭𝐨 𝐠𝐫𝐚𝐟𝐢𝐜𝐨 / 𝐯𝐢𝐨𝐥𝐞𝐧𝐭𝐨 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐨')
  }catch(e){
    console.error('Errore antigore:',e)
    return true
  }

  return true
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