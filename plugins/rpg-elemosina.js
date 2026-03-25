global.begSession = global.begSession || {}

const scenarios = [
{
txt:"👵 Una vecchietta ti vede e sorride.\n\n1️⃣ Chiedi gentilmente\n2️⃣ Ignori",
bonus:[randomNum(5,15),0]
},
{
txt:"🧔 Un uomo ti guarda sospettoso.\n\n1️⃣ Racconti la tua storia\n2️⃣ Fingi di nulla",
bonus:[randomNum(5,20),0]
},
{
txt:"👦 Un bambino ti offre delle monete.\n\n1️⃣ Accetti con gratitudine\n2️⃣ Rifiuti",
bonus:[randomNum(2,10),0]
},
{
txt:"💼 Una persona ti offre una banconota grande.\n\n1️⃣ Accetti\n2️⃣ Rifiuti",
bonus:[randomNum(15,30),0]
}
]

let handler = async (m,{conn,command})=>{

const user = m.sender

if(!global.db.data.users[user])
global.db.data.users[user] = {euro:0,xp:0,level:1}

const u = global.db.data.users[user]

if (typeof u.euro !== 'number') u.euro = 0
if (typeof u.xp !== 'number') u.xp = 0
if (typeof u.level !== 'number') u.level = 1

if(command === "elemosina" || command === "beg"){

let ev = scenarios[Math.floor(Math.random()*scenarios.length)]

global.begSession[user] = {
step:"choice",
event:ev
}

let txt = `╭━━━━━━━🙏━━━━━━━╮
✦ 𝐄𝐋𝐄𝐌𝐎𝐒𝐈𝐍𝐀 ✦
╰━━━━━━━🙏━━━━━━━╯

${ev.txt}

💸 𝐃𝐞𝐧𝐚𝐫𝐨: ${formatNumber(u.euro)}

📝 𝐒𝐜𝐫𝐢𝐯𝐢 1 𝐨 2`

return conn.reply(m.chat,txt,m)

}

}

handler.before = async (m,{conn})=>{

const user = m.sender
const input = m.text?.trim()

if(!global.begSession[user]) return

const session = global.begSession[user]
const u = global.db.data.users[user]

if(session.step === "choice" && /^[12]$/.test(input)){

let ev = session.event
let choice = Number(input) - 1
let bonus = ev.bonus[choice]

u.euro += bonus

let xpGain = randomNum(1,5)
u.xp += xpGain

let lvlUp = false

if(u.xp >= u.level*50){
u.level++
u.xp = 0
lvlUp = true
}

delete global.begSession[user]

let msg = `╭━━━━━━━💰━━━━━━━╮
✦ 𝐑𝐈𝐒𝐔𝐋𝐓𝐀𝐓𝐎 ✦
╰━━━━━━━💰━━━━━━━╯

💸 𝐇𝐚𝐢 𝐫𝐢𝐜𝐞𝐯𝐮𝐭𝐨: ${formatNumber(bonus)}

💼 𝐃𝐞𝐧𝐚𝐫𝐨 𝐭𝐨𝐭𝐚𝐥𝐞: ${formatNumber(u.euro)}
🏅 𝐋𝐢𝐯𝐞𝐥𝐥𝐨: ${u.level}
⭐ 𝐄𝐗𝐏: ${formatNumber(u.xp)}/${formatNumber(u.level*50)}`

if(lvlUp) msg += `

🎉 𝐋𝐄𝐕𝐄𝐋 𝐔𝐏!`

return conn.reply(m.chat,msg,m)

}

}

handler.command = /^(beg|elemosina)$/i

export default handler

function randomNum(min,max){
return Math.floor(Math.random()*(max-min+1))+min
}

function formatNumber(num){
return new Intl.NumberFormat('it-IT').format(num)
}