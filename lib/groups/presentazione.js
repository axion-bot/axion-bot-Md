/*funzione che esporta il mess di presentazione predefinito
by bonzino*/

export async function sendPresentazione(conn, chatId, count = 1) {
  const chat = global.db?.data?.chats?.[chatId]

  if (!chat?.presentazione) return

  const text = count > 1
    ? `*👋 𝐁𝐄𝐍𝐕𝐄𝐍𝐔𝐓𝐈 𝐍𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎!*

*𝐏𝐞𝐫 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐚𝐫𝐯𝐢 𝐢𝐧𝐯𝐢𝐚𝐭𝐞:*

• *📷 𝐟𝐨𝐭𝐨 𝟏 𝐯𝐢𝐬𝐮𝐚𝐥*
• *🎂 𝐋𝐚 𝐯𝐨𝐬𝐭𝐫𝐚 𝐞𝐭à*
• *📍 𝐋𝐚 𝐯𝐨𝐬𝐭𝐫𝐚 𝐩𝐫𝐨𝐯𝐞𝐧𝐢𝐞𝐧𝐳𝐚*

 *📋 𝐕𝐢 𝐢𝐧𝐯𝐢𝐭𝐢𝐚𝐦𝐨 𝐚 𝐥𝐞𝐠𝐠𝐞𝐫𝐞 𝐥𝐞 𝐫𝐞𝐠𝐨𝐥𝐞 𝐜𝐨𝐧 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 .𝐫𝐞𝐠𝐨𝐥𝐞*

*🤝 𝐁𝐮𝐨𝐧𝐚 𝐩𝐞𝐫𝐦𝐚𝐧𝐞𝐧𝐳𝐚!*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
    : `*👋 𝐁𝐄𝐍𝐕𝐄𝐍𝐔𝐓𝐎 𝐍𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎!*

*𝐏𝐞𝐫 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐚𝐫𝐭𝐢 𝐢𝐧𝐯𝐢𝐚:*

• *📷 𝐟𝐨𝐭𝐨 𝟏 𝐯𝐢𝐬𝐮𝐚𝐥*
• *🎂 𝐋𝐚 𝐭𝐮𝐚 𝐞𝐭à*
• *📍 𝐋𝐚 𝐭𝐮𝐚 𝐩𝐫𝐨𝐯𝐞𝐧𝐢𝐞𝐧𝐳𝐚*

*📋 𝐓𝐢 𝐢𝐧𝐯𝐢𝐭𝐢𝐚𝐦𝐨 𝐚 𝐥𝐞𝐠𝐠𝐞𝐫𝐞 𝐥𝐞 𝐫𝐞𝐠𝐨𝐥𝐞 𝐜𝐨𝐧 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 .𝐫𝐞𝐠𝐨𝐥𝐞*

*🤝 𝐁𝐮𝐨𝐧𝐚 𝐩𝐞𝐫𝐦𝐚𝐧𝐞𝐧𝐳𝐚!*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

await new Promise(r => setTimeout(r, 2000))

  await conn.sendMessage(chatId, { text })
}