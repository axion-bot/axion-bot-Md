// Plugin presentazione by Luxifer (edited by Bonzino)

let handler = async (m, { conn, usedPrefix }) => {
  const botName = global.db?.data?.nomedelbot || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

  const introText = `
*👋 𝐂𝐢𝐚𝐨! 𝐒𝐨𝐧𝐨 ${botName}*

*🤖 𝐔𝐧 𝐚𝐬𝐬𝐢𝐬𝐭𝐞𝐧𝐭𝐞 𝐚𝐯𝐚𝐧𝐳𝐚𝐭𝐨 𝐩𝐞𝐫 𝐢 𝐭𝐮𝐨𝐢 𝐠𝐫𝐮𝐩𝐩𝐢 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩.*

*🛡️ 𝐆𝐞𝐬𝐭𝐢𝐨𝐧𝐞 𝐞 𝐦𝐨𝐝𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞*
*🎮 𝐆𝐢𝐨𝐜𝐡𝐢 𝐞 𝐦𝐢𝐧𝐢𝐠𝐚𝐦𝐞*
*💰 𝐄𝐜𝐨𝐧𝐨𝐦𝐲 𝐞 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐡𝐞*
*🎭 𝐅𝐮𝐧𝐳𝐢𝐨𝐧𝐢 𝐟𝐮𝐧 𝐞 𝐢𝐧𝐭𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐢*
*⚙️ 𝐒𝐭𝐫𝐮𝐦𝐞𝐧𝐭𝐢 𝐩𝐞𝐫 𝐚𝐝𝐦𝐢𝐧 𝐞 𝐮𝐭𝐞𝐧𝐭𝐢*

*📋 𝐔𝐬𝐚 ${usedPrefix}menu 𝐩𝐞𝐫 𝐬𝐜𝐨𝐩𝐫𝐢𝐫𝐞 𝐭𝐮𝐭𝐭𝐢 𝐢 𝐜𝐨𝐦𝐚𝐧𝐝𝐢.*

*🚨 𝐒𝐞 𝐭𝐫𝐨𝐯𝐢 𝐮𝐧 𝐩𝐫𝐨𝐛𝐥𝐞𝐦𝐚:*
*${usedPrefix}segnala <comando> <problema>*

*⚡ 𝐀𝐝𝐞𝐬𝐬𝐨 𝐧𝐨𝐧 𝐫𝐞𝐬𝐭𝐚 𝐜𝐡𝐞 𝐞𝐬𝐩𝐥𝐨𝐫𝐚𝐫𝐞 𝐢𝐥 𝐦𝐞𝐧𝐮 𝐞 𝐦𝐞𝐭𝐭𝐞𝐫𝐦𝐢 𝐚𝐥𝐥𝐚 𝐩𝐫𝐨𝐯𝐚.*
`.trim()

  await conn.sendMessage(m.chat, {
    text: introText,
    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    buttons: [
      {
        buttonId: `${usedPrefix}menu`,
        buttonText: { displayText: '📋 Menu' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['presentazione', 'presentati']
handler.tags = ['info']
handler.command = /^(presentazione|presentati)$/i

export default handler