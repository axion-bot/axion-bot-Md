global.workSession = global.workSession || {}

const jobs = [
{nome:'🍔 Cameriere', min:50, max:100},
{nome:'💻 Freelance', min:100, max:200},
{nome:'🧹 Pulizie', min:30, max:60},
{nome:'🚗 Corriere', min:80, max:160},
{nome:'🛠️ Manovale', min:60, max:120}
]

const events = [
{txt:`Il cliente ti chiede qualcosa di speciale.\n\n1️⃣ Accetti\n2️⃣ Ignori`, bonus:[10,0]},
{txt:`C'è traffico durante la consegna.\n\n1️⃣ Forza il passo\n2️⃣ Aspetti`, bonus:[20,5]},
{txt:`Trovi un oggetto smarrito.\n\n1️⃣ Lo restituisci\n2️⃣ Lo tieni`, bonus:[15,0]},
{txt:`Un collega ti chiede aiuto.\n\n1️⃣ Aiuti\n2️⃣ Rifiuti`, bonus:[10,0]}
]

let handler = async (m,{conn})=>{

const user = m.sender

if(!global.db.data.users[user])
global.db.data.users[user] = {euro:0,xp:0,level:1}

const u = global.db.data.users[user]

if (typeof u.euro !== 'number') u.euro = 0
if (typeof u.xp !== 'number') u.xp = 0
if (typeof u.level !== 'number') u.level = 1

let job = random(jobs)
let base = randomNum(job.min,job.max)

let chosenEvents = shuffle([...events]).slice(0,2)

global.workSession[user] = {
step:0,
job:job,
base:base,
events:chosenEvents,
total:base
}

let txt = `╭━━━━━━━💼━━━━━━━╮
✦ 𝐋𝐀𝐕𝐎𝐑𝐎 ✦
╰━━━━━━━💼━━━━━━━╯

🧑‍💼 𝐋𝐚𝐯𝐨𝐫𝐨: ${job.nome}
💸 𝐏𝐚𝐠𝐚 𝐛𝐚𝐬𝐞: ${formatNumber(base)}

📌 𝐄𝐯𝐞𝐧𝐭𝐨 𝟏
${chosenEvents[0].txt}`

return conn.reply(m.chat,txt,m)

}

handler.before = async (m,{conn})=>{

const user = m.sender
const input = m.text?.trim()

if(!global.workSession[user]) return
if(!/^[12]$/.test(input)) return

const session = global.workSession[user]
const u = global.db.data.users[user]

let ev = session.events[session.step]
let choice = Number(input) - 1
let bonus = ev.bonus[choice] || 0

session.total += bonus

await conn.reply(m.chat,
`╭━━━━━━━📌━━━━━━━╮
✦ 𝐒𝐂𝐄𝐋𝐓𝐀 ✦
╰━━━━━━━📌━━━━━━━╯

✅ 𝐇𝐚𝐢 𝐬𝐜𝐞𝐥𝐭𝐨: ${choice === 0 ? '1️⃣' : '2️⃣'}
💸 𝐁𝐨𝐧𝐮𝐬: ${formatNumber(bonus)}`,
m)

session.step++

if(session.step < session.events.length){

let next = session.events[session.step]

let txt = `╭━━━━━━━📌━━━━━━━╮
✦ 𝐄𝐕𝐄𝐍𝐓𝐎 ${session.step + 1} ✦
╰━━━━━━━📌━━━━━━━╯

${next.txt}`

return conn.reply(m.chat,txt,m)

}

let total = session.total

u.euro += total

let xpGain = randomNum(5,15)
u.xp += xpGain

let lvlUp = false
let needed = u.level * 100

if(u.xp >= needed){
u.level++
u.xp = 0
lvlUp = true
}

delete global.workSession[user]

let msg = `╭━━━━━━━✅━━━━━━━╮
✦ 𝐓𝐔𝐑𝐍𝐎 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐎 ✦
╰━━━━━━━✅━━━━━━━╯

🧑‍💼 𝐋𝐚𝐯𝐨𝐫𝐨: ${session.job.nome}
💸 𝐆𝐮𝐚𝐝𝐚𝐠𝐧𝐨 𝐭𝐨𝐭𝐚𝐥𝐞: ${formatNumber(total)}
💼 𝐃𝐞𝐧𝐚𝐫𝐨: ${formatNumber(u.euro)}
🏅 𝐋𝐢𝐯𝐞𝐥𝐥𝐨: ${u.level}
⭐ 𝐄𝐗𝐏: ${formatNumber(u.xp)}/${formatNumber(u.level * 100)}`

if(lvlUp) msg += `

🎉 𝐋𝐄𝐕𝐄𝐋 𝐔𝐏!`

return conn.reply(m.chat,msg,m)

}

handler.command = /^(work|lavora)$/i
export default handler

function random(arr){
return arr[Math.floor(Math.random()*arr.length)]
}

function randomNum(min,max){
return Math.floor(Math.random()*(max-min+1))+min
}

function shuffle(arr){
return arr.sort(()=>0.5-Math.random())
}

function formatNumber(num){
return new Intl.NumberFormat('it-IT').format(num)
}