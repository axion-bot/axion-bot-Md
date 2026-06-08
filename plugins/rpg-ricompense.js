// rpg-ricompense by Bonzino

const TRAGUARDI_MESSAGGI=[50,100,150,250,400,600,850,1150,1500]
const PREMI_MESSAGGI=[30,60,90,140,220,320,450,650,900]
const TRAGUARDI_GRUPPO_GIORNO=[500,1000,1500,2200,3000,4000,5500,7000,8500,10000]
const PREMI_GRUPPO_GIORNO=[120,220,320,450,650,900,1300,1800,2400,3200]
const FINESTRA_ATTIVITA_MS=2*60*60*1000
const formatNumber=num=>new Intl.NumberFormat('it-IT').format(num||0)
const getTodayKey=()=>new Date().toLocaleDateString('en-CA')

function ensureMessageRewardState(chat,jid){
chat.messageRewards??={}
chat.messageRewards[jid]??={totalMessages:0,rewardIndex:0}
const state=chat.messageRewards[jid]
if(typeof state.totalMessages!=='number')state.totalMessages=0
if(typeof state.rewardIndex!=='number')state.rewardIndex=0
return state
}

function getMessageRewardData(state){
let traguardo=0,premioBase=0
if(state.rewardIndex<TRAGUARDI_MESSAGGI.length){
traguardo=TRAGUARDI_MESSAGGI[state.rewardIndex]
premioBase=PREMI_MESSAGGI[state.rewardIndex]
}else{
const extraIndex=state.rewardIndex-TRAGUARDI_MESSAGGI.length
traguardo=1500+((extraIndex+1)*500)
premioBase=900+((extraIndex+1)*250)
}
return{traguardo,premioBase}
}

function ensureRecentActivity(chat){
chat.recentActivity??={}
return chat.recentActivity
}

function trackRecentMessage(chat,sender){
const recent=ensureRecentActivity(chat)
recent[sender]??=[]
recent[sender].push(Date.now())
const minTime=Date.now()-FINESTRA_ATTIVITA_MS
for(const jid of Object.keys(recent)){
recent[jid]=recent[jid].filter(ts=>ts>=minTime)
if(!recent[jid].length)delete recent[jid]
}
}

function getRecentActiveUsers(chat){
const recent=ensureRecentActivity(chat),minTime=Date.now()-FINESTRA_ATTIVITA_MS
return Object.entries(recent).map(([jid,timestamps])=>{
const valid=timestamps.filter(ts=>ts>=minTime)
return{jid,count:valid.length}
}).filter(v=>v.count>0).sort((a,b)=>b.count-a.count)
}

function calcolaPremioAttivita(count){
if(count>=120)return 350
if(count>=90)return 260
if(count>=60)return 180
if(count>=35)return 110
if(count>=20)return 60
if(count>=10)return 30
return 0
}

function ensureGroupMilestoneState(chat){
chat.classificaGiornaliera??={}
const todayKey=String(chat.classificaGiornaliera.ultimoReset||getTodayKey())
if(!chat.classificaGiornaliera.traguardiMessaggiGruppoState){
chat.classificaGiornaliera.traguardiMessaggiGruppoState={dayKey:todayKey,unlocked:[]}
}
const state=chat.classificaGiornaliera.traguardiMessaggiGruppoState
if(state.dayKey!==todayKey){state.dayKey=todayKey;state.unlocked=[]}
if(!Array.isArray(state.unlocked))state.unlocked=[]
return state
}

async function controllaRicompensaMessaggi(m,conn){
try{
if(!m.isGroup)return
if(!global.db?.data?.users?.[m.sender])return
const chat=global.db.data.chats?.[m.chat]
if(!chat)return
let user=global.db.data.users[m.sender]
if(typeof user.euro!=='number')user.euro=0
const state=ensureMessageRewardState(chat,m.sender)
state.totalMessages+=1
const{traguardo,premioBase}=getMessageRewardData(state)
if(state.totalMessages<traguardo)return
user.euro+=premioBase
state.rewardIndex+=1
await conn.sendMessage(m.chat,{text:
`🎉 *𝐂𝐨𝐧𝐠𝐫𝐚𝐭𝐮𝐥𝐚𝐳𝐢𝐨𝐧𝐢 @${m.sender.split('@')[0]}!*

*💬 𝐇𝐚𝐢 𝐬𝐜𝐫𝐢𝐭𝐭𝐨 ${formatNumber(traguardo)} 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐞 𝐡𝐚𝐢 𝐫𝐢𝐜𝐞𝐯𝐮𝐭𝐨 ${formatNumber(premioBase)}€.*

> *𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐚 𝐚 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞 𝐩𝐞𝐫 𝐨𝐭𝐭𝐞𝐧𝐞𝐫𝐞 𝐚𝐥𝐭𝐫𝐞 𝐫𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐞.*`,
buttons:[{buttonId:'.wallet',buttonText:{displayText:'💰 Saldo'},type:1}],
headerType:1,
mentions:[m.sender]},{quoted:m})
}catch(e){console.error('ricompensa messaggi error:',e)}
}

async function controllaTraguardoGruppo(m,conn){
try{
if(!m.isGroup)return
const chat=global.db.data.chats?.[m.chat]
if(!chat?.classificaGiornaliera?.utenti)return
const state=ensureGroupMilestoneState(chat)
const totaleGruppo=Number(chat.classificaGiornaliera.totali||0)
for(let i=0;i<TRAGUARDI_GRUPPO_GIORNO.length;i++){
const traguardo=TRAGUARDI_GRUPPO_GIORNO[i]
if(totaleGruppo<traguardo)continue
if(state.unlocked.includes(traguardo))continue
state.unlocked.push(traguardo)
const recenti=getRecentActiveUsers(chat),premiati=[]
for(const row of recenti){
const premio=calcolaPremioAttivita(row.count)
if(premio<=0)continue
global.db.data.users[row.jid]??={}
const user=global.db.data.users[row.jid]
if(typeof user.euro!=='number')user.euro=0
user.euro+=premio
premiati.push({jid:row.jid,count:row.count,premio})
}
const premiText=premiati.length?premiati.slice(0,10).map(v=>`• @${v.jid.split('@')[0]} — *${formatNumber(v.count)} 𝐦𝐬𝐠* *(+${formatNumber(v.premio)}€)*`).join('\n'):'*𝐍𝐞𝐬𝐬𝐮𝐧 𝐩𝐫𝐞𝐦𝐢𝐨 𝐚𝐬𝐬𝐞𝐠𝐧𝐚𝐭𝐨.*'
await conn.sendMessage(m.chat,{text:
`🎉 *𝐎𝐛𝐢𝐞𝐭𝐭𝐢𝐯𝐨 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨!*

*💬 𝐈𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐡𝐚 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 ${formatNumber(traguardo)} 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢.*

🏆 *𝐔𝐭𝐞𝐧𝐭𝐢 𝐩𝐫𝐞𝐦𝐢𝐚𝐭𝐢:*
${premiText}

> *𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐚𝐭𝐞 𝐚 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞 𝐩𝐞𝐫 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐠𝐞𝐫𝐞 𝐢𝐥 𝐩𝐫𝐨𝐬𝐬𝐢𝐦𝐨 𝐨𝐛𝐢𝐞𝐭𝐭𝐢𝐯𝐨.*`,
mentions:premiati.map(v=>v.jid)},{quoted:m})
}
}catch(e){console.error('traguardo gruppo error:',e)}
}

let handler=async(m)=>{
let user=global.db.data.users[m.sender]
if(!user)return
if(typeof user.euro!=='number')user.euro=0
if(typeof user.lastDaily!=='number')user.lastDaily=0
if(typeof user.dailyStreak!=='number')user.dailyStreak=0
if(typeof user.maxDailyStreak!=='number')user.maxDailyStreak=0
const now=Date.now(),cooldown=24*60*60*1000,streakReset=48*60*60*1000
const elapsed=now-user.lastDaily,timeLeft=cooldown-elapsed
if(user.lastDaily&&elapsed<cooldown){
const ore=Math.floor(timeLeft/3600000),minuti=Math.floor((timeLeft%3600000)/60000)
return m.reply(`*⏳ 𝐇𝐚𝐢 𝐠𝐢à 𝐫𝐢𝐭𝐢𝐫𝐚𝐭𝐨 𝐥𝐚 𝐭𝐮𝐚 𝐫𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚 𝐠𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐚.*

*🕒 𝐓𝐨𝐫𝐧𝐚 𝐭𝐫𝐚:* *${ore}𝐡 ${minuti}𝐦*`)
}
if(user.lastDaily&&elapsed>streakReset)user.dailyStreak=0
user.dailyStreak+=1
if(user.dailyStreak>user.maxDailyStreak)user.maxDailyStreak=user.dailyStreak
const base=250,bonusStreak=Math.min(user.dailyStreak*50,1500),reward=base+bonusStreak
user.euro+=reward
user.lastDaily=now
return m.reply(`🎉 *𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚 𝐫𝐢𝐭𝐢𝐫𝐚𝐭𝐚!*

*🔥 𝐒𝐭𝐫𝐞𝐚𝐤: ${formatNumber(user.dailyStreak)} 𝐠𝐢𝐨𝐫𝐧𝐢 • 💰 𝐇𝐚𝐢 𝐫𝐢𝐜𝐞𝐯𝐮𝐭𝐨 ${formatNumber(reward)}€.*

> *𝐓𝐨𝐫𝐧𝐚 𝐝𝐨𝐦𝐚𝐧𝐢 𝐩𝐞𝐫 𝐜𝐨𝐧𝐭𝐢𝐧𝐮𝐚𝐫𝐞 𝐥𝐚 𝐭𝐮𝐚 𝐬𝐭𝐫𝐞𝐚𝐤.*`)
}

handler.before=async function(m,{conn}){
if(!m||!m.sender||m.fromMe)return
if(!global.db?.data?.users?.[m.sender])return
if(m.isGroup&&global.db.data.chats?.[m.chat])trackRecentMessage(global.db.data.chats[m.chat],m.sender)
await controllaRicompensaMessaggi(m,conn)
await controllaTraguardoGruppo(m,conn)
}

handler.help=['daily']
handler.tags=['rpg']
handler.command=/^(daily|ricompensa)$/i

export default handler