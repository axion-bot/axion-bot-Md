let tassa = 0.02

let handler = async (m, { text, usedPrefix, command }) => {
  let who

  if (m.isGroup) {
    if (m.mentionedJid?.[0]) {
      who = m.mentionedJid[0]
    } else if (m.quoted) {
      who = m.quoted.sender
    }
  } else {
    who = m.chat
  }

  if (!who) {
    return m.reply(
`╭━━━━━━━🏦━━━━━━━╮
✦ 𝐁𝐎𝐍𝐈𝐅𝐈𝐂𝐎 ✦
╰━━━━━━━🏦━━━━━━━╯

🚩 𝐃𝐞𝐯𝐢 𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞 𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞

📌 𝐄𝐬𝐞𝐦𝐩𝐢:
${usedPrefix + command} @utente 100
${usedPrefix + command} 100`
    )
  }

  if (who === m.sender) {
    return m.reply(`╭━━━━━━━⚠️━━━━━━━╮
✦ 𝐁𝐎𝐍𝐈𝐅𝐈𝐂𝐎 ✦
╰━━━━━━━⚠️━━━━━━━╯

🚫 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐢𝐧𝐯𝐢𝐚𝐫𝐞 𝐝𝐞𝐧𝐚𝐫𝐨 𝐚 𝐭𝐞 𝐬𝐭𝐞𝐬𝐬𝐨`)
  }

  if (!text) {
    return m.reply(`╭━━━━━━━💸━━━━━━━╮
✦ 𝐁𝐎𝐍𝐈𝐅𝐈𝐂𝐎 ✦
╰━━━━━━━💸━━━━━━━╯

🚩 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐥𝐚 𝐪𝐮𝐚𝐧𝐭𝐢𝐭à 𝐝𝐚 𝐭𝐫𝐚𝐬𝐟𝐞𝐫𝐢𝐫𝐞`)
  }

  let txt = text
  if (m.mentionedJid?.[0]) {
    txt = text.replace('@' + who.split('@')[0], '').trim()
  }

  if (isNaN(txt)) {
    return m.reply(`╭━━━━━━━⚠️━━━━━━━╮
✦ 𝐁𝐎𝐍𝐈𝐅𝐈𝐂𝐎 ✦
╰━━━━━━━⚠️━━━━━━━╯

🔢 𝐒𝐜𝐫𝐢𝐯𝐢 𝐬𝐨𝐥𝐨 𝐧𝐮𝐦𝐞𝐫𝐢`)
  }

  let denaro = parseInt(txt)
  if (denaro < 1) {
    return m.reply(`╭━━━━━━━💸━━━━━━━╮
✦ 𝐁𝐎𝐍𝐈𝐅𝐈𝐂𝐎 ✦
╰━━━━━━━💸━━━━━━━╯

🚩 𝐈𝐥 𝐦𝐢𝐧𝐢𝐦𝐨 𝐭𝐫𝐚𝐬𝐟𝐞𝐫𝐢𝐛𝐢𝐥𝐞 è 𝟏`)
  }

  let users = global.db.data.users

  if (!users[m.sender]) users[m.sender] = {}
  if (!users[who]) users[who] = {}

  if (typeof users[m.sender].euro !== 'number') users[m.sender].euro = 0
  if (typeof users[who].euro !== 'number') users[who].euro = 0

  let tassaImporto = Math.ceil(denaro * tassa)
  let costoTotale = denaro + tassaImporto

  if (costoTotale > users[m.sender].euro) {
    return m.reply(`╭━━━━━━━❌━━━━━━━╮
✦ 𝐁𝐎𝐍𝐈𝐅𝐈𝐂𝐎 ✦
╰━━━━━━━❌━━━━━━━╯

💸 𝐃𝐞𝐧𝐚𝐫𝐨 𝐢𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭𝐞`)
  }

  users[m.sender].euro -= costoTotale
  users[who].euro += denaro

  await m.reply(
`╭━━━━━━━🏦━━━━━━━╮
✦ 𝐁𝐎𝐍𝐈𝐅𝐈𝐂𝐎 𝐄𝐒𝐄𝐆𝐔𝐈𝐓𝐎 ✦
╰━━━━━━━🏦━━━━━━━╯

👤 𝐃𝐞𝐬𝐭𝐢𝐧𝐚𝐭𝐚𝐫𝐢𝐨: @${who.split('@')[0]}
💸 𝐈𝐧𝐯𝐢𝐚𝐭𝐢: ${formatNumber(denaro)}
🧾 𝐓𝐚𝐬𝐬𝐚 (2%): ${formatNumber(tassaImporto)}
📉 𝐓𝐨𝐭𝐚𝐥𝐞 𝐬𝐜𝐚𝐥𝐚𝐭𝐨: ${formatNumber(costoTotale)}`,
    null,
    { mentions: [who] }
  )

  global.db.write()
}

handler.help = ['bonifico @user <denaro>', 'dona <denaro>']
handler.tags = ['economia']
handler.command = /^(bonifico|dona)$/i

export default handler

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num)
}