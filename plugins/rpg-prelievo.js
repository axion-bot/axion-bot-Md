let handler = async (m, { args }) => {
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  let user = global.db.data.users[m.sender]

  if (typeof user.euro !== 'number') user.euro = 0
  if (typeof user.bank !== 'number') user.bank = 0

  if (!args[0]) {
    return m.reply(`╭━━━━━━━🏦━━━━━━━╮
✦ 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 ✦
╰━━━━━━━🏦━━━━━━━╯

🚩 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐥𝐚 𝐪𝐮𝐚𝐧𝐭𝐢𝐭à 𝐝𝐚 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐫𝐞`)
  }

  let count

  if (args[0].toLowerCase() === 'all') {
    count = user.bank
    if (count <= 0) {
      return m.reply(`╭━━━━━━━🚩━━━━━━━╮
✦ 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 ✦
╰━━━━━━━🚩━━━━━━━╯

🏦 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐝𝐞𝐧𝐚𝐫𝐨 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚`)
    }
  } else {
    if (isNaN(args[0])) {
      return m.reply(`╭━━━━━━━🚩━━━━━━━╮
✦ 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 ✦
╰━━━━━━━🚩━━━━━━━╯

🔢 𝐋𝐚 𝐪𝐮𝐚𝐧𝐭𝐢𝐭à 𝐝𝐞𝐯𝐞 𝐞𝐬𝐬𝐞𝐫𝐞 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐯𝐚𝐥𝐢𝐝𝐨`)
    }

    count = parseInt(args[0])

    if (count < 1) {
      return m.reply(`╭━━━━━━━🚩━━━━━━━╮
✦ 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 ✦
╰━━━━━━━🚩━━━━━━━╯

💸 𝐋𝐚 𝐪𝐮𝐚𝐧𝐭𝐢𝐭à 𝐦𝐢𝐧𝐢𝐦𝐚 è 𝟏`)
    }

    if (count > user.bank) {
      return m.reply(`╭━━━━━━━🚩━━━━━━━╮
✦ 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 ✦
╰━━━━━━━🚩━━━━━━━╯

🏦 𝐇𝐚𝐢 𝐬𝐨𝐥𝐨 ${formatNumber(user.bank)} 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚`)
    }
  }

  user.bank -= count
  user.euro += count

  await m.reply(`╭━━━━━━━🏦━━━━━━━╮
✦ 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 𝐄𝐅𝐅𝐄𝐓𝐓𝐔𝐀𝐓𝐎 ✦
╰━━━━━━━🏦━━━━━━━╯

💸 𝐇𝐚𝐢 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐭𝐨: ${formatNumber(count)}

💼 𝐏𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨: ${formatNumber(user.euro)}
🏛️ 𝐁𝐚𝐧𝐜𝐚: ${formatNumber(user.bank)}`)
}

handler.help = ['prelievo <numero|all>']
handler.tags = ['economy', 'rpg']
handler.command = ['prelievo', 'preleva', 'with', 'w']

export default handler

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num)
}