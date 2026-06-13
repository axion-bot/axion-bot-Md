// by Bonzino
import fetch from'node-fetch'
import fs from'fs'
import{getLevelFull}from'../lib/levels.js'

let handler=async(m,{conn})=>{
const target=m.sender,user=global.db.data.users[target]||{},chat=global.db.data.chats?.[m.chat]||{},today=new Date().toLocaleDateString('it-IT',{timeZone:'Europe/Rome'})
const todayMessages=user.todayMessagesDate===today?user.todayMessages||0:0,todayGroupMessages=chat?.classificaGiornaliera?.utenti?.[target]?.conteggio||0,globalMessages=user.messages||0,groupMessages=chat?.classificaTotale?.utenti?.[target]?.conteggio||0
const fmt=n=>new Intl.NumberFormat('it-IT').format(n||0)
const totalCommands=user.commandCount||0,nome=await conn.getName(target),monete=user.euro||0,animaleDomestico=user.animale?`${user.animale.emoji} ${user.animale.nome}`:'*𝐍𝐞𝐬𝐬𝐮𝐧𝐨*',dailyStreak=Number(user.dailyStreak||0),lvl=getLevelFull(globalMessages),instagram=user.profile?.instagram?`instagram.com/${user.profile.instagram}`:'*𝐍𝐨𝐧 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨*'
let profilo
try{profilo=await conn.profilePictureUrl(target,'image')}catch{profilo=fs.readFileSync('./media/default-avatar.png')}
const thumbnailBuffer=typeof profilo==='string'?Buffer.from(await(await fetch(profilo)).arrayBuffer()):profilo
const text=`╭━━━━━━━✨━━━━━━━╮
*✦ 𝐏𝐑𝐎𝐅𝐈𝐋𝐎 ✦*
╰━━━━━━━✨━━━━━━━╯

*👤 𝐍𝐨𝐦𝐞:* ${nome}

*📊 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐇𝐄*

*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐎𝐠𝐠𝐢:* ${fmt(todayMessages)}
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐎𝐠𝐠𝐢 𝐆𝐫𝐮𝐩𝐩𝐨:* ${fmt(todayGroupMessages)}
*🌐 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐓𝐨𝐭𝐚𝐥𝐢:* ${fmt(globalMessages)}
*🌐 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐓𝐨𝐭𝐚𝐥𝐢 𝐆𝐫𝐮𝐩𝐩𝐨:* ${fmt(groupMessages)}

*🧠 𝐋𝐢𝐯𝐞𝐥𝐥𝐨:* ${lvl.level} (${lvl.icon} ${lvl.name})
*📈 𝐏𝐫𝐨𝐠𝐫𝐞𝐬𝐬𝐨:* ${lvl.percent}%
*⬆️ 𝐏𝐫𝐨𝐬𝐬𝐢𝐦𝐨:* ${lvl.isMax?'*𝐌𝐀𝐗*':`${lvl.nextName} (${fmt(lvl.remaining)} msg)`}

*💸 𝐃𝐞𝐧𝐚𝐫𝐨:* ${fmt(monete)}€
*🎁 𝐒𝐭𝐫𝐞𝐚𝐤 𝐃𝐚𝐢𝐥𝐲:* ${fmt(dailyStreak)} 𝐠𝐢𝐨𝐫𝐧𝐢
*🕹 𝐂𝐨𝐦𝐚𝐧𝐝𝐢 𝐔𝐬𝐚𝐭𝐢:* ${fmt(totalCommands)}
*🐾 𝐀𝐧𝐢𝐦𝐚𝐥𝐞 𝐃𝐨𝐦𝐞𝐬𝐭𝐢𝐜𝐨:* ${animaleDomestico}
*📸 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦:* ${instagram}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
await conn.sendMessage(m.chat,{text,mentions:[target],contextInfo:{...(global.rcanal?.contextInfo||{}),mentionedJid:[target],externalAdReply:{title:nome,body:' ',thumbnail:thumbnailBuffer,mediaType:1,renderLargerThumbnail:false,showAdAttribution:false}}},{quoted:m})
await conn.sendMessage(m.chat,{text:'*𝐒𝐄𝐋𝐄𝐙𝐈𝐎𝐍𝐀 𝐔𝐍’𝐎𝐏𝐙𝐈𝐎𝐍𝐄:*',footer:'> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*',buttons:[{buttonId:'.wallet',buttonText:{displayText:'💰 Portafoglio'},type:1},{buttonId:'.posizione',buttonText:{displayText:'🏆 Posizione'},type:1}],headerType:1},{quoted:m})
}
handler.help=['profilo','profile']
handler.tags=['info']
handler.command=/^(profilo|profile)$/i
export default handler