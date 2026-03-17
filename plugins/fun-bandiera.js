global.bandieraEmojiGame = global.bandieraEmojiGame || {}
global.bandieraEmojiLeaderboard = global.bandieraEmojiLeaderboard || {}

const flags = [
  // --- FACILI ---
  { emoji: "🇮🇹", answers: ["italia"] },
  { emoji: "🇫🇷", answers: ["francia"] },
  { emoji: "🇩🇪", answers: ["germania"] },
  { emoji: "🇪🇸", answers: ["spagna"] },
  { emoji: "🇬🇧", answers: ["regno unito", "inghilterra", "uk"] },
  { emoji: "🇺🇸", answers: ["stati uniti", "usa", "america"] },
  { emoji: "🇨🇦", answers: ["canada"] },
  { emoji: "🇧🇷", answers: ["brasile", "brasil"] },
  { emoji: "🇦🇷", answers: ["argentina"] },
  { emoji: "🇯🇵", answers: ["giappone"] },
  { emoji: "🇨🇳", answers: ["cina"] },
  { emoji: "🇷🇺", answers: ["russia"] },
  { emoji: "🇮🇳", answers: ["india"] },
  { emoji: "🇦🇺", answers: ["australia"] },
  { emoji: "🇲🇽", answers: ["messico"] },
  { emoji: "🇬🇷", answers: ["grecia"] },
  { emoji: "🇵🇹", answers: ["portogallo"] },
  { emoji: "🇳🇱", answers: ["olanda", "paesi bassi"] },
  { emoji: "🇸🇪", answers: ["svezia"] },
  { emoji: "🇨🇭", answers: ["svizzera"] },
  { emoji: "🇹🇷", answers: ["turchia"] },
  { emoji: "🇪🇬", answers: ["egitto"] },
  { emoji: "🇧🇪", answers: ["belgio"] },
  { emoji: "🇦🇹", answers: ["austria"] },

  // --- MEDIE ---
  { emoji: "🇰🇷", answers: ["corea del sud", "corea"] },
  { emoji: "🇳🇴", answers: ["norvegia"] },
  { emoji: "🇫🇮", answers: ["finlandia"] },
  { emoji: "🇩🇰", answers: ["danimarca"] },
  { emoji: "🇮🇪", answers: ["irlanda"] },
  { emoji: "🇵🇱", answers: ["polonia"] },
  { emoji: "🇺🇦", answers: ["ucraina"] },
  { emoji: "🇷🇴", answers: ["romania"] },
  { emoji: "🇨🇿", answers: ["repubblica ceca"] },
  { emoji: "🇭🇺", answers: ["ungheria"] },
  { emoji: "🇭🇷", answers: ["croazia"] },
  { emoji: "🇿🇦", answers: ["sudafrica"] },
  { emoji: "🇳🇬", answers: ["nigeria"] },
  { emoji: "🇲🇦", answers: ["marocco"] },
  { emoji: "🇹🇳", answers: ["tunisia"] },
  { emoji: "🇮🇱", answers: ["israele"] },
  { emoji: "🇸🇦", answers: ["arabia saudita"] },
  { emoji: "🇮🇩", answers: ["indonesia"] },
  { emoji: "🇹🇭", answers: ["thailandia"] },
  { emoji: "🇻🇳", answers: ["vietnam"] },
  { emoji: "🇵🇭", answers: ["filippine"] },
  { emoji: "🇨🇱", answers: ["cile"] },
  { emoji: "🇨🇴", answers: ["colombia"] },
  { emoji: "🇵🇪", answers: ["peru", "perù"] },
  { emoji: "🇨🇺", answers: ["cuba"] },
  { emoji: "🇮🇸", answers: ["islanda"] },
  { emoji: "🇳🇿", answers: ["nuova zelanda"] },

  // --- DIFFICILI ---
  { emoji: "🇰🇿", answers: ["kazakistan"] },
  { emoji: "🇲🇳", answers: ["mongolia"] },
  { emoji: "🇵🇰", answers: ["pakistan"] },
  { emoji: "🇧🇩", answers: ["bangladesh"] },
  { emoji: "🇸ᛘ", answers: ["san marino"] },
  { emoji: "🇻🇦", answers: ["vaticano", "stato del vaticano"] },
  { emoji: "🇲🇨", answers: ["monaco", "principato di monaco"] },
  { emoji: "🇱🇮", answers: ["liechtenstein"] },
  { emoji: "🇦🇩", answers: ["andorra"] },
  { emoji: "🇱通", answers: ["lussemburgo"] },
  { emoji: "🇪🇪", answers: ["estonia"] },
  { emoji: "🇱🇻", answers: ["lettonia"] },
  { emoji: "🇱🇹", answers: ["lituania"] },
  { emoji: "🇬🇪", answers: ["georgia"] },
  { emoji: "🇦🇲", answers: ["armenia"] },
  { emoji: "🇦🇿", answers: ["azerbaigian", "azerbaijan"] },
  { emoji: "🇺🇿", answers: ["uzbekistan"] },
  { emoji: "🇳🇵", answers: ["nepal"] },
  { emoji: "🇧🇹", answers: ["bhutan"] },
  { emoji: "🇱🇰", answers: ["sri lanka"] },
  { emoji: "🇲🇻", answers: ["maldive"] },
  { emoji: "🇰🇪", answers: ["kenya"] },
  { emoji: "🇪𝐭", answers: ["etiopia"] },
  { emoji: "🇬🇭", answers: ["ghana"] },
  { emoji: "🇸🇳", answers: ["senegal"] },
  { emoji: "🇦🇴", answers: ["angola"] },
  { emoji: "🇿🇼", answers: ["zimbabwe"] },
  { emoji: "🇲🇬", answers: ["madagascar"] },

  // --- EXTREME ---
  { emoji: "🇰🇮", answers: ["kiribati"] },
  { emoji: "🇵🇼", answers: ["palau"] },
  { emoji: "🇲🇭", answers: ["isole marshall"] },
  { emoji: "🇫🇲", answers: ["micronesia"] },
  { emoji: "🇻🇺", answers: ["vanuatu"] },
  { emoji: "🇹🇬", answers: ["togo"] },
  { emoji: "🇧🇯", answers: ["benin"] },
  { emoji: "🇧🇫", answers: ["burkina faso"] },
  { emoji: "🇲🇱", answers: ["mali"] },
  { emoji: "🇲🇷", answers: ["mauritania"] },
  { emoji: "🇸🇷", answers: ["suriname"] },
  { emoji: "🇬🇾", answers: ["guyana"] },
  { emoji: "🇧🇿", answers: ["belize"] },
  { emoji: "🇬🇹", answers: ["guatemala"] },
  { emoji: "🇭🇳", answers: ["honduras"] },
  { emoji: "🇳🇮", answers: ["nicaragua"] },
  { emoji: "🇨🇷", answers: ["costa rica"] },
  { emoji: "🇵🇦", answers: ["panama"] },
  { emoji: "🇰🇲", answers: ["comore"] },
  { emoji: "🇸🇨", answers: ["seychelles"] },
  { emoji: "🇲🇺", answers: ["mauritius"] },
  { emoji: "🇧🇷", answers: ["barbados"] },
  { emoji: "🇱🇨", answers: ["santa lucia"] }
]

// 🔧 UTILS
function normalize(str = '') {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
}

function similarity(a, b) {
  const wa = a.split(' ')
  const wb = b.split(' ')
  let match = wa.filter(w => wb.some(x => x.includes(w) || w.includes(x)))
  return match.length / Math.max(wa.length, wb.length)
}

// 🎮 COMANDI
let handler = async (m, { conn, command, isAdmin }) => {
  const chat = m.chat

  if (command === 'classificabandiera') {
    let lb = global.bandieraEmojiLeaderboard[chat]
    if (!lb) return m.reply('📉 𝐍𝐞𝐬𝐬𝐮𝐧 𝐝𝐚𝐭𝐨 𝐫𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐭𝐨')

    let rank = Object.entries(lb).sort((a,b)=>b[1]-a[1]).slice(0,10)
    let txt = '🏆 𝚫𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 • 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀\n\n'
    rank.forEach(([u,p],i)=> {
      txt += `${i+1}. @${u.split('@')[0]} → *${p} 𝐏𝐭𝐢*\n`
    })

    return conn.sendMessage(chat,{text:txt,mentions:rank.map(r=>r[0])})
  }

  if (command === 'skipbandiera') {
    if (!global.bandieraEmojiGame[chat]) return m.reply('❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨')
    if (!isAdmin && !m.fromMe) return m.reply('❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐬𝐚𝐥𝐭𝐚𝐫𝐞')

    clearTimeout(global.bandieraEmojiGame[chat].timeout)
    let r = global.bandieraEmojiGame[chat].flag.answers[0]
    delete global.bandieraEmojiGame[chat]
    return m.reply(`⏩ 𝐒𝐚𝐥𝐭𝐚𝐭𝐚! 𝐋𝐚 𝐫𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐞𝐫𝐚: *${r.toUpperCase()}*`)
  }

  if (command === 'bandiera') {
    if (global.bandieraEmojiGame[chat]) return m.reply('⚠️ 𝐔𝐧𝐚 𝐬𝐟𝐢𝐝𝐚 𝐞̀ 𝐠𝐢𝐚̀ 𝐚𝐭𝐭𝐢𝐯𝐚!')

    let flag = flags[Math.floor(Math.random()*flags.length)]

    let msg = await conn.sendMessage(chat,{
      text:
`🌍 𝚫𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 • 𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀

${flag.emoji}

📩 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐪𝐮𝐞𝐬𝐭𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨
⏱️ 𝟑𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢`
    })

    global.bandieraEmojiGame[chat] = {
      id: msg.key.id,
      flag,
      tentativi: {},
      suggerito: false,
      start: Date.now(),
      timeout: setTimeout(()=>{
        if(global.bandieraEmojiGame[chat]){
          conn.reply(chat, `⏳ 𝐓𝐞𝐦𝐩𝐨 𝐬𝐜𝐚𝐝𝐮𝐭𝐨!\n𝐋𝐚 𝐫𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐞𝐫𝐚: *${flag.answers[0].toUpperCase()}*`, msg)
          delete global.bandieraEmojiGame[chat]
        }
      }, 30000)
    }
  }
}

// 🧠 RISPOSTE (SOLO REPLY)
handler.before = async (m,{conn})=>{
  const chat = m.chat
  const game = global.bandieraEmojiGame[chat]
  if(!game || !m.quoted || m.
