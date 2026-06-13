/* fun-bomba by Blood
Edit by Bonzino */

let bombaInCorso={}

const COOLDOWN_MS=5000,DURATA_MIN=20,DURATA_MAX=45,XP_PREMIO=50,PENALE_MIN=100,PENALE_MAX=350,UPDATE_MS=1000
const formatNumber=n=>new Intl.NumberFormat('it-IT').format(n||0)
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a
const getUser=jid=>global.db.data.users[jid]||(global.db.data.users[jid]={euro:0,exp:0})
const playButtons=()=>[{buttonId:'.bomba',buttonText:{displayText:'💣 Nuova Bomba'},type:1}]

const testoBomba=(sender,tempo)=>`*💣 𝐁𝐎𝐌𝐁𝐀 𝐈𝐍𝐍𝐄𝐒𝐂𝐀𝐓𝐀*

*🧨 𝐋𝐚 𝐛𝐨𝐦𝐛𝐚 è 𝐧𝐞𝐥𝐥𝐞 𝐦𝐚𝐧𝐢 𝐝𝐢:* @${sender.split('@')[0]}
*⏱️ 𝐓𝐞𝐦𝐩𝐨:* *${tempo}𝐬*
*🔥 𝐋𝐚 𝐦𝐢𝐜𝐜𝐢𝐚 è 𝐢𝐧𝐬𝐭𝐚𝐛𝐢𝐥𝐞.*

> *passa @utente*
> *oppure rispondi con passa*`

function cleanJid(conn,jid=''){
return conn.decodeJid(String(jid||''))
}

function isValidUserJid(jid){
return jid&&jid.endsWith('@s.whatsapp.net')&&!jid.includes('@lid')
}

function getBotJids(conn){
return [
cleanJid(conn,conn.user?.id||''),
cleanJid(conn,conn.user?.jid||''),
cleanJid(conn,conn.user?.lid||'')
].filter(Boolean)
}

function isBotTarget(conn,jid){
jid=cleanJid(conn,jid)
const bots=getBotJids(conn)
return bots.some(b=>b===jid||b.split('@')[0]===jid.split('@')[0])
}

function isValidTarget(conn,jid,sender=''){
jid=cleanJid(conn,jid)
sender=cleanJid(conn,sender)
return isValidUserJid(jid)&&jid!==sender&&!isBotTarget(conn,jid)
}

function scegliUtenteCasuale(conn,m,participants=[]){
const mentioned=cleanJid(conn,m.mentionedJid?.[0]||'')
const quoted=cleanJid(conn,m.quoted?.sender||m.quoted?.participant||'')

if(isValidTarget(conn,mentioned,m.sender))return mentioned
if(isValidTarget(conn,quoted,m.sender))return quoted

const users=(participants||[])
.map(p=>cleanJid(conn,p.id||p.jid||''))
.filter(j=>isValidTarget(conn,j,m.sender))

return users.length?users[rand(0,users.length-1)]:null
}

async function aggiornaBomba(conn,chat){
const b=bombaInCorso[chat]
if(!b?.msgKey)return
const tempo=Math.max(0,Math.ceil((b.scadenza-Date.now())/1000))
if(tempo<=0)return
await conn.sendMessage(chat,{text:testoBomba(b.vittima,tempo),mentions:[b.vittima],edit:b.msgKey}).catch(()=>{})
}

async function avviaBomba(conn,chat,sender,m=null,editKey=null){
if(bombaInCorso[chat])return false
const durata=rand(DURATA_MIN,DURATA_MAX),scadenza=Date.now()+durata*1000
bombaInCorso[chat]={vittima:sender,passaggi:[],storico:[],scadenza,msgKey:editKey||null,ticker:null,timer:setTimeout(()=>esplosione(chat,conn,m),durata*1000)}
const msg={text:testoBomba(sender,durata),mentions:[sender],footer:'𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'}
if(editKey)msg.edit=editKey
const sent=await conn.sendMessage(chat,msg,m&&!editKey?{quoted:m}:{})
bombaInCorso[chat].msgKey=editKey||sent?.key||null
bombaInCorso[chat].ticker=setInterval(()=>aggiornaBomba(conn,chat),UPDATE_MS)
return true
}

let handler=async(m,{conn,command,participants})=>{
const chat=m.chat
if(command==='bomba'){
if(bombaInCorso[chat])return m.reply('*⚠️ 𝐂’è già una bomba attiva.*')
global.cooldowns??={}
const key=`bomba_${chat}`,now=Date.now()
if(now-(global.cooldowns[key]||0)<COOLDOWN_MS)return m.reply('*⏳ Aspetta un attimo.*')

let target=scegliUtenteCasuale(conn,m,participants)
if(!target)return m.reply('*❌ Nessun utente valido trovato.*')

global.cooldowns[key]=now

const sent=await conn.sendMessage(chat,{text:`*🎯 𝐁𝐄𝐑𝐒𝐀𝐆𝐋𝐈𝐎 𝐂𝐀𝐒𝐔𝐀𝐋𝐄*

*💣 𝐋𝐚 𝐛𝐨𝐦𝐛𝐚 sta cercando un bersaglio...*`},{quoted:m})

await new Promise(r=>setTimeout(r,1200))
return avviaBomba(conn,chat,target,m,sent.key)
}
}

handler.before=async function(m,{conn}){
if(!m||!m.chat||!m.sender||m.fromMe||m.isBaileys)return
const chat=m.chat,b=bombaInCorso[chat]
if(!b||!m.text||m.sender!==b.vittima)return

const txt=m.text.toLowerCase().trim()
if(!txt.startsWith('passa'))return

let target=m.mentionedJid?.[0]||m.quoted?.sender||m.quoted?.participant||null
target=cleanJid(conn,target)

if(!isValidTarget(conn,target,m.sender))return

let tempo=b.scadenza-Date.now()
if(tempo<=500)return

clearTimeout(b.timer)

const taglio=rand(1,4)*1000
tempo=Math.max(700,tempo-taglio)
b.scadenza=Date.now()+tempo

if(!b.passaggi.includes(m.sender))b.passaggi.push(m.sender)

b.storico.push({from:m.sender,to:target,cut:taglio})
b.vittima=target
b.timer=setTimeout(()=>esplosione(chat,conn,m),tempo)

await aggiornaBomba(conn,chat)

await conn.sendMessage(chat,{text:`*💣 𝐁𝐎𝐌𝐁𝐀 𝐏𝐀𝐒𝐒𝐀𝐓𝐀*

*👤:* @${target.split('@')[0]}
*⚡ Miccia:* *-${taglio/1000}𝐬*
*⏱️ Restano:* *${Math.ceil(tempo/1000)}𝐬*

> *Sbarazzatene subito.*`,mentions:[target]},{quoted:m})

return true
}

async function esplosione(chatId,conn,m){
const b=bombaInCorso[chatId]
if(!b)return
clearInterval(b.ticker)

const cilecca=Math.random()<0.08
const premiati=[...new Set(b.passaggi)].filter(j=>j!==b.vittima&&!isBotTarget(conn,j))
let mentions=[b.vittima,...premiati].filter(j=>!isBotTarget(conn,j))

if(cilecca){
let text=`*💨 𝐁𝐎𝐌𝐁𝐀 𝐈𝐍𝐂𝐄𝐏𝐏𝐀𝐓𝐀*

*💣 Era nelle mani di:* @${b.vittima.split('@')[0]}
*🍀 Nessuna penalità.*

> *Il destino vi ha risparmiati.*`

if(premiati.length){
text+=`\n\n*🏆 𝐒𝐨𝐩𝐫𝐚𝐯𝐯𝐢𝐬𝐬𝐮𝐭𝐢:*`
for(const jid of premiati){
const u=getUser(jid),premio=rand(5,15)
u.euro=(u.euro||0)+premio
text+=`\n*•* @${jid.split('@')[0]} *+${formatNumber(premio)}€*`
}
}

await conn.sendMessage(chatId,{text,mentions,footer:'𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',buttons:playButtons(),headerType:1})
delete bombaInCorso[chatId]
return
}

const vittima=getUser(b.vittima)
const penale=rand(PENALE_MIN,PENALE_MAX)
vittima.euro=Math.max(0,(vittima.euro||0)-penale)

let finale=`*💥 𝐁𝐎𝐎𝐎𝐎𝐎𝐌*

*💀 Esplosa in mano a:* @${b.vittima.split('@')[0]}
*💸 Penalità:* *-${formatNumber(penale)}€*
*🔁 Passaggi:* *${formatNumber(b.storico.length)}*`

if(premiati.length){
finale+=`\n\n*🏆 𝐒𝐨𝐩𝐫𝐚𝐯𝐯𝐢𝐬𝐬𝐮𝐭𝐢:*`
for(const jid of premiati){
const u=getUser(jid),premio=rand(10,30)+Math.min(b.storico.length*2,30)
u.euro=(u.euro||0)+premio
u.exp=(u.exp||0)+XP_PREMIO
finale+=`\n*•* @${jid.split('@')[0]} • *+${formatNumber(premio)}€* • *+${XP_PREMIO}xp*`
}
}

finale+=`\n\n> *La prossima miccia potrebbe essere ancora più caotica.*`

await conn.sendMessage(chatId,{text:finale,mentions,footer:'𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',buttons:playButtons(),headerType:1})
delete bombaInCorso[chatId]
}

handler.help=['bomba']
handler.tags=['fun']
handler.command=/^(bomba)$/i
handler.group=true

export default handler