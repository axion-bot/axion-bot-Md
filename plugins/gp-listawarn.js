// listawarn by Bonzino

let handler=async(m,{conn})=>{
  const chatId=m.chat
  const cleanJid=jid=>String(jid||'').replace(/[^0-9]/g,'')
  const box=(emoji,title,body)=>`*╭━━━━━━━${emoji}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${emoji}━━━━━━━╯*

${body}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  const warnListButtons=()=>[
    {buttonId:'.resetallwarn',buttonText:{displayText:'🧹 Azzera tutti i warn'},type:1},
    {buttonId:'.listawarn',buttonText:{displayText:'🔄 Aggiorna lista'},type:1}
  ]

  const metadata=await conn.groupMetadata(chatId)
  const participants=metadata.participants||[]

  const warnedUsers=participants.map(p=>{
    const jid=p.jid||p.id||p.lid
    const data=global.getGroupWarnData(jid,chatId)
    return{
      jid,
      warn:Number(data.warn||0),
      reason:data.lastWarnReason||''
    }
  }).filter(u=>u.warn>0).sort((a,b)=>b.warn-a.warn)

  if(!warnedUsers.length){
    return conn.sendMessage(chatId,{
      text:box('✅','𝐋𝐈𝐒𝐓𝐀 𝐖𝐀𝐑𝐍',`*𝐍𝐞𝐬𝐬𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 𝐰𝐚𝐫𝐧𝐚𝐭𝐨 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨.*`),
      buttons:warnListButtons(),
      headerType:1
    },{quoted:m})
  }

  const mentions=warnedUsers.map(u=>u.jid)

  const list=warnedUsers.map((u,i)=>{
    const tag='@'+cleanJid(u.jid)
    const reason=u.reason?`\n*❓ 𝐔𝐥𝐭𝐢𝐦𝐨 𝐦𝐨𝐭𝐢𝐯𝐨:* *${u.reason}*`:''
    return `*${i+1}. 👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag}
*⚠️ 𝐖𝐚𝐫𝐧:* *${u.warn}/𝟑*${reason}`
  }).join('\n\n')

  return conn.sendMessage(chatId,{
    text:box('⚠️','𝐋𝐈𝐒𝐓𝐀 𝐖𝐀𝐑𝐍',list),
    mentions,
    buttons:warnListButtons(),
    headerType:1
  },{quoted:m})
}

handler.command=/^(listwarn|warnlist|listawarn)$/i
handler.group=true
handler.admin=true

export default handler