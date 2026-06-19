// link by Deadly × Bonzino

const handler=async(m,{conn})=>{

const metadata=await conn.groupMetadata(m.chat)
const participants=Array.isArray(metadata.participants)?metadata.participants:[]
const totalMembers=participants.length

let inviteCode
try{
inviteCode=await conn.groupInviteCode(m.chat)
}catch{
inviteCode=null
}

const link=inviteCode?`https://chat.whatsapp.com/${inviteCode}`:'𝐍𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞'

const text=`
*🏷 𝐍𝐨𝐦𝐞:* *${metadata.subject||'Gruppo'}*

*👥 𝐌𝐞𝐦𝐛𝐫𝐢:* *${totalMembers}*`

await global.sendCopy(conn,m,{
text,
copy:link,
button:'Copia link'
})
}

handler.help=['link']
handler.tags=['group']
handler.command=/^link$/i
handler.group=true
handler.botAdmin=true

export default handler