// gp-classifiche by Bonzino

const formatNumber=n=>new Intl.NumberFormat('it-IT').format(n||0)
const partsRoma=(d=new Date())=>Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]))
const dataKeyRoma=(d=new Date())=>{let p=partsRoma(d);return`${p.year}-${p.month}-${p.day}`}
const getClassifica=(u={},l=10)=>Object.entries(u).filter(([_,d])=>(d?.conteggio||0)>0).sort((a,b)=>(b[1]?.conteggio||0)-(a[1]?.conteggio||0)).slice(0,l)

function ensureChat(chat,oggi){
const old=chat.classificaGiornaliera?JSON.parse(JSON.stringify(chat.classificaGiornaliera)):null,hasLegacy=chat.users&&Object.keys(chat.users).length>0
if(!chat.classificaTotale||!chat.classificaTotale.utenti||(chat.classificaTotale.totali||0)<(chat.classificaGiornaliera?.totali||0)){
let totale={totali:0,utenti:{}}
if(hasLegacy)for(const[jid,d]of Object.entries(chat.users)){let n=d?.messages||0;if(n>0){totale.utenti[jid]={conteggio:n};totale.totali+=n}}
else if(old?.utenti){totale.utenti=JSON.parse(JSON.stringify(old.utenti||{}));totale.totali=old.totali||0}
chat.classificaTotale=totale
}
if(!chat.classificaGiornaliera)chat.classificaGiornaliera={totali:0,utenti:{},ultimoReset:oggi}
if(!chat.classificaTotale)chat.classificaTotale={totali:0,utenti:{}}
if(!chat.topNotturna)chat.topNotturna={ultimoInvio:null,inCorso:false,lockAt:0,errori:0}
}

let handler=async(m,{conn,command,usedPrefix,isAdmin,isOwner})=>{
if(!global.db.data.chats[m.chat])global.db.data.chats[m.chat]={}
let chat=global.db.data.chats[m.chat],oggi=dataKeyRoma()
ensureChat(chat,oggi)

if(command==='resettp'){
if(!isAdmin&&!isOwner&&!m.fromMe)return m.reply(`*❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐨𝐰𝐧𝐞𝐫 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐫𝐞 𝐥𝐚 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚*`)
chat.classificaGiornaliera={totali:0,utenti:{},ultimoReset:oggi}
chat.topNotturna={ultimoInvio:oggi,inCorso:false,lockAt:0,errori:0}
return m.reply(`*✅ 𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐠𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐚 𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐭𝐚*`)
}

const isAll=/^topall/i.test(command)
let limite=3
if(command.includes('5'))limite=5
if(command.includes('10'))limite=10

const dati=isAll?(chat.classificaTotale||{totali:0,utenti:{}}):(chat.classificaGiornaliera||{totali:0,utenti:{}})
const totaleMessaggi=dati.totali||0

if(!totaleMessaggi)return m.reply(`*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨*`)

const classifica=getClassifica(dati.utenti||{},limite)

if(!classifica.length)return m.reply(`*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨*`)

const medaglie=['🥇','🥈','🥉']
const titolo=isAll?'*🌐 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐆𝐋𝐎𝐁𝐀𝐋𝐄*':'*⏳ 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐃𝐈 𝐎𝐆𝐆𝐈*'

let testo=`${titolo}`

let menzioni=classifica.map(([jid])=>jid).filter(Boolean)

classifica.forEach(([jid,d],i)=>{
testo+=`

*${i < 3 ? medaglie[i] : `${i + 1}°`}* *@${jid.split('@')[0]}* • *${formatNumber(d?.conteggio||0)} 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢*`
})

testo+=`

*💬 𝐓𝐨𝐭𝐚𝐥𝐞:* *${formatNumber(totaleMessaggi)}*

${isAll
?`> *⏳ 𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐝𝐢 𝐨𝐠𝐠𝐢: ${usedPrefix}top*`
:`> *🌐 𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐬𝐭𝐨𝐫𝐢𝐜𝐚: ${usedPrefix}topall*`}`

let buttons=[]

if(isAll){
if(limite===3)buttons.push({buttonId:`${usedPrefix}topall5`,buttonText:{displayText:'TopAll 5'},type:1},{buttonId:`${usedPrefix}topall10`,buttonText:{displayText:'TopAll 10'},type:1})
else if(limite===5)buttons.push({buttonId:`${usedPrefix}topall`,buttonText:{displayText:'TopAll 3'},type:1},{buttonId:`${usedPrefix}topall10`,buttonText:{displayText:'TopAll 10'},type:1})
else buttons.push({buttonId:`${usedPrefix}topall`,buttonText:{displayText:'TopAll 3'},type:1},{buttonId:`${usedPrefix}top`,buttonText:{displayText:'Top Oggi'},type:1})
}else{
if(limite===3)buttons.push({buttonId:`${usedPrefix}top5`,buttonText:{displayText:'Top 5'},type:1},{buttonId:`${usedPrefix}top10`,buttonText:{displayText:'Top 10'},type:1},{buttonId:`${usedPrefix}topall`,buttonText:{displayText:'TopAll'},type:1})
else if(limite===5)buttons.push({buttonId:`${usedPrefix}top`,buttonText:{displayText:'Top 3'},type:1},{buttonId:`${usedPrefix}top10`,buttonText:{displayText:'Top 10'},type:1})
else buttons.push({buttonId:`${usedPrefix}top`,buttonText:{displayText:'Top 3'},type:1},{buttonId:`${usedPrefix}topall`,buttonText:{displayText:'TopAll'},type:1})
}

await conn.sendMessage(m.chat,{text:testo,mentions:menzioni,footer:isAll?'Classifica storica':'Classifica giornaliera',buttons,headerType:1},{quoted:m})
}

handler.before=async function(m){
if(!m.chat||!m.text||m.isBaileys||!m.isGroup)return
if(!global.db.data.chats[m.chat])global.db.data.chats[m.chat]={}
let chat=global.db.data.chats[m.chat],oggi=dataKeyRoma()
ensureChat(chat,oggi)

if(!chat.classificaGiornaliera||chat.classificaGiornaliera.ultimoReset!==oggi)
chat.classificaGiornaliera={totali:0,utenti:{},ultimoReset:oggi}

let g=chat.classificaGiornaliera,t=chat.classificaTotale

g.totali++
g.utenti[m.sender]??={conteggio:0}
g.utenti[m.sender].conteggio++

t.totali++
t.utenti[m.sender]??={conteggio:0}
t.utenti[m.sender].conteggio++
}

handler.command=/^(top|top5|top10|topall|topall5|topall10|resettp)$/i
handler.group=true
handler.tags=['group']
handler.help=['top','top5','top10','topall','topall5','topall10','resettp']

export default handler