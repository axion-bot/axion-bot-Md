// plugin scopa by Bonzino

import { performance } from 'perf_hooks'

const sleep=ms=>new Promise(r=>setTimeout(r,ms))
const tag=jid=>'@'+String(jid||'').split('@')[0]

async function editMessage(conn,chatId,key,text,mentions=[]){
await conn.relayMessage(chatId,{
protocolMessage:{
key,
type:14,
editedMessage:{
extendedTextMessage:{
text,
contextInfo:mentions.length?{mentionedJid:mentions}:{}
}}}},{})
}

let handler=async(m,{conn,text})=>{

const chatId=m.chat
if(!chatId)return

const args=(text||'').trim().split(/\s+/)

let destinatario=
args.find(v=>v.includes('@s.whatsapp.net'))||
m.quoted?.sender||
(Array.isArray(m.mentionedJid)&&m.mentionedJid[0])||
m?.message?.extendedTextMessage?.contextInfo?.participant||
m?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]||
null

if(!destinatario){
return conn.sendMessage(chatId,{
text:'*⚠️ 𝐓𝐚𝐠𝐠𝐚 𝐪𝐮𝐚𝐥𝐜𝐮𝐧𝐨 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨.*'
},{quoted:m})
}

const mentionTarget=destinatario
const modeText=(text||'').toLowerCase()

const hasMode=
modeText.includes('lentamente')||
modeText.includes('normalmente')||
modeText.includes('forte')||
modeText.includes('massimo')

const mittente=
m.sender||
m.key?.participant||
m.participant||
(m.key?.fromMe?conn.user.id:m.key.remoteJid)||
''

if(hasMode&&mittente!==m.sender){
return m.reply('*❌ 𝐒𝐨𝐥𝐨 𝐜𝐡𝐢 𝐡𝐚 𝐚𝐯𝐯𝐢𝐚𝐭𝐨 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐩𝐮ò 𝐮𝐬𝐚𝐫𝐞 𝐢 𝐛𝐨𝐭𝐭𝐨𝐧𝐢.*')
}

if(!hasMode){

return conn.sendMessage(chatId,{
text:
`╭━━━━━━━🔥━━━━━━━╮
*✦ 𝐒𝐂𝐎𝐏𝐀 ✦*
╰━━━━━━━🔥━━━━━━━╯

*😏 𝐒𝐜𝐞𝐠𝐥𝐢 𝐥𝐚 𝐦𝐨𝐝𝐚𝐥𝐢𝐭à.*`,
footer:'𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
buttons:[
{
buttonId:`.scopa lentamente ${mentionTarget} ${m.sender}`,
buttonText:{displayText:'🥱 Lentamente'},
type:1
},
{
buttonId:`.scopa normalmente ${mentionTarget} ${m.sender}`,
buttonText:{displayText:'😏 Normale'},
type:1
},
{
buttonId:`.scopa forte ${mentionTarget} ${m.sender}`,
buttonText:{displayText:'🔥 Forte'},
type:1
},
{
buttonId:`.scopa massimo ${mentionTarget} ${m.sender}`,
buttonText:{displayText:'💀 Sfondala'},
type:1
}
],
headerType:1
},{quoted:m})
}

const ownerButton=args.find(v=>v.includes('@s.whatsapp.net')&&v!==destinatario)

const mode=
modeText.includes('lentamente')?'lentamente':
modeText.includes('forte')?'forte':
modeText.includes('massimo')?'massimo':
'normale'

const modeLabel=
mode==='lentamente'?' 𝐥𝐞𝐧𝐭𝐚𝐦𝐞𝐧𝐭𝐞':
mode==='forte'?' 𝐟𝐨𝐫𝐭𝐞':
mode==='massimo'?' 𝐯𝐢𝐨𝐥𝐞𝐧𝐭𝐞𝐦𝐞𝐧𝐭𝐞':
''

const start=performance.now()

const sent=await conn.sendMessage(chatId,{
text:`*𝐎𝐫𝐚 𝐦𝐢 𝐬𝐜𝐨𝐩𝐨${modeLabel} 𝐪𝐮𝐞𝐥𝐥𝐚 𝐩𝐮𝐭𝐭𝐚𝐧𝐚 𝐝𝐢* ${tag(destinatario)} *😏*`,
mentions:[destinatario]
},{quoted:m})

const key=sent.key
if(!key)return

await sleep(1200)

const frames=[
`   ●█▀█▄ ‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`    ●█▀█‎ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`   ●█▀█▄ ‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`    ●█▀█‎ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`   ●█▀█▄ ‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`    ●█▀█‎͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`   ●█▀█▄ ‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`    ●█▀█‎͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`
]

const finalFrame=`   ●█▀█💦‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`

let frameDelay=450
let loops=3

if(mode==='lentamente'){
frameDelay=700
loops=2
}else if(mode==='forte'){
frameDelay=170
loops=4
}else if(mode==='massimo'){
frameDelay=50
loops=4
}

for(let i=0;i<loops;i++){
for(const frame of frames){
await editMessage(conn,chatId,key,frame,[destinatario])
await sleep(frameDelay)
}
}

await editMessage(conn,chatId,key,finalFrame,[destinatario])
await sleep(900)

const end=performance.now()
const elapsed=((end-start)/1000).toFixed(2)

await editMessage(conn,chatId,key,
`🥵 *${tag(mittente)} 𝐡𝐚 𝐬𝐜𝐨𝐩𝐚𝐭𝐨${modeLabel} 𝐪𝐮𝐞𝐥𝐥𝐚 𝐩𝐮𝐭𝐭𝐚𝐧𝐚 𝐝𝐢 ${tag(destinatario)} 𝐢𝐧 ${elapsed} 𝐬𝐞𝐜𝐨𝐧𝐝𝐢, 𝐥𝐚𝐬𝐜𝐢𝐚𝐧𝐝𝐨𝐥𝐚/𝐨 𝐩𝐞𝐫 𝐭𝐞𝐫𝐫𝐚 𝐩𝐢𝐞𝐧𝐚/𝐨 𝐝𝐢 𝐬𝐛𝐨𝐫𝐫𝐚!💦*`,
[mittente,destinatario]
)
}

handler.help=[
'scopa @utente',
'scopa lentamente @utente',
'scopa normalmente @utente',
'scopa forte @utente',
'scopa massimo @utente'
]

handler.tags=['fun']
handler.command=['scopa']
handler.group=true

export default handler