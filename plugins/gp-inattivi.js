// gp-inattivi by Bonzino

const SOGLIA_INATTIVI_MS=24*60*60*1000
const formatNumber=n=>new Intl.NumberFormat('it-IT').format(n||0)

function tempoPassato(ms){
const h=Math.floor(ms/3600000),d=Math.floor(h/24)
if(d>=365){const a=Math.floor(d/365);return`${a} ${a===1?'anno':'anni'}`}
if(d>=30){const m=Math.floor(d/30);return`${m} ${m===1?'mese':'mesi'}`}
if(d>=2)return`${d} giorni`
if(h>=24)return'1 giorno'
return`${h} ore`
}

function ensureUser(chat,jid){
chat.users??={}
return chat.users[jid]??={}
}

let handler=async(m,{conn,participants})=>{
const chat=global.db.data.chats[m.chat]||(global.db.data.chats[m.chat]={})
chat.users??={}

const now=Date.now()
const bot=conn.decodeJid(conn.user?.jid||'')
const inattivi=[]

for(const jid of(participants||[]).map(p=>conn.decodeJid(p.id||p.jid||p.lid)).filter(Boolean)){
if(jid===bot)continue
const diff=now-(chat.users[jid]?.lastMessage||0)
if(!chat.users[jid]?.lastMessage||diff<SOGLIA_INATTIVI_MS)continue
inattivi.push({jid,diff})
}

inattivi.sort((a,b)=>b.diff-a.diff)

if(!inattivi.length){
return conn.sendMessage(m.chat,{
text:'*✅ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐔𝐭𝐞𝐧𝐭𝐞 𝐈𝐧𝐚𝐭𝐭𝐢𝐯𝐨 𝐓𝐫𝐨𝐯𝐚𝐭𝐨.*',
buttons:[
{buttonId:'.statsgruppo',buttonText:{displayText:'📊 Stats Gruppo'},type:1}
],
headerType:1
},{quoted:m})
}

let testo=`*👥 𝐔𝐓𝐄𝐍𝐓𝐈 𝐈𝐍𝐀𝐓𝐓𝐈𝐕𝐈*\n\n*👤 𝐓𝐫𝐨𝐯𝐚𝐭𝐢:* *${formatNumber(inattivi.length)}*\n\n`

for(const v of inattivi)
testo+=`*•* @${v.jid.split('@')[0]} — *🕒 ${tempoPassato(v.diff)}*\n`

testo+=`\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

await conn.sendMessage(m.chat,{
text:testo,
mentions:inattivi.map(v=>v.jid),
buttons:[
{buttonId:'.statsgruppo',buttonText:{displayText:'📊 Stats Gruppo'},type:1},
{buttonId:'.top',buttonText:{displayText:'🏆 Top Oggi'},type:1}
],
headerType:1
},{quoted:m})
}

handler.before=async function(m){
if(!m||!m.chat||!m.sender||!m.isGroup||m.fromMe||m.isBaileys)return
const chat=global.db.data.chats[m.chat]||(global.db.data.chats[m.chat]={})
const u=ensureUser(chat,m.sender)
u.lastMessage=Date.now()
u.messages=(u.messages||0)+1
}

handler.help=['inattivi']
handler.tags=['group']
handler.command=/^(inattivi)$/i
handler.admin=true
handler.group=true

export default handler