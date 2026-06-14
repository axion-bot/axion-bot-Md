// listawarn by Bonzino

let handler=async(m,{conn})=>{
  const chatId=m.chat
const cleanJid=jid=>String(jid||'').replace(/[^0-9]/g,'')

const target =
  m.mentionedJid?.[0] ||
  (
    m.quoted &&
    cleanJid(m.quoted.sender) !== cleanJid(conn.user.jid)
      ? m.quoted.sender
      : null
  )
const box=(emoji,title,body)=>`*${emoji} ${title}*

${body}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  const warnListButtons=()=>[
    {buttonId:'.resetallwarn',buttonText:{displayText:'🧹 Azzera tutti i warn'},type:1},
    {buttonId:'.listawarn',buttonText:{displayText:'🔄 Aggiorna lista'},type:1}
  ]

  const metadata=await conn.groupMetadata(chatId)
  const participants=metadata.participants||[]
  
  if (target) {
  const data = global.getGroupWarnData(target, chatId) || {}
  const warn = Number(data.warn || 0)

  return conn.sendMessage(chatId,{
    text: box(
      '⚠️',
      '𝐖𝐀𝐑𝐍 𝐔𝐓𝐄𝐍𝐓𝐄',
`*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${cleanJid(target)}

*⚠️ 𝐖𝐚𝐫𝐧:* *${warn}/𝟑*

*❓ 𝐔𝐥𝐭𝐢𝐦𝐨 𝐦𝐨𝐭𝐢𝐯𝐨:* ${
  data.lastWarnReason || 'Nessuno'
}`
    ),
    mentions:[target],
    buttons:[
      {
        buttonId:`.unwarn ${cleanJid(target)}`,
        buttonText:{displayText:'➖ Unwarn'},
        type:1
      },
      {
        buttonId:`.unwarnall ${cleanJid(target)}`,
        buttonText:{displayText:'🧹 Unwarn All'},
        type:1
      },
      {
        buttonId:'.listawarn',
        buttonText:{displayText:'📋 Lista Warn'},
        type:1
      },
      {
  buttonId:'.resetallwarn',
  buttonText:{displayText:'🧹 Reset Gruppo'},
  type:1
}
    ],
    headerType:1
  },{quoted:m})
}

  const warnedUsers=participants.map(p=>{
    const jid=p.jid||p.id||p.lid
const data = global.getGroupWarnData(jid,chatId) || {}

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