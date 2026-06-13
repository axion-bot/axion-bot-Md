// testwelcome by Bonzino

let handler = async (m,{conn,args}) => {
if(!m.isGroup)return

const quanti=Math.max(1,Math.min(parseInt(args[0])||50,200))

const meta=await conn.groupMetadata(m.chat)

const utenti=meta.participants
.slice(0,quanti)
.map(v=>conn.decodeJid(v.id))

console.log('[TESTWELCOME]',{
utenti:utenti.length,
mentions:utenti.length
})

if(quanti>1){
return conn.sendMessage(m.chat,{
text:`*👋 𝐁𝐄𝐍𝐕𝐄𝐍𝐔𝐓𝐈 𝐍𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎!*

*𝐏𝐫𝐞𝐬𝐞𝐧𝐭𝐚𝐭𝐞𝐯𝐢 𝐜𝐨𝐧:*

• *𝟏 𝐟𝐨𝐭𝐨 𝐯𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚𝐛𝐢𝐥𝐞 𝐮𝐧𝐚 𝐬𝐨𝐥𝐚 𝐯𝐨𝐥𝐭𝐚*
• *𝐋𝐚 𝐯𝐨𝐬𝐭𝐫𝐚 𝐞𝐭à*
• *𝐋𝐚 𝐯𝐨𝐬𝐭𝐫𝐚 𝐩𝐫𝐨𝐯𝐞𝐧𝐢𝐞𝐧𝐳𝐚*

*🤝 𝐁𝐮𝐨𝐧𝐚 𝐏𝐞𝐫𝐦𝐚𝐧𝐞𝐧𝐳𝐚!*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
mentions:utenti
},{quoted:m})
}

const { createWelcomeCard } = await import('../lib/cards/welcome-card.js')

const card=await createWelcomeCard({
conn,
jid:m.sender,
username:await conn.getName(m.sender),
group:meta.subject,
members:meta.participants.length,
type:'benvenuto!'
})

await conn.sendMessage(m.chat,{
image:card,
mentions:[m.sender]
},{quoted:m})
}

handler.help=['testwelcome']
handler.tags=['owner']
handler.command=/^(testwelcome)$/i
handler.owner=true

export default handler