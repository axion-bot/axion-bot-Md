// promote-demote by Bonzino

import { getThumbBuffer } from '../lib/thumb.js'

const S=v=>String(v||'')
const ROLE_EVENT_CACHE_MS=8000
global.roleActionCache=global.roleActionCache||new Map()

function normalizeJid(jid){return String(jid||'').split(':')[0]}
function makeRoleCacheKey(chatId,action,users=[]){return `${chatId}|${action}|${[...users].map(normalizeJid).sort().join(',')}`}
function markRoleAction(chatId,action,users=[]){global.roleActionCache.set(makeRoleCacheKey(chatId,action,users),Date.now())}

function title(action){
  return action==='promote'
    ?'𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐢 𝐩𝐫𝐨𝐦𝐨𝐳𝐢𝐨𝐧𝐞 👑'
    :'𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐨𝐧𝐞'
}

function footer(text){
  return `${text}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
}

async function roleBox(conn,chatId,{text,thumb,mentions=[],quoted=null,action}={}){
  const thumbnail=await getThumbBuffer(thumb)

  return conn.sendMessage(chatId,{
    text,
    mentions,
    contextInfo:{
      mentionedJid:mentions,
      externalAdReply:{
        title:title(action),
        thumbnail,
        mediaType:1,
        renderLargerThumbnail:false,
        showAdAttribution:false
      }
    }
  },quoted?{quoted}:{})
}

global.isRecentRoleAction=function(chatId,action,users=[]){
  const key=makeRoleCacheKey(chatId,action,users)
  const ts=global.roleActionCache.get(key)

  if(!ts)return false

  if(Date.now()-ts>ROLE_EVENT_CACHE_MS){
    global.roleActionCache.delete(key)
    return false
  }

  return true
}

function cleanupRoleActionCache(){
  const now=Date.now()

  for(const[key,ts]of global.roleActionCache.entries()){
    if(now-ts>ROLE_EVENT_CACHE_MS)global.roleActionCache.delete(key)
  }
}

global.sendRoleChangeMessage=async function(conn,chatId,sender,users,action,quoted=null){
  users=[...new Set((users||[]).map(normalizeJid))]
  sender=normalizeJid(sender)

  if(!users.length||!sender)return

  const isPromote=action==='promote'

  const targetLabel=users.length===1
    ? `@${users[0].split('@')[0]}`
    : '*𝐠𝐥𝐢 𝐮𝐭𝐞𝐧𝐭𝐢 𝐬𝐞𝐥𝐞𝐳𝐢𝐨𝐧𝐚𝐭𝐢*'

  const actionText=isPromote
    ? `*@${sender.split('@')[0]} 𝐡𝐚 𝐝𝐚𝐭𝐨 𝐢 𝐩𝐨𝐭𝐞𝐫𝐢 𝐚* ${targetLabel}`
    : `*@${sender.split('@')[0]} 𝐡𝐚 𝐭𝐨𝐥𝐭𝐨 𝐢 𝐩𝐨𝐭𝐞𝐫𝐢 𝐚* ${targetLabel}`

  await roleBox(conn,chatId,{
    text:footer(actionText),
    thumb:action,
    action,
    mentions:[sender,...users],
    quoted
  })
}

let handler=async(m,{conn,text,command})=>{
  cleanupRoleActionCache()

  let action=['promote','promuovi','p','p2'].includes(command)
    ? 'promote'
    : 'demote'

  let users=m.mentionedJid&&m.mentionedJid.length>0
    ? m.mentionedJid
    : (m.quoted?[m.quoted.sender]:[])

  if(!users.length&&text){
    const numbers=S(text).split(/[\s,]+/).filter(v=>!isNaN(v))
    users=numbers.map(n=>n+'@s.whatsapp.net')
  }

  users=[...new Set(users.map(normalizeJid))]

  if(!users.length){
    return conn.sendMessage(m.chat,{
      text:footer(`*⚠️ 𝐈𝐧𝐝𝐢𝐜𝐚 𝐚𝐥𝐦𝐞𝐧𝐨 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞.*`)
    },{quoted:m})
  }

  try{
    const ownerNumbers=(global.owner||[]).map(v=>String(Array.isArray(v)?v[0]:v))
    const ownerJids=ownerNumbers.map(v=>v.replace(/\D/g,'')+'@s.whatsapp.net')

    if(action==='demote'){
      const blockedOwners=users.filter(u=>ownerJids.includes(u))

      if(blockedOwners.length){
        return conn.sendMessage(m.chat,{
          text:footer(`*⛔️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐝𝐞𝐫𝐞 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫 𝐝𝐞𝐥 𝐛𝐨𝐭.*`),
          mentions:blockedOwners
        },{quoted:m})
      }
    }

    await conn.groupParticipantsUpdate(m.chat,users,action)
    markRoleAction(m.chat,action,users)

  }catch(e){
    await conn.sendMessage(m.chat,{
      text:footer(`*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚 𝐝𝐞𝐢 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢.*`)
    },{quoted:m})
  }
}

handler.help=['promote','demote']
handler.tags=['admin']
handler.command=['promote','promuovi','p','p2','demote','retrocedi','r']
handler.group=true
handler.admin=true
handler.botAdmin=true

export default handler