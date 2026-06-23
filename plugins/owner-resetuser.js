// resetuser by Bonzino

const pendingResets = global.pendingResets || (global.pendingResets = {})
const normalizeJid = input => {
  if (!input) return null
  input = input.trim()
  if (input.includes('@')) return input
  const number = input.replace(/\D/g, '')
  if (!number) return null
  return `${number}@s.whatsapp.net`
}
function deleteUserKeys(obj, jid) {
  if (!obj || typeof obj !== 'object') return
  if (Object.prototype.hasOwnProperty.call(obj, jid))
    delete obj[jid]
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object')
      deleteUserKeys(obj[key], jid)
  }
}

let handler = async (m, { conn, command, text }) => {
  if (/^confirmreset$/i.test(command)) {
    const jid = pendingResets[m.sender]
    if (!jid)
      throw `*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐑𝐞𝐬𝐞𝐭 𝐈𝐧 𝐀𝐭𝐭𝐞𝐬𝐚*`

    deleteUserKeys(global.db.data, jid)
    delete pendingResets[m.sender]
    return conn.sendMessage(m.chat, {
      text:
`*✅ 𝐑𝐞𝐬𝐞𝐭 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨*

*🆔 𝐔𝐭𝐞𝐧𝐭𝐞:*
${jid}

*🗑️ 𝐓𝐮𝐭𝐭𝐢 𝐢 𝐝𝐚𝐭𝐢 𝐚𝐬𝐬𝐨𝐜𝐢𝐚𝐭𝐢 𝐚𝐥𝐥'𝐮𝐭𝐞𝐧𝐭𝐞 𝐬𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
    }, { quoted: m })
  }

  if (/^cancelreset$/i.test(command)) {
    delete pendingResets[m.sender]
    return m.reply(
`*❌ 𝐎𝐩𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐀𝐧𝐧𝐮𝐥𝐥𝐚𝐭𝐚*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
    )
  }

  if (!text)
    throw `*❌ 𝐔𝐬𝐨*

*.resetuser numero*

*𝐄𝐬.:*

*.resetuser 393780087063*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  const jid = normalizeJid(text)

  if (!jid)
    throw `*❌ 𝐔𝐭𝐞𝐧𝐭𝐞 𝐍𝐨𝐧 𝐕𝐚𝐥𝐢𝐝𝐨*`

  pendingResets[m.sender] = jid
  await conn.sendMessage(m.chat, {
    text:
`*⚠️ 𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 𝐑𝐄𝐒𝐄𝐓*

*🆔 𝐔𝐭𝐞𝐧𝐭𝐞:*
${jid}

*🗑️ 𝐕𝐞𝐫𝐫𝐚𝐧𝐧𝐨 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢 𝐭𝐮𝐭𝐭𝐢 𝐢 𝐝𝐚𝐭𝐢 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐢 𝐧𝐞𝐥 𝐝𝐚𝐭𝐚𝐛𝐚𝐬𝐞.*

*⚠️ 𝐋'𝐚𝐳𝐢𝐨𝐧𝐞 𝐞̀ 𝐢𝐫𝐫𝐞𝐯𝐞𝐫𝐬𝐢𝐛𝐢𝐥𝐞.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    buttons: [
      {
        buttonId: '.confirmreset',
        buttonText: { displayText: '✅ Conferma' },
        type: 1
      },
      {
        buttonId: '.cancelreset',
        buttonText: { displayText: '❌ Annulla' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = [
  'resetuser',
  'confirmreset',
  'cancelreset'
]

handler.tags = ['owner']
handler.command = /^(resetuser|confirmreset|cancelreset)$/i
handler.owner = true

export default handler