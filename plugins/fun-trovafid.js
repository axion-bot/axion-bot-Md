// fun-fid by Bonzino

const pick=a=>a[Math.floor(Math.random()*a.length)]
const tag=jid=>'@'+String(jid||'').split('@')[0]

const getNum=jid=>String(jid||'').split('@')[0].split(':')[0]

const getRealJid=(conn,p)=>{
const ids=[p?.jid,p?.id,p?.participant,p?.phoneNumber]
for(const id of ids){
const jid=conn.decodeJid(String(id||''))
if(jid.endsWith('@s.whatsapp.net'))return jid
}
return null
}

const frasi=[
(sender,partner)=>`${tag(sender)} *𝐬𝐢 è 𝐟𝐢𝐝𝐚𝐧𝐳𝐚𝐭𝐨/𝐚 𝐜𝐨𝐧* ${tag(partner)} *💍*`,
(sender,partner)=>`*💘 𝐔𝐟𝐟𝐢𝐜𝐢𝐚𝐥𝐞:* ${tag(sender)} *𝐞* ${tag(partner)} *𝐬𝐨𝐧𝐨 𝐟𝐢𝐝𝐚𝐧𝐳𝐚𝐭𝐢!*`,
(sender,partner)=>`${tag(sender)} *𝐡𝐚 𝐚𝐩𝐩𝐞𝐧𝐚 𝐢𝐧𝐢𝐳𝐢𝐚𝐭𝐨 𝐮𝐧𝐚 𝐬𝐭𝐨𝐫𝐢𝐚 𝐜𝐨𝐧* ${tag(partner)} *❤️*`,
(sender,partner)=>`*🌹 𝐍𝐮𝐨𝐯𝐚 𝐜𝐨𝐩𝐩𝐢𝐚 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨:* ${tag(sender)} *𝐞* ${tag(partner)} *💞*`,
(sender,partner)=>`*💍 𝐀𝐧𝐧𝐮𝐧𝐜𝐢𝐨:* ${tag(sender)} *𝐨𝐫𝐚 è 𝐟𝐢𝐝𝐚𝐧𝐳𝐚𝐭𝐨/𝐚 𝐜𝐨𝐧* ${tag(partner)}`,
(sender,partner)=>`${tag(sender)} *𝐞* ${tag(partner)} *𝐡𝐚𝐧𝐧𝐨 𝐮𝐟𝐟𝐢𝐜𝐢𝐚𝐥𝐢𝐳𝐳𝐚𝐭𝐨 𝐥𝐚 𝐥𝐨𝐫𝐨 𝐫𝐞𝐥𝐚𝐳𝐢𝐨𝐧𝐞 💕*`,
(sender,partner)=>`*💞 𝐂𝐮𝐩𝐢𝐝𝐨 𝐡𝐚 𝐜𝐨𝐥𝐩𝐢𝐭𝐨:* ${tag(sender)} *❤* ${tag(partner)}`,
(sender,partner)=>`${tag(sender)} *𝐡𝐚 𝐬𝐜𝐞𝐥𝐭𝐨* ${tag(partner)} *𝐜𝐨𝐦𝐞 𝐟𝐢𝐝𝐚𝐧𝐳𝐚𝐭𝐨/𝐚 💘*`
]

const frasiFinali=[
'*💍 𝐃𝐚 𝐨𝐫𝐚 𝐬𝐢𝐞𝐭𝐞 𝐮𝐟𝐟𝐢𝐜𝐢𝐚𝐥𝐦𝐞𝐧𝐭𝐞 𝐟𝐢𝐝𝐚𝐧𝐳𝐚𝐭𝐢!*',
'*🔥 𝐕𝐞𝐝𝐢𝐚𝐦𝐨 𝐪𝐮𝐚𝐧𝐭𝐨 𝐝𝐮𝐫𝐚!*',
'*🌙 𝐂𝐡𝐞 𝐛𝐞𝐥𝐥𝐚 𝐜𝐨𝐩𝐩𝐢𝐚!*',
'*💌 𝐔𝐧𝐚 𝐧𝐮𝐨𝐯𝐚 𝐬𝐭𝐨𝐫𝐢𝐚 𝐜𝐨𝐦𝐢𝐧𝐜𝐢𝐚!*',
'*💖 𝐈𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐡𝐚 𝐚𝐩𝐩𝐞𝐧𝐚 𝐚𝐬𝐬𝐢𝐬𝐭𝐢𝐭𝐨 𝐚𝐝 𝐮𝐧𝐚 𝐧𝐮𝐨𝐯𝐚 𝐜𝐨𝐩𝐩𝐢𝐚!*',
'*🥰 𝐒𝐞𝐦𝐛𝐫𝐚 𝐩𝐫𝐨𝐩𝐫𝐢𝐨 𝐜𝐡𝐞 𝐬𝐢𝐚𝐭𝐞 𝐟𝐚𝐭𝐭𝐢 𝐥’𝐮𝐧𝐨 𝐩𝐞𝐫 𝐥’𝐚𝐥𝐭𝐫𝐨!*',
'*✨ 𝐋𝐚 𝐦𝐚𝐠𝐢𝐚 𝐡𝐚 𝐟𝐚𝐭𝐭𝐨 𝐢𝐥 𝐬𝐮𝐨 𝐜𝐨𝐫𝐬𝐨!*'
]

let handler=async(m,{conn,participants})=>{
const sender=conn.decodeJid(m.sender)
const botJid=conn.decodeJid(conn.user?.jid||'')
const botNum=getNum(botJid)
const senderNum=getNum(sender)

const utenti=(participants||[])
.map(p=>getRealJid(conn,p))
.filter(j=>{
if(!j)return false
const n=getNum(j)
if(n===senderNum)return false
if(n===botNum)return false
if(j===sender||j===botJid)return false
return j.endsWith('@s.whatsapp.net')&&!j.endsWith('@lid')
})

if(!utenti.length)return m.reply('*❌ 𝐍𝐨𝐧 𝐡𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨 𝐧𝐞𝐬𝐬𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 𝐜𝐨𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐯𝐚𝐥𝐢𝐝𝐨.*')

const partner=pick(utenti)

await conn.sendMessage(m.chat,{
text:
`${pick(frasi)(sender,partner)}

> ${pick(frasiFinali)}`,
mentions:[sender,partner]
},{quoted:m})
}

handler.help=['fid']
handler.tags=['fun']
handler.command=/^(fid|trovafid)$/i
handler.group=true

export default handler