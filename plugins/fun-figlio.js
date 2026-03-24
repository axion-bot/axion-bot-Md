// by Bonzino

const proposals = {}

const S = v => String(v || '')
const bare = j => S(j).split('@')[0].split(':')[0]
const tag = jid => '@' + bare(jid)

function ensureUser(user) {
  if (!Array.isArray(user.figli)) user.figli = []
  if (!Array.isArray(user.genitori)) user.genitori = []
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const sender = m.sender
  const target = m.mentionedJid?.[0] || m.quoted?.sender || null

  const user1 = global.db.data.users[sender] || (global.db.data.users[sender] = {})
  ensureUser(user1)

  if (!target) {
    return conn.sendMessage(m.chat, {
      text: `*⚠️ 𝐃𝐞𝐯𝐢 𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞 𝐜𝐡𝐢 𝐯𝐮𝐨𝐢 𝐚𝐝𝐨𝐭𝐭𝐚𝐫𝐞*\n\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨:\n${usedPrefix}figlio @utente`
    }, { quoted: m })
  }

  if (target === sender) {
    return conn.sendMessage(m.chat, {
      text: '*❌ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐭𝐮𝐨 𝐬𝐭𝐞𝐬𝐬𝐨 𝐟𝐢𝐠𝐥𝐢𝐨*'
    }, { quoted: m })
  }

  const user2 = global.db.data.users[target] || (global.db.data.users[target] = {})
  ensureUser(user2)

  if (user1.figli.includes(target)) {
    return conn.sendMessage(m.chat, {
      text: `*👶 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐭𝐮𝐨 𝐟𝐢𝐠𝐥𝐢𝐨*`
    }, { quoted: m })
  }

  proposals[target] = {
    from: sender,
    timestamp: Date.now()
  }

  setTimeout(() => {
    if (proposals[target]?.from === sender) delete proposals[target]
  }, 60000)

  return conn.sendMessage(m.chat, {
    text: `*👶 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 𝐚𝐝𝐨𝐳𝐢𝐨𝐧𝐞*\n\n${tag(sender)} 𝐯𝐮𝐨𝐥𝐞 𝐚𝐝𝐨𝐭𝐭𝐚𝐫𝐞 ${tag(target)}.\n\n*𝐇𝐚𝐢 𝟔𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢 𝐩𝐞𝐫 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞.*`,
    mentions: [sender, target],
    footer: 'Scegli una risposta',
    buttons: [
      { buttonId: 'figlio_si', buttonText: { displayText: '✅ Accetta' }, type: 1 },
      { buttonId: 'figlio_no', buttonText: { displayText: '❌ Rifiuta' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.before = async function (m) {
  const pending = proposals[m.sender]
  if (!pending) return

  const accept =
    m.text === 'figlio_si' || /^figlio_si$/i.test(m.text || '') ||
    m.text === 'Si' || /^si$/i.test(m.text || '')

  const reject =
    m.text === 'figlio_no' || /^figlio_no$/i.test(m.text || '') ||
    m.text === 'No' || /^no$/i.test(m.text || '')

  if (!accept && !reject) return

  const parent = pending.from
  delete proposals[m.sender]

  const user1 = global.db.data.users[parent] || (global.db.data.users[parent] = {})
  const user2 = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})

  ensureUser(user1)
  ensureUser(user2)

  if (reject) {
    await this.sendMessage(m.chat, {
      text: `*❌ 𝐀𝐝𝐨𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐭𝐚*\n\n${tag(m.sender)} 𝐡𝐚 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐭𝐨.`,
      mentions: [m.sender, parent]
    }, { quoted: m })
    return true
  }

  user1.figli.push(m.sender)
  user2.genitori.push(parent)

  await this.sendMessage(m.chat, {
    text: `*👶 𝐀𝐝𝐨𝐳𝐢𝐨𝐧𝐞 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚!*\n\n${tag(parent)} 𝐡𝐚 𝐚𝐝𝐨𝐭𝐭𝐚𝐭𝐨 ${tag(m.sender)}.`,
    mentions: [parent, m.sender]
  }, { quoted: m })

  return true
}

handler.help = ['figlio']
handler.tags = ['fun']
handler.command = /^(figlio)$/i
handler.group = true

export default handler