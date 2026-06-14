// statsgruppo by Bonzino

let handler=async(m,{conn})=>{
const chat=global.db.data.chats?.[m.chat]||{}
const participants=(await conn.groupMetadata(m.chat)).participants||[]
const membri=participants.filter(p=>p.id||p.jid||p.lid).length
const oggiData=chat.classificaGiornaliera?.utenti||{}
const totaleData=chat.classificaTotale?.utenti||{}
const oggi=Object.values(oggiData)
const totale=Object.values(totaleData)
const msgOggi=oggi.reduce((a,b)=>a+(b.conteggio||0),0)
const msgTotali=totale.reduce((a,b)=>a+(b.conteggio||0),0)
const attivi=oggi.filter(u=>(u.conteggio||0)>0).length
const inattivi=membri-attivi
const attivita=membri?((attivi/membri)*100).toFixed(1):'0.0'
const topOggi=Object.entries(oggiData).sort((a,b)=>(b[1].conteggio||0)-(a[1].conteggio||0))[0]
const topTotale=Object.entries(totaleData).sort((a,b)=>(b[1].conteggio||0)-(a[1].conteggio||0))[0]
const fmt=n=>new Intl.NumberFormat('it-IT').format(n||0)
const topOggiTag=topOggi?.[0]||null
const topTotaleTag=topTotale?.[0]||null
const topOggiNome=topOggiTag?`@${topOggiTag.split('@')[0]}`:'*𝐍𝐞𝐬𝐬𝐮𝐧𝐨*'
const topTotaleNome=topTotaleTag?`@${topTotaleTag.split('@')[0]}`:'*𝐍𝐞𝐬𝐬𝐮𝐧𝐨*'
const topOggiCount=topOggi?.[1]?.conteggio||0
const topTotaleCount=topTotale?.[1]?.conteggio||0

const text=`*📊 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐇𝐄 𝐆𝐑𝐔𝐏𝐏𝐎*

👥 *𝐌𝐞𝐦𝐛𝐫𝐢:* ${fmt(membri)}
⚡ *𝐀𝐭𝐭𝐢𝐯𝐢:* ${fmt(attivi)}
💤 *𝐈𝐧𝐚𝐭𝐭𝐢𝐯𝐢:* ${fmt(inattivi)}
📈 *𝐀𝐭𝐭𝐢𝐯𝐢𝐭à:* ${attivita}%

💬 *𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐎𝐠𝐠𝐢:* ${fmt(msgOggi)}
💬 *𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐓𝐨𝐭𝐚𝐥𝐢:* ${fmt(msgTotali)}

🥇 *𝐏𝐢ù 𝐀𝐭𝐭𝐢𝐯𝐨 𝐎𝐠𝐠𝐢:*
${topOggiNome} • ${fmt(topOggiCount)}

🔥 *𝐏𝐢ù 𝐀𝐭𝐭𝐢𝐯𝐨 𝐝𝐢 𝐒𝐞𝐦𝐩𝐫𝐞:*
${topTotaleNome} • ${fmt(topTotaleCount)}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

return conn.sendMessage(m.chat,{
text,
mentions:[...new Set([topOggiTag,topTotaleTag].filter(Boolean))],
buttons:[
{buttonId:'.top',buttonText:{displayText:'🏆 Top Oggi'},type:1},
{buttonId:'.topall',buttonText:{displayText:'🌐 Top Totale'},type:1}
],
headerType:1
},{quoted:m})
}

handler.help=['statsgruppo']
handler.tags=['group']
handler.command=/^(statsgruppo|groupstats)$/i
handler.group=true

export default handler