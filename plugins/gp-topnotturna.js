// gp-topnotturna by Bonzino

const DELAY_TRA_GRUPPI_MS=3500,LOCK_TIMEOUT_MS=10*60*1000,PREMI_TOP10=[500,300,200,150,100,80,60,50,40,30]
const delay=ms=>new Promise(r=>setTimeout(r,ms))
const partsRoma=(d=new Date())=>Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]))
const nowRomaParts=()=>partsRoma()
const dataKeyRoma=(d=new Date())=>{let p=partsRoma(d);return`${p.year}-${p.month}-${p.day}`}
const dataLabelRoma=(d=new Date())=>new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',day:'2-digit',month:'2-digit',year:'numeric'}).format(d)
const formatNumber=n=>new Intl.NumberFormat('it-IT').format(n||0)
const getClassifica=(u={},l=10)=>Object.entries(u).filter(([_,d])=>(d?.conteggio||0)>0).sort((a,b)=>(b[1]?.conteggio||0)-(a[1]?.conteggio||0)).slice(0,l)

function ensureChat(chat,oggi){
if(!chat.classificaGiornaliera)chat.classificaGiornaliera={totali:0,utenti:{},ultimoReset:oggi}
if(!chat.classificaTotale)chat.classificaTotale={totali:0,utenti:{}}
if(!chat.topNotturna)chat.topNotturna={ultimoInvio:null,inCorso:false,lockAt:0,errori:0}
if(!chat.topNotturnaPending)chat.topNotturnaPending=null
if(chat.topNotturna.inCorso&&(!chat.topNotturna.lockAt||Date.now()-chat.topNotturna.lockAt>LOCK_TIMEOUT_MS)){chat.topNotturna.inCorso=false;chat.topNotturna.lockAt=0}
}

function getDatiDaInviare(chat,dataOggi){
if(chat.topNotturnaPending&&chat.topNotturnaPending.ultimoReset!==dataOggi&&(chat.topNotturnaPending.totali||0)>0)return chat.topNotturnaPending
const old=chat.classificaGiornaliera
if(old&&old.ultimoReset!==dataOggi&&(old.totali||0)>0)return old
return null
}

function chiudiGiornata(chat,dataOggi){
chat.topNotturnaPending=null
if(!chat.classificaGiornaliera||chat.classificaGiornaliera.ultimoReset!==dataOggi)chat.classificaGiornaliera={totali:0,utenti:{},ultimoReset:dataOggi}
chat.topNotturna.ultimoInvio=dataOggi
chat.topNotturna.errori=0
}

async function getGruppiAttivi(conn,chats){
try{
const groups=await conn.groupFetchAllParticipating()
const ids=Object.keys(groups||{}).filter(id=>id.endsWith('@g.us'))
if(ids.length)return ids
}catch(e){console.log('[TOP NOTTURNA] groupFetchAllParticipating non disponibile, uso database:',e?.message||e)}
return Object.keys(chats||{}).filter(id=>id.endsWith('@g.us'))
}

async function inviaTopNotturna(conn,chatId,dati,dataLabel){
const classifica=getClassifica(dati?.utenti||{},10)
if(!classifica.length)return false
const medaglie=['🥇','🥈','🥉'],menzioni=[]
let testo=`*╭━━━━━━━🌙━━━━━━━╮*
*✦ 𝐓𝐎𝐏 𝟏𝟎 𝐆𝐈𝐎𝐑𝐍𝐀𝐋𝐈𝐄𝐑𝐀 ✦*
*╰━━━━━━━🌙━━━━━━━╯*

*📅 𝐆𝐢𝐨𝐫𝐧𝐨:* *${dataLabel}*
*📊 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐭𝐨𝐭𝐚𝐥𝐢:* *${formatNumber(dati?.totali||0)}*

*──────────────*`
for(let i=0;i<classifica.length;i++){
const[jid,d]=classifica[i],premio=PREMI_TOP10[i]||0,user=global.db.data.users[jid]||(global.db.data.users[jid]={})
if(typeof user.euro!=='number')user.euro=0
user.euro+=premio
menzioni.push(jid)
testo+=`

*${medaglie[i]||`${i+1}.`}* *@${jid.split('@')[0]}* • *${formatNumber(d?.conteggio||0)} 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢*
*💸 𝐏𝐫𝐞𝐦𝐢𝐨:* *+${formatNumber(premio)}€*`
}
testo+=`

*──────────────*
*🔥 𝐋𝐚 𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐚 è 𝐭𝐞𝐫𝐦𝐢𝐧𝐚𝐭𝐚, 𝐝𝐚 𝐨𝐫𝐚 𝐬𝐢 𝐫𝐢𝐩𝐚𝐫𝐭𝐞!*
*⏳ 𝐍𝐮𝐨𝐯𝐚 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚, 𝐧𝐮𝐨𝐯𝐚 𝐬𝐟𝐢𝐝𝐚.*`

await conn.sendMessage(chatId,{text:testo,mentions:menzioni,footer:'𝐏𝐫𝐞𝐦𝐢 𝐠𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐢 𝐚𝐬𝐬𝐞𝐠𝐧𝐚𝐭𝐢✅️',buttons:[{buttonId:'.top',buttonText:{displayText:'Top Oggi'},type:1},{buttonId:'.topall',buttonText:{displayText:'TopAll'},type:1}],headerType:1})
return true
}

async function processaTopNotturna(conn,currentChatId=null,force=false){
const p=nowRomaParts(),ora=Number(p.hour),minuto=Number(p.minute)
if(!force&&(ora!==0&&ora!==1))return
if(!force&&ora===1&&minuto>30)return

if(global.__topNotturnaProcessing&&!force){
if(Date.now()-(global.__topNotturnaProcessingAt||0)<LOCK_TIMEOUT_MS)return
global.__topNotturnaProcessing=false
}

global.__topNotturnaProcessing=true
global.__topNotturnaProcessingAt=Date.now()

try{
const dataOggi=dataKeyRoma(),ieri=new Date(Date.now()-24*60*60*1000),dataIeri=dataLabelRoma(ieri)
const chats=global.db.data.chats||{}
const keys=await getGruppiAttivi(conn,chats)

for(const chatId of keys){
const chat=chats[chatId]
if(!chat)continue
ensureChat(chat,dataOggi)

if(chat.topNotturna.ultimoInvio===dataOggi)continue
if(chat.topNotturna.inCorso)continue

const dati=getDatiDaInviare(chat,dataOggi)
if(!dati)continue

chat.topNotturna.inCorso=true
chat.topNotturna.lockAt=Date.now()

try{
if(chatId!==currentChatId)await delay(DELAY_TRA_GRUPPI_MS)

const ok=await inviaTopNotturna(conn,chatId,dati,dataIeri)
if(ok){
chiudiGiornata(chat,dataOggi)
console.log('[TOP NOTTURNA] Inviata:',chatId)
}

}catch(e){
chat.topNotturna.errori=(chat.topNotturna.errori||0)+1
console.error('[TOP NOTTURNA ERROR]',chatId,e?.message||e)
}finally{
chat.topNotturna.inCorso=false
chat.topNotturna.lockAt=0
}
}

}finally{
global.__topNotturnaProcessing=false
global.__topNotturnaProcessingAt=0
}
}

if(!global.__topNotturnaInterval){
global.__topNotturnaInterval=setInterval(async()=>{
try{
if(global.conn?.user&&global.db?.data)await processaTopNotturna(global.conn,null,false)
}catch(e){console.error('[TOP NOTTURNA INTERVAL ERROR]',e?.message||e)}
},60*1000)
}

let handler=async(m,{conn,isOwner})=>{
if(!isOwner&&!m.fromMe)return m.reply('*❌ 𝐒𝐨𝐥𝐨 𝐨𝐰𝐧𝐞𝐫.*')
await processaTopNotturna(conn,m.chat,true)
return m.reply('*✅ 𝐂𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐨 𝐭𝐨𝐩 𝐧𝐨𝐭𝐭𝐮𝐫𝐧𝐚 𝐞𝐬𝐞𝐠𝐮𝐢𝐭𝐨.*')
}

handler.command=/^topnight$/i
handler.group=true
handler.tags=['owner']
handler.help=['topnight']

export default handler