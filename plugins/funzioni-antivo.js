// antiviewonce by Bonzino

import { axionSystem, axionFooter } from '../lib/axionsystem.js'

let handler = m => m

handler.before = async (m,{conn,isAdmin,isBotAdmin,isOwner,isROwner}) => {
  if(!m.isGroup)return false
  if(m.fromMe)return false
  if(isAdmin||isOwner||isROwner)return false

  const chat=global.db.data.chats[m.chat]||(global.db.data.chats[m.chat]={})
  if(!chat.antiviewonce)return false

  const msg=m.message||{}

  const isViewOnce=
    msg.viewOnceMessage||
    msg.viewOnceMessageV2||
    msg.viewOnceMessageV2Extension

  if(!isViewOnce)return false

  try{
    await conn.sendMessage(m.chat,{delete:m.key})
  }catch{}

  await axionSystem(conn,m.chat,{
    text:axionFooter(`*❌ 𝐕𝐢𝐞𝐰 𝐎𝐧𝐜𝐞 𝐧𝐨𝐧 𝐜𝐨𝐧𝐬𝐞𝐧𝐭𝐢𝐭𝐨*

*@${m.sender.split('@')[0]}*

*📸 𝐈𝐧𝐯𝐢𝐚 𝐢𝐥 𝐦𝐞𝐝𝐢𝐚 𝐢𝐧 𝐦𝐨𝐝𝐚𝐥𝐢𝐭𝐚̀ 𝐧𝐨𝐫𝐦𝐚𝐥𝐞*`),
    thumb:'antiviewonce',
    mentions:[m.sender],
    quoted:m
  })

  return true
}

export default handler