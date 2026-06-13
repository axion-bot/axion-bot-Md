// addmod by Bonzino

const handler=async(m,{conn,text})=>{
if(!m.isGroup)return m.reply('*❌ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐚 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢.*')

let who=m.mentionedJid?.[0]||m.quoted?.sender||''

if(!who&&text){
let number=text.replace(/\D/g,'')
if(number.length>=8)who=number+'@s.whatsapp.net'
}

if(!who)return m.reply('*❌ 𝐃𝐞𝐯𝐢 𝐭𝐚𝐠𝐠𝐚𝐫𝐞 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞 𝐚𝐥𝐥’𝐮𝐭𝐞𝐧𝐭𝐞.*')

let user=global.db.data.users[who]||(global.db.data.users[who]={})

if(user.moderator&&user.moderatorGroup===m.chat){
return m.reply(`*@${who.split('@')[0]} 𝐞̀ 𝐠𝐢𝐚̀ 𝐦𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐞.*`,null,{mentions:[who]})
}

user.moderator=true
user.moderatorGroup=m.chat

let thumbnail=null

try{
const pp=await conn.profilePictureUrl(who,'image')
const res=await fetch(pp)
thumbnail=Buffer.from(await res.arrayBuffer())
}catch{}

await conn.sendMessage(m.chat,{
text:`*@${who.split('@')[0]} 𝐨𝐫𝐚 𝐞̀ 𝐦𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐞 𝐝𝐢 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 ✅*`,
contextInfo:{
mentionedJid:[who],
externalAdReply:{
title:'👮‍♂️ Moderatore aggiunto',
thumbnail
}
}
},{quoted:m})
}

handler.help=['addmod @user']
handler.tags=['group']
handler.command=['addmod']
handler.group=true
handler.admin=true

export default handler