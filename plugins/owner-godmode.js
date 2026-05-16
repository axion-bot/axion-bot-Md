// owner-godmode by Bonzino

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const footer=`\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

async function withTimeout(p,ms=30000){
  return Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(new Error(`timeout_${ms}`)),ms))])
}

function normalizeJid(conn,jid){
  if(!jid)return''
  try{if(typeof conn.decodeJid==='function')jid=conn.decodeJid(jid)}catch{}
  return String(jid||'').trim().toLowerCase()
}

function jidPhone(conn,jid){
  return normalizeJid(conn,jid).split('@')[0].split(':')[0].replace(/\D/g,'')
}

function participantIds(p){
  return[p?.id,p?.jid,p?.lid,p?.participant].filter(Boolean)
}

function extractGroupId(str){
  const match=String(str||'').match(/(?:^|\s)(\d{10,}@g\.us)(?=$|\s)/i)
  return match?match[1]:null
}

function extractInvite(str){
  const match=String(str||'').match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/i)
  return match?match[1]:null
}

async function getMetaSafe(conn,jid){
  let lastError=null

  for(let i=0;i<2;i++){
    try{
      const meta=await withTimeout(conn.groupMetadata(jid),20000)
      if(meta?.id&&Array.isArray(meta?.participants)&&meta.participants.length>0)return meta
    }catch(e){
      lastError=e
      await sleep(1200)
    }
  }

  try{
    const all=await withTimeout(conn.groupFetchAllParticipating(),25000)
    const direct=all?.[jid]

    if(direct){
      const participants=Array.isArray(direct.participants)?direct.participants:Object.values(direct.participants||{})
      return{id:direct.id||jid,subject:direct.subject||'',participants}
    }
  }catch{}

  throw lastError||new Error('metadata_unavailable')
}

let handler=async(m,{conn,text,usedPrefix,command})=>{
  const input=String(text||'').trim()
  const normalized=input
    .replace(/\r/g,'')
    .replace(/\n+/g,' ')
    .replace(/\|/g,' ')
    .replace(/\s+/g,' ')
    .replace(/\s*@\s*g\.us/gi,'@g.us')
    .trim()

  let target=null
  const groupId=extractGroupId(normalized)
  const inviteCode=extractInvite(normalized)

  if(!groupId&&!inviteCode&&m.isGroup)target=m.chat

  if(!target&&!groupId&&!inviteCode){
    return conn.reply(m.chat,`*⚠️ 𝐈𝐧 𝐩𝐫𝐢𝐯𝐚𝐭𝐨 𝐝𝐞𝐯𝐢 𝐢𝐧𝐬𝐞𝐫𝐢𝐫𝐞 𝐢𝐥 𝐥𝐢𝐧𝐤 𝐨 𝐥'𝐈𝐃 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*

*📌 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix+command} https://chat.whatsapp.com/xxxx*
*${usedPrefix+command} 120363xxxxxxxx@g.us*${footer}`,m)
  }

  if(!target){
    if(groupId)target=groupId
    else{
      try{
        const info=await withTimeout(conn.groupGetInviteInfo(inviteCode),20000)
        target=info?.id
      }catch(e){
        console.error('[GODMODE INVITE ERROR]',e?.message||e)
      }
    }
  }

  if(!target){
    return conn.reply(m.chat,`*⚠️ 𝐆𝐫𝐮𝐩𝐩𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.*

*𝐈𝐥 𝐥𝐢𝐧𝐤 𝐩𝐨𝐭𝐫𝐞𝐛𝐛𝐞 𝐞𝐬𝐬𝐞𝐫𝐞 𝐬𝐜𝐚𝐝𝐮𝐭𝐨, 𝐫𝐞𝐯𝐨𝐜𝐚𝐭𝐨 𝐨 𝐧𝐨𝐧 𝐥𝐞𝐠𝐠𝐢𝐛𝐢𝐥𝐞.*

*📌 𝐌𝐞𝐭𝐨𝐝𝐨 𝐩𝐢𝐮̀ 𝐬𝐢𝐜𝐮𝐫𝐨:*
*${usedPrefix+command} 120363xxxxxxxx@g.us*${footer}`,m)
  }

  try{
    const meta=await getMetaSafe(conn,target)
    const participants=Array.isArray(meta?.participants)?meta.participants:[]
    const botJid=normalizeJid(conn,conn.user?.jid||conn.user?.id||'')
    const botPhone=jidPhone(conn,botJid)
    const ownerPhone=jidPhone(conn,m.sender)

    const botParticipant=participants.find(p=>participantIds(p).some(id=>jidPhone(conn,id)===botPhone))
    const ownerParticipant=participants.find(p=>participantIds(p).some(id=>jidPhone(conn,id)===ownerPhone))

    if(!participants.length){
      return conn.reply(m.chat,`*⚠️ 𝐍𝐨𝐧 𝐫𝐢𝐞𝐬𝐜𝐨 𝐚 𝐥𝐞𝐠𝐠𝐞𝐫𝐞 𝐢 𝐦𝐞𝐦𝐛𝐫𝐢 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*${footer}`,m)
    }

    if(!botParticipant){
      return conn.reply(m.chat,`*⚠️ 𝐈𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐭𝐚𝐫𝐠𝐞𝐭.*${footer}`,m)
    }

    if(!['admin','superadmin'].includes(botParticipant.admin)){
      return conn.reply(m.chat,`*⛔ 𝐈𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 è 𝐚𝐝𝐦𝐢𝐧 𝐢𝐧 𝐪𝐮𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*${footer}`,m)
    }

    if(!ownerParticipant){
      return conn.reply(m.chat,`*⚠️ 𝐓𝐮 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐢 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐭𝐚𝐫𝐠𝐞𝐭.*

*𝐏𝐫𝐢𝐦𝐚 𝐞𝐧𝐭𝐫𝐚 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨, 𝐩𝐨𝐢 𝐮𝐬𝐚 𝐝𝐢 𝐧𝐮𝐨𝐯𝐨 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*${footer}`,m)
    }

    if(['admin','superadmin'].includes(ownerParticipant.admin)){
      return conn.reply(m.chat,`*ℹ️ 𝐒𝐞𝐢 𝐠𝐢à 𝐚𝐝𝐦𝐢𝐧 𝐢𝐧:* *${meta?.subject||'Gruppo'}*${footer}`,m)
    }

    let ok=false

    for(let i=0;i<3;i++){
      try{
        await withTimeout(conn.groupParticipantsUpdate(target,[m.sender],'promote'),30000)
        ok=true
        break
      }catch(e){
        console.error('[GODMODE PROMOTE ERROR]',e?.message||e)
        await sleep(2000)
      }
    }

    if(!ok){
      return conn.reply(m.chat,`*⚠️ 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐧𝐨𝐧 𝐡𝐚 𝐜𝐨𝐧𝐟𝐞𝐫𝐦𝐚𝐭𝐨 𝐥𝐚 𝐩𝐫𝐨𝐦𝐨𝐳𝐢𝐨𝐧𝐞.*${footer}`,m)
    }

    const groupName=meta?.subject||'Gruppo'
    const differentTarget=target!==m.chat

    const successText=differentTarget
      ? `*𝐎𝐫𝐚 𝐬𝐞𝐢 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐭𝐨 𝐃𝐢𝐨 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨:* *${groupName}*👑`
      : `*𝐎𝐫𝐚 𝐬𝐞𝐢 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐭𝐨 𝐃𝐢𝐨 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.👑*`

    return conn.reply(m.chat,`${successText}${footer}`,m,{mentions:[m.sender]})
  }catch(e){
    console.error('[GODMODE ERROR]',e)

    return conn.reply(m.chat,`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐩𝐫𝐨𝐦𝐨𝐳𝐢𝐨𝐧𝐞.*

*⚠️ 𝐀𝐬𝐬𝐢𝐜𝐮𝐫𝐚𝐭𝐢 𝐜𝐡𝐞:*
*• 𝐈𝐥 𝐛𝐨𝐭 𝐬𝐢𝐚 𝐚𝐝𝐦𝐢𝐧*
*• 𝐓𝐮 𝐬𝐢𝐚 𝐠𝐢à 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*
*• 𝐈𝐥 𝐥𝐢𝐧𝐤/𝐈𝐃 𝐬𝐢𝐚 𝐜𝐨𝐫𝐫𝐞𝐭𝐭𝐨*

*🧾 ${e.message||e}*${footer}`,m)
  }
}

handler.help=['godmode']
handler.tags=['owner']
handler.command=/^(godmode|dio)$/i
handler.owner=true
handler.group=false

export default handler