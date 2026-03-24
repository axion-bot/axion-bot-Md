// by Bonzino

const proposals = {}

const S = v => String(v || '')
const bare = j => S(j).split('@')[0].split(':')[0]
const tag = jid => '@' + bare(jid)

function ensureUser(user) {
  if (!Array.isArray(user.amici)) user.amici = []
}

let handler = async (m, { conn, usedPrefix }) => {
  const sender = m.sender
  const target = m.mentionedJid?.[0] || m.quoted?.sender || null

  const user1 = global.db.data.users[sender] || (global.db.data.users[sender] = {})
  ensureUser(user1)

  if (!target) {
    return conn.sendMessage(m.chat, {
      text: `*⚠️ 𝐃𝐞𝐯𝐢 𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞 𝐜𝐡𝐢 𝐯𝐮𝐨𝐢 𝐚𝐠𝐠𝐢𝐮𝐧𝐠𝐞𝐫𝐞 𝐚𝐦𝐢𝐜𝐨*\n\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨:\n${usedPrefix}amicizia @utente`
    }, { quoted: m })
  }

  if (target === sender) {
    return conn.sendMessage(m.chat, {
      text: '*❌ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐢𝐧𝐯𝐢𝐚𝐫𝐞 𝐮𝐧𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐚𝐦𝐢𝐜𝐢𝐳𝐢𝐚 𝐚 𝐭𝐞 𝐬𝐭𝐞𝐬𝐬𝐨*'
    }, { quoted: m })
  }

  const user2 = global.db.data.users[target] || (global.db.data.users[target] = {})
  ensureUser(user2)

  if (user1.amici.includes(target) && user2.amici.includes(sender)) {
    return conn.sendMessage(m.chat, {
      text: `*🤝 𝐒𝐢𝐞𝐭𝐞 𝐠𝐢à 𝐚𝐦𝐢𝐜𝐢*`
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
    text: `*🤝 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 𝐚𝐦𝐢𝐜𝐢𝐳𝐢𝐚*\n\n${tag(sender)} 𝐯𝐮𝐨𝐥𝐞 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐫𝐞 𝐚𝐦𝐢𝐜𝐨 𝐝𝐢 ${tag(target)}.\n\n*𝐇𝐚𝐢 𝟔𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢 𝐩𝐞𝐫 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞.*`,
    mentions: [sender, target],
    footer: 'Scegli una risposta',
    buttons: [
      { buttonId: 'amicizia_si', buttonText: { displayText: '✅ Accetta' }, type: 1 },
      { buttonId: 'amicizia_no', buttonText: { displayText: '❌ Rifiuta' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.before = async function (m) {
  const pending = proposals[m.sender]
  if (!pending) return

  const accept =
    m.text === 'amicizia_si' || /^amicizia_si$/i.test(m.text || '') ||
    m.text === 'Si' || /^si$/i.test(m.text || '')

  const reject =
    m.text === 'amicizia_no' || /^amicizia_no$/i.test(m.text || '') ||
    m.text === 'No' || /^no$/i.test(m.text || '')

  if (!accept && !reject) return

  const requester = pending.from
  delete proposals[m.sender]

  const user1 = global.db.data.users[requester] || (global.db.data.users[requester] = {})
  const user2 = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})

  ensureUser(user1)
  ensureUser(user2)

  if (reject) {
    await this.sendMessage(m.chat, {
      text: `*❌ 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐭𝐚*\n\n${tag(m.sender)} 𝐡𝐚 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐭𝐨 𝐥𝐚 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐝𝐢 ${tag(requester)}.`,
      mentions: [m.sender, requester]
    }, { quoted: m })
    return true
  }

  if (!user1.amici.includes(m.sender)) user1.amici.push(m.sender)
  if (!user2.amici.includes(requester)) user2.amici.push(requester)

  await this.sendMessage(m.chat, {
    text: `*🤝 𝐀𝐦𝐢𝐜𝐢𝐳𝐢𝐚 𝐜𝐨𝐧𝐟𝐞𝐫𝐦𝐚𝐭𝐚!*\n\n${tag(requester)} 𝐞 ${tag(m.sender)} 𝐨𝐫𝐚 𝐬𝐨𝐧𝐨 𝐚𝐦𝐢𝐜𝐢.`,
    mentions: [requester, m.sender]
  }, { quoted: m })

  return true
}

handler.help = ['amicizia']
handler.tags = ['fun']
handler.command = /^(amicizia)$/i
handler.group = true

export default handler