// listatempmod by Bonzino

function formatTime(ms){
if(ms<=0)return '𝐒𝐜𝐚𝐝𝐮𝐭𝐨'

const d=Math.floor(ms/86400000)
const h=Math.floor((ms%86400000)/3600000)
const m=Math.floor((ms%3600000)/60000)

if(d>0)return `${d}𝐠 ${h}𝐡`
if(h>0)return `${h}𝐡 ${m}𝐦`
return `${m}𝐦`
}

let handler=async(m,{conn})=>{

const tempMods=
global.db.data.chats?.[m.chat]?.tempMods||{}

const entries=Object.entries(tempMods)

if(!entries.length){
return m.reply(
`*🛡️ 𝐌𝐎𝐃𝐄𝐑𝐀𝐓𝐎𝐑𝐈 𝐓𝐄𝐌𝐏𝐎𝐑𝐀𝐍𝐄𝐈*

*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐞 𝐭𝐞𝐦𝐩𝐨𝐫𝐚𝐧𝐞𝐨 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐞.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
)
}

const mentions=[]
const righe=[]

for(let i=0;i<entries.length;i++){

const [jid,data]=entries[i]

mentions.push(jid)

righe.push(
`*${i+1}. 👤* @${jid.split('@')[0]}
*⏳ 𝐒𝐜𝐚𝐝𝐞 𝐭𝐫𝐚:* ${formatTime(data.expiresAt-Date.now())}`
)
}

return conn.sendMessage(m.chat,{
text:`*🛡️ 𝐌𝐎𝐃𝐄𝐑𝐀𝐓𝐎𝐑𝐈 𝐓𝐄𝐌𝐏𝐎𝐑𝐀𝐍𝐄𝐈*

${righe.join('\n\n')}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
mentions
},{quoted:m})
}

handler.help=['listatempmod']
handler.tags=['group']
handler.command=/^(listatempmod|listmodtemp)$/i
handler.group=true

export default handler