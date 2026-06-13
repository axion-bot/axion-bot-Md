const handler = async (message, { conn, usedPrefix = '.' }) => {
  const userId = message.sender
  const uptimeMs = process.uptime() * 1000
  const uptimeStr = clockString(uptimeMs)
  const totalUsers = Object.keys(global.db?.data?.users || {}).length

  const menuBody = `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐌𝐄𝐍𝐔 𝐔𝐓𝐄𝐍𝐓𝐄 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *ᴄᴀᴛᴇɢᴏʀɪᴀ:* ᴄᴏᴍᴀɴᴅɪ ᴜᴛᴇɴᴛᴇ
╼━━━━━━━━━━━━━━╾

╭━━━〔 👤 𝐏𝐑𝐎𝐅𝐈𝐋𝐎 〕━⬣
┃ 👤 ${usedPrefix}profilo
┃ 📈 ${usedPrefix}stats
┃ 🏅 ${usedPrefix}mytop
┃ 📷 ${usedPrefix}setig
┃ 🎖 ${usedPrefix}grade
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🏆 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐇𝐄 〕━⬣
┃ 🏆 ${usedPrefix}top
┃ 🌐 ${usedPrefix}topall
┃ 🚩 ${usedPrefix}topbandiera
┃ 🎵 ${usedPrefix}topic
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🕹️ 𝐆𝐈𝐎𝐂𝐇𝐈 〕━⬣
┃ ❌⭕ ${usedPrefix}tris
┃ 🏟️ ${usedPrefix}schedina <euro>
┃ 🪢 ${usedPrefix}impiccato
┃ 🤣 ${usedPrefix}meme
┃ 🧠 ${usedPrefix}vof <vero/falso>
┃ 🍣 ${usedPrefix}cibo
┃ 🚩 ${usedPrefix}bandiera
┃ 🏎️ ${usedPrefix}gara
┃ 🎰 ${usedPrefix}slot
┃ 🎵 ${usedPrefix}ic
┃ 🧞‍♂️ ${usedPrefix}akinator
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🐾 𝐀𝐍𝐈𝐌𝐀𝐋𝐈 〕━⬣
┃ 🐾 ${usedPrefix}animale
┃ 🛒 ${usedPrefix}shopanimali
┃ 🥫 ${usedPrefix}nutri
┃ 🦴 ${usedPrefix}gioca
┃ 🤲 ${usedPrefix}coccola
┃ 🪪 ${usedPrefix}profiloanimale
┃ 🏷️ ${usedPrefix}nomeanimale <nome>
┃ 💸 ${usedPrefix}vendianimale
┃ 🚫 ${usedPrefix}abbandona
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

╭━━━〔 💍 𝐑𝐄𝐋𝐀𝐙𝐈𝐎𝐍𝐈 〕━⬣
┃ 💫 ${usedPrefix}stato <reply/tag>
┃ 🏠 ${usedPrefix}famiglia <reply/tag>
┃ 👰 ${usedPrefix}sposa <reply/tag>
┃ 💔 ${usedPrefix}divorzia <reply/tag>
┃ 🤝 ${usedPrefix}amicizia <reply/tag>
┃ 👩 ${usedPrefix}madre <reply/tag>
┃ 👨 ${usedPrefix}padre <reply/tag>
┃ 👶 ${usedPrefix}figlio <reply/tag>
┃ 🧑‍🤝‍🧑 ${usedPrefix}fratello <reply/tag>
┃ 👭 ${usedPrefix}sorella <reply/tag>
┃ 👴 ${usedPrefix}nonno <reply/tag>
┃ 👵 ${usedPrefix}nonna <reply/tag>
┃ 👬 ${usedPrefix}cugino <reply/tag>
┃ 👭 ${usedPrefix}cugina <reply/tag>
┃ 🗑️ ${usedPrefix}delrelazione <tipo> <reply/tag>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 💰 𝐄𝐂𝐎𝐍𝐎𝐌𝐘 〕━⬣
┃ 👛 ${usedPrefix}wallet
┃ 🎁 ${usedPrefix}daily
┃ 💰 ${usedPrefix}deposita
┃ 🏧 ${usedPrefix}prelievo
┃ 🤝 ${usedPrefix}bonifico <reply/tag>
┃ 🥷 ${usedPrefix}crimine
┃ 🕵️ ${usedPrefix}ruba <reply/tag>
┃ 😅 ${usedPrefix}elemosina
┃ 💼 ${usedPrefix}lavora
┃ 🏪 ${usedPrefix}shop
┃ 🎒 ${usedPrefix}zaino
┃ 📤 ${usedPrefix}vendioggetto <numero>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🆘 𝐒𝐔𝐏𝐏𝐎𝐑𝐓𝐎 〕━⬣
┃ 🆘 ${usedPrefix}supporto <motivo>
┃ 🚨 ${usedPrefix}segnala <problema>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 𝐈𝐍𝐅𝐎 〕━⬣
┃ ᴠᴇʀsɪᴏɴᴇ: ${global.versione}
┃ sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim()

  await conn.sendMessage(message.chat, {
    text: menuBody,
    mentions: [userId],
    footer: '> *𝛥𝐗𝐈𝐎𝐍 𝚩𝚯𝐓*',
    buttons: [
      {
        buttonId: `${usedPrefix}menu`,
        buttonText: { displayText: '⬅️ Menu Principale' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: message })
}

function clockString(ms) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}d ${h}h ${m}m ${s}s`
}

handler.help = ['utente', 'menuutente']
handler.tags = ['menu']
handler.command = /^(utente|menuutente)$/i

export default handler