global.shopSession = global.shopSession || {}

const shops = {
1:{
nome:"🛒 Supermarket",
items:[
{nome:"🍎 Mela",prezzo:2},
{nome:"🥖 Pane",prezzo:1},
{nome:"🥛 Latte",prezzo:2},
{nome:"🍫 Cioccolato",prezzo:3}
]},
2:{
nome:"🛍️ Tech Store",
items:[
{nome:"📱 Smartphone",prezzo:800},
{nome:"💻 Laptop",prezzo:1200},
{nome:"🎧 Cuffie",prezzo:150},
{nome:"⌚ Smartwatch",prezzo:300}
]},
3:{
nome:"🎮 Game Shop",
items:[
{nome:"🎮 Console",prezzo:500},
{nome:"🕹️ Controller",prezzo:60},
{nome:"💿 Nuovo Gioco",prezzo:70},
{nome:"🎧 Headset Gaming",prezzo:90}
]}
}

let handler = async (m,{conn,command,args})=>{

const user = m.sender
if(!global.db.data.users[user])
global.db.data.users[user]={euro:0,bank:0,inventory:[]}

const u = global.db.data.users[user]

/* ================= SHOP ================= */

if(command==="shop"){

let txt=`╭━━━━━━━🛍️━━━━━━━╮
✦ 𝐒𝐇𝐎𝐏 ✦
╰━━━━━━━🛍️━━━━━━━╯

1️⃣ Supermarket
2️⃣ Tech Store
3️⃣ Game Shop

📝 Scrivi il numero del negozio

🎒 Usa .zaino per vedere i tuoi oggetti`

global.shopSession[user]={step:"shop"}

return conn.reply(m.chat,txt,m)
}

/* ================= ZAINO ================= */

if(command==="zaino"){

if(!u.inventory || u.inventory.length===0)
return conn.reply(m.chat,"🎒 𝐈𝐥 𝐭𝐮𝐨 𝐳𝐚𝐢𝐧𝐨 è 𝐯𝐮𝐨𝐭𝐨!",m)

let msg=`╭━━━━━━━🎒━━━━━━━╮
✦ 𝐙𝐀𝐈𝐍𝐎 ✦
╰━━━━━━━🎒━━━━━━━╯

`

u.inventory.forEach((item,i)=>{
msg+=`${i+1}. ${item.nome} - 💸 ${item.prezzo}\n`
})

return conn.reply(m.chat,msg,m)
}

/* ================= VENDI ================= */

if(command==="vendioggetto"){

let index=parseInt(args[0])-1

if(!u.inventory || u.inventory.length===0)
return conn.reply(m.chat,"🎒 𝐙𝐚𝐢𝐧𝐨 𝐯𝐮𝐨𝐭𝐨!",m)

if(isNaN(index) || index<0 || index>=u.inventory.length)
return conn.reply(m.chat,"❌ 𝐍𝐮𝐦𝐞𝐫𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨",m)

let item=u.inventory.splice(index,1)[0]
let price=Math.floor(item.prezzo*0.7)

u.euro+=price

return conn.reply(m.chat,
`╭━━━━━━━💸━━━━━━━╮
✦ 𝐕𝐄𝐍𝐃𝐈𝐓𝐀 ✦
╰━━━━━━━💸━━━━━━━╯

💰 Hai venduto ${item.nome}
💸 Guadagnato: ${price}
💼 Totale: ${u.euro}`,m)
}

}

/* ================= LOGICA SHOP ================= */

handler.before = async (m,{conn})=>{

const user=m.sender
const input=m.text?.trim()

if(!global.shopSession[user]) return

const session=global.shopSession[user]
const u=global.db.data.users[user]

if(session.step==="shop" && /^[1-3]$/.test(input)){

const shop=shops[input]

session.step="items"
session.shop=input

let txt=`╭━━━━━━━🏪━━━━━━━╮
✦ ${shop.nome} ✦
╰━━━━━━━🏪━━━━━━━╯

`

shop.items.forEach((item,i)=>{
txt+=`${i+1}️⃣ ${item.nome} - 💸 ${item.prezzo}\n`
})

txt+=`\n💸 Denaro: ${u.euro}`

return conn.reply(m.chat,txt,m)
}

if(session.step==="items" && /^[1-4]$/.test(input)){

const shop=shops[session.shop]
const item=shop.items[input-1]

if(u.euro<item.prezzo)
return conn.reply(m.chat,"❌ 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐝𝐞𝐧𝐚𝐫𝐨!",m)

u.euro-=item.prezzo

if(!u.inventory) u.inventory=[]

u.inventory.push(item)

delete global.shopSession[user]

return conn.reply(m.chat,
`╭━━━━━━━🛍️━━━━━━━╮
✦ 𝐀𝐂𝐐𝐔𝐈𝐒𝐓𝐎 ✦
╰━━━━━━━🛍️━━━━━━━╯

✅ Comprato: ${item.nome}
💸 Pagato: ${item.prezzo}
💰 Rimasti: ${u.euro}`,m)
}

}

handler.command=/^(shop|zaino|vendioggetto)$/i

export default handler