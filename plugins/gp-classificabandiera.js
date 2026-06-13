// TopBandiera by Bonzino

function formatNumber(num){
return new Intl.NumberFormat('it-IT').format(num||0)
}

function normalizeDigits(str=''){
return String(str).replace(/\D/g,'')
}

function resolveUserFromParticipants(conn,participant={}){
const rawCandidates=[participant.id,participant.jid,participant.lid].filter(Boolean)

const decodedCandidates=rawCandidates
.map(v=>conn.decodeJid?.(v)||v)
.filter(Boolean)

const allCandidates=[...new Set([...rawCandidates,...decodedCandidates])]
const users=global.db.data.users||{}

for(const jid of allCandidates){
if(users[jid])return{jid,user:users[jid]}
}

const numbers=[...new Set(allCandidates.map(v=>normalizeDigits(v)).filter(Boolean))]

for(const num of numbers){
const foundKey=Object.keys(users).find(key=>normalizeDigits(key)===num)
if(foundKey)return{jid:foundKey,user:users[foundKey]}
}

const fallbackJid=decodedCandidates[0]||rawCandidates[0]||''
return{jid:fallbackJid,user:{}}
}

let handler=async(m,{conn})=>{
if(!m.isGroup)return m.reply('⚠️ 𝐒𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢')

const metadata=await conn.groupMetadata(m.chat)
const participants=metadata?.participants||[]

const classifica=participants
.map(p=>{
const resolved=resolveUserFromParticipants(conn,p)
const jid=resolved.jid
const user=resolved.user||{}

return{
jid,
vittorie:user.bandieraVittorie||0
}
})
.filter(user=>user.jid&&user.vittorie>0)
.sort((a,b)=>b.vittorie-a.vittorie)
.slice(0,10)

if(!classifica.length){
return m.reply(`🏆 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐁𝐀𝐍𝐃𝐈𝐄𝐑𝐄*

❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐝𝐚𝐭𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞

> 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`)
}

const menzioni=classifica.map(user=>user.jid)
const righe=[]

for(let i=0;i<classifica.length;i++){
const user=classifica[i]
let nome

try{
nome=await conn.getName(user.jid)
}catch{
nome=user.jid.split('@')[0]
}

const pos=i+1
const prefisso=
pos===1?'🥇':
pos===2?'🥈':
pos===3?'🥉':
`${pos}.`

righe.push(`${prefisso} ${nome} ${formatNumber(user.vittorie)} 𝐕𝐢𝐭𝐭𝐨𝐫𝐢𝐞`)
}

const testo=`🏆 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐁𝐀𝐍𝐃𝐈𝐄𝐑𝐄*

${righe.join('\n')}

> 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`

await conn.sendMessage(m.chat,{
text:testo,
mentions:menzioni
},{quoted:m})
}

handler.help=['topbandiera']
handler.tags=['fun']
handler.command=/^(topbandiera)$/i
handler.group=true

export default handler