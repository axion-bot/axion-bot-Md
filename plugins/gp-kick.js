// kick by Bonzino

import { getThumbBuffer } from '../lib/thumb.js'

const S=v=>String(v||'')
const clean=jid=>S(jid).replace(/[^0-9]/g,'')
const commands=['kick','puffo','rimuovi','vola','spalumma','sparisci','evapora']
const cmdRegex=new RegExp(`^(${commands.join('|')})(?:\\s|$)`,'i')
const footer=text=>`${text}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

async function kickBox(conn,chatId,{text,mentions=[],quoted=null}={}){
  const thumbnail=await getThumbBuffer('kick')
  return conn.sendMessage(chatId,{
    text,
    mentions,
    contextInfo:{
      mentionedJid:mentions,
      externalAdReply:{
        title:'      𝐔𝐭𝐞𝐧𝐭𝐞 𝐑𝐢𝐦𝐨𝐬𝐬𝐨 ⛔️',
        ...(thumbnail?{thumbnail}:{}),
        mediaType:1,
        renderLargerThumbnail:false,
        showAdAttribution:false
      }
    }
  },quoted?{quoted}:{})
}

async function runKick(m,{conn,text='',isAdmin,isBotAdmin,isOwner,isROwner}){
  if(!m.isGroup)return false
  if(!isAdmin&&!isOwner&&!isROwner)return false
  if(!isBotAdmin)return conn.sendMessage(m.chat,{text:footer(`*⚠️ 𝐈𝐥 𝐛𝐨𝐭 𝐝𝐞𝐯𝐞 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐝𝐦𝐢𝐧 𝐩𝐞𝐫 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐮𝐭𝐞𝐧𝐭𝐢.*`)},{quoted:m})

  const mention=m.mentionedJid?.[0]||m.quoted?.sender||null

  if(!mention)return conn.sendMessage(m.chat,{
    text:footer(`*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐨 𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚 𝐝𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞.*`)
  },{quoted:m})

  const botJid=conn.decodeJid?conn.decodeJid(conn.user?.jid||conn.user?.id||''):conn.user?.jid
  const ownerJids=Array.isArray(global.owner)?global.owner.map(o=>`${Array.isArray(o)?o[0]:o}@s.whatsapp.net`):[]

  if(ownerJids.some(o=>clean(o)===clean(mention)))return conn.sendMessage(m.chat,{
    text:footer(`*⚠️ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐮𝐧 𝐎𝐰𝐧𝐞𝐫.*`)
  },{quoted:m})

  if(clean(mention)===clean(botJid))return conn.sendMessage(m.chat,{
    text:footer(`*⚠️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐢𝐥 𝐛𝐨𝐭.*`)
  },{quoted:m})

  if(clean(mention)===clean(m.sender))return conn.sendMessage(m.chat,{
    text:footer(`*⚠️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐭𝐞 𝐬𝐭𝐞𝐬𝐬𝐨.*`)
  },{quoted:m})

  const metadata=await conn.groupMetadata(m.chat)
  const participant=(metadata.participants||[]).find(u=>clean(u.id||u.jid||u.lid)===clean(mention))

  if(participant?.admin==='admin'||participant?.admin==='superadmin')return conn.sendMessage(m.chat,{
    text:footer(`*⚠️ 𝐍𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐮𝐧 𝐚𝐝𝐦𝐢𝐧.*`)
  },{quoted:m})

  const targetJid=participant?.jid||participant?.id||mention
  const targetTag='@'+clean(targetJid)
  const executorTag='@'+clean(m.sender)

  const reason=S(text)
    .replace(cmdRegex,'')
    .replace(/@\d+/g,'')
    .replace(clean(mention),'')
    .trim()||'𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐨𝐭𝐢𝐯𝐨 𝐬𝐩𝐞𝐜𝐢𝐟𝐢𝐜𝐚𝐭𝐨'

  try{
    await conn.groupParticipantsUpdate(m.chat,[targetJid],'remove')
    await kickBox(conn,m.chat,{
      text:footer(`*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${targetTag}

*❓️ 𝐌𝐨𝐭𝐢𝐯𝐨:* *${reason}*

*👮‍♂️ 𝐄𝐬𝐞𝐜𝐮𝐭𝐨𝐫𝐞:* ${executorTag}`),
      mentions:[targetJid,m.sender],
      quoted:m
    })
  }catch{
    await conn.sendMessage(m.chat,{
      text:footer(`*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞: 𝐧𝐨𝐧 𝐡𝐨 𝐢 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢 𝐧𝐞𝐜𝐞𝐬𝐬𝐚𝐫𝐢 𝐨 𝐥’𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐮𝐬𝐜𝐢𝐭𝐨.*`)
    },{quoted:m})
  }

  return true
}

async function handler(m,args){
  return runKick(m,args)
}

handler.before=async function(m,args){
  const text=S(m.text).trim()
  if(!cmdRegex.test(text))return false
  await runKick(m,{...args,text})
  return true
}

handler.command=/^(kick|puffo|rimuovi|vola|spalumma|sparisci|evapora)$/i
handler.admin=true
handler.botAdmin=true
handler.group=true

export default handler