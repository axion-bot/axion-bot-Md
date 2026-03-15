let handler = async (m, { conn, usedPrefix }) => {

let user = m.sender
if (!global.db.data.users[user]) global.db.data.users[user] = {}

let u = global.db.data.users[user]

if (!u.euro) u.euro = 0
if (!u.xp) u.xp = 0
if (!u.level) u.level = 1

const scenarios = [
{
txt:"👵 Una vecchietta ti vede e sorride.\nCosa fai?",
options:["Chiedi gentilmente","Ignori"],
bonus:[randomNum(5,15),0]
},
{
txt:"🧔 Un uomo ti guarda sospettoso.\nCosa fai?",
options:["Racconti la tua storia","Fingi di nulla"],
bonus:[randomNum(5,20),0]
},
{
txt:"👦 Un bambino ti offre delle monete.\nCosa fai?",
options:["Accetti con gratitudine","Rifiuti"],
bonus:[randomNum(2,10),0]
},
{
txt:"💼 Una persona ti offre una banconota grande.\nAccetti?",
options:["Accetto","Rifiuto"],
bonus:[randomNum(15,30),0]
}
]

let ev = scenarios[Math.floor(Math.random()*scenarios.length)]

global.begGame = global.begGame || {}
global.begGame[user] = ev

await conn.sendMessage(m.chat,{
text:`🙏 *ELEMSOINA*\n\n${ev.txt}`,
footer:"Scegli cosa fare",
buttons:[
{
buttonId:`beg_0`,
buttonText:{displayText:ev.options[0]},
type:1
},
{
buttonId:`beg_1`,
buttonText:{displayText:ev.options[1]},
type:1
}
],
headerType:1
},{quoted:m})

}

handler.command = /^(beg|elemosina)$/i
export default handler


export async function before(m,{ conn }){

if(!global.begGame) return
let user = m.sender
if(!global.begGame[user]) return

let id = m.text || m.message?.buttonsResponseMessage?.selectedButtonId
if(!id) return
if(!id.startsWith('beg_')) return

let choice = Number(id.split('_')[1])

let ev = global.begGame[user]
let bonus = ev.bonus[choice]

let u = global.db.data.users[user]

u.euro += bonus
let xpGain = randomNum(1,5)
u.xp += xpGain

let lvlUp = false
if(u.xp >= u.level*50){
u.level++
u.xp = 0
lvlUp = true
}

await conn.reply(m.chat,
`💰 Hai guadagnato *${bonus}€*

💶 Saldo: ${u.euro}€
🏅 Livello: ${u.level}
⭐ XP: ${u.xp}/${u.level*50}
${lvlUp ? "\n🎉 LEVEL UP!" : ""}`,
m)

delete global.begGame[user]

}

function randomNum(min,max){
return Math.floor(Math.random()*(max-min+1))+min
}