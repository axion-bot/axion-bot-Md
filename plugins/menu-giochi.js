// menu-giochi by Bonzino

const handler=async(m,{conn,usedPrefix='.'})=>{

const userId=m.sender

const menuBody=`
『 𝚫𝐗𝐈𝐎𝐍 • 𝐌𝐄𝐍𝐔 𝐆𝐈𝐎𝐂𝐇𝐈 』
╼━━━━━━━━━━━━━━╾
 ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
 ◈ *ᴄᴀᴛᴇɢᴏʀɪᴀ:* ɢɪᴏᴄʜɪ & ғᴜɴ
╼━━━━━━━━━━━━━━╾

╭━━━〔 🕹️ 𝐆𝐈𝐎𝐂𝐇𝐈 〕━⬣
┃ ❌⭕ ${usedPrefix}tris
┃ 🏟️ ${usedPrefix}schedina <euro>
┃ 🪢 ${usedPrefix}impiccato
┃ 🤣 ${usedPrefix}meme
┃ 🧠 ${usedPrefix}vof <vero/falso>
┃ 🍣 ${usedPrefix}cibo
┃ 🚩 ${usedPrefix}bandiera
┃ 🍾 ${usedPrefix}bottiglia
┃ 🏎️ ${usedPrefix}gara
┃ 🎰 ${usedPrefix}slot
┃ 🎵 ${usedPrefix}ic
┃ 🧞‍♂️ ${usedPrefix}akinator
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🎲 𝐅𝐔𝐍 〕━⬣
┃ 🔮 ${usedPrefix}random <reply/tag>
┃ 🔥 ${usedPrefix}flame <reply/tag>
┃ 💋 ${usedPrefix}bacia <reply/tag>
┃ 🤗 ${usedPrefix}abbraccia <reply/tag>
┃ 🍆 ${usedPrefix}sega <reply/tag>
┃ 🫦 ${usedPrefix}pompino <reply/tag>
┃ 🥵 ${usedPrefix}scopa <reply/tag>
┃ 🍋 ${usedPrefix}limona <reply/tag>
┃ 🤟 ${usedPrefix}ditalino <reply/tag>
┃ 🥵${usedPrefix} orgia 
┃ 💞 ${usedPrefix}trovafid <reply/tag>
┃ 💥 ${usedPrefix}bonk <reply/tag>
┃ 💣 ${usedPrefix}bomba <reply/tag>
┃ 🤬 ${usedPrefix}insulta <reply/tag>
┃ 📄 ${usedPrefix}curriculum <reply/tag>
┃ 🍑 ${usedPrefix}figa <reply/tag>
┃ ⏳ ${usedPrefix}tempo <reply/tag>
┃ 🩵 ${usedPrefix}onlyfans <reply/tag>
┃ 📰 ${usedPrefix}dox <reply/tag>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 𝐈𝐍𝐅𝐎 〕━⬣
┃ ᴠᴇʀsɪᴏɴᴇ: ${global.versione}
┃ sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim()

await conn.sendMessage(m.chat,{
text:menuBody,
mentions:[userId],
footer:'> *𝛥𝐗𝐈𝐎𝐍 𝚩𝚯𝐓*',
buttons:[{
buttonId:`${usedPrefix}menu`,
buttonText:{displayText:'⬅️ Menu Principale'},
type:1
}],
headerType:1
},{quoted:m})
}

handler.help=['giochi','menugiochi']
handler.tags=['menu']
handler.command=/^(giochi|menugiochi)$/i

export default handler