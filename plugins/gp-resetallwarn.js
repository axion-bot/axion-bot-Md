// resetallwarn by Bonzino

let handler=async(m,{conn,usedPrefix})=>{
  const chatId=m.chat
const box=(emoji,title,body)=>`*${emoji} ${title}*

${body}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  const metadata=await conn.groupMetadata(chatId)
  const participants=metadata.participants||[]

  let resetCount=0
  let totalWarnRemoved=0
  let mentions=[]

  for(const p of participants){
    const jid=p.jid||p.id||p.lid
    const currentWarn=global.getGroupWarn(jid,chatId)
    if(currentWarn<=0)continue

    resetCount++
    totalWarnRemoved+=currentWarn
    mentions.push(jid)

    global.resetGroupWarn(jid,chatId)
  }

  const buttons=[
    {buttonId:`${usedPrefix}listawarn`,buttonText:{displayText:'📋 Lista Warn'},type:1}
  ]

  if(!resetCount){
    return conn.sendMessage(chatId,{
      text:box('✅','𝐑𝐄𝐒𝐄𝐓 𝐖𝐀𝐑𝐍',`*𝐍𝐞𝐬𝐬𝐮𝐧 𝐰𝐚𝐫𝐧 𝐝𝐚 𝐚𝐳𝐳𝐞𝐫𝐚𝐫𝐞 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨.*`),
      buttons,
      headerType:1
    },{quoted:m})
  }

  return conn.sendMessage(chatId,{
    text:box('🧹','𝐖𝐀𝐑𝐍 𝐀𝐙𝐙𝐄𝐑𝐀𝐓𝐈',`*👥 𝐔𝐭𝐞𝐧𝐭𝐢 𝐫𝐢𝐩𝐮𝐥𝐢𝐭𝐢:* *${resetCount}*

*⚠️ 𝐖𝐚𝐫𝐧 𝐫𝐢𝐦𝐨𝐬𝐬𝐢:* *${totalWarnRemoved}*

*✅ 𝐓𝐮𝐭𝐭𝐢 𝐢 𝐰𝐚𝐫𝐧 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐬𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐚𝐳𝐳𝐞𝐫𝐚𝐭𝐢.*`),
    mentions,
    buttons,
    headerType:1
  },{quoted:m})
}

handler.command=/^(resetallwarn|resetwarnall|azzerawarn|azzeratuttiwarn)$/i
handler.group=true
handler.admin=true

export default handler