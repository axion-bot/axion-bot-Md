global.bandieraEmojiGame = global.bandieraEmojiGame || {}
global.bandieraEmojiLeaderboard = global.bandieraEmojiLeaderboard || {}

const flags = [
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
  { emoji: "🇳🇴", answers: ["norvegia"] },
  { emoji: "🇫🇮", answers: ["finlandia"] },
  { emoji: "🇩🇰", answers: ["danimarca"] },
  { emoji: "🇨🇭", answers: ["svizzera"] },
  { emoji: "🇹🇷", answers: ["turchia"] },
  { emoji: "🇪🇬", answers: ["egitto"] },
  { emoji: "🇰🇷", answers: ["corea del sud", "corea"] },
  { emoji: "🇿🇦", answers: ["sudafrica"] },
  { emoji: "🇲🇦", answers: ["marocco"] },
  { emoji: "🇹🇳", answers: ["tunisia"] },
  { emoji: "🇵🇱", answers: ["polonia"] },
  { emoji: "🇮🇪", answers: ["irlanda"] },
  { emoji: "🇺🇦", answers: ["ucraina"] },
  { emoji: "🇮🇸", answers: ["islanda"] },
  { emoji: "🇳🇿", answers: ["nuova zelanda"] },
  { emoji: "🇨🇱", answers: ["cile"] },
  { emoji: "🇨🇴", answers: ["colombia"] },
  { emoji: "🇵🇪", answers: ["peru", "perù"] },
  { emoji: "🇻🇪", answers: ["venezuela"] },
  { emoji: "🇮🇩", answers: ["indonesia"] },
  { emoji: "🇹🇭", answers: ["thailandia"] },
  { emoji: "🇻🇳", answers: ["vietnam"] },
  { emoji: "🇵🇭", answers: ["filippine"] },
  { emoji: "🇰🇿", answers: ["kazakistan"] },
  { emoji: "🇲🇳", answers: ["mongolia"] },
  { emoji: "🇸🇲", answers: ["san marino"] },
  { emoji: "🇻🇦", answers: ["vaticano"] },
  { emoji: "🇲🇨", answers: ["monaco"] },
  { emoji: "🇦🇩", answers: ["andorra"] },
  { emoji: "🇱🇮", answers: ["liechtenstein"] },
  { emoji: "🇱🇺", answers: ["lussemburgo"] },
  { emoji: "🇪🇪", answers: ["estonia"] },
  { emoji: "🇱🇻", answers: ["lettonia"] },
  { emoji: "🇱🇹", answers: ["lituania"] },
  { emoji: "🇳🇵", answers: ["nepal"] },
  { emoji: "🇧🇹", answers: ["bhutan"] },
  { emoji: "🇲🇻", answers: ["maldive"] },
  { emoji: "🇸🇪", answers: ["svezia"] },
  { emoji: "🇨🇷", answers: ["costa rica"] },
  { emoji: "🇵🇦", answers: ["panama"] },
  { emoji: "🇯🇲", answers: ["giamaica"] },
  { emoji: "🇬🇭", answers: ["ghana"] },
  { emoji: "🇸🇳", answers: ["senegal"] },
  { emoji: "🇰🇪", answers: ["kenya"] },
  { emoji: "🇲🇬", answers: ["madagascar"] },
  { emoji: "🇸🇨", answers: ["seychelles"] },
  { emoji: "🇫🇮", answers: ["finlandia"] }
]

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
      text: `🌍 𝚫𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 • 𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀\n\n${flag.emoji}\n\n📩 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐪𝐮𝐞𝐬𝐭𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨\n⏱️ 𝟑𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢`
    })

    global.bandieraEmojiGame[chat] = {
      id: msg.key.id,
      flag,
      tentativi: {},
      suggerito: false,
      timeout: setTimeout(()=>{
        if(global.bandieraEmojiGame[chat]){
          conn.reply(chat, `⏳ 𝐓𝐞𝐦𝐩𝐨 𝐬𝐜𝐚𝐝𝐮𝐭𝐨!\n𝐋𝐚 𝐫𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐞𝐫𝐚: *${flag.answers[0].toUpperCase()}*`, msg)
          delete global.bandieraEmojiGame[chat]
        }
      }, 30000)
    }
  }
}

handler.before = async (m,{conn})=>{
  const chat = m.chat
  const game = global.bandieraEmojiGame[chat]
  if(!game || !m.quoted || m.quoted.id !== game.id || !m.text) return

  let userAns = normalize(m.text)
  let correct = normalize(game.flag.answers[0])
  let sim = similarity(userAns, correct)

  game.tentativi[m.sender] ??= 0
  if(game.tentativi[m.sender] >= 3) return

  if(userAns === correct || sim >= 0.8){
    clearTimeout(game.timeout)
    global.bandieraEmojiLeaderboard[chat] ??= {}
    global.bandieraEmojiLeaderboard[chat][m.sender] = (global.bandieraEmojiLeaderboard[chat][m.sender]||0)+1
    await conn.sendMessage(chat,{
      text: `🏆 𝐂𝐎𝐑𝐑𝐄𝐓𝐓𝐎! 🏆\n🌍 ${game.flag.emoji}\n🎯 𝐑𝐢𝐬𝐩𝐨𝐬𝐭𝐚: *${game.flag.answers[0].toUpperCase()}*\n🔥 𝐕𝐢𝐧𝐜𝐢𝐭𝐨𝐫𝐞: *@${m.sender.split('@')[0]}*\n💎 𝐏𝐮𝐧𝐭𝐢 𝐭𝐨𝐭𝐚𝐥𝐢: *${global.bandieraEmojiLeaderboard[chat][m.sender]}*`,
      mentions:[m.sender]
    })
    delete global.bandieraEmojiGame[chat]
  } else if(sim >= 0.6 && !game.suggerito){
    game.suggerito = true
    conn.reply(chat,'👀 𝚫𝐗𝐈𝚶𝐍 𝐇𝐈𝐍𝐓: 𝐂𝐢 𝐬𝐞𝐢 𝐪𝐮𝐚𝐬𝐢!', m)
  } else {
    game.tentativi[m.sender]++
    if(game.tentativi[m.sender] === 2){
      let r = game.flag.answers[0]
      conn.reply(chat,`💡 𝐒𝐮𝐠𝐠𝐞𝐫𝐢𝐦𝐞𝐧𝐭𝐨: 𝐈𝐧𝐢𝐳𝐢𝐚 𝐜𝐨𝐧 *${r[0].toUpperCase()}* (${r.length} 𝐥𝐞𝐭𝐭𝐞𝐫𝐞)`, m)
    }
  }
}

handler.command = ['bandiera','skipbandiera','classificabandiera']
handler.group = true

export default handler