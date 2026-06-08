// ricompense-attivita by Bonzino

const SESSION_TIMEOUT_MS=30*60*1000
const ACTIVE_WINDOW_MS=1*60*1000

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
let s=chat.attivitaTempo[jid]
if(!s)s=chat.attivitaTempo[jid]={lastMsg:0,messages:0,activeMs:0,claimed:[]}
if(typeof s.activeMs!=='number')s.activeMs=0
if(typeof s.messages!=='number')s.messages=0
if(typeof s.lastMsg!=='number')s.lastMsg=0
if(!Array.isArray(s.claimed))s.claimed=[]
return s
}

let handler=async()=>{}

handler.before=async function(m,{conn}){
if(!m||!m.sender||!m.isGroup||m.fromMe||m.isBaileys)return
if(!global.db?.data?.users?.[m.sender])return

const chat=global.db.data.chats[m.chat]||(global.db.data.chats[m.chat]={})
const user=global.db.data.users[m.sender]

if(typeof user.euro!=='number')user.euro=0

const s=ensure(chat,m.sender)
const now=Date.now()

if(s.lastMsg){
const diff=now-s.lastMsg
if(diff>0&&diff<=ACTIVE_WINDOW_MS)s.activeMs+=diff
}

s.lastMsg=now
s.messages++

const elapsed=s.activeMs

for(const t of TRAGUARDI){
if(elapsed<t.ms)continue
if(s.messages<t.minMsg)continue
if(s.claimed.includes(t.ms))continue

s.claimed.push(t.ms)
user.euro+=t.premio

await conn.sendMessage(m.chat,{
text:
`🎉 *𝐂𝐨𝐧𝐠𝐫𝐚𝐭𝐮𝐥𝐚𝐳𝐢𝐨𝐧𝐢 @${m.sender.split('@')[0]}!*

*⏱️ 𝐒𝐞𝐢 𝐬𝐭𝐚𝐭𝐨 𝐚𝐭𝐭𝐢𝐯𝐨 ${t.label} 𝐞 𝐡𝐚𝐢 𝐫𝐢𝐜𝐞𝐯𝐮𝐭𝐨 ${formatNumber(t.premio)}€.*

> *𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐚 𝐚 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞 𝐩𝐞𝐫 𝐬𝐛𝐥𝐨𝐜𝐜𝐚𝐫𝐞 𝐢𝐥 𝐩𝐫𝐨𝐬𝐬𝐢𝐦𝐨 𝐭𝐫𝐚𝐠𝐮𝐚𝐫𝐝𝐨.*`,
buttons:[{buttonId:'.wallet',buttonText:{displayText:'💰 Saldo'},type:1}],
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