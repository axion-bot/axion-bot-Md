// ricompense-attivita by Bonzino

const SESSION_TIMEOUT_MS=30*60*1000
const TRAGUARDI=[
{ms:30*60*1000,label:'30 𝐦𝐢𝐧𝐮𝐭𝐢',minMsg:5,premio:50},
{ms:60*60*1000,label:'1 𝐨𝐫𝐚',minMsg:10,premio:120},
{ms:2*60*60*1000,label:'2 𝐨𝐫𝐞',minMsg:18,premio:250},
{ms:4*60*60*1000,label:'4 𝐨𝐫𝐞',minMsg:30,premio:500},
{ms:6*60*60*1000,label:'6 𝐨𝐫𝐞',minMsg:45,premio:850},
{ms:8*60*60*1000,label:'8 𝐨𝐫𝐞',minMsg:60,premio:1200}
]

const formatNumber=n=>new Intl.NumberFormat('it-IT').format(n||0)

function ensure(chat,jid){
chat.attivitaTempo??={}
const now=Date.now()
let s=chat.attivitaTempo[jid]
if(!s||!s.lastMsg||now-s.lastMsg>SESSION_TIMEOUT_MS)s=chat.attivitaTempo[jid]={startedAt:now,lastMsg:now,messages:0,claimed:[]}
if(!Array.isArray(s.claimed))s.claimed=[]
return s
}

function cleanup(chat){
if(!chat.attivitaTempo)return
const now=Date.now()
for(const[jid,s]of Object.entries(chat.attivitaTempo)){
if(!s?.lastMsg||now-s.lastMsg>SESSION_TIMEOUT_MS*2)delete chat.attivitaTempo[jid]
}
}

let handler=async()=>{}

handler.before=async function(m,{conn}){
if(!m||!m.sender||!m.isGroup||m.fromMe||m.isBaileys)return
if(!global.db?.data?.users?.[m.sender])return

const chat=global.db.data.chats[m.chat]||(global.db.data.chats[m.chat]={})
const user=global.db.data.users[m.sender]

if(typeof user.euro!=='number')user.euro=0

cleanup(chat)

const s=ensure(chat,m.sender)

s.lastMsg=Date.now()
s.messages++

const elapsed=s.lastMsg-s.startedAt

for(const t of TRAGUARDI){

if(elapsed<t.ms)continue
if(s.messages<t.minMsg)continue
if(s.claimed.includes(t.ms))continue

s.claimed.push(t.ms)
user.euro+=t.premio

await conn.sendMessage(m.chat,{
text:
`🎉 *𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚 𝐀𝐭𝐭𝐢𝐯𝐢𝐭à! 🥳*

╭━━━━━━━━━━━━━━⬣
┃ *👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${m.sender.split('@')[0]}
┃ *⏱️ 𝐓𝐞𝐦𝐩𝐨 𝐀𝐭𝐭𝐢𝐯𝐨:* *${t.label}*
┃ *💰 𝐏𝐫𝐞𝐦𝐢𝐨:* *+${formatNumber(t.premio)}€*
╰━━━━━━━━━━━━━━⬣

> *🔥 𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐚 𝐚 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞 𝐩𝐞𝐫 𝐬𝐛𝐥𝐨𝐜𝐜𝐚𝐫𝐞 𝐢𝐥 𝐩𝐫𝐨𝐬𝐬𝐢𝐦𝐨 𝐭𝐫𝐚𝐠𝐮𝐚𝐫𝐝𝐨!*`,
mentions:[m.sender]
},{quoted:m})

break
}
}

handler.command=/^$/i
handler.group=true
handler.tags=['rpg']
handler.help=[]

export default handler